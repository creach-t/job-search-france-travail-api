import axios from 'axios';
import { API, DEFAULTS, STORAGE_KEYS } from '../utils/constants';

/**
 * Client API configuré pour communiquer avec le serveur intermédiaire
 */
const apiClient = axios.create({
  baseURL: API.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

/**
 * Intercepteur pour ajouter le token d'authentification aux requêtes
 */
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

/**
 * Fonction pour authentifier l'application auprès de l'API France Travail
 * @returns {Promise<string>} - Token d'authentification
 */
export const authenticate = async () => {
  try {
    const response = await apiClient.post(API.ENDPOINTS.AUTH);
    const { token } = response.data;
    
    // Stocker le token dans le localStorage
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    
    return token;
  } catch (error) {
    console.error('Erreur d\'authentification:', error.response || error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de s\'authentifier. Veuillez réessayer.'
    );
  }
};

/**
 * Transforme les paramètres de recherche pour l'API
 * @param {Object} params - Paramètres de recherche
 * @returns {Object} - Paramètres formatés pour l'API
 */
const buildSearchParams = (params) => {
  const { keywords, location, distance, experience, contractType, qualification, workingHours, codeROME } = params;

  return {
    keywords: keywords || DEFAULTS.DEFAULT_KEYWORDS,
    location: location || undefined,
    distance: distance || DEFAULTS.DEFAULT_DISTANCE,
    experience: experience || undefined,
    contractType: contractType || undefined,
    qualification: qualification || undefined,
    workingHours: workingHours || undefined,
    codeROME: codeROME || undefined,
    limit: DEFAULTS.SEARCH_LIMIT
  };
};

/**
 * Recherche des offres d'emploi
 * @param {Object} params - Paramètres de recherche
 * @returns {Promise<Object>} - Résultats de la recherche
 */
export const searchJobs = async (params) => {
  if (!params) {
    throw new Error('Paramètres de recherche requis');
  }
  
  try {
    // Vérifier si un token existe, sinon s'authentifier
    if (!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) {
      await authenticate();
    }
    
    const searchParams = buildSearchParams(params);
    const response = await apiClient.post(API.ENDPOINTS.SEARCH_JOBS, searchParams);
    return response.data;
  } catch (error) {
    // Si erreur 401 (Unauthorized), tenter de ré-authentifier et réessayer
    if (error.response && error.response.status === 401) {
      try {
        await authenticate();
        const searchParams = buildSearchParams(params);
        const response = await apiClient.post(API.ENDPOINTS.SEARCH_JOBS, searchParams);
        return response.data;
      } catch (retryError) {
        console.error('Erreur lors de la tentative de ré-authentification:', retryError);
        throw new Error('Session expirée. Veuillez rafraîchir la page et réessayer.');
      }
    }
    
    console.error('Erreur lors de la recherche d\'emplois:', error.response || error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de rechercher les offres d\'emploi. Veuillez réessayer.'
    );
  }
};

/**
 * Récupère les détails d'une offre d'emploi par son ID
 * @param {string} id - ID de l'offre
 * @returns {Promise<Object>} - Détails de l'offre
 */
export const getJobById = async (id) => {
  if (!id) {
    throw new Error('ID de l\'offre requis');
  }
  
  try {
    // Vérifier si un token existe, sinon s'authentifier
    if (!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) {
      await authenticate();
    }
    
    const response = await apiClient.get(`${API.ENDPOINTS.JOB_DETAILS}/${id}`);
    return response.data;
  } catch (error) {
    // Si erreur 401 (Unauthorized), tenter de ré-authentifier et réessayer
    if (error.response && error.response.status === 401) {
      try {
        await authenticate();
        const response = await apiClient.get(`${API.ENDPOINTS.JOB_DETAILS}/${id}`);
        return response.data;
      } catch (retryError) {
        console.error('Erreur lors de la tentative de ré-authentification:', retryError);
        throw new Error('Session expirée. Veuillez rafraîchir la page et réessayer.');
      }
    }
    
    console.error(`Erreur lors de la récupération de l'offre ID ${id}:`, error.response || error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de récupérer les détails de cette offre. Veuillez réessayer.'
    );
  }
};

/**
 * Recherche des métiers dans le référentiel ROME
 * @param {string} query - Terme de recherche (min 2 caractères)
 * @returns {Promise<Array>} - Liste des métiers correspondants
 */
export const searchMetiers = async (query = '') => {
  try {
    const url = query.trim().length >= 2
      ? `${API.BASE_URL}/rome/metiers?query=${encodeURIComponent(query)}`
      : `${API.BASE_URL}/rome/metiers`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche de métiers:', error);
    // En cas d'erreur, retourner une liste vide plutôt que de lancer une erreur
    return [];
  }
};

// Service API exporté
const apiService = {
  authenticate,
  searchJobs,
  getJobById,
  searchMetiers
};

export default apiService;
