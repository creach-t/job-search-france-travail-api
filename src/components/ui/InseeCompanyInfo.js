import { useEntreprise } from '../../hooks/useEntreprise';

/**
 * Affiche les données publiques (INSEE / SIRENE) d'une entreprise, raccordées
 * par nom + code postal depuis l'offre France Travail.
 *
 * Le raccord n'ayant pas d'identifiant fort (FT ne fournit pas de SIRET), on
 * expose toujours un badge de fiabilité + un lien vers l'Annuaire des
 * entreprises pour vérification.
 *
 * @param {string} nom          - Nom de l'entreprise (job.entreprise.nom)
 * @param {string} codePostal   - Code postal du lieu de travail
 * @param {'full'|'compact'} variant
 * @param {boolean} enabled      - Déclenchement paresseux (popover)
 */

const CONF = {
  high: { label: 'Correspondance vérifiée', cls: 'text-emerald-500 bg-emerald-500/10' },
  medium: { label: 'Correspondance probable', cls: 'text-amber-500 bg-amber-500/10' },
  low: { label: 'Correspondance incertaine', cls: 'text-ink-faint bg-[var(--glass-hover)]' },
};

const formatCreation = (iso, age) => {
  if (!iso) return null;
  const year = new Date(iso).getFullYear();
  if (Number.isNaN(year)) return null;
  const ageTxt = age != null ? ` · ${age} an${age > 1 ? 's' : ''}` : '';
  return `${year}${ageTxt}`;
};

const LABEL_CHIPS = [
  ['ess', 'ESS'],
  ['societeMission', 'Société à mission'],
  ['qualiopi', 'Qualiopi'],
  ['organismeFormation', 'Organisme de formation'],
  ['rge', 'RGE'],
  ['bio', 'Bio'],
  ['servicePublic', 'Service public'],
];

// ── Icônes (héroïcons outline inline) ────────────────────────────────────────
const I = {
  building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  scale: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  users: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6-4a3 3 0 11-3-3 3 3 0 013 3z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  tag: 'M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 8V3z',
  id: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  external: 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
};
const Icon = ({ d, className = 'h-4 w-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const Fact = ({ icon, label, value, sub }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-ink-faint shrink-0 mt-0.5"><Icon d={icon} /></span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{label}</p>
        <p className="text-sm text-ink break-words">{value}</p>
        {sub && <p className="text-xs text-ink-muted break-words">{sub}</p>}
      </div>
    </div>
  );
};

const ConfBadge = ({ level }) => {
  const c = CONF[level] || CONF.low;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${c.cls}`}>
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      {c.label}
    </span>
  );
};

const AnnuaireLink = ({ href }) => href ? (
  <a href={href} target="_blank" rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline">
    <Icon d={I.external} className="h-3.5 w-3.5" />
    Voir sur l'Annuaire des entreprises
  </a>
) : null;

const InseeCompanyInfo = ({ nom, codePostal, variant = 'full', enabled = true }) => {
  const { data, isLoading } = useEntreprise({ nom, codePostal }, enabled);

  if (isLoading) {
    return variant === 'compact'
      ? <p className="px-4 py-3 text-xs text-ink-faint border-t border-[rgb(var(--line)/0.12)]">Recherche des données publiques (INSEE)…</p>
      : (
        <div className="flex items-center gap-2 text-xs text-ink-faint">
          <svg className="animate-spin h-3.5 w-3.5 text-accent" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Recherche des données publiques (INSEE)…
        </div>
      );
  }

  if (!data || !data.found) return null;

  const creation = formatCreation(data.dateCreation, data.ageAnnees);
  const activite = data.activite
    ? (data.activite.sectionLibelle || `Activité ${data.activite.code}`)
    : null;
  const activiteSub = data.activite?.code ? `Code NAF ${data.activite.code}` : null;
  const effectif = data.effectif?.libelle || null;
  const effectifSub = data.effectif?.annee ? `en ${data.effectif.annee}` : null;
  const chips = LABEL_CHIPS.filter(([k]) => data.labels?.[k]);

  // ── Variante compacte (popover) ────────────────────────────────────────────
  if (variant === 'compact') {
    const confBadge = data.matchConfidence === 'high'
      ? { txt: 'vérifié', cls: 'text-emerald-400 bg-emerald-500/15' }
      : data.matchConfidence === 'medium'
        ? { txt: 'probable', cls: 'text-amber-400 bg-amber-500/15' }
        : { txt: 'incertain', cls: 'text-ink-faint bg-[var(--glass-hover)]' };
    const Line = ({ label, value }) => value ? (
      <div className="flex justify-between gap-2">
        <dt className="text-ink-faint shrink-0">{label}</dt>
        <dd className="text-right text-ink-muted truncate">{value}</dd>
      </div>
    ) : null;
    return (
      <div className="border-t border-[rgb(var(--line)/0.12)] px-4 py-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">Données INSEE</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${confBadge.cls}`}>{confBadge.txt}</span>
        </div>
        <dl className="text-xs space-y-1">
          <Line label="Activité" value={activite} />
          <Line label="Effectif" value={effectif} />
          <Line label="Catégorie" value={data.categorie} />
          <Line label="Créée" value={creation} />
          <Line label="Forme" value={data.formeJuridique?.libelle} />
        </dl>
        {data.lienAnnuaire && (
          <a href={data.lienAnnuaire} target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline pt-0.5">
            SIREN {data.siren} ↗
          </a>
        )}
      </div>
    );
  }

  // ── Variante complète (fiche détail) ───────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-ink-muted">Données publiques (INSEE / SIRENE)</span>
        <ConfBadge level={data.matchConfidence} />
        {!data.active && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold text-red-500 bg-red-500/10">
            Établissement fermé
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
        <Fact icon={I.tag} label="Activité" value={activite} sub={activiteSub} />
        <Fact icon={I.users} label="Effectif" value={effectif} sub={effectifSub} />
        <Fact icon={I.scale} label="Forme juridique" value={data.formeJuridique?.libelle} />
        <Fact icon={I.building} label="Catégorie" value={data.categorieLibelle || data.categorie} />
        <Fact icon={I.calendar} label="Création" value={creation && `${creation.split(' · ')[0]}`}
          sub={data.ageAnnees != null ? `${data.ageAnnees} an${data.ageAnnees > 1 ? 's' : ''} d'existence` : null} />
        <Fact icon={I.building} label="Établissements"
          value={data.nombreEtablissementsOuverts != null
            ? `${data.nombreEtablissementsOuverts} ouvert${data.nombreEtablissementsOuverts > 1 ? 's' : ''}`
            : null}
          sub={data.nombreEtablissements ? `${data.nombreEtablissements} au total` : null} />
        <Fact icon={I.id} label="Identifiant" value={data.siren && `SIREN ${data.siren}`}
          sub={data.siret ? `SIRET siège ${data.siret}` : null} />
        {data.dirigeants?.length > 0 && (
          <Fact icon={I.user} label={data.dirigeants.length > 1 ? 'Dirigeants' : 'Dirigeant'}
            value={data.dirigeants.map((d) => d.nom).join(', ')}
            sub={data.dirigeants[0].qualite} />
        )}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map(([k, lbl]) => (
            <span key={k} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-accent/10 text-accent border border-accent/20">
              {lbl}
            </span>
          ))}
        </div>
      )}

      <AnnuaireLink href={data.lienAnnuaire} />
    </div>
  );
};

export default InseeCompanyInfo;
