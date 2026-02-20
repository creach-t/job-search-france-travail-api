import axios from 'axios';
import { API, DEFAULTS, STORAGE_KEYS, PAGE_SIZE_OPTIONS } from '../utils/constants';

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
const buildSearchParams = (params, page = 0, pageSize = DEFAULTS.PAGE_SIZE) => {
  const { keywords, location, distance, experience, contractType, qualification, workingHours, codeROME, salaryMin } = params;

  // Conversion de workingHours en tempsPlein (booléen attendu par l'API)
  let tempsPlein;
  if (workingHours === 'true') tempsPlein = true;
  else if (workingHours === 'false') tempsPlein = false;

  // Valider pageSize contre les valeurs autorisées
  const validPageSize = PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : DEFAULTS.PAGE_SIZE;

  // Calcul du range selon la page (ex: page=1, size=25 → "25-49")
  const start = page * validPageSize;
  const end = start + validPageSize - 1;
  const range = `${start}-${Math.min(end, DEFAULTS.MAX_TOTAL - 1)}`;

  return {
    keywords: keywords || (codeROME ? undefined : DEFAULTS.DEFAULT_KEYWORDS),
    location: location || undefined,
    distance: distance !== undefined && distance !== '' ? distance : DEFAULTS.DEFAULT_DISTANCE,
    experience: experience || undefined,
    contractType: contractType || undefined,
    qualification: qualification || undefined,
    tempsPlein,
    codeROME: codeROME || undefined,
    salaryMin: salaryMin || undefined,
    range,
  };
};

/**
 * Recherche des offres d'emploi
 * @param {Object} params - Paramètres de recherche
 * @returns {Promise<Object>} - Résultats de la recherche
 */
export const searchJobs = async (params, page = 0, pageSize = DEFAULTS.PAGE_SIZE) => {
  if (!params) throw new Error('Paramètres de recherche requis');

  const doSearch = async () => {
    const searchParams = buildSearchParams(params, page, pageSize);
    const response = await apiClient.post(API.ENDPOINTS.SEARCH_JOBS, searchParams);
    return response.data;
  };

  try {
    if (!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) await authenticate();
    return await doSearch();
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        await authenticate();
        return await doSearch();
      } catch {
        throw new Error('Session expirée. Veuillez rafraîchir la page et réessayer.');
      }
    }
    throw new Error(error.response?.data?.message || 'Impossible de rechercher les offres d\'emploi.');
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
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Erreur lors de la recherche de métiers:', error);
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
