/**
 * Constantes utilisées dans l'application
 */

// Options de couleurs pour Tailwind (utilisées dans JobTags.js)
export const COLORS = {
  CONTRACT_TYPE: 'blue',
  WORKING_HOURS: 'green',
  EXPERIENCE: 'purple'
};

// Clés de stockage localStorage
export const STORAGE_KEYS = {
  SAVED_JOBS: 'savedJobs',
  RECENT_SEARCHES: 'recentSearches'
};

// Routes de l'application
export const ROUTES = {
  HOME: '/',
  JOB_DETAILS: '/job',
  SAVED_JOBS: '/saved'
};

// API URLs
export const API = {
  FRANCE_TRAVAIL: {
    SEARCH: '/services/offre/v2/rechercheroffres',
    JOB_DETAILS: '/services/offre/v2/offres'
  },
  GEO: {
    COMMUNES: 'https://geo.api.gouv.fr/communes'
  }
};

// Limites et paramètres par défaut
export const DEFAULTS = {
  SEARCH_LIMIT: 20,
  DEFAULT_DISTANCE: '10',
  DEFAULT_KEYWORDS: 'dev'
};
