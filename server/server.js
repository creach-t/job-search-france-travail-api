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

const app = express();
// Utilisation de SERVER_PORT du fichier .env à la racine, ou PORT du fichier server/.env,
// ou valeur par défaut
const PORT = process.env.SERVER_PORT || process.env.PORT || 4059;

// Configuration avancée de CORS pour résoudre les problèmes de cross-origin
// Utilisation de REACT_APP_FRONTEND_URL du fichier .env à la racine ou valeur par défaut
const frontendUrl = process.env.REACT_APP_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

// Liste des origines autorisées
const allowedOrigins = [
  'http://localhost:3000',        // Développement local
  'http://localhost:4060',        // Production locale avec Docker
  'https://devjobs.creachtheo.fr', // Site en production
  'http://45.90.121.7:4059'       // Serveur de production
];

app.use(cors({
  origin: function(origin, callback) {
    // Autorise les requêtes sans origine (comme les appels API mobiles ou curl)
    if (!origin) return callback(null, true);
    
    // Vérifie si l'origine est autorisée
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `L'origine ${origin} n'est pas autorisée par CORS`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,               // Autorise les cookies et l'authentification
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Variables pour stocker le token d'accès
let accessToken = null;
let tokenExpiry = null;

// Configuration de l'API France Travail
const FRANCE_TRAVAIL_API = {
  TOKEN_URL: process.env.FT_TOKEN_URL,
  BASE_URL: process.env.FT_BASE_URL,
  CLIENT_ID: process.env.FT_CLIENT_ID,
  CLIENT_SECRET: process.env.FT_CLIENT_SECRET,
  SCOPE: process.env.FT_SCOPE
};

// API geo.api.gouv.fr pour les communes
const GEO_API_URL = 'https://geo.api.gouv.fr/communes';

/**
 * Obtient un token d'accès auprès de France Travail
 * @returns {Promise<string>} - Token d'accès
 */
async function getAccessToken() {
  // Si le token existe et est encore valide
  if (accessToken && tokenExpiry && tokenExpiry > Date.now()) {
    return accessToken;
  }

  try {
    console.log("Tentative d'authentification avec:");
    console.log("CLIENT_ID:", FRANCE_TRAVAIL_API.CLIENT_ID ? "Défini" : "Non défini");
    console.log("CLIENT_SECRET:", FRANCE_TRAVAIL_API.CLIENT_SECRET ? "Défini" : "Non défini");
    console.log("SCOPE:", FRANCE_TRAVAIL_API.SCOPE);
    console.log("TOKEN_URL:", FRANCE_TRAVAIL_API.TOKEN_URL);
    // Paramètres pour la demande OAuth 2.0
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', FRANCE_TRAVAIL_API.CLIENT_ID);
    params.append('client_secret', FRANCE_TRAVAIL_API.CLIENT_SECRET);
    params.append('scope', FRANCE_TRAVAIL_API.SCOPE);

    const response = await axios.post(FRANCE_TRAVAIL_API.TOKEN_URL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    // Stockage du token et calcul de l'expiration
    accessToken = response.data.access_token;
    // Expiration en secondes convertie en millisecondes
    // On soustrait 60 secondes pour avoir une marge de sécurité
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

    return accessToken;
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error.response?.data || error.message);
    throw new Error('Impossible d\'obtenir un token d\'accès');
  }
}

/**
 * Middleware pour vérifier la présence du token dans la requête
 */
async function authMiddleware(req, res, next) {
  try {
    // La vérification est simplifiée ici - dans un environnement de production,
    // on utiliserait JWT ou une autre méthode de validation de token
    req.token = await getAccessToken();
    next();
  } catch (error) {
    res.status(401).json({ message: 'Erreur d\'authentification' });
  }
}

// Routes API
app.post('/api/auth', async (req, res) => {
  try {
    await getAccessToken();
    // On renvoie un token pour le client (pas le vrai token France Travail)
    res.json({ token: 'client_auth_token', expires_in: 3600 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function makeApiCall(url, params, token, retryCount = 0) {
  try {
    const response = await axios.get(url, {
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401 && retryCount === 0) {
      // Token invalide - on réessaie une fois avec un nouveau token
      accessToken = null; // Force la régénération
      const newToken = await getAccessToken();
      return makeApiCall(url, params, newToken, retryCount + 1);
    }
    throw error;
  }
}

// Modification de la route de recherche
app.post('/api/jobs/search', authMiddleware, async (req, res) => {
  try {
    const { keywords, location, distance, experience,
            contractType, qualification, workingHours, codeROME } = req.body;

    const params = {
      motsCles: keywords,
      commune: location,
      typeContrat: contractType,
      qualification,
      tempsPlein: workingHours,
      experience
    };

    // Ajouter le code ROME si présent (recherche précise par métier)
    if (codeROME) {
      params.codeROME = codeROME;
      console.log(`Recherche avec code ROME: ${codeROME}`);
    }

    // Nettoyer les paramètres undefined
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === null || params[key] === '') {
        delete params[key];
      }
    });

    console.log('📊 Paramètres finaux:', JSON.stringify(params));

    const data = await makeApiCall(
      `${FRANCE_TRAVAIL_API.BASE_URL}partenaire/offresdemploi/v2/offres/search`,
      params,
      req.token
    );

    console.log(`✅ Résultats: ${data.resultats?.length || 0} offres trouvées`);

    res.json(data);
  } catch (error) {
    console.error('Erreur recherche emplois:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Erreur recherche emplois'
    });
  }
});

// Détails d'une offre d'emploi
app.get('/api/jobs/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(
      `${FRANCE_TRAVAIL_API.BASE_URL}partenaire/offresdemploi/v2/offres/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${req.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'offre ID ${req.params.id}:`, error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Erreur lors de la récupération de l\'offre'
    });
  }
});

// Recherche de communes
app.get('/api/communes/search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json([]);
    }

    const response = await axios.get(GEO_API_URL, {
      params: {
        nom: query,
        fields: 'nom,code,codesPostaux,population',
        boost: 'population',
        limit
      }
    });

    let results = response.data;
    
    // Traitement spécifique pour Paris
    const parisIndex = results.findIndex(commune => commune.code === '75056');
    if (parisIndex !== -1) {
      // Remplacer Paris par Paris 1er arrondissement
      results[parisIndex] = {
        ...results[parisIndex],
        nom: 'Paris 1er arrondissement',
        code: '75101'
      };
      
      // Si on a moins de 5 résultats, on ajoute d'autres arrondissements
      if (results.length < limit && query.toLowerCase() === 'paris') {
        // Ajouter quelques arrondissements populaires
        const arrondissements = [
          { nom: 'Paris 2e arrondissement', code: '75102', codesPostaux: ['75002'] },
          { nom: 'Paris 8e arrondissement', code: '75108', codesPostaux: ['75008'] },
          { nom: 'Paris 16e arrondissement', code: '75116', codesPostaux: ['75016'] },
          { nom: 'Paris 18e arrondissement', code: '75118', codesPostaux: ['75018'] }
        ];
        
        // Ajouter les arrondissements jusqu'à atteindre la limite
        for (let i = 0; i < arrondissements.length && results.length < limit; i++) {
          results.push(arrondissements[i]);
        }
      }
    }

    // Transformer les résultats
    const transformedResults = results.map(commune => {
      let code = commune.code;
      
      // Cas spécial pour Paris
      if (commune.code === '75056') {
        // Si le nom contient déjà un numéro d'arrondissement, on l'utilise
        const arrMatch = commune.nom.match(/(\\d+)[eè]me? arrondissement/i);
        if (arrMatch) {
          const arrNum = parseInt(arrMatch[1], 10);
          // Formater le code d'arrondissement (75101 pour le 1er, 75102 pour le 2e, etc.)
          code = `751${arrNum.toString().padStart(2, '0')}`;
        } else {
          // Par défaut, on renvoie Paris 1er arrondissement
          code = '75101';
        }
      }
      
      return {
        code,
        nom: commune.nom,
        codesPostaux: commune.codesPostaux || [],
        population: commune.population
      };
    });

    res.json(transformedResults);
  } catch (error) {
    console.error('Erreur lors de la recherche de communes:', error.response?.data || error.message);
    res.status(500).json({ message: 'Impossible de rechercher les communes' });
  }
});

// Détails d'une commune
app.get('/api/communes/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const response = await axios.get(`${GEO_API_URL}/${code}`);
    res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de la récupération de la commune:', error.response?.data || error.message);
    res.status(404).json({ message: 'Commune introuvable' });
  }
});

// ============================================
// Routes API ROME (Métiers)
// ============================================

// Charger tous les codes ROME depuis le fichier JSON
const TOUS_LES_METIERS = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'rome-codes.json'), 'utf8')
);

// Métiers populaires pré-définis (tous domaines confondus) - pour suggestion rapide
const METIERS_POPULAIRES = [
  // Informatique & Tech
  { code: 'M1805', libelle: 'Études et développement informatique' },
  { code: 'M1806', libelle: 'Conseil et maîtrise d\'ouvrage en systèmes d\'information' },
  { code: 'M1810', libelle: 'Production et exploitation de systèmes d\'information' },
  { code: 'M1802', libelle: 'Expertise et support en systèmes d\'information' },

  // Commerce & Vente
  { code: 'D1401', libelle: 'Assistanat commercial' },
  { code: 'D1402', libelle: 'Relation commerciale grands comptes et entreprises' },
  { code: 'D1403', libelle: 'Relation commerciale auprès de particuliers' },
  { code: 'D1407', libelle: 'Relation technico-commerciale' },

  // Comptabilité & Gestion
  { code: 'M1203', libelle: 'Comptabilité' },
  { code: 'M1204', libelle: 'Contrôle de gestion' },
  { code: 'M1205', libelle: 'Direction administrative et financière' },

  // Ressources Humaines
  { code: 'M1501', libelle: 'Assistanat en ressources humaines' },
  { code: 'M1502', libelle: 'Développement des ressources humaines' },

  // Marketing & Communication
  { code: 'E1103', libelle: 'Communication' },
  { code: 'M1705', libelle: 'Marketing' },

  // Santé
  { code: 'J1506', libelle: 'Soins infirmiers généralistes' },
  { code: 'J1502', libelle: 'Coordination de services médicaux ou paramédicaux' },

  // Enseignement
  { code: 'K2107', libelle: 'Enseignement général du second degré' },
  { code: 'K2106', libelle: 'Enseignement des écoles' },

  // Bâtiment & Construction
  { code: 'F1601', libelle: 'Application et décoration en plâtre, stuc et staff' },
  { code: 'F1602', libelle: 'Électricité bâtiment' },
  { code: 'F1603', libelle: 'Installation d\'équipements sanitaires et thermiques' },

  // Logistique & Transport
  { code: 'N1301', libelle: 'Conception et organisation de la chaîne logistique' },
  { code: 'N4105', libelle: 'Conduite et livraison par tournées sur courte distance' },

  // Hôtellerie & Restauration
  { code: 'G1602', libelle: 'Personnel de cuisine' },
  { code: 'G1603', libelle: 'Personnel polyvalent en restauration' },

  // Secrétariat & Administration
  { code: 'M1607', libelle: 'Secrétariat' },
  { code: 'M1605', libelle: 'Assistanat technique et administratif' }
];

// Fonction pour normaliser les chaînes (enlever les accents)
function normalizeString(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Recherche de métiers par nom
app.get('/api/rome/metiers', authMiddleware, async (req, res) => {
  const { query } = req.query;

  // Si pas de query ou trop courte, renvoyer les métiers populaires
  if (!query || query.trim().length < 2) {
    return res.json(METIERS_POPULAIRES);
  }

  try {
    // Recherche locale dans tous les codes ROME (insensible aux accents)
    const searchTerm = normalizeString(query.trim());

    const results = TOUS_LES_METIERS.filter(metier => {
      const libelle = normalizeString(metier.libelle);
      const code = metier.code.toLowerCase();
      return libelle.includes(searchTerm) || code.includes(searchTerm);
    }).slice(0, 20); // Limiter à 20 résultats

    res.json(results.length > 0 ? results : METIERS_POPULAIRES);
  } catch (error) {
    console.error('Erreur API ROME:', error.response?.data || error.message);

    // En cas d'erreur, renvoyer les métiers populaires
    res.json(METIERS_POPULAIRES);
  }
});

// Détails d'un métier par code ROME
app.get('/api/rome/metiers/:code', authMiddleware, async (req, res) => {
  const { code } = req.params;

  try {
    const response = await axios.get(
      `${FRANCE_TRAVAIL_API.BASE_URL}partenaire/rome/v1/metier/${code}`,
      {
        headers: {
          'Authorization': `Bearer ${req.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(`Erreur récupération métier ${code}:`, error.response?.data || error.message);
    res.status(404).json({ message: 'Métier introuvable' });
  }
});

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  // Toutes les routes non-API renvoient vers l'application React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Route pour la vérification de santé
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Frontend URL configurée: ${frontendUrl}`);
  console.log(`Origines CORS autorisées: ${allowedOrigins.join(', ')}`);
});
