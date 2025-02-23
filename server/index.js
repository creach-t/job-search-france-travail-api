const express = require('express');
const cors = require('cors');

const app = express();

// Configuration CORS de base
app.use(cors());

// Parser pour le JSON
app.use(express.json());

// Routes
app.use('/api/jobs', require('./routes/jobs'));

// Port configuration
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Frontend: http://localhost:3000`);
  console.log(`API: http://localhost:${PORT}`);
});