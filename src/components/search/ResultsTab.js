import { useMemo, useState, useEffect } from 'react';
import JobList from '../JobList';
import Spinner from '../ui/Spinner';
import Error from '../ui/Error';
import { useUnifiedJobs } from '../../hooks/useUnifiedJobs';
import { PAGE_SIZE_OPTIONS } from '../../utils/constants';
import { SOURCES, getSourceMeta } from '../../domain/offer';
import { offerScore } from '../../domain/offerScore';
import { convertToAnnualSalary } from '../../utils/salaryUtils';

const SORT_OPTIONS = [
  { value: 'details', label: 'Offres les plus détaillées' },
  { value: 'date', label: 'Plus récentes' },
  { value: 'salary', label: 'Salaire décroissant' },
];

// ─── Barre de contrôle (pagination + taille de page) ───────────────────────
const ResultsBar = ({ currentPage, totalPages, pageSize, onPageChange, onPageSizeChange, showingFrom, showingTo, total, isFetching }) => {
  const btnBase = 'inline-flex items-center justify-center h-8 min-w-[32px] px-1.5 rounded-md text-sm font-medium transition-colors';
  const btnActive = 'bg-accent-gradient text-white shadow-glow-violet';
  const btnNormal = 'text-ink-muted hover:bg-[var(--glass-hover)]';
  const btnDisabled = 'text-ink-faint cursor-not-allowed';

  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left = Math.max(0, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    if (left > 0) { pages.push(0); if (left > 1) pages.push('...'); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) { if (right < totalPages - 2) pages.push('...'); pages.push(totalPages - 1); }
    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-1">
      <div className="flex items-center gap-1.5 text-sm text-ink-muted">
        <span className="text-xs text-ink-faint">Par page</span>
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="glass-input h-8 pl-2.5 pr-7 rounded-lg text-sm font-medium text-ink appearance-none cursor-pointer"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="h-3 w-3 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {total > 0 && (
          <span className="text-sm text-ink-faint shrink-0 hidden sm:inline">
            {showingFrom}–{showingTo} sur {total.toLocaleString('fr-FR')}
          </span>
        )}
        {totalPages > 1 && (
          <>
            <div className="flex items-center gap-1 sm:hidden">
              <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0 || isFetching}
                className={`${btnBase} ${currentPage === 0 ? btnDisabled : btnNormal}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm text-ink-muted px-2 shrink-0">{currentPage + 1} / {totalPages}</span>
              <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1 || isFetching}
                className={`${btnBase} ${currentPage >= totalPages - 1 ? btnDisabled : btnNormal}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1">
              <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0 || isFetching}
                className={`${btnBase} ${currentPage === 0 ? btnDisabled : btnNormal}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {getPages().map((page, i) =>
                page === '...' ? (
                  <span key={`e${i}`} className="px-1 text-ink-faint text-sm">…</span>
                ) : (
                  <button key={page} onClick={() => onPageChange(page)} disabled={isFetching}
                    className={`${btnBase} ${page === currentPage ? btnActive : btnNormal}`}>
                    {page + 1}
                  </button>
                )
              )}
              <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1 || isFetching}
                className={`${btnBase} ${currentPage >= totalPages - 1 ? btnDisabled : btnNormal}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Puce de filtre par source ──────────────────────────────────────────────
const SourceChip = ({ active, onClick, label, count, dotColor }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-colors ${
      active ? 'bg-accent/15 text-accent border border-accent/30' : 'glass-card glass-hover text-ink-muted hover:text-ink'
    }`}
  >
    {dotColor && <span className="h-2 w-2 rounded-full" style={{ background: dotColor }} aria-hidden="true" />}
    {label}
    <span className="tabular-nums text-ink-faint">{count.toLocaleString('fr-FR')}</span>
  </button>
);

// ─── Onglet Résultats (flux unifié FT + Adzuna) ─────────────────────────────
const ResultsTab = ({ searchParams, currentPage, pageSize, onPageChange, onPageSizeChange }) => {
  const unified = useUnifiedJobs(searchParams);
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | source key
  const [sort, setSort] = useState('details');             // tri par défaut : richesse d'infos

  // Réinitialise le filtre de source quand la recherche change
  const paramsKey = useMemo(() => JSON.stringify(searchParams || {}), [searchParams]);
  useEffect(() => { setSourceFilter('all'); }, [paramsKey]);

  const filtered = useMemo(() => (
    sourceFilter === 'all' ? unified.jobs : unified.jobs.filter((j) => j.source === sourceFilter)
  ), [unified.jobs, sourceFilter]);

  // Tri intelligent : par complétude (défaut), date, ou salaire — date en départage
  const sorted = useMemo(() => {
    const dt = (o) => (o.dateCreation ? Date.parse(o.dateCreation) : -Infinity);
    const list = [...filtered];
    if (sort === 'date') {
      list.sort((a, b) => dt(b) - dt(a));
    } else if (sort === 'salary') {
      const sal = (o) => convertToAnnualSalary(o.salaire) ?? -Infinity;
      list.sort((a, b) => (sal(b) - sal(a)) || (dt(b) - dt(a)));
    } else {
      list.sort((a, b) => (offerScore(b) - offerScore(a)) || (dt(b) - dt(a)));
    }
    return list;
  }, [filtered, sort]);

  const changeSort = (v) => { setSort(v); onPageChange(0); };

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages - 1);
  const start = safePage * pageSize;
  const pageJobs = sorted.slice(start, start + pageSize);

  const ftCount = unified.counts[SOURCES.FRANCE_TRAVAIL] || 0;
  const azCount = unified.counts[SOURCES.ADZUNA] || 0;
  const showSourceFilter = unified.adzunaConfigured && azCount > 0;

  const barProps = {
    currentPage: safePage, totalPages, pageSize, onPageChange, onPageSizeChange,
    showingFrom: totalCount > 0 ? start + 1 : 0, showingTo: start + pageJobs.length,
    total: totalCount, isFetching: unified.isFetching,
  };

  if (unified.isLoading) {
    return <Spinner text={unified.hasMultiStack ? 'Recherche multi-stack…' : 'Recherche en cours…'} />;
  }
  if (unified.isError) {
    return <Error message="Une erreur s'est produite. Veuillez réessayer." />;
  }

  return (
    <>
      {/* En-tête résultats */}
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <h2 className="text-lg font-semibold text-ink">
          <span className="text-accent font-bold">{totalCount.toLocaleString('fr-FR')}</span>{' '}
          offre{totalCount !== 1 ? 's' : ''} dans le flux
        </h2>

        {unified.ftCapped && (
          <div className="relative group">
            <button className="p-0.5 rounded-full text-amber-400 hover:text-amber-500 transition-colors" aria-label="Limitation de l'API">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-72 bg-gray-900 text-white text-xs rounded-lg px-3 py-2.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
              <strong>{unified.ftTotal?.toLocaleString('fr-FR')} offres</strong> France Travail correspondent — le flux est limité aux 1 150 plus récentes (affinez vos critères).
            </div>
          </div>
        )}

        {unified.isFetching && (
          <svg className="animate-spin h-4 w-4 text-ink-faint" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}

        {/* Tri */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-ink-faint hidden sm:inline">Trier</span>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => changeSort(e.target.value)}
              className="glass-input h-8 pl-2.5 pr-7 rounded-lg text-sm font-medium text-ink appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="h-3 w-3 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filtre par source (visible si Adzuna configurée et présente) */}
      {showSourceFilter && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <SourceChip active={sourceFilter === 'all'} onClick={() => setSourceFilter('all')} label="Toutes" count={unified.jobs.length} />
          <SourceChip active={sourceFilter === SOURCES.FRANCE_TRAVAIL} onClick={() => setSourceFilter(SOURCES.FRANCE_TRAVAIL)}
            label={getSourceMeta(SOURCES.FRANCE_TRAVAIL).label} count={ftCount} dotColor="#60a5fa" />
          <SourceChip active={sourceFilter === SOURCES.ADZUNA} onClick={() => setSourceFilter(SOURCES.ADZUNA)}
            label={getSourceMeta(SOURCES.ADZUNA).label} count={azCount} dotColor="#34d399" />
        </div>
      )}

      <ResultsBar {...barProps} />
      <JobList jobs={pageJobs} />
      <ResultsBar {...barProps} />
    </>
  );
};

export default ResultsTab;
