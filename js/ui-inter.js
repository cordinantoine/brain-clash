/* ════════════════════════════════════════════
   ui-inter.js — BRAIN CLASH
   Écran intermédiaire "questionResult"
   Affiché 4.5s entre chaque question et la suivante.
   6 variantes : une par type de round.
   ════════════════════════════════════════════ */

function drawQuestionResult(room, gs) {
  // Annuler le RAF timer
  if (_timerRafId) { cancelAnimationFrame(_timerRafId); _timerRafId = null; }

  // Sons
  if (gs.result) {
    const good = gs.result.scorer && (gs.result.pts || 0) >= 0;
    good ? SFX.correct() : SFX.wrong();
  }

  const rType = room.rounds[gs.roundIdx];
  const variants = { qcm:interQCM, buzzer:interBuzzer, chrono:interChrono, steal:interSteal, patate:interPatate, patateExplosion:interPatate, carton:interCarton };
  const fn = variants[rType];
  if (fn) fn(room, gs); else drawScore(room, gs, false);
}

// ── Scores panel HTML ──
function _interScores(room, gs) {
  const _rp = toArr(room.players);
  return gs.players.map((p, i) => {
    const rp = _rp.find(x => x.name === p);
    const avIdx = (rp && rp.avatar !== undefined) ? rp.avatar : (i % AVATARS.length);
    const av = AVATARS[avIdx] || AVATARS[0];
    return `<div style="display:flex;align-items:center;gap:10px;padding:6px 12px;border-radius:12px;background:${av.bg}22;border:2px solid ${av.bg}88;box-shadow:0 0 12px ${av.bg}44">
      <img src="${AVATAR_PATH}${av.file}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;object-position:center top;flex-shrink:0;border:2px solid ${av.bg};box-shadow:0 0 8px ${av.bg}66" alt="">
      <span style="font-size:.82rem;font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p}</span>
      <span style="font-size:1rem;font-weight:900;color:${av.bg};text-shadow:0 0 8px ${av.bg}88">${gs.scores[i] || 0}</span>
    </div>`;
  }).join("");
}

// ── Layout 2 colonnes (scores gauche + contenu droite) ──
function _interLayout(room, gs, contentHtml) {
  const t = THEMES[room.theme] || THEMES.culture;
  R(`<div style="position:fixed;inset:0;display:flex;overflow:hidden;pointer-events:none">

    <!-- Scores (gauche) -->
    <div style="width:252px;flex-shrink:0;padding:16px 12px;z-index:3;pointer-events:all">
      <div style="background:rgba(0,0,0,.55);backdrop-filter:blur(16px);border-radius:16px;border:1px solid rgba(255,255,255,.18);padding:12px 14px;display:flex;flex-direction:column;gap:7px">
        <div style="font-size:.55rem;font-weight:800;color:rgba(255,255,255,.45);letter-spacing:.15em">SCORES</div>
        ${_interScores(room, gs)}
      </div>
    </div>

    <!-- Résultat (droite) -->
    <div style="flex:1;position:relative;overflow:hidden;min-width:0;pointer-events:all">
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,${t.accent},#fff,${t.accent},#fff,${t.accent});background-size:200% 100%;animation:ledSweep 2.5s linear infinite;box-shadow:0 0 12px 2px ${t.accent},0 0 24px 4px ${t.accent}88;z-index:2"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,${t.accent},#fff,${t.accent},#fff,${t.accent});background-size:200% 100%;animation:ledSweep 2.5s linear infinite reverse;box-shadow:0 0 12px 2px ${t.accent},0 0 24px 4px ${t.accent}88;z-index:2"></div>
      <div style="position:absolute;top:4px;left:0;bottom:4px;width:4px;background:linear-gradient(180deg,${t.accent},#fff,${t.accent});background-size:100% 200%;animation:ledSweep 3s linear infinite;box-shadow:0 0 12px 2px ${t.accent};z-index:2"></div>
      <div style="width:100%;height:100%;background:linear-gradient(160deg,rgba(20,20,60,.6) 0%,rgba(10,10,40,.7) 100%);backdrop-filter:blur(16px);border-left:3px solid ${t.accent}cc;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 36px;gap:18px;box-sizing:border-box;overflow:hidden">
        ${contentHtml}
      </div>
    </div>
  </div>`);
}

// ── QCM : style Buzzer adapté multi-gagnants ──
function interQCM(room, gs) {
  const q = (gs.rQs||{})[gs.roundIdx]?.[gs.qIdx];
  if (!q) { drawScore(room, gs, false); return; }

  const ans = gs.answers || {};
  const _rp = toArr(room.players);
  const correct = gs.players.filter(p => ans[p] !== undefined && ans[p].ansIdx === q.c);
  const pts = gs.result?.pts ?? Math.round(50 * gs.players.length * 0.5);

  let content;

  if (correct.length === 0) {
    content = `
      <div style="font-size:5rem;animation:floatY 2s ease-in-out infinite">❌</div>
      <div style="font-size:2rem;font-weight:800;color:#fca5a5;text-align:center;animation:sUp .35s ease both">Personne n'a trouvé !</div>
      ${q ? `<div style="padding:10px 18px;border-radius:12px;background:rgba(255,255,255,.07);font-size:.88rem;text-align:center">Bonne réponse : <strong style="color:#86efac">${q.a[q.c]}</strong>${q.f ? ` — 💡 ${q.f}` : ''}</div>` : ''}
    `;
  } else if (correct.length === 1) {
    const p = correct[0];
    const idx = gs.players.indexOf(p);
    const rp = _rp.find(x => x.name === p);
    const av = AVATARS[(rp&&rp.avatar!==undefined)?rp.avatar:(idx%AVATARS.length)]||AVATARS[0];
    content = `
      <div style="animation:popIn .5s cubic-bezier(.36,.07,.19,.97) both">
        <img src="${AVATAR_PATH}${av.file}" style="width:160px;height:160px;border-radius:50%;object-fit:cover;object-position:center top;border:5px solid ${av.bg};box-shadow:0 0 40px ${av.bg}99,0 0 80px ${av.bg}44" alt="">
      </div>
      <div style="text-align:center;animation:sUp .35s ease both">
        <div style="font-size:2rem;font-weight:900;color:white">${p}</div>
        <div style="font-size:3rem;font-weight:900;color:#4ade80;text-shadow:0 0 20px #22c55e">+${pts} pts</div>
      </div>
      ${q ? `<div style="padding:10px 18px;border-radius:12px;background:rgba(255,255,255,.07);font-size:.82rem;color:rgba(255,255,255,.65);text-align:center">Bonne réponse : <strong style="color:#86efac">${q.a[q.c]}</strong>${q.f ? ` — 💡 ${q.f}` : ''}</div>` : ''}
    `;
  } else {
    const size = correct.length <= 3 ? 110 : 72;
    const avatarsHtml = correct.map((p, i) => {
      const idx = gs.players.indexOf(p);
      const rp = _rp.find(x => x.name === p);
      const av = AVATARS[(rp&&rp.avatar!==undefined)?rp.avatar:(idx%AVATARS.length)]||AVATARS[0];
      return `<div style="text-align:center;animation:popIn .5s cubic-bezier(.36,.07,.19,.97) ${i*.08}s both">
        <img src="${AVATAR_PATH}${av.file}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;object-position:center top;border:4px solid ${av.bg};box-shadow:0 0 28px ${av.bg}88" alt="">
        <div style="font-size:${correct.length<=3?'.9rem':'.75rem'};font-weight:700;margin-top:6px;max-width:${size+10}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p}</div>
        ${correct.length<=3?`<div style="font-size:1.2rem;font-weight:900;color:#4ade80">+${pts}</div>`:''}
      </div>`;
    }).join('');
    content = `
      ${correct.length >= 4 ? `<div style="font-size:1.8rem;font-weight:900;color:#4ade80;text-shadow:0 0 20px #22c55e;text-align:center;animation:sUp .3s ease both">+${pts} pts chacun !</div>` : ''}
      <div style="display:flex;gap:${correct.length<=3?24:12}px;justify-content:center;flex-wrap:wrap;align-items:flex-end">${avatarsHtml}</div>
      ${q ? `<div style="padding:10px 18px;border-radius:12px;background:rgba(255,255,255,.07);font-size:.82rem;color:rgba(255,255,255,.65);text-align:center">Bonne réponse : <strong style="color:#86efac">${q.a[q.c]}</strong>${q.f ? ` — 💡 ${q.f}` : ''}</div>` : ''}
    `;
  }

  _interLayout(room, gs, content);
}

// ── Buzzer : avatar vainqueur ou timeout ──
function interBuzzer(room, gs) {
  const q = (gs.rQs||{})[gs.roundIdx]?.[gs.qIdx];
  const _rp = toArr(room.players);
  const scorer = gs.result?.scorer;
  let content;
  if (scorer) {
    const idx = gs.players.indexOf(scorer);
    const rp = _rp.find(x => x.name === scorer);
    const avIdx = (rp && rp.avatar !== undefined) ? rp.avatar : (idx % AVATARS.length);
    const av = AVATARS[avIdx] || AVATARS[0];
    const pts = gs.result?.pts || 0;
    content = `
      <div style="animation:popIn .5s cubic-bezier(.36,.07,.19,.97) both">
        <img src="${AVATAR_PATH}${av.file}" style="width:160px;height:160px;border-radius:50%;object-fit:cover;object-position:center top;border:5px solid ${av.bg};box-shadow:0 0 40px ${av.bg}99,0 0 80px ${av.bg}44" alt="">
      </div>
      <div style="text-align:center;animation:sUp .35s ease both">
        <div style="font-size:2rem;font-weight:900;color:white">${scorer}</div>
        <div style="font-size:3rem;font-weight:900;color:#4ade80;text-shadow:0 0 20px #22c55e">+${pts} pts</div>
      </div>
      ${q?`<div style="padding:10px 18px;border-radius:12px;background:rgba(255,255,255,.07);font-size:.82rem;color:rgba(255,255,255,.65);text-align:center">Bonne réponse : <strong style="color:#86efac">${q.a[q.c]}</strong>${q.f?` — 💡 ${q.f}`:''}</div>`:''}
    `;
  } else {
    content = `
      <div style="font-size:5rem;animation:floatY 2s ease-in-out infinite">⏱️</div>
      <div style="font-size:2rem;font-weight:800;color:#fca5a5;text-align:center">Temps écoulé !</div>
      ${q?`<div style="padding:10px 18px;border-radius:12px;background:rgba(255,255,255,.07);font-size:.88rem;text-align:center">Bonne réponse : <strong style="color:#86efac">${q.a[q.c]}</strong></div>`:''}
    `;
  }
  _interLayout(room, gs, content);
}

// ── Chrono : classement de vitesse ──
function interChrono(room, gs) {
  const ranking = toArr(gs.chronoRanking || []);
  const _rp = toArr(room.players);
  const medals = ['🥇','🥈','🥉'];
  const rows = ranking.map((entry, rank) => {
    const idx = gs.players.indexOf(entry.name);
    const rp = _rp.find(x => x.name === entry.name);
    const avIdx = (rp && rp.avatar !== undefined) ? rp.avatar : (idx % AVATARS.length);
    const av = AVATARS[avIdx] || AVATARS[0];
    return `<div style="display:flex;align-items:center;gap:12px;padding:10px 16px;border-radius:14px;background:${entry.correct?'rgba(34,197,94,.12)':'rgba(255,255,255,.04)'};border:1px solid ${entry.correct?'rgba(34,197,94,.3)':'rgba(255,255,255,.08)'};animation:sUp .3s ease ${rank*.06}s both">
      <span style="font-size:1.2rem;width:30px;text-align:center">${medals[rank]||('#'+(rank+1))}</span>
      <img src="${AVATAR_PATH}${av.file}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid ${av.bg}" alt="">
      <span style="font-weight:700;flex:1;font-size:.9rem">${entry.name}</span>
      <span style="font-weight:900;font-size:1rem;color:${entry.correct?'#4ade80':'rgba(255,255,255,.3)'}">${entry.pts>0?'+'+entry.pts:'—'}</span>
    </div>`;
  }).join("");
  const q = (gs.rQs||{})[gs.roundIdx]?.[gs.qIdx];
  _interLayout(room, gs, `
    <div style="font-size:1.4rem;font-weight:800;text-align:center">⏱️ Classement de la question</div>
    ${q?`<div style="padding:8px 16px;border-radius:10px;background:rgba(255,255,255,.08);font-size:.82rem;text-align:center">Bonne réponse : <strong style="color:#86efac">${q.a[q.c]}</strong></div>`:''}
    <div style="width:100%;display:flex;flex-direction:column;gap:7px;max-width:520px">${rows||'<div style="color:rgba(255,255,255,.4);text-align:center">Aucune réponse</div>'}</div>
  `);
}

// ── Steal : vol de points ──
function interSteal(room, gs) {
  const q = (gs.rQs||{})[gs.roundIdx]?.[gs.qIdx];
  const _rp = toArr(room.players);
  const scorer = gs.result?.scorer;
  const msg = gs.result?.msg || '';
  const stolen = gs.result?.pts || 0;
  const victimMatch = msg.match(/à (.+?) !/);
  const victimName = victimMatch ? victimMatch[1] : null;
  let content;
  if (scorer && victimName) {
    const ti = gs.players.indexOf(scorer), vi = gs.players.indexOf(victimName);
    const trp = _rp.find(x=>x.name===scorer), vrp = _rp.find(x=>x.name===victimName);
    const tav = AVATARS[(trp&&trp.avatar!==undefined)?trp.avatar:(ti%AVATARS.length)]||AVATARS[0];
    const vav = AVATARS[(vrp&&vrp.avatar!==undefined)?vrp.avatar:(vi%AVATARS.length)]||AVATARS[0];
    content = `
      <div style="font-size:1.4rem;font-weight:800;color:#f59e0b;text-align:center;animation:sUp .3s ease both">😈 Vol de points !</div>
      <div style="display:flex;align-items:center;gap:24px;justify-content:center">
        <div style="text-align:center;animation:popIn .4s ease both">
          <img src="${AVATAR_PATH}${tav.file}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:4px solid ${tav.bg};box-shadow:0 0 28px ${tav.bg}88" alt="">
          <div style="font-size:.85rem;font-weight:700;margin-top:6px">${scorer}</div>
          <div style="font-size:.8rem;color:#4ade80;font-weight:800">+${stolen} pts</div>
        </div>
        <div style="font-size:2.5rem;animation:floatY 1.5s ease-in-out infinite">😈</div>
        <div style="text-align:center;opacity:.7;animation:popIn .4s ease .1s both">
          <img src="${AVATAR_PATH}${vav.file}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:4px solid #ef4444;box-shadow:0 0 28px #ef444488;filter:grayscale(.3)" alt="">
          <div style="font-size:.85rem;font-weight:700;margin-top:6px">${victimName}</div>
          <div style="font-size:.8rem;color:#f87171;font-weight:800">-${stolen} pts</div>
        </div>
      </div>
      ${q?`<div style="padding:8px 16px;border-radius:10px;background:rgba(255,255,255,.08);font-size:.82rem;text-align:center">Bonne réponse : <strong style="color:#86efac">${q.a[q.c]}</strong></div>`:''}
    `;
  } else {
    content = `
      <div style="font-size:3.5rem;animation:floatY 2s ease-in-out infinite">❌</div>
      <div style="font-size:1.5rem;font-weight:800;text-align:center;color:#fca5a5">Personne n'a trouvé !</div>
      ${q?`<div style="padding:10px 18px;border-radius:12px;background:rgba(255,255,255,.07);font-size:.88rem;text-align:center">Bonne réponse : <strong style="color:#86efac">${q.a[q.c]}</strong></div>`:''}
    `;
  }
  _interLayout(room, gs, content);
}

// ── Patate : explosion ou passage ──
function interPatate(room, gs) {
  const msg = gs.result?.msg || '';
  const _rp = toArr(room.players);
  const isExplosion = (gs.result?.pts || 0) < 0 || msg.includes('BOOM') || msg.includes('💥');
  const isPass = msg.includes('passe');
  let content;
  if (isExplosion) {
    const loser = gs.result?.scorer;
    const lossPts = Math.abs(gs.result?.pts || 0);
    let loserHtml = '';
    if (loser) {
      const idx = gs.players.indexOf(loser);
      const rp = _rp.find(x => x.name === loser);
      const av = AVATARS[(rp&&rp.avatar!==undefined)?rp.avatar:(idx%AVATARS.length)]||AVATARS[0];
      loserHtml = `<img src="${AVATAR_PATH}${av.file}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:4px solid #ef4444;box-shadow:0 0 28px #ef444488;animation:wrongShake .35s ease both" alt="">
        <div style="font-size:1.1rem;font-weight:700">${loser}</div>
        <div style="font-size:1.5rem;font-weight:900;color:#f87171">-${lossPts} pts</div>`;
    }
    content = `
      <div style="font-size:6rem;animation:popIn .5s cubic-bezier(.36,.07,.19,.97) both">💥</div>
      <div style="font-size:2.2rem;font-weight:900;color:#f87171;text-shadow:0 0 24px #ef4444;animation:sUp .3s ease both">BOOM !</div>
      <div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px">${loserHtml}</div>
      <div style="font-size:.72rem;color:rgba(255,255,255,.5)">🥔 Manche ${gs.patateManche||0}/4 terminée</div>
    `;
  } else {
    const holderName = gs.patateHolder || '';
    let holderHtml = '';
    if (holderName) {
      const idx = gs.players.indexOf(holderName);
      const rp = _rp.find(x => x.name === holderName);
      const av = AVATARS[(rp&&rp.avatar!==undefined)?rp.avatar:(idx%AVATARS.length)]||AVATARS[0];
      holderHtml = `<img src="${AVATAR_PATH}${av.file}" style="width:90px;height:90px;border-radius:50%;object-fit:cover;border:4px solid #fb923c;box-shadow:0 0 24px #fb923c88" alt="">
        <div style="font-size:1rem;font-weight:700;margin-top:6px">${holderName} a la patate</div>`;
    }
    content = `
      <div style="font-size:5rem;animation:floatY 1.5s ease-in-out infinite">🥔</div>
      <div style="font-size:1.4rem;font-weight:800;text-align:center;color:${isPass?'#86efac':'#fca5a5'};animation:sUp .3s ease both">${isPass?'🎉':'😬'} ${msg}</div>
      <div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px">${holderHtml}</div>
      <div style="font-size:.72rem;color:rgba(255,255,255,.5)">🥔 Manche ${(gs.patateManche||0)+1}/4</div>
    `;
  }
  _interLayout(room, gs, content);
}

// ── Carton : ballons par joueur ──
function interCarton(room, gs) {
  const _rp = toArr(room.players);
  const balloons = toArr(gs.balloons).length ? toArr(gs.balloons) : gs.players.map(() => 3);
  const roundElim = gs.roundElim || [];
  const scorer = gs.result?.scorer;
  const msg = gs.result?.msg || '';
  const isGood = !!(scorer && (gs.result?.pts || 0) > 0);
  const q = (gs.rQs||{})[gs.roundIdx]?.[gs.qIdx];

  const cards = gs.players.map((p, i) => {
    const rp = _rp.find(x => x.name === p);
    const av = AVATARS[(rp&&rp.avatar!==undefined)?rp.avatar:(i%AVATARS.length)]||AVATARS[0];
    const b = balloons[i] || 0;
    const dead = roundElim.includes(p);
    const isScorer = p === scorer;
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-radius:14px;background:${dead?'rgba(239,68,68,.08)':isScorer?av.bg+'28':'rgba(255,255,255,.05)'};border:2px solid ${dead?'rgba(239,68,68,.3)':isScorer?av.bg+'88':'rgba(255,255,255,.08)'};animation:sUp .3s ease ${i*.05}s both">
      <img src="${AVATAR_PATH}${av.file}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:2px solid ${av.bg};opacity:${dead?.35:1}" alt="">
      <span style="font-weight:700;font-size:.85rem;flex:1;text-decoration:${dead?'line-through':'none'};color:${dead?'rgba(255,255,255,.3)':'white'}">${p}</span>
      <span style="font-size:1rem">${dead?'💀':'🎈'.repeat(b)||'💥'}</span>
    </div>`;
  }).join("");

  _interLayout(room, gs, `
    <div style="font-size:1.3rem;font-weight:800;color:${isGood?'#86efac':'#fca5a5'};text-align:center;max-width:500px;line-height:1.4;animation:sUp .3s ease both">${msg.split('\n')[0]}</div>
    ${q?`<div style="padding:8px 14px;border-radius:10px;background:rgba(255,255,255,.08);font-size:.82rem;text-align:center">Bonne réponse : <strong style="color:#86efac">${q.a[q.c]}</strong></div>`:''}
    <div style="width:100%;display:flex;flex-direction:column;gap:7px;max-width:480px">${cards}</div>
  `);
}
