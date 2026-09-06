/**
 * Constantes et utilitaires pour le moteur de comptage par facettes.
 * Chaque comptage = 1 requête "0-1" qui ne lit que le total exact (Content-Range).
 */

// 14 grands domaines ROME (code lettre accepté par le paramètre `grandDomaine`)
export const ROME_GRANDS_DOMAINES = [
  { code: 'M', label: 'Support à l’entreprise' },
  { code: 'N', label: 'Transport & logistique' },
  { code: 'J', label: 'Santé' },
  { code: 'D', label: 'Commerce & vente' },
  { code: 'G', label: 'Hôtellerie, tourisme, loisirs' },
  { code: 'H', label: 'Industrie' },
  { code: 'F', label: 'Construction & BTP' },
  { code: 'K', label: 'Services à la personne' },
  { code: 'I', label: 'Installation & maintenance' },
  { code: 'C', label: 'Banque & assurance' },
  { code: 'A', label: 'Agriculture & nature' },
  { code: 'E', label: 'Communication & médias' },
  { code: 'B', label: 'Arts & façonnage' },
  { code: 'L', label: 'Spectacle' },
];

// Régions métropolitaines + principales (code INSEE accepté par `region`)
export const REGIONS = [
  { code: '11', label: 'Île-de-France' },
  { code: '84', label: 'Auvergne-Rhône-Alpes' },
  { code: '75', label: 'Nouvelle-Aquitaine' },
  { code: '76', label: 'Occitanie' },
  { code: '44', label: 'Grand Est' },
  { code: '32', label: 'Hauts-de-France' },
  { code: '93', label: "Provence-Alpes-Côte d'Azur" },
  { code: '52', label: 'Pays de la Loire' },
  { code: '28', label: 'Normandie' },
  { code: '53', label: 'Bretagne' },
  { code: '24', label: 'Centre-Val de Loire' },
  { code: '27', label: 'Bourgogne-Franche-Comté' },
  { code: '94', label: 'Corse' },
];

// Types de contrat pour la répartition
export const CONTRAT_FACETS = [
  { code: 'CDI', label: 'CDI' },
  { code: 'CDD', label: 'CDD' },
  { code: 'MIS', label: 'Intérim' },
  { code: 'SAI', label: 'Saisonnier' },
];

// Fenêtres de fraîcheur (jours) — paramètre `publieeDepuis` (valeurs API : 1,3,7,14,31)
export const FRESHNESS_WINDOWS = [1, 3, 7, 14, 31];

// Métiers populaires (généralistes, tous secteurs) pour le classement du dashboard.
// Codes ROME → comptés via le paramètre `codeROME`.
export const POPULAR_METIERS = [
  { code: 'M1607', label: 'Secrétariat' },
  { code: 'D1507', label: 'Employé de libre-service' },
  { code: 'N4105', label: 'Conduite / livraison (courte distance)' },
  { code: 'J1501', label: 'Soins d’hygiène / aide-soignant' },
  { code: 'G1602', label: 'Personnel de cuisine' },
  { code: 'M1805', label: 'Développement informatique' },
  { code: 'D1106', label: 'Vente en alimentation' },
  { code: 'K1302', label: 'Aide à domicile' },
  { code: 'M1203', label: 'Comptabilité' },
  { code: 'F1602', label: 'Électricité bâtiment' },
  { code: 'N1103', label: 'Magasinage & manutention' },
  { code: 'D1403', label: 'Relation commerciale (particuliers)' },
  { code: 'J1506', label: 'Soins infirmiers' },
  { code: 'H2914', label: 'Soudage manuel' },
];

/**
 * Exécute `worker` sur chaque item avec une concurrence limitée (respect des quotas).
 * @param {Array} items
 * @param {(item:any, index:number)=>Promise<any>} worker
 * @param {number} limit - nombre max de requêtes simultanées
 * @returns {Promise<Array>} résultats dans l'ordre des items
 */
export const mapWithConcurrency = async (items, worker, limit = 6) => {
  const results = new Array(items.length);
  let cursor = 0;

  const runNext = async () => {
    const i = cursor++;
    if (i >= items.length) return;
    results[i] = await worker(items[i], i);
    return runNext();
  };

  const runners = Array.from({ length: Math.min(limit, items.length) }, runNext);
  await Promise.all(runners);
  return results;
};
