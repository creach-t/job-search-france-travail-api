# Recherche d'emploi avec l'API France Travail

Application React personnalisée pour la recherche d'offres d'emploi de développeur web utilisant l'API France Travail.

## Fonctionnalités

- Recherche d'offres d'emploi par mots-clés, localisation et autres critères
- Filtres spécifiques pour les développeurs web (technologies, expérience, etc.)
- Interface utilisateur moderne et réactive
- Visualisation des résultats avec des informations détaillées

## Prérequis

Pour utiliser cette application, vous devez :

1. **Créer un compte développeur** sur [https://pole-emploi.io/](https://pole-emploi.io/)
2. **Déclarer une application** dans votre espace développeur
3. **Souscrire à l'API** "Offres d'emploi v2" 
4. **Obtenir un token API** valide

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
Puis éditez le fichier `.env` pour ajouter votre token API :
```
REACT_APP_API_TOKEN=votre_token_api
```

4. Lancer l'application en mode développement
```bash
npm start
```

## Technologies utilisées

- React 18
- Axios pour les requêtes API
- Tailwind CSS pour le style
- React Router pour la navigation
- React Query pour la gestion des données

## Notes de sécurité

- L'application communique directement avec l'API France Travail
- Le token API est stocké dans un fichier `.env` qui ne doit jamais être commité dans le dépôt Git
- L'application implémente des limites pour éviter les erreurs 431 "Request Header Fields Too Large"
- Tous les paramètres de recherche sont limités en taille pour réduire le risque d'erreurs

## Obtenir un token API

Pour obtenir un token API France Travail :
1. Créez un compte sur [https://pole-emploi.io/](https://pole-emploi.io/)
2. Créez une application dans votre espace développeur
3. Souscrivez à l'API "Offres d'emploi v2"
4. Utilisez le flux OAuth 2.0 "Client Credentials" pour obtenir un token
5. Placez ce token dans votre fichier `.env`
