# CLAUDE.md - Guide de Développement

## Vue d'ensemble du projet

**Job Search France Travail API** est une application web de recherche d'offres d'emploi qui utilise l'API officielle de France Travail (anciennement Pôle Emploi). L'application permet aux utilisateurs de rechercher des offres d'emploi avec des filtres avancés, de sauvegarder leurs offres favorites et de visualiser les détails complets des offres.

### Stack Technique

**Frontend:**
- React 18.2.0
- React Router DOM 6.21.0
- TailwindCSS 3.3.5
- @tanstack/react-query 4.35.3
- @headlessui/react 1.7.18
- @heroicons/react 2.1.1
- Axios 1.7.9

**Backend:**
- Node.js avec Express 4.21.2
- CORS pour la gestion des requêtes cross-origin
- Axios pour les appels API externes
- dotenv pour la gestion des variables d'environnement

**Infrastructure:**
- Docker & Docker Compose
- Nginx (serveur de fichiers statiques en production)
- Traefik (reverse proxy avec SSL automatique)

## Architecture

### Structure des dossiers

```
├── src/                      # Code source frontend
│   ├── components/           # Composants React réutilisables
│   │   ├── JobCard/         # Composants de la carte d'offre
│   │   ├── JobList/         # Liste des offres
│   │   ├── SearchForm/      # Formulaire de recherche
│   │   ├── Navbar/          # Navigation
│   │   ├── Footer/          # Pied de page
│   │   └── ui/              # Composants UI génériques
│   ├── pages/               # Pages principales
│   │   ├── HomePage.js      # Page d'accueil avec recherche
│   │   ├── JobDetailsPage.js # Détails d'une offre
│   │   ├── SavedJobsPage.js # Offres sauvegardées
│   │   └── NotFoundPage.js  # Page 404
│   ├── services/            # Services d'appel API
│   │   ├── api.js          # Client API principal
│   │   ├── communeService.js # Service de recherche de communes
│   │   └── geolocationService.js # Service de géolocalisation
│   ├── hooks/               # Custom React hooks
│   │   ├── useJobs.js      # Hook pour les offres d'emploi
│   │   └── useGeolocation.js # Hook de géolocalisation
│   ├── context/             # Context API React
│   │   └── AppContext.js   # Contexte global de l'application
│   └── utils/               # Utilitaires et constantes
│       └── constants.js    # Constantes de l'application
├── server/                  # Code source backend
│   ├── server.js           # Serveur Express principal
│   └── routes/             # Routes API (mock non utilisé)
├── public/                  # Fichiers statiques
├── nginx/                   # Configuration Nginx
└── build/                   # Build de production (généré)
```

### Flux de données

1. **Frontend → Backend:** Les requêtes passent par le serveur Express (proxy) pour sécuriser les credentials
2. **Backend → API France Travail:** Authentification OAuth2, récupération des données
3. **Backend → API Geo:** Récupération des informations géographiques des communes
4. **Backend → Frontend:** Données formatées et filtrées

## APIs Externes Utilisées

### 1. API France Travail (Offres d'Emploi)

**Documentation:** [francetravail.io](https://francetravail.io/produits-partages/catalogue)

**Base URL:** `https://api.francetravail.io/partenaire/offresdemploi/v2`

**Authentification:** OAuth2 Client Credentials Flow

**Endpoints utilisés:**
- `POST /connexion/oauth2/access_token` - Obtention du token
- `GET /offres/search` - Recherche d'offres
- `GET /offres/{id}` - Détails d'une offre

**Paramètres de recherche disponibles:**
- `motsCles` - Mots-clés de recherche
- `commune` - Code INSEE de la commune
- `distance` - Rayon de recherche en km
- `typeContrat` - Type de contrat (CDI, CDD, etc.)
- `experience` - Niveau d'expérience requis
- `qualification` - Niveau de qualification
- `tempsPlein` - Temps plein/partiel

**Limitations:**
- Token valide 30 minutes
- Limite de 20 caractères pour les mots-clés
- Rate limiting (non documenté dans le code)

### 2. API Geo (Découpage Administratif)

**Documentation:** [geo.api.gouv.fr](https://geo.api.gouv.fr/decoupage-administratif/communes)

**Base URL:** `https://geo.api.gouv.fr`

**Authentification:** Aucune (API publique)

**Endpoints utilisés:**
- `GET /communes?nom={query}` - Recherche de communes
- `GET /communes/{code}` - Détails d'une commune

**Paramètres:**
- `nom` - Nom de la commune à rechercher
- `fields` - Champs à retourner
- `boost` - Critère de tri (population)
- `limit` - Nombre maximum de résultats

**Format de données:**
- Code INSEE
- Nom de la commune
- Codes postaux
- Population
- Géolocalisation (latitude, longitude)

## Configuration Requise

### Variables d'environnement

**Fichier `.env` (racine):**
```env
# Ports
REACT_APP_PORT=3000
SERVER_PORT=4059

# URLs
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:4059/api

# Mode
NODE_ENV=development
```

**Fichier `server/.env`:**
```env
# API France Travail
FT_CLIENT_ID=votre_client_id
FT_CLIENT_SECRET=votre_client_secret
FT_SCOPE=api_offresdemploiv2 o2dsoffre
FT_TOKEN_URL=https://entreprise.francetravail.fr/connexion/oauth2/access_token
FT_BASE_URL=https://api.francetravail.io/
```

## Fonctionnalités Implémentées

### ✅ Recherche d'offres
- Recherche par mots-clés
- Filtrage par localisation (avec autocomplétion)
- Distance de recherche paramétrable
- Filtres avancés (expérience, type de contrat, qualification, temps de travail)
- Limitation intelligente des paramètres pour éviter les erreurs 431

### ✅ Affichage des résultats
- Liste paginée des offres
- Cartes d'offres avec informations clés
- Tags visuels pour type de contrat, expérience, etc.
- Indicateurs spéciaux (offre en tension, accessible TH, alternance)

### ✅ Détails des offres
- Vue complète d'une offre d'emploi
- Informations entreprise
- Localisation avec lien Google Maps
- Bouton de postulation (URL externe ou informations de contact)
- Sauvegarde d'offres

### ✅ Sauvegarde locale
- Système de favoris avec localStorage
- Page dédiée aux offres sauvegardées
- Synchronisation automatique entre les pages

### ✅ Gestion des erreurs
- Gestion gracieuse des erreurs API
- Messages d'erreur utilisateur-friendly
- Retry automatique en cas d'expiration de token
- Validation des paramètres de recherche

## Bonnes Pratiques de Développement

### Code Style

1. **Composants React:**
   - Utiliser des composants fonctionnels avec hooks
   - Extraire les composants complexes en sous-composants
   - Props destructuring pour la lisibilité

2. **État et données:**
   - React Query pour la gestion du cache et des requêtes
   - localStorage pour la persistance locale
   - Context API pour l'état global (si nécessaire)

3. **Styling:**
   - TailwindCSS avec classes utilitaires
   - Responsive design (mobile-first)
   - Couleurs personnalisées dans tailwind.config.js

4. **Gestion d'erreurs:**
   - Try-catch dans toutes les fonctions async
   - Messages d'erreur clairs pour l'utilisateur
   - Logging console pour le debug

### Commandes Utiles

```bash
# Développement
npm run dev          # Lance frontend + backend en parallèle
npm start            # Frontend uniquement
npm run server       # Backend uniquement avec hot reload

# Build
npm run build        # Build de production

# Docker
docker-compose up -d              # Lancer en production
docker-compose logs -f backend    # Voir les logs backend
docker-compose down               # Arrêter les services
```

## Problèmes Connus et Solutions

### 1. Erreur 431 (Request Header Fields Too Large)

**Cause:** Paramètres de recherche trop longs (notamment mots-clés et compétences)

**Solution actuelle:**
- Limitation à 20 caractères pour les mots-clés
- Maximum 2 compétences sélectionnables
- Validation côté client avant envoi

### 2. Gestion du token OAuth2

**Cause:** Token France Travail expire après 30 minutes

**Solution actuelle:**
- Cache du token côté serveur avec timestamp d'expiration
- Renouvellement automatique 60 secondes avant expiration
- Retry avec nouveau token en cas d'erreur 401

### 3. Cas spécial Paris

**Problème:** L'API Geo retourne Paris avec un code global, mais France Travail nécessite des codes d'arrondissement

**Solution actuelle:**
- Transformation automatique de Paris en "Paris 1er arrondissement" (code 75101)
- Suggestion d'autres arrondissements dans l'autocomplétion
- Mapping personnalisé des codes INSEE

## Sécurité

### ✅ Implémenté
- CORS configuré avec whitelist d'origines
- Credentials API stockés uniquement côté serveur
- Aucune exposition des secrets au frontend
- Validation des entrées utilisateur

### ⚠️ À améliorer
- Ajouter un rate limiting côté serveur
- Implémenter une vraie gestion de sessions
- Ajouter des headers de sécurité (helmet.js)
- Sanitization des données HTML (description des offres)

## Tests

### À développer
Actuellement, aucun test n'est implémenté. Recommandations:
- Tests unitaires avec Jest + React Testing Library
- Tests d'intégration pour les appels API
- Tests E2E avec Cypress ou Playwright
- Coverage minimum à viser: 70%

## Performance

### Optimisations actuelles
- React Query pour le cache des requêtes
- Lazy loading des composants (à implémenter)
- Build optimisé avec Webpack (via create-react-app)
- Nginx pour servir les fichiers statiques en production

### Améliorations possibles
- Implémenter React.lazy() pour le code splitting
- Ajouter un service worker pour le mode offline
- Optimiser les images (WebP, lazy loading)
- Implémenter une pagination côté serveur

## Déploiement

### Production
L'application est conçue pour être déployée avec Docker:
1. Build du frontend: `npm run build`
2. Copie du build dans le container backend
3. Backend sert l'API + fichiers statiques
4. Nginx sert le frontend avec routing
5. Traefik gère le SSL et le reverse proxy

### Domaines
- Frontend: `devjobs.creachtheo.fr`
- Backend API: `api.devjobs.creachtheo.fr`

## Contribution

### Workflow Git
1. Créer une branche depuis `main`: `git checkout -b feature/nom-feature`
2. Développer et commiter régulièrement
3. Pousser et créer une Pull Request
4. Review et merge dans `main`

### Convention de nommage
- Branches: `feature/`, `fix/`, `refactor/`, `docs/`
- Commits: messages clairs en français, impératif présent
- Co-authored-by pour les contributions assistées

## Ressources

### Documentation officielle
- [API France Travail](https://francetravail.io/produits-partages/catalogue)
- [API Geo](https://geo.api.gouv.fr/decoupage-administratif)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [React Query](https://tanstack.com/query/latest)

### Outils de développement
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Postman](https://www.postman.com/) pour tester les APIs
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

---

**Dernière mise à jour:** Février 2026
