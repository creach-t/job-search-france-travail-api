/**
 * Provider France Travail — encapsule l'authentification OAuth2 et les appels aux
 * produits France Travail (offres d'emploi v2, ROME, statistiques SODE).
 *
 * C'est le pendant serveur du modèle d'offre canonique côté front : pour brancher
 * une nouvelle API d'offres, créer `server/providers/<source>.js` sur le même
 * modèle (auth + méthodes de haut niveau) et ajouter les routes correspondantes.
 *
 * La configuration est lue à l'appel (pas au chargement du module) pour ne pas
 * dépendre de l'ordre entre `require` et `dotenv.config`.
 */
const axios = require('axios');
const { debug } = require('../logger');

const config = () => ({
  TOKEN_URL: process.env.FT_TOKEN_URL,
  BASE_URL: process.env.FT_BASE_URL,
  CLIENT_ID: process.env.FT_CLIENT_ID,
  CLIENT_SECRET: process.env.FT_CLIENT_SECRET,
  SCOPE: process.env.FT_SCOPE,
});

const offresBase = () => `${config().BASE_URL}partenaire/offresdemploi/v2`;
const romeBase = () => `${config().BASE_URL}partenaire/rome/v1`;

// ── Gestion du token OAuth2 (cache par scope) ─────────────────────────────────
const tokenCache = {};

async function getAccessToken(scope) {
  const s = scope || config().SCOPE;
  const cached = tokenCache[s];
  if (cached && cached.expiry > Date.now()) return cached.token;

  const { TOKEN_URL, CLIENT_ID, CLIENT_SECRET } = config();
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('scope', s);

    const response = await axios.post(TOKEN_URL, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    // Marge de sécurité de 60 s avant expiration
    tokenCache[s] = {
      token: response.data.access_token,
      expiry: Date.now() + (response.data.expires_in - 60) * 1000,
    };
    return tokenCache[s].token;
  } catch (error) {
    console.error(`Erreur d'authentification (scope=${s}):`, error.response?.data || error.message);
    throw new Error('Impossible d\'obtenir un token d\'accès');
  }
}

/** Invalide le token d'un scope (force un renouvellement, ex: sur 401). */
function invalidateToken(scope) {
  delete tokenCache[scope || config().SCOPE];
}

// ── Appels offres ─────────────────────────────────────────────────────────────

/**
 * GET générique avec extraction du total (Content-Range) et un retry sur 401.
 * @returns {Promise<{data:any,total:number|null}>}
 */
async function getWithTotal(url, params, token, retryCount = 0) {
  try {
    const response = await axios.get(url, {
      params,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const contentRange = response.headers['content-range'] || '';
    debug(`📊 [Content-Range] "${contentRange}"`);
    const totalMatch = contentRange.match(/\/(\d+)$/);
    const total = totalMatch ? parseInt(totalMatch[1], 10) : null;
    return { data: response.data, total };
  } catch (error) {
    if (error.response?.status === 401 && retryCount === 0) {
      invalidateToken();
      const newToken = await getAccessToken();
      return getWithTotal(url, params, newToken, retryCount + 1);
    }
    throw error;
  }
}

/** Recherche d'offres. `params` = paramètres France Travail déjà formatés. */
function searchOffres(params, token) {
  return getWithTotal(`${offresBase()}/offres/search`, params, token);
}

/** Détail d'une offre par id. */
async function getOffre(id, token) {
  const response = await axios.get(`${offresBase()}/offres/${id}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
  });
  return response.data;
}

/** Détail d'un métier ROME par code. */
async function getMetier(code, token) {
  const response = await axios.get(`${romeBase()}/metier/${code}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return response.data;
}

module.exports = {
  config,
  getAccessToken,
  invalidateToken,
  searchOffres,
  getOffre,
  getMetier,
};
