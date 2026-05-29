/* ════════════════════════════════════════════
   ui-inter.js — BRAIN CLASH
   Écran intermédiaire "questionResult"
   Affiché 4.5s entre chaque question et la suivante.
   6 variantes : une par type de round.
   ════════════════════════════════════════════ */

// Mémorise le dernier son joué pour éviter de le rejouer lors d'une transition
// (ex : carton picking → hit garde le même scorer, même question)
let _lastSoundKey = '';

function drawQuestionResult(room, gs) {
  // Annuler le RAF timer
  if (_timerRafId) { cancelAnimationFrame(_timerRafId); _timerRafId = null; }

  // Sons (dédupliqués par roundIdx/qIdx/scorer/pts)
  if (gs.result) {
    const soundKey = `${gs.roundIdx}-${gs.qIdx}-${gs.result.scorer||''}-${gs.result.pts||0}`;
    if (soundKey !== _lastSoundKey) {
      _lastSoundKey = soundKey;
      const good = gs.result.scorer && (gs.result.pts || 0) >= 0;
      good ? SFX.correct() : SFX.wrong();
    }
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

// ── QCM : Reveal "Bonne réponse" — design néon vert/rouge ──
function interQCM(room, gs) {
  const q = (gs.rQs||{})[gs.roundIdx]?.[gs.qIdx];
  if (!q) { drawScore(room, gs, false); return; }

  const ans = gs.answers || {};
  const _rp = toArr(room.players);
  const correct = gs.players.filter(p => ans[p] !== undefined && ans[p].ansIdx === q.c);
  const pts = gs.result?.pts ?? Math.round(50 * gs.players.length * 0.5);
  const hasWinners = correct.length > 0;
  const answerLetter = String.fromCharCode(65 + q.c);

  // Headline (bonne/mauvaise réponse)
  const headline = `
    <div class="qint-headline ${hasWinners ? '' : 'bad'}">
      <div class="qint-emblem">${hasWinners ? '✓' : '✗'}</div>
      <div class="qint-headline-body">
        <div class="qint-kicker">${hasWinners ? '🎯 BONNE RÉPONSE' : '❌ MAUVAISE RÉPONSE'}</div>
        <div class="qint-headline-text">
          <span class="qint-ans-letter">${answerLetter}</span>
          <span class="qint-answer">${q.a[q.c]}</span>
        </div>
      </div>
    </div>
  `;

  // Winners or no-winners block
  let winnersBlock;
  if (!hasWinners) {
    winnersBlock = `
      <div class="qint-winners bad">
        <div class="qint-rays"></div>
        <div class="qint-winners-title bad">PERSONNE N'A TROUVÉ</div>
        <div class="qint-no-winners">
          <div class="qint-no-winners-icon">✗</div>
          <div class="qint-no-winners-text">Aucun point distribué</div>
          <div class="qint-no-winners-sub">La prochaine sera la bonne 💪</div>
        </div>
      </div>
    `;
  } else {
    const sizeCls = correct.length <= 3 ? 'lg' : (correct.length <= 5 ? 'md' : 'sm');
    const cards = correct.map((p, i) => {
      const idx = gs.players.indexOf(p);
      const rp = _rp.find(x => x.name === p);
      const av = AVATARS[(rp&&rp.avatar!==undefined)?rp.avatar:(idx%AVATARS.length)]||AVATARS[0];
      return `<div class="qint-winner-card ${sizeCls}" style="--pc:${av.bg};animation-delay:${i*.08}s">
        <div class="qint-disc-wrap">
          <div class="qint-disc"><img src="${AVATAR_PATH}${av.file}" alt=""></div>
          <div class="qint-gain">+${pts}</div>
        </div>
        <div class="qint-winner-name">${p}</div>
      </div>`;
    }).join('');
    const title = correct.length > 1 ? "ONT TROUVÉ LA BONNE RÉPONSE" : "A TROUVÉ LA BONNE RÉPONSE";
    winnersBlock = `
      <div class="qint-winners">
        <div class="qint-rays"></div>
        <div class="qint-winners-title">${title}</div>
        <div class="qint-winners-row">${cards}</div>
        <span class="qint-confetti" style="left:6%;top:18%;animation-delay:0s">✦</span>
        <span class="qint-confetti" style="right:8%;top:22%;animation-delay:.6s">✦</span>
        <span class="qint-confetti" style="left:14%;bottom:14%;animation-delay:.3s">✧</span>
        <span class="qint-confetti" style="right:12%;bottom:18%;animation-delay:.9s">✦</span>
        <span class="qint-confetti" style="left:48%;top:6%;font-size:1.1rem;animation-delay:.45s">✧</span>
      </div>
    `;
  }

  // Fun fact (anecdote)
  const funfactBlock = q.f ? `
    <div class="qint-funfact">
      <div class="qint-funfact-icon">💡</div>
      <div class="qint-funfact-body">
        <div class="qint-funfact-kicker">LE SAVIEZ-VOUS ?</div>
        <div class="qint-funfact-text">${q.f}</div>
      </div>
    </div>
  ` : '';

  _interLayout(room, gs, `<div class="qint-wrap">${headline}${winnersBlock}${funfactBlock}</div>`);
}

// ── Buzzer : avatar vainqueur ou timeout ──
function interBuzzer(room, gs) {
  const q = (gs.rQs||{})[gs.roundIdx]?.[gs.qIdx];
  const _rp = toArr(room.players);
  const scorer = gs.result?.scorer;
  let content;
  if (scorer) {
    // ── Bonne réponse — design néon vert (chip ambre + headline vert + disc vainqueur) ──
    const idx = gs.players.indexOf(scorer);
    const rp = _rp.find(x => x.name === scorer);
    const avIdx = (rp && rp.avatar !== undefined) ? rp.avatar : (idx % AVATARS.length);
    const av = AVATARS[avIdx] || AVATARS[0];
    const pts = gs.result?.pts || 0;

    const headlineHtml = `
      <div class="binw-headline">
        <div class="binw-emblem">✓</div>
        <div class="binw-headline-body">
          <div class="binw-kicker">🔔 BONNE RÉPONSE</div>
          <div class="binw-headline-text"><span class="binw-answer">${q ? q.a[q.c] : ''}</span></div>
          ${q?.q ? `<div class="binw-q">${q.q}</div>` : ''}
        </div>
      </div>
    `;

    const funfactHtml = q?.f ? `
      <div class="binw-funfact">
        <div class="binw-funfact-icon">💡</div>
        <div class="binw-funfact-body">
          <div class="binw-funfact-kicker">LE SAVIEZ-VOUS ?</div>
          <div class="binw-funfact-text">${q.f}</div>
        </div>
      </div>
    ` : '';

    content = `
      <div class="binw-wrap" style="--pc:${av.bg}">
        <div class="binw-chip"><span class="binw-chip-bell">🔔</span>MANCHE BUZZER</div>
        ${headlineHtml}
        <div class="binw-winners">
          <div class="binw-rays"></div>
          <div class="binw-winners-title">A BUZZÉ EN PREMIER</div>
          <div class="binw-winners-row">
            <div class="binw-winner-card">
              <div class="binw-disc-wrap">
                <div class="binw-disc"><img src="${AVATAR_PATH}${av.file}" alt=""></div>
                <div class="binw-gain">+${pts}</div>
              </div>
              <div class="binw-winner-name">${scorer}</div>
            </div>
          </div>
          <span class="binw-confetti" style="left:8%;top:18%;animation-delay:0s">✦</span>
          <span class="binw-confetti" style="right:8%;top:22%;animation-delay:.6s">✦</span>
          <span class="binw-confetti" style="left:14%;bottom:14%;animation-delay:.3s">✧</span>
          <span class="binw-confetti" style="right:12%;bottom:18%;animation-delay:.9s;font-size:.85rem">✦</span>
          <span class="binw-confetti" style="left:48%;top:6%;font-size:.85rem;animation-delay:.45s">✧</span>
        </div>
        ${funfactHtml}
      </div>
    `;
  } else {
    // ── Temps écoulé — design néon ambre / panneau rose-rouge ──
    const headlineHtml = q?.q ? `
      <div class="binte-headline">
        <div class="binte-headline-emblem">⏱️</div>
        <div class="binte-headline-body">
          <div class="binte-headline-kicker">TEMPS ÉCOULÉ · LA QUESTION</div>
          <div class="binte-headline-text">${q.q}</div>
        </div>
      </div>
    ` : '';

    const answerHtml = q ? `
      <div class="binte-answer">
        <span class="binte-answer-label">BONNE RÉPONSE</span>
        <span class="binte-answer-divider"></span>
        <span class="binte-answer-value">${q.a[q.c]}</span>
      </div>
    ` : '';

    const funfactHtml = q?.f ? `
      <div class="binte-funfact">
        <div class="binte-funfact-icon">💡</div>
        <div class="binte-funfact-body">
          <div class="binte-funfact-kicker">LE SAVIEZ-VOUS ?</div>
          <div class="binte-funfact-text">${q.f}</div>
        </div>
      </div>
    ` : '';

    // 12 ticks autour du cadran
    const cx = 50, cy = 50, r = 38;
    let dotsHtml = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const left = cx + Math.cos(a) * r;
      const top  = 14 + cy + Math.sin(a) * r; // +14 décalage du body
      dotsHtml += `<span class="binte-clock-dot" style="left:calc(${left}% - 2.5px);top:${top}px"></span>`;
    }

    content = `
      <div class="binte-wrap">
        <div class="binte-chip"><span class="binte-chip-bell">🔔</span>MANCHE BUZZER</div>
        ${headlineHtml}
        <div class="binte-miss">
          <div class="binte-rays"></div>
          <div class="binte-clock">
            <div class="binte-clock-btn"></div>
            <div class="binte-clock-body"></div>
            ${dotsHtml}
            <div class="binte-clock-hand"></div>
            <div class="binte-clock-hub"></div>
          </div>
          <div class="binte-title">TEMPS ÉCOULÉ !</div>
          <div class="binte-sub">Personne n'a buzzé à temps</div>
          ${answerHtml}
          ${funfactHtml}
        </div>
      </div>
    `;
  }
  _interLayout(room, gs, content);
}

// ── Chrono : classement de vitesse — design néon cyan ──
function interChrono(room, gs) {
  const q = (gs.rQs||{})[gs.roundIdx]?.[gs.qIdx];
  const ranking = toArr(gs.chronoRanking || []);
  const _rp = toArr(room.players);

  const headlineHtml = `
    <div class="chinte-headline">
      <div class="chinte-emblem">⏱️</div>
      <div class="chinte-headline-body">
        <div class="chinte-headline-kicker">MANCHE CHRONO · CETTE QUESTION</div>
        <div class="chinte-headline-text">Classement de la question</div>
      </div>
    </div>
  `;

  const answerHtml = q ? `
    <div class="chinte-answer">
      <span class="chinte-answer-label">Bonne réponse :</span>
      <span class="chinte-answer-value">${q.a[q.c]}</span>
    </div>
  ` : '';

  const medalClass = ['m1','m2','m3'];
  const rowsHtml = ranking.length ? ranking.map((entry, rank) => {
    const idx = gs.players.indexOf(entry.name);
    const rp = _rp.find(x => x.name === entry.name);
    const avIdx = (rp && rp.avatar !== undefined) ? rp.avatar : (idx % AVATARS.length);
    const av = AVATARS[avIdx] || AVATARS[0];
    const gainCls = entry.pts > 0 ? '' : 'zero';
    const gainTxt = entry.pts > 0 ? `+${entry.pts}` : '—';
    return `<div class="chinte-row" style="--rc:${entry.correct ? '#4be0ff' : 'rgba(180,200,230,.35)'};--pc:${av.bg};animation-delay:${rank*.08}s">
      <div class="chinte-medal ${medalClass[rank] || 'm3'}">${rank+1}</div>
      <div class="chinte-av"><img src="${AVATAR_PATH}${av.file}" alt=""></div>
      <div class="chinte-name">${entry.name}</div>
      <div class="chinte-gain ${gainCls}">${gainTxt}</div>
    </div>`;
  }).join('') : `<div class="chinte-empty">Aucune réponse</div>`;

  const funfactHtml = q?.f ? `
    <div class="chinte-funfact">
      <div class="chinte-funfact-icon">💡</div>
      <div class="chinte-funfact-body">
        <div class="chinte-funfact-kicker">LE SAVIEZ-VOUS ?</div>
        <div class="chinte-funfact-text">${q.f}</div>
      </div>
    </div>
  ` : '';

  const content = `
    <div class="chinte-wrap">
      <div class="chinte-chip"><span class="chinte-chip-bell">⏱️</span>MANCHE CHRONO</div>
      ${headlineHtml}
      <div class="chinte-board">
        <div class="chinte-rays"></div>
        ${answerHtml}
        <div class="chinte-list">${rowsHtml}</div>
        ${funfactHtml}
      </div>
    </div>
  `;
  _interLayout(room, gs, content);
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
    // ── Vol réussi — design néon orange (devil identity) + duel + coins ──
    const ti = gs.players.indexOf(scorer), vi = gs.players.indexOf(victimName);
    const trp = _rp.find(x=>x.name===scorer), vrp = _rp.find(x=>x.name===victimName);
    const tav = AVATARS[(trp&&trp.avatar!==undefined)?trp.avatar:(ti%AVATARS.length)]||AVATARS[0];
    const vav = AVATARS[(vrp&&vrp.avatar!==undefined)?vrp.avatar:(vi%AVATARS.length)]||AVATARS[0];

    const headlineHtml = q?.q ? `
      <div class="swin-headline">
        <div class="swin-headline-emblem">😈</div>
        <div class="swin-headline-body">
          <div class="swin-headline-kicker">VOL RÉUSSI · LA QUESTION</div>
          <div class="swin-headline-text">${q.q}</div>
        </div>
      </div>
    ` : '';

    const coinCount = Math.max(5, Math.min(9, Math.round(stolen / 12)));
    let coinsHtml = '';
    for (let k = 0; k < coinCount; k++) {
      const delay = (k * 1.7 / coinCount).toFixed(2);
      coinsHtml += `<span class="swin-coin" style="animation-delay:${delay}s"><span class="swin-coin-face"></span></span>`;
    }

    const answerHtml = q ? `
      <div class="swin-answer">
        <span class="swin-answer-label">BONNE RÉPONSE</span>
        <span class="swin-answer-divider"></span>
        <span class="swin-answer-value">${q.a[q.c]}</span>
      </div>
    ` : '';

    const funfactHtml = q?.f ? `
      <div class="swin-funfact">
        <div class="swin-funfact-icon">💡</div>
        <div class="swin-funfact-body">
          <div class="swin-funfact-kicker">LE SAVIEZ-VOUS ?</div>
          <div class="swin-funfact-text">${q.f}</div>
        </div>
      </div>
    ` : '';

    content = `
      <div class="swin-wrap">
        ${headlineHtml}
        <div class="swin-panel">
          <div class="swin-panel-rays"></div>
          <div class="swin-title">
            <span class="swin-devil">😈</span>
            VOL DE POINTS&nbsp;!
          </div>
          <div class="swin-duel">
            <div class="swin-coinflow">${coinsHtml}</div>
            <div class="swin-duelist thief" style="--pc:${tav.bg};--avb:${tav.bg}">
              <div class="swin-duel-av"><img src="${AVATAR_PATH}${tav.file}" alt=""></div>
              <div class="swin-duel-name">${scorer}</div>
              <div class="swin-delta gain">+${stolen} pts</div>
            </div>
            <div class="swin-core"></div>
            <div class="swin-duelist victim" style="--pc:${vav.bg};--avb:${vav.bg}">
              <div class="swin-duel-av"><img src="${AVATAR_PATH}${vav.file}" alt=""><span class="swin-tear">💧</span></div>
              <div class="swin-duel-name">${victimName}</div>
              <div class="swin-delta loss">−${stolen} pts</div>
            </div>
          </div>
          ${answerHtml}
        </div>
        ${funfactHtml}
      </div>
    `;
  } else {
    // ── Personne n'a trouvé (ou timeout) — design néon rouge/violet ──
    const ans = gs.answers || {};
    const isTimeout = /Temps écoulé/i.test(msg);
    const tried = gs.players
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => ans[p] !== undefined && (!q || ans[p].ansIdx !== q.c));

    const stealersHtml = tried.length ? `
      <div class="sinte-stealers">
        <span class="sinte-stealers-lbl">${tried.length > 1 ? 'ONT TENTÉ LE VOL' : 'A TENTÉ LE VOL'}</span>
        ${tried.map(({ p, i }, k) => {
          const rp = _rp.find(x => x.name === p);
          const av = AVATARS[(rp && rp.avatar !== undefined) ? rp.avatar : (i % AVATARS.length)] || AVATARS[0];
          return `<div class="sinte-stealer" style="--pc:${av.bg};animation-delay:${k*.08}s">
            <div class="sinte-stealer-av">
              <img src="${AVATAR_PATH}${av.file}" alt="">
              <span class="sinte-stealer-x">✗</span>
            </div>
            <div class="sinte-stealer-name">${p}</div>
          </div>`;
        }).join('')}
      </div>
    ` : '';

    const headlineHtml = q?.q ? `
      <div class="sinte-headline">
        <div class="sinte-headline-emblem">⚡</div>
        <div class="sinte-headline-body">
          <div class="sinte-headline-kicker">VOL RATÉ · LA QUESTION</div>
          <div class="sinte-headline-text">${q.q}</div>
        </div>
      </div>
    ` : '';

    const answerHtml = q ? `
      <div class="sinte-answer">
        <span class="sinte-answer-label">BONNE RÉPONSE</span>
        <span class="sinte-answer-divider"></span>
        <span class="sinte-answer-value">${q.a[q.c]}</span>
      </div>
    ` : '';

    const funfactHtml = q?.f ? `
      <div class="sinte-funfact">
        <div class="sinte-funfact-icon">💡</div>
        <div class="sinte-funfact-body">
          <div class="sinte-funfact-kicker">LE SAVIEZ-VOUS ?</div>
          <div class="sinte-funfact-text">${q.f}</div>
        </div>
      </div>
    ` : '';

    const title = isTimeout ? 'TEMPS ÉCOULÉ' : "PERSONNE N'A TROUVÉ !";
    const sub = isTimeout ? 'Aucun joueur n\'a tenté à temps' : 'Aucun point volé sur cette question';

    content = `
      <div class="sinte-wrap">
        <div class="sinte-chip"><span class="sinte-chip-bell">⚡</span>VOL DE POINTS</div>
        ${headlineHtml}
        <div class="sinte-miss">
          <div class="sinte-rays"></div>
          <div class="sinte-icon">✗</div>
          <div class="sinte-title">${title}</div>
          <div class="sinte-sub">${sub}</div>
          ${answerHtml}
          ${stealersHtml}
          ${funfactHtml}
        </div>
      </div>
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
    // ── BOOM : design néon orange/rouge avec explosion et joueur éliminé ──
    const loser = gs.result?.scorer;
    const lossPts = Math.abs(gs.result?.pts || 0);
    const mancheCur = gs.patateManche || 0;
    const mancheTotal = 4;

    // Avatar du perdant
    let loserBlock = '';
    if (loser) {
      const idx = gs.players.indexOf(loser);
      const rp = _rp.find(x => x.name === loser);
      const av = AVATARS[(rp&&rp.avatar!==undefined)?rp.avatar:(idx%AVATARS.length)]||AVATARS[0];
      loserBlock = `
        <div class="pboom-loser" style="--avb:${av.bg}">
          <div class="pboom-loser-disc-wrap">
            <div class="pboom-loser-disc"><img src="${AVATAR_PATH}${av.file}" alt=""></div>
            <div class="pboom-loser-spud">🥔</div>
          </div>
          <div class="pboom-loser-name">${loser}</div>
          <div class="pboom-loser-delta">−${lossPts} pts</div>
        </div>`;
    }

    // Débris embers (12 directions)
    let debrisHtml = '';
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * Math.PI * 2 + 0.3;
      const dist = 130 + (k % 3) * 34;
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist;
      const delay = (k % 5) * 0.18;
      debrisHtml += `<span class="pboom-debris" style="--dx:${dx}px;--dy:${dy}px;animation-delay:${delay}s"></span>`;
    }

    // Puffs (overlapping fireball cloud)
    const puffs = [
      { d:78,  x:-44, y:-24, t:2.1, smoke:true },
      { d:84,  x:42,  y:-28, t:2.4, smoke:true },
      { d:72,  x:50,  y:20,  t:1.9, smoke:false },
      { d:80,  x:-48, y:24,  t:2.3, smoke:false },
      { d:66,  x:2,   y:-46, t:2.0, smoke:true },
      { d:70,  x:6,   y:46,  t:2.5, smoke:false },
      { d:88,  x:-18, y:2,   t:1.8, smoke:false },
      { d:84,  x:24,  y:-4,  t:2.2, smoke:false },
    ];
    const puffsHtml = puffs.map((p, k) =>
      `<span class="pboom-puff ${p.smoke?'smoke':''}" style="--d:${p.d}px;--x:${p.x}px;--y:${p.y}px;--t:${p.t}s;animation-delay:${(k%4)*0.2}s"></span>`
    ).join('');

    content = `
      <div class="pboom-wrap">
        <div class="pinte-chip"><span class="pinte-chip-spud">🥔</span>PATATE CHAUDE</div>
        <div class="pboom-scene">
          <div class="pboom-rays"></div>
          <div class="pboom-kicker">MANCHE ${mancheCur} / ${mancheTotal}</div>
          <div class="pboom-head">
            <div class="pboom-burst">
              <span class="pboom-shock"></span>
              <span class="pboom-shock b"></span>
              ${debrisHtml}
              <div class="pboom-cloud">${puffsHtml}</div>
              <span class="pboom-fireball"></span>
              <span class="pboom-flash"></span>
            </div>
            <div class="pboom-text">BOOM&nbsp;!</div>
          </div>
          ${loserBlock}
          <div class="pboom-done">
            <span class="pboom-done-spud">🥔</span>
            MANCHE ${mancheCur}/${mancheTotal} TERMINÉE
          </div>
        </div>
      </div>
    `;
  } else if (isPass) {
    // ── Passe : design néon "comète enflammée" entre les 2 joueurs ──
    const passMatch = msg.match(/(?:✅\s+)?(.+?)\s+passe la patate à\s+(.+?)\s*!?$/);
    const fromName = passMatch ? passMatch[1] : '';
    const toName   = passMatch ? passMatch[2] : (gs.patateHolder || '');
    const avFor = (name) => {
      const idx = gs.players.indexOf(name);
      const rp = _rp.find(x => x.name === name);
      return AVATARS[(rp && rp.avatar !== undefined) ? rp.avatar : (idx % AVATARS.length)] || AVATARS[0];
    };
    const fromAv = fromName ? avFor(fromName) : null;
    const toAv   = toName   ? avFor(toName)   : null;
    const fromBlock = fromAv ? `
      <div class="pinte-end from" style="--pc:${fromAv.bg};--avb:${fromAv.bg}">
        <div class="pinte-disc-wrap">
          <div class="pinte-end-disc"><img src="${AVATAR_PATH}${fromAv.file}" alt=""></div>
        </div>
        <div class="pinte-end-name">${fromName}</div>
        <div class="pinte-end-tag">passe</div>
      </div>` : '';
    const toBlock = toAv ? `
      <div class="pinte-end to" style="--pc:${toAv.bg};--avb:${toAv.bg}">
        <div class="pinte-disc-wrap">
          <div class="pinte-end-disc"><img src="${AVATAR_PATH}${toAv.file}" alt=""></div>
          <div class="pinte-impact"></div>
        </div>
        <div class="pinte-end-name">${toName}</div>
        <div class="pinte-end-tag">reçoit</div>
      </div>` : '';

    content = `
      <div class="pinte-wrap">
        <div class="pinte-chip"><span class="pinte-chip-spud">🥔</span>PATATE CHAUDE</div>
        <div class="pinte-scene">
          <div class="pinte-rays"></div>
          <div class="pinte-kicker">MANCHE ${(gs.patateManche||0)+1} / 4</div>
          <div class="pinte-pass-row">
            ${fromBlock}
            <div class="pinte-path">
              <svg class="pinte-path-arc" viewBox="0 0 300 180">
                <path class="pinte-comet-glow" pathLength="100" d="M 20 130 Q 150 -30, 280 130"/>
                <path class="pinte-comet-core" pathLength="100" d="M 20 130 Q 150 -30, 280 130"/>
              </svg>
              <div class="pinte-fly-spud">
                <span class="pinte-flame-aura outer"></span>
                <span class="pinte-flame-aura"></span>
                <span class="pinte-spud">🥔</span>
              </div>
              <span class="pinte-ember" style="left:232px;top:108px;animation-delay:0s"></span>
              <span class="pinte-ember" style="left:252px;top:124px;animation-delay:.5s"></span>
              <span class="pinte-ember" style="left:212px;top:116px;animation-delay:.9s"></span>
              <span class="pinte-ember" style="left:262px;top:102px;animation-delay:1.3s"></span>
            </div>
            ${toBlock}
          </div>
          <div class="pinte-headline">
            <span class="pinte-from-n">${fromName}</span> passe la patate à <span class="pinte-to-n">${toName}</span>
          </div>
          <div class="pinte-sub">
            <span class="pinte-sub-spud">🥔</span>
            ${(toName||'').toUpperCase()} A LA PATATE
          </div>
        </div>
      </div>
    `;
  } else {
    // ── Raté : le porteur garde la patate ──
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
      <div style="font-size:1.4rem;font-weight:800;text-align:center;color:#fca5a5;animation:sUp .3s ease both">😬 ${msg}</div>
      <div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px">${holderHtml}</div>
      <div style="font-size:.72rem;color:rgba(255,255,255,.5)">🥔 Manche ${(gs.patateManche||0)+1}/4</div>
    `;
  }
  _interLayout(room, gs, content);
}

// ── Carton : Tir à la carabine — design néon orange/rouge ──
function interCarton(room, gs) {
  const _rp = toArr(room.players);
  const balloons = toArr(gs.balloons).length ? toArr(gs.balloons) : gs.players.map(() => 3);
  const roundElim = toArr(gs.roundElim) || [];
  const scorer = gs.result?.scorer;
  const msg = gs.result?.msg || '';
  const q = (gs.rQs||{})[gs.roundIdx]?.[gs.qIdx];

  // Détermine le scénario
  // - picking   : pickTarget=true → le tireur choisit sa cible sur son téléphone
  // - hit       : "🎯 X crève (un ballon|le dernier ballon) de Y !"
  // - self      : "❌ X perd (un ballon|son dernier ballon) !"
  // - good      : "✅ X a bon !"          (bonne réponse, pas de cible disponible)
  // - timeout   : "⏱️ Temps écoulé !"
  // - survivor  : "🏆 X est le dernier debout"
  let shooter = null, victim = null, kind = 'fallback';
  let mHit = msg.match(/🎯\s+(.+?)\s+crève\s+(?:un ballon|le dernier ballon)\s+de\s+(.+?)\s+!/);
  let mSelf = msg.match(/❌\s+(.+?)\s+perd\s+(?:un ballon|son dernier ballon)/);
  let mGood = msg.match(/✅\s+(.+?)\s+a bon/);
  let mWin  = msg.match(/🏆\s+(.+?)\s+est le dernier debout/);
  if (gs.pickTarget && gs.buzzed) { shooter = gs.buzzed; kind = 'picking'; }
  else if (mHit)        { shooter = mHit[1];  victim = mHit[2];  kind = 'hit'; }
  else if (mSelf)  { shooter = mSelf[1]; victim = mSelf[1]; kind = 'self'; }
  else if (mGood)  { shooter = mGood[1]; kind = 'good'; }
  else if (mWin)   { shooter = mWin[1];  kind = 'survivor'; }
  else if (/⏱️\s+Temps écoulé/.test(msg)) { kind = 'timeout'; }

  // Avatar helper
  const avFor = (name) => {
    const idx = gs.players.indexOf(name);
    const rp = _rp.find(x => x.name === name);
    return AVATARS[(rp && rp.avatar !== undefined) ? rp.avatar : (idx % AVATARS.length)] || AVATARS[0];
  };

  // Headline
  let kicker, headlineText;
  const shooterC = shooter ? avFor(shooter).bg : '#4ad8ff';
  const victimC  = victim  ? avFor(victim).bg  : '#ff4fa2';
  if (kind === 'picking') {
    kicker = '🎯 EN JOUE…';
    headlineText = `<span class="cinte-who shooter">${shooter}</span> vise sa cible <span class="cinte-pop">🎯</span>`;
  } else if (kind === 'hit') {
    kicker = '🎯 TIR RÉUSSI';
    headlineText = `<span class="cinte-who shooter">${shooter}</span> crève un ballon de <span class="cinte-who victim">${victim}</span> <span class="cinte-pop">💥</span>`;
  } else if (kind === 'self') {
    kicker = '💥 RICOCHET RATÉ';
    headlineText = `<span class="cinte-who shooter">${shooter}</span> se tire dans le pied <span class="cinte-pop">💥</span>`;
  } else if (kind === 'good') {
    kicker = '🎯 BONNE RÉPONSE';
    headlineText = `<span class="cinte-who shooter">${shooter}</span> trouve la bonne cible !`;
  } else if (kind === 'survivor') {
    kicker = '🏆 DERNIER DEBOUT';
    headlineText = `<span class="cinte-who shooter">${shooter}</span> remporte le round !`;
  } else if (kind === 'timeout') {
    kicker = '⏱️ TEMPS ÉCOULÉ';
    headlineText = `Personne n'a appuyé sur la gâchette !`;
  } else {
    kicker = '🎯 ROUND';
    headlineText = msg.split('\n')[0] || 'Round en cours…';
  }

  const answerHtml = q ? `<div class="cinte-answer">
    <div class="cinte-answer-label">BONNE RÉPONSE</div>
    <div class="cinte-answer-value">${q.a[q.c]}</div>
  </div>` : '';

  // Target rows
  const rows = gs.players.map((p, i) => {
    const av = avFor(p);
    const tc = av.bg;
    const b = balloons[i] || 0;
    const isShooter = (p === shooter) && kind !== 'self' && kind !== 'survivor';
    const isVictim  = (p === victim)  && (kind === 'hit' || kind === 'self');
    const isDead = (roundElim.includes(p) || b <= 0) && !isVictim;
    const isPickable = (kind === 'picking') && !isShooter && !isDead;
    // Pour la victime : on affiche aussi le ballon qui explose (b + 1)
    const totalBalloons = isVictim ? b + 1 : b;

    let balloonsHtml;
    if (totalBalloons > 0) {
      balloonsHtml = Array.from({length: totalBalloons}, (_, j) => {
        const popped = isVictim && j === totalBalloons - 1;
        return `<span class="cinte-balloon${popped ? ' popped' : ''}" style="animation-delay:${j*.18}s">🎈</span>`;
      }).join('');
    } else {
      balloonsHtml = `<span class="cinte-balloon-empty"></span>`;
    }

    const countHtml = b > 0
      ? `<span class="cinte-bcount"><b>${b}</b>ballon${b>1?'s':''} restant${b>1?'s':''}</span>`
      : `<span class="cinte-bcount dead">💀 éliminé(e)</span>`;

    let badge = '';
    if (isShooter && kind === 'picking') badge = `<div class="cinte-tag shooter">🎯 TIREUR</div>`;
    else if (isPickable) badge = `<div class="cinte-tag pickable"><span class="cinte-tag-dot"></span> CIBLE ?</div>`;
    else if (isShooter && kind === 'hit') badge = `<div class="cinte-tag shooter">▶ TIREUR</div>`;
    else if (isShooter && kind === 'good') badge = `<div class="cinte-tag shooter">▶ TIREUR</div>`;
    else if (isShooter && kind === 'survivor') badge = `<div class="cinte-tag victim">🏆 SURVIVANT</div>`;
    else if (isVictim) badge = `<div class="cinte-tag victim">⚠ -1 BALLON</div>`;
    else if (isDead) badge = `<div class="cinte-tag dead">💀 ÉLIMINÉ(E)</div>`;

    const cls = [
      'cinte-target',
      isVictim ? 'hit' : '',
      isShooter ? 'is-shooter' : '',
      isPickable ? 'is-pickable' : '',
      isDead ? 'dead' : ''
    ].filter(Boolean).join(' ');

    return `<div class="${cls}" style="--tc:${tc};animation-delay:${i*.06}s">
      ${badge}
      <div class="cinte-avwrap"><img class="cinte-av" src="${AVATAR_PATH}${av.file}" alt=""></div>
      <div class="cinte-info">
        <div class="cinte-name">${p}</div>
        <div class="cinte-balloons">${balloonsHtml}${countHtml}</div>
      </div>
      <div class="cinte-fire"><span class="cinte-fire-dot"></span></div>
    </div>`;
  }).join('');

  const content = `
    <div class="cinte-wrap" style="--shooter-c:${shooterC};--victim-c:${victimC}">
      <div class="cinte-chip"><span class="cinte-crosshair"></span> TIR À LA CARABINE</div>
      <div class="cinte-headline">
        <div class="cinte-emblem"><span class="cinte-emblem-dot"></span></div>
        <div class="cinte-headline-body">
          <div class="cinte-kicker">${kicker}</div>
          <div class="cinte-headline-text">${headlineText}</div>
        </div>
        ${answerHtml}
      </div>
      <div class="cinte-targets">${rows}</div>
    </div>
  `;

  _interLayout(room, gs, content);
}
