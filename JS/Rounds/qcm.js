/* ════════════════════════════════════════════
   rounds/qcm.js — QCM Classique
   Tout le monde répond, 20s chrono.
   Bonne réponse = base × 0.5 pts (dynamique).
   ════════════════════════════════════════════ */

async function roundQCM_start(room, gs, rQs) {
  await fp(`rooms/${CODE}`, {
    "gameState/phase":"question", "gameState/buzzed":null, "gameState/buzzedOut":[],
    "gameState/answers":{}, "gameState/revealed":false, "gameState/result":null,
    "gameState/pickTarget":false, "gameState/hostPick":null,
    "gameState/timerStart":Date.now(), "gameState/timerDur":20
  });
  if (HTIMER) clearTimeout(HTIMER);
  HTIMER = setTimeout(async () => {
    const cur = await fg(`rooms/${CODE}/gameState`);
    if (!cur || cur.revealed || cur.phase !== "question") return;
    await roundQCM_end(room, cur, rQs);
  }, 20000);
}

async function roundQCM_end(room, gs, rQs) {
  const q = rQs[gs.roundIdx][gs.qIdx];
  const ans = gs.answers || {};
  const sc = [...gs.scores];
  const N = gs.players.length;
  const BASE = 50 * N;
  const pts = Math.round(BASE * 0.5);
  const correct = [];
  gs.players.forEach((p, i) => { if (ans[p] !== undefined && ans[p].ansIdx === q.c) { sc[i] += pts; correct.push(p); } });
  const msg = correct.length
    ? `✅ Bonne réponse : ${q.a[q.c]} — ${correct.join(", ")} marquent +${pts} pts !`
    : `❌ Personne ! Bonne réponse : ${q.a[q.c]}`;
  await fp(`rooms/${CODE}`, { "gameState/revealed":true, "gameState/result":{ msg, pts, scorer:correct[0] || null }, "gameState/scores":sc });
  setTimeout(() => hostNextQ(room, gs, rQs), 3000);
}
