# Recherche d'emploi avec l'API France Travail

Application React personnalisée pour la recherche d'offres d'emploi de développeur web utilisant l'API France Travail.

## Fonctionnalités

- Recherche d'offres d'emploi par mots-clés, localisation et autres critères
- Filtres spécifiques pour les développeurs web (technologies, expérience, etc.)
- Interface utilisateur moderne et réactive
- Visualisation des résultats avec des informations détaillées
- Authentification OAuth 2.0 avec le flux "Client Credentials"

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

### Problèmes d'authentification OAuth 2.0

Si vous rencontrez des erreurs d'authentification (401, 403) :

1. **Vérifiez vos identifiants**
   - Assurez-vous que votre Client ID et Client Secret sont corrects
   - Vérifiez qu'ils sont bien copiés sans espaces supplémentaires

2. **Vérifiez les droits de l'application**
   - Confirmez que vous avez bien souscrit à l'API "Offres d'emploi v2"
   - Vérifiez que le scope demandé correspond à "api_offresdemploiv2"

3. **Consultez les logs de l'application**
   - L'application enregistre les erreurs d'authentification dans la console
   - Utilisez les outils de développement de votre navigateur pour les consulter

## Technologies utilisées

- React 18
- Axios pour les requêtes API
- Tailwind CSS pour le style
- React Router pour la navigation
- React Query pour la gestion des données
- OAuth 2.0 pour l'authentification sécurisée

## Optimisations

Cette application a été optimisée pour éviter les erreurs 431 :

- Limitations strictes sur la taille des paramètres de recherche
- Réduction du nombre de compétences sélectionnables à 2 maximum
- Simplification des en-têtes HTTP
- Réduction du nombre de résultats pour alléger les réponses
- Gestion du cache des tokens OAuth 2.0

## Limites connues

En raison des optimisations pour éviter l'erreur 431 :

- Le nombre de résultats est limité à 5 à la fois
- Les termes de recherche sont limités à 20 caractères
- Seulement 2 compétences peuvent être sélectionnées simultanément
- Certaines fonctionnalités avancées de l'API peuvent ne pas être accessibles