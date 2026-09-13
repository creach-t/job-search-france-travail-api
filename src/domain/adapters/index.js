/**
 * Registre d'adaptateurs de sources d'offres.
 *
 * Point d'entrée unique pour normaliser une charge brute (une API externe) vers
 * le modèle Offer canonique. Pour ajouter une source :
 *   1. écrire `domain/adapters/maSource.js` exportant `fromMaSource(raw)`
 *      (et éventuellement `fromMaSourceList(list)`) ;
 *   2. l'enregistrer ci-dessous dans ADAPTERS (ou via `registerAdapter`) ;
 *   3. côté services, appeler `normalizeOffers(data, SOURCES.MA_SOURCE)`.
 * Aucun composant d'UI ni l'analyse n'ont besoin d'être modifiés.
 */
import { SOURCES } from '../offer';
import { fromFranceTravail, fromFranceTravailList } from './franceTravail';
import { fromAdzuna, fromAdzunaList } from './adzuna';

const listFromOne = (one) => (list) =>
  Array.isArray(list) ? list.map(one).filter(Boolean) : [];

const ADAPTERS = {
  [SOURCES.FRANCE_TRAVAIL]: { one: fromFranceTravail, many: fromFranceTravailList },
  [SOURCES.ADZUNA]: { one: fromAdzuna, many: fromAdzunaList },
};

/** Enregistre dynamiquement un adaptateur pour une nouvelle source. */
export const registerAdapter = (source, { one, many } = {}) => {
  if (!source || typeof one !== 'function') {
    throw new Error('registerAdapter: `source` et `one` (fonction) sont requis');
  }
  ADAPTERS[source] = { one, many: many || listFromOne(one) };
};

/** Normalise une offre brute → Offer. */
export const normalizeOffer = (raw, source = SOURCES.FRANCE_TRAVAIL) =>
  (ADAPTERS[source]?.one || fromFranceTravail)(raw);

/** Normalise une liste d'offres brutes → Offer[]. */
export const normalizeOffers = (list, source = SOURCES.FRANCE_TRAVAIL) =>
  (ADAPTERS[source]?.many || fromFranceTravailList)(list);

/** Sources disposant d'un adaptateur enregistré. */
export const registeredSources = () => Object.keys(ADAPTERS);
