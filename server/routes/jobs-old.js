const express = require('express');
const router = express.Router();

// Base de données simulée
let mockJobs = [
  {
    id: '1',
    title: 'Développeur Frontend React',
    company: 'Tech Corp',
    location: 'Paris',
    description: 'Nous recherchons un développeur React expérimenté pour rejoindre notre équipe dynamique. Le candidat idéal aura une solide expérience en développement frontend et une passion pour les interfaces utilisateur modernes.',
    requirements: ['React', 'JavaScript', 'HTML/CSS'],
    type: 'CDI',
    publicationDate: '2024-02-23T10:00:00.000Z',
    salary: '45-55k€'
  },
  {
    id: '2',
    title: 'Développeur Full Stack JavaScript',
    company: 'Startup Innovation',
    location: 'Lyon',
    description: 'Startup en croissance cherche un développeur Full Stack passionné pour participer au développement de notre plateforme SaaS. Stack technique : React, Node.js, MongoDB.',
    requirements: ['Node.js', 'React', 'MongoDB'],
    type: 'CDI',
    publicationDate: '2024-02-23T09:30:00.000Z',
    salary: '40-50k€'
  }
];

router.post('/search', async (req, res) => {
  try {
    // Simulation d'une recherche avec délai
    await new Promise(resolve => setTimeout(resolve, 500));
    res.json(mockJobs);
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = mockJobs.find(j => j.id === req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 200));
    res.json(job);
  } catch (error) {
    console.error('Erreur lors de la récupération du job:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;