import { useMemo } from 'react';
import JobList from '../JobList';
import Spinner from '../ui/Spinner';
import Error from '../ui/Error';
import { useSearchJobs } from '../../hooks/useJobs';
import { useAllJobs } from '../../hooks/useAllJobs';
import { useMultiStackJobs } from '../../hooks/useMultiStackJobs';
import { convertToAnnualSalary } from '../../utils/salaryUtils';
import { DEFAULTS, PAGE_SIZE_OPTIONS } from '../../utils/constants';

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
      {/* Sélecteur de taille de page */}
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

      {/* Info position + pagination */}
      <div className="flex items-center gap-2">
        {total > 0 && (
          <span className="text-sm text-ink-faint shrink-0 hidden sm:inline">
            {showingFrom}–{showingTo} sur {total.toLocaleString('fr-FR')}
          </span>
        )}
        {totalPages > 1 && (
          <>
            {/* Mobile */}
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

            {/* Desktop */}
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

// ─── Onglet Résultats ─────────────────────────────────────────────────────
const ResultsTab = ({ searchParams, currentPage, pageSize, onPageChange, onPageSizeChange }) => {
  const stacks = searchParams?.stacks ?? [];
  const hasMultiStack = stacks.length > 0;
  const hasSalaryFilter = !!searchParams?.salaryMin && !hasMultiStack;

  const baseParamsForStack = useMemo(() => {
    if (!searchParams || !hasMultiStack) return null;
    const { keywords: _kw, stacks: _st, ...rest } = searchParams;
    return rest;
  }, [searchParams, hasMultiStack]);

  const multiStackQuery = useMultiStackJobs(baseParamsForStack, stacks, hasMultiStack);
  const normalQuery = useSearchJobs(
    !hasMultiStack && !hasSalaryFilter ? searchParams : null,
    currentPage,
    pageSize
  );
  const allJobsQuery = useAllJobs(hasSalaryFilter ? searchParams : null, hasSalaryFilter);

  const display = useMemo(() => {
    // ── Mode multi-stack ──
    if (hasMultiStack) {
      const { allJobs, isLoading, isFetching, isError, loadedCount, queryCount, totalsPerStack } = multiStackQuery;
      const salaryMinAnnual = searchParams?.salaryMin ? parseInt(searchParams.salaryMin, 10) : null;
      const filtered = salaryMinAnnual
        ? allJobs.filter((job) => {
            if (!job.salaire) return false;
            const annual = convertToAnnualSalary(job.salaire);
            return annual !== null && annual >= salaryMinAnnual;
          })
        : allJobs;

      const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
      const safePage = Math.min(currentPage, pages - 1);
      const start = safePage * pageSize;
      const pageJobs = filtered.slice(start, start + pageSize);

      const loadingLabel = isFetching && !isLoading && queryCount > 1
        ? `Chargement… (${loadedCount}/${queryCount} stacks)` : null;
      const stackSummary = totalsPerStack.filter((t) => t.apiTotal !== null)
        .map((t) => `${t.stack} (${t.fetched})`).join(' · ');

      return {
        jobs: pageJobs, totalCount: filtered.length, totalPages: pages,
        showingFrom: filtered.length > 0 ? start + 1 : 0, showingTo: start + pageJobs.length,
        isLoading, isFetching, isError, isApiCapped: false, rawApiTotal: null,
        loadingLabel, stackSummary, mode: 'multi-stack',
      };
    }

    // ── Mode filtre salaire ──
    if (hasSalaryFilter) {
      const { allJobs, total, isLoading, isFetching, isError, loadedPages, totalApiPages } = allJobsQuery;
      const salaryMinAnnual = parseInt(searchParams.salaryMin, 10);
      const filtered = allJobs.filter((job) => {
        if (!job.salaire) return false;
        const annual = convertToAnnualSalary(job.salaire);
        return annual !== null && annual >= salaryMinAnnual;
      });
      const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
      const safePage = Math.min(currentPage, pages - 1);
      const start = safePage * pageSize;
      const pageJobs = filtered.slice(start, start + pageSize);

      return {
        jobs: pageJobs, totalCount: filtered.length, totalPages: pages,
        showingFrom: filtered.length > 0 ? start + 1 : 0, showingTo: start + pageJobs.length,
        isLoading, isFetching, isError,
        isApiCapped: total !== null && total > DEFAULTS.MAX_TOTAL, rawApiTotal: total,
        loadingLabel: isFetching && !isLoading && totalApiPages > 1
          ? `Chargement… (${loadedPages}/${totalApiPages} pages)` : null,
        mode: 'salary',
      };
    }

    // ── Mode normal ──
    const { data, isLoading, isFetching, isError, error } = normalQuery;
    const jobs = data?.resultats ?? [];
    const total = data?.total ?? null;
    const accessible = total !== null ? Math.min(total, DEFAULTS.MAX_TOTAL) : null;
    const pages = accessible !== null ? Math.ceil(accessible / pageSize) : 1;
    const start = currentPage * pageSize;

    return {
      jobs, totalCount: total, totalPages: pages,
      showingFrom: start + 1, showingTo: start + jobs.length,
      isLoading, isFetching, isError,
      isApiCapped: total !== null && total > DEFAULTS.MAX_TOTAL, rawApiTotal: total,
      loadingLabel: null, errorMsg: error?.message, mode: 'normal',
    };
  }, [hasMultiStack, hasSalaryFilter, multiStackQuery, normalQuery, allJobsQuery, searchParams, currentPage, pageSize]);

  const barProps = {
    currentPage, totalPages: display.totalPages, pageSize,
    onPageChange, onPageSizeChange,
    showingFrom: display.showingFrom, showingTo: display.showingTo,
    total: display.totalCount, isFetching: display.isFetching,
  };

  if (display.isLoading) {
    return (
      <Spinner text={
        hasMultiStack
          ? `Recherche sur ${stacks.length} stack${stacks.length > 1 ? 's' : ''}…`
          : hasSalaryFilter ? 'Chargement des offres…' : 'Recherche en cours...'
      } />
    );
  }
  if (display.isError) {
    return <Error message={display.errorMsg || "Une erreur s'est produite. Veuillez réessayer."} />;
  }

  return (
    <>
      {/* En-tête résultats */}
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <div className="flex items-center gap-1.5">
          <h2 className="text-lg font-semibold text-ink">
            <span className="text-accent font-bold">
              {display.totalCount !== null ? display.totalCount.toLocaleString('fr-FR') : display.jobs.length}
            </span>{' '}
            offre{display.totalCount !== 1 ? 's' : ''} trouvée{display.totalCount !== 1 ? 's' : ''}
          </h2>

          {display.isApiCapped && (
            <div className="relative group">
              <button className="p-0.5 rounded-full text-amber-400 hover:text-amber-500 transition-colors" aria-label="Limitation de l'API">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-72 bg-gray-900 text-white text-xs rounded-lg px-3 py-2.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <strong>{display.rawApiTotal?.toLocaleString('fr-FR')} offres</strong> correspondent à votre recherche.{' '}
                Seules les <strong>1 150 premières</strong> sont accessibles — affinez vos critères.
              </div>
            </div>
          )}

          {display.mode === 'multi-stack' && display.stackSummary && (
            <div className="relative group">
              <button className="p-0.5 rounded-full text-accent hover:bg-accent/10 transition-colors" aria-label="Détail par stack">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-72 bg-gray-900 text-white text-xs rounded-lg px-3 py-2.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                Résultats combinés et dédupliqués — {display.stackSummary}
              </div>
            </div>
          )}
        </div>

        {display.loadingLabel && (
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <svg className="animate-spin h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {display.loadingLabel}
          </span>
        )}

        {display.isFetching && !display.isLoading && !display.loadingLabel && (
          <svg className="animate-spin h-4 w-4 text-ink-faint" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </div>

      <ResultsBar {...barProps} />
      <JobList jobs={display.jobs} />
      <ResultsBar {...barProps} />
    </>
  );
};

export default ResultsTab;
