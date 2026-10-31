/**
 * Utilitaires de salaire — parsing + normalisation vers le MENSUEL brut.
 *
 * Format réel France Travail / Adzuna (vérifié sur données de production) :
 *   "<Période> de X Euros [à Y Euros] [- commentaire libre]"
 *   ex. "Mensuel de 2600.0 Euros à 3000.0 Euros", "Annuel de 45000.0 Euros",
 *       "Horaire de 12.31 Euros - 13ème mois".
 * Le libellé ne contient PAS « sur N mois » (c'était une hypothèse erronée).
 *
 * Deux principes pour rester cohérent :
 *  1. On lit les DEUX bornes (min/max), jamais seulement la plus basse.
 *  2. La périodicité réelle est décidée UNE fois sur la borne haute, puis
 *     appliquée aux deux bornes → une fourchette ne peut pas mélanger
 *     « mensuel fiable » et « annuel mal étiqueté ».
 */

// Seuils (France Travail & employeurs confondent souvent la périodicité).
const TRUST_MONTHLY_MAX = 10000;    // ≤ : mensuel plausible → on fait confiance
const ANNUAL_MISLABEL_MIN = 18000;  // ≥ : « Mensuel » en réalité annuel → ÷12
const MONTHS = 12;
const HOURLY_TO_MONTHLY = 151.67;   // 35 h × 52 / 12

// Détecte la période (word boundaries pour éviter les faux positifs : "dans", "plan"…).
const detectPeriod = (text) => {
  if (/horaire|\/h\b|€\/h|\bh\b/.test(text)) return 'hourly';
  if (/\ban\b|annuel|\/an\b/.test(text)) return 'annual';
  if (/\bmois\b|mensuel|\/mois\b/.test(text)) return 'monthly';
  return null;
};

// Parse "2 600,50" / "2600.0" / "24 000" → nombre (espaces = milliers, ./, = décimale).
const toNumber = (s) => {
  if (s == null) return null;
  const n = parseFloat(String(s).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const NUM = '(\\d[\\d\\s]*(?:[.,]\\d+)?)';

// Isole la partie structurée "<Période> de X Euros [à Y Euros]" en coupant le
// commentaire libre introduit par " - ". Ce commentaire contient très souvent
// "annuel"/"annuelle", "13ème mois" ou "un an" → sans cette coupe, la période
// bascule à tort et un salaire mensuel se retrouve divisé par 12.
// (ex. "Mensuel de 2600 à 3000 Euros - ... Indemnitaire Annuel)" ⇒ 217 € au lieu de 2600.)
const structuredPart = (text) => text.split(/\s[-–]\s/)[0];

// Extrait [min, max] depuis "de X Euros [à Y Euros]".
// À défaut (ex. commentaire "à partir de 2 200 € brut"), retombe sur le 1er nombre.
const extractBounds = (text) => {
  const re = new RegExp(`de\\s+${NUM}\\s*euros?(?:\\s*à\\s*${NUM}\\s*euros?)?`, 'i');
  const m = text.match(re);
  if (m) {
    const lo = toNumber(m[1]);
    if (lo == null) return null;
    const hi = toNumber(m[2]);
    return [lo, hi == null ? lo : hi];
  }
  const f = text.match(new RegExp(NUM));
  const v = f ? toNumber(f[1]) : null;
  return v == null ? null : [v, v];
};

// Convertit une paire de montants bruts en fourchette MENSUELLE (floats, non arrondis).
// → tableau [minMensuel, maxMensuel], 'ambiguous' (donnée corrompue), ou null.
const toMonthlyRange = (lo, hi, period) => {
  const scale = (f) => [lo * f, hi * f];
  if (period === 'hourly') return scale(HOURLY_TO_MONTHLY);
  if (period === 'annual') return scale(1 / MONTHS);
  if (period === 'monthly') {
    // Décision sur la borne haute, appliquée aux deux bornes (cohérence de la fourchette).
    if (hi >= ANNUAL_MISLABEL_MIN) return scale(1 / MONTHS); // annuel mal étiqueté
    if (hi <= TRUST_MONTHLY_MAX) return [lo, hi];            // mensuel fiable
    return 'ambiguous';                                       // 10000–18000 : ni l'un ni l'autre
  }
  // Période inconnue : heuristique sur la borne haute.
  if (hi < 100) return scale(HOURLY_TO_MONTHLY);
  if (hi >= TRUST_MONTHLY_MAX) return scale(1 / MONTHS);
  return [lo, hi];
};

/**
 * Parse un objet salaire France Travail / Adzuna.
 * @returns {{min:number,max:number}|{ambiguous:true}|null}
 *   - {min,max} : fourchette MENSUELLE en euros (floats) ;
 *   - {ambiguous} : montant trouvé mais périodicité indécidable → à masquer ;
 *   - null : aucun montant exploitable.
 *
 * ⚠️ On ne lit QUE le `libelle` structuré ("<Période> de X Euros…"), jamais le
 * `commentaire` libre. Le commentaire ("Salaire CCN 51", "13ème mois",
 * "Selon profil"…) produisait des montants aberrants (ex. 7 735 €/mois à partir
 * de « CCN 51 », 13 €/mois à partir de « 13ème mois »). Les offres sans libelle
 * sont « non précisé » — la donnée brute reste visible sur la fiche.
 */
const parseSalary = (salaire) => {
  if (!salaire) return null;
  const text = structuredPart((salaire.libelle || '').toLowerCase());
  if (!text.trim()) return null;

  const bounds = extractBounds(text);
  if (!bounds) return null;

  const range = toMonthlyRange(bounds[0], bounds[1], detectPeriod(text));
  if (range === 'ambiguous') return { ambiguous: true };
  if (!range) return null;

  let [min, max] = range;
  if (!(min > 0)) return null;
  if (!(max >= min)) max = min;
  return { min, max };
};

/**
 * Libellé mensuel lisible. Affiche la FOURCHETTE quand min ≠ max.
 * @returns {string} ex. "2 083 € / mois brut" ou "3 750 – 4 583 € / mois brut".
 */
export const formatSalaryToMonthly = (salaire) => {
  if (!salaire) return 'Salaire non précisé';
  const r = parseSalary(salaire);

  if (r && r.min != null) {
    const fmt = (n) => Math.round(n).toLocaleString('fr-FR');
    return Math.round(r.min) === Math.round(r.max)
      ? `${fmt(r.min)} € / mois brut`
      : `${fmt(r.min)} – ${fmt(r.max)} € / mois brut`;
  }
  // Donnée ambiguë → on ne montre pas un chiffre trompeur.
  if (r && r.ambiguous) return 'Salaire non précisé';
  // Aucun montant parsé mais texte présent (ex. "Selon profil") → on garde le texte brut.
  const raw = (salaire.libelle || '').trim();
  return raw || 'Salaire non précisé';
};

/**
 * Équivalent ANNUEL brut pour les comparaisons (filtre « salaire minimum », tri, analyse).
 * Calé sur la borne basse (plancher garanti) et annualisé depuis le float mensuel
 * pour éviter toute dérive d'arrondi.
 * @returns {number|null}
 */
export const convertToAnnualSalary = (salaire) => {
  const r = parseSalary(salaire);
  if (!r || r.min == null) return null;
  return Math.round(r.min * MONTHS);
};
