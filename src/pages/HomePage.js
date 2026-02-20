import { useState, useMemo } from 'react';
import SearchForm from '../components/SearchForm';
import JobList from '../components/JobList';
import Spinner from '../components/ui/Spinner';
import Error from '../components/ui/Error';
import { useSearchJobs } from '../hooks/useJobs';
import { useAllJobs } from '../hooks/useAllJobs';
import { convertToAnnualSalary } from '../utils/salaryUtils';
import { DEFAULTS, PAGE_SIZE_OPTIONS } from '../utils/constants';

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
      {/* Sélecteur de taille de page */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="hidden sm:inline">Offres par page :</span>
        <div className="flex gap-1">
          {PAGE_SIZE_OPTIONS.map(size => (
            <button
              key={size}
              onClick={() => onPageSizeChange(size)}
              className={`h-8 px-2.5 rounded-md text-sm font-medium transition-colors ${
                size === pageSize ? 'bg-ft-blue text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {size}
            </button>
          ))}
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
  const [searchParams, setSearchParams] = useState(() => {
    try { const s = sessionStorage.getItem('lastSearchParams'); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });
  const [currentPage, setCurrentPage] = useState(() => {
    try { return parseInt(sessionStorage.getItem('lastSearchPage') || '0', 10); }
    catch { return 0; }
  });
  const [pageSize, setPageSize] = useState(() => {
    try { return parseInt(sessionStorage.getItem('lastPageSize') || String(DEFAULTS.PAGE_SIZE), 10); }
    catch { return DEFAULTS.PAGE_SIZE; }
  });

  const hasSalaryFilter = !!searchParams?.salaryMin;

  // Mode normal : pagination API directe (pas de filtre salaire)
  const normalQuery = useSearchJobs(
    hasSalaryFilter ? null : searchParams,
    currentPage,
    pageSize
  );

  // Mode filtre salaire : charge toutes les pages en parallèle, filtre et pagine localement
  const allJobsQuery = useAllJobs(
    hasSalaryFilter ? searchParams : null,
    hasSalaryFilter
  );

  const handleSearch = (params) => {
    sessionStorage.setItem('lastSearchParams', JSON.stringify(params));
    sessionStorage.setItem('lastSearchPage', '0');
    setCurrentPage(0);
    setSearchParams(params);
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

  // ── Calcul des données selon le mode actif ──
  const display = useMemo(() => {
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
        // Indicateur de progression pendant le chargement des pages suivantes
        loadingLabel: isFetching && !isLoading && totalApiPages > 1
          ? `Chargement… (${loadedPages}/${totalApiPages} pages)`
          : null,
      };
    }

    // Mode normal
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
    };
  }, [hasSalaryFilter, normalQuery, allJobsQuery, searchParams, currentPage, pageSize]);

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
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Trouvez votre prochain emploi
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
          Recherchez parmi les offres d'emploi disponibles en France
        </p>
      </div>

      <div className="mb-8">
        <SearchForm onSearch={handleSearch} />
      </div>

      {searchParams && (
        <div>
          {display.isLoading ? (
            <Spinner text={hasSalaryFilter ? "Chargement des offres…" : "Recherche en cours..."} />
          ) : display.isError ? (
            <Error message={display.errorMsg || "Une erreur s'est produite. Veuillez réessayer."} />
          ) : (
            <>
              {/* Bannière trop de résultats */}
              {display.isApiCapped && (
                <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                  <svg className="h-5 w-5 shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <span>
                    Votre recherche correspond à <strong>{display.rawApiTotal?.toLocaleString('fr-FR')} offres</strong>.
                    {' '}Seules les <strong>1 150 premières</strong> sont accessibles — affinez vos critères
                    {' '}(localisation, type de contrat, expérience…) pour voir les résultats les plus pertinents.
                  </span>
                </div>
              )}

              {/* En-tête résultats */}
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  <span className="text-ft-blue font-bold">
                    {display.totalCount !== null
                      ? display.totalCount.toLocaleString('fr-FR')
                      : display.jobs.length}
                  </span>
                  {' '}offre{display.totalCount !== 1 ? 's' : ''} trouvée{display.totalCount !== 1 ? 's' : ''}
                </h2>

                {/* Progression du chargement multi-pages (filtre salaire) */}
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
