import axios from 'axios';
import { API, DEFAULTS } from '../utils/constants';

/**
 * Client API configuré pour les requêtes vers France Travail
 */
const apiClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

/**
 * Transforme les paramètres de recherche pour l'API France Travail
 * @param {Object} params - Paramètres de recherche
 * @returns {Object} - Paramètres formatés pour l'API
 */
const buildSearchParams = (params) => {
  const { keywords, location, distance, experience, contractType, qualification, workingHours } = params;
  
  // Paramètres obligatoires
  const apiParams = {
    motsCles: keywords || DEFAULTS.DEFAULT_KEYWORDS,
    distance: distance || DEFAULTS.DEFAULT_DISTANCE,
    origineOffre: 1, // 1 = France Travail
    minCreationDate: "now-1M", // Offres créées dans le dernier mois
    maxCreationDate: "now", // Jusqu'à maintenant
    domaine: 'M18', // Domaine informatique (code M18 de France Travail)
    typeContrat: contractType || undefined,
    qualification: qualification || undefined,
    natureContrat: workingHours || undefined,
    experience: experience || undefined,
    codeROME: [
      "M1805", // Études et développement informatique
      "M1810", // Production et exploitation de systèmes d'information
      "M1802" // Expertise et support en systèmes d'information
    ],
    sort: 0, // Tri par pertinence (0) ou date (1)
    range: `0-${DEFAULTS.SEARCH_LIMIT - 1}`, // Pagination
  };
  
  // Ajout de la localisation si disponible
  if (location) {
    apiParams.commune = location;
  }
  
  return apiParams;
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
    const searchParams = buildSearchParams(params);
    const response = await apiClient.post(API.FRANCE_TRAVAIL.SEARCH, searchParams);
    return response.data;
  } catch (error) {
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
    const response = await apiClient.get(`${API.FRANCE_TRAVAIL.JOB_DETAILS}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'offre ID ${id}:`, error.response || error);
    throw new Error(
      error.response?.data?.message || 
      'Impossible de récupérer les détails de cette offre. Veuillez réessayer.'
    );
  }
};

export default {
  searchJobs,
  getJobById
};
