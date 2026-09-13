import { getSourceMeta } from '../../domain/offer';

// Palette par source (classes statiques → non purgées par Tailwind)
const COLORS = {
  blue: 'text-blue-300 bg-blue-500/10 border-blue-500/25',
  emerald: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25',
  violet: 'text-violet-300 bg-violet-500/10 border-violet-500/25',
  amber: 'text-amber-300 bg-amber-500/10 border-amber-500/25',
  cyan: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/25',
  slate: 'text-ink-faint bg-[var(--glass-hover)] border-[rgb(var(--line)/0.2)]',
};

/**
 * Badge de provenance d'une offre. Rendu discret, prêt pour le multi-sources.
 * @param {{ source?: string, full?: boolean, className?: string }} props
 */
const SourceBadge = ({ source, full = false, className = '' }) => {
  const meta = getSourceMeta(source);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold border ${COLORS[meta.color] || COLORS.slate} ${className}`}
      title={`Source : ${meta.label}`}
    >
      {full ? meta.label : meta.short}
    </span>
  );
};

export default SourceBadge;
