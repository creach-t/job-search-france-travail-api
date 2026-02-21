# CLAUDE.md - Guide de Développement

## Vue d'ensemble du projet

**Job Search France Travail API** est une application web de recherche d'offres d'emploi qui utilise l'API officielle de France Travail (anciennement Pôle Emploi). L'application permet aux utilisateurs de rechercher des offres d'emploi avec des filtres avancés, de sauvegarder leurs offres favorites et de visualiser les détails complets des offres.

### Stack Technique

| Couche | Technologies |
|--------|-------------|
| Frontend | React 18, React Router 6, TailwindCSS 3, React Query v4, Headless UI, Heroicons, Axios |
| Backend | Node.js, Express 4, Axios, dotenv |
| Infrastructure | Docker, Nginx, Traefik (SSL auto) |

## Architecture

### Structure des dossiers

```
├── src/                      # Code source frontend
│   ├── components/           # Composants React réutilisables
│   │   ├── JobCard/         # Composants de la carte d'offre
│   │   │   ├── index.js     # Carte principale (flex-col, mt-auto, CompanyPopover)
│   │   │   ├── ApplyButton.js # Bouton postuler (multi-mode, 5 priorités)
│   │   │   ├── JobTags.js   # Tags visuels (formatExperience intégré)
│   │   │   └── SaveButton.js # Sauvegarde favoris
│   │   ├── JobList/         # Liste des offres
│   │   ├── SearchForm/      # Formulaire de recherche
│   │   │   ├── index.js     # Conteneur principal du formulaire
│   │   │   ├── MainSearchFields.js    # Champs principaux (mots-clés, lieu, distance)
│   │   │   ├── AdvancedSearchFields.js # Filtres avancés (ROME + stacks + 5 selects)
│   │   │   ├── MetierAutocomplete.js  # Autocomplete ROME (dans filtres avancés)
│   │   │   ├── SearchButton.js
│   │   │   └── options.js   # Options des selects + stackGroups DevJobs
│   │   ├── Navbar/          # Navigation (avec toggle DevJobs/Classique)
│   │   ├── Footer/          # Pied de page
│   │   └── ui/              # Composants UI génériques
│   │       ├── CompanyPopover.js  # Popover infos entreprise (logo, desc, site, effectif)
│   │       ├── Spinner.js
│   │       └── Error.js
│   ├── pages/               # Pages principales
│   │   ├── HomePage.js      # Page d'accueil — recherche + pagination + filtre salaire + multi-stack
│   │   ├── JobDetailsPage.js # Détails complets d'une offre (toutes sections API)
│   │   ├── SavedJobsPage.js # Offres sauvegardées (suppression individuelle)
│   │   └── NotFoundPage.js  # Page 404
│   ├── services/            # Services d'appel API
│   │   ├── api.js          # Client API principal (range dynamique)
│   │   ├── communeService.js # Service de recherche de communes
│   │   └── geolocationService.js # Service de géolocalisation
│   ├── hooks/               # Custom React hooks
│   │   ├── useJobs.js      # Hook useSearchJobs (mode normal)
│   │   ├── useAllJobs.js   # Hook useAllJobs (mode filtre salaire global)
│   │   ├── useMultiStackJobs.js # Hook multi-stack (DevJobs — requêtes parallèles par techno)
│   │   └── useGeolocation.js # Hook de géolocalisation
│   ├── context/             # Context API React
│   │   └── AppContext.js   # Contexte global (favoris + devMode + homeSearchParams)
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

L'application bascule entre **trois modes** selon les paramètres de recherche actifs :

| Condition | Hook utilisé | Comportement |
|-----------|-------------|--------------|
| `hasMultiStack = true` (≥1 stack DevJobs) | `useMultiStackJobs` | 1 requête API par stack (150 résultats max), combinaison + déduplication côté client, pagination locale |
| `hasSalaryFilter = true` (filtre salaire, sans multi-stack) | `useAllJobs` | 8 requêtes parallèles → filtre côté client → pagination locale |
| Sinon (mode normal) | `useSearchJobs` | Pagination API directe, une page à la fois |

```
hasMultiStack = true   →  useMultiStackJobs  →  N requêtes /stack → combine → pagination locale
hasSalaryFilter = true →  useAllJobs         →  8 requêtes parallèles → filtre → pagination locale
sinon                  →  useSearchJobs      →  pagination API (range 0-49, 50-99, ...)
```

> **Priorité :** multi-stack > filtre salaire > mode normal. Les deux premiers modes ne sont pas cumulables.

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

**Champs utilisés dans l'objet Offre (`GET /offres/{id}`) :**

| Champ | Utilisé dans |
|-------|-------------|
| `intitule`, `description`, `dateCreation`, `dateActualisation` | JobCard + JobDetailsPage |
| `lieuTravail` (libelle, latitude, longitude, codePostal) | JobCard + JobDetailsPage |
| `entreprise` (nom, description, logo, url, entrepriseAdaptee) | CompanyPopover + section employeur |
| `typeContrat`, `typeContratLibelle`, `natureContrat` | Tags + InfoRow Contrat |
| `experienceLibelle`, `experienceCommentaire` | Tags (formaté) + section Profil |
| `qualificationLibelle`, `dureeTravailLibelle`, `dureeTravailLibelleConverti` | Tags + InfoRow Durée |
| `salaire` (libelle, commentaire, complement1, complement2) | Pill salaire + InfoRow Salaire |
| `competences[]` (libelle, exigence) | Section Profil — badges Exigé/Souhaité |
| `formations[]` (niveauLibelle, domaineLibelle, commentaire, exigence) | Section Profil |
| `qualitesProfessionnelles[]` (libelle, description) | Section Profil |
| `langues[]`, `permis[]` (libelle, exigence) | Section Profil |
| `outilsBureautiques` | Section Profil |
| `conditionExercice`, `complementExercice`, `contexteTravail` | InfoRow Conditions |
| `nombrePostes`, `deplacementLibelle`, `secteurActiviteLibelle` | InfoRows |
| `trancheEffectifEtab` | CompanyPopover + section Employeur |
| `alternance`, `accessibleTH`, `employeurHandiEngage`, `entrepriseAdaptee`, `offresManqueCandidats` | Tags |
| `contact` (nom, telephone, courriel, commentaire, urlPostulation, urlRecruteur) | ApplyButton + section Contact |

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

## Mode DevJobs

### Présentation

L'application propose deux modes d'utilisation :

- **Mode DevJobs** (par défaut) : interface orientée développeurs, navbar sombre, filtres de stacks technologiques, mot-clé "développeur" garanti si aucun critère saisi
- **Mode Classique** : recherche généraliste tous secteurs, navbar blanche, sans filtres de stacks

Le mode est persisté en `localStorage` (`devJobsMode`). Premier lancement → DevJobs par défaut.

### Toggle dans la Navbar

Le composant `ModeToggle` affiche **le mode de destination** (pas le mode courant) :

| Mode actif | Label du bouton | Effet du clic |
|------------|----------------|---------------|
| DevJobs (défaut) | "Classique" | Passe en mode Classique |
| Classique | "DevJobs" | Repasse en DevJobs |

Changer de mode **réinitialise les résultats et la recherche en cours** via `AppContext`.

### Contexte global (`AppContext.js`)

```javascript
// Favoris
const [savedJobs, setSavedJobs] = useState([]); // chargé depuis localStorage au mount
const saveJob        = (job)   => persist([...savedJobs, job]);
const removeJob      = (jobId) => persist(savedJobs.filter(j => j.id !== jobId));
const clearSavedJobs = ()      => persist([]);
const isJobSaved     = (jobId) => savedJobs.some(j => j.id === jobId);

// Mode dev
const [isDevMode, setIsDevMode] = useState(() => {
  const stored = localStorage.getItem('devJobsMode');
  return stored === null ? true : stored === 'true'; // DevJobs par défaut
});

// Recherche persistante (survit aux navigations)
const [homeSearchParams, setHomeSearchParams] = useState(() => {
  const s = sessionStorage.getItem('lastSearchParams');
  return s ? JSON.parse(s) : null;
});
const prevIsDevMode = useRef(isDevMode); // init avec valeur courante → pas de reset au montage
useEffect(() => {
  if (prevIsDevMode.current !== isDevMode) {
    prevIsDevMode.current = isDevMode;
    setHomeSearchParams(null);
    sessionStorage.removeItem('lastSearchParams');
  }
}, [isDevMode]);
const updateHomeSearchParams = (params) => {
  setHomeSearchParams(params);
  sessionStorage.setItem('lastSearchParams', JSON.stringify(params));
};

// Exposé : { savedJobs, saveJob, removeJob, clearSavedJobs, isJobSaved,
//            isDevMode, toggleDevMode, homeSearchParams, updateHomeSearchParams }
```

**Pourquoi `homeSearchParams` est dans le contexte** : `HomePage` est démonté à chaque navigation (vers `/saved`, `/job/:id`, etc.). Stocker la recherche en état local la perdait à chaque remontage. Le contexte `AppProvider` (toujours monté) persiste ces paramètres sans ré-exécuter de recherche automatique.

### Multi-stack DevJobs (`useMultiStackJobs.js`)

Sélectionner plusieurs stacks dans les filtres avancés déclenche **une requête API par stack** (max 150 résultats chacune), les résultats sont ensuite **combinés et dédupliqués par `job.id`** :

```javascript
// baseParams = searchParams sans keywords/stacks
// stacks = ['React', 'Vue', 'TypeScript']
// → 3 requêtes parallèles : searchJobs({...baseParams, keywords: 'React'}, 0, 150), etc.
```

Retourne : `{ allJobs, total, totalsPerStack, isLoading, isFetching, isError, loadedCount, queryCount }`

### Stacks disponibles (`options.js` → `stackGroups`)

| Groupe | Technologies |
|--------|-------------|
| Frontend | React, Vue, Angular, Next.js, TypeScript |
| Backend | Node.js, Python, Java, PHP, C#, Go, Rust |
| Mobile | Flutter, Swift, Kotlin |
| DevOps / Cloud | DevOps, Docker, AWS, Azure |

### Comportement du formulaire en DevJobs

- **Sans stack sélectionné :** si le champ mots-clés est vide → "développeur" utilisé comme fallback
- **Avec stacks :** les stacks fournissent leurs propres mots-clés, le champ texte est ignoré
- Les filtres de stacks sont **cachés en mode Classique** (`{isDevMode && ...}` dans `AdvancedSearchFields`)

## Points d'implémentation notables

### Persistance de la recherche

- `homeSearchParams` stocké dans `AppContext` (jamais démonté) + `sessionStorage` pour rechargement de page
- `currentPage` et `pageSize` dans état local de `HomePage`, initialisés depuis `sessionStorage`
- Changement de mode (`isDevMode`) → reset de `homeSearchParams` via `useEffect` avec `prevIsDevMode` ref (évite le reset au montage initial)

### Pagination
- `range` calculé dynamiquement : `"${page * pageSize}-${page * pageSize + pageSize - 1}"`
- Total réel extrait du header `Content-Range` de la réponse API
- Page et taille de page persistées via `sessionStorage`

### JobCard — mise en page
- `flex flex-col` + `mt-auto` sur la zone basse → salaire/boutons toujours alignés en bas quelle que soit la hauteur du contenu
- `line-clamp-2` sur le titre pour éviter les débordements
- Barre de couleur gradient en haut (`h-1 from-ft-blue to-ft-darkblue`)
- Salaire affiché en pill vert (connu) ou gris (non précisé)
- Date relative : `relativeTime()` — aujourd'hui / hier / Xj / X sem / X mois

### CompanyPopover (`src/components/ui/CompanyPopover.js`)
- Affiché sur le nom de l'entreprise dans `JobCard` et `JobDetailsPage`
- S'active uniquement si des infos supplémentaires existent (`logo`, `description`, `url`, ou `trancheEffectifEtab`)
- Clic → popover avec logo (ou icône fallback), nom, effectif, description (`line-clamp-4`), lien site
- Fermeture au clic extérieur via `useEffect` + `mousedown`
- Chevron ▾ discret visible au survol uniquement

### JobTags — formatage expérience
```javascript
const formatExperience = (exp) => {
  if (/débutant/i.test(exp)) return 'Débutant';
  const m = exp.match(/(\d+)\s*[Aa]n/);
  if (m) return `${n} an${n > 1 ? 's' : ''} d'exp.`;
  if (/exig/i.test(exp)) return 'Exp. exigée';
  if (/souhait/i.test(exp)) return 'Exp. souhaitée';
  return exp.length > 22 ? exp.slice(0, 20) + '…' : exp;
};
```

### JobDetailsPage — sections complètes

La fiche détail affiche toutes les informations disponibles dans l'API, organisées en sections :

| Section | Champs affichés |
|---------|----------------|
| En-tête | intitule, entreprise (CompanyPopover), lieuTravail (+ lien carte), tags (contrat/exp/qualification/alternance/TH/handi/adapté/tension) |
| Infos clés | Salaire (+ commentaire + compléments), Contrat, Durée (+ dates relatives), Postes (si >1), Déplacements, Secteur, Conditions (horaires, conditionExercice, contexteTravail, complementExercice) |
| Description | HTML sanitisé |
| Profil souhaité | Expérience (commentaire), Formations (niveauLibelle + domaineLibelle + commentaire + ExigenceBadge), Compétences (badges bleu=exigé/gris=souhaité), Qualités pro (+description), Outils bureautiques, Langues + Permis |
| Employeur | description + lien site |
| Contact | nom, téléphone, courriel, commentaire (URLs cliquables) |

**`ExigenceBadge`** : `code === 'E'` → badge rouge "Exigé", sinon gris "Souhaité"

**Bug corrigé** : `formations[].niveauFormationLibelle` → `formations[].niveauLibelle` (nom de champ réel dans l'API)

### MetierAutocomplete — dans les filtres avancés

Le composant `MetierAutocomplete` est maintenant dans la section **Filtres avancés** (pas dans la zone principale) :
- Label : "Métier précis (Code ROME) — Recherche ultra-ciblée"
- Placeholder adapté au mode (DevJobs vs Classique)
- Confirmation : chip compact `Développeur web · M1805 · ciblage exact`
- Sans emojis, icônes SVG cohérentes avec le reste du formulaire
- Le badge de compteur sur "Filtres avancés" inclut `selectedMetier`

### Recherche multi-stack (DevJobs)
- Bascule vers `useMultiStackJobs` quand `stacks.length > 0` dans searchParams
- Une requête par stack (150 résultats max chacune) via `useQueries`
- Résultats combinés et dédupliqués par `job.id` côté client
- Pagination locale sur les résultats combinés
- `baseParamsForStack` = searchParams sans `keywords` ni `stacks` (chaque requête injecte son propre keyword = nom du stack)

### Filtre salaire global
- Bascule vers `useAllJobs` quand `hasSalaryFilter = true` (et `hasMultiStack = false`)
- Charge jusqu'à 8 pages en parallèle via `useQueries`, filtre côté client sur `convertToAnnualSalary()`

### Conversion de salaires (`salaryUtils.js`)
- Normalise tout en €/mois brut
- Format API : `"Mensuel/Horaire/Annuel de X Euros [à Y Euros] sur N mois"`
- Détection de période avec word boundaries (`/\ban\b/`) pour éviter les faux positifs ("dans", "plan")
- Heuristique : `montant >= 5000` en contexte mensuel → diviser par `nbMois` (FT encode le total annuel)
- Conversion horaire → mensuel : `montant × 151.67`

### Bouton Postuler (`ApplyButton`) — ordre de priorité
1. `urlPostulation` → lien direct
2. URL dans `courriel` → lien site recruteur
3. Email dans `courriel` → mailto
4. URL dans `commentaire` → lien offre
5. Téléphone → lien tel
6. Sinon → modal infos de contact

### Favoris
- `localStorage` pour la persistance
- Toutes les pages utilisent `useAppContext()` — jamais `localStorage` directement
- `SavedJobsPage` : bouton poubelle individuel à la même position que le bouton sauvegarder
- `JobDetailsPage` : auto-suppression des favoris si l'offre retourne une erreur 404

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

## Pièges connus

| Problème | Cause | Solution |
|----------|-------|----------|
| Erreur 431 | Headers trop longs | Mots-clés limités à 20 caractères côté client |
| Token expiré | OAuth2 valide 30 min | Cache serveur + renouvellement 60s avant expiration + retry sur 401 |
| Paris renvoie 75056 | Code global vs arrondissements | Transformation auto vers 75101, suggestion d'arrondissements |
| `distance: '0'` ignoré | `'0'` est falsy | Comparaison explicite `!== undefined && !== ''` dans `SearchForm/index.js`, `api.js`, `server.js` |
| Recherche perdue à la navigation | `HomePage` démonté → état local perdu | `homeSearchParams` stocké dans `AppContext` (jamais démonté) |
| Reset au montage du `useEffect([isDevMode])` | Effect s'exécute toujours au premier rendu | `prevIsDevMode = useRef(isDevMode)` — ne reset que sur un vrai changement |
| `formations[].niveauFormationLibelle` undefined | Mauvais nom de champ | Le champ réel est `niveauLibelle` |

## Commandes

```bash
npm run dev          # Frontend (3000) + Backend (4059) en parallèle
npm start            # Frontend uniquement
npm run server       # Backend uniquement (hot reload)
npm run build        # Build de production
```

## Sécurité

- CORS configuré avec whitelist d'origines
- Credentials API stockés uniquement côté serveur (jamais exposés au frontend)
- Token OAuth2 mis en cache côté serveur, renouvelé automatiquement
- Validation des entrées utilisateur côté client (longueur mots-clés, etc.)

## Performance

- React Query : cache des requêtes (`staleTime: 5 min`)
- `useQueries` : requêtes parallèles en mode filtre salaire et en mode multi-stack DevJobs
- Multi-stack : jusqu'à N×150 offres récupérées en parallèle, dédupliquées en O(n) via `Set`
- Nginx sert les fichiers statiques en production

## Déploiement

```bash
npm run build                     # Build de production
docker-compose up -d              # Démarrer
docker-compose logs -f backend    # Voir les logs
docker-compose down               # Arrêter
```

- Frontend : `devjobs.creachtheo.fr`
- Backend API : `api.devjobs.creachtheo.fr`
