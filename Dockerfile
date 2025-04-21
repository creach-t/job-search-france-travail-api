FROM node:18-alpine

RUN apk add --no-cache bash

WORKDIR /app

# Copier les fichiers de package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du code source
COPY . .

# Utiliser les variables d'environnement de production
COPY .env.production .env

# Build de l'application React avec les variables d'environnement de production
ENV NODE_ENV=production
RUN npm run build

# Exposition des ports
EXPOSE 4059

# Commande de démarrage en production
CMD ["node", "server/server.js"]
