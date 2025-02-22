import axios from 'axios';

// API geo.api.gouv.fr pour récupérer les codes INSEE
const API_BASE_URL = 'https://geo.api.gouv.fr/communes';

// Cas spécial pour Paris - l'API France Travail attend les codes des arrondissements
const handleParisCode = (commune) => {
  // Si c'est Paris (75056), on doit proposer les arrondissements
  if (commune.code === '75056') {
    // Si le nom contient déjà un numéro d'arrondissement, on l'utilise
    const arrMatch = commune.nom.match(/(\\d+)[eè]me? arrondissement/i);
    if (arrMatch) {
      const arrNum = parseInt(arrMatch[1], 10);
      // Formater le code d'arrondissement (75101 pour le 1er, 75102 pour le 2e, etc.)
      return `751${arrNum.toString().padStart(2, '0')}`;
    }
    // Par défaut, on renvoie Paris 1er arrondissement
    return '75101';
  }
  return commune.code;
};

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

    // Cas spécial pour Paris - ajouter les arrondissements si Paris est dans les résultats
    let results = response.data;
    
    // Rechercher si Paris est dans les résultats
    const parisIndex = results.findIndex(commune => commune.code === '75056');
    
    if (parisIndex !== -1) {
      // Remplacer Paris par Paris 1er arrondissement
      results[parisIndex] = {
        ...results[parisIndex],
        nom: 'Paris 1er arrondissement',
        code: '75101'
      };
      
      // Si on a moins de 5 résultats, on ajoute d'autres arrondissements
      if (results.length < limit && query.toLowerCase() === 'paris') {
        // Ajouter quelques arrondissements populaires
        const arrondissements = [
          { nom: 'Paris 2e arrondissement', code: '75102', codesPostaux: ['75002'] },
          { nom: 'Paris 8e arrondissement', code: '75108', codesPostaux: ['75008'] },
          { nom: 'Paris 16e arrondissement', code: '75116', codesPostaux: ['75016'] },
          { nom: 'Paris 18e arrondissement', code: '75118', codesPostaux: ['75018'] }
        ];
        
        // Ajouter les arrondissements jusqu'à atteindre la limite
        for (let i = 0; i < arrondissements.length && results.length < limit; i++) {
          results.push(arrondissements[i]);
        }
      }
    }

    // Transformer les résultats pour faciliter l'utilisation
    return results.map(commune => ({
      code: handleParisCode(commune),
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

// Création d'un objet pour l'export par défaut - corrige l'avertissement ESLint
const communeService = {
  searchCommunes,
  getCommuneByCode
};

export default communeService;
