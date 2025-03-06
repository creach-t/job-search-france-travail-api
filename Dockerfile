FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du code source
COPY . .

# Variables d'environnement pour le build
ENV NODE_ENV=production
ENV PORT=3001

# Build de l'application React
RUN npm run build

# Exposition du port du serveur
EXPOSE 3001

# Commande de démarrage en production
CMD ["node", "server/server.js"]