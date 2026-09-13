/**
 * Journalisation minimale. Les logs HTTP détaillés (corps de requête, paramètres,
 * Content-Range…) ne s'affichent que si DEBUG_HTTP=true — sinon on ne garde que
 * les erreurs. Évite de polluer les logs de production.
 */
const DEBUG = process.env.DEBUG_HTTP === 'true';

const debug = (...args) => {
  if (DEBUG) console.log(...args);
};

const error = (...args) => console.error(...args);

module.exports = { debug, error, DEBUG };
