import { useState, useMemo } from 'react';
import SearchForm from '../components/SearchForm';
import JobList from '../components/JobList';
import Spinner from '../components/ui/Spinner';
import Error from '../components/ui/Error';
import { useSearchJobs } from '../hooks/useJobs';
import { useAllJobs } from '../hooks/useAllJobs';
import { useMultiStackJobs } from '../hooks/useMultiStackJobs';
import { convertToAnnualSalary } from '../utils/salaryUtils';
import { DEFAULTS, PAGE_SIZE_OPTIONS } from '../utils/constants';
import { useAppContext } from '../context/AppContext';

// ─── Barre de contrôle (pagination + taille de page) ───────────────────────
const ResultsBar = ({ currentPage, totalPages, pageSize, onPageChange, onPageSizeChange, showingFrom, showingTo, total, isFetching }) => {
  const btnBase = "inline-flex items-center justify-center h-8 min-w-[32px] px-1.5 rounded-md text-sm font-medium transition-colors";
  const btnActive = "bg-ft-blue text-white";
  const btnNormal = "text-gray-600 hover:bg-gray-100";
  const btnDisabled = "text-gray-300 cursor-not-allowed";

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
      {/* Sélecteur de taille de page — compact */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <span className="hidden sm:inline text-xs text-gray-400">Par page</span>
        <div className="relative">
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
            className="h-8 pl-2.5 pr-7 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 focus:outline-none focus:border-ft-blue focus:ring-1 focus:ring-ft-blue/30 appearance-none cursor-pointer transition-colors hover:bg-white"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info position + pagination */}
      <div className="flex items-center gap-2">
        {total > 0 && (
          <span className="text-sm text-gray-400 shrink-0">
            {showingFrom}–{showingTo} sur {total.toLocaleString('fr-FR')}
          </span>
        )}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0 || isFetching}
              className={`${btnBase} ${currentPage === 0 ? btnDisabled : btnNormal}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {getPages().map((page, i) =>
              page === '...' ? (
                <span key={`e${i}`} className="px-1 text-gray-400 text-sm">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  disabled={isFetching}
                  className={`${btnBase} ${page === currentPage ? btnActive : btnNormal}`}
                >
                  {page + 1}
                </button>
              )
            )}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1 || isFetching}
              className={`${btnBase} ${currentPage >= totalPages - 1 ? btnDisabled : btnNormal}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Page principale ────────────────────────────────────────────────────────
const HomePage = () => {
  const { isDevMode, homeSearchParams: searchParams, updateHomeSearchParams } = useAppContext();
  const [currentPage, setCurrentPage] = useState(() => {
    try { return parseInt(sessionStorage.getItem('lastSearchPage') || '0', 10); }
    catch { return 0; }
  });
  const [pageSize, setPageSize] = useState(() => {
    try { return parseInt(sessionStorage.getItem('lastPageSize') || String(DEFAULTS.PAGE_SIZE), 10); }
    catch { return DEFAULTS.PAGE_SIZE; }
  });

  // ── Détection des modes ──────────────────────────────────────────────────
  const stacks          = searchParams?.stacks ?? [];
  const hasMultiStack   = stacks.length > 0;
  const hasSalaryFilter = !!searchParams?.salaryMin && !hasMultiStack; // salary filtre sur résultats normaux

  // Extraire les params de base sans stacks/keywords pour les requêtes multi-stack
  const baseParamsForStack = useMemo(() => {
    if (!searchParams || !hasMultiStack) return null;
    const { keywords: _kw, stacks: _st, ...rest } = searchParams;
    return rest;
  }, [searchParams, hasMultiStack]);

  // ── Hooks de recherche ───────────────────────────────────────────────────

  // Mode multi-stack : une requête par stack, combinées
  const multiStackQuery = useMultiStackJobs(baseParamsForStack, stacks, hasMultiStack);

  // Mode normal : pagination API directe (pas de filtre salaire, pas de multi-stack)
  const normalQuery = useSearchJobs(
    !hasMultiStack && !hasSalaryFilter ? searchParams : null,
    currentPage,
    pageSize
  );

  // Mode filtre salaire : charge toutes les pages en parallèle, filtre et pagine localement
  const allJobsQuery = useAllJobs(
    hasSalaryFilter ? searchParams : null,
    hasSalaryFilter
  );

  const handleSearch = (params) => {
    sessionStorage.setItem('lastSearchPage', '0');
    setCurrentPage(0);
    updateHomeSearchParams(params);
  };

  const handlePageChange = (page) => {
    sessionStorage.setItem('lastSearchPage', String(page));
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (size) => {
    sessionStorage.setItem('lastPageSize', String(size));
    sessionStorage.setItem('lastSearchPage', '0');
    setPageSize(size);
    setCurrentPage(0);
  };

  // ── Calcul des données selon le mode actif ──────────────────────────────
  const display = useMemo(() => {
    // ── Mode multi-stack ──
    if (hasMultiStack) {
      const { allJobs, isLoading, isFetching, isError, loadedCount, queryCount, totalsPerStack } = multiStackQuery;

      // Filtre salaire optionnel en plus
      const salaryMinAnnual = searchParams?.salaryMin ? parseInt(searchParams.salaryMin, 10) : null;
      const filtered = salaryMinAnnual
        ? allJobs.filter(job => {
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
        ? `Chargement… (${loadedCount}/${queryCount} stacks)`
        : null;

      // Résumé par stack
      const stackSummary = totalsPerStack
        .filter(t => t.apiTotal !== null)
        .map(t => `${t.stack} (${t.fetched})`)
        .join(' · ');

      return {
        jobs: pageJobs,
        totalCount: filtered.length,
        totalPages: pages,
        showingFrom: filtered.length > 0 ? start + 1 : 0,
        showingTo: start + pageJobs.length,
        isLoading,
        isFetching,
        isError,
        isApiCapped: false,
        rawApiTotal: null,
        loadingLabel,
        stackSummary,
        mode: 'multi-stack',
      };
    }

    // ── Mode filtre salaire ──
    if (hasSalaryFilter) {
      const { allJobs, total, isLoading, isFetching, isError, loadedPages, totalApiPages } = allJobsQuery;
      const salaryMinAnnual = parseInt(searchParams.salaryMin, 10);

      const filtered = allJobs.filter(job => {
        if (!job.salaire) return false;
        const annual = convertToAnnualSalary(job.salaire);
        return annual !== null && annual >= salaryMinAnnual;
      });

      const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
      const safePage = Math.min(currentPage, pages - 1);
      const start = safePage * pageSize;
      const pageJobs = filtered.slice(start, start + pageSize);

      return {
        jobs: pageJobs,
        totalCount: filtered.length,
        totalPages: pages,
        showingFrom: filtered.length > 0 ? start + 1 : 0,
        showingTo: start + pageJobs.length,
        isLoading,
        isFetching,
        isError,
        isApiCapped: total !== null && total > DEFAULTS.MAX_TOTAL,
        rawApiTotal: total,
        loadingLabel: isFetching && !isLoading && totalApiPages > 1
          ? `Chargement… (${loadedPages}/${totalApiPages} pages)`
          : null,
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
      jobs,
      totalCount: total,
      totalPages: pages,
      showingFrom: start + 1,
      showingTo: start + jobs.length,
      isLoading,
      isFetching,
      isError,
      isApiCapped: total !== null && total > DEFAULTS.MAX_TOTAL,
      rawApiTotal: total,
      loadingLabel: null,
      errorMsg: error?.message,
      mode: 'normal',
    };
  }, [hasMultiStack, hasSalaryFilter, multiStackQuery, normalQuery, allJobsQuery, searchParams, currentPage, pageSize]);

  const barProps = {
    currentPage,
    totalPages: display.totalPages,
    pageSize,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    showingFrom: display.showingFrom,
    showingTo: display.showingTo,
    total: display.totalCount,
    isFetching: display.isFetching,
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        {isDevMode ? (
          <>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Offres pour développeurs
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Recherche filtrée sur les postes tech &amp; développement en France
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Trouvez votre prochain emploi
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Recherchez parmi les offres d'emploi disponibles en France
            </p>
          </>
        )}
      </div>

      <div className="mb-8">
        <SearchForm
          key={isDevMode ? 'dev' : 'normal'}
          onSearch={handleSearch}
          initialKeywords={isDevMode ? 'développeur' : ''}
          initialContractType={isDevMode ? 'CDI' : ''}
        />
      </div>

      {searchParams && (
        <div>
          {display.isLoading ? (
            <Spinner text={
              hasMultiStack
                ? `Recherche sur ${stacks.length} stack${stacks.length > 1 ? 's' : ''}…`
                : hasSalaryFilter
                  ? "Chargement des offres…"
                  : "Recherche en cours..."
            } />
          ) : display.isError ? (
            <Error message={display.errorMsg || "Une erreur s'est produite. Veuillez réessayer."} />
          ) : (
            <>
              {/* En-tête résultats */}
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-lg font-semibold text-gray-900">
                    <span className="text-ft-blue font-bold">
                      {display.totalCount !== null
                        ? display.totalCount.toLocaleString('fr-FR')
                        : display.jobs.length}
                    </span>
                    {' '}offre{display.totalCount !== 1 ? 's' : ''} trouvée{display.totalCount !== 1 ? 's' : ''}
                  </h2>

                  {/* Tooltip limitation API */}
                  {display.isApiCapped && (
                    <div className="relative group">
                      <button className="p-0.5 rounded-full text-amber-400 hover:text-amber-500 hover:bg-amber-50 transition-colors" aria-label="Limitation de l'API">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-72 bg-gray-900 text-white text-xs rounded-lg px-3 py-2.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <strong>{display.rawApiTotal?.toLocaleString('fr-FR')} offres</strong> correspondent à votre recherche.
                        {' '}Seules les <strong>1 150 premières</strong> sont accessibles — affinez vos critères pour des résultats plus ciblés.
                      </div>
                    </div>
                  )}

                  {/* Tooltip multi-stack */}
                  {display.mode === 'multi-stack' && display.stackSummary && (
                    <div className="relative group">
                      <button className="p-0.5 rounded-full text-ft-blue hover:bg-ft-blue/10 transition-colors" aria-label="Détail par stack">
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

                {/* Progression chargement */}
                {display.loadingLabel && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <svg className="animate-spin h-3.5 w-3.5 text-ft-blue" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {display.loadingLabel}
                  </span>
                )}

                {display.isFetching && !display.isLoading && !display.loadingLabel && (
                  <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
              </div>

              <ResultsBar {...barProps} />
              <JobList jobs={display.jobs} />
              <ResultsBar {...barProps} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
