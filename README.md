# Recherche d'emploi avec l'API France Travail

Application React personnalisée pour la recherche d'offres d'emploi de développeur web utilisant l'API France Travail.

## Fonctionnalités

- Recherche d'offres d'emploi par mots-clés, localisation et autres critères
- Filtres spécifiques pour les développeurs web (technologies, expérience, etc.)
- Interface utilisateur moderne et réactive
- Visualisation des résultats avec des informations détaillées
- Architecture sécurisée avec proxy backend

## Installation

1. Cloner le dépôt
```bash
git clone https://github.com/creach-t/job-search-france-travail-api.git
cd job-search-france-travail-api
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
```
Puis éditez le fichier `.env` avec votre clé API France Travail.

4. Lancer l'application en mode développement
```bash
# Lancer le serveur proxy et l'application React simultanément
npm run dev

# Ou lancer séparément :
npm run server  # Pour le serveur proxy API
npm start       # Pour l'application React
```

## Architecture

Le projet utilise une architecture client-serveur pour sécuriser l'accès à l'API France Travail :

- **Backend (Proxy API)** : Un serveur Express qui gère les requêtes vers l'API France Travail en servant d'intermédiaire. Cette approche permet de :
  - Résoudre les problèmes de CORS (Cross-Origin Resource Sharing)
  - Sécuriser la clé API en la gardant côté serveur
  - Formater les réponses avant de les envoyer au frontend

- **Frontend (Application React)** : Interface utilisateur construite avec React, qui communique uniquement avec notre serveur proxy.

## Technologies utilisées

### Backend
- Node.js
- Express
- Axios
- Cors
- Dotenv

### Frontend
- React 18
- Axios pour les requêtes API
- Tailwind CSS pour le style
- React Router pour la navigation
- React Query pour la gestion des données

## Notes de sécurité

- La clé API ne doit jamais être exposée côté client
- Le fichier `.env` ne doit jamais être commité dans le dépôt Git
- Utilisez toujours le serveur proxy pour communiquer avec l'API France Travail

## Déploiement

Pour déployer en production :

1. Construire l'application React
```bash
npm run build
```

2. Lancer le serveur qui servira à la fois l'API proxy et l'application construite
```bash
NODE_ENV=production npm run server
```

## Obtenir une clé API

Pour obtenir une clé API France Travail :
1. Créez un compte sur [https://pole-emploi.io/](https://pole-emploi.io/)
2. Créez une application dans votre espace développeur
3. Souscrivez à l'API "Offres d'emploi v2"
4. Récupérez votre clé API dans les détails de votre application
