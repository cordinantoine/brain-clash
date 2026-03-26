/* ════════════════════════════════════════════
   rounds/patate.js — Patate Chaude
   8 questions. Chaque question : une bombe assignée
   aléatoirement à un joueur. Explose après 5-30s.
   Bonne réponse = base × 0.25 pts.
   Explosion = -(base × 0.4) pts.
   ════════════════════════════════════════════ */

async function roundPatate_start(room, gs, rQs) {
  const N = gs.players.length;
  const BASE = 50 * N;
  const alive = gs.players.filter(p => !(gs.roundElim || []).includes(p));

  if (alive.length <= 1) {
    // Round over
    await fp(`rooms/${CODE}`, {
      "gameState/phase":"question", "gameState/revealed":true,
      "gameState/result":{ msg:"💥 Fin de la Patate Chaude !", pts:0, scorer:null }
    });
    setTimeout(() => hostNextQ(room, gs, rQs), 3000);
    return;
  }

  // Random bomb holder for this question
  const holder = alive[Math.floor(Math.random() * alive.length)];
  // Random explosion delay between 5 and 30 seconds
  const explodeDelay = Math.floor(Math.random() * 26 + 5) * 1000;
  const explodeAt = Date.now() + explodeDelay;

  await fp(`rooms/${CODE}`, {
    "gameState/phase":"question", "gameState/buzzed":null, "gameState/buzzedOut":[],
    "gameState/answers":{}, "gameState/revealed":false, "gameState/result":null,
    "gameState/pickTarget":false, "gameState/hostPick":null,
    "gameState/timerStart":Date.now(), "gameState/timerDur":30,
    "gameState/patateHolder":holder, "gameState/patateExplodeAt":explodeAt
  });

  // Set explosion timer
  if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }
  HTIMER = setTimeout(async () => {
    const cur = await fg(`rooms/${CODE}/gameState`);
    if (!cur || cur.revealed || cur.phase !== "question") return;

    const sc = [...cur.scores];
    const loser = cur.patateHolder;
    const hi = cur.players.indexOf(loser);
    const losePts = Math.round(BASE * 0.4);
    if (hi >= 0) sc[hi] = Math.max(0, sc[hi] - losePts);

    // Check if player should be eliminated (score <= 0)
    const newRoundElim = [...(cur.roundElim || [])];
    if (sc[hi] <= 0 && !newRoundElim.includes(loser)) newRoundElim.push(loser);

    await fp(`rooms/${CODE}`, {
      "gameState/revealed":true, "gameState/scores":sc,
      "gameState/roundElim":newRoundElim,
      "gameState/patateExplodeAt":null,
      "gameState/result":{ msg:`💥 BOOM ! ${loser} explose ! -${losePts} pts`, pts:-losePts, scorer:loser }
    });

    // After 2 seconds, move to next question
    setTimeout(() => hostNextQ(room, { ...cur, scores:sc, roundElim:newRoundElim, patateExplodeAt:null }, rQs), 2000);
  }, explodeDelay);
}

async function roundPatate_process(room, gs, rQs, isOk) {
  const N = gs.players.length;
  const BASE = 50 * N;
  const sc = [...gs.scores];
  const pIdx = gs.players.indexOf(gs.buzzed);

  if (isOk) {
    const ptsWin = Math.round(BASE * 0.25);
    sc[pIdx] += ptsWin;
    await fp(`rooms/${CODE}`, {
      "gameState/scores":sc,
      "gameState/result":{ msg:`✅ ${gs.buzzed} a bon ! +${ptsWin} pts 🥔`, pts:ptsWin, scorer:gs.buzzed },
      "gameState/buzzed":null, "gameState/answers":{}, "gameState/buzzedOut":[]
    });
    // Don't clear HTIMER — bomb keeps ticking!
    // Move to next question after 1.5s but keep bomb timer
    setTimeout(async () => {
      const cur = await fg(`rooms/${CODE}/gameState`);
      if (!cur || cur.revealed) return;
      await fp(`rooms/${CODE}`, { "gameState/result":null });
      const qIdx = cur.qIdx + 1;
      if (qIdx >= (rQs[cur.roundIdx] || []).length) {
        // No more questions, just wait for bomb
      } else {
        await fp(`rooms/${CODE}`, { "gameState/qIdx":qIdx, "gameState/answers":{}, "gameState/buzzed":null, "gameState/revealed":false, "gameState/buzzedOut":[] });
      }
    }, 1500);
  } else {
    await fp(`rooms/${CODE}`, {
      "gameState/result":{ msg:`❌ ${gs.buzzed} a raté ! 🥔`, pts:0, scorer:null },
      "gameState/buzzed":null, "gameState/answers":{}, "gameState/buzzedOut":[]
    });
    // Don't clear HTIMER — bomb keeps ticking!
    setTimeout(async () => {
      const cur = await fg(`rooms/${CODE}/gameState`);
      if (!cur || cur.revealed) return;
      await fp(`rooms/${CODE}`, { "gameState/result":null });
      const qIdx = cur.qIdx + 1;
      if (qIdx >= (rQs[cur.roundIdx] || []).length) {
        // No more questions, wait for bomb
      } else {
        await fp(`rooms/${CODE}`, { "gameState/qIdx":qIdx, "gameState/answers":{}, "gameState/buzzed":null, "gameState/revealed":false, "gameState/buzzedOut":[] });
      }
    }, 1500);
  }
}
