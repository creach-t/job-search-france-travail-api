import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon,
  MapPinIcon, BriefcaseIcon, ListBulletIcon, ChartBarSquareIcon, MapIcon, HeartIcon,
} from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';
import Brand from './Brand';
import { useAppContext } from '../../context/AppContext';
import { searchMetiers } from '../../services/api';
import { searchCommunes } from '../../services/communeService';
import {
  contractOptions, experienceOptions, qualificationOptions, workingHoursOptions, stackGroups,
} from '../SearchForm/options';

const DISTANCES = [
  { value: '0', label: 'Sur place' }, { value: '5', label: '5 km' }, { value: '10', label: '10 km' },
  { value: '20', label: '20 km' }, { value: '30', label: '30 km' }, { value: '50', label: '50 km' }, { value: '100', label: '100 km' },
];

const TABS = [
  { key: 'resultats', label: 'Résultats', icon: ListBulletIcon },
  { key: 'analyse', label: 'Analyse', icon: ChartBarSquareIcon },
  { key: 'carte', label: 'Carte', icon: MapIcon },
];
const TAB_KEYS = TABS.map((t) => t.key);

const CommandBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [urlParams, setUrlParams] = useSearchParams();
  const { isDevMode, savedJobs, homeSearchParams, updateHomeSearchParams } = useAppContext();

  const onSearchRoute = location.pathname === '/';
  const activeTab = TAB_KEYS.includes(urlParams.get('tab')) ? urlParams.get('tab') : 'resultats';

  const [text, setText] = useState('');
  const [metier, setMetier] = useState(null);
  const [commune, setCommune] = useState(null);
  const [keyword, setKeyword] = useState('');   // mot-clé validé (chip)
  const [distance, setDistance] = useState('10');
  const [filters, setFilters] = useState({
    contractType: '', experience: '', qualification: '', workingHours: '', salaryMin: '', stacks: [],
  });

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [sugg, setSugg] = useState({ metiers: [], communes: [], loading: false });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // La barre reflète toujours la recherche en cours
  useEffect(() => {
    if (!homeSearchParams) { setMetier(null); setCommune(null); setKeyword(''); return; }
    const p = homeSearchParams;
    setMetier(p.codeROME ? { code: p.codeROME, libelle: p.codeROMELabel || p.codeROME } : null);
    setCommune(p.location ? { code: p.location, nom: p.locationLabel || 'Commune', codesPostaux: [] } : null);
    setKeyword(!p.codeROME && p.keywords ? p.keywords : '');
    setDistance(p.distance || '10');
    setFilters({
      contractType: p.contractType || '', experience: p.experience || '',
      qualification: p.qualification || '', workingHours: p.workingHours || '',
      salaryMin: p.salaryMin || '', stacks: p.stacks || [],
    });
  }, [homeSearchParams]);

  // Recherche intelligente (suggestions métiers + villes)
  useEffect(() => {
    const q = text.trim();
    if (q.length < 2) { setSugg({ metiers: [], communes: [], loading: false }); return undefined; }
    setSugg((s) => ({ ...s, loading: true }));
    const t = setTimeout(async () => {
      const [m, c] = await Promise.all([searchMetiers(q).catch(() => []), searchCommunes(q).catch(() => [])]);
      setSugg({ metiers: (Array.isArray(m) ? m : []).slice(0, 5), communes: (Array.isArray(c) ? c : []).slice(0, 5), loading: false });
    }, 250);
    return () => clearTimeout(t);
  }, [text]);

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) { setSuggestOpen(false); setFiltersOpen(false); }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const activeFilterCount = useMemo(() => (
    [filters.contractType, filters.experience, filters.qualification, filters.workingHours, filters.salaryMin].filter(Boolean).length + filters.stacks.length
  ), [filters]);

  const buildParams = useCallback((keywordText) => {
    const params = { distance: distance || '10' };
    const kw = (keywordText && keywordText.trim()) || keyword;
    if (metier) { params.codeROME = metier.code; params.codeROMELabel = metier.libelle; }
    else if (kw) params.keywords = kw.trim().slice(0, 20);
    else if (filters.stacks.length === 0 && isDevMode) params.keywords = 'développeur';

    if (commune) { params.location = commune.code; params.locationLabel = commune.nom; }
    if (filters.contractType) params.contractType = filters.contractType;
    if (filters.experience) params.experience = filters.experience;
    if (filters.qualification) params.qualification = filters.qualification;
    if (filters.workingHours) params.workingHours = filters.workingHours;
    if (filters.salaryMin) params.salaryMin = filters.salaryMin;
    if (filters.stacks.length > 0) params.stacks = filters.stacks;
    return params;
  }, [distance, metier, commune, keyword, filters, isDevMode]);

  const runSearch = useCallback((keywordText) => {
    updateHomeSearchParams(buildParams(keywordText));
    try { sessionStorage.setItem('lastSearchPage', '0'); } catch { /* noop */ }
    setSuggestOpen(false); setFiltersOpen(false); setText('');
    const next = new URLSearchParams(urlParams);
    next.delete('tab'); next.delete('q');
    if (onSearchRoute) setUrlParams(next, { replace: true }); else navigate('/');
  }, [buildParams, updateHomeSearchParams, urlParams, onSearchRoute, setUrlParams, navigate]);

  const goToTab = useCallback((key) => {
    const next = new URLSearchParams(onSearchRoute ? urlParams : '');
    if (key === 'resultats') next.delete('tab'); else next.set('tab', key);
    next.delete('q');
    if (onSearchRoute) setUrlParams(next, { replace: true });
    else navigate(`/${next.toString() ? `?${next}` : ''}`);
  }, [onSearchRoute, urlParams, setUrlParams, navigate]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); runSearch(text); }
    else if (e.key === 'Escape') setSuggestOpen(false);
    else if (e.key === 'Backspace' && text === '') {
      if (commune) setCommune(null); else if (metier) setMetier(null); else if (keyword) setKeyword('');
    }
  };

  const pickMetier = (m) => { setMetier(m); setKeyword(''); setText(''); setSuggestOpen(false); inputRef.current?.focus(); };
  const pickCommune = (c) => { setCommune(c); setText(''); setSuggestOpen(false); inputRef.current?.focus(); };

  const hasSuggestions = sugg.metiers.length > 0 || sugg.communes.length > 0 || text.trim().length >= 2;
  const searchActive = !!homeSearchParams;
  const hasChips = metier || commune || keyword;

  const toggleStack = (value) => setFilters((f) => ({
    ...f, stacks: f.stacks.includes(value) ? f.stacks.filter((s) => s !== value) : [...f.stacks, value],
  }));

  const selectCls = 'glass-input w-full h-9 rounded-lg px-2.5 text-sm text-ink';

  return (
    <header className="sticky top-0 z-30 px-3 pt-3">
      <div ref={wrapRef} className="glass-card glass-card-strong px-3 py-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Marque (une seule variante à la fois) */}
          <div className="shrink-0 lg:hidden"><Brand compact /></div>
          <div className="shrink-0 hidden lg:block"><Brand /></div>

          {/* Zone de recherche */}
          <div className="relative order-last w-full lg:order-none lg:flex-1 lg:w-auto min-w-[220px]">
            <div className="glass-input flex items-center gap-1.5 rounded-xl pl-3 pr-1.5 py-1.5 min-h-[42px] flex-wrap">
              <MagnifyingGlassIcon className="h-5 w-5 text-ink-faint shrink-0" aria-hidden="true" />

              {metier && (
                <Chip icon={BriefcaseIcon} label={metier.libelle} onRemove={() => setMetier(null)} />
              )}
              {keyword && !metier && (
                <Chip icon={MagnifyingGlassIcon} label={keyword} onRemove={() => setKeyword('')} />
              )}
              {commune && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-400/12 border border-cyan-400/30 pl-2 pr-1 py-0.5 text-xs font-medium text-cyan-300">
                  <MapPinIcon className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[120px]">{commune.nom}</span>
                  <select value={distance} onChange={(e) => setDistance(e.target.value)}
                    className="bg-transparent text-cyan-200/90 text-[11px] font-semibold outline-none cursor-pointer" title="Rayon">
                    {DISTANCES.map((d) => <option key={d.value} value={d.value} className="text-ink bg-[var(--surface)]">{d.label}</option>)}
                  </select>
                  <button type="button" onClick={() => setCommune(null)} className="rounded p-0.5 hover:bg-cyan-400/20" aria-label="Retirer la ville">
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}

              <input
                ref={inputRef} type="text" value={text}
                onChange={(e) => { setText(e.target.value); setSuggestOpen(true); }}
                onFocus={() => setSuggestOpen(true)} onKeyDown={onKeyDown}
                placeholder={hasChips ? 'Affiner…' : 'Métier, mot-clé ou ville…'}
                className="flex-1 min-w-[100px] bg-transparent border-0 outline-none text-sm text-ink placeholder:text-ink-faint py-1"
                aria-label="Recherche"
              />

              {(text || hasChips) && (
                <button type="button" onClick={() => runSearch(text)}
                  className="shrink-0 inline-flex items-center justify-center h-8 px-3 rounded-lg bg-accent-gradient text-white text-sm font-semibold shadow-glow-violet hover:opacity-90 transition">
                  <MagnifyingGlassIcon className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Rechercher</span>
                </button>
              )}
            </div>

            {/* Suggestions */}
            {suggestOpen && text.trim().length >= 2 && hasSuggestions && (
              <div className="cmd-panel cmd-pop absolute left-0 right-0 mt-2 z-40 p-1.5 max-h-[60vh] overflow-auto">
                <button type="button" onClick={() => runSearch(text)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-[var(--glass-hover)] transition-colors">
                  <MagnifyingGlassIcon className="h-4 w-4 text-ink-faint shrink-0" />
                  <span className="text-sm text-ink">Rechercher «&nbsp;<strong>{text.trim()}</strong>&nbsp;»</span>
                </button>
                {sugg.metiers.length > 0 && (
                  <div className="mt-1">
                    <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Métiers</p>
                    {sugg.metiers.map((m) => (
                      <button key={m.code} type="button" onClick={() => pickMetier(m)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-[var(--glass-hover)] transition-colors">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent shrink-0">{m.code}</span>
                        <span className="text-sm text-ink truncate">{m.libelle}</span>
                      </button>
                    ))}
                  </div>
                )}
                {sugg.communes.length > 0 && (
                  <div className="mt-1">
                    <p className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-faint">Villes</p>
                    {sugg.communes.map((c) => (
                      <button key={c.code} type="button" onClick={() => pickCommune(c)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left hover:bg-[var(--glass-hover)] transition-colors">
                        <MapPinIcon className="h-4 w-4 text-cyan-300 shrink-0" />
                        <span className="text-sm text-ink truncate">{c.nom}</span>
                        {c.codesPostaux?.[0] && <span className="text-xs text-ink-faint ml-auto shrink-0">{c.codesPostaux[0]}</span>}
                      </button>
                    ))}
                  </div>
                )}
                {sugg.loading && <p className="px-2.5 py-2 text-xs text-ink-faint">Recherche…</p>}
              </div>
            )}
          </div>

          {/* Filtres */}
          <div className="relative shrink-0">
            <button type="button" onClick={() => { setFiltersOpen((v) => !v); setSuggestOpen(false); }}
              className={`inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-sm font-medium transition-colors ${
                filtersOpen || activeFilterCount > 0 ? 'bg-accent/15 text-accent border border-accent/30' : 'glass-card glass-hover text-ink-muted hover:text-ink'
              }`}>
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Filtres</span>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold">{activeFilterCount}</span>
              )}
            </button>

            {filtersOpen && (
              <div className="cmd-panel cmd-pop absolute z-40 p-4 mt-2 right-0 w-[340px] max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-[70px] max-sm:w-auto">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Contrat"><select value={filters.contractType} onChange={(e) => setFilters((f) => ({ ...f, contractType: e.target.value }))} className={selectCls}>{contractOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
                  <Field label="Expérience"><select value={filters.experience} onChange={(e) => setFilters((f) => ({ ...f, experience: e.target.value }))} className={selectCls}>{experienceOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
                  <Field label="Qualification"><select value={filters.qualification} onChange={(e) => setFilters((f) => ({ ...f, qualification: e.target.value }))} className={selectCls}>{qualificationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
                  <Field label="Temps de travail"><select value={filters.workingHours} onChange={(e) => setFilters((f) => ({ ...f, workingHours: e.target.value }))} className={selectCls}>{workingHoursOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
                </div>
                <div className="mt-3">
                  <Field label="Salaire min. (€/an brut)"><input type="number" min="0" step="1000" value={filters.salaryMin} onChange={(e) => setFilters((f) => ({ ...f, salaryMin: e.target.value }))} placeholder="Ex : 35000" className={selectCls} /></Field>
                </div>
                {isDevMode && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-1.5">Stacks</p>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-auto">
                      {stackGroups.flatMap((g) => g.options).map((o) => {
                        const on = filters.stacks.includes(o.value);
                        return (
                          <button key={o.value} type="button" onClick={() => toggleStack(o.value)}
                            className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${on ? 'bg-accent/15 text-accent border-accent/30' : 'border-[rgb(var(--line)/0.25)] text-ink-muted hover:text-ink'}`}>
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between gap-2">
                  <button type="button" onClick={() => setFilters({ contractType: '', experience: '', qualification: '', workingHours: '', salaryMin: '', stacks: [] })}
                    className="text-xs text-ink-faint hover:text-ink">Réinitialiser</button>
                  <button type="button" onClick={() => runSearch(text)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-gradient text-white text-sm font-semibold shadow-glow-violet hover:opacity-90 transition">Appliquer</button>
                </div>
              </div>
            )}
          </div>

          {/* Onglets */}
          {searchActive && (
            <div className="flex items-center gap-1 p-1 rounded-xl glass-card order-last w-full justify-center lg:order-none lg:w-auto shrink-0">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => goToTab(key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    onSearchRoute && activeTab === key ? 'bg-accent-gradient text-white shadow-glow-violet' : 'text-ink-muted hover:text-ink hover:bg-[var(--glass-hover)]'
                  }`} title={label}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Favoris + thème */}
          <Link to="/favoris" title="Favoris"
            className="relative shrink-0 glass-card glass-hover inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-muted hover:text-accent">
            <HeartIcon className="h-5 w-5" />
            {savedJobs.length > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-[16px] h-4 items-center justify-center rounded-full bg-magenta px-1 text-[10px] font-bold text-white">{savedJobs.length}</span>
            )}
          </Link>
          <div className="shrink-0"><ThemeToggle /></div>
        </div>
      </div>
    </header>
  );
};

// Chip accent (métier / mot-clé). Classes statiques → non purgées par Tailwind.
const Chip = ({ icon: Icon, label, onRemove }) => (
  <span className="inline-flex items-center gap-1 rounded-lg bg-accent/12 border border-accent/30 pl-2 pr-1 py-0.5 text-xs font-medium text-accent">
    <Icon className="h-3.5 w-3.5" />
    <span className="truncate max-w-[160px]">{label}</span>
    <button type="button" onClick={onRemove} className="rounded p-0.5 hover:bg-accent/20" aria-label="Retirer">
      <XMarkIcon className="h-3 w-3" />
    </button>
  </span>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[11px] font-medium text-ink-faint uppercase tracking-wide mb-1">{label}</label>
    {children}
  </div>
);

export default CommandBar;
