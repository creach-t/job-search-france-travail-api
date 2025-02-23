const express = require('express');
const router = express.Router();

router.post('/search', async (req, res) => {
  try {
    // Logique de recherche à implémenter
    res.json({ message: 'Recherche en cours de développement' });
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la recherche' });
  }
});

module.exports = router;