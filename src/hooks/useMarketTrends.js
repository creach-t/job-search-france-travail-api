import { useQuery } from '@tanstack/react-query';
import {
  getMarketConfig, queryMarcheTravail, MT_ENDPOINTS, buildSelection,
  parseStatOffres, parseEvolution, parseTension,
} from '../services/marcheTravail';

/**
 * Tendances RÉELLES issues de l'API SODE (offres/demandes d'emploi), source FT/DARES.
 * Résilient : configured=false si non branché, isError si l'API répond mal — jamais de faux.
 *
 * @param {Object} scope - { codeRome?, codeTypeTerritoire?, codeTerritoire? }
 */
export const useMarketTrends = (scope = {}) => {
  const cfg = useQuery({
    queryKey: ['mt-config'],
    queryFn: getMarketConfig,
    staleTime: 60 * 60 * 1000,
  });

  const configured = cfg.data?.configured === true;

  const q = useQuery({
    queryKey: ['mt-trends', scope],
    enabled: configured,
    staleTime: 6 * 60 * 60 * 1000, // trimestriel → cache long
    retry: 0,
    queryFn: async () => {
      const sel = buildSelection(scope);
      const [stat, evo, tension] = await Promise.allSettled([
        queryMarcheTravail(MT_ENDPOINTS.statOffres, sel),
        queryMarcheTravail(MT_ENDPOINTS.evolution, sel),
        queryMarcheTravail(MT_ENDPOINTS.faciliteRecrutement, sel),
      ]);

      const statOffres = stat.status === 'fulfilled' ? parseStatOffres(stat.value) : null;
      const evolution = evo.status === 'fulfilled' ? parseEvolution(evo.value) : null;
      const tensionData = tension.status === 'fulfilled' ? parseTension(tension.value) : null;

      if (!statOffres && !evolution && !tensionData) {
        // Diagnostic précis : statut d'erreur OU clés de la réponse 200 non parsée
        const diag = [['stat-offres', stat], ['evolution', evo], ['tension', tension]]
          .map(([name, r]) => {
            if (r.status === 'rejected') {
              const d = r.reason?.response?.data;
              const status = d?.status || r.reason?.response?.status || '';
              const detail = d?.detail || d?.message || r.reason?.message || '';
              return `${name}: ERR ${status} ${JSON.stringify(detail).slice(0, 140)}`;
            }
            const v = r.value;
            const keys = v && typeof v === 'object' ? Object.keys(v).slice(0, 10).join(',') : typeof v;
            return `${name}: 200 keys=[${keys}]`;
          })
          .join('  |  ');
        // Trace complète en console pour inspection
        // eslint-disable-next-line no-console
        console.warn('[SODE] réponses:', { stat: stat.value ?? stat.reason?.response?.data, evo: evo.value ?? evo.reason?.response?.data, tension: tension.value ?? tension.reason?.response?.data });
        throw new Error(diag);
      }
      return { statOffres, evolution, tensionData };
    },
  });

  return {
    configured,
    hasScope: cfg.data?.hasScope,
    hasBase: cfg.data?.hasBase,
    isLoading: configured && q.isLoading,
    isError: q.isError,
    error: q.error,
    statOffres: q.data?.statOffres ?? null,
    evolution: q.data?.evolution ?? null,
    tension: q.data?.tensionData ?? null,
    source: 'France Travail / DARES — Statistiques offres & demandes d’emploi',
  };
};
