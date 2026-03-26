/* ════════════════════════════════════════════
   rounds/buzzer.js — Buzzer Rapide
   Le premier à buzzer ET donner la bonne réponse
   gagne base × 0.5 pts. Mauvaise réponse → -(base × 0.15).
   Timer de 3s pour répondre. Timer question se pause au buzz.
   ════════════════════════════════════════════ */

async function roundBuzzer_process(room, gs, rQs, isOk) {
  const q = rQs[gs.roundIdx][gs.qIdx];
  const sc = [...gs.scores];
  const pIdx = gs.players.indexOf(gs.buzzed);
  const N = gs.players.length;
  const BASE = 50 * N;
  const ptsWin = Math.round(BASE * 0.5);
  const ptsLose = Math.round(BASE * 0.15);

  const restartTimer = async (updGs) => {
    // Resume the question timer with remaining time
    const remaining = updGs._buzzerTimeRemaining || 30;
    const tStart = Date.now();
    await fp(`rooms/${CODE}`, {
      "gameState/result":null, "gameState/timerStart":tStart, "gameState/timerDur":remaining,
      "gameState/_buzzerTimeRemaining":remaining
    });
    HTIMER = setTimeout(async () => {
      const c2 = await fg(`rooms/${CODE}/gameState`);
      if (!c2 || c2.revealed || c2.phase !== "question") return;
      await fp(`rooms/${CODE}`, { "gameState/revealed":true, "gameState/result":{ msg:"⏱️ Temps écoulé !", pts:0, scorer:null } });
      setTimeout(() => hostNextQ(room, updGs || gs, rQs), 3000);
    }, remaining * 1000);
  };

  if (isOk) {
    sc[pIdx] += ptsWin;
    await fp(`rooms/${CODE}`, { "gameState/revealed":true, "gameState/scores":sc, "gameState/result":{ msg:`✅ ${gs.buzzed} a bon ! +${ptsWin} pts`, pts:ptsWin, scorer:gs.buzzed } });
    setTimeout(() => hostNextQ(room, gs, rQs), 2500);
  } else {
    sc[pIdx] = Math.max(0, sc[pIdx] - ptsLose);
    const bo = [...(gs.buzzedOut || []), gs.buzzed];
    const remaining = gs.players.filter(p => !bo.includes(p) && !(gs.roundElim || []).includes(p));
    if (!remaining.length) {
      await fp(`rooms/${CODE}`, { "gameState/revealed":true, "gameState/scores":sc, "gameState/buzzedOut":bo, "gameState/result":{ msg:`❌ ${gs.buzzed} a raté ! Bonne réponse : ${q.a[q.c]}`, pts:-ptsLose, scorer:null } });
      setTimeout(() => hostNextQ(room, gs, rQs), 3000);
    } else {
      // Calculate remaining question time
      const timeRemaining = gs._buzzerTimeRemaining || Math.max(1, Math.round(gs.timerDur - (Date.now() - gs.timerStart) / 1000));
      await fp(`rooms/${CODE}`, { "gameState/buzzed":null, "gameState/scores":sc, "gameState/buzzedOut":bo, "gameState/result":{ msg:`❌ ${gs.buzzed} a raté ! -${ptsLose} pts. Rebuzz dans 3s !`, pts:-ptsLose, scorer:null }, "gameState/_buzzerTimeRemaining":timeRemaining });
      setTimeout(async () => { await restartTimer({ ...gs, buzzedOut:bo, scores:sc, _buzzerTimeRemaining:timeRemaining }); }, 3000);
    }
  }
}
