FROM node:18-alpine

RUN apk add --no-cache bash

WORKDIR /app/server

# Dépendances RUNTIME uniquement (server/package.json) → l'image n'embarque PAS
# React & co : le front est pré-compilé par la CI et copié dans /app/build.
COPY server/package*.json ./
RUN npm ci --omit=dev

# Code serveur (sans node_modules ni .env, exclus par .dockerignore)
COPY server/ ./

# Build React pré-compilé par la CI (servi par Express en production)
WORKDIR /app
COPY build/ ./build/

# Exposition du port backend
EXPOSE 4059

# Commande de démarrage en production
CMD ["node", "server/server.js"]
