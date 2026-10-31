# CLAUDE.md - Guide de Développement

## Vue d'ensemble du projet

**Job Search France Travail API** est une application web de recherche d'offres d'emploi qui utilise l'API officielle de France Travail (anciennement Pôle Emploi). L'application permet aux utilisateurs de rechercher des offres d'emploi avec des filtres avancés, de sauvegarder leurs offres favorites et de visualiser les détails complets des offres.

### Stack Technique

| Couche | Technologies |
|--------|-------------|
| Frontend | React 18, React Router 6, TailwindCSS 3, React Query v4, Headless UI, Heroicons, Axios |
| Backend | Node.js, Express 4, Axios, dotenv |
| Infrastructure | Docker, Traefik (SSL auto), Cloudflare Tunnel |

### Architecture actuelle (recherche-centrée)

- **Accueil (`/`) = la recherche.** Une **barre de commande unique** (`components/AppShell/CommandBar.js`) pilote tout : recherche intelligente à chips (métiers ROME + villes en autocomplétion), filtres en popover, et les **onglets Résultats · Analyse · Carte** qui partagent la même recherche (`homeSearchParams`). Plus de sidebar desktop, plus de formulaire séparé (`SearchForm/index.js` remplacé — seuls `options.js` et `MetierAutocomplete.js` sont réutilisés).
  - **Recherche live** : valider/retirer une chip (ou un filtre) relance la recherche automatiquement (debounce, gardé par `userTouchedRef` + signature pour éviter les boucles/relances inutiles) ; plus de bouton obligatoire.
  - **Suggestions ordonnées** : si la frappe ressemble à un lieu (une commune dont le nom commence par la frappe → `placeLikely`), les **villes** passent en premier et le bloc **métiers (ROME)** en bas ; sinon l'inverse. Côté serveur, `/api/rome/metiers` classe les **noms de métiers** d'abord (préfixe > début de mot > contient) et relègue les correspondances par **code ROME** seul en bas. Le code ROME est un petit badge discret à droite du nom.
  - **Coordonnées de la ville** : `/api/communes/search` renvoie `lat`/`lon` (champ geo `centre`) ; la chip ville les conserve dans `homeSearchParams.locationLat/Lon` → active le tri « Les plus proches ».
- **Carte de clusters = SVG maison, sans API/tuiles externes** : `components/search/map/FranceClusterMap.js` + `utils/geoProjection.js` (projection sans d3) + GeoJSON départements embarqué (`src/assets/france-departements.json`). Bulles verre à effet « goutte » (filtre métaballes `#goo`), zoom/pan throttlé (rAF), layers mémoïsés. **Leaflet retiré des imports.**
- **Analyse condensée** en grille bento de cartes dépliables, graphes variés (donut, fourchette salariale, rythme hebdo) : `components/search/AnalysisTab.js`.
- **Glassmorphism réaliste** (reflets spéculaires, grain, ombres multi-couches) : `src/index.css`.
- ⚠️ **Supprimés** (fondus dans `SearchPage` + onglets) : `DashboardPage`, page Tendances autonome (`AnalysePage`), `MapPage` (Leaflet), `HomePage`, `Navbar`/`TopBar`, `AnalyseControls`.

## Architecture

### Structure des dossiers

```
├── src/                      # Code source frontend
│   ├── components/
│   │   ├── AppShell/         # Coquille glassmorphism (pas de sidebar desktop)
│   │   │   ├── index.js      # CommandBar + <main> (Outlet)
│   │   │   ├── CommandBar.js # ★ Barre unique : recherche à chips (métiers+villes), filtres popover, onglets, favoris, thème
│   │   │   ├── Brand.js · ThemeToggle.js  (Sidebar/MobileNav/navItems SUPPRIMÉS)
│   │   ├── search/           # ★ Onglets de la recherche (partagent homeSearchParams)
│   │   │   ├── ResultsTab.js   # Résultats + pagination + 3 modes (normal/salaire/multi-stack)
│   │   │   ├── AnalysisTab.js  # Analyse condensée (bento, cartes dépliables, KPIs colorés, donut, fourchette, rythme hebdo)
│   │   │   ├── MarketTrendsCard.js # ★ Tendances marché (API SODE) — s'auto-masque si non configurée
│   │   │   ├── MapTab.js       # Wrapper données → carte
│   │   │   └── map/FranceClusterMap.js # ★ Carte SVG France (sans tuiles) + clusters à effet goutte
│   │   ├── analysis/charts.js # Primitives analyse (BarList, CrossTab, SalaryHistogram, TrendChart, CoverageBanner)
│   │   ├── charts/           # Donut, MiniArea, Sparkline, RankBars (+ palette)
│   │   ├── JobCard/          # index.js (carte cliquable) · ApplyButton.js (glass, 5 modes) · JobTags.js · SaveButton.js
│   │   ├── JobList/          # index.js · NoResults.js
│   │   ├── SearchForm/       # options.js UNIQUEMENT (réutilisé par CommandBar ; le reste du dossier a été supprimé)
│   │   └── ui/               # CompanyPopover.js · InseeCompanyInfo.js · SourceBadge.js · Spinner.js · Error.js
│   ├── domain/              # ★ Modèle Offer canonique + adapters (multi-sources) — voir domain/README.md
│   │   ├── offer.js         # Contrat Offer, SOURCES, SOURCE_META (badge de provenance)
│   │   └── adapters/        # index.js (registry: normalizeOffer/normalizeOffers) · franceTravail.js
│   ├── pages/
│   │   ├── SearchPage.js     # ★ Accueil = recherche + onglets (état vide si aucune recherche)
│   │   ├── JobDetailsPage.js · SavedJobsPage.js · NotFoundPage.js
│   ├── services/            # api.js (normalise via domain/adapters) · communeService.js · geolocationService.js · entrepriseService.js · marcheTravail.js
│   ├── hooks/               # useJobs · useAllJobs · useMultiStackJobs · useFullSweep · useGeolocation · useEntreprise · useMarketTrends
│   ├── context/             # AppContext.js (favoris + devMode + homeSearchParams) · ThemeContext.js
│   ├── utils/               # geoProjection.js (★ projection carte) · searchLabel.js · analytics.js · salaryUtils.js · departements.js · exportData.js · constants.js
│   ├── assets/              # ★ france-departements.json (GeoJSON départements embarqué, ~225 Ko)
│   └── index.css            # Tokens de thème + glassmorphism réaliste + styles carte (.map-*)
├── server/                  # server.js (Express) · providers/franceTravail.js (auth+appels FT) · insee.js · logger.js · rome-codes.json
├── .github/workflows/cicd.yml # CI/CD : build → image GHCR → deploy via tunnel Cloudflare (cloudflared Access SSH)
├── docker-compose.prod.yml · public/ · build/
```

### Modularité multi-sources (★)

Le front ne consomme **jamais** la forme brute d'une API : `services/api.js` normalise les
offres France Travail vers le **modèle `Offer` canonique** (`src/domain/offer.js`) via le
**registry d'adapters** (`src/domain/adapters/`). Toute l'UI et `utils/analytics.js`
travaillent sur `Offer[]`, quelle qu'en soit la provenance ; chaque offre porte un champ
`source` (badge `SourceBadge`, visible dès qu'il existe ≥ 2 sources).

**Pour brancher une nouvelle API d'offres** (APEC, EURES…) : écrire un adapter
`domain/adapters/<source>.js`, le déclarer dans `SOURCES`/`SOURCE_META` et le registry,
puis ajouter le service/route correspondants. **Aucun composant ni l'analyse à modifier.**
Guide détaillé : `src/domain/README.md`. Côté serveur, même logique via
`server/providers/*.js` (auth + appels) — un provider par source.

**Source implémentée en exemple : Adzuna** (facultative, clés gratuites
`ADZUNA_APP_ID`/`ADZUNA_APP_KEY`). Chaîne : `domain/adapters/adzuna.js` ·
`server/providers/adzuna.js` + `/api/adzuna/*` · `services/adzunaService.js`
(mapping pur dans `adzunaParams.js`) · `hooks/useAdzunaJobs.js`.

**Flux unifié (★)** — FT et Adzuna sont **fusionnés partout**, pas en section à part :
`hooks/useUnifiedJobs.js` charge le corpus FT (via `useAllJobs` ou `useMultiStackJobs`)
+ Adzuna (multi-pages), puis `domain/mergeOffers.js` **dé-duplique inter-sources**
(clé intitulé+entreprise, FT prioritaire) et **trie par date**. Les 3 onglets
consomment ce flux :
- **Résultats** : liste unique, pagination locale, **puces de filtre par source**
  (Toutes / France Travail / Adzuna), badge `SourceBadge` par carte, et **tri** :
  défaut « Offres les plus détaillées » (`domain/offerScore.js`), **Pertinence**
  (ordre FT d'origine via `__rank` posé dans `useUnifiedJobs` avant fusion),
  **Les plus proches** (haversine `utils/geoProjection.js` vers `searchParams.locationLat/Lon`
  — n'apparaît que si une ville géolocalisée est choisie), Plus récentes, Salaire décroissant.
- **Analyse** : `analyzeJobs` porte sur le combiné FT+Adzuna (dé-dupliqué).
- **Carte** : clusters des offres des deux sources (Adzuna a lat/long).
Les cartes d'offres externes (Adzuna) ouvrent leur page d'origine (pas de fiche
détail interne). Si Adzuna n'est pas configurée, le flux reste 100 % France Travail.
⚠️ En mode « normal » (hors multi-stack), Résultats charge désormais le corpus FT
complet (`useAllJobs`, jusqu'à 1 150) pour permettre tri + analyse combinés.

### Flux de données

1. **Frontend → Backend:** Les requêtes passent par le serveur Express (proxy) pour sécuriser les credentials
2. **Backend → API France Travail:** via `server/providers/franceTravail.js` (OAuth2 + `Content-Range`)
3. **Backend → API Geo / INSEE-SIRENE:** communes (geo.api.gouv.fr) + enrichissement entreprise (`server/insee.js`)
4. **Backend → Frontend:** `total` réel inclus ; **frontend normalise en `Offer`** via `domain/adapters`

### Chargement des données (flux unifié — `useUnifiedJobs`)

`ResultsTab`, `AnalysisTab` et `MapTab` s'appuient sur **`hooks/useUnifiedJobs.js`**, qui
assemble un **corpus unique FT + Adzuna** puis le fusionne (`domain/mergeOffers.js`) :

```
FT : multi-stack ? useMultiStackJobs (N req/stack)   ┐
     sinon         useAllJobs (jusqu'à 8 req, ≤1150)  ├─ mergeOffers (dé-dup + tri date) → flux unifié
Adzuna : useAdzunaJobs (multi-pages, ~150 offres)     ┘   → filtre salaire client → pagination locale
```

- **Multi-stack** (≥1 stack) : 1 requête FT par stack (150 max), combinées + dédupliquées.
- **Sinon** : corpus FT complet via `useAllJobs` (jusqu'à 1 150).
- **Adzuna** : quelques pages, fusionnées, dé-dupliquées inter-sources (FT prioritaire).
- **Filtre salaire** : appliqué côté client sur le flux fusionné (`convertToAnnualSalary`).
- Pagination **locale** sur le flux ; filtre par source dans l'UI Résultats.

> Le mode « pagination API page-par-page » (`useSearchJobs`) n'est plus utilisé pour les
> résultats (conservé pour d'éventuels besoins ponctuels ; `useGetJobById` reste utilisé
> pour la fiche détail).

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

## Modes & contexte global

> ⚠️ **Historique — le « Mode DevJobs » a été retiré.** L'app avait deux modes
> (DevJobs / Classique) pilotés par `isDevMode` + `localStorage.devJobsMode` (navbar
> sombre, fallback mot-clé « développeur », toggle qui réinitialisait la recherche).
> **Tout cela n'existe plus** : l'application est désormais 100 % généraliste.
> `AppContext` expose encore `isDevMode: false` **uniquement par compatibilité**
> (pas de toggle, pas de `useRef(prevIsDevMode)`, pas de reset au changement de mode).
> Ne pas réintroduire de logique conditionnée par le mode.

### Contexte global (`AppContext.js`)

État réellement exposé aujourd'hui (toutes les lectures de storage sont enveloppées de `try/catch`) :

```javascript
// Favoris — persistés dans localStorage 'savedJobs'
savedJobs, saveJob, removeJob, clearSavedJobs, isJobSaved
// Recherche persistante (survit aux navigations) — sessionStorage 'lastSearchParams'
homeSearchParams, updateHomeSearchParams
// Compat héritée (plus de mode dev)
isDevMode: false
```

**Pourquoi `homeSearchParams` est dans le contexte** : `SearchPage` est démonté à chaque navigation (vers `/favoris`, `/job/:id`, etc.). Stocker la recherche en état local la perdait à chaque remontage. Le contexte `AppProvider` (toujours monté) persiste ces paramètres sans ré-exécuter de recherche automatique.

### Filtres par stack technologique (`useMultiStackJobs.js`)

Fonctionnalité conservée (indépendante de tout « mode »). Sélectionner plusieurs stacks dans les filtres avancés déclenche **une requête API par stack** (max 150 résultats chacune), combinées + dédupliquées par `job.id` :

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

- **Avec stacks :** chaque stack fournit son propre mot-clé, le champ texte est ignoré.
- **Sans stack :** recherche généraliste classique (aucun mot-clé imposé).

## Points d'implémentation notables

### Persistance de la recherche

- `homeSearchParams` stocké dans `AppContext` (jamais démonté) + `sessionStorage` pour rechargement de page
- `currentPage` et `pageSize` dans état local de `SearchPage`, initialisés depuis `sessionStorage`

### Pagination
- `range` calculé dynamiquement : `"${page * pageSize}-${page * pageSize + pageSize - 1}"`
- Total réel extrait du header `Content-Range` de la réponse API
- Page et taille de page persistées via `sessionStorage`
- **Mobile** : `ResultsBar` affiche uniquement prev/next + indicateur `"X / Y"` (pas de numéros de pages individuels) pour éviter l'overflow horizontal sur petits écrans

### JobCard — mise en page et navigation
- **Carte entière cliquable** : `onClick={() => navigate('/job/' + job.id)}` sur le `div` conteneur + `cursor-pointer`
- **Exceptions** : `SaveButton`, `onRemove` et `ApplyButton` ont `e.stopPropagation()` pour ne pas déclencher la navigation
- `ApplyButton` est enveloppé dans un `<span onClick={e => e.stopPropagation()}>` dans la carte
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
| Description | Texte échappé (`utils/sanitizeHtml.js` — anti-XSS) + sauts de ligne `<br />` |
| Profil souhaité | Expérience (commentaire), Formations (niveauLibelle + domaineLibelle + commentaire + ExigenceBadge), Compétences (badges bleu=exigé/gris=souhaité), Qualités pro (+description), Outils bureautiques, Langues + Permis |
| Employeur | description + lien site |
| Contact | nom, téléphone, courriel, commentaire (URLs cliquables) |

**`ExigenceBadge`** : `code === 'E'` → badge rouge "Exigé", sinon gris "Souhaité"

**Bug corrigé** : `formations[].niveauFormationLibelle` → `formations[].niveauLibelle` (nom de champ réel dans l'API)

**Layout mobile** : `InfoRow` empile verticalement sur mobile (label en ligne — icône + texte majuscules compact — au-dessus du contenu) et passe en ligne sur `sm:`. Les paddings internes sont `px-4 sm:px-6` et `p-4 sm:p-6` pour s'adapter aux petits écrans.

### MetierAutocomplete — dans les filtres avancés

Le composant `MetierAutocomplete` est maintenant dans la section **Filtres avancés** (pas dans la zone principale) :
- Label : "Métier précis (Code ROME) — Recherche ultra-ciblée"
- Placeholder généraliste (ex. « Développeur, infirmier, comptable… »)
- Confirmation : chip compact `Développeur web · M1805 · ciblage exact`
- Sans emojis, icônes SVG cohérentes avec le reste du formulaire
- Le badge de compteur sur "Filtres avancés" inclut `selectedMetier`

### Recherche multi-stack
- Bascule vers `useMultiStackJobs` quand `stacks.length > 0` dans searchParams
- Une requête par stack (150 résultats max chacune) via `useQueries`
- Résultats combinés et dédupliqués par `job.id` côté client
- Pagination locale sur les résultats combinés
- `baseParamsForStack` = searchParams sans `keywords` ni `stacks` (chaque requête injecte son propre keyword = nom du stack)

### Filtre salaire global
- Bascule vers `useAllJobs` quand `hasSalaryFilter = true` (et `hasMultiStack = false`)
- Charge jusqu'à 8 pages en parallèle via `useQueries`, filtre côté client sur `convertToAnnualSalary()`

### Conversion de salaires (`salaryUtils.js`)
- Normalise tout en €/mois brut. Format réel (vérifié en prod) : `"<Période> de X Euros [à Y Euros] [- commentaire libre]"` — **pas de « sur N mois »** (ancienne hypothèse erronée, retirée).
- **Parse UNIQUEMENT `salaire.libelle`** (le champ structuré), jamais `salaire.commentaire` (texte libre). Parser le commentaire produisait des montants aberrants : « Salaire CCN 51 » → 7 735 €/mois, « 13ème mois » → 13 €/mois, « … » → 10 010 €/mois. Les ~20 % d'offres sans libelle sont « Salaire non précisé » (la donnée brute reste visible sur la fiche, cf. JobDetailsPage).
- **Coupe le commentaire libre** (`" - "`) AVANT de parser le libelle : sinon un « annuel/annuelle/un an/13ème mois » dans le texte libre fait basculer la période et divise par 12 un salaire mensuel (`"Mensuel de 2600 à 3000 € - …Indemnitaire Annuel)"` affichait **217–250 €**).
- **Lit les deux bornes** (`de X à Y`) — l'affichage montre la **fourchette** `min – max` quand elles diffèrent, plus seulement le minimum.
- **Décision de périodicité prise sur la borne haute**, appliquée aux deux bornes (une fourchette ne mélange jamais « mensuel fiable » et « annuel mal étiqueté »). Seuils « Mensuel » : `≤ 10000` fiable, `≥ 18000` = annuel mal étiqueté → ÷12, `10000–18000` = ambigu → `Salaire non précisé`.
- Conversion horaire → mensuel : `montant × 151.67`. `convertToAnnualSalary` (filtre/tri/analyse) = borne basse × 12, annualisée depuis le float (pas de dérive d'arrondi).

### Bouton Postuler (`ApplyButton`) — ordre de priorité
1. `urlPostulation` → lien direct
2. URL dans `courriel` → lien site recruteur
3. Email dans `courriel` → mailto
4. URL dans `commentaire` → lien offre
5. Téléphone → lien tel
6. `nom` ou `commentaire` textuel → modal infos de contact
7. Aucun de ces cas → **`null`** (bouton masqué)

**Prop `fullWidth`** : quand la carte n'a plus de bouton "Voir le détail" à côté, `fullWidth` étend le bouton sur toute la largeur (`w-full justify-center`).

**Modal Contact dans la carte** : le modal est rendu au niveau du composant (pas uniquement dans `isDetailed`) pour que le bouton Contact fonctionne depuis les cartes de résultats.

**Piège** : `mode: 'info'` ne doit être retourné que si `contact.nom || contact.commentaire` — un objet `contact` vide (sans aucun champ utile) doit retourner `'none'`.

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
| Recherche perdue à la navigation | `SearchPage` démonté → état local perdu | `homeSearchParams` stocké dans `AppContext` (jamais démonté) |
| `formations[].niveauFormationLibelle` undefined | Mauvais nom de champ | Le champ réel est `niveauLibelle` |
| Bouton Contact présent mais inactif | Modal uniquement dans `isDetailed`, non rendu dans la carte | Modal rendu dans le chemin non-détaillé aussi (Fragment `<>`) |
| Bouton Contact affiché sans info utile | `resolveApplyMode` retournait `'info'` en dernier recours même si `contact` était vide | `'info'` uniquement si `contact.nom \|\| contact.commentaire`, sinon `'none'` |
| Pagination déborde horizontalement sur mobile | Numéros de pages individuels trop nombreux sur petit écran | `ResultsBar` : boutons de pages masqués sur mobile (`sm:hidden`), remplacés par `"X / Y"` |

## Commandes

```bash
npm run dev          # Frontend (3000) + Backend (4059) en parallèle
npm start            # Frontend uniquement
npm run server       # Backend uniquement (hot reload)
npm run build        # Build de production
npm run test:ci      # Tests frontend (Jest/CRA, une passe)
npm run test:server  # Tests backend (runner natif node:test — insee…)
npm run test:all     # Les deux (exécuté par la CI avant le build)
```

## Sécurité

- **`helmet`** : en-têtes de sécurité sur toutes les réponses (CSP désactivée car Express sert aussi le SPA ; CORP en cross-origin car l'API est sur un autre sous-domaine).
- **`express-rate-limit`** sur `/api` : défense principale contre l'épuisement des quotas tiers (le SPA public ne peut pas authentifier un vrai utilisateur sans login). Défaut 100 req/min/IP, réglable via `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS`. `app.set('trust proxy', 1)` pour compter la vraie IP derrière Traefik/Cloudflare.
- **Limite de taille des corps** (`express.json({ limit: '100kb' })`).
- **`API_SHARED_KEY`** (optionnel, no-op si absent) : si défini, `/api/*` exige l'en-tête `x-api-key` (sauf `/health` et `*/config`). Utile seulement derrière un client non public — inutile pour protéger le SPA public (une clé dans le bundle React est lisible par tous).
- **Timeouts** sur tous les appels HTTP sortants (front : `API.TIMEOUT` ; serveur : `FT_TIMEOUT_MS`, INSEE 8 s, geo 10 s) → plus de requêtes qui pendent.
- **Anti-XSS** : la description d'offre (contenu employeur, non maîtrisé) est **échappée** avant injection via `dangerouslySetInnerHTML` (`src/utils/sanitizeHtml.js`) — pas seulement `\n → <br/>`.
- **Error Boundary** global (`src/components/ErrorBoundary.js`) : une exception de rendu affiche un écran de repli au lieu d'un écran blanc.
- CORS configuré avec whitelist d'origines ; credentials API stockés uniquement côté serveur (jamais exposés au frontend) ; token OAuth2 en cache serveur, renouvelé automatiquement.
- Validation des entrées utilisateur côté client (longueur mots-clés, etc.).

> ⚠️ **Limite assumée** : l'API reste un proxy sans authentification par utilisateur
> (le front est un SPA statique public). Le rate-limit + CORS limitent les abus mais
> ne les éliminent pas. Une vraie protection nécessiterait un login — hors périmètre.

## Performance

- React Query : cache des requêtes (`staleTime: 5 min`)
- `useQueries` : requêtes parallèles en mode filtre salaire et en multi-stack
- Multi-stack : jusqu'à N×150 offres récupérées en parallèle, dédupliquées en O(n) via `Set`
- En production, **Express sert le build React** (front + API sur le même conteneur, routé par Traefik) — plus de Nginx.

## Déploiement

CI/CD : un push sur `main` déclenche `.github/workflows/cicd.yml` → build de l'image, push sur **GHCR**, puis déploiement sur le VPS **via le tunnel Cloudflare** (`cloudflared access ssh` + service token ; le port 22 n'est pas exposé publiquement). Le VPS tire l'image et recrée les conteneurs.

```bash
# sur le VPS (fait par la CI)
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --force-recreate --remove-orphans
```

- Front + API servis par Express derrière Traefik : `devjobs.creachtheo.fr`, `api-devjobs.creachtheo.fr` (TLS auto, DNS gris).
- ⚠️ **Gotchas infra** (détails en mémoire projet) : `cloudflared` épinglé **2026.5.1** (régression service-token de la 2026.6.0) ; une règle `DOCKER-USER` restreignant 80/443 à Cloudflare bloquait aussi l'**egress** des conteneurs (backend → France Travail) → `RETURN` pour `172.16.0.0/12` ajouté en tête de `DOCKER-USER` et persisté dans `/etc/iptables/rules.v4`.
