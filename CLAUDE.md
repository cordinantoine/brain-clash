# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Project

No build step. Open `index.html` directly in a browser (host/TV screen) and `player.html` on a mobile device or second tab (player screen). All scripts are loaded via `<script>` tags in order.

**Script load order matters** — in both HTML files, the required order is:
1. `config.js` (globals)
2. `firebase.js` (CRUD helpers)
3. `questions/index.js` (initializes `QUESTIONS = {}`)
4. `questions/*.js` (each theme file populates `QUESTIONS`)
5. `scene3d.js`
6. `rounds/*.js` (each round module)
7. `ui.js`
8. `game.js`

## Architecture

### Two HTML entry points

- **`index.html`** — Host/TV screen. Runs `Watch()` to receive Firebase updates and calls `draw*` functions from `ui.js`. Also runs host logic (`hostStartQ`, `hostNextQ`, etc.) when `HOST = true`.
- **`player.html`** — Player/mobile screen. Has its own inline styles and JS. Players call `actBuzz()`, `actAnswer()`, `actPick()`.

### State management

**Firebase Realtime DB is the single source of truth.** All game state lives under `rooms/{CODE}/gameState`. The host writes state changes; all clients (host + players) listen via `fl()` (EventSource SSE with polling fallback).

Key `gameState` fields:
- `phase` — `"roundIntro"` | `"question"` | `"scoreboard"` | `"final"`
- `roundIdx` / `qIdx` — current position in the round/question sequence
- `buzzed` — name of player who buzzed
- `buzzedOut` — players who answered wrong this question
- `answers` — `{ playerName: { ansIdx, time } }`
- `revealed` — whether the answer has been shown
- `result` — `{ msg, pts, scorer }` displayed after answer
- `rQs` — the full question set for the game (stored in Firebase at game start)
- `scores` / `lives` / `cartons` — per-player tracking arrays (indexed same as `players`)

### Round module pattern

Each file in `JS/Rounds/` exports two functions following a naming convention:
- `roundXxx_start(room, gs, rQs)` — called by `hostStartQ()` to set up the question
- `roundXxx_process(room, gs, rQs, isOk)` — called by `hostProcessAnswer()` after a player answers

Rounds that need target picking also export `roundXxx_pick(room, gs, rQs, targetName)`.

`game.js` delegates to these via switch/if chains in `hostStartQ()`, `hostProcessAnswer()`, and `hostPickTarget()`.

### Question format

Every theme file populates `QUESTIONS["themeId"]` with an array of:
```js
{ q: "Question text?", a: ["A","B","C","D"], c: 2, f: "Fun fact" }
// c = correct answer index (0-3), f = unused trivia field
```

### Global variables (config.js)

All mutable session state is declared as `let` globals: `ME`, `CODE`, `HOST`, `STOP`, `HTIMER`, `I_BUZZED`, `lastAnswerKey`, `CD`, `USED_QS`. These are shared across all script files.

### Firebase helpers (firebase.js)

| Function | HTTP method | Use |
|----------|-------------|-----|
| `fg(path)` | GET | Read a value |
| `fs(path, data)` | PUT | Overwrite a value |
| `fp(path, data)` | PATCH | Partial update |
| `fd(path)` | DELETE | Remove a value |
| `fl(path, cb)` | EventSource | Real-time listener, returns `stop()` |

Paths are relative to `rooms/{CODE}`, e.g. `rooms/${CODE}/gameState/buzzed`.

## Adding a New Round Type

1. Create `JS/Rounds/newround.js` with `roundNewround_start()` and `roundNewround_process()`
2. Add an entry to `RT` array in `config.js`
3. Add `if (rType === "newround")` branches in `hostStartQ()`, `hostProcessAnswer()`, and `Watch()` in `game.js`
4. Add `<script src="JS/Rounds/newround.js">` in both `index.html` and `player.html` before `game.js`

## Adding a New Theme

1. Create `JS/Questions/newtheme.js` that pushes to `QUESTIONS["newtheme"]`
2. Add entry to `THEMES` in `config.js`
3. Add 3D settings to `THEME3D` in `scene3d.js`
4. Add `<script src="JS/Questions/newtheme.js">` after `questions/index.js` in both HTML files
