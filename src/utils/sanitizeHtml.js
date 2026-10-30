/**
 * Rend un texte brut (potentiellement fourni par un employeur via l'API) sûr pour
 * une injection via dangerouslySetInnerHTML.
 *
 * Les descriptions d'offres sont du TEXTE : la seule mise en forme voulue est le
 * passage à la ligne. On échappe donc TOUT le HTML (neutralise `<img onerror>`,
 * `<script>`, etc.) puis on reconvertit uniquement les retours ligne en <br />.
 */
const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Texte brut → HTML sûr avec sauts de ligne préservés. */
export const textToSafeHtml = (text, fallback = '') => {
  if (text == null || text === '') return fallback;
  return escapeHtml(text).replace(/\r\n|\r|\n/g, '<br />');
};

export default textToSafeHtml;
