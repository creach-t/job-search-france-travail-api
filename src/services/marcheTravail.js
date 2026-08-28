/**
 * Client de l'API « Statistiques sur les offres et demandes d'emploi » (SODE).
 * Scope : offresetdemandesemploi api_stats-offres-demandes-emploiv1
 * Base (serveur, FT_STATS_BASE) : https://api.francetravail.io/partenaire/stats-offres-demandes-emploi/v1
 *
 * Endpoints & schémas relevés sur l'implémentation officielle dataemploi.francetravail.fr
 * (même API sous-jacente). Passe par le proxy serveur /api/marche-travail.
 *
 * Données TRIMESTRIELLES/ANNUELLES, source France Travail / DARES. Aucun chiffre inventé :
 * si l'API n'est pas configurée ou répond mal, le hook renvoie configured=false / erreur.
 */
import axios from 'axios';
import { API } from '../utils/constants';

const client = axios.create({ baseURL: API.BASE_URL, headers: { 'Content-Type': 'application/json' } });

/** Le serveur a-t-il scope + base configurés ? */
export const getMarketConfig = async () => {
  try {
    const { data } = await client.get('/marche-travail/config');
    return data; // { configured, hasScope, hasBase }
  } catch {
    return { configured: false, hasScope: false, hasBase: false };
  }
};

/** Appel générique du proxy → { data, total }. */
export const queryMarcheTravail = async (endpoint, payload = {}) => {
  const { data } = await client.post('/marche-travail', { endpoint, method: 'POST', payload });
  return data?.data ?? data;
};

// Endpoints SODE (relatifs à FT_STATS_BASE)
export const MT_ENDPOINTS = {
  statOffres: '/offres/stat-offres',
  evolution: '/evolution/indicateur',
  faciliteRecrutement: '/evolution/facilite-recrutement',
};

/**
 * Construit la sélection (payload). Territoire : NAT/FR, REG/<code>, DEP/<code>.
 * Un métier ROME optionnel cible l'activité.
 */
export const buildSelection = ({ codeTypeTerritoire = 'NAT', codeTerritoire = 'FR', codeRome } = {}) => ({
  codeTypeTerritoire,
  codeTerritoire,
  ...(codeRome ? { codeTypeActivite: 'ROME', codeActivite: codeRome } : {}),
});

// ── Parseurs (schémas réels) ─────────────────────────────────────────────────

/** stat-offres → volume principal + période + part CDI. */
export const parseStatOffres = (resp) => {
  const row = resp?.listeValeursParPeriode?.[0];
  if (!row) return null;
  const cdi = (row.listeValeurParCaract || []).find((c) => c.codeTypeCaract === 'TYPECTR' && c.codeCaract === 'CDI');
  const cadre = (row.listeValeurParCaract || []).find((c) => c.codeTypeCaract === 'NIVQUAL' && c.codeCaract === 'CADRE');
  return {
    nombre: Number(row.valeurPrincipaleNombre) || null,
    periode: row.libPeriode || '',
    cdiPct: cdi ? Number(cdi.pourcentage) : null,
    cadrePct: cadre ? Number(cadre.pourcentage) : null,
  };
};

/** evolution/indicateur → volume + évolution % vs période de comparaison. */
export const parseEvolution = (resp) => {
  const evo = resp?.evolutionTerritoire;
  if (!evo) return null;
  return {
    nombre: Number(evo.nombre) || null,
    growthPct: evo.evolutionPourcentage != null ? Number(evo.evolutionPourcentage) : null,
    periode: resp?.periode?.libellePeriode || '',
    periodeComparaison: resp?.periodeComparaison?.libellePeriode || '',
  };
};

/** facilite-recrutement → indice de tension (1..5) + facteurs. */
export const parseTension = (resp) => {
  const p = resp?.evolutionPersp2?.persp2;
  if (!p) return null;
  return {
    value: p.valPrincPersp != null ? Number(p.valPrincPersp) : null,
    label: p.libelleNomenclature || 'Tension',
    facteurs: (resp.evolutionPersp2.listeSousPersp2 || []).map((s) => ({
      label: s.libelleNomenclature,
      value: Number(s.valPrincPersp),
    })),
  };
};

// Libellés lisibles de l'indice de tension (échelle France Travail 1→5)
export const TENSION_LABELS = {
  1: 'Très faible',
  2: 'Faible',
  3: 'Modérée',
  4: 'Élevée',
  5: 'Très élevée',
};
