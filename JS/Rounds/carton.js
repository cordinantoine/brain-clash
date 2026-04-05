/* ════════════════════════════════════════════
   rounds/carton.js — Tir à la Carabine 🎯
   Chaque joueur démarre avec N ballons (défaut 3).
   À chaque question, le 1er qui répond :
     - Bonne réponse → choisit un adversaire à qui crever 1 ballon
     - Mauvaise réponse → perd 1 ballon lui-même
   La question s'arrête dès la 1ère réponse.
   Quand un joueur tombe à 0 ballon → éliminé.
   Dernier survivant = gagne le round.
   ════════════════════════════════════════════ */

// Verrou anti-double exécution
let _cartonBusy = false;

async function roundCarton_start(room, gs, rQs) {
  const players = toArr(gs.players);
  const balloons = toArr(gs.balloons).length ? [...toArr(gs.balloons)] : players.map(() => room.cartonBallons || 3);
  const roundElim = [...toArr(gs.roundElim)];
  const scores = [...toArr(gs.scores)];

  // Si ≤1 survivant → fin du round
  const alive = players.filter(p => !roundElim.includes(p));
  if (alive.length <= 1) {
    await _cartonEndRound(room, gs, rQs, players, balloons, roundElim, scores);
    return;
  }

  // Regénérer les questions si épuisées
  const pool = rQs[gs.roundIdx];
  if (!pool || gs.qIdx >= (Array.isArray(pool) ? pool.length : Object.keys(pool).length)) {
    const themes = room.themes && room.themes.length ? room.themes : [room.theme || "culture"];
    rQs[gs.roundIdx] = getStaticQs(themes, 50);
    gs.qIdx = 0;
    await fp(`rooms/${CODE}`, { "gameState/rQs": rQs, "gameState/qIdx": 0 });
  }

  _cartonBusy = false;
  await fp(`rooms/${CODE}`, {
    "gameState/phase": "question",
    "gameState/buzzed": null,
    "gameState/buzzedOut": [],
    "gameState/answers": {},
    "gameState/revealed": false,
    "gameState/result": null,
    "gameState/pickTarget": false,
    "gameState/hostPick": null,
    "gameState/timerStart": Date.now(),
    "gameState/timerDur": 20
  });

  if (HTIMER) clearTimeout(HTIMER);
  HTIMER = setTimeout(async () => {
    const cur = await fg(`rooms/${CODE}/gameState`);
    if (!cur || cur.revealed || cur.phase !== "question") return;
    await _cartonTimeout(room, cur, rQs);
  }, 20000);
}

// Timeout : personne n'a répondu
async function _cartonTimeout(room, gs, rQs) {
  if (_cartonBusy) return;
  _cartonBusy = true;
  const players = toArr(gs.players);
  const pool = gs.rQs ? gs.rQs[gs.roundIdx] : rQs[gs.roundIdx];
  const q = pool ? pool[gs.qIdx] : null;
  const balloons = toArr(gs.balloons).length ? [...toArr(gs.balloons)] : players.map(() => room.cartonBallons || 3);
  const roundElim = [...toArr(gs.roundElim)];
  const scores = [...toArr(gs.scores)];
  const recap = _cartonRecap(players, balloons);

  await fp(`rooms/${CODE}`, {
    "gameState/revealed": true,
    "gameState/result": { msg: `⏱️ Temps écoulé !\nBonne réponse : ${q ? q.a[q.c] : '?'}\n${recap}`, pts: 0, scorer: null }
  });

  // Vérifier fin de round
  const alive = players.filter(p => !roundElim.includes(p));
  if (alive.length <= 1) {
    await _cartonEndRound(room, gs, rQs, players, balloons, roundElim, scores);
    return;
  }
  setTimeout(() => _cartonNextQ(room, gs, rQs), 3500);
}

// Traitement de la 1ère réponse reçue
async function roundCarton_check(room, gs, rQs) {
  // Verrou anti-double
  if (_cartonBusy) return;
  _cartonBusy = true;

  if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }

  const players = toArr(gs.players);
  const N = players.length;
  const BASE = 50 * N;
  const scores = [...toArr(gs.scores)];
  const balloons = toArr(gs.balloons).length ? [...toArr(gs.balloons)] : players.map(() => room.cartonBallons || 3);
  const roundElim = [...toArr(gs.roundElim)];

  // Récupérer la question depuis le paramètre rQs ou depuis gs
  const qPool = rQs ? rQs[gs.roundIdx] : (gs.rQs ? gs.rQs[gs.roundIdx] : null);
  const q = qPool ? qPool[gs.qIdx] : null;
  if (!q) { _cartonBusy = false; return; }

  const ans = gs.answers || {};
  // Trouver la 1ère réponse (par temps)
  const sorted = Object.entries(ans)
    .filter(([name]) => !roundElim.includes(name))
    .sort((a, b) => a[1].time - b[1].time);

  if (sorted.length === 0) { _cartonBusy = false; return; }

  const [firstPlayer, firstAns] = sorted[0];
  const isCorrect = firstAns.ansIdx === q.c;
  const pi = players.indexOf(firstPlayer);

  if (isCorrect) {
    // BONNE RÉPONSE → points + choix de cible
    const ptsWin = Math.round(BASE * 0.4);
    scores[pi] += ptsWin;

    const targets = players.filter(p => p !== firstPlayer && !roundElim.includes(p));
    if (targets.length === 0) {
      // Personne à cibler → juste afficher et continuer
      const recap = _cartonRecap(players, balloons);
      await fp(`rooms/${CODE}`, {
        "gameState/revealed": true, "gameState/scores": scores,
        "gameState/balloons": balloons, "gameState/roundElim": roundElim,
        "gameState/result": { msg: `✅ ${firstPlayer} a bon ! +${ptsWin} pts 🎯\n${recap}`, pts: ptsWin, scorer: firstPlayer }
      });
      const alive = players.filter(p => !roundElim.includes(p));
      if (alive.length <= 1) {
        await _cartonEndRound(room, gs, rQs, players, balloons, roundElim, scores);
        return;
      }
      setTimeout(() => _cartonNextQ(room, { ...gs, balloons, roundElim, scores }, rQs), 3500);
    } else {
      // Cible disponible → écran pick
      await fp(`rooms/${CODE}`, {
        "gameState/buzzed": firstPlayer,
        "gameState/pickTarget": true, "gameState/scores": scores,
        "gameState/balloons": balloons, "gameState/roundElim": roundElim,
        "gameState/result": { msg: `✅ ${firstPlayer} a bon ! +${ptsWin} pts — Sur qui tirer ? 🎯`, pts: ptsWin, scorer: firstPlayer }
      });
      // _cartonBusy reste true jusqu'au pick
    }
  } else {
    // MAUVAISE RÉPONSE → perd 1 ballon
    if (balloons[pi] > 0) {
      balloons[pi]--;
      scores[pi] = Math.max(0, scores[pi] - Math.round(BASE * 0.3));
    }
    if (balloons[pi] <= 0 && !roundElim.includes(firstPlayer)) {
      roundElim.push(firstPlayer);
    }

    const lostMsg = balloons[pi] <= 0
      ? `❌ ${firstPlayer} perd son dernier ballon ! 💥 Éliminé !`
      : `❌ ${firstPlayer} perd un ballon ! 🎈 (${balloons[pi]} restant${balloons[pi] > 1 ? 's' : ''})`;
    const recap = _cartonRecap(players, balloons);

    await fp(`rooms/${CODE}`, {
      "gameState/revealed": true, "gameState/scores": scores,
      "gameState/balloons": balloons, "gameState/roundElim": roundElim,
      "gameState/result": { msg: `${lostMsg}\nBonne réponse : ${q.a[q.c]}\n${recap}`, pts: 0, scorer: null }
    });

    // Vérifier fin de round
    const alive = players.filter(p => !roundElim.includes(p));
    if (alive.length <= 1) {
      await _cartonEndRound(room, gs, rQs, players, balloons, roundElim, scores);
      return;
    }
    setTimeout(() => _cartonNextQ(room, { ...gs, balloons, roundElim, scores }, rQs), 3500);
  }
}

// Choix de cible après bonne réponse
async function roundCarton_pick(room, gs, rQs, targetName) {
  const players = toArr(gs.players);
  const N = players.length;
  const BASE = 50 * N;
  const tI = players.indexOf(targetName);
  const scores = [...toArr(gs.scores)];
  const balloons = toArr(gs.balloons).length ? [...toArr(gs.balloons)] : players.map(() => room.cartonBallons || 3);
  const roundElim = [...toArr(gs.roundElim)];

  balloons[tI] = Math.max(0, balloons[tI] - 1);
  scores[tI] = Math.max(0, scores[tI] - Math.round(BASE * 0.3));
  if (balloons[tI] <= 0 && !roundElim.includes(targetName)) roundElim.push(targetName);

  const shotMsg = balloons[tI] <= 0
    ? `🎯 ${gs.buzzed} crève le dernier ballon de ${targetName} ! 💥 Éliminé !`
    : `🎯 ${gs.buzzed} crève un ballon de ${targetName} ! 🎈 (reste ${balloons[tI]})`;
  const recap = _cartonRecap(players, balloons);

  await fp(`rooms/${CODE}`, {
    "gameState/revealed": true, "gameState/pickTarget": false, "gameState/scores": scores,
    "gameState/balloons": balloons, "gameState/roundElim": roundElim,
    "gameState/result": { msg: `${shotMsg}\n${recap}`, pts: Math.round(BASE * 0.4), scorer: gs.buzzed }
  });

  // Vérifier fin de round
  const alive = players.filter(p => !roundElim.includes(p));
  if (alive.length <= 1) {
    await _cartonEndRound(room, gs, rQs, players, balloons, roundElim, scores);
    return;
  }
  setTimeout(() => _cartonNextQ(room, { ...gs, balloons, roundElim, scores }, rQs), 3500);
}

// ── Helpers internes ──

function _cartonRecap(players, balloons) {
  return players.map((p, i) => `${p}: ${'🎈'.repeat(balloons[i] || 0)}${(balloons[i] || 0) === 0 ? ' 💀' : ''}`).join('  ');
}

async function _cartonNextQ(room, gs, rQs) {
  _cartonBusy = false;
  I_BUZZED = false;
  lastAnswerKey = "";
  const qIdx = (gs.qIdx || 0) + 1;
  await fp(`rooms/${CODE}`, { "gameState/qIdx": qIdx, "gameState/chronoRanking": null });
  const cur = await fg(`rooms/${CODE}/gameState`);
  hostStartQ(room, { ...cur, qIdx }, rQs);
}

async function _cartonEndRound(room, gs, rQs, players, balloons, roundElim, scores) {
  if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }
  _cartonBusy = true; // bloqué définitivement

  const N = players.length;
  const BASE = 50 * N;
  const alive = players.filter(p => !roundElim.includes(p));
  const surv = alive[0] || null;
  const survPts = Math.round(BASE * 1.25);
  if (surv) scores[players.indexOf(surv)] += survPts;

  const recap = _cartonRecap(players, balloons);
  await fp(`rooms/${CODE}`, {
    "gameState/revealed": true, "gameState/scores": scores,
    "gameState/balloons": balloons, "gameState/roundElim": roundElim,
    "gameState/result": {
      msg: surv ? `🏆 ${surv} est le dernier debout ! +${survPts} pts\n${recap}` : `Round terminé !\n${recap}`,
      pts: surv ? survPts : 0, scorer: surv
    }
  });

  // Transition directe : scoreboard → roundIntro → round suivant
  const nextRIdx = gs.roundIdx + 1;
  setTimeout(async () => {
    if (nextRIdx >= room.rounds.length) {
      await fp(`rooms/${CODE}`, { "gameState/phase": "final", "gameState/scores": scores });
      return;
    }
    await fp(`rooms/${CODE}`, {
      "gameState/phase": "scoreboard", "gameState/roundIdx": nextRIdx, "gameState/qIdx": 0,
      "gameState/roundElim": [], "gameState/chronoRanking": null, "gameState/balloons": null,
      "gameState/patateManche": 0, "gameState/patateExplosion": null
    });
    setTimeout(async () => {
      await fp(`rooms/${CODE}`, { "gameState/phase": "roundIntro", "gameState/ready": {} });
      const cur = await fg(`rooms/${CODE}/gameState`);
      hostWaitReady(room, { ...cur, roundIdx: nextRIdx, qIdx: 0, roundElim: [] }, rQs);
    }, 5000);
  }, 3500);
}
