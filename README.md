# Job Search - France Travail API

> Application web de recherche d'offres d'emploi utilisant l'API officielle de France Travail (anciennement Pôle Emploi)

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.5-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

## 🎯 Fonctionnalités

- ✅ **Recherche avancée** d'offres d'emploi avec filtres multiples
- 🗺️ **Géolocalisation** avec autocomplétion des communes françaises
- 📍 **Distance paramétrable** pour la recherche géographique
- 💾 **Sauvegarde locale** des offres favorites
- 📱 **Design responsive** adapté mobile/tablette/desktop
- 🔍 **Détails complets** des offres avec bouton de postulation
- ⚡ **Cache intelligent** avec React Query
- 🔒 **Sécurisé** - Les credentials API restent côté serveur

## 🚀 Installation rapide

### Prérequis

- Node.js >= 16.x
- npm >= 8.x
- Compte développeur France Travail (pour les credentials API)

### Configuration

1. **Cloner le repository**
```bash
git clone https://github.com/creach-t/job-search-france-travail-api.git
cd job-search-france-travail-api
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine:
```env
REACT_APP_PORT=3000
SERVER_PORT=4059
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:4059/api
NODE_ENV=development
```

Créer un fichier `server/.env`:
```env
FT_CLIENT_ID=votre_client_id
FT_CLIENT_SECRET=votre_client_secret
FT_SCOPE=api_offresdemploiv2 o2dsoffre
FT_TOKEN_URL=https://entreprise.francetravail.fr/connexion/oauth2/access_token
FT_BASE_URL=https://api.francetravail.io/
```

> 💡 **Obtenir des credentials API:** Rendez-vous sur [francetravail.io](https://francetravail.io/) pour créer un compte développeur et obtenir vos credentials.

4. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4059

## 🐳 Déploiement Docker

### Production

1. **Build de l'application**
```bash
npm run build
```

2. **Lancer les containers**
```bash
docker-compose up -d
```

Services déployés:
- Frontend (Nginx): Port 4060
- Backend (Node.js): Port 4059
- Traefik pour SSL automatique (Let's Encrypt)

## 📁 Structure du projet

```
job-search-france-travail-api/
├── src/                        # Code source frontend
│   ├── components/             # Composants React
│   │   ├── JobCard/           # Carte d'offre d'emploi
│   │   ├── JobList/           # Liste des offres
│   │   ├── SearchForm/        # Formulaire de recherche
│   │   ├── Navbar/            # Barre de navigation
│   │   └── Footer/            # Pied de page
│   ├── pages/                 # Pages principales
│   │   ├── HomePage.js        # Page d'accueil
│   │   ├── JobDetailsPage.js  # Détails d'une offre
│   │   └── SavedJobsPage.js   # Offres sauvegardées
│   ├── services/              # Services API
│   │   ├── api.js            # Client API France Travail
│   │   └── communeService.js # Service de géolocalisation
│   ├── hooks/                 # Custom React hooks
│   └── utils/                 # Utilitaires et constantes
├── server/                    # Code source backend
│   ├── server.js             # Serveur Express
│   └── routes/               # Routes API
├── public/                    # Fichiers statiques
├── docker-compose.yml         # Configuration Docker
└── package.json              # Dépendances npm
```

## 🛠️ Technologies utilisées

### Frontend
- **React 18** - Framework UI
- **React Router** - Routing SPA
- **React Query** - Gestion du cache et des requêtes
- **TailwindCSS** - Framework CSS utilitaire
- **Headless UI** - Composants accessibles
- **Heroicons** - Icônes
- **Axios** - Client HTTP

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Axios** - Appels API externes
- **CORS** - Gestion cross-origin
- **dotenv** - Variables d'environnement

### Infrastructure
- **Docker** - Containerisation
- **Docker Compose** - Orchestration
- **Nginx** - Serveur web (production)
- **Traefik** - Reverse proxy avec SSL

## 📚 APIs externes

### API France Travail
- **Documentation:** [francetravail.io](https://francetravail.io/produits-partages/catalogue)
- **Endpoint:** `https://api.francetravail.io/partenaire/offresdemploi/v2`
- **Authentification:** OAuth2 Client Credentials
- **Fonctionnalités:** Recherche d'offres, détails des offres

### API Geo
- **Documentation:** [geo.api.gouv.fr](https://geo.api.gouv.fr/decoupage-administratif/communes)
- **Endpoint:** `https://geo.api.gouv.fr/communes`
- **Authentification:** Aucune (publique)
- **Fonctionnalités:** Recherche de communes, codes INSEE

## 🎨 Fonctionnalités détaillées

### Recherche d'offres
- **Mots-clés** - Recherche textuelle flexible
- **Localisation** - Autocomplétion des communes françaises avec codes INSEE
- **Distance** - Rayon de recherche de 10 à 200 km
- **Expérience** - Débutant, expérimenté, cadre...
- **Type de contrat** - CDI, CDD, alternance, stage...
- **Qualification** - Non cadre, cadre, agent de maîtrise...
- **Temps de travail** - Temps plein / temps partiel

### Affichage des résultats
- Liste des offres avec aperçu
- Tags colorés pour identification rapide
- Indicateurs spéciaux:
  - 🔥 Offre en tension (manque de candidats)
  - ♿ Accessible aux travailleurs handicapés
  - 🎓 Alternance disponible

### Détails de l'offre
- Description complète du poste
- Informations entreprise
- Localisation avec carte interactive
- Salaire et avantages
- Compétences requises
- Formations demandées
- Conditions de travail
- Bouton de postulation directe

### Sauvegarde
- Enregistrement local des offres favorites
- Persistance avec localStorage
- Page dédiée aux offres sauvegardées
- Synchronisation automatique

## 🔧 Scripts disponibles

```bash
# Développement
npm start              # Lance le frontend uniquement
npm run server         # Lance le backend avec hot reload
npm run dev            # Lance frontend + backend en parallèle

# Build
npm run build          # Build de production optimisé

# Tests
npm test               # Lance les tests

# Docker
docker-compose up -d                  # Lance tous les services
docker-compose logs -f backend        # Affiche les logs du backend
docker-compose down                   # Arrête tous les services
docker-compose restart backend        # Redémarre le backend
```

## 🐛 Problèmes connus

### Erreur 431 - Request Header Too Large
**Cause:** Paramètres de recherche trop longs

**Solution:** L'application limite automatiquement:
- Mots-clés: 20 caractères max
- Compétences: 2 sélections max

### Token OAuth2 expiré
**Cause:** Token France Travail valide 30 minutes

**Solution:** Renouvellement automatique avec marge de 60 secondes

## 🚧 Améliorations futures

### Fonctionnalités
- [ ] Pagination des résultats
- [ ] Filtres supplémentaires (secteur d'activité, salaire min/max)
- [ ] Historique des recherches
- [ ] Notifications pour nouvelles offres
- [ ] Export des résultats (PDF, CSV)
- [ ] Mode sombre
- [ ] Multilingue (français, anglais)

### Technique
- [ ] Tests unitaires et E2E
- [ ] CI/CD avec GitHub Actions
- [ ] Service Worker pour mode offline
- [ ] Optimisation des performances (lazy loading)
- [ ] Accessibilité WCAG 2.1 AA
- [ ] Analytics (respect RGPD)

### Backend
- [ ] Rate limiting
- [ ] Authentification utilisateur
- [ ] Base de données pour favoris partagés
- [ ] API REST documentée (Swagger)
- [ ] Logs structurés

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer:

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 🙏 Remerciements

- [France Travail](https://francetravail.io/) pour l'accès à l'API
- [API Geo](https://geo.api.gouv.fr/) pour les données géographiques
- La communauté React et TailwindCSS

## 📞 Support

Pour toute question ou problème:
- 🐛 [Créer une issue](https://github.com/creach-t/job-search-france-travail-api/issues)
- 💬 [Discussions](https://github.com/creach-t/job-search-france-travail-api/discussions)

---

**Sources de documentation:**
- [API France Travail - Offres d'emploi](https://francetravail.io/data/api/offres-emploi)
- [API Geo - Découpage administratif](https://geo.api.gouv.fr/decoupage-administratif)
- [API.gouv.fr - France Travail](https://api.gouv.fr/producteurs/france-travail)
- [API.gouv.fr - API Geo](https://api.gouv.fr/les-api/api-geo)

Fait avec ❤️ en France
