import axios from 'axios';
import { API } from '../utils/constants';

/**
 * Enrichissement « entreprise » via le proxy backend (données INSEE/SIRENE).
 * Le backend gère le cache et le throttling ; ici on reste simple.
 */

/**
 * Recherche une entreprise par nom (+ code postal optionnel).
 * @returns {Promise<Object>} objet normalisé { found, matchConfidence, siren, ... }
 */
export const lookupEntreprise = async ({ nom, codePostal } = {}) => {
  if (!nom || nom.trim().length < 2) return { found: false };
  try {
    const { data } = await axios.get(`${API.BASE_URL}/entreprises/search`, {
      params: { nom: nom.trim(), codePostal: codePostal || undefined },
    });
    return data || { found: false };
  } catch (error) {
    console.error('Erreur enrichissement entreprise:', error.message);
    return { found: false, error: true };
  }
};

/**
 * Enrichit une liste d'entreprises en une seule requête (onglet Analyse).
 * @param {Array<{nom:string, codePostal?:string}>} companies
 * @returns {Promise<Array<{nom:string, result:Object}>>}
 */
export const lookupEntreprisesBulk = async (companies = []) => {
  const clean = (companies || []).filter((c) => c?.nom && c.nom.trim().length >= 2);
  if (clean.length === 0) return [];
  try {
    const { data } = await axios.post(`${API.BASE_URL}/entreprises/bulk`, { companies: clean });
    return Array.isArray(data?.results) ? data.results : [];
  } catch (error) {
    console.error('Erreur enrichissement entreprises (bulk):', error.message);
    return [];
  }
};
