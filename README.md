# 🔍 Job Search — France Travail API

Application web de recherche d'offres d'emploi utilisant l'API officielle de France Travail (anciennement Pôle Emploi).

🌐 **Production :** [devjobs.creachtheo.fr](https://devjobs.creachtheo.fr)

---

## Fonctionnalités

- **Recherche avancée** — mots-clés, localisation avec autocomplétion, distance, type de contrat, expérience, qualification, temps de travail
- **Recherche par métier** — autocomplétion des codes ROME (base de tous les métiers référencés par France Travail)
- **Pagination réelle** — affichage du total exact d'offres trouvées, navigation page par page, choix du nombre d'offres par page (10 / 25 / 50 / 100 / 150)
- **Filtre salaire global** — filtre les offres sur l'ensemble des résultats (pas seulement la page courante), avec chargement parallèle de toutes les pages
- **Conversion des salaires** — normalisation en €/mois brut quel que soit le format de l'API (horaire, mensuel, annuel)
- **Bouton Postuler intelligent** — détecte automatiquement le mode de postulation (lien direct, email, téléphone, informations de contact)
- **Favoris** — sauvegarde locale des offres avec page dédiée
- **Commune exacte** — distance `0 km` correctement gérée

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Frontend | React 18, React Router 6, TailwindCSS 3, React Query v4 |
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
│   │   ├── index.js          # Carte d'offre
│   │   ├── ApplyButton.js    # Bouton postuler (6 modes détectés automatiquement)
│   │   ├── JobTags.js        # Tags (contrat, expérience...)
│   │   └── SaveButton.js     # Favoris
│   └── SearchForm/
│       ├── index.js          # Formulaire complet
│       ├── MainSearchFields.js       # Métier + localisation
│       ├── AdvancedSearchFields.js   # 5 filtres avancés
│       └── MetierAutocomplete.js     # Autocomplétion ROME
├── hooks/
│   ├── useJobs.js      # Pagination API standard
│   └── useAllJobs.js   # Chargement parallèle (mode filtre salaire)
├── pages/
│   └── HomePage.js     # Bascule automatique entre les deux modes
├── utils/
│   ├── constants.js    # PAGE_SIZE_OPTIONS, DEFAULTS, MAX_TOTAL
│   └── salaryUtils.js  # Conversion et normalisation des salaires
server/
├── server.js           # API proxy Express + OAuth2 + Content-Range
└── rome-codes.json     # Base locale des codes ROME
```

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

## Roadmap

- [ ] Tests unitaires (`salaryUtils.js` en priorité)
- [ ] Rate limiting côté serveur
- [ ] Headers de sécurité (helmet.js)
- [ ] Sanitization HTML des descriptions d'offres
- [ ] Code splitting avec React.lazy()
- [ ] Service worker (mode offline)
- [ ] Déduplication des offres identiques en mode multi-pages

---

## Licence

Usage privé — projet personnel.
