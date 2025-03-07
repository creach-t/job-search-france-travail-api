#!/bin/bash

# Script pour démarrer l'application en mode production avec Docker

# Vérifier si .env.docker existe, sinon le créer à partir de .env.docker.example
if [ ! -f .env.docker ]; then
  echo "Fichier .env.docker non trouvé, utilisation des valeurs par défaut"
fi

# Démarrer l'application avec docker-compose
echo "Démarrage de l'application en mode production avec Docker..."
echo "Frontend: http://localhost:4060"
echo "Backend API: http://localhost:4059"

docker-compose up -d

echo "Application démarrée en arrière-plan."
echo "Pour voir les logs: docker-compose logs -f"
echo "Pour arrêter: docker-compose down"
