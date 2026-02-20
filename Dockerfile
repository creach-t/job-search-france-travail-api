FROM node:18-alpine

RUN apk add --no-cache bash

WORKDIR /app

# Copier les fichiers de package.json et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du code source
COPY . .

# Variables d'environnement injectées au moment du build (via --build-arg)
ARG REACT_APP_API_URL
ARG REACT_APP_FRONTEND_URL
ARG REACT_APP_PORT

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_FRONTEND_URL=$REACT_APP_FRONTEND_URL
ENV REACT_APP_PORT=$REACT_APP_PORT
ENV NODE_ENV=production

# Build de l'application React
RUN npm run build

# Exposition du port backend
EXPOSE 4059

# Commande de démarrage en production
CMD ["node", "server/server.js"]
