/* ════════════════════════════════════════════
   rounds/carton.js — Tir à la Carabine 🎯
   QCM-style : tous les joueurs répondent.
   Le premier correct choisit sur qui tirer (= retirer 1 ballon).
   Mauvaise réponse = perd 1 ballon soi-même.
   0 ballon = éliminé. Pas de manches — une seule partie
   continue jusqu'au dernier survivant.
   Points dynamiques :
     bonne réponse : base × 0.4
     ballon perdu (mauvaise rép) : -(base × 0.3)
     ballon perdu (tir reçu) : -(base × 0.3)
     survivant final : base × 1.25
   ════════════════════════════════════════════ */

async function roundCarton_start(room, gs, rQs) {
  // Check if we've exhausted the question pool — regenerate if needed
  const pool = rQs[gs.roundIdx] || [];
  if (gs.qIdx >= pool.length) {
    const themes = room.themes && room.themes.length ? room.themes : [room.theme || "culture"];
    rQs[gs.roundIdx] = getStaticQs(themes, 50);
    gs.qIdx = 0;
    await fp(`rooms/${CODE}`, { "gameState/rQs":rQs, "gameState/qIdx":0 });
  }

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
    await roundCarton_timeout(room, cur, rQs);
  }, 20000);
}

async function roundCarton_timeout(room, gs, rQs) {
  const q = rQs[gs.roundIdx][gs.qIdx];
  const balloons = gs.balloons || gs.players.map(() => room.cartonBallons || 3);
  const recap = gs.players.map((p, i) => `${p}: ${'🎈'.repeat(balloons[i])}${balloons[i] === 0 ? ' 💀' : ''}`).join('  ');
  await fp(`rooms/${CODE}`, {
    "gameState/revealed":true,
    "gameState/result":{ msg:`⏱️ Temps écoulé ! Bonne réponse : ${q.a[q.c]}\n${recap}`, pts:0, scorer:null }
  });
  setTimeout(() => roundCarton_nextQ(room, gs, rQs), 3500);
}

// Move to next question within the same round (NOT hostNextQ which changes rounds)
async function roundCarton_nextQ(room, gs, rQs) {
  I_BUZZED = false; lastAnswerKey = "";
  const qIdx = gs.qIdx + 1;
  await fp(`rooms/${CODE}`, { "gameState/qIdx":qIdx, "gameState/chronoRanking":null });
  const cur = await fg(`rooms/${CODE}/gameState`);
  hostStartQ(room, { ...cur, qIdx }, rQs);
}

async function roundCarton_check(room, gs, rQs) {
  const q = rQs[gs.roundIdx][gs.qIdx];
  const ans = gs.answers || {};
  const N = gs.players.length;
  const BASE = 50 * N;
  const sc = [...gs.scores];
  const balloons = [...(gs.balloons || gs.players.map(() => room.cartonBallons || 3))];
  const roundElim = [...(gs.roundElim || [])];

  const correct = Object.entries(ans)
    .filter(([name, { ansIdx }]) => ansIdx === q.c && !roundElim.includes(name))
    .sort((a, b) => a[1].time - b[1].time);

  const wrongPlayers = Object.entries(ans)
    .filter(([name, { ansIdx }]) => ansIdx !== q.c && !roundElim.includes(name));

  wrongPlayers.forEach(([name]) => {
    const pi = gs.players.indexOf(name);
    if (balloons[pi] > 0) {
      balloons[pi]--;
      sc[pi] = Math.max(0, sc[pi] - Math.round(BASE * 0.3));
    }
    if (balloons[pi] <= 0 && !roundElim.includes(name)) roundElim.push(name);
  });

  if (correct.length > 0) {
    if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }
    const winner = correct[0][0];
    const ptsWin = Math.round(BASE * 0.4);
    sc[gs.players.indexOf(winner)] += ptsWin;

    const targets = gs.players.filter(p => p !== winner && !roundElim.includes(p));

    if (targets.length === 0) {
      await fp(`rooms/${CODE}`, {
        "gameState/revealed":true, "gameState/scores":sc, "gameState/balloons":balloons,
        "gameState/roundElim":roundElim,
        "gameState/result":{ msg:`✅ ${winner} a bon ! +${ptsWin} pts 🎯`, pts:ptsWin, scorer:winner }
      });
      const done = await roundCarton_checkLastStanding(room, gs, rQs, balloons, roundElim, sc);
      if (!done) setTimeout(() => roundCarton_nextQ(room, { ...gs, balloons, roundElim, scores:sc }, rQs), 3500);
    } else {
      await fp(`rooms/${CODE}`, {
        "gameState/buzzed":winner,
        "gameState/pickTarget":true, "gameState/scores":sc, "gameState/balloons":balloons,
        "gameState/roundElim":roundElim,
        "gameState/result":{ msg:`✅ ${winner} a bon ! +${ptsWin} pts — Sur qui tirer ? 🎯`, pts:ptsWin, scorer:winner }
      });
    }
  } else {
    if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }
    const wrongMsgs = wrongPlayers.map(([name]) => `${name} -1🎈`).join(', ');
    const recap = gs.players.map((p, i) => `${p}: ${'🎈'.repeat(balloons[i])}${balloons[i] === 0 ? ' 💀' : ''}`).join('  ');
    await fp(`rooms/${CODE}`, {
      "gameState/revealed":true, "gameState/scores":sc, "gameState/balloons":balloons,
      "gameState/roundElim":roundElim,
      "gameState/result":{ msg:`❌ Personne n'a bon ! ${wrongMsgs ? wrongMsgs : ''}\n${recap}`, pts:0, scorer:null }
    });
    const done = await roundCarton_checkLastStanding(room, gs, rQs, balloons, roundElim, sc);
    if (!done) setTimeout(() => roundCarton_nextQ(room, { ...gs, balloons, roundElim, scores:sc }, rQs), 3500);
  }
}

async function roundCarton_checkLastStanding(room, gs, rQs, balloons, roundElim, sc) {
  const N = gs.players.length;
  const BASE = 50 * N;
  const alive = gs.players.filter(p => !roundElim.includes(p));
  if (alive.length <= 1) {
    const surv = alive[0] || null;
    const survPts = Math.round(BASE * 1.25);
    if (surv) { sc[gs.players.indexOf(surv)] += survPts; }
    const recap = gs.players.map((p, i) => `${p}: ${'🎈'.repeat(balloons[i])}${balloons[i] === 0 ? ' 💀' : ''}`).join('  ');
    await fp(`rooms/${CODE}`, {
      "gameState/revealed":true, "gameState/scores":sc, "gameState/balloons":balloons, "gameState/roundElim":roundElim,
      "gameState/result":{ msg:surv ? `🏆 ${surv} est le dernier debout ! +${survPts} pts\n${recap}` : `Round terminé !\n${recap}`, pts:surv ? survPts : 0, scorer:surv }
    });
    // Round is over — go to next round
    setTimeout(() => hostNextQ(room, { ...gs, balloons, roundElim, scores:sc }, rQs), 3500);
    return true;
  }
  return false;
}

async function roundCarton_pick(room, gs, rQs, targetName) {
  const sc = [...gs.scores];
  const N = gs.players.length;
  const BASE = 50 * N;
  const tI = gs.players.indexOf(targetName);
  const balloons = [...(gs.balloons || gs.players.map(() => room.cartonBallons || 3))];
  const roundElim = [...(gs.roundElim || [])];

  balloons[tI] = Math.max(0, balloons[tI] - 1);
  sc[tI] = Math.max(0, sc[tI] - Math.round(BASE * 0.3));
  if (balloons[tI] <= 0 && !roundElim.includes(targetName)) roundElim.push(targetName);

  const recap = gs.players.map((p, i) => `${p}: ${'🎈'.repeat(balloons[i])}${balloons[i] === 0 ? ' 💀' : ''}`).join('  ');
  const shotMsg = balloons[tI] <= 0
    ? `🎯 ${gs.buzzed} crève le dernier ballon de ${targetName} ! 💥 Éliminé !`
    : `🎯 ${gs.buzzed} crève un ballon de ${targetName} ! 🎈 (reste ${balloons[tI]})`;

  await fp(`rooms/${CODE}`, {
    "gameState/revealed":true, "gameState/pickTarget":false, "gameState/scores":sc,
    "gameState/balloons":balloons, "gameState/roundElim":roundElim,
    "gameState/result":{ msg:`${shotMsg}\n${recap}`, pts:Math.round(BASE * 0.4), scorer:gs.buzzed }
  });

  const done = await roundCarton_checkLastStanding(room, gs, rQs, balloons, roundElim, sc);
  if (!done) {
    setTimeout(() => roundCarton_nextQ(room, { ...gs, balloons, roundElim, scores:sc }, rQs), 3500);
  }
}
