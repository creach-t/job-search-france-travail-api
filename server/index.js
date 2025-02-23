const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Chargement des variables d'environnement
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration avancée de CORS pour résoudre les problèmes de cross-origin
app.use(cors({
  origin: 'http://localhost:3000', // URL exacte du frontend
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
            contractType, qualification, workingHours } = req.body;
    
    const params = {
      motsCles: keywords,
      commune: location,
      typeContrat: contractType,
      qualification,
      tempsPlein: workingHours,
      experience
    };

    const data = await makeApiCall(
      `${FRANCE_TRAVAIL_API.BASE_URL}partenaire/offresdemploi/v2/offres/search`,
      params,
      req.token
    );
    
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
        const arrMatch = commune.nom.match(/(\d+)[eè]me? arrondissement/i);
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

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  
  // Toutes les routes non-API renvoient vers l'application React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});