# Recherche d'emploi avec l'API France Travail

Application React personnalisée pour la recherche d'offres d'emploi de développeur web utilisant l'API France Travail avec authentification OAuth 2.0.

## Fonctionnalités

- Recherche d'offres d'emploi par mots-clés, localisation et autres critères
- Filtres spécifiques pour les développeurs web (technologies, expérience, etc.)
- Interface utilisateur moderne et réactive
- Visualisation des résultats avec des informations détaillées
- Architecture sécurisée avec proxy backend et authentification OAuth 2.0

## Prérequis

Pour utiliser cette application, vous devez :

1. **Créer un compte développeur** sur [https://pole-emploi.io/](https://pole-emploi.io/)
2. **Déclarer une application** dans votre espace développeur
3. **Souscrire à l'API** "Offres d'emploi v2" 
4. **Obtenir les identifiants OAuth 2.0** (Client ID et Client Secret)

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
Puis éditez le fichier `.env` avec vos identifiants OAuth 2.0 :
```
FRANCE_TRAVAIL_CLIENT_ID=votre_client_id
FRANCE_TRAVAIL_CLIENT_SECRET=votre_client_secret
```

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

- **Backend (Proxy API)** : Un serveur Express qui :
  - Implémente l'authentification OAuth 2.0 avec le flux "Client Credentials"
  - Gère la récupération et le renouvellement automatique des tokens d'accès
  - Résout les problèmes de CORS (Cross-Origin Resource Sharing)
  - Sécurise les identifiants OAuth en les gardant côté serveur
  - Gère les limites de quota API et les erreurs 429 (Too Many Requests)

- **Frontend (Application React)** : Interface utilisateur construite avec React, qui communique uniquement avec notre serveur proxy.

## Gestion des tokens

L'application met en œuvre les bonnes pratiques de gestion des tokens d'accès :

- Les tokens d'accès sont stockés uniquement en mémoire côté serveur
- Le serveur vérifie automatiquement la validité des tokens avant chaque requête
- Les tokens expirés sont renouvelés automatiquement
- Une marge de sécurité est appliquée pour éviter les problèmes liés aux décalages d'horloge

## Technologies utilisées

### Backend
- Node.js
- Express
- Axios
- OAuth 2.0
- Cors
- Dotenv

### Frontend
- React 18
- Axios pour les requêtes API
- Tailwind CSS pour le style
- React Router pour la navigation
- React Query pour la gestion des données

## Notes de sécurité

- Les identifiants OAuth ne doivent jamais être exposés côté client
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

## Dépannage

- **Erreur 401 Unauthorized** : Vérifiez que vos identifiants OAuth sont corrects et que vous avez bien souscrit à l'API "Offres d'emploi v2"
- **Erreur 429 Too Many Requests** : Vous avez dépassé votre quota d'appels API. L'application implémente automatiquement le mécanisme de Retry-After
- **Erreur CORS** : Assurez-vous d'utiliser le serveur proxy et non d'appeler l'API directement depuis le frontend
