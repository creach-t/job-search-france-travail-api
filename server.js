const express = require('express');
const axios = require('axios');
const cors = require('cors');
const qs = require('querystring');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurer les limites d'en-têtes pour Express
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Activer CORS pour votre application frontend
app.use(cors());

// Configurer axios pour éviter l'erreur des en-têtes trop grands
axios.defaults.maxRedirects = 5;
axios.defaults.maxContentLength = 20 * 1024 * 1024; // 20 MB
axios.defaults.maxBodyLength = 20 * 1024 * 1024; // 20 MB

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
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    };

    console.log('Tentative d\'obtention d\'un token d\'accès...');
    const response = await axios.post(tokenUrl, qs.stringify(requestBody), config);
    
    // Stocker le token et calculer son expiration
    accessToken = response.data.access_token;
    // Convertir en millisecondes et soustraire 1 minute pour éviter les problèmes de délai
    tokenExpiration = currentTime + (response.data.expires_in * 1000) - 60000;
    
    console.log('Nouveau token d\'accès obtenu, valide jusqu\'à:', new Date(tokenExpiration));
    
    return accessToken;
  } catch (error) {
    console.error('Erreur lors de l\'obtention du token d\'accès:', error.response?.data || error.message);
    console.error('Statut de l\'erreur:', error.response?.status);
    console.error('En-têtes de réponse:', error.response?.headers);
    throw new Error('Impossible d\'obtenir un token d\'accès.');
  }
}

// Route proxy pour la recherche d'offres
app.get('/api/jobs', async (req, res) => {
  try {
    // Obtenir un token d'accès valide
    const token = await getAccessToken();
    
    // Récupérer les paramètres de la requête et limiter leur taille
    let { keywords, location, distance, experience, contractType } = req.query;
    
    // Limiter la taille des paramètres
    if (keywords && keywords.length > 200) keywords = keywords.substring(0, 200);
    if (location && location.length > 100) location = location.substring(0, 100);
    
    // Construire les paramètres pour l'API
    const params = {
      motsCles: keywords || 'développeur web',
      sort: 1,
      range: '0-19', // Réduire le nombre de résultats pour alléger la requête
      publieeDepuis: 31
    };
    
    // Ajouter les paramètres conditionnels
    if (location) params.commune = location;
    if (distance) params.distance = distance;
    if (experience) params.experience = experience;
    if (contractType) params.typeContrat = contractType;
    
    console.log('Paramètres de recherche:', params);
    
    // Faire la requête à l'API France Travail avec le token
    const response = await axios.get(
      'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search',
      {
        params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        maxContentLength: 10 * 1024 * 1024, // 10 MB
        maxBodyLength: 10 * 1024 * 1024, // 10 MB
      }
    );
    
    console.log('Réponse API reçue, statut:', response.status);
    
    // Renvoyer les données à votre frontend
    res.json(response.data);
  } catch (error) {
    console.error('Erreur API:', error.message);
    if (error.response) {
      console.error('Statut:', error.response.status);
      console.error('Données:', error.response.data);
      console.error('En-têtes:', error.response.headers);
    }
    
    // Retourner l'erreur avec des informations utiles
    res.status(error.response?.status || 500).json({
      error: error.message || 'Erreur lors de la requête à l\'API France Travail',
      details: error.response?.data
    });
  }
});

// Route proxy pour obtenir une offre par ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    // Obtenir un token d'accès valide
    const token = await getAccessToken();
    
    const jobId = req.params.id;
    
    console.log('Récupération de l\'offre avec ID:', jobId);
    
    // Faire la requête à l'API France Travail avec le token
    const response = await axios.get(
      `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        maxContentLength: 10 * 1024 * 1024, // 10 MB
        maxBodyLength: 10 * 1024 * 1024, // 10 MB
      }
    );
    
    console.log('Offre récupérée avec succès');
    
    // Renvoyer les données à votre frontend
    res.json(response.data);
  } catch (error) {
    console.error('Erreur API:', error.message);
    if (error.response) {
      console.error('Statut:', error.response.status);
      console.error('Données:', error.response.data);
    }
    
    res.status(error.response?.status || 500).json({
      error: error.message || 'Erreur lors de la requête à l\'API France Travail',
      details: error.response?.data
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
  } else if (error.response && error.response.status === 431) {
    res.status(431).json({
      error: 'Les en-têtes de la requête sont trop grands. Veuillez réduire les paramètres de votre recherche.'
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
