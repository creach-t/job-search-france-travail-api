import { useState, useRef, useEffect } from 'react';

/**
 * Affiche le nom de l'entreprise.
 * Si des infos supplémentaires existent (logo, description, url, effectif),
 * un clic ouvre une infobulle avec ces détails.
 */
const CompanyPopover = ({ entreprise, trancheEffectif, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const hasExtra = entreprise?.logo || entreprise?.description || entreprise?.url || trancheEffectif;

  // Fermer au clic extérieur
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!entreprise?.nom) return null;

  // Pas d'infos supplémentaires → texte simple
  if (!hasExtra) {
    return <span className={className}>{entreprise.nom}</span>;
  }

  return (
    <div className="relative inline-block max-w-full" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
        className={`${className} inline-flex items-center gap-1 hover:text-ft-blue transition-colors cursor-pointer group/cpop`}
      >
        <span className="truncate">{entreprise.nom}</span>
        <svg
          className={`shrink-0 h-3 w-3 transition-colors ${open ? 'text-ft-blue' : 'text-gray-300 group-hover/cpop:text-ft-blue/60'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-40 left-0 top-full mt-1.5 w-72 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête logo + nom */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            {entreprise.logo ? (
              <img
                src={entreprise.logo}
                alt={entreprise.nom}
                className="h-10 w-10 rounded-lg object-contain border border-gray-100 bg-gray-50 p-0.5 shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-ft-blue/10 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-ft-blue/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{entreprise.nom}</p>
              {trancheEffectif && (
                <p className="text-xs text-gray-500 mt-0.5">{trancheEffectif}</p>
              )}
            </div>
          </div>

          {/* Description */}
          {entreprise.description && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">{entreprise.description}</p>
            </div>
          )}

          {/* Lien site */}
          {entreprise.url && (
            <div className="px-4 py-3">
              <a
                href={entreprise.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ft-blue hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Voir le site
              </a>
            </div>
          )}

          {/* Pas de site mais il y a description : padding bas */}
          {!entreprise.url && entreprise.description && <div className="pb-3" />}
        </div>
      )}
    </div>
  );
};

export default CompanyPopover;
