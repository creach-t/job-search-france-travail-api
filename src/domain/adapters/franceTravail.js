/**
 * Adaptateur France Travail (offres v2) → Offer canonique.
 *
 * La forme brute de France Travail EST le contrat canonique (voir domain/offer.js),
 * donc cet adaptateur est quasi-identité : il garantit un `id` chaîne, tague la
 * `source` et reste défensif. Les autres sources, elles, feront un vrai mapping.
 */
import { SOURCES } from '../offer';

/** @returns {import('../offer').Offer|null} */
export const fromFranceTravail = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    ...raw,
    id: raw.id != null ? String(raw.id) : undefined,
    source: SOURCES.FRANCE_TRAVAIL,
  };
};

/** @returns {import('../offer').Offer[]} */
export const fromFranceTravailList = (list) =>
  Array.isArray(list) ? list.map(fromFranceTravail).filter(Boolean) : [];
