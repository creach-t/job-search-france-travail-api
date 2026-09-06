import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ResultsTab from '../components/search/ResultsTab';
import AnalysisTab from '../components/search/AnalysisTab';
import MapTab from '../components/search/MapTab';
import { useAppContext } from '../context/AppContext';
import { searchLabel } from '../utils/searchLabel';
import { DEFAULTS } from '../utils/constants';

const TAB_KEYS = ['resultats', 'analyse', 'carte'];

const SearchPage = () => {
  const { homeSearchParams: searchParams } = useAppContext();
  const [urlParams, setUrlParams] = useSearchParams();

  const tabFromUrl = urlParams.get('tab');
  const activeTab = TAB_KEYS.includes(tabFromUrl) ? tabFromUrl : 'resultats';

  const [visited, setVisited] = useState(() => new Set([activeTab]));

  const [currentPage, setCurrentPage] = useState(() => {
    try { return parseInt(sessionStorage.getItem('lastSearchPage') || '0', 10); } catch { return 0; }
  });
  const [pageSize, setPageSize] = useState(() => {
    try { return parseInt(sessionStorage.getItem('lastPageSize') || String(DEFAULTS.PAGE_SIZE), 10); } catch { return DEFAULTS.PAGE_SIZE; }
  });

  const label = searchParams ? (searchLabel(searchParams) || 'Tous métiers') : '';

  useEffect(() => {
    setVisited((v) => (v.has(activeTab) ? v : new Set(v).add(activeTab)));
  }, [activeTab]);

  // Retour page 0 à chaque nouvelle recherche
  useEffect(() => { setCurrentPage(0); }, [searchParams]);

  const switchToResults = () => {
    const next = new URLSearchParams(urlParams);
    next.delete('tab');
    setUrlParams(next, { replace: true });
  };

  const handlePageChange = (page) => {
    try { sessionStorage.setItem('lastSearchPage', String(page)); } catch { /* noop */ }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handlePageSizeChange = (size) => {
    try {
      sessionStorage.setItem('lastPageSize', String(size));
      sessionStorage.setItem('lastSearchPage', '0');
    } catch { /* noop */ }
    setPageSize(size);
    setCurrentPage(0);
  };

  // ── État vide : aucune recherche ──
  if (!searchParams) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center text-center px-6 py-24 animate-fade-in">
        <span className="icon-tile h-16 w-16 bg-accent-gradient text-white mb-5">
          <MagnifyingGlassIcon className="h-8 w-8" />
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
          Cherchez une <span className="gradient-text">offre d'emploi</span>
        </h1>
        <p className="mt-2 text-sm text-ink-muted max-w-md">
          Tapez un métier, un mot-clé ou une ville dans la barre en haut. Une fois la recherche
          lancée, explorez les résultats, leur <strong>analyse</strong> et leur <strong>carte</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {visited.has('resultats') && (
        <div className={activeTab === 'resultats' ? '' : 'hidden'}>
          <ResultsTab
            searchParams={searchParams}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {visited.has('analyse') && (
        <div className={activeTab === 'analyse' ? '' : 'hidden'}>
          <AnalysisTab searchParams={searchParams} label={label} />
        </div>
      )}

      {visited.has('carte') && (
        <div className={activeTab === 'carte' ? '' : 'hidden'}>
          <MapTab searchParams={searchParams} onSwitchToResults={switchToResults} />
        </div>
      )}
    </div>
  );
};

export default SearchPage;
