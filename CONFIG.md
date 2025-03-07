# Configuration des ports et variables d'environnement

## Structure des fichiers de configuration

Le projet utilise une structure de configuration simplifiée avec deux fichiers `.env` :

1. **Fichier `.env` à la racine** : Configuration générale, notamment les ports et les URLs
2. **Fichier `server/.env`** : Configuration spécifique au serveur, notamment les identifiants d'API

## Configuration des ports

### Développement

Pour le développement, les ports par défaut sont :
- Frontend : **3000**
- Backend : **4059**

### Production

Pour la production, les ports sont :
- Frontend : **4060**
- Backend : **4059** (inchangé)

## Installation et configuration

1. Copiez les fichiers d'exemple :
   ```bash
   # Créez le fichier .env à la racine
   cp .env.example .env
   # Créez le fichier .env dans le dossier server
   cp server/.env.example server/.env
   ```

2. Pour le développement, gardez les valeurs par défaut.

3. Pour la production, modifiez le fichier `.env` à la racine en suivant les commentaires :
   ```
   # Changez ces valeurs
   REACT_APP_PORT=4060
   REACT_APP_FRONTEND_URL=http://localhost:4060
   NODE_ENV=production
   ```

4. Et modifiez également `server/.env` pour la production :
   ```
   FRONTEND_URL=http://localhost:4060
   NODE_ENV=production
   ```

## Docker

Pour Docker, les mêmes fichiers de configuration sont utilisés :

```bash
# Assurez-vous d'avoir configuré vos fichiers .env comme indiqué ci-dessus
docker-compose up -d
```

Le conteneur Docker exposera les ports définis dans les variables d'environnement :
- `SERVER_PORT` (4059 par défaut)
- `REACT_APP_PORT` (3000 en développement, 4060 en production)

## Remarques importantes

- Les variables spécifiques à React doivent commencer par `REACT_APP_` pour être accessibles dans le code du frontend.
- Les variables définies dans le fichier `.env` à la racine sont prioritaires sur celles définies dans `server/.env`.
- Si vous modifiez les ports, assurez-vous de mettre à jour les URLs correspondantes.
