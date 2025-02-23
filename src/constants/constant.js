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
    RECENT_SEARCHES: 'recentSearches',
    AUTH_TOKEN: 'auth_token'
  };
  
  // Routes de l'application
  export const ROUTES = {
    HOME: '/',
    JOB_DETAILS: '/job',
    SAVED_JOBS: '/saved'
  };
  
  // API URLs - Maintenant configurées pour utiliser le serveur local
  export const API = {
    BASE_URL: 'http://localhost:3001/api',
    ENDPOINTS: {
      AUTH: '/auth',
      SEARCH_JOBS: '/jobs/search',
      JOB_DETAILS: '/jobs',
      COMMUNES: '/communes'
    }
  };
  
  // Limites et paramètres par défaut
  export const DEFAULTS = {
    SEARCH_LIMIT: 20,
    DEFAULT_DISTANCE: '10',
    DEFAULT_KEYWORDS: 'dev'
  };