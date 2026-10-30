#!/usr/bin/env node
// Lanceur des tests serveur, portable toutes versions de Node et tous OS.
//
// Pourquoi un script plutôt qu'un pattern glob passé à `node --test` :
//   - le glob du test runner n'existe qu'à partir de Node 21 ; le runner CI
//     tourne sur Node 18 -> le pattern était pris littéralement (0 fichier) ;
//   - un arg répertoire (`node --test server/`) est, lui, interprété comme un
//     fichier sur Node 24 ;
//   - les globs shell diffèrent (bash vs PowerShell).
// On découvre donc les fichiers nous-mêmes via `fs` et on les passe en
// arguments EXPLICITES à `node --test` — forme supportée sur tout Node >= 18.
const { readdirSync } = require('node:fs');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

const SERVER_DIR = join(__dirname, '..', 'server');

/** Liste récursivement les fichiers *.test.js sous server/ (hors node_modules). */
function findTestFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...findTestFiles(full));
    else if (/\.test\.js$/.test(entry.name)) found.push(full);
  }
  return found;
}

const files = findTestFiles(SERVER_DIR);

if (files.length === 0) {
  console.log('Aucun fichier de test serveur trouvé (server/**/*.test.js).');
  process.exit(0);
}

const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(result.status == null ? 1 : result.status);
