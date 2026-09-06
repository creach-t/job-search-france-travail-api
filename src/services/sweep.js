/**
 * Balayage complet « à la demande » : récupère TOUTES les offres d'une recherche
 * malgré le plafond de 1 150 offres/requête, en segmentant par fenêtres de dates
 * (minCreationDate / maxCreationDate). Chaque segment dont le total dépasse le
 * plafond est bissecté dans le temps jusqu'à passer sous le seuil, puis paginé.
 * Fusion + déduplication par id.
 *
 * Garde-fous quotas : exécution séquentielle, plafond de requêtes, annulation,
 * progression. Pensé pour la recherche / le journalisme (couverture ~100 %).
 */
import { searchJobs, countJobs } from './api';

export const MAX_PER_QUERY = 1150; // plafond API récupérable
const PAGE = 150;                  // taille de page max par requête
const MIN_WINDOW_MS = 60 * 60 * 1000; // en-deçà d'1 h on arrête de bissecter

const iso = (d) => d.toISOString().slice(0, 19) + 'Z';

/**
 * @param {Object} baseParams - critères de recherche (sans dates)
 * @param {Object} opts
 * @param {(p:{requests:number, collected:number, total:number|null})=>void} opts.onProgress
 * @param {()=>boolean} opts.shouldStop - renvoie true pour annuler
 * @param {number} opts.maxRequests - plafond de requêtes (défaut 300)
 * @param {string} opts.since - date ISO de début de fenêtre globale (défaut 2010-01-01)
 * @returns {Promise<{jobs:Array, total:number|null, requests:number, capped:boolean}>}
 */
export const runFullSweep = async (baseParams, opts = {}) => {
  const { onProgress, shouldStop, maxRequests = 300, since = '2010-01-01T00:00:00Z' } = opts;

  const seen = new Set();
  const jobs = [];
  let requests = 0;
  let capped = false;

  const add = (list) => {
    (list || []).forEach((job) => {
      if (job && job.id && !seen.has(job.id)) { seen.add(job.id); jobs.push(job); }
    });
  };
  const stop = () => (shouldStop && shouldStop()) || requests >= maxRequests;
  const emit = (total) => onProgress && onProgress({ requests, collected: jobs.length, total });

  const total = await countJobs(baseParams); requests++;
  emit(total);
  if (!total) return { jobs, total, requests, capped };

  // Fenêtre paginée : récupère toutes les pages d'un segment (≤ plafond)
  const fetchWindow = async (params, count) => {
    const pages = Math.ceil(Math.min(count, MAX_PER_QUERY) / PAGE);
    for (let p = 0; p < pages; p++) {
      if (stop()) return;
      const data = await searchJobs(params, p, PAGE); requests++;
      add(data.resultats);
      emit(total);
    }
  };

  // Traitement récursif d'une fenêtre temporelle
  const processWindow = async (min, max) => {
    if (stop()) return;
    const params = { ...baseParams, minCreationDate: iso(min), maxCreationDate: iso(max) };
    const count = await countJobs(params); requests++;
    emit(total);
    if (count === 0) return;

    if (count <= MAX_PER_QUERY) {
      await fetchWindow(params, count);
      return;
    }
    // Trop d'offres : bissection temporelle
    if (max.getTime() - min.getTime() <= MIN_WINDOW_MS) {
      // Fenêtre trop fine pour bissecter : on prend le maximum récupérable
      capped = true;
      await fetchWindow(params, MAX_PER_QUERY);
      return;
    }
    const mid = new Date((min.getTime() + max.getTime()) / 2);
    await processWindow(min, mid);
    await processWindow(mid, max);
  };

  // Cas simple : tout tient sous le plafond → pagination directe
  if (total <= MAX_PER_QUERY) {
    await fetchWindow(baseParams, total);
  } else {
    await processWindow(new Date(since), new Date());
  }

  return { jobs, total, requests, capped };
};

export const _sweepInternal = { iso, MIN_WINDOW_MS };
