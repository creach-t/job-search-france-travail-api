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
│   │   │   ├── index.js     # Carte principale
│   │   │   ├── ApplyButton.js # Bouton postuler (multi-mode)
│   │   │   ├── JobTags.js   # Tags visuels
│   │   │   └── SaveButton.js # Sauvegarde favoris
│   │   ├── JobList/         # Liste des offres
│   │   ├── SearchForm/      # Formulaire de recherche
│   │   │   ├── index.js     # Conteneur principal du formulaire
│   │   │   ├── MainSearchFields.js    # Champs principaux (métier, lieu)
│   │   │   ├── AdvancedSearchFields.js # Filtres avancés (5 selects)
│   │   │   ├── MetierAutocomplete.js  # Autocomplete ROME
│   │   │   ├── SearchButton.js
│   │   │   └── options.js   # Options des selects
│   │   ├── Navbar/          # Navigation
│   │   ├── Footer/          # Pied de page
│   │   └── ui/              # Composants UI génériques
│   ├── pages/               # Pages principales
│   │   ├── HomePage.js      # Page d'accueil — recherche + pagination + filtre salaire
│   │   ├── JobDetailsPage.js # Détails d'une offre
│   │   ├── SavedJobsPage.js # Offres sauvegardées
│   │   └── NotFoundPage.js  # Page 404
│   ├── services/            # Services d'appel API
│   │   ├── api.js          # Client API principal (range dynamique)
│   │   ├── communeService.js # Service de recherche de communes
│   │   └── geolocationService.js # Service de géolocalisation
│   ├── hooks/               # Custom React hooks
│   │   ├── useJobs.js      # Hook useSearchJobs (mode normal)
│   │   ├── useAllJobs.js   # Hook useAllJobs (mode filtre salaire global)
│   │   └── useGeolocation.js # Hook de géolocalisation
│   ├── context/             # Context API React
│   │   └── AppContext.js   # Contexte global de l'application
│   └── utils/               # Utilitaires et constantes
│       ├── constants.js    # Constantes + PAGE_SIZE_OPTIONS + DEFAULTS
│       └── salaryUtils.js  # Conversion et formatage des salaires
├── server/                  # Code source backend
│   ├── server.js           # Serveur Express principal
│   ├── rome-codes.json     # Base de données codes ROME (métiers)
│   └── routes/             # Routes API
├── public/                  # Fichiers statiques
├── nginx/                   # Configuration Nginx
└── build/                   # Build de production (généré)
```

### Flux de données

1. **Frontend → Backend:** Les requêtes passent par le serveur Express (proxy) pour sécuriser les credentials
2. **Backend → API France Travail:** Authentification OAuth2, récupération des données + extraction `Content-Range`
3. **Backend → API Geo:** Récupération des informations géographiques des communes
4. **Backend → Frontend:** Données formatées avec `total` réel inclus dans la réponse

### Modes de chargement des données (HomePage)

L'application bascule entre deux modes selon la présence d'un filtre salaire (`hasSalaryFilter`) :

- **Mode normal** (`useSearchJobs`) : pagination API directe, une page à la fois
- **Mode filtre salaire** (`useAllJobs`) : charge toutes les pages en parallèle via `useQueries`, filtre côté client, pagine localement

```
hasSalaryFilter = false  →  useSearchJobs  →  pagination API (range 0-49, 50-99, ...)
hasSalaryFilter = true   →  useAllJobs     →  8 requêtes parallèles → filtre → pagination locale
```

## APIs Externes Utilisées

### 1. API France Travail (Offres d'Emploi)

**Documentation:** [francetravail.io](https://francetravail.io/produits-partages/catalogue)

**Base URL:** `https://api.francetravail.io/partenaire/offresdemploi/v2`

**Authentification:** OAuth2 Client Credentials Flow

**Endpoints utilisés:**
- `POST /connexion/oauth2/access_token` - Obtention du token
- `GET /offres/search` - Recherche d'offres (avec paramètre `range`)
- `GET /offres/{id}` - Détails d'une offre
- `GET /rome/v1/metier/{code}` - Détails d'un métier ROME

**Paramètres de recherche disponibles:**
- `motsCles` - Mots-clés de recherche
- `commune` - Code INSEE de la commune
- `distance` - Rayon de recherche en km (`'0'` = commune exacte)
- `typeContrat` - Type de contrat (CDI, CDD, etc.)
- `experience` - Niveau d'expérience requis
- `qualification` - Niveau de qualification
- `tempsPlein` - Temps plein/partiel
- `codeROME` - Code ROME du métier (recherche précise)
- `range` - Pagination (ex: `"0-49"`, `"50-99"`, max `"1000-1149"`)

**Limitations:**
- Token valide 30 minutes (renouvelé automatiquement)
- Maximum **1 150 offres accessibles** par recherche (range max `0-1149`)
- Le total réel est extrait du header `Content-Range` (format: `"offres 0-149/579175"`)
- Pas de filtre salaire natif → filtrage côté client

### 2. API Geo (Découpage Administratif)

**Documentation:** [geo.api.gouv.fr](https://geo.api.gouv.fr/decoupage-administratif/communes)

**Base URL:** `https://geo.api.gouv.fr`

**Authentification:** Aucune (API publique)

**Endpoints utilisés:**
- `GET /communes?nom={query}` - Recherche de communes
- `GET /communes/{code}` - Détails d'une commune

**Format de données:**
- Code INSEE, Nom, Codes postaux, Population, Géolocalisation

### 3. API ROME (Métiers) — locale

Les codes ROME sont stockés dans `server/rome-codes.json` et recherchés localement (pas d'appel API externe pour la liste). L'endpoint `GET /rome/v1/metier/{code}` est utilisé pour les détails d'un métier spécifique.

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
- Recherche par mots-clés (max 20 caractères, validé côté client)
- Autocomplétion des métiers via codes ROME (`MetierAutocomplete`)
- Filtrage par localisation avec autocomplétion (API Geo)
- Distance de recherche paramétrable (`'0'` = commune exacte, géré correctement)
- Filtres avancés via 5 selects : Expérience, Contrat, Qualification, Temps de travail, Salaire min

### ✅ Pagination avancée
- Affichage du total réel d'offres (extrait du `Content-Range` de l'API)
- Pagination navigable (boutons page précédente/suivante + indicateur "X–Y sur Z")
- Sélecteur du nombre d'offres par page : **10 / 25 / 50 / 100 / 150**
- Persistance de la page et du nombre par page via `sessionStorage`
- Limite de 1 150 offres accessibles avec message user-friendly (sans mention de l'API)
- Calcul dynamique du paramètre `range` : `"${page * pageSize}-${page * pageSize + pageSize - 1}"`

### ✅ Filtre salaire global
- Le filtre salaire agit sur **toutes les offres** (pas seulement la page courante)
- En mode filtre salaire : chargement de toutes les pages en parallèle (`useAllJobs`)
- Indicateur de progression : "Chargement… (3/8 pages)"
- Filtrage côté client sur salaire annualisé (`convertToAnnualSalary`)
- Le total affiché = nombre d'offres filtrées (ex: "22 offres correspondent à votre salaire minimum")

### ✅ Conversion de salaires
- Normalisation en €/mois brut pour affichage uniforme
- Détection de période avec word boundaries regex (évite les faux positifs comme "dans", "plan")
- Support du format `"Mensuel/Horaire/Annuel de X Euros [à Y Euros] sur N mois"`
- Heuristique : `montant >= 5000` dans un contexte mensuel → total à diviser par `nbMois`
- Support des montants décimaux (`14.55 Euros`)
- Conversion horaire → mensuel : `montant × 151.67` (35h × 52/12 semaines)

### ✅ Bouton Postuler multi-mode (`ApplyButton`)
Détection automatique du mode de postulation par ordre de priorité :
1. `urlPostulation` → bouton "Postuler en ligne" (lien externe)
2. URL dans `courriel` → bouton "Postuler via le site" (certains recruteurs mettent un lien dans ce champ)
3. Email réel dans `courriel` → bouton "Postuler par email"
4. URL dans `commentaire` → bouton "Voir l'offre"
5. Téléphone → bouton "Postuler par téléphone"
6. Informations texte → modal "Infos de contact"

### ✅ Affichage des résultats
- Liste paginée des offres
- Cartes d'offres avec informations clés + salaire converti
- Tags visuels pour type de contrat, expérience, etc.
- Indicateurs spéciaux (offre en tension, accessible TH, alternance)

### ✅ Détails des offres
- Vue complète d'une offre d'emploi
- Informations entreprise
- Localisation avec lien Google Maps
- Bouton de postulation multi-mode (voir ci-dessus)
- Sauvegarde d'offres (favoris)

### ✅ Sauvegarde locale
- Système de favoris avec `localStorage`
- Page dédiée aux offres sauvegardées
- Synchronisation automatique entre les pages

### ✅ Gestion des erreurs
- Gestion gracieuse des erreurs API
- Messages d'erreur utilisateur-friendly
- Retry automatique en cas d'expiration de token (401 → regénération + retry)
- Validation des paramètres de recherche

## Constantes importantes (`src/utils/constants.js`)

```javascript
export const DEFAULTS = {
  SEARCH_LIMIT: 20,
  DEFAULT_DISTANCE: '10',
  DEFAULT_KEYWORDS: '',
  PAGE_SIZE: 50,         // Taille de page par défaut
  MAX_TOTAL: 1150        // Limite navigable (range max 0-1149)
};

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 150];
```

## Problèmes Connus et Solutions

### 1. Erreur 431 (Request Header Fields Too Large)

**Cause:** Paramètres de recherche trop longs

**Solution actuelle:**
- Limitation à 20 caractères pour les mots-clés
- Validation côté client avant envoi

### 2. Gestion du token OAuth2

**Cause:** Token France Travail expire après 30 minutes

**Solution actuelle:**
- Cache du token côté serveur avec timestamp d'expiration
- Renouvellement automatique 60 secondes avant expiration
- Retry avec nouveau token en cas d'erreur 401

### 3. Cas spécial Paris

**Problème:** L'API Geo retourne Paris avec un code global (75056), mais France Travail nécessite des codes d'arrondissement

**Solution actuelle:**
- Transformation automatique vers "Paris 1er arrondissement" (code 75101)
- Suggestion d'arrondissements dans l'autocomplétion
- Mapping personnalisé des codes INSEE

### 4. `distance: '0'` traité comme falsy

**Problème:** `distance || '10'` remplace `'0'` (commune exacte) par `'10'`

**Solution actuelle:**
- Comparaison explicite : `distance !== undefined && distance !== ''`
- Appliqué côté frontend (`SearchForm/index.js`, `api.js`) et backend (`server.js`)

### 5. Filtre salaire multi-pages

**Problème:** L'API FT ne supporte pas de filtre salaire natif → le filtrage par page n'affichait que les résultats filtrés sur une seule page

**Solution actuelle:**
- `useAllJobs` charge toutes les pages en parallèle avant filtrage
- Filtrage global sur `allJobs`, puis pagination locale

### 6. Format ambigu des salaires FT

**Problème:** `"Mensuel de 24000 Euros sur 12 mois"` — 24 000 peut être mensuel ou annuel

**Solution actuelle:**
- Heuristique : si `montant >= 5000` → diviser par `nbMois`
- Le format FT encode généralement le total annuel même dans "Mensuel"

## Bonnes Pratiques de Développement

### Code Style

1. **Composants React:**
   - Utiliser des composants fonctionnels avec hooks
   - Extraire les composants complexes en sous-composants
   - Props destructuring pour la lisibilité

2. **État et données:**
   - React Query pour la gestion du cache et des requêtes
   - `useQueries` pour les requêtes parallèles (chargement multi-pages)
   - `localStorage` pour la persistance des favoris
   - `sessionStorage` pour la persistance de navigation (page courante, taille de page, dernière recherche)

3. **Styling:**
   - TailwindCSS avec classes utilitaires
   - Responsive design (mobile-first)
   - Couleurs personnalisées dans `tailwind.config.js`

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
- Tests unitaires avec Jest + React Testing Library (priorité : `salaryUtils.js`)
- Tests d'intégration pour les appels API
- Tests E2E avec Cypress ou Playwright
- Coverage minimum à viser: 70%

## Performance

### Optimisations actuelles
- React Query pour le cache des requêtes (staleTime: 5 min)
- `useQueries` pour les requêtes parallèles en mode filtre salaire
- Build optimisé avec Webpack (via create-react-app)
- Nginx pour servir les fichiers statiques en production

### Améliorations possibles
- Implémenter React.lazy() pour le code splitting
- Ajouter un service worker pour le mode offline
- Optimiser les images (WebP, lazy loading)
- Dédupliquer les offres identiques lors du chargement multi-pages

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
