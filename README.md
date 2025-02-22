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
# API France Travail
REACT_APP_API_TOKEN=your_api_token_here
```

4. Lancer l'application en mode développement
```bash
npm start
```

L'application sera disponible à l'adresse [http://localhost:3000](http://localhost:3000)

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

3. **Vérifiez votre token API**
   - Assurez-vous que votre token API est valide et récent
   - Les tokens expirés peuvent causer des problèmes d'authentification

### Autres problèmes courants

- **Aucun résultat** : Essayez des termes plus génériques
- **Erreur 401/403** : Vérifiez votre token API et sa validité
- **Erreur 429** : Vous avez dépassé la limite de requêtes, attendez un moment

## Technologies utilisées

- React 18
- Axios pour les requêtes API
- Tailwind CSS pour le style
- React Router pour la navigation
- React Query pour la gestion des données

## Optimisations

Cette application a été optimisée pour éviter les erreurs 431 :

- Limitations strictes sur la taille des paramètres de recherche
- Réduction du nombre de compétences sélectionnables à 2 maximum
- Simplification des en-têtes HTTP
- Réduction du nombre de résultats pour alléger les réponses

## Limites connues

En raison des optimisations pour éviter l'erreur 431 :

- Le nombre de résultats est limité à 5 à la fois
- Les termes de recherche sont limités à 20 caractères
- Seulement 2 compétences peuvent être sélectionnées simultanément
- Certaines fonctionnalités avancées de l'API peuvent ne pas être accessibles