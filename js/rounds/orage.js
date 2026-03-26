/* ════════════════════════════════════════════
   rounds/orage.js — Orage de Points
   60 secondes de questions rapides.
   1er correct : base × 1.5
   2e correct : base × 1
   3e+ correct : base × 0.5
   Mauvaise réponse : -(base × 0.25)
   ════════════════════════════════════════════ */

async function roundOrage_start(room, gs, rQs) {
  const orageStart   = gs.orageStart || Date.now();
  const orageElapsed = Date.now() - orageStart;
  if (orageElapsed >= 60000) {
    await fp(`rooms/${CODE}`, { "gameState/phase":"question", "gameState/revealed":true, "gameState/result":{ msg:"⏱️ 60 secondes écoulées ! Fin de l'orage !", pts:0, scorer:null } });
    setTimeout(() => hostNextQ(room, { ...gs, orageStart }, rQs), 3000);
    return;
  }
  await fp(`rooms/${CODE}`, {
    "gameState/phase":"question", "gameState/buzzed":null, "gameState/buzzedOut":[],
    "gameState/answers":{}, "gameState/revealed":false, "gameState/result":null,
    "gameState/pickTarget":false, "gameState/hostPick":null,
    "gameState/timerStart":Date.now(), "gameState/timerDur":15,
    "gameState/orageStart":orageStart
  });
  if (HTIMER) clearTimeout(HTIMER);
  HTIMER = setTimeout(async () => {
    const cur = await fg(`rooms/${CODE}/gameState`);
    if (!cur || cur.revealed || cur.phase !== "question") return;
    await roundOrage_end(room, cur, rQs);
  }, 15000);
}

async function roundOrage_end(room, gs, rQs) {
  const q = rQs[gs.roundIdx][gs.qIdx];
  const ans = gs.answers || {};
  const sc = [...gs.scores];
  const N = gs.players.length;
  const BASE = 50 * N;
  const COEFF = [1.5, 1];
  const DEFAULT_COEFF = 0.5;
  const WRONG_COEFF = 0.25;

  const correct = Object.entries(ans).filter(([, { ansIdx }]) => ansIdx === q.c).sort((a, b) => a[1].time - b[1].time);
  const wrong   = Object.entries(ans).filter(([, { ansIdx }]) => ansIdx !== q.c);

  correct.forEach(([name], rank) => {
    const pi = gs.players.indexOf(name);
    const coeff = rank < COEFF.length ? COEFF[rank] : DEFAULT_COEFF;
    sc[pi] += Math.round(BASE * coeff);
  });
  wrong.forEach(([name]) => {
    const pi = gs.players.indexOf(name);
    sc[pi] = Math.max(0, sc[pi] - Math.round(BASE * WRONG_COEFF));
  });

  const topMsg = correct.length
    ? correct.slice(0, 2).map(([n], i) => {
        const coeff = i < COEFF.length ? COEFF[i] : DEFAULT_COEFF;
        return `${n} +${Math.round(BASE * coeff)}pts`;
      }).join(", ")
    : "Personne !";

  await fp(`rooms/${CODE}`, {
    "gameState/revealed":true,
    "gameState/result":{ msg:`⚡ ${topMsg}`, pts:correct.length ? Math.round(BASE * COEFF[0]) : 0, scorer:correct[0]?.[0] || null },
    "gameState/scores":sc
  });

  setTimeout(async () => {
    const cur = await fg(`rooms/${CODE}/gameState`); if (!cur) return;
    const orageElapsed = Date.now() - (cur.orageStart || Date.now());
    if (orageElapsed >= 60000) {
      await fp(`rooms/${CODE}`, { "gameState/revealed":true, "gameState/result":{ msg:"🌩️ Fin de l'orage de points !", pts:0, scorer:null } });
      setTimeout(() => hostNextQ(room, cur, rQs), 2000);
    } else {
      const qIdx = cur.qIdx + 1;
      if (qIdx >= (rQs[cur.roundIdx] || []).length) { hostNextQ(room, cur, rQs); }
      else { await fp(`rooms/${CODE}`, { "gameState/qIdx":qIdx, "gameState/result":null }); const updated = await fg(`rooms/${CODE}/gameState`); hostStartQ(room, { ...updated, qIdx }, rQs); }
    }
  }, 1500);
}
