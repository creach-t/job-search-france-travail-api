const express = require('express');
const axios = require('axios');
const cors = require('cors');
const qs = require('querystring');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Activer CORS pour votre application frontend
app.use(cors());

// Variables pour stocker le token d'accès
let accessToken = null;
let tokenExpiration = 0;

// Fonction pour obtenir un token d'accès
async function getAccessToken() {
  // Vérifier si le token existant est encore valide (avec une marge de 5 minutes)
  const currentTime = Date.now();
  if (accessToken && tokenExpiration > currentTime + 300000) {
    return accessToken;
  }

  try {
    // Utilisation du flux "Client Credentials" d'OAuth 2.0
    const tokenUrl = 'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire';
    
    const requestBody = {
      grant_type: 'client_credentials',
      client_id: process.env.FRANCE_TRAVAIL_CLIENT_ID,
      client_secret: process.env.FRANCE_TRAVAIL_CLIENT_SECRET,
      scope: 'api_offresdemploiv2'
    };

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const response = await axios.post(tokenUrl, qs.stringify(requestBody), config);
    
    // Stocker le token et calculer son expiration
    accessToken = response.data.access_token;
    // Convertir en millisecondes et soustraire 1 minute pour éviter les problèmes de délai
    tokenExpiration = currentTime + (response.data.expires_in * 1000) - 60000;
    
    console.log('Nouveau token d\'accès obtenu, valide jusqu\'à:', new Date(tokenExpiration));
    
    return accessToken;
  } catch (error) {
    console.error('Erreur lors de l\'obtention du token d\'accès:', error.response?.data || error.message);
    throw new Error('Impossible d\'obtenir un token d\'accès.');
  }
}

// Route proxy pour la recherche d'offres
app.get('/api/jobs', async (req, res) => {
  try {
    // Obtenir un token d'accès valide
    const token = await getAccessToken();
    
    // Récupérer les paramètres de la requête
    const { keywords, location, distance, experience, contractType } = req.query;
    
    // Construire les paramètres pour l'API
    const params = {
      motsCles: keywords || 'développeur,web,informatique',
      sort: 1,
      range: '0-49',
      publieeDepuis: 31
    };
    
    // Ajouter les paramètres conditionnels
    if (location) params.commune = location;
    if (distance) params.distance = distance;
    if (experience) params.experience = experience;
    if (contractType) params.typeContrat = contractType;
    
    // Faire la requête à l'API France Travail avec le token
    const response = await axios.get(
      'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search',
      {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    // Renvoyer les données à votre frontend
    res.json(response.data);
  } catch (error) {
    console.error('Erreur API:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Erreur lors de la requête à l\'API France Travail'
    });
  }
});

// Route proxy pour obtenir une offre par ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    // Obtenir un token d'accès valide
    const token = await getAccessToken();
    
    const jobId = req.params.id;
    
    // Faire la requête à l'API France Travail avec le token
    const response = await axios.get(
      `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    // Renvoyer les données à votre frontend
    res.json(response.data);
  } catch (error) {
    console.error('Erreur API:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Erreur lors de la requête à l\'API France Travail'
    });
  }
});

// Gestion des erreurs liées au dépassement de quotas
app.use((error, req, res, next) => {
  if (error.response && error.response.status === 429) {
    // Récupérer le header Retry-After
    const retryAfter = error.response.headers['retry-after'] || 60;
    
    res.status(429).json({
      error: 'Quota dépassé. Veuillez réessayer plus tard.',
      retryAfter: parseInt(retryAfter, 10)
    });
  } else {
    next(error);
  }
});

// Pour servir l'application React en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('build'));
  
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Serveur proxy démarré sur le port ${PORT}`);
});
