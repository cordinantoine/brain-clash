# Brain Clash

## Entrées
- `index.html` — hôte/TV : `Watch()` + fonctions `draw*` de `ui.js`, logique host (`hostStartQ`, `hostNextQ`, …) si `HOST = true`
- `player.html` — joueur mobile : `actBuzz()`, `actAnswer()`, `actPick()`

## Stack
Vanilla JS + Firebase Realtime DB — pas de build

## Load order (dans les deux HTML)
`config.js` → `firebase.js` → `questions/index.js` → `questions/*.js` → `rounds/*.js` → `ui.js` → `ui-inter.js` → `game.js`

## Structure
```
JS/
├── Questions/   (13 thèmes → QUESTIONS["id"])
├── Rounds/      (6 modules de round)
├── assets/      (avatars av01-av14.png)
├── config.js    (globals let, RT, THEMES)
├── firebase.js  (fg/fs/fp/fd/fl)
├── game.js      (hostStartQ, hostProcessAnswer, hostPickTarget, Watch)
├── ui.js        (drawLoading, drawIntro, drawQ, drawQ_host, drawScore)
└── ui-inter.js  (drawQuestionResult — écran intermédiaire 4.5s entre questions)
```

## State Firebase
`rooms/{CODE}/gameState` — champs clés :
`phase` | `roundIdx/qIdx` | `buzzed` | `buzzedOut` | `answers` | `revealed` | `result` | `rQs` | `scores/lives/cartons`

## Firebase helpers
`fg` GET · `fs` PUT · `fp` PATCH · `fd` DELETE · `fl` EventSource listener → retourne `stop()`

## Round types (RT dans config.js)
qcm · buzzer · chrono · steal · patate · carton

Convention : `roundXxx_start(room,gs,rQs)` · `roundXxx_process(room,gs,rQs,isOk)` · `roundXxx_pick(room,gs,rQs,target)` (optionnel)
Certains rounds utilisent `_check()` ou `_end()` à la place de `_process()`.

## Question format
`{ q, a:[…], c: index_correct, f: anecdote }`

## Ajouter un round
1. `JS/Rounds/newround.js` → exporte `roundNewround_start()` + `roundNewround_process()`
2. Entrée dans `RT` (config.js)
3. Branches dans `hostStartQ()`, `hostProcessAnswer()`, `Watch()` (game.js)
4. `<script>` dans index.html + player.html avant game.js

## Ajouter un thème
1. `JS/Questions/newtheme.js` → push dans `QUESTIONS["id"]`
2. Entrée dans `THEMES` (config.js)
3. `<script>` après questions/index.js dans les deux HTML
