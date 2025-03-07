# Job Search France Travail API

Application React de recherche d'emploi personnalisée pour les développeurs web utilisant l'API France Travail.

## Architecture

L'application utilise une architecture en trois parties :

1. **Frontend** : Application React utilisant Tailwind CSS pour l'interface utilisateur
2. **Serveur intermédiaire** : Serveur Node.js qui gère l'authentification OAuth 2.0 avec l'API France Travail
3. **Nginx** : Serveur web qui sert les fichiers statiques du frontend en production

## Prérequis

- Node.js (v14+)
- Compte développeur France Travail avec identifiants OAuth
- Docker et Docker Compose (pour la production)

## Installation

1. Clonez le dépôt :
```bash
git clone https://github.com/creach-t/job-search-france-travail-api.git
cd job-search-france-travail-api
```

2. Installez les dépendances :
```bash
npm install
```

3. Installez les dépendances du serveur :
```bash
npm install cors dotenv express
```

4. Configurez les variables d'environnement :
```bash
# Créez le fichier .env à la racine
cp .env.example .env
# Créez le fichier .env dans le dossier server
cp server/.env.example server/.env
```

5. Éditez les fichiers `.env` et `server/.env` avec vos identifiants France Travail
   
## Utilisation

### Développement

Pour lancer l'application en mode développement (frontend + serveur) :

```bash
npm run dev
```

Cela lancera :
- Le serveur backend sur le port 4059, accessible sur http://localhost:4059
- L'application React sur le port 3000, accessible sur http://localhost:3000

### Production avec Docker

Pour déployer en production avec Docker :

1. Assurez-vous d'avoir Docker et Docker Compose installés

2. Construisez l'application React :
```bash
npm run build
```

3. Utilisez le script de démarrage pour lancer les conteneurs Docker :
```bash
chmod +x start-docker.sh
./start-docker.sh
```

L'application sera disponible sur :
- Frontend : http://localhost:4060 (servi par Nginx)
- Backend API : http://localhost:4059

#### Configuration Docker

La configuration Docker comprend deux services :
- `backend` : Serveur Node.js qui gère l'API
- `frontend` : Serveur Nginx qui sert l'application React

Pour arrêter l'application :
```bash
docker-compose down
```

## Configuration Nginx

La configuration Nginx se trouve dans le fichier `nginx/nginx.conf`. Cette configuration :
- Sert l'application React sur le port 4060
- Redirige les requêtes API vers le serveur backend sur le port 4059
- Configure les en-têtes pour une mise en cache optimale des fichiers statiques

Si vous souhaitez modifier les ports ou d'autres paramètres Nginx, modifiez ce fichier.

## Fonctionnalités

- Recherche d'offres d'emploi pour les développeurs web
- Filtres par localisation, type de contrat, expérience, etc.
- Sauvegarde des offres préférées
- Autocomplétion des communes françaises
- Visualisation détaillée des offres

## Structure du projet

```
├── build               # Fichiers construits de l'application React
├── nginx               # Configuration Nginx
│   └── nginx.conf      # Configuration du serveur web
├── public              # Fichiers statiques
├── server              # Serveur intermédiaire Node.js
│   ├── server.js       # Implémentation du serveur
│   └── .env.example    # Exemple de variables d'environnement
├── src                 # Code source React
│   ├── components      # Composants React
│   ├── context         # Contextes React (pour les états globaux)
│   ├── hooks           # Hooks personnalisés
│   ├── pages           # Pages principales
│   ├── services        # Services pour les appels API
│   └── utils           # Utilitaires et constantes
├── .env.example        # Exemple de variables d'environnement
├── .env.docker         # Variables d'environnement pour Docker
├── Dockerfile          # Configuration pour Docker
├── docker-compose.yml  # Configuration Docker Compose
└── start-docker.sh     # Script pour démarrer avec Docker
```

## API

L'application utilise :

1. **API France Travail** : Pour les offres d'emploi
2. **API Geo.gouv.fr** : Pour les données géographiques (communes)

## License

MIT
