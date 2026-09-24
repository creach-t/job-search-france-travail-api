/**
 * Fusion multi-sources d'offres (Offer[]) en un flux unique.
 *
 * - Dé-duplication inter-sources par (intitulé + entreprise) normalisés : une même
 *   offre publiée sur France Travail ET Adzuna n'apparaît qu'une fois.
 * - Priorité : les listes passées en premier gagnent en cas de doublon
 *   (on met France Travail avant Adzuna → on garde la fiche FT, plus riche).
 * - Tri par date de création décroissante (offres sans date en dernier).
 *
 * Pur, sans dépendance React → testable isolément.
 */

/** Clé de dé-duplication inter-sources. */
export const dedupeKey = (offer) => {
  const title = (offer?.intitule || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const company = (offer?.entreprise?.nom || '').toLowerCase().replace(/\s+/g, ' ').trim();
  return `${title}|${company}`;
};

const ts = (offer) => (offer?.dateCreation ? Date.parse(offer.dateCreation) : NaN);

/**
 * @param {Array<import('./offer').Offer[]>} lists - listes par source, dans l'ordre de priorité
 * @param {{ sort?: 'date'|'none' }} [opts]
 * @returns {import('./offer').Offer[]}
 */
export const mergeOffers = (lists = [], { sort = 'date' } = {}) => {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const offer of list || []) {
      if (!offer) continue;
      const key = dedupeKey(offer);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(offer);
    }
  }
  if (sort === 'date') {
    out.sort((a, b) => {
      const ta = ts(a);
      const tb = ts(b);
      if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
      if (Number.isNaN(ta)) return 1;   // sans date → en dernier
      if (Number.isNaN(tb)) return -1;
      return tb - ta;                    // plus récent d'abord
    });
  }
  return out;
};

/** Compte les offres par source dans une liste fusionnée. */
export const countBySource = (offers = []) => {
  const counts = {};
  for (const o of offers) {
    const s = o?.source || 'inconnu';
    counts[s] = (counts[s] || 0) + 1;
  }
  return counts;
};
