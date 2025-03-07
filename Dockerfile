FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du code source
COPY . .

# Variables d'environnement par défaut pour le build
# Ces valeurs seront écrasées par les fichiers .env en production
ENV NODE_ENV=production
# Utiliser SERVER_PORT au lieu de PORT pour être cohérent avec la nouvelle structure
ENV SERVER_PORT=4059
ENV REACT_APP_PORT=4060
ENV REACT_APP_FRONTEND_URL=http://localhost:4060
ENV REACT_APP_API_URL=http://localhost:4059/api

# Build de l'application React
RUN npm run build

# Exposition des ports du serveur
EXPOSE 4059 4060

# Commande de démarrage en production
CMD ["node", "server/server.js"]
