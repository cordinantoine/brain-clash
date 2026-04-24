/* ════════════════════════════════════════════
   rounds/patate.js — Patate Chaude v2
   4 manches. Chaque manche : timer caché (15-45s).
   Seul le porteur voit la question et peut répondre.
   Bonne réponse = passe la patate (0 pts).
   Mauvaise réponse = garde la patate, question suivante.
   Explosion = -(base × 0.4) pts. Pas d'élimination.
   ════════════════════════════════════════════ */

async function roundPatate_start(room, gs, rQs) {
  const N = gs.players.length;
  const BASE = 50 * N;
  const manche = gs.patateManche || 0;

  // 4 manches terminées → round fini, forcer passage au round suivant
  if (manche >= 4) {
    const pool = rQs[gs.roundIdx] || [];
    await fp(`rooms/${CODE}`, {
      "gameState/phase":"question", "gameState/revealed":true,
      "gameState/qIdx": pool.length,
      "gameState/result":{ msg:"🥔 Fin de la Patate Chaude !", pts:0, scorer:null }
    });
    setTimeout(() => hostNextQ(room, { ...gs, qIdx: pool.length - 1 }, rQs), 3000);
    return;
  }

  // Recycle questions if pool exhausted
  const pool = rQs[gs.roundIdx] || [];
  let qIdx = gs.qIdx;
  if (qIdx >= pool.length) qIdx = qIdx % pool.length;

  // Random holder
  const holder = gs.players[Math.floor(Math.random() * gs.players.length)];

  // Random hidden timer: 15-45 seconds
  const explodeDelay = Math.floor(Math.random() * 31 + 15) * 1000;
  const explodeAt = Date.now() + explodeDelay;

  await fp(`rooms/${CODE}`, {
    "gameState/phase":"question", "gameState/buzzed":null, "gameState/buzzedOut":[],
    "gameState/answers":{}, "gameState/revealed":false, "gameState/result":null,
    "gameState/pickTarget":false, "gameState/hostPick":null,
    "gameState/timerStart":null, "gameState/timerDur":null,
    "gameState/patateHolder":holder, "gameState/patateExplodeAt":explodeAt,
    "gameState/patateManche":manche, "gameState/qIdx":qIdx
  });

  // Explosion timer
  if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }
  HTIMER = setTimeout(async () => {
    const doExplode = async () => {
      const cur = await fg(`rooms/${CODE}/gameState`);
      if (!cur || cur.phase === "patateExplosion") return;
      // Race condition: if pass/fail animation is running, retry after it finishes
      if (cur.phase === "questionResult") { setTimeout(doExplode, 3000); return; }
      if (cur.phase !== "question") return;

      const sc = [...cur.scores];
      const loser = cur.patateHolder;
      const hi = cur.players.indexOf(loser);
      const losePts = Math.round(BASE * 0.4);
      if (hi >= 0) sc[hi] = Math.max(0, sc[hi] - losePts);

      const newManche = (cur.patateManche || 0) + 1;

      await fp(`rooms/${CODE}`, {
        "gameState/phase":"patateExplosion",
        "gameState/revealed":true, "gameState/scores":sc,
        "gameState/patateExplodeAt":null,
        "gameState/result":{ msg:`💥 BOOM ! ${loser} explose ! -${losePts} pts`, pts:-losePts, scorer:loser },
        "gameState/patateManche":newManche
      });

      // After 4s: next manche or end round
      setTimeout(async () => {
        const upd = await fg(`rooms/${CODE}/gameState`);
        if (!upd || (upd.patateManche || 0) !== newManche) return;
        if (newManche >= 4) {
          const pool = rQs[cur.roundIdx] || [];
          await fp(`rooms/${CODE}`, { "gameState/qIdx": pool.length });
          hostNextQ(room, { ...cur, scores:sc, patateManche:newManche, qIdx: pool.length - 1 }, rQs);
        } else {
          hostStartQ(room, { ...upd, patateManche:newManche, scores:sc }, rQs);
        }
      }, 4000);
    };
    doExplode();
  }, explodeDelay);
}

async function roundPatate_process(room, gs, rQs, isOk) {
  // NEVER clear HTIMER — the explosion timer keeps ticking!
  // Live read to guard against race condition with doExplode (stale snapshot)
  const live = await fg(`rooms/${CODE}/gameState`);
  if (!live || live.revealed || live.phase === "patateExplosion" || (live.patateManche || 0) >= 4) return;
  const holder = live.patateHolder || gs.patateHolder || gs.buzzed;

  if (isOk) {
    // Pass potato to random other player
    const others = gs.players.filter(p => p !== holder);
    const newHolder = others[Math.floor(Math.random() * others.length)];

    await fp(`rooms/${CODE}`, {
      "gameState/phase":"questionResult",
      "gameState/result":{ msg:`✅ ${holder} passe la patate à ${newHolder} !`, pts:0, scorer:null },
      "gameState/patateHolder":newHolder,
      "gameState/buzzed":null, "gameState/answers":{}, "gameState/buzzedOut":[]
    });

    // 2.5s then restore question phase manually (do NOT call hostStartQ — keeps explosion timer intact)
    setTimeout(async () => {
      const cur = await fg(`rooms/${CODE}/gameState`);
      if (!cur || cur.phase === "patateExplosion" || (cur.patateManche || 0) >= 4) return;
      const pool = rQs[cur.roundIdx] || [];
      const nextQ = (cur.qIdx + 1) % pool.length;
      await fp(`rooms/${CODE}`, {
        "gameState/phase":"question",
        "gameState/result":null,
        "gameState/qIdx":nextQ, "gameState/answers":{},
        "gameState/buzzed":null, "gameState/revealed":false, "gameState/buzzedOut":[]
      });
    }, 2500);
  } else {
    // Keep potato, next question
    await fp(`rooms/${CODE}`, {
      "gameState/phase":"questionResult",
      "gameState/result":{ msg:`❌ Raté ! ${holder} garde la patate !`, pts:0, scorer:null },
      "gameState/buzzed":null, "gameState/answers":{}, "gameState/buzzedOut":[]
    });

    setTimeout(async () => {
      const cur = await fg(`rooms/${CODE}/gameState`);
      if (!cur || cur.phase === "patateExplosion" || (cur.patateManche || 0) >= 4) return;
      const pool = rQs[cur.roundIdx] || [];
      const nextQ = (cur.qIdx + 1) % pool.length;
      await fp(`rooms/${CODE}`, {
        "gameState/phase":"question",
        "gameState/result":null,
        "gameState/qIdx":nextQ, "gameState/answers":{},
        "gameState/buzzed":null, "gameState/revealed":false, "gameState/buzzedOut":[]
      });
    }, 2500);
  }
}
