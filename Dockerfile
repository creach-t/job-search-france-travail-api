FROM node:18-alpine

RUN apk add --no-cache bash

WORKDIR /app

# Installer uniquement les dépendances serveur (pas de devDependencies)
COPY package*.json ./
RUN npm install --omit=dev

# Copier le code serveur
COPY server/ ./server/

# Copier le build React pré-compilé par la CI (pas de RUN npm run build ici)
COPY build/ ./build/

# Exposition du port backend
EXPOSE 4059

# Commande de démarrage en production
CMD ["node", "server/server.js"]
