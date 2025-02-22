import axios from 'axios';

// Création d'une instance Axios avec la configuration de base
const api = axios.create({
  baseURL: 'https://api.francetravail.io/partenaire/offresdemploi/v2/offres',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
    // Ne pas mettre l'Authorization ici pour éviter qu'il soit inclus dans toutes les requêtes
  },
  // Limites strictes pour éviter les erreurs 431
  maxContentLength: 2 * 1024 * 1024, // 2 MB
  maxBodyLength: 2 * 1024 * 1024, // 2 MB
  maxRedirects: 3, 
  timeout: 10000 // 10 secondes
});

// Intercepteur de requête ultra-minimaliste
api.interceptors.request.use(
  async config => {
    const token = process.env.REACT_APP_API_TOKEN;
    
    // Simplification radicale des en-têtes
    config.headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };
    
    // Limiter strictement la taille des paramètres
    if (config.params) {
      Object.keys(config.params).forEach(key => {
        if (typeof config.params[key] === 'string' && config.params[key].length > 25) {
          config.params[key] = config.params[key].substring(0, 25);
        }
      });
      
      // Limiter le nombre de paramètres
      const allowedParams = ['motsCles', 'commune', 'distance', 'experience', 'typeContrat', 'sort', 'range', 'publieeDepuis'];
      Object.keys(config.params).forEach(key => {
        if (!allowedParams.includes(key)) {
          delete config.params[key];
        }
      });
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de manière globale
api.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    // Log des erreurs en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }
    
    if (response) {
      // Erreurs avec réponse du serveur
      switch (response.status) {
        case 400:
          error.message = 'Requête incorrecte. Veuillez vérifier vos paramètres.';
          break;
        case 401:
          error.message = 'Non autorisé. Clé API invalide.';
          break;
        case 403:
          error.message = 'Accès refusé.';
          break;
        case 404:
          error.message = 'Ressource non trouvée.';
          break;
        case 429:
          error.message = 'Trop de requêtes. Veuillez réessayer plus tard.';
          break;
        case 431:
          error.message = 'Erreur 431: Request Header Fields Too Large';
          break;
        case 500:
          error.message = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        default:
          error.message = `Erreur ${response.status}: ${response.statusText}`;
      }
    } else {
      // Erreurs sans réponse (réseau, timeout, etc.)
      error.message = 'Erreur réseau. Vérifiez votre connexion.';
    }
    
    return Promise.reject(error);
  }
);

// Service ultra-simplifié pour la recherche d'offres d'emploi
export const searchJobs = async (params) => {
  // Extraction des paramètres de recherche
  const {
    keywords,
    location,
    distance,
    experience,
    contractType,
  } = params;
  
  // Construire les paramètres minimalistes
  const queryParams = {
    motsCles: keywords ? keywords.substring(0, 20) : 'dev',
    sort: 1,
    range: '0-5', // Très peu de résultats
    publieeDepuis: 31
  };
  
  // Ajouter les paramètres essentiels uniquement
  if (location && location.trim()) {
    queryParams.commune = location.substring(0, 20);
  }
  
  if (experience && experience.trim()) {
    queryParams.experience = experience;
  }
  
  if (contractType && contractType.trim()) {
    queryParams.typeContrat = contractType;
  }
  
  // Pas d'autres paramètres!
  
  try {
    // Méthode HTTP simple
    const response = await api.get('/search', { 
      params: queryParams,
      // Aucun en-tête supplémentaire
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche:', error.message);
    throw error;
  }
};

// Service simplifié pour récupérer une offre d'emploi par son ID
export const getJobById = async (jobId) => {
  if (!jobId) {
    throw new Error('ID de l\'offre d\'emploi requis');
  }
  
  try {
    const response = await api.get(`/${jobId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;