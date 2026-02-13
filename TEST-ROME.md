# 🧪 Test de la fonctionnalité ROME

## Checklist de vérification

### 1. Fichiers créés ✓
- [x] `src/components/SearchForm/MetierAutocomplete.js`
- [x] Routes backend dans `server/server.js`
- [x] Import dans `src/components/SearchForm/index.js`

### 2. Code vérifié ✓
- [x] Export du composant MetierAutocomplete
- [x] Import dans SearchForm
- [x] Composant ajouté dans le JSX (ligne 128-132)

### 3. Ce que vous devriez voir

Après avoir lancé `npm run dev` et ouvert http://localhost:3000 :

**Sur la page d'accueil, dans le formulaire de recherche :**

```
┌─────────────────────────────────────────┐
│ Mots-clés                               │
│ [                           ]            │
├─────────────────────────────────────────┤
│ Commune                                 │
│ [                           ]            │
├─────────────────────────────────────────┤
│ Distance (km)                           │
│ [10 ▼]                                  │
├─────────────────────────────────────────┤
│ 🎓 Métier précis (Code ROME)           │  ← NOUVEAU !
│ - Recherche ultra-ciblée                │
│ [Ex: Développeur web...    ]            │
└─────────────────────────────────────────┘
  + Afficher les filtres avancés
```

### 4. Comment tester

1. **Cliquez dans le champ "Métier précis"**
   - Vous devriez voir une liste déroulante avec 5 métiers populaires

2. **Tapez "dév"**
   - Attendez 300ms
   - Une requête devrait être envoyée à `/api/rome/metiers?query=dév`
   - Des métiers contenant "dév" devraient apparaître

3. **Sélectionnez un métier**
   - Un encadré vert devrait apparaître en dessous
   - Indiquant "Recherche ciblée activée"

## 🐛 Debugging

### Si vous ne voyez pas le champ

**Étape 1 : Vérifier la console navigateur (F12)**
```
Ouvrir la console (F12) → Onglet "Console"
Cherchez des erreurs en rouge
```

Erreurs possibles :
- `Cannot find module './MetierAutocomplete'` → Problème d'import
- `MagnifyingGlassIcon is not defined` → Problème Heroicons
- `Combobox is not defined` → Problème Headless UI

**Étape 2 : Vérifier les logs du serveur backend**
```bash
# Dans le terminal où tourne npm run dev
# Cherchez des lignes comme :
Compiled successfully!
ou
Failed to compile
```

**Étape 3 : Vérifier que les dépendances sont installées**
```bash
npm list @headlessui/react @heroicons/react
```

Devrait retourner :
```
@headlessui/react@1.7.18
@heroicons/react@2.1.1
```

**Étape 4 : Clean install**
```bash
# Arrêter le serveur (Ctrl+C)
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Si le champ apparaît mais ne fonctionne pas

**Vérifier le backend :**
```bash
# Dans un autre terminal
curl http://localhost:4059/api/rome/metiers?query=dev
```

Devrait retourner du JSON avec les métiers.

## 📝 Logs à vérifier

### Console navigateur (F12)
- Aucune erreur rouge
- Requêtes vers `/api/rome/metiers` dans l'onglet Network

### Terminal backend
- `Serveur démarré sur le port 4059`
- Pas de messages d'erreur

### Terminal frontend
- `Compiled successfully!`
- `webpack compiled with X warnings`

## 🆘 Si rien ne fonctionne

Copiez-moi :
1. La sortie complète de `npm run dev`
2. Les erreurs de la console navigateur (F12)
3. Le résultat de `curl http://localhost:4059/api/rome/metiers`

Je pourrai ainsi identifier précisément le problème !
