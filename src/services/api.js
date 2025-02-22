import axios from 'axios';

// Création d'une instance Axios avec la configuration de base
// Notez que nous n'avons plus besoin de spécifier l'URL complète ou les headers d'authentification
// car nous utilisons notre propre proxy qui s'en charge
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  // Ajouter des limites pour éviter les erreurs 431
  maxContentLength: 10 * 1024 * 1024, // 10 MB
  maxBodyLength: 10 * 1024 * 1024, // 10 MB
  maxRedirects: 5,
  timeout: 30000, // 30 secondes
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
  
  // Construire les paramètres de requête pour notre API proxy avec des limites de taille
  const queryParams = {
    // Limiter la taille des mots-clés pour éviter les erreurs 431
    keywords: keywords ? keywords.substring(0, 200) : 'développeur web',
  };
  
  // Ajouter les paramètres conditionnels avec limitation de taille
  if (location) {
    queryParams.location = location.substring(0, 100);
    
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
    // Notez que nous appelons maintenant notre serveur proxy plutôt que l'API directement
    const response = await api.get('/api/jobs', { params: queryParams });
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
    // Notez que nous appelons maintenant notre serveur proxy plutôt que l'API directement
    const response = await api.get(`/api/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
