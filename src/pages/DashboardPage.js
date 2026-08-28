import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon, BoltIcon, ClockIcon, Squares2X2Icon, ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useDashboardData } from '../hooks/useDashboardData';
import { useMarketTrends } from '../hooks/useMarketTrends';
import { Donut, Sparkline, MiniArea, RankBars } from '../components/charts';
import { ACCENTS } from '../components/charts/palette';

const fmt = (n) => (n === null || n === undefined ? '—' : Number(n).toLocaleString('fr-FR'));
const pct = (part, whole) => (whole ? `${Math.round((part / whole) * 100)} %` : '—');

// ── Carte KPI (glass) ────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, tint, label, value, hint, spark }) => (
  <div className="glass-card glass-hover p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <span className="icon-tile h-11 w-11 shrink-0 text-white" style={{ background: tint }}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      {spark && <Sparkline values={spark} width={104} height={34} />}
    </div>
    <p className="mt-3 text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
    <p className="mt-0.5 text-2xl sm:text-3xl font-extrabold text-ink tabular-nums">{value}</p>
    {hint && <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>}
  </div>
);

// ── Carte de section ─────────────────────────────────────────────────────────
const Card = ({ title, subtitle, action, children, className = '' }) => (
  <section className={`glass-card p-5 ${className}`}>
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        {subtitle && <p className="text-xs text-ink-faint mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const DetailLink = ({ to, children }) => (
  <Link to={to} className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:opacity-80 shrink-0">
    {children} <ArrowRightIcon className="h-3.5 w-3.5" />
  </Link>
);

// ── Tendance historique officielle (API Marché du travail) ───────────────────
const MarketTrendCard = () => {
  const mt = useMarketTrends({ codeTypeTerritoire: 'NAT', codeTerritoire: 'FR' });

  // Non configurée → on le dit, pas de faux chiffres
  if (!mt.configured) {
    return (
      <Card title="Tendance historique (source officielle)" subtitle="API Marché du travail — France Travail / DARES">
        <div className="text-sm text-ink-muted">
          <p>
            Pour afficher l'<strong>évolution trimestrielle réelle</strong> des offres, la croissance et la tension par métier,
            connectez l'API « Marché du travail ».
          </p>
          <p className="mt-2 text-xs text-ink-faint">
            À renseigner dans <code className="text-accent">server/.env</code> :{' '}
            <code>FT_STATS_SCOPE</code> (scope de la fiche produit) et <code>FT_STATS_BASE</code> (base des endpoints).
          </p>
        </div>
      </Card>
    );
  }

  const points = mt.trend.map((t) => ({ label: t.period, value: t.value }));

  return (
    <Card
      title="Tendance historique (source officielle)"
      subtitle={mt.source}
      action={mt.growthPct != null && (
        <span className={`text-xs font-bold ${mt.growthPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {mt.growthPct >= 0 ? '▲' : '▼'} {Math.abs(Math.round(mt.growthPct * 10) / 10)} % <span className="font-normal text-ink-faint">vs trim. préc.</span>
        </span>
      )}
    >
      {mt.isLoading ? (
        <p className="text-sm text-ink-faint py-8 text-center">Chargement des séries…</p>
      ) : mt.isError ? (
        <div className="text-sm text-amber-300">
          Source connectée, mais la requête n'a rien renvoyé d'exploitable.
          <span className="block text-xs text-ink-faint mt-1">
            Ajustez les endpoints dans <code>src/services/marcheTravail.js</code> selon le swagger du portail.
            {mt.error?.message ? ` (${mt.error.message})` : ''}
          </span>
        </div>
      ) : points.length ? (
        <>
          <MiniArea points={points} />
          {mt.tensionValue != null && (
            <p className="mt-2 text-xs text-ink-muted">
              Indicateur de tension / difficulté de recrutement : <strong className="text-ink">{mt.tensionValue}</strong>
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-ink-faint py-8 text-center">Aucune série disponible pour ce périmètre.</p>
      )}
    </Card>
  );
};

const DashboardPage = () => {
  // Périmètre national (aucun filtre) — comptes exacts par facette
  const scope = useMemo(() => ({}), []);
  const data = useDashboardData(scope);

  const { total, freshness, categories, metiers, regions } = data;
  const sparkValues = freshness.curve.map((c) => c.value);

  // Donut : top 6 domaines + « Autres »
  const donutData = useMemo(() => {
    const top = categories.slice(0, 6).map((c) => ({ label: c.label, value: c.total }));
    const rest = categories.slice(6).reduce((s, c) => s + c.total, 0);
    if (rest > 0) top.push({ label: 'Autres', value: rest, isOther: true });
    return top;
  }, [categories]);

  const loadingPct = Math.round(data.progress * 100);

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5 px-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
            Aperçu du <span className="gradient-text">marché de l'emploi</span>
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Données France Travail en temps réel — France entière, tous secteurs.
          </p>
        </div>
        {data.progress < 1 && (
          <span className="inline-flex items-center gap-2 text-xs text-ink-faint">
            <span className="h-1.5 w-24 rounded-full bg-[rgb(var(--line)/0.2)] overflow-hidden">
              <span className="block h-full bg-accent-gradient transition-all" style={{ width: `${loadingPct}%` }} />
            </span>
            {loadingPct}%
          </span>
        )}
      </div>

      {/* KPIs — chiffres réels (totaux exacts via Content-Range) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <KpiCard icon={BriefcaseIcon} tint="linear-gradient(135deg,#8B5CF6,#6D28D9)"
          label="Offres ouvertes" value={fmt(total)} hint="total en ligne" spark={sparkValues} />
        <KpiCard icon={ClockIcon} tint="linear-gradient(135deg,#3B82F6,#2563EB)"
          label="Publiées ≤ 7 jours" value={fmt(freshness.last7)} hint={total ? `${pct(freshness.last7, total)} du total` : 'flux récent'} spark={sparkValues} />
        <KpiCard icon={BoltIcon} tint="linear-gradient(135deg,#D946EF,#A21CAF)"
          label="Publiées ≤ 24 h" value={fmt(freshness.last1)} hint="nouvelles offres du jour" />
        <KpiCard icon={Squares2X2Icon} tint="linear-gradient(135deg,#22D3EE,#0891B2)"
          label="Grands domaines" value={fmt(categories.length)} hint="secteurs actifs" />
      </div>

      {/* Ligne principale : courbe de fraîcheur + donut domaines */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
        <Card className="lg:col-span-3" title="Flux de publication"
          subtitle="Offres actuellement ouvertes, par ancienneté de publication (cumul)"
          action={<DetailLink to="/tendances">Analyse</DetailLink>}>
          <MiniArea points={freshness.curve} />
          <p className="mt-2 text-xs text-ink-faint">
            Lecture : nombre d'offres encore ouvertes publiées depuis X jours. L'API ne fournit pas
            d'historique — ceci mesure le flux récent, pas une évolution mois par mois.
          </p>
        </Card>

        <Card className="lg:col-span-2" title="Répartition par domaine"
          subtitle="Grands domaines ROME"
          action={<DetailLink to="/tendances">Détail</DetailLink>}>
          {donutData.length > 0
            ? <Donut data={donutData} centerLabel="offres" centerValue={fmt(total)} />
            : <p className="text-sm text-ink-faint py-8 text-center">Chargement…</p>}
        </Card>
      </div>

      {/* Tendance historique officielle (API Marché du travail) */}
      <div className="mb-4">
        <MarketTrendCard />
      </div>

      {/* Classements : métiers + régions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <Card title="Métiers les plus représentés"
          subtitle="Nombre d'offres ouvertes par métier (échantillon de métiers courants)"
          action={<DetailLink to="/offres">Rechercher</DetailLink>}>
          <RankBars numbered rows={metiers.slice(0, 8).map((m) => ({ label: m.label, value: m.total }))} />
        </Card>

        <Card title="Offres par région"
          subtitle="Total exact par région"
          action={<DetailLink to="/carte">Carte</DetailLink>}>
          <RankBars rows={regions.slice(0, 10).map((r) => ({ label: r.label, value: r.total }))} />
        </Card>
      </div>

      {/* Note honnêteté */}
      <p className="mt-5 px-1 text-xs text-ink-faint leading-relaxed">
        Chaque total est une valeur <strong className="text-ink-muted">exacte</strong> renvoyée par l'API France
        Travail (en-tête Content-Range), obtenue sans télécharger les offres. Aucune donnée n'est extrapolée ni
        comparée à un historique inexistant. Accent&nbsp;:{' '}
        <span style={{ color: ACCENTS.cyan }}>flux récent</span>, pas « croissance ».
      </p>
    </div>
  );
};

export default DashboardPage;
