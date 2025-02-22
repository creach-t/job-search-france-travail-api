const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Activer CORS pour votre application frontend
app.use(cors());

// Route proxy pour la recherche d'offres
app.get('/api/jobs', async (req, res) => {
  try {
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
    
    // Faire la requête à l'API France Travail avec votre clé API
    const response = await axios.get(
      'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search',
      {
        params,
        headers: {
          'Authorization': `Bearer ${process.env.FRANCE_TRAVAIL_API_KEY}`
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
    const jobId = req.params.id;
    
    // Faire la requête à l'API France Travail avec votre clé API
    const response = await axios.get(
      `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FRANCE_TRAVAIL_API_KEY}`
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
