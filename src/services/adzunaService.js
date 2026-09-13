import axios from 'axios';
import { API } from '../utils/constants';
import { normalizeOffers } from '../domain/adapters';
import { SOURCES } from '../domain/offer';
import { toAdzunaParams } from './adzunaParams';

/**
 * Service Adzuna (via le proxy backend). Le mapping des paramètres est dans
 * `adzunaParams.js` (pur, testable) ; ici on ne gère que les appels réseau et
 * la normalisation en Offer[].
 */

export { toAdzunaParams };

export const getAdzunaConfig = async () => {
  try {
    const { data } = await axios.get(`${API.BASE_URL}${API.ENDPOINTS.ADZUNA_CONFIG}`);
    return data;
  } catch {
    return { configured: false };
  }
};

/**
 * @param {Object} searchParams - paramètres de recherche de l'app
 * @param {{page?:number, resultsPerPage?:number}} opts - page Adzuna (1-based)
 * @returns {Promise<{resultats: import('../domain/offer').Offer[], total: number|null}>}
 */
export const searchAdzunaJobs = async (searchParams = {}, { page = 1, resultsPerPage = 50 } = {}) => {
  const body = { ...toAdzunaParams(searchParams), page, resultsPerPage };
  const { data } = await axios.post(`${API.BASE_URL}${API.ENDPOINTS.ADZUNA_SEARCH}`, body);
  return { resultats: normalizeOffers(data?.results, SOURCES.ADZUNA), total: data?.total ?? null };
};
