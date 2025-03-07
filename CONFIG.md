# Configuration des ports et variables d'environnement

## Structure des fichiers de configuration

Le projet utilise maintenant une structure de configuration à deux niveaux :

1. **Fichier `.env` à la racine** : Configuration générale, notamment les ports et les URLs
2. **Fichier `server/.env`** : Configuration spécifique au serveur, notamment les identifiants d'API

## Variables d'environnement principales

### Dans le fichier `.env` à la racine

```
# Configuration des ports
REACT_APP_PORT=3000
SERVER_PORT=4059

# URL de base du frontend et du backend
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:4059/api

# Mode (development ou production)
NODE_ENV=development
```

### Dans le fichier `server/.env`

```
# Configuration de l'API France Travail
FT_TOKEN_URL=...
FT_BASE_URL=...
FT_CLIENT_ID=...
FT_CLIENT_SECRET=...
FT_SCOPE=...
```

## Ordre de priorité

Les variables sont chargées dans l'ordre suivant :

1. Variables du fichier `.env` à la racine
2. Variables du fichier `server/.env` (qui peuvent écraser celles de la racine)

Ainsi, si vous définissez `SERVER_PORT` dans le fichier `.env` à la racine, cette valeur sera utilisée par le serveur au lieu de `PORT` défini dans `server/.env`.

## Comment configurer les ports

1. Copiez le fichier `.env.example` à la racine en `.env` :
   ```bash
   cp .env.example .env
   ```

2. Définissez les ports souhaités dans ce fichier :
   ```
   REACT_APP_PORT=3000
   SERVER_PORT=4059
   ```

3. Mettez à jour les URLs en conséquence :
   ```
   REACT_APP_FRONTEND_URL=http://localhost:3000
   REACT_APP_API_URL=http://localhost:4059/api
   ```

4. Copiez également `server/.env.example` en `server/.env` pour la configuration de l'API :
   ```bash
   cp server/.env.example server/.env
   ```

5. Il n'est pas nécessaire de modifier les ports dans `server/.env` car ils seront écrasés par ceux définis dans le fichier principal.

## Configuration Docker

Le projet inclut une configuration Docker qui utilise également les variables d'environnement des fichiers `.env`.

### Utilisation avec Docker

1. Assurez-vous d'avoir créé les fichiers `.env` à la racine et `server/.env` comme expliqué ci-dessus.

2. Dans le fichier `.env` à la racine, configurez les ports souhaités pour Docker :
   ```
   SERVER_PORT=4059
   ```

3. Lancez l'application avec Docker Compose :
   ```bash
   docker-compose up -d
   ```

### Comment ça fonctionne

- Le fichier `docker-compose.yml` charge d'abord le fichier `.env` à la racine, puis le fichier `server/.env`.
- Les ports exposés dans le conteneur sont automatiquement mappés aux ports spécifiés dans la variable `SERVER_PORT`.
- Si `SERVER_PORT` n'est pas défini, il utilisera la valeur par défaut (4059).

### Configuration avancée pour Docker

Si vous souhaitez utiliser des ports différents pour le développement local et pour Docker, vous pouvez créer un fichier `.env.docker` spécifique :

```bash
# Créez un fichier .env.docker
cp .env.example .env.docker
```

Puis modifiez les ports dans ce fichier et lancez Docker avec ce fichier :

```bash
docker-compose --env-file .env.docker up -d
```

## Remarques importantes

- Les variables spécifiques à React doivent commencer par `REACT_APP_` pour être accessibles dans le code du frontend.
- Les variables définies dans le fichier `.env` à la racine sont prioritaires sur celles définies dans `server/.env`.
- Le serveur utilise `SERVER_PORT` défini dans le fichier racine, ou `PORT` défini dans `server/.env` si `SERVER_PORT` n'existe pas.
- Pour Docker, assurez-vous que les ports spécifiés dans `SERVER_PORT` ne sont pas déjà utilisés sur votre machine hôte.
