# Recherche d'emploi avec l'API France Travail

Application React personnalisée pour la recherche d'offres d'emploi de développeur web utilisant l'API France Travail.

## Fonctionnalités

- Recherche d'offres d'emploi par mots-clés, localisation et autres critères
- Filtres spécifiques pour les développeurs web (technologies, expérience, etc.)
- Interface utilisateur moderne et réactive
- Visualisation des résultats avec des informations détaillées
- Authentification OAuth 2.0 avec le flux "Client Credentials"
- Contournement des problèmes CORS grâce à un proxy de développement

## Prérequis

Pour utiliser cette application, vous devez :

1. **Créer un compte développeur** sur [https://pole-emploi.io/](https://pole-emploi.io/)
2. **Déclarer une application** dans votre espace développeur
3. **Souscrire à l'API** "Offres d'emploi v2" 
4. **Obtenir un Client ID et un Client Secret** pour OAuth 2.0

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
Puis éditez le fichier `.env` pour ajouter vos identifiants OAuth 2.0 :
```
# Informations d'authentification OAuth 2.0 pour l'API France Travail
REACT_APP_CLIENT_ID=your_client_id_here
REACT_APP_CLIENT_SECRET=your_client_secret_here
```

4. Lancer l'application en mode développement
```bash
npm start
```

L'application sera disponible à l'adresse [http://localhost:3000](http://localhost:3000)

## Proxy CORS

Cette application utilise un proxy de développement pour éviter les problèmes CORS lors de l'appel à l'API d'authentification OAuth. Ce proxy est configuré dans le fichier `package.json` :

```json
{
  "proxy": "https://entreprise.francetravail.fr"
}
```

Cela permet aux requêtes d'authentification d'être acheminées via le serveur de développement de React, contournant ainsi les restrictions CORS du navigateur. **Cette configuration fonctionne uniquement en développement**.

Pour la production, vous devrez :
- Soit configurer votre serveur de production pour faire office de proxy
- Soit mettre en place un véritable serveur backend qui gère l'authentification OAuth

## Obtenir des identifiants OAuth 2.0

Pour obtenir un Client ID et un Client Secret pour l'API France Travail :

1. Créez un compte sur [https://pole-emploi.io/](https://pole-emploi.io/)
2. Rendez-vous dans votre espace développeur
3. Créez une nouvelle application
4. Souscrivez à l'API "Offres d'emploi v2"
5. Sélectionnez le mode d'authentification OAuth 2.0 (flux Client Credentials)
6. Notez le Client ID et le Client Secret générés
7. Placez ces identifiants dans le fichier `.env`

## Résolution des problèmes

### Erreur 431 Request Header Fields Too Large

Cette erreur se produit lorsque les en-têtes HTTP dépassent la taille maximale autorisée. Pour résoudre ce problème :

1. **Simplifiez vos critères de recherche**
   - Utilisez des mots-clés très courts (max 20 caractères)
   - Limitez-vous à 1-2 compétences à la fois
   - Évitez les termes de recherche trop longs
   - Utilisez des noms de villes courts

2. **Utilisez une navigation privée**
   - Les cookies peuvent augmenter la taille des en-têtes HTTP
   - Essayez d'utiliser une fenêtre de navigation privée pour réduire les cookies

### Problèmes CORS

Si vous rencontrez toujours des erreurs CORS malgré le proxy :

1. Vérifiez que vous utilisez bien des chemins relatifs pour les appels d'authentification
2. Redémarrez le serveur de développement (`npm start`)
3. Effacez le cache de votre navigateur
4. Assurez-vous que le proxy est correctement configuré dans `package.json`

### Problèmes d'authentification OAuth 2.0

Si vous rencontrez des erreurs d'authentification (401, 403) :

1. **Vérifiez vos identifiants**
   - Assurez-vous que votre Client ID et Client Secret sont corrects
   - Vérifiez qu'ils sont bien copiés sans espaces supplémentaires

2. **Vérifiez les droits de l'application**
   - Confirmez que vous avez bien souscrit à l'API "Offres d'emploi v2"
   - Vérifiez que le scope demandé correspond à "api_offresdemploiv2"

## Technologies utilisées

- React 18
- Axios pour les requêtes API
- Tailwind CSS pour le style
- React Router pour la navigation
- React Query pour la gestion des données
- OAuth 2.0 pour l'authentification sécurisée
- Proxy CORS pour le développement