import axios from 'axios';

// Création d'une instance Axios avec la configuration de base
const api = axios.create({
  // Utilisation du serveur proxy local au lieu de l'API directe
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Limites pour éviter les erreurs
  maxContentLength: 1 * 1024 * 1024, // 1 MB
  maxBodyLength: 1 * 1024 * 1024, // 1 MB
  maxRedirects: 3,
  timeout: 10000, // 10 secondes
});

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
          error.message = 'Erreur 431: Requête trop volumineuse. Simplifiez votre recherche.';
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
  
  // Construire les paramètres de requête pour l'API avec des limites strictes
  const queryParams = {
    // Limiter la taille des mots-clés pour éviter les erreurs 431
    keywords: keywords ? keywords.substring(0, 30) : 'dev',
  };
  
  // Ajouter les paramètres conditionnels avec limitation de taille
  if (location) {
    queryParams.location = location.substring(0, 30);
    
    if (distance) {
      queryParams.distance = distance;
    }
  }
  
  // Ajouter l'expérience si spécifiée
  if (experience) {
    queryParams.experience = experience;
  }
  
  // Ajouter le type de contrat si spécifié
  if (contractType) {
    queryParams.contractType = contractType;
  }
  
  try {
    // Utiliser notre point d'entrée API simplifié
    const response = await api.get('/api', { 
      params: queryParams,
      // Minimiser les en-têtes
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
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
    // Utiliser le serveur proxy
    const response = await api.get(`/api/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;