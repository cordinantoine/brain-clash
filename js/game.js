/* ════════════════════════════════════════════
   game.js — BRAIN CLASH
   Orchestre les rounds en déléguant à rounds/*.js
   Contient uniquement la logique commune :
   hostLoadQ, hostStartQ, hostNextQ, Watch,
   actBuzz, actAnswer, actPick
   + Système Ready avant chaque round
   ════════════════════════════════════════════ */

let _readyTimeout = null;

// ════════════════════════════════════════════
//  PICKER (mode "last_picks") — sélection du joueur qui choisit
//  thème + difficulté avant chaque round.
// ════════════════════════════════════════════

// Pioche aléatoire — utilisé pour ex-aequo et 4 thèmes
function _shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Détermine le picker. rIdx=0 → tirage au sort. Sinon → score le plus bas (tirage si ex-aequo).
function _choosePicker(players, scores, rIdx) {
  if (!players || !players.length) return null;
  if (rIdx === 0 || !scores || !scores.length) {
    return players[Math.floor(Math.random() * players.length)];
  }
  let minScore = Infinity;
  players.forEach((_, i) => { if ((scores[i]||0) < minScore) minScore = scores[i]||0; });
  const candidates = players.filter((_, i) => (scores[i]||0) === minScore);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// Initialise le picker côté Firebase si mode=last_picks. No-op sinon.
// rIdx = index du round à venir (0 pour le 1er round).
async function hostBeginRound(rIdx) {
  const room = await fg(`rooms/${CODE}`);
  if (!room) return;
  if (room.mode !== "last_picks") {
    // Mode fixed : on s'assure qu'aucun reliquat picker ne traîne
    await fp(`rooms/${CODE}`, {
      pickerDone: true, picker: null, pickerThemes: null,
      pickerSelectedTheme: null, pickerSelectedDifficulty: null
    });
    return;
  }

  // Charge les thèmes Firebase (slug → name) pour résoudre les noms
  const themesIdx = await fg("questions/_themes");
  const themesArr = Array.isArray(themesIdx) ? themesIdx : (themesIdx ? toArr(themesIdx) : []);
  const slugToName = {};
  themesArr.forEach(t => { if (t && t.slug) slugToName[t.slug] = t.name; });

  // Joueurs + scores depuis le gameState courant (sinon room.players)
  const players = (room.gameState && room.gameState.players) || toArr(room.players).map(p=>p.name);
  const scores  = (room.gameState && room.gameState.scores)  || players.map(()=>0);
  const pickerName = _choosePicker(players, scores, rIdx);

  // 4 thèmes au hasard parmi availableThemes (ou moins si moins dispos)
  const avail = toArr(room.availableThemes || []);
  if (avail.length === 0) {
    // Sécurité : si plus rien, on autorise tout direct
    await fp(`rooms/${CODE}`, { pickerDone: true });
    return;
  }
  const sample = _shuffle(avail).slice(0, Math.min(4, avail.length));
  const pickerThemes = sample.map(slug => ({ slug, name: slugToName[slug] || slug }));

  await fp(`rooms/${CODE}`, {
    picker: { name: pickerName },
    pickerThemes,
    pickerSelectedTheme: null,
    pickerSelectedDifficulty: null,
    pickerDone: false,
    currentTheme: null,
    currentThemeName: null,
    currentDifficulty: null,
  });
}

// ── Actions du picker (joueur) ──
async function actPickerSelectTheme(slug) {
  const room = await fg(`rooms/${CODE}`);
  if (!room || room.pickerDone) return;
  if (!room.picker || room.picker.name !== ME) return;
  await fp(`rooms/${CODE}`, { pickerSelectedTheme: slug });
}
async function actPickerSelectDifficulty(diff) {
  const room = await fg(`rooms/${CODE}`);
  if (!room || room.pickerDone) return;
  if (!room.picker || room.picker.name !== ME) return;
  if (!room.pickerSelectedTheme) return;
  await fp(`rooms/${CODE}`, { pickerSelectedDifficulty: diff });
}
async function actPickerConfirm() {
  const room = await fg(`rooms/${CODE}`);
  if (!room || room.pickerDone) return;
  if (!room.picker || room.picker.name !== ME) return;
  const slug = room.pickerSelectedTheme;
  const diff = room.pickerSelectedDifficulty;
  if (!slug || !diff) return;
  const themeName = (toArr(room.pickerThemes).find(t => t.slug === slug) || {}).name || slug;
  const newAvail = toArr(room.availableThemes || []).filter(s => s !== slug);
  await fp(`rooms/${CODE}`, {
    currentTheme: slug,
    currentThemeName: themeName,
    currentDifficulty: diff,
    availableThemes: newAvail,
    theme: slug,                // pour les écrans visuels (setBG)
    pickerDone: true,
  });
}

// ════════════════════════════════════════════
//  CHARGEMENT DES QUESTIONS DEPUIS FIREBASE
// ════════════════════════════════════════════

const ALL_DIFFS = ["Facile", "Intermédiaire", "Expert"];

// Convertit { question, answers:{A,B,C,D}, correct:"B" } → { q, a:[A,B,C,D], c: idx }
function _normalizeFbQ(fbQ) {
  if (!fbQ) return null;
  const ans = fbQ.answers || {};
  const a = [ans.A, ans.B, ans.C, ans.D].map(x => x ?? "");
  const c = "ABCD".indexOf((fbQ.correct || "A").toString().toUpperCase());
  return { q: fbQ.question || "", a, c: c < 0 ? 0 : c };
}

// Cache d'un thème entier { slug → { Facile:[...], Intermédiaire:[...], Expert:[...] } }
const _FB_QS_CACHE = {};
async function _loadThemeBlob(slug) {
  if (_FB_QS_CACHE[slug]) return _FB_QS_CACHE[slug];
  const data = await fg(`questions/${slug}`);
  _FB_QS_CACHE[slug] = data || {};
  return _FB_QS_CACHE[slug];
}

// Charge `count` questions depuis Firebase pour les thèmes/difficultés donnés.
// themes : [slug, ...]    difficulties : ["Facile", ...]
async function loadQsForRound(themes, difficulties, count) {
  const slugs = (themes && themes.length) ? themes : [];
  const diffs = (difficulties && difficulties.length) ? difficulties : ALL_DIFFS;
  let pool = [];
  for (const slug of slugs) {
    const blob = await _loadThemeBlob(slug);
    for (const d of diffs) {
      const qs = toArr(blob[d] || []);
      qs.forEach(q => { const n = _normalizeFbQ(q); if (n && n.q && !USED_QS.has(n.q)) pool.push(n); });
    }
  }
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // Si pas assez : reset USED_QS pour ces thèmes/diffs et retry
  if (pool.length < count) {
    for (const slug of slugs) {
      const blob = await _loadThemeBlob(slug);
      for (const d of diffs) toArr(blob[d] || []).forEach(q => { const n = _normalizeFbQ(q); if (n) USED_QS.delete(n.q); });
    }
    pool = [];
    for (const slug of slugs) {
      const blob = await _loadThemeBlob(slug);
      for (const d of diffs) toArr(blob[d] || []).forEach(q => { const n = _normalizeFbQ(q); if (n && n.q) pool.push(n); });
    }
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }
  const out = pool.slice(0, count);
  out.forEach(q => USED_QS.add(q.q));
  return out;
}

// Combien de questions par type de round
function _countForRound(rid) {
  if (rid === "carton") return 50;
  if (rid === "patate") return 40;
  return 8;
}

// ── Verrou pour éviter double-fetch concurrents en mode last_picks ──
const _loadingRoundQs = new Set();

// En mode last_picks : charge les questions du round courant si pas encore fait.
// Appelée depuis Watch quand pickerDone=true et rQs[currentIdx] manquant.
async function hostMaybeLoadRoundQs(room, gs) {
  if (!HOST) return;
  if (room.mode !== "last_picks") return;
  if (!room.pickerDone || !room.currentTheme || !room.currentDifficulty) return;
  const rIdx = gs.roundIdx || 0;
  const rid = (room.rounds || [])[rIdx];
  if (!rid) return;
  const cur = (gs.rQs || {})[rIdx];
  if (cur && (Array.isArray(cur) ? cur.length : Object.keys(cur).length) > 0) return;
  if (_loadingRoundQs.has(rIdx)) return;
  _loadingRoundQs.add(rIdx);
  try {
    const qs = await loadQsForRound([room.currentTheme], [room.currentDifficulty], _countForRound(rid));
    await fp(`rooms/${CODE}`, { [`gameState/rQs/${rIdx}`]: qs });
  } finally {
    _loadingRoundQs.delete(rIdx);
  }
}

async function hostLoadQ() {
  USED_QS = new Set();
  // Reset cache de blobs Firebase pour cette nouvelle partie
  for (const k of Object.keys(_FB_QS_CACHE)) delete _FB_QS_CACHE[k];
  // Picker setup avant le 1er round (mode last_picks). No-op en mode fixed.
  await hostBeginRound(0);
  const room = await fg(`rooms/${CODE}`);
  if (!room) return;
  const themes = room.themes && room.themes.length ? room.themes : [room.theme || "culture"];

  const players = toArr(room.players).map(p => p.name);
  if (!players || players.length === 0) { alert("Aucun joueur n'a rejoint !"); return; }

  // ── Mode fixed : on précharge tous les rounds depuis Firebase (toutes diffs mélangées)
  // ── Mode last_picks : on n'initialise pas rQs ici ; chaque round se charge à la volée.
  const rQs = {};
  if (room.mode === "fixed") {
    for (let i = 0; i < room.rounds.length; i++) {
      const r = room.rounds[i];
      rQs[i] = await loadQsForRound(themes, ALL_DIFFS, _countForRound(r));
    }
  } else {
    room.rounds.forEach((_, i) => { rQs[i] = []; });
  }
  const balloons = players.map(() => room.cartonBallons || 3);
  const gs = {
    phase:"roundIntro", roundIdx:0, qIdx:0,
    rQs, players, scores:players.map(() => 0),
    lives:players.map(() => 3), balloons,
    cartonManche:0, patateHolder:null, patateManche:0,
    patateExplodeAt:null, patateExplosion:null,
    roundElim:[], buzzed:null, buzzedOut:[], answers:{},
    revealed:false, result:null, pickTarget:false,
    timerStart:Date.now() + 4000, timerDur:null, hostPick:null,
    _buzzerTimeRemaining:null, chronoRanking:null,
    ready:{}
  };
  await fs(`rooms/${CODE}/gameState`, gs);
  await fp(`rooms/${CODE}`, { phase:"playing", questionsReady:true });
  Watch({ ...room, phase:"playing", questionsReady:true, gameState:gs });
  // Wait for ready instead of fixed timeout
  hostWaitReady(room, gs, rQs);
}

// ── Wait for all players to be ready, then countdown + start ──
function hostWaitReady(room, gs, rQs) {
  if (_readyTimeout) { clearTimeout(_readyTimeout); _readyTimeout = null; }
  let started = false;

  // Vérifie que les questions du round courant sont prêtes (utile en mode last_picks)
  const _qsReady = (cur) => {
    const rIdx = cur.roundIdx || 0;
    const arr = (cur.rQs || {})[rIdx];
    if (!arr) return false;
    const len = Array.isArray(arr) ? arr.length : Object.keys(arr).length;
    return len > 0;
  };

  const checkReady = async () => {
    if (started) return;
    const r = await fg(`rooms/${CODE}`);
    const cur = r && r.gameState;
    if (!cur || cur.phase !== "roundIntro") return;
    // En mode last_picks, on attend picker confirmé ET questions chargées
    if (r.mode === "last_picks" && (!r.pickerDone || !_qsReady(cur))) return;
    const readyCount = Object.keys(cur.ready || {}).length;
    if (readyCount >= cur.players.length) {
      started = true;
      // All ready — launch countdown (rQs frais depuis Firebase)
      await hostCountdownAndStart(room, cur, cur.rQs);
    }
  };

  // Poll every 500ms for ready state
  const iv = setInterval(() => { if (started) { clearInterval(iv); return; } checkReady(); }, 500);

  // Safety timeout: 30 seconds — start anyway (uniquement si questions prêtes)
  _readyTimeout = setTimeout(async () => {
    if (started) return;
    const r = await fg(`rooms/${CODE}`);
    if (r && r.mode === "last_picks" && (!r.pickerDone || !_qsReady(r.gameState||{}))) return;
    started = true;
    clearInterval(iv);
    const cur = r && r.gameState;
    if (!cur || cur.phase !== "roundIntro") return;
    await hostCountdownAndStart(room, cur, cur.rQs);
  }, 30000);
}

async function hostCountdownAndStart(room, gs, rQs) {
  // Signal countdown phase
  await fp(`rooms/${CODE}`, { "gameState/countdownStart":Date.now() });
  // Wait 4 seconds for 3-2-1-GO animation
  setTimeout(() => {
    fp(`rooms/${CODE}`, { "gameState/countdownStart":null });
    hostStartQ(room, gs, rQs);
  }, 4000);
}

// ── Démarre une question — délègue au bon module round ──
async function hostStartQ(room, gs, rQs) {
  I_BUZZED = false; lastAnswerKey = "";
  const rType = room.rounds[gs.roundIdx];
  const tStart = Date.now();

  if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }

  // Rounds QCM-style
  if (rType === "qcm")    { await roundQCM_start(room, gs, rQs); return; }
  if (rType === "chrono") { await roundChrono_start(room, gs, rQs); return; }
  if (rType === "steal")  { await roundSteal_start(room, gs, rQs); return; }
  if (rType === "carton") {
    await roundCarton_start(room, gs, rQs); return;
  }

  // Patate Chaude — hidden timer, holder only
  if (rType === "patate") {
    await roundPatate_start(room, gs, rQs);
    return;
  }

  // Buzzer — 30s question, 3s answer, pause on buzz
  if (rType === "buzzer") {
    await fp(`rooms/${CODE}`, {
      "gameState/qIdx":gs.qIdx, "gameState/roundElim":gs.roundElim||[],
      "gameState/phase":"question", "gameState/buzzed":null, "gameState/buzzedOut":[],
      "gameState/answers":{}, "gameState/revealed":false, "gameState/result":null,
      "gameState/pickTarget":false, "gameState/hostPick":null,
      "gameState/timerStart":tStart, "gameState/timerDur":30,
      "gameState/_buzzerTimeRemaining":30, "gameState/chronoRanking":null
    });
    HTIMER = setTimeout(async () => {
      const cur = await fg(`rooms/${CODE}/gameState`);
      if (!cur || cur.revealed || cur.phase !== "question") return;
      await fp(`rooms/${CODE}`, { "gameState/phase":"questionResult", "gameState/revealed":true, "gameState/result":{ msg:"⏱️ Temps écoulé !", pts:0, scorer:null } });
      setTimeout(() => hostNextQ(room, cur, rQs), 4500);
    }, 30000);
    return;
  }
}

// ── Passe à la question suivante ──
async function hostNextQ(room, gs, rQs) {
  I_BUZZED = false; lastAnswerKey = "";
  const rType = room.rounds[gs.roundIdx];
  let qIdx = gs.qIdx, rIdx = gs.roundIdx, rE = gs.roundElim || [];

  qIdx++;
  if (qIdx >= (rQs[rIdx]||[]).length) {
    rIdx++; qIdx=0; rE=[];
    if (rIdx >= room.rounds.length) { await fp(`rooms/${CODE}`,{"gameState/phase":"final","gameState/scores":gs.scores}); return; }
    await fp(`rooms/${CODE}`,{"gameState/phase":"scoreboard","gameState/roundIdx":rIdx,"gameState/qIdx":0,"gameState/roundElim":[],"gameState/chronoRanking":null,"gameState/patateManche":0,"gameState/patateExplosion":null});
    setTimeout(async()=>{
      // Picker setup pour le round à venir (no-op en mode fixed)
      await hostBeginRound(rIdx);
      await fp(`rooms/${CODE}`,{"gameState/phase":"roundIntro","gameState/ready":{}});
      const cur=await fg(`rooms/${CODE}/gameState`);
      // Wait for ready
      hostWaitReady(room,{...cur,roundIdx:rIdx,qIdx:0,roundElim:[]},rQs);
    },5000);
    return;
  }
  // qIdx + roundElim sont poussés atomiquement par chaque round_start
  // (sinon Watch re-render drawQuestionResult avec le nouveau qIdx mais
  // l'ancien result, ce qui flashe la bonne réponse de la question suivante).
  hostStartQ(room, { ...gs, qIdx, roundElim:rE }, rQs);
}

// ── Traitement réponse — délègue au bon module ──
async function hostProcessAnswer(room, gs, rQs, isOk) {
  const rType = room.rounds[gs.roundIdx];
  if (rType === "buzzer") {
    if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }
    await roundBuzzer_process(room, gs, rQs, isOk);
  }
  else if (rType === "qcm")    { await roundQCM_end(room, gs, rQs); }
  else if (rType === "chrono") { await roundChrono_end(room, gs, rQs); }
  else if (rType === "patate") {
    // DON'T clear HTIMER for patate — explosion timer must keep ticking
    await roundPatate_process(room, gs, rQs, isOk);
  }
  // steal and carton are handled via their _check functions
}

async function hostPickTarget(room, gs, rQs, targetName) {
  const rType = room.rounds[gs.roundIdx];
  if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }
  if (rType === "steal")  { await roundSteal_pick(room, gs, rQs, targetName); }
  else if (rType === "carton") { await roundCarton_pick(room, gs, rQs, targetName); }
}

// ════════════════════════════════════════════
//  ACTIONS JOUEURS
// ════════════════════════════════════════════
async function actBuzz() {
  const gs = await fg(`rooms/${CODE}/gameState`);
  if (!gs||gs.phase!=="question"||gs.revealed||gs.buzzed) return;
  if ((gs.buzzedOut||[]).includes(ME)||(gs.roundElim||[]).includes(ME)) return;
  if (I_BUZZED) return;
  I_BUZZED = true;
  drawQ_optimistic(gs);

  const timeRemaining = Math.max(1, Math.round(gs.timerDur - (Date.now() - gs.timerStart) / 1000));
  await fp(`rooms/${CODE}`, { "gameState/buzzed": ME, "gameState/_buzzerTimeRemaining": timeRemaining });

  if (HOST) {
    if(HTIMER){clearTimeout(HTIMER);HTIMER=null;}
    const room2=await fg(`rooms/${CODE}`);
    HTIMER=setTimeout(async()=>{
      const c3=await fg(`rooms/${CODE}/gameState`);
      if(!c3||c3.revealed||(c3.answers||{})[ME]!==undefined)return;
      await hostProcessAnswer(room2,c3,c3.rQs,false);
    },3000);
  }
}

async function actAnswer(ansIdx) {
  const gs = await fg(`rooms/${CODE}/gameState`);
  if (!gs||gs.phase!=="question"||gs.revealed) return;
  const room = await fg(`rooms/${CODE}`); if (!room) return;
  const rType = room.rounds[gs.roundIdx];
  const q = gs.rQs[gs.roundIdx][gs.qIdx];

  // QCM-style rounds: chrono, qcm, steal, carton
  if (["chrono","qcm","steal","carton"].includes(rType)) {
    if ((gs.answers||{})[ME]!==undefined) return;
    await fp(`rooms/${CODE}`, { [`gameState/answers/${ME}`]:{ ansIdx, time:Date.now() } });
    if (HOST) {
      const upd=await fg(`rooms/${CODE}/gameState`);
      const alive=toArr(gs.players).filter(p=>!toArr(gs.roundElim).includes(p));
      const allAnswered=Object.keys(upd.answers||{}).length>=alive.length;

      if (rType==="steal") {
        const isOk = ansIdx === q.c;
        if (isOk) {
          await roundSteal_check(room, upd, gs.rQs);
        } else if (allAnswered) {
          await roundSteal_end(room, upd, gs.rQs);
        }
      } else if (rType==="carton") {
        try { await roundCarton_check(room, upd, gs.rQs); } catch(e) { /* ignore */ }
      } else if (allAnswered) {
        if(HTIMER){clearTimeout(HTIMER);HTIMER=null;}
        if(rType==="chrono") await roundChrono_end(room,upd,gs.rQs);
        else if(rType==="qcm") await roundQCM_end(room,upd,gs.rQs);
      }
    }
    return;
  }

  // Patate — only the bomb holder answers
  if (rType==="patate") {
    if(gs.patateHolder!==ME)return;
    if((gs.answers||{})[ME]!==undefined)return;
    const isOk=ansIdx===q.c;
    await fp(`rooms/${CODE}`,{[`gameState/answers/${ME}`]:{ansIdx,time:Date.now()},"gameState/buzzed":ME});
    if(HOST) await roundPatate_process(room,gs,gs.rQs,isOk);
    return;
  }

  // Buzzer — only the buzzer answers
  const iAmBuzzer = gs.buzzed===ME||(I_BUZZED&&!gs.buzzed);
  if (!iAmBuzzer||(gs.answers||{})[ME]!==undefined) return;
  I_BUZZED = false; const isOk = ansIdx===q.c;
  await fp(`rooms/${CODE}`, { [`gameState/answers/${ME}`]:{ ansIdx, time:Date.now() } });
  if (HOST) await hostProcessAnswer(room, gs, gs.rQs, isOk);
  else await fp(`rooms/${CODE}`, { "gameState/buzzed": ME });
}

async function actPick(targetName) {
  const gs = await fg(`rooms/${CODE}/gameState`); if (!gs||!gs.pickTarget) return;
  if (gs.buzzed!==ME&&!I_BUZZED) return;
  const room = await fg(`rooms/${CODE}`); if (!room) return;
  if (HOST) await hostPickTarget(room, gs, gs.rQs, targetName);
  else await fp(`rooms/${CODE}`, { "gameState/hostPick": targetName });
}

// ════════════════════════════════════════════
//  WATCH
// ════════════════════════════════════════════
function Watch(initialRoom) {
  setBG(initialRoom.theme || "culture");
  drawLoading(initialRoom);
  if (STOP) STOP();
  let lastPhase = null;
  STOP = fl(`rooms/${CODE}`, async room => {
    if (!room||!room.gameState||!room.questionsReady) return;
    setBG(room.theme || "culture");
    const gs = room.gameState;
    // Mode last_picks : l'hôte charge les questions du round dès que le picker confirme
    if (HOST && room.mode==="last_picks" && room.pickerDone && gs.phase==="roundIntro") {
      hostMaybeLoadRoundQs(room, gs);
    }
    if (HOST && gs.phase==="question" && !gs.revealed) {
      const rType = room.rounds[gs.roundIdx];
      if (gs.hostPick&&gs.pickTarget&&gs.buzzed) { const pick=gs.hostPick; fp(`rooms/${CODE}`,{"gameState/hostPick":null}); hostPickTarget(room,gs,gs.rQs,pick); return; }
      if (!gs.pickTarget) {
        // Buzzer round: handle remote buzzes with 3s timer + pause
        if (gs.buzzed && rType==="buzzer") {
          if(HTIMER){clearTimeout(HTIMER);HTIMER=null;}
          HTIMER=setTimeout(async()=>{
            const c3=await fg(`rooms/${CODE}/gameState`);
            if(!c3||c3.revealed||(c3.answers||{})[gs.buzzed]!==undefined)return;
            const room3=await fg(`rooms/${CODE}`);if(!room3)return;
            await hostProcessAnswer(room3,c3,c3.rQs,false);
          },3000);
        }
        const answerKey = JSON.stringify(gs.answers||{});
        if (answerKey!==lastAnswerKey) {
          lastAnswerKey = answerKey; const answers = gs.answers||{};

          // Buzzer: handle remote player answer
          if (gs.buzzed&&gs.buzzed!==ME&&answers[gs.buzzed]!==undefined&&rType==="buzzer") {
            const q=gs.rQs[gs.roundIdx][gs.qIdx]; const isOk=answers[gs.buzzed].ansIdx===q.c;
            if(HTIMER){clearTimeout(HTIMER);HTIMER=null;}
            hostProcessAnswer(room,gs,gs.rQs,isOk); return;
          }

          // Patate: handle remote bomb holder answer (DON'T clear HTIMER)
          if (rType==="patate"&&gs.patateHolder&&gs.patateHolder!==ME&&answers[gs.patateHolder]!==undefined) {
            const q=gs.rQs[gs.roundIdx][gs.qIdx]; const isOk=answers[gs.patateHolder].ansIdx===q.c;
            roundPatate_process(room,{...gs,buzzed:gs.patateHolder},gs.rQs,isOk); return;
          }

          // QCM-style rounds: chrono, qcm
          if (["chrono","qcm"].includes(rType)) {
            const alive=toArr(gs.players).filter(p=>!toArr(gs.roundElim).includes(p));
            if(Object.keys(answers).length>=alive.length){
              if(HTIMER){clearTimeout(HTIMER);HTIMER=null;}
              if(rType==="chrono") roundChrono_end(room,gs,gs.rQs);
              else if(rType==="qcm") roundQCM_end(room,gs,gs.rQs);
              return;
            }
          }

          // Steal QCM-style
          if (rType==="steal") {
            const q=gs.rQs[gs.roundIdx][gs.qIdx];
            const hasCorrect = Object.entries(answers).some(([, {ansIdx}]) => ansIdx===q.c);
            const alive=toArr(gs.players).filter(p=>!toArr(gs.roundElim).includes(p));
            const allAnswered=Object.keys(answers).length>=alive.length;
            if (hasCorrect && !gs.pickTarget) {
              roundSteal_check(room,gs,gs.rQs); return;
            } else if (allAnswered && !hasCorrect) {
              roundSteal_end(room,gs,gs.rQs); return;
            }
          }

          // Carton : dès qu'une réponse arrive, traiter immédiatement
          if (rType==="carton" && Object.keys(answers).length > 0 && !gs.pickTarget && !gs.revealed) {
            try { await roundCarton_check(room, gs, gs.rQs); } catch(e) { /* ignore */ }
            return;
          }
        }
      }
    }
    const key = gs.phase+"-"+gs.roundIdx+"-"+gs.qIdx+"-"+(gs.buzzed||"")+"-"+gs.revealed+"-"+gs.pickTarget+"-"+(gs.countdownStart||"")+"-"+JSON.stringify(gs.result)+"-"+JSON.stringify(gs.ready||{})+"-"+(gs.patateHolder||"")+"-"+(gs.chronoRanking?'r':'')+"-"+(room.picker?.name||"")+"-"+(room.pickerSelectedTheme||"")+"-"+(room.pickerSelectedDifficulty||"")+"-"+(room.pickerDone?"1":"0");
    if (key===lastPhase) return;
    if (gs.buzzed&&gs.buzzed!==ME) I_BUZZED=false;
    if (gs.revealed) I_BUZZED=false;
    lastPhase=key;
    if      (gs.phase==="roundIntro")       drawIntro(room,gs);
    else if (gs.phase==="question")         drawQ_host(room,gs);
    else if (gs.phase==="questionResult")   drawQuestionResult(room,gs);
    else if (gs.phase==="patateExplosion")  drawQuestionResult(room,gs);
    else if (gs.phase==="scoreboard")       drawScore(room,gs,false);
    else if (gs.phase==="final")            drawScore(room,gs,true);
  });
}
