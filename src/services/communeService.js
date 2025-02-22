import axios from 'axios';
import { API, STORAGE_KEYS } from '../utils/constants';

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
 * Recherche des communes à partir d'un texte (autocomplétion)
 * @param {string} query - Texte de recherche (nom de la commune)
 * @param {number} limit - Nombre maximum de résultats (défaut: 5)
 * @returns {Promise<Array>} - Liste des communes correspondantes
 */
export const searchCommunes = async (query, limit = 5) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await apiClient.get(`${API.ENDPOINTS.COMMUNES}/search`, {
      params: {
        query,
        limit
      }
    });

    return response.data;
  } catch (error) {
    console.error('Erreur lors de la recherche de communes:', error);
    throw new Error('Impossible de rechercher les communes');
  }
};

/**
 * Récupère le détail d'une commune par son code INSEE
 * @param {string} codeInsee - Code INSEE de la commune
 * @returns {Promise<Object>} - Détails de la commune
 */
export const getCommuneByCode = async (codeInsee) => {
  if (!codeInsee) {
    throw new Error('Code INSEE requis');
  }

  try {
    const response = await apiClient.get(`${API.ENDPOINTS.COMMUNES}/${codeInsee}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la commune:', error);
    throw new Error('Commune introuvable');
  }
};

// Service des communes
const communeService = {
  searchCommunes,
  getCommuneByCode
};

export default communeService;
