import axios from 'axios';

// Création d'une instance Axios avec la configuration de base
const api = axios.create({
  baseURL: 'https://api.francetravail.io/partenaire/offresdemploi/v2/offres',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
    // Ne pas mettre l'Authorization ici pour éviter qu'il soit inclus dans toutes les requêtes
  },
  // Ajouter des limites pour éviter les erreurs 431
  maxContentLength: 10 * 1024 * 1024, // 10 MB
  maxBodyLength: 10 * 1024 * 1024, // 10 MB
  maxRedirects: 5,
  timeout: 30000, // 30 secondes
});

// Intercepteur de requête pour ajouter l'en-tête d'autorisation
api.interceptors.request.use(
  async config => {
    const token = process.env.REACT_APP_API_TOKEN;
    // Ne mettre que les headers essentiels, minimiser les données
    config.headers['Authorization'] = `Bearer ${token}`;
    
    // Supprimer les headers non nécessaires s'ils existent
    const unnecessaryHeaders = ['X-Client-Version', 'X-Client-Id', 'X-Application-Id', 'X-Platform', 'X-Client-Build', 'X-Device-Id'];
    unnecessaryHeaders.forEach(header => {
      if (config.headers[header]) {
        delete config.headers[header];
      }
    });
    
    // Limiter la taille des params dans l'URL
    if (config.params) {
      Object.keys(config.params).forEach(key => {
        if (typeof config.params[key] === 'string' && config.params[key].length > 100) {
          config.params[key] = config.params[key].substring(0, 100);
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

// Service pour la recherche d'offres d'emploi
export const searchJobs = async (params) => {
  // Extraction des paramètres de recherche et limitation de leur taille
  const {
    keywords,
    location,
    distance,
    experience,
    contractType,
  } = params;
  
  // Construire les paramètres de requête pour l'API avec des limites de taille strictes
  const queryParams = {
    // Limiter la taille des mots-clés pour éviter les erreurs 431
    motsCles: keywords ? keywords.substring(0, 50) : 'développeur', // Réduit de 200 à 50 caractères
    sort: 1,
    range: '0-9', // Réduit le nombre de résultats pour alléger la requête (de 0-19 à 0-9)
    publieeDepuis: 31
  };
  
  // Ajouter les paramètres conditionnels avec limitation de taille
  if (location) {
    queryParams.commune = location.substring(0, 50); // Réduit de 100 à 50 caractères
    
    if (distance) {
      queryParams.distance = parseInt(distance) || 10;
    }
  }
  
  // Ajouter l'expérience si spécifiée
  if (experience) {
    queryParams.experience = experience;
  }
  
  // Ajouter le type de contrat si spécifié
  if (contractType) {
    queryParams.typeContrat = contractType;
  }
  
  try {
    // Utiliser une méthode HTTP plus courte (GET au lieu de longues URL complexes)
    const response = await api.get('/search', { 
      params: queryParams,
      // Personnaliser les headers pour cette requête spécifique
      headers: {
        // Limiter les headers au strict minimum
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        // Authorization sera ajouté par l'intercepteur
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche:', error.message);
    throw error;
  }
};

// Service pour récupérer une offre d'emploi par son ID
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