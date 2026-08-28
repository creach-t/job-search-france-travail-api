import { useCallback, useRef, useState } from 'react';
import { runFullSweep } from '../services/sweep';

/**
 * Pilote le balayage complet à la demande (couverture ~100 %).
 * Retourne l'état + start(baseParams) + cancel().
 */
export const useFullSweep = () => {
  const stopRef = useRef(false);
  const [state, setState] = useState({
    status: 'idle', // idle | running | done | error | cancelled
    jobs: [],
    total: null,
    collected: 0,
    requests: 0,
    capped: false,
    error: null,
  });

  const cancel = useCallback(() => {
    stopRef.current = true;
    setState((s) => (s.status === 'running' ? { ...s, status: 'cancelled' } : s));
  }, []);

  const start = useCallback(async (baseParams) => {
    stopRef.current = false;
    setState({ status: 'running', jobs: [], total: null, collected: 0, requests: 0, capped: false, error: null });

    try {
      const result = await runFullSweep(baseParams, {
        shouldStop: () => stopRef.current,
        maxRequests: 300,
        onProgress: ({ requests, collected, total }) =>
          setState((s) => ({ ...s, requests, collected, total })),
      });
      setState((s) => ({
        ...s,
        status: stopRef.current ? 'cancelled' : 'done',
        jobs: result.jobs,
        total: result.total,
        collected: result.jobs.length,
        requests: result.requests,
        capped: result.capped,
      }));
    } catch (error) {
      setState((s) => ({ ...s, status: 'error', error: error?.message || 'Erreur pendant le balayage' }));
    }
  }, []);

  return { ...state, start, cancel };
};
