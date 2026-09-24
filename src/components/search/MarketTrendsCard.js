import React, { useMemo } from 'react';
import { PresentationChartLineIcon } from '@heroicons/react/24/outline';
import { MiniArea } from '../charts';
import { useMarketTrends } from '../../hooks/useMarketTrends';

const fmt = (n) => (n === null || n === undefined ? '—' : Number(n).toLocaleString('fr-FR'));
const pct = (n) => (n === null || n === undefined ? '—' : `${Math.round(n)} %`);

/**
 * Tendances RÉELLES du marché (API SODE France Travail / DARES) : volume d'offres
 * par trimestre, évolution, part CDI / cadre. Alimente l'onglet Analyse.
 *
 * Se gate elle-même : si l'API n'est pas configurée (FT_STATS_SCOPE absent) ou
 * si aucune donnée, la carte ne s'affiche pas — l'onglet reste inchangé.
 */
const MarketTrendsCard = ({ searchParams }) => {
  const scope = useMemo(() => ({
    codeRome: searchParams?.codeROME || undefined,
    ...(searchParams?.departement
      ? { codeTypeTerritoire: 'DEP', codeTerritoire: searchParams.departement }
      : {}),
  }), [searchParams]);

  const { configured, isLoading, isError, series, latest, growthPct, source } = useMarketTrends(scope);

  // Étiquette courte « T1 2021 » (depuis codePeriode « 2021T1 ») pour un axe lisible
  const shortPeriod = (s) => {
    const m = /^(\d{4})T(\d)$/.exec(s.codePeriode || '');
    return m ? `T${m[2]} ${m[1]}` : (s.period || '');
  };
  const points = useMemo(
    () => (series || []).map((s) => ({ label: shortPeriod(s), value: s.value })),
    [series]
  );

  // Pas configurée → on n'affiche rien (aucun bruit dans l'onglet).
  if (!configured) return null;

  const up = growthPct != null && growthPct >= 0;

  return (
    <section className="glass-card p-4 flex flex-col md:col-span-2 xl:col-span-3">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="icon-tile h-8 w-8 shrink-0 text-white bg-gradient-to-br from-sky-500 to-indigo-600">
          <PresentationChartLineIcon style={{ width: 18, height: 18 }} />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-ink truncate">Tendances du marché</h3>
          <p className="text-[11px] text-ink-faint truncate">
            {scope.codeRome ? `Métier ${scope.codeRome}` : 'Tous métiers'}
            {scope.codeTerritoire ? ` · dép. ${scope.codeTerritoire}` : ' · France'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-xs text-ink-faint py-8">
          <svg className="animate-spin h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          Chargement des tendances…
        </div>
      ) : isError || points.length < 2 ? (
        <p className="text-xs text-ink-faint py-8 text-center">Tendances indisponibles pour ce périmètre.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
            <div className="glass-card px-3 py-2">
              <p className="text-[11px] text-ink-faint">Offres (dernier trim.)</p>
              <p className="text-lg font-extrabold text-sky-300 tabular-nums">{fmt(latest?.value)}</p>
            </div>
            <div className="glass-card px-3 py-2">
              <p className="text-[11px] text-ink-faint">Évolution</p>
              <p className={`text-lg font-extrabold tabular-nums ${up ? 'text-emerald-400' : 'text-magenta'}`}>
                {growthPct == null ? '—' : `${up ? '+' : ''}${Math.round(growthPct)} %`}
              </p>
            </div>
            <div className="glass-card px-3 py-2">
              <p className="text-[11px] text-ink-faint">Part CDI</p>
              <p className="text-lg font-extrabold text-indigo-300 tabular-nums">{pct(latest?.cdiPct)}</p>
            </div>
            <div className="glass-card px-3 py-2">
              <p className="text-[11px] text-ink-faint">Part cadre</p>
              <p className="text-lg font-extrabold text-violet-300 tabular-nums">{pct(latest?.cadrePct)}</p>
            </div>
          </div>
          <MiniArea points={points} />
          <p className="mt-2 text-[11px] text-ink-faint">{source}</p>
        </>
      )}
    </section>
  );
};

export default MarketTrendsCard;
