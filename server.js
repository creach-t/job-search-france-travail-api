const express = require('express');
const axios = require('axios');
const cors = require('cors');
const qs = require('querystring');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configurer les limites d'en-têtes pour Express
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Configurer les en-têtes HTTP pour éviter les erreurs 431
app.use((req, res, next) => {
  // Limiter la taille des cookies et autres en-têtes
  const headerSize = JSON.stringify(req.headers).length;
  if (headerSize > 8000) { // Limite arbitraire pour éviter les erreurs 431
    return res.status(431).json({
      error: 'Request header fields too large',
      message: 'Try reducing search parameters or clear cookies'
    });
  }
  next();
});

// Activer CORS pour le développement
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

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

// Route pour la recherche d'offres
app.get('/api/search', async (req, res) => {
  try {
    // Obtenir un token d'accès valide
    const token = await getAccessToken();
    
    // Récupérer les paramètres de la requête et limiter leur taille
    let { keywords, location, distance, experience, contractType } = req.query;
    
    // Limiter strictement la taille des paramètres
    if (keywords && keywords.length > 30) keywords = keywords.substring(0, 30);
    if (location && location.length > 30) location = location.substring(0, 30);
    
    // Construire les paramètres pour l'API
    const params = {
      motsCles: keywords || 'développeur',
      sort: 1,
      range: '0-5', // Réduire le nombre de résultats pour alléger la requête
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
          'Accept': 'application/json',
          'User-Agent': 'job-search-app'
        },
        maxContentLength: 1 * 1024 * 1024, // 1 MB
        maxBodyLength: 1 * 1024 * 1024, // 1 MB
      }
    );
    
    console.log('Réponse API reçue, statut:', response.status);
    
    // Renvoyer les données au frontend
    res.json(response.data);
  } catch (error) {
    console.error('Erreur API:', error.message);
    if (error.response) {
      console.error('Statut:', error.response.status);
      console.error('Données:', error.response.data);
      console.error('En-têtes:', error.response.headers);
    }
    
    res.status(error.response?.status || 500).json({
      error: error.message || 'Erreur lors de la requête à l\'API France Travail',
      details: error.response?.data
    });
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
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Frontend: http://localhost:3000`);
  console.log(`API: http://localhost:${PORT}`);
});