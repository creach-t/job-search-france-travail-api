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
4. **Obtenir un client ID et client secret** pour l'API

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
Puis éditez le fichier `.env` pour ajouter vos identifiants d'API :
```
# API France Travail
REACT_APP_API_TOKEN=your_api_token_here

# Nécessaire uniquement pour le serveur proxy
FRANCE_TRAVAIL_CLIENT_ID=your_client_id_here
FRANCE_TRAVAIL_CLIENT_SECRET=your_client_secret_here
```

## Lancement

Cette application utilise un serveur proxy pour éviter les erreurs 431 "Request Header Fields Too Large". Vous devez donc lancer deux serveurs :

1. Lancer le serveur proxy (dans un premier terminal)
```bash
node server.js
```

2. Lancer l'application React en mode développement (dans un second terminal)
```bash
npm start
```

L'application sera disponible à l'adresse [http://localhost:3000](http://localhost:3000)

## Résolution des problèmes

### Erreur 431 Request Header Fields Too Large

Cette erreur se produit lorsque les en-têtes HTTP dépassent la taille maximale autorisée. Pour résoudre ce problème :

1. Simplifiez vos critères de recherche
2. Utilisez moins de mots-clés à la fois (3 maximum recommandé)
3. Essayez des termes de recherche plus courts
4. Assurez-vous que le serveur proxy est actif

### Problèmes d'authentification

Si vous rencontrez des problèmes d'authentification :

1. Vérifiez que vos clés API sont correctes dans le fichier `.env`
2. Assurez-vous que votre token n'a pas expiré
3. Vérifiez les logs du serveur proxy pour plus d'informations

## Technologies utilisées

- React 18
- Axios pour les requêtes API
- Tailwind CSS pour le style
- React Router pour la navigation
- React Query pour la gestion des données
- Express.js pour le serveur proxy

## Optimisations

Cette application a été optimisée pour éviter les erreurs 431 :

- Utilisation d'un serveur proxy pour alléger les en-têtes
- Limitation stricte de la taille des paramètres de recherche
- Réduction du nombre de compétences sélectionnables
- Minimisation des en-têtes HTTP
