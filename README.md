# Job Search France Travail API

Application React de recherche d'emploi personnalisée pour les développeurs web utilisant l'API France Travail.

## Architecture

L'application utilise une architecture en deux parties :

1. **Frontend** : Application React utilisant Tailwind CSS pour l'interface utilisateur
2. **Serveur intermédiaire** : Serveur Node.js qui gère l'authentification OAuth 2.0 avec l'API France Travail

## Prérequis

- Node.js (v14+)
- Compte développeur France Travail avec identifiants OAuth

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

5. Éditez les fichiers `.env` et `server/.env` avec vos identifiants France Travail et les ports souhaités
   
   Consultez le fichier [CONFIG.md](CONFIG.md) pour plus de détails sur la configuration des ports.

## Utilisation

### Développement

Pour lancer l'application en mode développement (frontend + serveur) :

```bash
npm run dev
```

Cela lancera :
- Le serveur backend sur le port défini dans `.env` (SERVER_PORT) ou `server/.env` (PORT), par défaut http://localhost:4059
- L'application React sur le port 3000, par défaut http://localhost:3000

### Production

Pour déployer en production :

1. Construisez l'application :
```bash
npm run build
```

2. Démarrez uniquement le serveur :
```bash
NODE_ENV=production npm run server
```

### Utilisation avec Docker

Le projet peut également être exécuté avec Docker :

1. Configurez les variables d'environnement comme indiqué ci-dessus
2. Lancez l'application avec Docker Compose :
```bash
docker-compose up -d
```

L'application sera disponible sur le port spécifié dans la variable `SERVER_PORT` du fichier `.env` (par défaut 4059).

Pour plus de détails sur la configuration Docker, voir [CONFIG.md](CONFIG.md).

## Fonctionnalités

- Recherche d'offres d'emploi pour les développeurs web
- Filtres par localisation, type de contrat, expérience, etc.
- Sauvegarde des offres préférées
- Autocomplétion des communes françaises
- Visualisation détaillée des offres

## Structure du projet

```
├── public             # Fichiers statiques
├── server             # Serveur intermédiaire Node.js
│   ├── server.js      # Implémentation du serveur
│   └── .env.example   # Exemple de variables d'environnement
├── src                # Code source React
│   ├── components     # Composants React
│   ├── context        # Contextes React (pour les états globaux)
│   ├── hooks          # Hooks personnalisés
│   ├── pages          # Pages principales
│   ├── services       # Services pour les appels API
│   └── utils          # Utilitaires et constantes
├── .env.example       # Exemple de variables d'environnement
├── Dockerfile         # Configuration pour Docker
└── docker-compose.yml # Configuration Docker Compose
```

## API

L'application utilise :

1. **API France Travail** : Pour les offres d'emploi
2. **API Geo.gouv.fr** : Pour les données géographiques (communes)

## License

MIT
