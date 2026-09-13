/**
 * Traduction PURE des paramètres de recherche de l'app (forme France Travail :
 * codes INSEE, codeROME…) vers les paramètres Adzuna (plein-texte + nom de lieu).
 * Sans dépendance réseau → testable isolément.
 *
 * - Adzuna cherche par NOM de lieu (`where`), pas par code INSEE → on utilise
 *   `locationLabel` (nom de la commune), jamais `location` (code).
 * - Pas de ROME chez Adzuna → on retombe sur le libellé du métier comme mot-clé.
 * - `salaryMin` est annuel des deux côtés.
 */
export const toAdzunaParams = (searchParams = {}) => {
  const p = searchParams || {};
  const out = {};

  if (Array.isArray(p.stacks) && p.stacks.length > 0) {
    out.what_or = p.stacks.join(' '); // OR des stacks (React OU Vue…)
  } else {
    const what = p.keywords || p.codeROMELabel;
    if (what) out.what = what;
  }

  if (p.locationLabel) {
    out.where = p.locationLabel;
    // distance seulement avec un lieu, et on ignore « sur place » ('0')
    if (p.distance && p.distance !== '0') out.distance = p.distance;
  }
  if (p.salaryMin) out.salaryMin = p.salaryMin;
  if (p.contractType) out.contractType = p.contractType; // CDI/CDD/MIS (serveur mappe)
  if (p.workingHours) out.workingHours = p.workingHours; // 'true'/'false'

  return out;
};
