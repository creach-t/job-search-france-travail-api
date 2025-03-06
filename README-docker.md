# Configuration Docker pour l'API France Travail

Ce document décrit comment utiliser Docker avec l'application de recherche d'emploi France Travail.

## Prérequis

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Compte développeur France Travail avec identifiants OAuth

## Configuration

1. Créez le fichier d'environnement à partir de l'exemple :

```bash
cp server/.env.example server/.env
```

2. Éditez le fichier `server/.env` avec vos identifiants France Travail :

```
FT_CLIENT_ID=votre_client_id
FT_CLIENT_SECRET=votre_client_secret
```

## Utilisation

### Mode développement

Le mode développement permet d'avoir un hot-reload et de travailler sur le code en temps réel.

```bash
docker-compose up app-dev
```

- Front-end React : http://localhost:3000
- Serveur API : http://localhost:3001

### Mode production

Le mode production exécute l'application optimisée pour la performance.

```bash
docker-compose up app-prod
```

- Application (front + back) : http://localhost:3001

## Structure des fichiers Docker

- `Dockerfile` : Configuration pour la build de production
- `Dockerfile.dev` : Configuration pour le développement
- `docker-compose.yml` : Orchestration des services
- `.dockerignore` : Fichiers exclus des images Docker

## Commandes utiles

### Reconstruction des images

```bash
docker-compose build
```

### Afficher les logs

```bash
docker-compose logs -f
```

### Arrêter les conteneurs

```bash
docker-compose down
```

### Supprimer les volumes

```bash
docker-compose down -v
```

### Entrer dans un conteneur

```bash
docker exec -it job-search-dev sh
```

## Notes importantes

- En mode développement, le code local est monté en volume dans le conteneur, permettant ainsi la modification en temps réel.
- Les node_modules sont installés dans le conteneur et ne sont pas synchronisés avec votre machine locale.
- Les variables d'environnement sensibles (comme les identifiants France Travail) doivent être sécurisées et ne jamais être incluses dans les images Docker.