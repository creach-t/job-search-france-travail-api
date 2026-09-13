const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Chargement des variables d'environnement du fichier à la racine en premier (si existe)
dotenv.config({ path: path.join(__dirname, '../.env') });
// Chargement des variables d'environnement spécifiques au serveur (prioritaires)
dotenv.config({ path: path.join(__dirname, '.env') });

const { lookupCompany } = require('./insee');
const ft = require('./providers/franceTravail');
const adzuna = require('./providers/adzuna');
const { debug } = require('./logger');

const app = express();
// SERVER_PORT (racine) > PORT (server/.env) > défaut
const PORT = process.env.SERVER_PORT || process.env.PORT || 4059;

const frontendUrl = process.env.REACT_APP_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

// ── CORS ──────────────────────────────────────────────────────────────────────
// Origines autorisées : CORS_ORIGINS (liste séparée par des virgules) si défini,
// sinon un jeu de valeurs par défaut (localhost + domaines de production).
const allowedOrigins = (
  process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
    : [
        'http://localhost:3000',          // Développement local
        'http://localhost:4060',          // Production locale avec Docker
        'https://devjobs.creachtheo.fr',  // Site en production
        'http://45.90.121.7:4059',        // Serveur de production
        frontendUrl,
      ]
).filter((v, i, a) => v && a.indexOf(v) === i);

app.use(cors({
  origin: function (origin, callback) {
    // Autorise les requêtes sans origine (appels serveur-à-serveur, curl…)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error(`L'origine ${origin} n'est pas autorisée par CORS`), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Redirection navigateur du domaine API vers le frontend ────────────────────
// Front et API sont servis par le même Express (routés par Traefik selon le Host).
// Une navigation "humaine" sur le domaine API doit atterrir sur le site.
// On ne redirige QUE les navigations : /api/* et /health restent servis.
const API_PUBLIC_HOST = (process.env.API_PUBLIC_HOST || 'api-devjobs.creachtheo.fr').toLowerCase();
const FRONTEND_PUBLIC_URL = (process.env.FRONTEND_PUBLIC_URL || 'https://devjobs.creachtheo.fr').replace(/\/$/, '');
app.use((req, res, next) => {
  const hostHeader = (req.headers['x-forwarded-host'] || req.headers.host || '')
    .split(',')[0].trim().toLowerCase();
  if (hostHeader === API_PUBLIC_HOST && !req.path.startsWith('/api') && req.path !== '/health') {
    return res.redirect(302, FRONTEND_PUBLIC_URL + req.originalUrl);
  }
  next();
});

// ── API « Marché du travail » (statistiques SODE) ─────────────────────────────
// FT_STATS_SCOPE : scope OAuth du produit. FT_STATS_BASE : base des endpoints.
const STATS_SCOPE = process.env.FT_STATS_SCOPE || null;
const STATS_BASE = (process.env.FT_STATS_BASE
  || 'https://api.francetravail.io/partenaire/stats-offres-demandes-emploi/v1').replace(/\/$/, '');
// Allowlist des chemins autorisés sur le proxy stats (évite un proxy ouvert).
const STATS_ALLOWED_PREFIXES = ['/indicateur'];

// API geo.api.gouv.fr pour les communes
const GEO_API_URL = 'https://geo.api.gouv.fr/communes';

/** Middleware : garantit un token France Travail (offres) valide sur req.token. */
async function authMiddleware(req, res, next) {
  try {
    req.token = await ft.getAccessToken();
    next();
  } catch (error) {
    res.status(401).json({ message: 'Erreur d\'authentification' });
  }
}

// ── Routes API ────────────────────────────────────────────────────────────────

app.post('/api/auth', async (req, res) => {
  try {
    await ft.getAccessToken();
    // On renvoie un jeton opaque au client (jamais le vrai token France Travail)
    res.json({ token: 'client_auth_token', expires_in: 3600 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Recherche d'offres
app.post('/api/jobs/search', authMiddleware, async (req, res) => {
  try {
    debug('📥 [Backend] Body reçu:', JSON.stringify(req.body));

    const { keywords, location, distance, experience,
            contractType, qualification, tempsPlein, codeROME, salaryMin, range,
            departement, region, grandDomaine, natureContrat, publieeDepuis,
            minCreationDate, maxCreationDate, sort } = req.body;

    const params = {
      motsCles: keywords,
      commune: location,
      // distance = '0' = commune exacte : ne pas remplacer ('0' est falsy)
      distance: distance !== undefined && distance !== '' ? distance : undefined,
      typeContrat: contractType,
      qualification,
      tempsPlein,
      experience,
      departement,
      region,
      grandDomaine,
      natureContrat,
      publieeDepuis,
      minCreationDate,
      maxCreationDate,
      sort,
      range: range || '0-49',
    };

    if (codeROME) params.codeROME = codeROME;
    // Le filtre salaire n'est pas supporté par l'API FT → filtrage côté client.
    if (salaryMin) debug(`💰 [Backend] Salaire min demandé: ${salaryMin}€ (filtrage client)`);

    // Nettoyer les paramètres vides
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === null || params[key] === '') {
        delete params[key];
      }
    });

    debug('📊 Paramètres finaux:', JSON.stringify(params));

    const { data, total } = await ft.searchOffres(params, req.token);
    debug(`✅ ${data.resultats?.length || 0} offres (total API: ${total ?? 'inconnu'})`);

    res.json({ ...data, total });
  } catch (error) {
    console.error('Erreur recherche emplois:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Erreur recherche emplois',
    });
  }
});

// Détails d'une offre d'emploi
app.get('/api/jobs/:id', authMiddleware, async (req, res) => {
  try {
    const data = await ft.getOffre(req.params.id, req.token);
    res.json(data);
  } catch (error) {
    console.error(`Erreur récupération offre ${req.params.id}:`, error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Erreur lors de la récupération de l\'offre',
    });
  }
});

// ── Proxy « Marché du travail » (stats / tendances) ───────────────────────────
app.get('/api/marche-travail/config', (req, res) => {
  res.json({ configured: Boolean(STATS_SCOPE && STATS_BASE), hasScope: Boolean(STATS_SCOPE), hasBase: Boolean(STATS_BASE) });
});

app.post('/api/marche-travail', async (req, res) => {
  if (!STATS_SCOPE || !STATS_BASE) {
    return res.status(501).json({
      message: 'API Marché du travail non configurée',
      detail: 'Renseignez FT_STATS_SCOPE et FT_STATS_BASE dans server/.env (voir la fiche du produit sur francetravail.io).',
      hasScope: Boolean(STATS_SCOPE), hasBase: Boolean(STATS_BASE),
    });
  }

  const { endpoint = '', method = 'POST', payload = {} } = req.body || {};
  const safeEndpoint = String(endpoint).startsWith('/') ? endpoint : `/${endpoint}`;
  // Sécurité : seuls les chemins connus sont proxifiés (pas de proxy ouvert).
  if (!STATS_ALLOWED_PREFIXES.some((p) => safeEndpoint.startsWith(p))) {
    return res.status(403).json({ message: 'Endpoint non autorisé', endpoint: safeEndpoint });
  }
  const url = `${STATS_BASE}${safeEndpoint}`;

  const call = async (token) => axios({
    url,
    method,
    data: method.toUpperCase() === 'GET' ? undefined : payload,
    params: method.toUpperCase() === 'GET' ? payload : undefined,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
  });

  try {
    let token = await ft.getAccessToken(STATS_SCOPE);
    let response;
    try {
      response = await call(token);
    } catch (err) {
      if (err.response?.status === 401) {
        ft.invalidateToken(STATS_SCOPE);
        token = await ft.getAccessToken(STATS_SCOPE);
        response = await call(token);
      } else {
        throw err;
      }
    }
    const contentRange = response.headers['content-range'] || '';
    const totalMatch = contentRange.match(/\/(\d+)$/);
    res.json({ data: response.data, total: totalMatch ? parseInt(totalMatch[1], 10) : null });
  } catch (error) {
    console.error('Erreur API Marché du travail:', method, url, error.response?.status, error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: 'Erreur API Marché du travail',
      status: error.response?.status || 500,
      url,
      detail: error.response?.data || error.message,
    });
  }
});

// ── Source d'offres additionnelle : Adzuna ────────────────────────────────────
// Clés gratuites (ADZUNA_APP_ID / ADZUNA_APP_KEY). Renvoie 501 tant que non
// configurée → le front masque simplement cette source.
app.get('/api/adzuna/config', (req, res) => {
  res.json({ configured: adzuna.isConfigured() });
});

app.post('/api/adzuna/search', async (req, res) => {
  if (!adzuna.isConfigured()) {
    return res.status(501).json({
      message: 'API Adzuna non configurée',
      detail: 'Renseignez ADZUNA_APP_ID et ADZUNA_APP_KEY dans server/.env (clés gratuites sur developer.adzuna.com).',
    });
  }
  try {
    const { what, where, page = 1, resultsPerPage = 50, salaryMin,
            contractType, workingHours, distance, sortBy = 'date' } = req.body || {};

    const query = {
      results_per_page: Math.min(Number(resultsPerPage) || 50, 50),
      ...(what ? { what } : {}),
      ...(where ? { where } : {}),
      ...(distance ? { distance } : {}),
      ...(salaryMin ? { salary_min: salaryMin } : {}),
      ...(sortBy ? { sort_by: sortBy } : {}),
    };
    // Contrat (approximation des libellés FR côté adapter)
    if (contractType === 'CDI') query.permanent = 1;
    else if (contractType === 'CDD') query.contract = 1;
    // Temps de travail (aligné sur workingHours FT : 'true' = plein)
    if (workingHours === 'true') query.full_time = 1;
    else if (workingHours === 'false') query.part_time = 1;

    const { results, total } = await adzuna.searchOffres({ page, ...query });
    debug(`✅ Adzuna: ${results.length} offres (total: ${total ?? 'inconnu'})`);
    res.json({ results, total });
  } catch (error) {
    console.error('Erreur recherche Adzuna:', error.response?.status, error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: 'Erreur recherche Adzuna',
      detail: error.response?.data || error.message,
    });
  }
});

// ── Communes (geo.api.gouv.fr) ────────────────────────────────────────────────
app.get('/api/communes/search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;
    if (!query || query.trim().length < 2) return res.json([]);

    const response = await axios.get(GEO_API_URL, {
      params: { nom: query, fields: 'nom,code,codesPostaux,population', boost: 'population', limit },
    });

    let results = response.data;

    // Traitement spécifique pour Paris (code global 75056 → arrondissements)
    const parisIndex = results.findIndex((commune) => commune.code === '75056');
    if (parisIndex !== -1) {
      results[parisIndex] = { ...results[parisIndex], nom: 'Paris 1er arrondissement', code: '75101' };
      if (results.length < limit && query.toLowerCase() === 'paris') {
        const arrondissements = [
          { nom: 'Paris 2e arrondissement', code: '75102', codesPostaux: ['75002'] },
          { nom: 'Paris 8e arrondissement', code: '75108', codesPostaux: ['75008'] },
          { nom: 'Paris 16e arrondissement', code: '75116', codesPostaux: ['75016'] },
          { nom: 'Paris 18e arrondissement', code: '75118', codesPostaux: ['75018'] },
        ];
        for (let i = 0; i < arrondissements.length && results.length < limit; i++) {
          results.push(arrondissements[i]);
        }
      }
    }

    const transformedResults = results.map((commune) => {
      let code = commune.code;
      if (commune.code === '75056') {
        const arrMatch = commune.nom.match(/(\d+)[eè]me? arrondissement/i);
        if (arrMatch) {
          const arrNum = parseInt(arrMatch[1], 10);
          code = `751${arrNum.toString().padStart(2, '0')}`;
        } else {
          code = '75101';
        }
      }
      return {
        code,
        nom: commune.nom,
        codesPostaux: commune.codesPostaux || [],
        population: commune.population,
      };
    });

    res.json(transformedResults);
  } catch (error) {
    console.error('Erreur recherche communes:', error.response?.data || error.message);
    res.status(500).json({ message: 'Impossible de rechercher les communes' });
  }
});

app.get('/api/communes/:code', async (req, res) => {
  try {
    const response = await axios.get(`${GEO_API_URL}/${req.params.code}`);
    res.json(response.data);
  } catch (error) {
    console.error('Erreur récupération commune:', error.response?.data || error.message);
    res.status(404).json({ message: 'Commune introuvable' });
  }
});

// ── Enrichissement entreprise (INSEE / SIRENE) ────────────────────────────────
app.get('/api/entreprises/search', async (req, res) => {
  try {
    const { nom, codePostal, departement } = req.query;
    const result = await lookupCompany({ nom, codePostal: codePostal || departement });
    res.json(result);
  } catch (error) {
    console.error('Erreur enrichissement entreprise:', error.message);
    res.status(500).json({ found: false, message: 'Erreur enrichissement entreprise' });
  }
});

app.post('/api/entreprises/bulk', async (req, res) => {
  try {
    const list = Array.isArray(req.body?.companies) ? req.body.companies : [];
    const capped = list.slice(0, 40); // garde-fou
    const results = await Promise.all(
      capped.map(async ({ nom, codePostal }) => ({ nom, result: await lookupCompany({ nom, codePostal }) }))
    );
    res.json({ results });
  } catch (error) {
    console.error('Erreur enrichissement entreprises (bulk):', error.message);
    res.status(500).json({ results: [] });
  }
});

// ── Métiers ROME (recherche locale + détail via API) ──────────────────────────
const TOUS_LES_METIERS = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'rome-codes.json'), 'utf8')
);

// Métiers populaires (tous domaines) — suggestion rapide sans requête
const METIERS_POPULAIRES = [
  { code: 'M1805', libelle: 'Études et développement informatique' },
  { code: 'M1806', libelle: 'Conseil et maîtrise d\'ouvrage en systèmes d\'information' },
  { code: 'M1810', libelle: 'Production et exploitation de systèmes d\'information' },
  { code: 'M1802', libelle: 'Expertise et support en systèmes d\'information' },
  { code: 'D1401', libelle: 'Assistanat commercial' },
  { code: 'D1402', libelle: 'Relation commerciale grands comptes et entreprises' },
  { code: 'D1403', libelle: 'Relation commerciale auprès de particuliers' },
  { code: 'D1407', libelle: 'Relation technico-commerciale' },
  { code: 'M1203', libelle: 'Comptabilité' },
  { code: 'M1204', libelle: 'Contrôle de gestion' },
  { code: 'M1205', libelle: 'Direction administrative et financière' },
  { code: 'M1501', libelle: 'Assistanat en ressources humaines' },
  { code: 'M1502', libelle: 'Développement des ressources humaines' },
  { code: 'E1103', libelle: 'Communication' },
  { code: 'M1705', libelle: 'Marketing' },
  { code: 'J1506', libelle: 'Soins infirmiers généralistes' },
  { code: 'J1502', libelle: 'Coordination de services médicaux ou paramédicaux' },
  { code: 'K2107', libelle: 'Enseignement général du second degré' },
  { code: 'K2106', libelle: 'Enseignement des écoles' },
  { code: 'F1601', libelle: 'Application et décoration en plâtre, stuc et staff' },
  { code: 'F1602', libelle: 'Électricité bâtiment' },
  { code: 'F1603', libelle: 'Installation d\'équipements sanitaires et thermiques' },
  { code: 'N1301', libelle: 'Conception et organisation de la chaîne logistique' },
  { code: 'N4105', libelle: 'Conduite et livraison par tournées sur courte distance' },
  { code: 'G1602', libelle: 'Personnel de cuisine' },
  { code: 'G1603', libelle: 'Personnel polyvalent en restauration' },
  { code: 'M1607', libelle: 'Secrétariat' },
  { code: 'M1605', libelle: 'Assistanat technique et administratif' },
];

// Normalise une chaîne (retire les accents) pour une recherche tolérante
function normalizeString(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Recherche de métiers par nom (locale)
app.get('/api/rome/metiers', authMiddleware, async (req, res) => {
  const { query } = req.query;
  if (!query || query.trim().length < 2) return res.json(METIERS_POPULAIRES);

  try {
    const searchTerm = normalizeString(query.trim());
    const results = TOUS_LES_METIERS.filter((metier) => {
      const libelle = normalizeString(metier.libelle);
      const code = metier.code.toLowerCase();
      return libelle.includes(searchTerm) || code.includes(searchTerm);
    }).slice(0, 20);
    res.json(results.length > 0 ? results : METIERS_POPULAIRES);
  } catch (error) {
    console.error('Erreur API ROME:', error.response?.data || error.message);
    res.json(METIERS_POPULAIRES);
  }
});

// Détails d'un métier par code ROME
app.get('/api/rome/metiers/:code', authMiddleware, async (req, res) => {
  try {
    const data = await ft.getMetier(req.params.code, req.token);
    res.json(data);
  } catch (error) {
    console.error(`Erreur récupération métier ${req.params.code}:`, error.response?.data || error.message);
    res.status(404).json({ message: 'Métier introuvable' });
  }
});

// Vérification de santé (avant le catch-all React)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0' });
});

// Servir le build React en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Frontend URL configurée: ${frontendUrl}`);
  console.log(`Origines CORS autorisées: ${allowedOrigins.join(', ')}`);
});
