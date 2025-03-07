#!/bin/bash

# Script pour démarrer l'application en mode production avec Docker

echo "Vérification de la présence du dossier build..."
if [ ! -d "build" ]; then
  echo "Le dossier build n'existe pas. Construction de l'application React..."
  npm run build
  if [ $? -ne 0 ]; then
    echo "Erreur lors de la construction de l'application React."
    exit 1
  fi
  echo "Application React construite avec succès."
fi

echo "Vérification de la configuration Nginx..."
if [ ! -d "nginx" ]; then
  echo "Le dossier nginx n'existe pas. Veuillez créer le dossier nginx avec un fichier nginx.conf."
  exit 1
fi

# Démarrer l'application avec docker-compose
echo "Démarrage de l'application en mode production avec Docker..."
echo "Frontend: http://localhost:4060"
echo "Backend API: http://localhost:4059"

docker-compose down
docker-compose up -d

echo "Application démarrée en arrière-plan."
echo "Pour voir les logs: docker-compose logs -f"
echo "Pour arrêter: docker-compose down"
