const express = require('express');
const cors = require('cors');

const app = express();

// Configuration CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser JSON
app.use(express.json());

// Routes
app.use('/api/jobs', require('./routes/jobs'));

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Une erreur est survenue sur le serveur',
    message: err.message
  });
});

// Port
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n=== Serveur démarré sur le port ${PORT} ===`);
  console.log(`Frontend: http://localhost:3000`);
  console.log(`API: http://localhost:${PORT}\n`);
});