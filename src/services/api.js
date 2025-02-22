import axios from 'axios';

// Création d'une instance Axios avec la configuration de base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
    'Content-Type': 'application/json',
  },
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
  const {
    keywords,
    location,
    distance,
    experience,
    contractType,
  } = params;
  
  // Construire les paramètres de requête pour l'API
  const queryParams = {
    // Paramètres par défaut pour les développeurs web
    motsCles: keywords || 'développeur,web,informatique',
    sort: 1, // Tri par date de création décroissante
    range: '0-49', // 50 résultats maximum
    publieeDepuis: 31, // Offres publiées depuis 31 jours max
  };
  
  // Ajouter la recherche par lieu si spécifiée
  if (location) {
    queryParams.commune = location;
    
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
    queryParams.typeContrat = contractType;
  }
  
  try {
    const response = await api.get('', { params: queryParams });
    return response.data;
  } catch (error) {
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
