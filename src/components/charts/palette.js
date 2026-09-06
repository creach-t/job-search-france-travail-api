/**
 * Palette de graphes.
 * - Catégorielle : ordre FIXE, validé daltonisme (compétence dataviz) en clair ET sombre.
 *   Ne jamais cycler ; au-delà de 8 → replier dans « Autres ».
 * - Les dégradés violet→cyan sont réservés aux séries UNIQUES / décor (pas de contrainte CVD).
 */

// Ordre catégoriel validé (clair / sombre) — 8 teintes
export const CATEGORICAL = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
  dark:  ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

export const OTHER_COLOR = { light: '#9aa0aa', dark: '#6b7280' };

// Accents dégradés (séries uniques / décor)
export const ACCENTS = { violet: '#8B5CF6', electric: '#3B82F6', cyan: '#22D3EE', magenta: '#D946EF' };

/** Retourne la liste catégorielle du thème courant. */
export const categoricalColors = (isDark) => (isDark ? CATEGORICAL.dark : CATEGORICAL.light);
