import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import InseeCompanyInfo from './InseeCompanyInfo';

/**
 * Affiche le nom de l'entreprise.
 * Un clic ouvre une infobulle : infos France Travail (logo, description, url,
 * effectif) + enrichissement INSEE/SIRENE chargé paresseusement à l'ouverture.
 *
 * Le panneau est rendu dans un portal (position fixed) pour ne pas être clippé
 * par la carte parente (overflow-hidden) et respecter la charte glass sombre.
 */
const PANEL_WIDTH = 288; // w-72

const CompanyPopover = ({ entreprise, trancheEffectif, codePostal, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  // Le popover est proposé dès qu'un nom existe : l'enrichissement INSEE peut
  // apporter des infos même sans données supplémentaires côté France Travail.
  const hasExtra = entreprise?.logo || entreprise?.description || entreprise?.url || trancheEffectif || entreprise?.nom;

  const place = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margin = 8;
    const left = Math.max(margin, Math.min(r.left, window.innerWidth - PANEL_WIDTH - margin));
    const below = window.innerHeight - r.bottom;
    const openUp = below < 300 && r.top > below;
    setPos({
      left,
      top: openUp ? undefined : r.bottom + 6,
      bottom: openUp ? window.innerHeight - r.top + 6 : undefined,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    place();
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onDismiss = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onDismiss, true);
    window.addEventListener('resize', onDismiss);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onDismiss, true);
      window.removeEventListener('resize', onDismiss);
    };
  }, [open, place]);

  if (!entreprise?.nom) return null;

  // Pas d'infos supplémentaires → texte simple
  if (!hasExtra) {
    return <span className={className}>{entreprise.nom}</span>;
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
        className={`${className} inline-flex items-center gap-1 hover:text-accent transition-colors cursor-pointer group/cpop`}
      >
        <span className="truncate">{entreprise.nom}</span>
        <svg
          className={`shrink-0 h-3 w-3 transition-colors ${open ? 'text-accent' : 'text-ink-faint group-hover/cpop:text-accent/60'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && pos && createPortal(
        <div
          ref={panelRef}
          className="cmd-panel cmd-pop fixed z-[100] overflow-hidden"
          style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: PANEL_WIDTH }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* En-tête logo + nom */}
          <div className="flex items-center gap-3 p-4 border-b border-[rgb(var(--line)/0.12)]">
            {entreprise.logo ? (
              <img
                src={entreprise.logo}
                alt={entreprise.nom}
                className="h-10 w-10 rounded-lg object-contain border border-[rgb(var(--line)/0.15)] bg-white/90 p-0.5 shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-accent/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{entreprise.nom}</p>
              {trancheEffectif && (
                <p className="text-xs text-ink-faint mt-0.5">{trancheEffectif}</p>
              )}
            </div>
          </div>

          {/* Description */}
          {entreprise.description && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-xs text-ink-muted leading-relaxed line-clamp-4">{entreprise.description}</p>
            </div>
          )}

          {/* Lien site */}
          {entreprise.url && (
            <div className="px-4 py-3">
              <a
                href={entreprise.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Voir le site
              </a>
            </div>
          )}

          {/* Enrichissement INSEE (chargé uniquement à l'ouverture du popover) */}
          <InseeCompanyInfo
            nom={entreprise.nom}
            codePostal={codePostal}
            variant="compact"
            enabled={open}
          />
        </div>,
        document.body
      )}
    </>
  );
};

export default CompanyPopover;
