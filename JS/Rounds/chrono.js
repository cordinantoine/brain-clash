/* ════════════════════════════════════════════
   rounds/chrono.js — Contre la Montre
   Tout le monde répond en même temps.
   Points dynamiques par ordre de rapidité.
   1er: base×0.6, 2e: base×0.4, 3e: base×0.25, 4e+: base×0.1
   Après révélation: classement affiché sur player.html
   ════════════════════════════════════════════ */

async function roundChrono_start(room, gs, rQs) {
  await fp(`rooms/${CODE}`, {
    "gameState/phase":"question", "gameState/buzzed":null, "gameState/buzzedOut":[],
    "gameState/answers":{}, "gameState/revealed":false, "gameState/result":null,
    "gameState/pickTarget":false, "gameState/hostPick":null,
    "gameState/timerStart":Date.now(), "gameState/timerDur":20,
    "gameState/chronoRanking":null
  });
  if (HTIMER) clearTimeout(HTIMER);
  HTIMER = setTimeout(async () => {
    const cur = await fg(`rooms/${CODE}/gameState`);
    if (!cur || cur.revealed || cur.phase !== "question") return;
    await roundChrono_end(room, cur, rQs);
  }, 20000);
}

async function roundChrono_end(room, gs, rQs) {
  const q = rQs[gs.roundIdx][gs.qIdx];
  const ans = gs.answers || {};
  const sc = [...gs.scores];
  const N = gs.players.length;
  const BASE = 50 * N;
  const COEFF = [0.6, 0.4, 0.25];
  const DEFAULT_COEFF = 0.1;

  const correct = Object.entries(ans)
    .filter(([, { ansIdx }]) => ansIdx === q.c)
    .sort((a, b) => a[1].time - b[1].time);

  const wrong = Object.entries(ans)
    .filter(([, { ansIdx }]) => ansIdx !== q.c)
    .sort((a, b) => a[1].time - b[1].time);

  // Build ranking for player screens
  const ranking = [];

  let msg = "";
  if (!correct.length) {
    msg = "❌ Personne n'avait la bonne réponse !";
    // All who answered are wrong
    wrong.forEach(([name]) => {
      ranking.push({ name, pts: 0, correct: false });
    });
    // Players who didn't answer
    gs.players.forEach(p => {
      if (!ans[p]) ranking.push({ name: p, pts: 0, correct: false });
    });
  } else {
    correct.forEach(([name], rank) => {
      const coeff = rank < COEFF.length ? COEFF[rank] : DEFAULT_COEFF;
      const pts = Math.round(BASE * coeff);
      sc[gs.players.indexOf(name)] += pts;
      ranking.push({ name, pts, correct: true });
    });
    wrong.forEach(([name]) => {
      ranking.push({ name, pts: 0, correct: false });
    });
    // Players who didn't answer
    gs.players.forEach(p => {
      if (!ans[p]) ranking.push({ name: p, pts: 0, correct: false });
    });

    const topPts = Math.round(BASE * COEFF[0]);
    msg = "✅ " + correct.slice(0, 3).map(([name], i) => {
      const coeff = i < COEFF.length ? COEFF[i] : DEFAULT_COEFF;
      return `${name} +${Math.round(BASE * coeff)}pts`;
    }).join("  ");
  }
  await fp(`rooms/${CODE}`, {
    "gameState/revealed":true,
    "gameState/result":{ msg, pts:correct.length ? Math.round(BASE * COEFF[0]) : 0, scorer:correct[0]?.[0] || null },
    "gameState/scores":sc,
    "gameState/chronoRanking":ranking
  });
  setTimeout(() => hostNextQ(room, gs, rQs), 4000);
}
