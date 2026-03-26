/* ════════════════════════════════════════════
   rounds/steal.js — Vol de Points
   QCM-style : tous les joueurs répondent.
   Le premier à donner la bonne réponse vole
   20% des points de la cible choisie.
   (min: base × 0.25, max: base × 1)
   ════════════════════════════════════════════ */

async function roundSteal_start(room, gs, rQs) {
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
    await roundSteal_timeout(room, cur, rQs);
  }, 20000);
}

async function roundSteal_timeout(room, gs, rQs) {
  const q = rQs[gs.roundIdx][gs.qIdx];
  await fp(`rooms/${CODE}`, { "gameState/revealed":true, "gameState/result":{ msg:`⏱️ Temps écoulé ! Bonne réponse : ${q.a[q.c]}`, pts:0, scorer:null } });
  setTimeout(() => hostNextQ(room, gs, rQs), 3000);
}

// Called when all players have answered or first correct found
async function roundSteal_check(room, gs, rQs) {
  const q = rQs[gs.roundIdx][gs.qIdx];
  const ans = gs.answers || {};

  // Find the first correct answer by time
  const correct = Object.entries(ans)
    .filter(([, { ansIdx }]) => ansIdx === q.c)
    .sort((a, b) => a[1].time - b[1].time);

  if (correct.length > 0) {
    if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }
    const winner = correct[0][0];
    // Set buzzed to the winner so pick target works
    await fp(`rooms/${CODE}`, {
      "gameState/buzzed":winner,
      "gameState/pickTarget":true,
      "gameState/result":{ msg:`✅ ${winner} a bon en premier ! Choisissez à qui voler…`, pts:0, scorer:winner }
    });
  }
  // If no correct yet and not all answered, wait
}

// Called when all answered and no one correct
async function roundSteal_end(room, gs, rQs) {
  const q = rQs[gs.roundIdx][gs.qIdx];
  const ans = gs.answers || {};
  const correct = Object.entries(ans).filter(([, { ansIdx }]) => ansIdx === q.c);
  if (correct.length === 0) {
    if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }
    await fp(`rooms/${CODE}`, { "gameState/revealed":true, "gameState/result":{ msg:`❌ Personne ! Bonne réponse : ${q.a[q.c]}`, pts:0, scorer:null } });
    setTimeout(() => hostNextQ(room, gs, rQs), 3000);
  }
}

async function roundSteal_pick(room, gs, rQs, targetName) {
  const sc = [...gs.scores];
  const N = gs.players.length;
  const BASE = 50 * N;
  const tI = gs.players.indexOf(targetName), pI = gs.players.indexOf(gs.buzzed);
  const minSteal = Math.round(BASE * 0.25);
  const maxSteal = Math.round(BASE * 1);
  const rawSteal = Math.round(sc[tI] * 0.2);
  const stolen = Math.min(maxSteal, Math.max(minSteal, rawSteal));
  const actualStolen = Math.min(stolen, sc[tI]); // Can't steal more than target has
  sc[pI] += actualStolen; sc[tI] = Math.max(0, sc[tI] - actualStolen);
  await fp(`rooms/${CODE}`, { "gameState/revealed":true, "gameState/pickTarget":false, "gameState/scores":sc, "gameState/result":{ msg:`😈 ${gs.buzzed} vole ${actualStolen} pts à ${targetName} !`, pts:actualStolen, scorer:gs.buzzed } });
  setTimeout(() => hostNextQ(room, gs, rQs), 3000);
}
