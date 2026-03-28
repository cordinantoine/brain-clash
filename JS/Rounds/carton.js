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
  const players = toArr(gs.players);
  const balloons = toArr(gs.balloons).length ? toArr(gs.balloons) : players.map(() => room.cartonBallons || 3);
  const roundElim = toArr(gs.roundElim);
  const scores = toArr(gs.scores);

  // Check if only 1 (or 0) player alive — end round immediately
  const alive = players.filter(p => !roundElim.includes(p));
  if (alive.length <= 1) {
    const done = await roundCarton_checkLastStanding(room, gs, rQs, balloons, roundElim, [...scores]);
    if (done) return;
  }

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
  const players = toArr(gs.players);
  const q = rQs[gs.roundIdx][gs.qIdx];
  const balloons = toArr(gs.balloons).length ? toArr(gs.balloons) : players.map(() => room.cartonBallons || 3);
  const roundElim = toArr(gs.roundElim);
  const scores = toArr(gs.scores);
  const recap = players.map((p, i) => `${p}: ${'🎈'.repeat(balloons[i]||0)}${(balloons[i]||0) === 0 ? ' 💀' : ''}`).join('  ');
  await fp(`rooms/${CODE}`, {
    "gameState/revealed":true,
    "gameState/result":{ msg:`⏱️ Temps écoulé ! Bonne réponse : ${q.a[q.c]}\n${recap}`, pts:0, scorer:null }
  });
  const alive = players.filter(p => !roundElim.includes(p));
  if (alive.length <= 1) {
    const done = await roundCarton_checkLastStanding(room, gs, rQs, balloons, roundElim, [...scores]);
    if (done) return;
  }
  setTimeout(() => roundCarton_nextQ(room, gs, rQs), 3500);
}

// Move to next question within the same round (NOT hostNextQ which changes rounds)
async function roundCarton_nextQ(room, gs, rQs) {
  I_BUZZED = false; lastAnswerKey = "";
  const qIdx = (gs.qIdx || 0) + 1;
  await fp(`rooms/${CODE}`, { "gameState/qIdx":qIdx, "gameState/chronoRanking":null });
  const cur = await fg(`rooms/${CODE}/gameState`);
  hostStartQ(room, { ...cur, qIdx }, rQs);
}

async function roundCarton_check(room, gs, rQs) {
  const q = rQs[gs.roundIdx][gs.qIdx];
  const ans = gs.answers || {};
  const players = toArr(gs.players);
  const N = players.length;
  const BASE = 50 * N;
  const sc = [...toArr(gs.scores)];
  const balloons = [...(toArr(gs.balloons).length ? toArr(gs.balloons) : players.map(() => room.cartonBallons || 3))];
  const roundElim = [...toArr(gs.roundElim)];

  const correct = Object.entries(ans)
    .filter(([name, { ansIdx }]) => ansIdx === q.c && !roundElim.includes(name))
    .sort((a, b) => a[1].time - b[1].time);

  const wrongPlayers = Object.entries(ans)
    .filter(([name, { ansIdx }]) => ansIdx !== q.c && !roundElim.includes(name));

  wrongPlayers.forEach(([name]) => {
    const pi = players.indexOf(name);
    if (balloons[pi] > 0) {
      balloons[pi]--;
      sc[pi] = Math.max(0, sc[pi] - Math.round(BASE * 0.3));
    }
    if (balloons[pi] <= 0 && !roundElim.includes(name)) roundElim.push(name);
  });

  // Messages détaillés pour les mauvaises réponses
  const wrongDetails = wrongPlayers.map(([name]) => {
    const pi = players.indexOf(name);
    if (balloons[pi] <= 0) return `❌ ${name} perd son dernier ballon ! 💥 Éliminé !`;
    return `❌ ${name} perd un ballon ! 🎈 (${balloons[pi]} restant${balloons[pi]>1?'s':''})`;
  });
  const recap = players.map((p, i) => `${p}: ${'🎈'.repeat(balloons[i])}${balloons[i] === 0 ? ' 💀' : ''}`).join('  ');

  if (correct.length > 0) {
    if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }
    const winner = correct[0][0];
    const ptsWin = Math.round(BASE * 0.4);
    sc[players.indexOf(winner)] += ptsWin;

    const targets = players.filter(p => p !== winner && !roundElim.includes(p));
    const wrongPart = wrongDetails.length ? '\n' + wrongDetails.join('\n') : '';

    if (targets.length === 0) {
      await fp(`rooms/${CODE}`, {
        "gameState/revealed":true, "gameState/scores":sc, "gameState/balloons":balloons,
        "gameState/roundElim":roundElim,
        "gameState/result":{ msg:`✅ ${winner} a bon ! +${ptsWin} pts 🎯${wrongPart}\n${recap}`, pts:ptsWin, scorer:winner }
      });
      const done = await roundCarton_checkLastStanding(room, gs, rQs, balloons, roundElim, sc);
      if (!done) setTimeout(() => roundCarton_nextQ(room, { ...gs, balloons, roundElim, scores:sc }, rQs), 3500);
    } else {
      await fp(`rooms/${CODE}`, {
        "gameState/buzzed":winner,
        "gameState/pickTarget":true, "gameState/scores":sc, "gameState/balloons":balloons,
        "gameState/roundElim":roundElim,
        "gameState/result":{ msg:`✅ ${winner} a bon ! +${ptsWin} pts — Sur qui tirer ? 🎯${wrongPart}`, pts:ptsWin, scorer:winner }
      });
    }
  } else if (wrongPlayers.length > 0) {
    // Au moins une mauvaise réponse — stopper la question immédiatement
    if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }
    const wrongPart = wrongDetails.join('\n');
    await fp(`rooms/${CODE}`, {
      "gameState/revealed":true, "gameState/scores":sc, "gameState/balloons":balloons,
      "gameState/roundElim":roundElim,
      "gameState/result":{ msg:`${wrongPart}\nBonne réponse : ${q.a[q.c]}\n${recap}`, pts:0, scorer:null }
    });
    const done = await roundCarton_checkLastStanding(room, gs, rQs, balloons, roundElim, sc);
    if (!done) setTimeout(() => roundCarton_nextQ(room, { ...gs, balloons, roundElim, scores:sc }, rQs), 3500);
  } else {
    // Aucune réponse traitée (ne devrait pas arriver)
    return;
  }
}

async function roundCarton_checkLastStanding(room, gs, rQs, balloons, roundElim, sc) {
  const players = toArr(gs.players);
  const N = players.length;
  const BASE = 50 * N;
  const alive = players.filter(p => !roundElim.includes(p));
  if (alive.length <= 1) {
    if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }
    const surv = alive[0] || null;
    const survPts = Math.round(BASE * 1.25);
    if (surv) { sc[players.indexOf(surv)] += survPts; }
    const recap = players.map((p, i) => `${p}: ${'🎈'.repeat(balloons[i]||0)}${(balloons[i]||0) === 0 ? ' 💀' : ''}`).join('  ');
    await fp(`rooms/${CODE}`, {
      "gameState/revealed":true, "gameState/scores":sc, "gameState/balloons":balloons, "gameState/roundElim":roundElim,
      "gameState/result":{ msg:surv ? `🏆 ${surv} est le dernier debout ! +${survPts} pts\n${recap}` : `Round terminé !\n${recap}`, pts:surv ? survPts : 0, scorer:surv }
    });
    // Round terminé — passage direct au round suivant (scoreboard → roundIntro)
    const nextRIdx = gs.roundIdx + 1;
    setTimeout(async () => {
      if (nextRIdx >= room.rounds.length) {
        await fp(`rooms/${CODE}`, {"gameState/phase":"final","gameState/scores":sc});
        return;
      }
      await fp(`rooms/${CODE}`, {
        "gameState/phase":"scoreboard","gameState/roundIdx":nextRIdx,"gameState/qIdx":0,
        "gameState/roundElim":[],"gameState/chronoRanking":null,"gameState/balloons":null,
        "gameState/patateManche":0,"gameState/patateExplosion":null
      });
      setTimeout(async () => {
        await fp(`rooms/${CODE}`, {"gameState/phase":"roundIntro","gameState/ready":{}});
        const cur = await fg(`rooms/${CODE}/gameState`);
        hostWaitReady(room, {...cur, roundIdx:nextRIdx, qIdx:0, roundElim:[]}, rQs);
      }, 5000);
    }, 3500);
    return true;
  }
  return false;
}

async function roundCarton_pick(room, gs, rQs, targetName) {
  const players = toArr(gs.players);
  const sc = [...toArr(gs.scores)];
  const N = players.length;
  const BASE = 50 * N;
  const tI = players.indexOf(targetName);
  const balloons = [...(toArr(gs.balloons).length ? toArr(gs.balloons) : players.map(() => room.cartonBallons || 3))];
  const roundElim = [...toArr(gs.roundElim)];

  balloons[tI] = Math.max(0, balloons[tI] - 1);
  sc[tI] = Math.max(0, sc[tI] - Math.round(BASE * 0.3));
  if (balloons[tI] <= 0 && !roundElim.includes(targetName)) roundElim.push(targetName);

  const recap = players.map((p, i) => `${p}: ${'🎈'.repeat(balloons[i])}${balloons[i] === 0 ? ' 💀' : ''}`).join('  ');
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
