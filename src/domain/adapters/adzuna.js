/**
 * Adaptateur Adzuna → Offer canonique.
 *
 * Adzuna (https://developer.adzuna.com/) renvoie des offres avec des champs
 * propres (title, company.display_name, location.display_name, salary_min/max
 * ANNUELS, contract_type/contract_time, redirect_url…). On les projette sur le
 * modèle Offer commun pour que cartes, carte, analyse et export les affichent
 * sans aucune modification.
 */
import { SOURCES } from '../offer';

// Retire les balises HTML éventuelles des libellés Adzuna
const stripTags = (s) => (typeof s === 'string' ? s.replace(/<[^>]*>/g, '').trim() : s);

// contract_type → libellé de contrat FR (approximation honnête)
const CONTRACT_LABEL = { permanent: 'CDI', contract: 'CDD' };
// contract_time → durée de travail (aligné sur dureeTravailLibelleConverti FT)
const WORKTIME_LABEL = { full_time: 'Temps plein', part_time: 'Temps partiel' };

// Seuil mensuel/annuel : Adzuna FR ne précise pas la périodicité, et mélange des
// montants mensuels (~1 500–10 000 €) et annuels (~18 000 €+). Au-delà du seuil on
// considère un montant annuel, en-deçà un montant mensuel (aligné sur salaryUtils).
const ANNUAL_THRESHOLD = 10000;
// Plancher anti-bruit sur l'équivalent mensuel (Adzuna renvoie parfois quelques euros).
const MIN_MONTHLY = 300;

/**
 * Construit un libellé de salaire parsable par salaryUtils, en déduisant la
 * périodicité (Mensuel/Annuel) du montant — Adzuna ne la fournit pas.
 */
const buildSalaire = (raw) => {
  const min = Number(raw.salary_min) || null;
  const max = Number(raw.salary_max) || null;
  const lo = min || max;
  if (!lo || lo <= 0) return undefined;

  const isAnnual = lo >= ANNUAL_THRESHOLD;
  const monthlyEquiv = isAnnual ? lo / 12 : lo;
  if (monthlyEquiv < MIN_MONTHLY) return undefined; // montant aberrant → ignoré

  const periode = isAnnual ? 'Annuel' : 'Mensuel';
  const hi = max && max !== min && max > 0 ? max : null;
  const libelle = hi
    ? `${periode} de ${Math.round(lo)} Euros à ${Math.round(hi)} Euros`
    : `${periode} de ${Math.round(lo)} Euros`;

  return {
    libelle,
    commentaire: raw.salary_is_predicted === '1' || raw.salary_is_predicted === 1
      ? 'Fourchette estimée par Adzuna'
      : undefined,
  };
};

/** @returns {import('../offer').Offer|null} */
export const fromAdzuna = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const loc = raw.location || {};
  // location.area = ["France", "Île-de-France", "Paris"] → commune = dernier niveau
  const area = Array.isArray(loc.area) ? loc.area : [];
  const commune = area.length ? area[area.length - 1] : undefined;

  return {
    id: raw.id != null ? `adzuna:${raw.id}` : undefined,
    source: SOURCES.ADZUNA,
    intitule: stripTags(raw.title),
    description: stripTags(raw.description),
    entreprise: { nom: raw.company?.display_name || undefined },
    lieuTravail: {
      libelle: loc.display_name || commune || undefined,
      commune,
      latitude: raw.latitude != null ? Number(raw.latitude) : undefined,
      longitude: raw.longitude != null ? Number(raw.longitude) : undefined,
    },
    typeContratLibelle: CONTRACT_LABEL[raw.contract_type] || undefined,
    dureeTravailLibelleConverti: WORKTIME_LABEL[raw.contract_time] || undefined,
    secteurActiviteLibelle: raw.category?.label || undefined,
    salaire: buildSalaire(raw),
    dateCreation: raw.created || undefined,
    // Bouton « Postuler » → page Adzuna (ApplyButton lit contact.urlPostulation)
    contact: raw.redirect_url ? { urlPostulation: raw.redirect_url } : undefined,
    raw,
  };
};

/** @returns {import('../offer').Offer[]} */
export const fromAdzunaList = (list) =>
  Array.isArray(list) ? list.map(fromAdzuna).filter(Boolean) : [];
