const express = require('express');
const router = express.Router();

router.post('/search', async (req, res) => {
  try {
    // Mock response for testing
    const mockJobs = [
      {
        id: '1',
        title: 'Développeur Frontend React',
        company: 'Tech Corp',
        location: 'Paris'
      },
      {
        id: '2',
        title: 'Développeur Full Stack JavaScript',
        company: 'Startup Innovation',
        location: 'Lyon'
      }
    ];
    
    res.json(mockJobs);
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
  }
});

module.exports = router;