/**
 * Utilitaires pour la gestion et la conversion des salaires
 * Format de l'API France Travail : "Horaire de X Euros à Y Euros sur N mois"
 *                                   "Mensuel de X Euros à Y Euros sur N mois"
 *                                   "Annuel de X Euros à Y Euros sur N mois"
 */

// Détecte la période salariale dans un texte (word boundaries pour éviter les faux positifs)
const detectPeriod = (text) => {
  if (/horaire|\/h\b|€\/h|\bh\b/.test(text)) return 'hourly';
  if (/\ban\b|annuel|\/an\b/.test(text)) return 'annual';
  if (/\bmois\b|mensuel|\/mois\b/.test(text)) return 'monthly';
  return null;
};

// Extrait le premier montant numérique avec décimales (gère "14.55", "24 000", "24000.0")
const extractAmount = (text) => {
  const match = text.match(/(\d[\d\s]*\d|\d+)(?:[.,]\d+)?/);
  if (!match) return null;
  // Récupérer aussi la partie décimale
  const fullMatch = text.match(/(\d[\d\s]*\d|\d+)([.,]\d+)?/);
  if (!fullMatch) return null;
  const integer = parseInt(fullMatch[1].replace(/\s/g, ''), 10);
  const decimal = fullMatch[2] ? parseFloat('0' + fullMatch[2].replace(',', '.')) : 0;
  return integer + decimal;
};

// Extrait le montant du pattern "X Euros sur N mois" UNIQUEMENT si ce n'est pas un taux horaire
// → retourne le montant mensuel (X / N si X est un total annuel, ou X si déjà mensuel)
const extractSurNMois = (text, period) => {
  // Ne pas appliquer ce pattern sur les taux horaires (ex: "14.55 Euros sur 12 mois" = horaire)
  if (period === 'hourly') return null;

  // Pattern: "de X[.xx] Euros [à Y Euros] sur N mois"
  const match = text.match(/de\s+(\d[\d\s]*(?:[.,]\d+)?)\s*euros?\s+(?:\u00e0\s+[\d\s.,]+\s*euros?\s+)?sur\s+(\d+(?:[.,]\d+)?)\s*mois/i);
  if (!match) return null;

  const montant = parseFloat(match[1].replace(/\s/g, '').replace(',', '.'));
  const nbMois = parseFloat(match[2].replace(',', '.'));
  if (!nbMois || !montant) return null;

  if (period === 'annual') {
    // "Annuel de 30000 Euros sur 12 mois" → 2500 €/mois
    return Math.round(montant / nbMois);
  } else {
    // monthly ou sans période : heuristique sur la valeur
    // L'API FT écrit "Mensuel de 24000 Euros sur 12 mois" = 24000/12 = 2000 €/mois
    // mais aussi "Mensuel de 2300 Euros sur 12 mois" = 2300 €/mois directement
    // Heuristique : si montant >= 5000 et nbMois >= 1, c'est un total à diviser
    if (montant >= 5000 && nbMois >= 1) return Math.round(montant / nbMois);
    return montant; // déjà mensuel
  }
};

export const formatSalaryToMonthly = (salaire) => {
  if (!salaire) return 'Salaire non précisé';

  const salaireText = (salaire.libelle || salaire.commentaire || '').toLowerCase();
  if (!salaireText.trim()) return 'Salaire non précisé';

  // Détection de la période en priorité
  const period = detectPeriod(salaireText);

  // Pattern "de X Euros sur N mois" (format typique API FT) — sauf si horaire
  const surNMois = extractSurNMois(salaireText, period);
  if (surNMois !== null) {
    return `${Math.round(surNMois).toLocaleString('fr-FR')} € / mois brut`;
  }

  const montant = extractAmount(salaireText);
  if (montant === null || montant === 0) return salaire.libelle || 'Salaire non précisé';

  let montantMensuel;

  if (period === 'hourly') {
    montantMensuel = Math.round(montant * 151.67); // 35h × 52/12 semaines
  } else if (period === 'annual') {
    montantMensuel = Math.round(montant / 12);
  } else if (period === 'monthly') {
    montantMensuel = Math.round(montant);
  } else {
    // Heuristique basée sur la valeur
    if (montant < 100) {
      montantMensuel = Math.round(montant * 151.67); // horaire
    } else if (montant >= 10000) {
      montantMensuel = Math.round(montant / 12); // annuel
    } else {
      montantMensuel = Math.round(montant); // mensuel
    }
  }

  return `${montantMensuel.toLocaleString('fr-FR')} € / mois brut`;
};

/**
 * Convertit un salaire en annuel pour les comparaisons (filtre salaire minimum)
 */
export const convertToAnnualSalary = (salaire) => {
  if (!salaire) return null;

  const salaireText = (salaire.libelle || salaire.commentaire || '').toLowerCase();
  if (!salaireText.trim()) return null;

  const period = detectPeriod(salaireText);

  // Pattern "de X Euros sur N mois" — sauf si horaire
  const surNMois = extractSurNMois(salaireText, period);
  if (surNMois !== null) return Math.round(surNMois) * 12;

  const montant = extractAmount(salaireText);
  if (montant === null || montant === 0) return null;

  if (period === 'hourly') return Math.round(montant * 1820); // 35h × 52 semaines
  if (period === 'monthly') return Math.round(montant * 12);
  if (period === 'annual') return Math.round(montant);

  // Heuristique
  if (montant < 100) return Math.round(montant * 1820);
  if (montant >= 10000) return Math.round(montant);
  return Math.round(montant * 12);
};
