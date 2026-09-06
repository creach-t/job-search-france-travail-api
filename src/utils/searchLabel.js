/**
 * Helpers partagés autour des paramètres de recherche (`homeSearchParams`).
 *
 * - `searchLabel(params)` : libellé lisible d'une recherche, pour les en-têtes,
 *   les exports et la barre de statut de la carte.
 * - `toBulkParams(params)` : normalise les params pour les hooks d'agrégation
 *   (`useAllJobs`) — les stacks multi-select sont convertis en mots-clés.
 */
import { contractOptions, experienceOptions, qualificationOptions } from '../components/SearchForm/options';

const labelOf = (options, value) => options.find((o) => o.value === value)?.label;

export function searchLabel(params) {
  if (!params) return '';
  const { keywords, stacks, location, locationLabel, distance, contractType, experience, qualification, codeROME } = params;

  const parts = [];

  if (stacks?.length > 0) parts.push(stacks.join(' · '));
  else if (keywords) parts.push(`"${keywords}"`);
  else if (codeROME) parts.push(`ROME ${codeROME}`);
  else parts.push('Tous métiers');

  if (location) {
    const city = locationLabel || location;
    const dist = distance === '0' ? 'lieu exact' : distance ? `${distance} km` : '';
    parts.push(dist ? `${city} · ${dist}` : city);
  }

  const c = labelOf(contractOptions, contractType);
  if (c && contractType) parts.push(c);

  const e = labelOf(experienceOptions, experience);
  if (e && experience) parts.push(e);

  const q = labelOf(qualificationOptions, qualification);
  if (q && qualification) parts.push(q);

  return parts.join(' — ');
}

/**
 * Normalise les params pour un chargement en masse (analyse / carte) :
 * les stacks (multi-select DevJobs) deviennent des mots-clés uniques.
 */
export function toBulkParams(params) {
  if (!params) return null;
  const { stacks, keywords, ...rest } = params;
  if (stacks?.length > 0) return { ...rest, keywords: stacks.join(' ') };
  return params;
}
