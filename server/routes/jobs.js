const express = require('express');
const router = express.Router();

// Base de données simulée
let mockJobs = [
  {
    id: '1',
    title: 'Développeur Frontend React',
    company: 'Tech Corp',
    location: 'Paris',
    description: 'Nous recherchons un développeur React expérimenté...',
    requirements: ['React', 'JavaScript', 'HTML/CSS'],
    salary: '45-55k€',
    type: 'CDI'
  },
  {
    id: '2',
    title: 'Développeur Full Stack JavaScript',
    company: 'Startup Innovation',
    location: 'Lyon',
    description: 'Startup en croissance cherche un développeur Full Stack...',
    requirements: ['Node.js', 'React', 'MongoDB'],
    salary: '40-50k€',
    type: 'CDI'
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