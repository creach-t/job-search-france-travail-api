/**
 * Provider Adzuna — recherche d'offres via l'API Adzuna (https://developer.adzuna.com/).
 *
 * Authentification par clés applicatives (app_id + app_key, gratuites). La config
 * est lue à l'appel (pas au chargement) pour ne pas dépendre de l'ordre entre
 * `require` et `dotenv.config`. Adzuna cherche par NOM de lieu (`where`), pas par
 * code INSEE, et exprime les salaires en montant ANNUEL.
 */
const axios = require('axios');

const BASE = 'https://api.adzuna.com/v1/api/jobs';

const config = () => ({
  APP_ID: process.env.ADZUNA_APP_ID,
  APP_KEY: process.env.ADZUNA_APP_KEY,
  COUNTRY: (process.env.ADZUNA_COUNTRY || 'fr').toLowerCase(),
});

/** Vrai si les clés Adzuna sont présentes. */
const isConfigured = () => {
  const c = config();
  return Boolean(c.APP_ID && c.APP_KEY);
};

/**
 * Recherche d'offres. `query` = paramètres Adzuna déjà formatés (what, where,
 * distance, salary_min, permanent/contract, full_time/part_time, sort_by…).
 * @returns {Promise<{results:any[], total:number|null}>}
 */
async function searchOffres({ page = 1, ...query } = {}) {
  const { APP_ID, APP_KEY, COUNTRY } = config();
  const url = `${BASE}/${COUNTRY}/search/${Math.max(1, Number(page) || 1)}`;
  const params = { app_id: APP_ID, app_key: APP_KEY, 'content-type': 'application/json', ...query };
  const response = await axios.get(url, { params, timeout: 10000 });
  return { results: response.data?.results || [], total: response.data?.count ?? null };
}

module.exports = { config, isConfigured, searchOffres };
