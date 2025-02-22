import axios from 'axios';

// API geo.api.gouv.fr pour récupérer les codes INSEE
const API_BASE_URL = 'https://geo.api.gouv.fr/communes';

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
    const response = await axios.get(`${API_BASE_URL}`, {
      params: {
        nom: query,
        fields: 'nom,code,codesPostaux,population',
        boost: 'population',
        limit: limit
      }
    });

    // Transformer les résultats pour faciliter l'utilisation
    return response.data.map(commune => ({
      code: commune.code, // Code INSEE
      nom: commune.nom,
      codesPostaux: commune.codesPostaux || [],
      population: commune.population
    }));
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
    const response = await axios.get(`${API_BASE_URL}/${codeInsee}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la commune:', error);
    throw new Error('Commune introuvable');
  }
};

export default {
  searchCommunes,
  getCommuneByCode
};
