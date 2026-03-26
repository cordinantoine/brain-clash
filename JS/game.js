/* ════════════════════════════════════════════
   game.js — BRAIN CLASH
   Orchestre les rounds en déléguant à rounds/*.js
   Contient uniquement la logique commune :
   hostLoadQ, hostStartQ, hostNextQ, Watch,
   actBuzz, actAnswer, actPick
   ════════════════════════════════════════════ */

async function hostLoadQ() {
  USED_QS = new Set();
  const room = await fg(`rooms/${CODE}`);
  if (!room) return;
  const themes = room.themes && room.themes.length ? room.themes : [room.theme || "culture"];

  const players = toArr(room.players).map(p => p.name);
  if (!players || players.length === 0) { alert("Aucun joueur n'a rejoint !"); return; }

  const rQs = {};
  room.rounds.forEach((r, i) => { rQs[i] = getStaticQs(themes, 8); });
  const balloons = players.map(() => room.balloonsPerPlayer || 3);
  const gs = {
    phase:"roundIntro", roundIdx:0, qIdx:0,
    rQs, players, scores:players.map(() => 0),
    lives:players.map(() => 3), balloons,
    cartonManche:0, patateHolder:null, orageStart:null, patateExplodeAt:null,
    roundElim:[], buzzed:null, buzzedOut:[], answers:{},
    revealed:false, result:null, pickTarget:false,
    timerStart:Date.now() + 4000, timerDur:null, hostPick:null,
    _buzzerTimeRemaining:null, chronoRanking:null
  };
  await fs(`rooms/${CODE}/gameState`, gs);
  await fp(`rooms/${CODE}`, { phase:"playing", questionsReady:true });
  Watch({ ...room, phase:"playing", questionsReady:true, gameState:gs });
  setTimeout(() => hostStartQ(room, gs, rQs), 4000);
}

// ── Démarre une question — délègue au bon module round ──
async function hostStartQ(room, gs, rQs) {
  I_BUZZED = false; lastAnswerKey = "";
  const rType = room.rounds[gs.roundIdx];
  const tDur  = rType === "chrono" ? 20 : 30;
  const tStart = Date.now();

  if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }

  // Rounds QCM-style (tout le monde répond en même temps)
  if (rType === "qcm")    { await roundQCM_start(room, gs, rQs); return; }
  if (rType === "orage")  { await roundOrage_start(room, gs, rQs); return; }
  if (rType === "chrono") { await roundChrono_start(room, gs, rQs); return; }
  if (rType === "steal")  { await roundSteal_start(room, gs, rQs); return; }
  if (rType === "carton") { await roundCarton_start(room, gs, rQs); return; }

  // Patate Chaude — new bomb mechanic
  if (rType === "patate") {
    await roundPatate_start(room, gs, rQs);
    return;
  }

  // Buzzer — needs special timer: 30s question, 3s answer, pause on buzz
  if (rType === "buzzer") {
    await fp(`rooms/${CODE}`, {
      "gameState/phase":"question", "gameState/buzzed":null, "gameState/buzzedOut":[],
      "gameState/answers":{}, "gameState/revealed":false, "gameState/result":null,
      "gameState/pickTarget":false, "gameState/hostPick":null,
      "gameState/timerStart":tStart, "gameState/timerDur":30,
      "gameState/_buzzerTimeRemaining":30, "gameState/chronoRanking":null
    });
    HTIMER = setTimeout(async () => {
      const cur = await fg(`rooms/${CODE}/gameState`);
      if (!cur || cur.revealed || cur.phase !== "question") return;
      await fp(`rooms/${CODE}`, { "gameState/revealed":true, "gameState/result":{ msg:"⏱️ Temps écoulé !", pts:0, scorer:null } });
      setTimeout(() => hostNextQ(room, cur, rQs), 3000);
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
    await fp(`rooms/${CODE}`,{"gameState/phase":"scoreboard","gameState/roundIdx":rIdx,"gameState/qIdx":0,"gameState/roundElim":[],"gameState/chronoRanking":null});
    setTimeout(async()=>{ await fp(`rooms/${CODE}`,{"gameState/phase":"roundIntro"}); setTimeout(async()=>{ const cur=await fg(`rooms/${CODE}/gameState`); hostStartQ(room,{...cur,roundIdx:rIdx,qIdx:0,roundElim:[]},rQs); },4000); },5000);
    return;
  }
  await fp(`rooms/${CODE}`,{"gameState/qIdx":qIdx,"gameState/roundElim":rE,"gameState/chronoRanking":null});
  const cur = await fg(`rooms/${CODE}/gameState`);
  hostStartQ(room, { ...cur, qIdx, roundElim:rE }, rQs);
}

// ── Traitement réponse — délègue au bon module ──
async function hostProcessAnswer(room, gs, rQs, isOk) {
  const rType = room.rounds[gs.roundIdx];
  if (rType === "buzzer") {
    if (HTIMER) { clearTimeout(HTIMER); HTIMER = null; }
    await roundBuzzer_process(room, gs, rQs, isOk);
  }
  else if (rType === "qcm")    { await roundQCM_end(room, gs, rQs); }
  else if (rType === "orage")  { await roundOrage_end(room, gs, rQs); }
  else if (rType === "chrono") { await roundChrono_end(room, gs, rQs); }
  else if (rType === "patate") { await roundPatate_process(room, gs, rQs, isOk); }
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

  // Calculate remaining question time before buzzing (for pause/resume)
  const timeRemaining = Math.max(1, Math.round(gs.timerDur - (Date.now() - gs.timerStart) / 1000));
  await fp(`rooms/${CODE}`, { "gameState/buzzed": ME, "gameState/_buzzerTimeRemaining": timeRemaining });

  if (HOST) {
    if(HTIMER){clearTimeout(HTIMER);HTIMER=null;}
    const room2=await fg(`rooms/${CODE}`);
    // 3 second answer timer for buzzer round
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

  // QCM-style rounds: chrono, qcm, orage, steal, carton
  if (["chrono","qcm","orage","steal","carton"].includes(rType)) {
    if ((gs.answers||{})[ME]!==undefined) return;
    await fp(`rooms/${CODE}`, { [`gameState/answers/${ME}`]:{ ansIdx, time:Date.now() } });
    if (HOST) {
      const upd=await fg(`rooms/${CODE}/gameState`);
      const alive=gs.players.filter(p=>!(gs.roundElim||[]).includes(p));
      const allAnswered=Object.keys(upd.answers||{}).length>=alive.length;

      if (rType==="steal") {
        // Check if first correct answer found
        const isOk = ansIdx === q.c;
        if (isOk) {
          await roundSteal_check(room, upd, gs.rQs);
        } else if (allAnswered) {
          await roundSteal_end(room, upd, gs.rQs);
        }
      } else if (rType==="carton") {
        // Check if first correct or all answered
        const isOk = ansIdx === q.c;
        if (isOk || allAnswered) {
          await roundCarton_check(room, upd, gs.rQs);
        }
      } else if (allAnswered) {
        if(HTIMER){clearTimeout(HTIMER);HTIMER=null;}
        if(rType==="chrono") await roundChrono_end(room,upd,gs.rQs);
        else if(rType==="qcm") await roundQCM_end(room,upd,gs.rQs);
        else if(rType==="orage") await roundOrage_end(room,upd,gs.rQs);
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
  STOP = fl(`rooms/${CODE}`, room => {
    if (!room||!room.gameState||!room.questionsReady) return;
    setBG(room.theme || "culture");
    const gs = room.gameState;
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

          // Patate: handle remote bomb holder answer
          if (rType==="patate"&&gs.patateHolder&&gs.patateHolder!==ME&&answers[gs.patateHolder]!==undefined) {
            const q=gs.rQs[gs.roundIdx][gs.qIdx]; const isOk=answers[gs.patateHolder].ansIdx===q.c;
            roundPatate_process(room,{...gs,buzzed:gs.patateHolder},gs.rQs,isOk); return;
          }

          // QCM-style rounds: chrono, qcm, orage
          if (["chrono","qcm","orage"].includes(rType)) {
            const alive=gs.players.filter(p=>!(gs.roundElim||[]).includes(p));
            if(Object.keys(answers).length>=alive.length){
              if(HTIMER){clearTimeout(HTIMER);HTIMER=null;}
              if(rType==="chrono") roundChrono_end(room,gs,gs.rQs);
              else if(rType==="qcm") roundQCM_end(room,gs,gs.rQs);
              else if(rType==="orage") roundOrage_end(room,gs,gs.rQs);
              return;
            }
          }

          // Steal QCM-style: check each new answer
          if (rType==="steal") {
            const q=gs.rQs[gs.roundIdx][gs.qIdx];
            const hasCorrect = Object.entries(answers).some(([, {ansIdx}]) => ansIdx===q.c);
            const alive=gs.players.filter(p=>!(gs.roundElim||[]).includes(p));
            const allAnswered=Object.keys(answers).length>=alive.length;
            if (hasCorrect && !gs.pickTarget) {
              roundSteal_check(room,gs,gs.rQs); return;
            } else if (allAnswered && !hasCorrect) {
              roundSteal_end(room,gs,gs.rQs); return;
            }
          }

          // Carton QCM-style: check each new answer
          if (rType==="carton") {
            const q=gs.rQs[gs.roundIdx][gs.qIdx];
            const hasCorrect = Object.entries(answers).some(([name, {ansIdx}]) => ansIdx===q.c && !(gs.roundElim||[]).includes(name));
            const alive=gs.players.filter(p=>!(gs.roundElim||[]).includes(p));
            const allAnswered=Object.keys(answers).length>=alive.length;
            if ((hasCorrect || allAnswered) && !gs.pickTarget) {
              roundCarton_check(room,gs,gs.rQs); return;
            }
          }
        }
      }
    }
    const key = gs.phase+"-"+gs.roundIdx+"-"+gs.qIdx+"-"+(gs.buzzed||"")+"-"+gs.revealed+"-"+gs.pickTarget+"-"+JSON.stringify(gs.result);
    if (key===lastPhase) return;
    if (gs.buzzed&&gs.buzzed!==ME) I_BUZZED=false;
    if (gs.revealed) I_BUZZED=false;
    lastPhase=key;
    if      (gs.phase==="roundIntro") drawIntro(room,gs);
    else if (gs.phase==="question")   drawQ_host(room,gs);
    else if (gs.phase==="scoreboard") drawScore(room,gs,false);
    else if (gs.phase==="final")      drawScore(room,gs,true);
  });
}
