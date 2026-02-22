# 🔍 Job Search — France Travail API

Application web de recherche d'offres d'emploi utilisant l'API officielle de France Travail (anciennement Pôle Emploi).

🌐 **Production :** [devjobs.creachtheo.fr](https://devjobs.creachtheo.fr)

---

## Fonctionnalités

### 🛠️ Mode DevJobs (par défaut)
Interface spécialisée pour les développeurs :
- **Filtres de stacks technologiques** — React, Vue, Angular, Next.js, TypeScript, Node.js, Python, Java, PHP, C#, Go, Rust, Flutter, Swift, Kotlin, Docker, AWS, Azure…
- **Recherche multi-stack** — sélectionner plusieurs stacks lance des recherches en parallèle et combine les résultats dédupliqués automatiquement
- Mot-clé "développeur" garanti si aucun critère n'est saisi
- Navbar sombre

### 🔍 Mode Classique
Recherche généraliste tous secteurs, sans filtres de stacks.

> **Toggle Navbar :** le bouton affiche le mode *vers lequel on bascule* ("Classique" quand on est en DevJobs, "DevJobs" quand on est en Classique). Changer de mode réinitialise les résultats sans relancer de recherche automatique.

### Fonctionnalités communes
- **Recherche avancée** — mots-clés, localisation avec autocomplétion, distance, type de contrat, expérience, qualification, temps de travail, salaire minimum
- **Recherche par métier ROME** — autocomplétion des codes ROME dans les filtres avancés (base de tous les métiers référencés par France Travail), comptabilisé dans le badge de filtres actifs
- **Fiche offre complète** — tous les champs API affichés : compétences, formations, qualités professionnelles, langues, permis, outils bureautiques, conditions d'exercice, déplacements, secteur d'activité, effectif entreprise, labels Handi-engagé / Entreprise adaptée
- **Cartes cliquables** — cliquer n'importe où sur une carte ouvre la fiche détail (sauf le bouton Postuler)
- **Info entreprise en un clic** — cliquer sur le nom d'une entreprise (carte ou fiche détail) ouvre une infobulle avec logo, description, taille et lien web si disponibles
- **Pagination réelle** — affichage du total exact d'offres trouvées, navigation page par page, choix du nombre d'offres par page (10 / 25 / 50 / 100 / 150) — pagination compacte (prev/next + numéro) sur mobile
- **Filtre salaire global** — filtre les offres sur l'ensemble des résultats (pas seulement la page courante), avec chargement parallèle de toutes les pages
- **Conversion des salaires** — normalisation en €/mois brut quel que soit le format de l'API (horaire, mensuel, annuel)
- **Tags expérience lisibles** — les libellés longs de France Travail ("3 à 5 ans d'expérience") sont affichés en version courte ("3 ans d'exp.")
- **Bouton Postuler intelligent** — détecte automatiquement le mode de postulation (lien direct, email, téléphone, informations de contact) ; ne s'affiche que si des informations utiles sont disponibles
- **Favoris** — sauvegarde locale des offres avec page dédiée
- **Persistance de recherche** — les paramètres de recherche survivent à la navigation (retour depuis une fiche détail ou les favoris)
- **Commune exacte** — distance `0 km` correctement gérée

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Frontend | React 18, React Router 6, TailwindCSS 3, React Query v4, Headless UI, Heroicons, Axios |
| Backend | Node.js, Express 4, Axios |
| Infrastructure | Docker, Nginx, Traefik (SSL auto) |
| APIs externes | France Travail API v2, geo.api.gouv.fr |

---

## Démarrage rapide

### Prérequis

- Node.js ≥ 18
- Un compte France Travail développeur avec identifiants OAuth2 → [francetravail.io](https://francetravail.io)

### Installation

```bash
git clone https://github.com/votre-repo/job-search-france-travail-api.git
cd job-search-france-travail-api
npm install
```

### Configuration

**`.env` (racine) :**
```env
REACT_APP_PORT=3000
SERVER_PORT=4059
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:4059/api
NODE_ENV=development
```

**`server/.env` :**
```env
FT_CLIENT_ID=votre_client_id
FT_CLIENT_SECRET=votre_client_secret
FT_SCOPE=api_offresdemploiv2 o2dsoffre
FT_TOKEN_URL=https://entreprise.francetravail.fr/connexion/oauth2/access_token
FT_BASE_URL=https://api.francetravail.io/
```

### Lancement en développement

```bash
npm run dev        # Frontend (port 3000) + Backend (port 4059) en parallèle
```

Ou séparément :
```bash
npm start          # Frontend uniquement
npm run server     # Backend uniquement (avec hot reload)
```

---

## Architecture

```
src/
├── components/
│   ├── JobCard/
│   │   ├── index.js          # Carte cliquable (→ fiche détail), useNavigate, stopPropagation sur ApplyButton
│   │   ├── ApplyButton.js    # Bouton postuler (5 modes + modal Contact), prop fullWidth
│   │   ├── JobTags.js        # Tags (contrat, expérience formatée...)
│   │   └── SaveButton.js     # Favoris
│   ├── SearchForm/
│   │   ├── index.js                  # Formulaire complet
│   │   ├── MainSearchFields.js       # Métier + localisation
│   │   ├── AdvancedSearchFields.js   # Filtres avancés + stacks DevJobs + ROME
│   │   ├── MetierAutocomplete.js     # Autocomplétion ROME (dans les filtres avancés)
│   │   ├── SearchButton.js
│   │   └── options.js                # Options selects + stackGroups
│   └── ui/
│       └── CompanyPopover.js  # Infobulle info entreprise (logo, description, taille, lien)
├── hooks/
│   ├── useJobs.js           # Pagination API standard
│   ├── useAllJobs.js        # Chargement parallèle (mode filtre salaire)
│   ├── useMultiStackJobs.js # Requêtes parallèles par stack (mode DevJobs)
│   └── useGeolocation.js    # Géolocalisation
├── context/
│   └── AppContext.js        # Contexte global (favoris + isDevMode + homeSearchParams)
├── pages/
│   ├── HomePage.js          # Bascule automatique entre les trois modes
│   ├── JobDetailsPage.js    # Fiche offre complète (tous champs API)
│   ├── SavedJobsPage.js     # Favoris
│   └── NotFoundPage.js      # 404
├── utils/
│   ├── constants.js    # PAGE_SIZE_OPTIONS, DEFAULTS, MAX_TOTAL
│   └── salaryUtils.js  # Conversion et normalisation des salaires
server/
├── server.js           # API proxy Express + OAuth2 + Content-Range
└── rome-codes.json     # Base locale des codes ROME
```

### Modes de recherche

L'application détecte automatiquement le mode à utiliser :

```
Stacks sélectionnés  →  useMultiStackJobs  →  1 req/stack (150 max) → combine + déduplique
Filtre salaire actif →  useAllJobs         →  8 requêtes parallèles → filtre client
Sinon               →  useSearchJobs       →  pagination API directe
```

### Persistance de la recherche

`homeSearchParams` est stocké dans `AppContext` (jamais démonté) et dans `sessionStorage`. Il n'est réinitialisé que lors d'un vrai changement de mode (DevJobs ↔ Classique), pas lors de la navigation entre pages.

### Pagination et limites API

L'API France Travail limite l'accès aux **1 150 premières offres** (paramètre `range` de `0-0` à `1000-1149`). Le total réel est extrait du header `Content-Range` de chaque réponse.

```
Content-Range: offres 0-49/287543
                            ↑ total réel affiché à l'utilisateur
```

### Filtre salaire — fonctionnement

Quand un filtre salaire minimum est activé :

1. `useAllJobs` déclenche jusqu'à **8 requêtes parallèles** (8 × 150 = 1 150 offres)
2. Un indicateur de progression s'affiche : *"Chargement… (3/8 pages)"*
3. Toutes les offres sont filtrées côté client via `convertToAnnualSalary()`
4. Le résultat paginé n'affiche que les offres correspondantes, avec le bon total

### Conversion des salaires

L'API FT renvoie des libellés de la forme :
- `"Horaire de 14.55 Euros à 15.0 Euros sur 12.0 mois"` → **2 207 €/mois**
- `"Mensuel de 24000.0 Euros à 26000.0 Euros sur 12.0 mois"` → **2 000 €/mois**
- `"Annuel de 36000.0 Euros à 42000.0 Euros sur 12.0 mois"` → **3 000 €/mois**

La détection de période utilise des expressions régulières avec word boundaries (`/\ban\b/`) pour éviter les faux positifs (ex: "dans", "plan"). L'heuristique `montant >= 5000` distingue les totaux annuels des montants mensuels.

### Infobulle entreprise (CompanyPopover)

Disponible sur le nom de l'entreprise dans les cartes d'offres et dans la fiche détail. S'active uniquement si l'API renvoie des données complémentaires (logo, description, URL ou taille). Fermeture au clic en dehors.

---

## Déploiement

### Docker (production)

```bash
docker-compose up -d              # Démarrer
docker-compose logs -f backend    # Logs
docker-compose down               # Arrêter
```

### Build manuel

```bash
npm run build    # Génère build/ (servi par le backend Express en production)
```

---

## Licence

Usage privé — projet personnel.
