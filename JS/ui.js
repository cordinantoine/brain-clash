/* ════════════════════════════════════════════
   ui.js — BRAIN CLASH
   Contient : tout ce qui s'affiche à l'écran
     - setBG      → change le thème visuel
     - Home       → écran d'accueil
     - Create     → création de partie (3 étapes)
     - Join       → rejoindre une partie
     - Lobby      → salle d'attente (hôte)
     - Wait       → salle d'attente (joueur)
     - drawLoading → écran de chargement
     - drawIntro  → annonce d'un round + ready + countdown
     - drawQ      → écran de question
     - drawScore  → tableau des scores

   Dépend de : config.js, firebase.js, game.js
   ════════════════════════════════════════════ */

// ════════════════════════════════════════════
//  AUDIO — Web Audio API
// ════════════════════════════════════════════
const _AC = (() => { try { return new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return null; } })();

function _beep(freq, type, dur, vol, delay=0) {
  if (!_AC) return;
  const o = _AC.createOscillator();
  const g = _AC.createGain();
  o.connect(g); g.connect(_AC.destination);
  o.type = type; o.frequency.value = freq;
  const t = _AC.currentTime + delay;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t); o.stop(t + dur);
}

const SFX = {
  // Bip de timer : tick grave toutes les secondes
  tick() { _beep(440, 'sine', 0.08, 0.15); },
  tickUrgent() { _beep(880, 'sine', 0.06, 0.2); },

  // Bonne réponse : accord montant joyeux + ding final
  correct() {
    _beep(659, 'sine', 0.12, 0.3, 0.00);
    _beep(784, 'sine', 0.12, 0.3, 0.08);
    _beep(1047,'sine', 0.12, 0.4, 0.16);
    _beep(1318,'sine', 0.4, 0.5, 0.28);
  },

  // Mauvaise réponse : buzzer grave + chute
  wrong() {
    _beep(800, 'square', 0.08, 0.35, 0.00);
    _beep(200, 'sawtooth', 0.2, 0.4,  0.10);
    _beep(120, 'square',   0.3, 0.25, 0.32);
  },

  // Buzz : son court percutant
  buzz() {
    _beep(880, 'square', 0.06, 0.4, 0.00);
    _beep(660, 'square', 0.08, 0.3, 0.07);
  },

  // Countdown GO
  go() {
    _beep(523, 'sine', 0.1, 0.3, 0.0);
    _beep(784, 'sine', 0.1, 0.3, 0.1);
    _beep(1047,'sine', 0.3, 0.5, 0.2);
  },
};

// Déverrouiller l'AudioContext au premier clic
document.addEventListener('click', () => { if (_AC && _AC.state === 'suspended') _AC.resume(); }, { once: true });

// RAF id du timer hôte en cours — annulé à chaque nouvelle question
let _timerRafId = null;

// ── Helpers DOM ──
const A   = document.getElementById("app");
const $   = id => document.getElementById(id);
const on  = (id, ev, fn) => { const e = $(id); if (e) e.addEventListener(ev, fn); };
const val = id => $(id)?.value || "";
const set = (id, t) => { const e = $(id); if (e) e.textContent = t; };
function R(h) { A.innerHTML = h; }


// ── Change le thème visuel (3D + étoiles CSS) ──
function setBG(tid) {
  const t = THEMES[tid] || THEMES.culture;
  const bg = document.getElementById("bg");
  bg.innerHTML = "";
  if (t.stars) for (let i = 0; i < 35; i++) {
    const s = document.createElement("div"), sz = Math.random()*2+.4;
    s.style.cssText = `position:absolute;border-radius:50%;background:white;width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation:twinkle ${Math.random()*3+2}s ease-in-out ${Math.random()*5}s infinite;opacity:.25`;
    bg.appendChild(s);
  }
}

// ════════════════════════════════════════════
//  ÉCRAN D'ACCUEIL
// ════════════════════════════════════════════
function Home() {
  setBG("culture");
  R(`<div class="sc"><div class="float" style="text-align:center;margin-bottom:10px"><div style="font-size:4.5rem">🧠</div><p style="color:rgba(255,255,255,.42);font-size:.8rem;letter-spacing:.25em;font-weight:600;margin-top:5px">LE JEU DE QUIZ ULTIME</p></div><div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:300px"><button class="btn" id="bC" style="background:linear-gradient(135deg,#7c3aed,#a78bfa);color:white;width:100%;padding:16px">🏠 Créer une partie</button><button class="btn" id="bJ" style="background:linear-gradient(135deg,#0891b2,#22d3ee);color:white;width:100%;padding:16px">🚪 Rejoindre une partie</button></div><p style="color:rgba(255,255,255,.18);font-size:.7rem">Multi-appareils · 9 thèmes · 250 questions</p></div>`);
  on("bC","click",()=>{ Create(1); });
  on("bJ","click",()=>{ Join(); });
}

// ════════════════════════════════════════════
//  CRÉATION DE PARTIE (3 étapes)
// ════════════════════════════════════════════
function Create(step) {
  const t = THEMES[CD.themes[0]] || THEMES.culture;
  setBG(CD.themes[0] || "culture");

  if (step === 1) {
    R(`<div class="sc"><div class="glass su" style="width:100%;max-width:380px;padding:24px 20px"><button id="bBk" style="background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:.8rem;margin-bottom:16px">← Retour</button><h2 style="font-family:'Playfair Display',serif;font-size:1.5rem;margin-bottom:3px">Créer une partie</h2><p style="color:rgba(255,255,255,.38);margin-bottom:4px;font-size:.8rem">Étape 1/3</p><p style="color:rgba(255,255,255,.22);margin-bottom:18px;font-size:.72rem">📺 Cet écran sera le plateau du jeu. Les joueurs rejoignent sur leur téléphone.</p><label style="color:rgba(255,255,255,.5);font-size:.75rem;font-weight:600;margin-bottom:7px;display:block">Nombre max de joueurs</label><div id="mpGrid" style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:20px"></div><button class="btn" id="bNx" style="width:100%;padding:13px;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:white">Suivant →</button></div></div>`);
    function renderMpGrid() {
      const grid = $("mpGrid"); if (!grid) return;
      grid.innerHTML = [2,3,4,5,6,7,8].map(n => `<button class="btn mpBtn" data-n="${n}" style="width:38px;height:38px;border-radius:9px;padding:0;font-size:.9rem;color:white;background:${CD.maxP===n?"rgba(167,139,250,.25)":"transparent"};border:2px solid ${CD.maxP===n?"#a78bfa":"rgba(255,255,255,.14)"}">${n}</button>`).join("");
      grid.querySelectorAll(".mpBtn").forEach(b => b.addEventListener("click",()=>{ CD.maxP=+b.dataset.n; renderMpGrid(); }));
    }
    renderMpGrid();
    on("bBk","click",()=>{ CD={name:"",maxP:4,themes:[],rounds:[],cartonBallons:3}; Home(); });
    on("bNx","click",()=>{ Create(2); });

  } else if (step === 2) {
    const g = Object.values(THEMES).map(th => `<div class="tbtn glass" data-tid="${th.id}" style="padding:11px 6px;text-align:center;border-radius:13px;border:2px solid ${CD.themes.includes(th.id)?th.accent:"rgba(255,255,255,.07)"};background:${CD.themes.includes(th.id)?th.accent+"22":"rgba(255,255,255,.02)"};cursor:pointer;position:relative">${CD.themes.includes(th.id)?`<div style="position:absolute;top:4px;right:4px;width:14px;height:14px;border-radius:50%;background:#22c55e;display:flex;align-items:center;justify-content:center;font-size:.55rem">✓</div>`:""}<div style="font-size:1.4rem">${th.emoji}</div><div style="font-size:.58rem;font-weight:700;line-height:1.2;color:rgba(255,255,255,.7);margin-top:3px">${th.name}</div></div>`).join("");
    const canNext = CD.themes.length > 0;
    const ac = CD.themes.length ? THEMES[CD.themes[0]].accent : "#a78bfa";
    const dk = CD.themes.length ? THEMES[CD.themes[0]].dark : "#7c3aed";
    R(`<div class="sc"><div class="glass su" style="width:100%;max-width:420px;padding:24px 20px;max-height:92vh;overflow-y:auto"><button id="bBk" style="background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:.8rem;margin-bottom:16px">← Retour</button><h2 style="font-family:'Playfair Display',serif;font-size:1.5rem;margin-bottom:3px">Choisir les thèmes</h2><p style="color:rgba(255,255,255,.38);margin-bottom:4px;font-size:.8rem">Étape 2/3</p><p style="color:rgba(255,255,255,.25);margin-bottom:14px;font-size:.72rem">${CD.themes.length===0?"Aucun thème sélectionné":CD.themes.length===1?"1 thème sélectionné":CD.themes.length+" thèmes sélectionnés"}</p><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:18px">${g}</div><button class="btn" id="bNx" style="width:100%;padding:13px;color:white;background:${canNext?`linear-gradient(135deg,${dk},${ac})`:"rgba(255,255,255,.1)"}" ${canNext?"":"disabled"}>Suivant →</button></div></div>`);
    on("bBk","click",()=>Create(1));
    on("bNx","click",()=>{ if(CD.themes.length) Create(3); });
    document.querySelectorAll(".tbtn").forEach(b => b.addEventListener("click",()=>{
      const tid = b.dataset.tid;
      CD.themes = CD.themes.includes(tid) ? CD.themes.filter(x=>x!==tid) : [...CD.themes,tid];
      if (CD.themes.length) setBG(CD.themes[0]);
      Create(2);
    }));

  } else {
    const ri = RT.map(r => `<div class="rbtn glass" data-rid="${r.id}" style="padding:10px 12px;cursor:pointer;border:2px solid ${CD.rounds.includes(r.id)?t.accent:"rgba(255,255,255,.07)"};background:${CD.rounds.includes(r.id)?t.accent+"14":"rgba(255,255,255,.02)"};display:flex;align-items:center;gap:10px;margin-bottom:8px;border-radius:13px"><span style="font-size:1.05rem">${r.icon}</span><div style="flex:1"><div style="font-weight:600;font-size:.82rem">${r.name}</div><div style="color:rgba(255,255,255,.33);font-size:.67rem">${r.desc}</div></div><div style="width:14px;height:14px;border-radius:50%;border:2px solid ${CD.rounds.includes(r.id)?t.accent:"rgba(255,255,255,.2)"};background:${CD.rounds.includes(r.id)?t.accent:"transparent"};flex-shrink:0"></div></div>`).join("");
    // Balloon selector (1-5) shown only when carton is selected
    const bp = CD.rounds.includes("carton") ? `<div style="padding:11px 13px;border-radius:11px;background:rgba(96,165,250,.08);border:1px solid rgba(96,165,250,.22);margin-bottom:14px"><label style="color:rgba(255,255,255,.6);font-size:.75rem;font-weight:600;display:block;margin-bottom:7px">🎈 Ballons par joueur (Tir à la Carabine)</label><div style="display:flex;gap:7px">${[1,2,3,4,5].map(n=>`<button class="btn bb" data-n="${n}" style="width:38px;height:38px;border-radius:9px;padding:0;font-size:.9rem;color:white;background:${CD.cartonBallons===n?"rgba(96,165,250,.28)":"transparent"};border:2px solid ${CD.cartonBallons===n?"#60a5fa":"rgba(255,255,255,.14)"}">${n}</button>`).join("")}</div></div>` : "";
    R(`<div class="sc"><div class="glass su" style="width:100%;max-width:420px;padding:24px 20px;max-height:92vh;overflow-y:auto"><button id="bBk" style="background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:.8rem;margin-bottom:16px">← Retour</button><h2 style="font-family:'Playfair Display',serif;font-size:1.5rem;margin-bottom:3px">Rounds de jeu</h2><p style="color:rgba(255,255,255,.38);margin-bottom:14px;font-size:.8rem">Étape 3/3</p>${ri}${bp}<button class="btn" id="bCr" style="width:100%;padding:13px;color:white;background:${CD.rounds.length?`linear-gradient(135deg,${t.dark},${t.accent})`:"rgba(255,255,255,.1)"}" ${CD.rounds.length?"":"disabled"}>🚀 Créer la salle</button></div></div>`);
    on("bBk","click",()=>Create(2));
    on("bCr","click",doCreate);
    document.querySelectorAll(".rbtn").forEach(b => b.addEventListener("click",()=>{ const id=b.dataset.rid; CD.rounds=CD.rounds.includes(id)?CD.rounds.filter(r=>r!==id):[...CD.rounds,id]; Create(3); }));
    document.querySelectorAll(".bb").forEach(b => b.addEventListener("click",()=>{ CD.cartonBallons=+b.dataset.n; Create(3); }));
  }
}

async function doCreate() {
  cleanOldRooms();
  const themes = CD.themes.length ? CD.themes : ["culture"];
  // Sort rounds to match RT display order
  const rtOrder = RT.map(r => r.id);
  CD.rounds.sort((a, b) => rtOrder.indexOf(a) - rtOrder.indexOf(b));
  const code   = genCode();
  const room = {
    code, phase:"lobby",
    theme:themes[0], themes,
    rounds:CD.rounds, cartonBallons:CD.cartonBallons||3,
    maxP:CD.maxP,
    players:[],
    hostName:CD.name,
    ts:Date.now()
  };
  if (!await fs(`rooms/${code}`, room)) { alert("Erreur Firebase."); return; }
  ME = ""; CODE = code; HOST = true;
  Lobby(room);
}

// ════════════════════════════════════════════
//  REJOINDRE UNE PARTIE
// ════════════════════════════════════════════
function Join() {
  const pathParts = window.location.pathname.split('/');
  pathParts[pathParts.length - 1] = 'player.html';
  window.location.href = window.location.origin + pathParts.join('/');
}

async function doJoin() {
  const name = val("iN").trim(), code = val("iC").trim().toUpperCase();
  const err  = m => { const e=$("eMsg"); e.textContent=m; e.style.display="block"; };
  if (!name) { err("Entrez votre prénom"); return; }
  if (code.length !== 5) { err("Le code fait 5 caractères"); return; }
  $("bJ").textContent="⏳…"; $("bJ").disabled=true;
  const room = await fg(`rooms/${code}`);
  if (!room) { err(`Salle "${code}" introuvable.`); $("bJ").textContent="🚪 Rejoindre"; $("bJ").disabled=false; return; }
  if (room.phase !== "lobby") { err("Partie déjà commencée !"); $("bJ").textContent="🚪 Rejoindre"; $("bJ").disabled=false; return; }
  if (toArr(room.players).length >= room.maxP) { err("Salle pleine !"); $("bJ").textContent="🚪 Rejoindre"; $("bJ").disabled=false; return; }
  const existingPlayers = toArr(room.players);
  await fs(`rooms/${code}/players`, [...existingPlayers, {name,isHost:false}]);
  ME=name; CODE=code; HOST=false;
  Wait({...room, players:[...room.players,{name,isHost:false}]});
}

// ════════════════════════════════════════════
//  LOBBY (hôte) ET ATTENTE (joueur)
// ════════════════════════════════════════════
function Lobby(room) {
  const t   = THEMES[room.theme] || THEMES.culture;
  setBG(room.theme);

  const pathParts = window.location.pathname.split('/');
  pathParts[pathParts.length - 1] = 'player.html';
  const playerUrl = window.location.origin + pathParts.join('/');
  const inv = `🧠 BRAIN CLASH\n\nRejoins ma partie !\nThèmes : ${(room.themes||[room.theme]).map(tid=>(THEMES[tid]||THEMES.culture).emoji+" "+(THEMES[tid]||THEMES.culture).name).join(", ")}\nCode : ${room.code}\n\n👉 Ouvre ce lien sur ton téléphone :\n${playerUrl}\nPuis entre le code : ${room.code}`;

  function draw(cur) {
    const rows = toArr(cur.players).map((p,i)=>`<div style="display:flex;align-items:center;gap:9px;padding:7px 11px;border-radius:10px;background:rgba(255,255,255,.04)"><div style="width:26px;height:26px;border-radius:50%;background:${COL[i%8].bg};display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700">${i+1}</div><span style="font-weight:600;font-size:.88rem">${p.name}</span></div>`).join("");
    const can = toArr(cur.players).length >= 1;
    R(`<div class="sc"><div class="float" style="text-align:center"><div style="font-size:2.5rem">📺</div><h2 style="font-family:'Playfair Display',serif;font-size:1.6rem;margin-top:4px">Écran principal</h2><p style="color:rgba(255,255,255,.38);font-size:.76rem;margin-top:3px">Cet écran est le plateau du jeu</p></div><div class="glass" style="padding:17px 19px;text-align:center;max-width:370px;width:100%"><p style="color:rgba(255,255,255,.42);font-size:.76rem;margin-bottom:6px">Code de la salle</p><div style="font-family:'Orbitron',sans-serif;font-size:2.4rem;font-weight:900;color:${t.accent};animation:roomGlow 2s ease-in-out infinite">${room.code}</div><p style="color:rgba(255,255,255,.28);font-size:.68rem;margin-top:5px;margin-bottom:13px">${(room.themes||[room.theme]).map(tid=>(THEMES[tid]||THEMES.culture).emoji).join(" ")} · ${room.rounds.map(r=>RT.find(x=>x.id===r)?.icon||"").join(" ")}</p><div style="background:rgba(0,0,0,.25);border-radius:11px;padding:11px 13px;text-align:left;border:1px solid rgba(255,255,255,.09);margin-bottom:9px;font-size:.78rem;line-height:1.75;white-space:pre-wrap;user-select:all">${inv}</div><button class="btn" id="bCp" style="width:100%;padding:11px;background:linear-gradient(135deg,${t.dark},${t.accent});color:white;border-radius:13px;font-size:.85rem">📋 Copier le lien d'invitation</button></div><div class="glass" style="padding:14px 16px;max-width:370px;width:100%"><p style="color:rgba(255,255,255,.48);font-size:.75rem;font-weight:600;margin-bottom:8px">JOUEURS (${toArr(cur.players).length}/${room.maxP})</p><div>${rows}${toArr(cur.players).length<room.maxP?`<div style="padding:7px 11px;border-radius:10px;border:1px dashed rgba(255,255,255,.11);color:rgba(255,255,255,.2);font-size:.76rem;text-align:center">En attente de joueurs…</div>`:""}</div></div><div style="display:flex;gap:10px;width:100%;max-width:370px"><button class="btn" id="bCn" style="background:rgba(255,255,255,.07);color:white;padding:12px;flex:1;font-size:.84rem">✕ Annuler</button><button class="btn" id="bLn" style="padding:12px;flex:2;font-size:.88rem;color:white;background:${can?`linear-gradient(135deg,${t.dark},${t.accent})`:"rgba(255,255,255,.1)"}" ${can?"":"disabled"}>${can?"🚀 Lancer !":"Attendez des joueurs"}</button></div></div>`);
    on("bCn","click",async()=>{ if(STOP)STOP(); await fd(`rooms/${room.code}`); CD={name:"",maxP:4,themes:[],rounds:[],cartonBallons:3}; Home(); });
    on("bLn","click",doLaunch);
    on("bCp","click",()=>{ navigator.clipboard.writeText(inv).then(()=>{set("bCp","✅ Copié !");setTimeout(()=>set("bCp","📋 Copier le lien d'invitation"),2500);}).catch(()=>{}); });
  }
  draw(room);
  if (STOP) STOP();
  STOP = (() => {
    let active = true;
    const poll = async () => {
      if (!active) return;
      const cur = await fg(`rooms/${room.code}`);
      if (cur && active) draw(cur);
      if (active) setTimeout(poll, 2000);
    };
    poll();
    return () => { active = false; };
  })();
}

async function doLaunch() {
  if (STOP) { STOP(); STOP=null; }
  await fp(`rooms/${CODE}`, {phase:"loading",questionsReady:false});
  const r = await fg(`rooms/${CODE}`);
  if (r) drawLoading(r);
  await hostLoadQ();
}

function Wait(room) {
  const t = THEMES[room.theme] || THEMES.culture;
  setBG(room.theme);
  function draw(cur) {
    const rows = toArr(cur.players).map((p,i)=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:9px;background:rgba(255,255,255,.04)"><div style="width:22px;height:22px;border-radius:50%;background:${COL[i%8].bg};flex-shrink:0"></div><span style="font-size:.84rem;font-weight:600">${p.name}</span>${p.isHost?`<span style="margin-left:auto;font-size:.62rem;color:${t.accent};font-weight:700">HÔTE</span>`:""}</div>`).join("");
    R(`<div class="sc"><div class="float" style="text-align:center"><div style="font-size:2.8rem">⏳</div><h2 style="font-family:'Playfair Display',serif;font-size:1.6rem;margin-top:4px">En attente…</h2><p style="color:rgba(255,255,255,.42);margin-top:3px;font-size:.84rem">L'hôte n'a pas encore lancé</p></div><div class="glass" style="padding:17px 19px;text-align:center;max-width:320px;width:100%"><p style="color:${t.accent};font-weight:700;margin-bottom:4px">Code : ${room.code}</p><p style="color:rgba(255,255,255,.48);font-size:.82rem">Vous jouez en tant que <strong>${ME}</strong></p><div style="margin-top:12px;display:grid;gap:6px">${rows}</div></div><button class="btn" id="bLv" style="background:rgba(255,255,255,.07);color:white;padding:11px 24px;font-size:.84rem">Quitter</button></div>`);
    on("bLv","click",()=>{ if(STOP)STOP(); Home(); });
  }
  draw(room);
  if (STOP) STOP();
  STOP = fl(`rooms/${room.code}`, cur => {
    if (!cur) return;
    if (cur.phase === "loading") { drawLoading(cur); return; }
    if (cur.phase !== "lobby" && cur.questionsReady) { if(STOP){STOP();STOP=null;} Watch(cur); return; }
    draw(cur);
  });
}

// ════════════════════════════════════════════
//  ÉCRANS DE JEU
// ════════════════════════════════════════════
function drawLoading(room) {
  const t = THEMES[room.theme] || THEMES.culture;
  setBG(room.theme || "culture");
  R(`<div class="sc"><div class="float" style="font-size:4rem">${t.emoji}</div><h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;text-align:center">${t.name}</h2><div style="position:relative;width:58px;height:58px"><svg width="58" height="58" style="transform:rotate(-90deg);animation:spinArc 1.2s linear infinite;position:absolute"><circle cx="29" cy="29" r="23" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="5"/><circle cx="29" cy="29" r="23" fill="none" stroke="${t.accent}" stroke-width="5" stroke-dasharray="144.5" stroke-linecap="round"/></svg></div><p style="color:rgba(255,255,255,.42);font-size:.88rem">Chargement des questions…</p></div>`);
}

function drawIntro(room, gs) {
  const t     = THEMES[room.theme] || THEMES.culture;
  const rType = room.rounds[gs.roundIdx||0];
  const r     = RT.find(x => x.id === rType) || RT[0];
  // Check if countdown is active
  if (gs.countdownStart) {
    const _cdRender = () => {
      const elapsed = Math.round((Date.now() - gs.countdownStart) / 1000);
      const num = 3 - elapsed;
      if (num > 0) {
        R(`<div class="countdown-overlay"><div class="countdown-number" key="${num}" style="color:${t.accent}">${num}</div></div><div class="countdown-flash"></div>`);
      } else {
        R(`<div class="countdown-overlay"><div class="countdown-go" style="color:${t.accent}">GO!</div></div>`);
      }
    };
    _cdRender();
    // Re-render every second for 2, 1, GO
    setTimeout(_cdRender, 1000);
    setTimeout(_cdRender, 2000);
    setTimeout(_cdRender, 3000);
    return;
  }

  // Ready screen with player checkboxes
  const readyMap = gs.ready || {};
  const players = gs.players || [];
  const readyCount = Object.keys(readyMap).length;
  const allReady = readyCount >= players.length;

  const _roomPs = toArr(room.players);
  const playerGrid = players.map((p, i) => {
    const isReady = !!readyMap[p];
    const rp = _roomPs.find(x => x.name === p);
    const avIdx = (rp && rp.avatar !== undefined) ? rp.avatar : (i % AVATARS.length);
    const av = AVATARS[avIdx] || AVATARS[0];
    return `<div class="ready-player ${isReady?'is-ready':''}">
      <img src="${AVATAR_PATH}${av.file}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;object-position:center top;flex-shrink:0;border:2px solid ${av.bg};box-shadow:0 0 8px ${av.bg}66" alt="">
      <span style="font-weight:600;font-size:.85rem;flex:1;color:${isReady?'#86efac':'rgba(255,255,255,.55)'}">${p}</span>
      <div class="ready-check">${isReady?'✓':''}</div>
    </div>`;
  }).join("");

  R(`<div class="sc">
    <p style="color:rgba(255,255,255,.4);font-size:.85rem;font-weight:800;letter-spacing:.25em">ROUND ${(gs.roundIdx||0)+1} / ${room.rounds.length}</p>
    <div class="pop" style="font-size:7rem">${r.icon}</div>
    <h2 style="font-family:'Playfair Display',serif;font-size:clamp(2.6rem,7vw,4.2rem);text-align:center;text-shadow:0 0 48px ${t.accent};margin:0">${r.name}</h2>
    <p style="color:rgba(255,255,255,.72);text-align:center;max-width:680px;line-height:1.7;font-size:clamp(1.1rem,2.5vw,1.5rem);font-weight:500;padding:0 16px">${r.desc}</p>
    <div class="ready-grid" style="margin-top:18px">${playerGrid}</div>
    <p style="color:rgba(255,255,255,.35);font-size:.82rem;margin-top:6px">${allReady?"Tous prêts ! Lancement…":`${readyCount}/${players.length} prêts`}</p>
  </div>`);
}

function drawQ_optimistic(gs) {
  fg(`rooms/${CODE}`).then(room => { if (!room) return; drawQ(room, {...gs, buzzed:ME}); });
}

function drawQ(room, gs) {
  const t     = THEMES[room.theme] || THEMES.culture;
  const rType = room.rounds[gs.roundIdx];
  const r     = RT.find(x => x.id === rType) || RT[0];
  const q     = (gs.rQs||{})[gs.roundIdx]?.[gs.qIdx];
  if (!q) return;

  const amElim    = (gs.roundElim||[]).includes(ME);
  const iHavePatate = rType==="patate" && gs.patateHolder===ME;
  const amOut     = (gs.buzzedOut||[]).includes(ME);
  const amBuzzer  = gs.buzzed===ME || (I_BUZZED && !gs.buzzed);
  const myAns     = (gs.answers||{})[ME];
  const myAnswered = myAns !== undefined;
  const myAnsIdx  = myAns?.ansIdx;

  const aHtml = q.a.map((a,i)=>{
    let cls = "";
    if (gs.revealed) { if(i===q.c) cls=" ok"; else if(i===myAnsIdx) cls=" no"; else cls=" dim"; }
    const noNeedBuzz = rType==="chrono"||rType==="qcm";
    const canClick   = !gs.revealed&&!amElim&&!amOut&&!myAnswered&&(noNeedBuzz||(rType==="patate"?iHavePatate:amBuzzer))&&!gs.pickTarget;
    return `<button class="ab${cls}" ${canClick?"":"disabled"} onclick="${canClick?`G.ans(${i})`:""}""><span class="lbl">${LB[i]}</span><span style="flex:1">${a}</span>${gs.revealed&&i===q.c?"<span>✅</span>":""}${gs.revealed&&i===myAnsIdx&&i!==q.c?"<span>❌</span>":""}</button>`;
  }).join("");

  let act = "";
  if (gs.pickTarget && amBuzzer) {
    const elig       = gs.players.filter(p=>p!==ME&&!(gs.roundElim||[]).includes(p));
    const pickLabel  = rType==="steal"?"😈 Choisissez à qui voler !":rType==="carton"?"🎯 Sur qui tirer ?":"Choisissez une cible !";
    const balloons   = gs.balloons||gs.players.map(()=>3);
    act = `<div class="glass fi" style="padding:15px;border-radius:15px"><p style="font-weight:700;text-align:center;margin-bottom:10px;font-size:.9rem">${pickLabel}</p>${elig.map(p=>{ const pi=gs.players.indexOf(p); const info=rType==="carton"?`${"🎈".repeat(balloons[pi])} (${balloons[pi]})`:`${gs.scores[pi]} pts`; return `<button class="btn" onclick="G.pick('${p}')" style="width:100%;padding:11px 14px;border-radius:13px;background:${COL[pi%8].bg+"33"};border:2px solid ${COL[pi%8].bg+"88"};color:white;justify-content:space-between;margin-bottom:8px;font-size:.88rem"><span>${p}</span><span style="font-size:.8rem;color:${t.accent}">${info}</span></button>`; }).join("")}</div>`;
  } else if ((rType==="chrono"||rType==="qcm") && myAnswered && !gs.revealed) {
    act = `<div style="padding:11px 14px;border-radius:11px;background:rgba(34,197,94,.14);border:1px solid rgba(34,197,94,.28);text-align:center;color:#86efac;font-weight:600;font-size:.84rem">✅ Réponse envoyée — En attente des autres…</div>`;
  } else if (!gs.revealed && !gs.pickTarget) {
    if (rType==="patate") { if(iHavePatate){ act=`<div style="padding:13px 16px;border-radius:13px;background:rgba(251,146,60,.2);border:2px solid rgba(251,146,60,.6);text-align:center;font-weight:700;font-size:.95rem;animation:buzzPulse 0.8s ease-in-out infinite">🥔 VOUS AVEZ LA PATATE !<br><span style="font-size:.78rem;font-weight:500;color:rgba(255,255,255,.7)">Répondez juste pour la passer !</span></div>`; } else if(gs.patateHolder){ act=`<div style="padding:11px 14px;border-radius:11px;background:rgba(251,146,60,.08);border:1px solid rgba(251,146,60,.25);text-align:center;font-size:.86rem;color:rgba(255,255,255,.6)">🥔 <strong style="color:#fb923c">${gs.patateHolder}</strong> a la patate… ⏳</div>`; } }
    else if (amElim)  { act=`<div style="padding:11px;text-align:center;color:rgba(255,255,255,.3);font-size:.82rem;background:rgba(239,68,68,.08);border-radius:11px">💀 Éliminé(e) de cette manche</div>`; }
    else if (amOut)   { act=`<div style="padding:11px;text-align:center;color:rgba(255,255,255,.3);font-size:.82rem;background:rgba(239,68,68,.06);border-radius:11px">❌ Vous avez déjà tenté votre chance</div>`; }
    else if (!gs.buzzed) { act=`<button class="btn" onclick="G.buzz()" style="width:100%;padding:20px;border-radius:15px;background:${COL[gs.players.indexOf(ME)%8]?.bg||"#7c3aed"};color:white;font-size:1.1rem;animation:buzzPulse 2s ease-in-out infinite;box-shadow:0 4px 22px ${COL[gs.players.indexOf(ME)%8]?.gw||"#7c3aed55"}">🔔 BUZZER !</button>`; }
    else if (amBuzzer){ act=`<div style="padding:9px 13px;border-radius:11px;background:${COL[gs.players.indexOf(ME)%8]?.bg||"#7c3aed"}2a;text-align:center;font-weight:700;font-size:.86rem">🔔 C'est votre tour ! Répondez vite ! (3s)</div>`; }
    else { const bI=gs.players.indexOf(gs.buzzed); act=`<div style="padding:11px 14px;border-radius:11px;background:${COL[bI%8].bg}22;border:2px solid ${COL[bI%8].bg}88;text-align:center;font-size:.9rem;font-weight:700">🔔 <strong style="color:${COL[bI%8].bg}">${gs.buzzed}</strong> répond… (3s)</div>`; }
  }

  let buzzInd = "";
  if (rType!=="chrono" && gs.buzzed && !amBuzzer && !gs.revealed && !gs.pickTarget) { const bI=gs.players.indexOf(gs.buzzed); buzzInd=`<div style="padding:8px 13px;border-radius:11px;background:${COL[bI%8].bg}22;border:2px solid ${COL[bI%8].bg}66;text-align:center;font-size:.88rem;font-weight:700;margin-bottom:8px">🔔 <strong style="color:${COL[bI%8].bg}">${gs.buzzed}</strong> a pris la main !</div>`; }

  let res = "";
  if (gs.result && !gs.pickTarget) { const isGood=(gs.result.pts||0)>0||gs.result.scorer; res=`<div class="glass fi" style="padding:11px 14px;border-radius:12px;border-color:${isGood?"rgba(34,197,94,.25)":"rgba(239,68,68,.25)"}"><div style="color:${isGood?"#86efac":"#fca5a5"};font-weight:700;font-size:.83rem;margin-bottom:${gs.revealed?"4px":"0"}">${gs.result.msg}</div>${gs.revealed?`<div style="color:rgba(255,255,255,.48);font-size:.74rem">💡 ${q.f||""}</div>`:""}</div>`; }

  let elimBar = "";
  if (rType==="patate") { elimBar=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;align-items:center"><span style="font-size:.7rem;color:rgba(255,255,255,.38);font-weight:600">🥔 Manche ${(gs.patateManche||0)+1}/4 :</span>${gs.players.map((p,i)=>{const h=p===gs.patateHolder;return`<div style="padding:4px 10px;border-radius:12px;font-size:.72rem;font-weight:700;background:${h?"rgba(251,146,60,.3)":COL[i%8].bg+"22"};color:${h?"#fb923c":"rgba(255,255,255,.5)"};border:${h?"2px solid rgba(251,146,60,.7)":"1px solid "+COL[i%8].bg+"33"};animation:${h?"buzzPulse 1s ease-in-out infinite":"none"}">${h?"🥔 ":""}${p}</div>`;}).join("")}</div>`; }
  else if (rType==="carton") { const balloons=gs.balloons||gs.players.map(()=>3); const eliminated=gs.roundElim||[]; elimBar=`<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">${gs.players.map((p,i)=>{const b=balloons[i]||0;const dead=eliminated.includes(p);return`<div style="padding:4px 10px;border-radius:12px;font-size:.72rem;font-weight:700;background:${dead?"rgba(239,68,68,.08)":b===0?"rgba(239,68,68,.2)":COL[i%8].bg+"22"};color:${dead?"rgba(255,255,255,.25)":"white"};border:1px solid ${dead?"rgba(239,68,68,.3)":b===0?"rgba(239,68,68,.5)":COL[i%8].bg+"33"};display:flex;align-items:center;gap:4px"><span style="text-decoration:${dead?"line-through":"none"}">${p}</span><span>${"🎈".repeat(b)}${dead?" 💀":""}</span></div>`;}).join("")}</div>`; }

  const sc = gs.players.map((p,i)=>`<div style="padding:3px 9px;border-radius:13px;font-size:.7rem;font-weight:700;background:${COL[i%8].bg}28;color:${p===ME?"white":"rgba(255,255,255,.65)"};border:1px solid ${COL[i%8].bg}44;${p===ME?"box-shadow:0 0 8px "+COL[i%8].bg+"44":""}">${p}: <strong>${gs.scores[i]}</strong></div>`).join("");

  let timerHtml = "";
  if (gs.timerStart && gs.timerDur && !gs.revealed && !gs.pickTarget && (!gs.buzzed||rType==="chrono")) {
    const elapsed=Math.min(gs.timerDur,(Date.now()-gs.timerStart)/1000); const tl=Math.max(0,Math.round(gs.timerDur-elapsed)); const col=tl<=5?"#ef4444":tl<=10?"#f59e0b":"#22c55e"; const dash=106.8*(1-tl/gs.timerDur);
    timerHtml=`<div style="position:relative;width:42px;height:42px;flex-shrink:0"><svg width="42" height="42" style="transform:rotate(-90deg);position:absolute"><circle cx="21" cy="21" r="17" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="4"/><circle cx="21" cy="21" r="17" fill="none" stroke="${col}" stroke-width="4" stroke-dasharray="106.8" stroke-dashoffset="${dash}" stroke-linecap="round" id="timerC"/></svg><div id="timerN" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.78rem;color:${tl<=5?"#ef4444":"white"}">${tl}</div></div>`;
    const tS=gs.timerStart, tD=gs.timerDur;
    function tickTimer(){ const e2=Math.min(tD,(Date.now()-tS)/1000),tl2=Math.max(0,Math.round(tD-e2)); const n=$("timerN"),c=$("timerC"); if(n){n.textContent=tl2;n.style.color=tl2<=5?"#ef4444":"white";} if(c){c.setAttribute("stroke-dashoffset",106.8*(1-tl2/tD));c.setAttribute("stroke",tl2<=5?"#ef4444":tl2<=10?"#f59e0b":"#22c55e");} if(tl2>0) requestAnimationFrame(tickTimer); }
    requestAnimationFrame(tickTimer);
  }

  const qTotal = (gs.rQs||{})[gs.roundIdx]?.length || 1;
  R(`<div class="sc" style="justify-content:flex-start;padding:14px;max-width:640px;margin:0 auto;padding-top:18px">
    <div style="display:flex;align-items:center;gap:9px;width:100%;margin-bottom:8px">
      <span style="color:rgba(255,255,255,.33);font-size:.72rem;font-weight:700;white-space:nowrap">${rType==="carton"?`🎯 Tir à la Carabine`:rType==="patate"?`🥔 Manche ${(gs.patateManche||0)+1}/4`:`Q${gs.qIdx+1}/${qTotal}`}</span>
      <div style="flex:1;height:5px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden"><div style="height:100%;width:${((gs.qIdx+1)/qTotal*100)}%;background:linear-gradient(90deg,${t.dark},${t.accent});border-radius:3px"></div></div>
      ${timerHtml}
    </div>
    <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:20px;background:rgba(255,255,255,.06);margin-bottom:10px"><span>${r.icon}</span><span style="color:rgba(255,255,255,.48);font-size:.7rem;font-weight:600">${r.name}</span></div>
    ${elimBar}
    <div class="glass pop" style="padding:20px 17px;border-radius:17px;width:100%;margin-bottom:12px"><p style="font-size:clamp(.9rem,3vw,1.1rem);font-weight:600;line-height:1.6;text-align:center">${q.q}</p></div>
    ${buzzInd}${aHtml}${act}${res}
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px">${sc}</div>
  </div>`);
  window.G = { buzz:actBuzz, ans:actAnswer, pick:actPick };
}

function drawScore(room, gs, isFinal) {
  const t = THEMES[room.theme] || THEMES.culture;
  const _rp    = toArr(room.players);
  const ranked = gs.players.map((p,i)=>{ const rpi=_rp.find(x=>x.name===p); const avIdx=(rpi&&rpi.avatar!==undefined)?rpi.avatar:(i%AVATARS.length); return {name:p,score:gs.scores[i],i,av:AVATARS[avIdx]||AVATARS[0]}; }).sort((a,b)=>b.score-a.score);
  const rows   = ranked.map((p,rank)=>`<div class="glass su" style="padding:12px 15px;display:flex;align-items:center;gap:11px;animation-delay:${rank*.07}s;border-radius:15px;border:2px solid ${p.av.bg}66;background:${p.av.bg}12;box-shadow:0 0 18px ${p.av.bg}33;${rank===0&&isFinal?`border-color:${t.accent};background:${t.accent}10;box-shadow:0 0 28px ${t.accent}55`:``}"><img src="${AVATAR_PATH}${p.av.file}" style="width:46px;height:46px;border-radius:50%;object-fit:cover;object-position:center top;flex-shrink:0;border:2px solid ${p.av.bg};box-shadow:0 0 10px ${p.av.bg}88" alt=""><div style="flex:1;font-weight:700;color:${p.name===ME?"white":"rgba(255,255,255,.8)"}">${p.name}${p.name===ME?" (vous)":""}</div><div style="font-size:1.1rem;flex-shrink:0">${isFinal?(rank===0?"🥇":rank===1?"🥈":rank===2?"🥉":"#"+(rank+1)):("#"+(rank+1))}</div><div style="font-weight:900;font-size:1.35rem;color:${p.av.bg};text-shadow:0 0 10px ${p.av.bg}99">${p.score}</div></div>`).join("");
  R(`<div class="sc" style="max-width:430px;margin:0 auto;padding:20px;gap:12px"><div class="float" style="text-align:center"><div style="font-size:3rem">${isFinal?"🏆":"📊"}</div><h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;margin-top:4px">${isFinal?"Victoire !":"Scores"}</h2>${isFinal?`<p style="color:${t.accent};font-weight:700;margin-top:3px">🎉 ${ranked[0].name} remporte la partie !</p>`:`<p style="color:rgba(255,255,255,.38);font-size:.82rem;margin-top:2px">Prochain round dans quelques secondes…</p>`}</div><div style="width:100%;display:flex;flex-direction:column;gap:8px">${rows}</div>${isFinal?`<button class="btn" id="bH" style="background:linear-gradient(135deg,${t.dark},${t.accent});color:white;padding:13px 28px">🏠 Retour à l'accueil</button>`:""}</div>`);
  if (isFinal) on("bH","click",()=>{ if(STOP)STOP(); if(HOST && CODE) fd(`rooms/${CODE}`); Home(); });
}

// ════════════════════════════════════════════
//  VUE PLATEAU TV (hôte uniquement)
// ════════════════════════════════════════════
function drawQ_host(room, gs) {
  const t     = THEMES[room.theme] || THEMES.culture;
  const rType = room.rounds[gs.roundIdx];
  const r     = RT.find(x => x.id === rType) || RT[0];
  const q     = (gs.rQs||{})[gs.roundIdx]?.[gs.qIdx];
  if (!q) return;

  // Annuler le RAF timer précédent
  if (_timerRafId) { cancelAnimationFrame(_timerRafId); _timerRafId = null; }

  const _wasRevealed = drawQ_host._lastRevealed;
  const _wasBuzzed   = drawQ_host._lastBuzzed;
  drawQ_host._lastRevealed = gs.revealed;
  drawQ_host._lastBuzzed   = gs.buzzed;

  // Sons
  if (gs.revealed && !_wasRevealed) {
    const isGood = !!gs.result?.scorer;
    isGood ? SFX.correct() : SFX.wrong();
  } else if (gs.buzzed && gs.buzzed !== _wasBuzzed) {
    SFX.buzz();
  }

  // Patate explosion
  if (rType === "patate" && gs.patateExplosion) {
    R(`<div class="sc"><div class="pop" style="font-size:8rem">💥</div><h2 style="font-family:'Playfair Display',serif;font-size:2rem;text-align:center;color:#f87171">${gs.result?.msg||'BOOM !'}</h2></div>`);
    return;
  }

  // Timer
  let timerHtml = "";
  if (rType !== "patate" && gs.timerStart && gs.timerDur && !gs.revealed && (!gs.buzzed||rType==="chrono")) {
    const elapsed = Math.min(gs.timerDur,(Date.now()-gs.timerStart)/1000);
    const tl = Math.max(0, Math.round(gs.timerDur-elapsed));
    const col = tl<=5?"#ef4444":tl<=10?"#f59e0b":"#22c55e";
    const dash = 131.9*(1-tl/gs.timerDur);
    timerHtml = `<div style="position:relative;width:58px;height:58px;flex-shrink:0"><svg width="58" height="58" style="transform:rotate(-90deg);position:absolute"><circle cx="29" cy="29" r="21" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="6"/><circle cx="29" cy="29" r="21" fill="none" stroke="${col}" stroke-width="6" stroke-dasharray="131.9" stroke-dashoffset="${dash}" stroke-linecap="round" id="timerC"/></svg><div id="timerN" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.1rem;color:${tl<=5?"#ef4444":"white"}">${tl}</div></div>`;
    const tS=gs.timerStart, tD=gs.timerDur;
    let _lastTick = -1;
    function tickTimer(){ const e2=Math.min(tD,(Date.now()-tS)/1000),tl2=Math.max(0,Math.round(tD-e2)); const n=$("timerN"),c=$("timerC"); if(n){n.textContent=tl2;n.style.color=tl2<=5?"#ef4444":"white";} if(c){c.setAttribute("stroke-dashoffset",131.9*(1-tl2/tD));c.setAttribute("stroke",tl2<=5?"#ef4444":tl2<=10?"#f59e0b":"#22c55e");} if(tl2>0){ if(tl2 !== _lastTick){ _lastTick=tl2; tl2<=5 ? SFX.tickUrgent() : SFX.tick(); } _timerRafId = requestAnimationFrame(tickTimer); } else { _timerRafId = null; } }
    _timerRafId = requestAnimationFrame(tickTimer);
  }

  // Elim / patate bar
  let elimBar = "";
  if (rType==="carton") {
    const balloons=gs.balloons||gs.players.map(()=>3), eliminated=gs.roundElim||[];
    elimBar=`<div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:6px">${gs.players.map((p,i)=>{ const b=balloons[i]||0,dead=eliminated.includes(p); return`<div style="padding:5px 13px;border-radius:12px;font-size:.78rem;font-weight:700;background:${dead?"rgba(239,68,68,.08)":COL[i%8].bg+"22"};color:${dead?"rgba(255,255,255,.25)":"white"};border:1px solid ${dead?"rgba(239,68,68,.3)":COL[i%8].bg+"44"}">${p} ${"🎈".repeat(b)}${dead?" 💀":""}</div>`; }).join("")}</div>`;
  }
  if (rType==="patate") {
    elimBar=`<div style="display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-bottom:6px"><span style="font-size:.75rem;color:rgba(255,255,255,.38);font-weight:600">🥔 Manche ${(gs.patateManche||0)+1}/4</span>${gs.players.map((p,i)=>{ const h=p===gs.patateHolder; return`<div style="padding:5px 13px;border-radius:12px;font-size:.78rem;font-weight:700;background:${h?"rgba(251,146,60,.3)":COL[i%8].bg+"22"};color:${h?"#fb923c":"rgba(255,255,255,.5)"};border:${h?"2px solid rgba(251,146,60,.7)":"1px solid "+COL[i%8].bg+"44"};animation:${h?"buzzPulse 1s ease-in-out infinite":"none"}">${h?"🥔 ":""}${p}</div>`; }).join("")}</div>`;
  }

  // Buzz indicator
  let buzzInd = "";
  if (gs.buzzed && !gs.revealed && rType !== "patate") {
    const bI = gs.players.indexOf(gs.buzzed);
    buzzInd = `<div style="padding:14px 22px;border-radius:16px;background:${COL[bI%8].bg}22;border:2px solid ${COL[bI%8].bg}99;text-align:center;font-size:1.25rem;font-weight:800;animation:buzzPulse 1s ease-in-out infinite">🔔 <span style="color:${COL[bI%8].bg}">${gs.buzzed}</span> répond…</div>`;
  }
  if (rType==="patate" && gs.patateHolder && !gs.revealed) {
    buzzInd = `<div style="padding:14px 22px;border-radius:16px;background:rgba(251,146,60,.2);border:2px solid rgba(251,146,60,.6);text-align:center;font-size:1.15rem;font-weight:800;animation:buzzPulse 0.8s ease-in-out infinite">🥔 <span style="color:#fb923c">${gs.patateHolder}</span> a la patate !</div>`;
  }

  // Result
  let res = "";
  if (gs.result && gs.revealed) {
    const isGood = (gs.result.pts||0)>0||gs.result.scorer;
    res = `<div style="padding:16px 22px;border-radius:16px;border:2px solid ${isGood?"rgba(34,197,94,.5)":"rgba(239,68,68,.5)"};background:${isGood?"rgba(34,197,94,.12)":"rgba(239,68,68,.12)"};text-align:center"><div style="color:${isGood?"#86efac":"#fca5a5"};font-weight:800;font-size:1.2rem">${gs.result.msg}</div>${q.f&&gs.revealed?`<div style="color:rgba(255,255,255,.5);font-size:.85rem;margin-top:6px">💡 ${q.f}</div>`:""}</div>`;
  }

  // Answer buttons — couleurs A=bleu B=rouge C=vert D=jaune
  const ANS_COLORS = [
    { bg:'#1d4ed8', border:'#93c5fd', glow:'#3b82f6', lbl:'A' },
    { bg:'#dc2626', border:'#fca5a5', glow:'#ef4444', lbl:'B' },
    { bg:'#16a34a', border:'#86efac', glow:'#22c55e', lbl:'C' },
    { bg:'#ca8a04', border:'#fde68a', glow:'#eab308', lbl:'D' },
  ];
  const aHtml = q.a.map((a,i) => {
    const ac = ANS_COLORS[i];
    const isCorrect = i === q.c;
    const bg   = gs.revealed ? (isCorrect ? '#15803d' : 'rgba(20,20,40,.5)') : ac.bg;
    const bord = gs.revealed ? (isCorrect ? '#4ade80' : 'rgba(80,80,100,.4)') : ac.border;
    const opacity = gs.revealed && !isCorrect ? '0.45' : '1';
    const glow = gs.revealed ? '' : `box-shadow:0 0 18px ${ac.glow}66,inset 0 1px 0 rgba(255,255,255,.2)`;
    return `<div style="display:flex;align-items:center;gap:18px;padding:18px 26px;border-radius:20px;background:${bg};border:2px solid ${bord};opacity:${opacity};transition:all .3s;height:100%;min-height:0;box-sizing:border-box;${glow}">
      <div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.35rem;flex-shrink:0;box-shadow:0 0 10px rgba(255,255,255,.25)">${ac.lbl}</div>
      <span style="font-size:clamp(1.05rem,2.2vw,1.55rem);font-weight:700;flex:1;line-height:1.4">${a}</span>
      ${gs.revealed && isCorrect ? `<span style="font-size:1.7rem;flex-shrink:0">✅</span>` : ""}
    </div>`;
  }).join("");

  const qTotal = (gs.rQs||{})[gs.roundIdx]?.length || 1;

  // Récupérer l'avatar de chaque joueur depuis room.players
  const _roomPlayers = toArr(room.players);
  const sc = gs.players.map((p,i) => {
    const rp  = _roomPlayers.find(x => x.name === p);
    const avIdx = (rp && rp.avatar !== undefined) ? rp.avatar : (i % AVATARS.length);
    const av  = AVATARS[avIdx] || AVATARS[0];
    return `<div style="display:flex;align-items:center;gap:10px;padding:6px 12px;border-radius:12px;background:${av.bg}22;border:2px solid ${av.bg}88;box-shadow:0 0 12px ${av.bg}44,0 0 24px ${av.bg}22;transition:all .3s">
      <img src="${AVATAR_PATH}${av.file}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;object-position:center top;flex-shrink:0;border:2px solid ${av.bg};box-shadow:0 0 8px ${av.bg}66" alt="">
      <span style="font-size:.82rem;font-weight:600;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p}</span>
      <span style="font-size:1rem;font-weight:900;color:${av.bg};text-shadow:0 0 8px ${av.bg}88">${gs.scores[i]||0}</span>
    </div>`;
  }).join("");

  R(`<div style="position:fixed;inset:0;display:flex;overflow:hidden;pointer-events:none">

    <!-- Scores (gauche) -->
    <div style="width:252px;flex-shrink:0;padding:16px 12px;z-index:3;pointer-events:all">
      <div style="background:rgba(0,0,0,.55);backdrop-filter:blur(16px);border-radius:16px;border:1px solid rgba(255,255,255,.18);padding:12px 14px;display:flex;flex-direction:column;gap:7px">
        <div style="font-size:.55rem;font-weight:800;color:rgba(255,255,255,.45);letter-spacing:.15em">SCORES</div>
        ${sc}
      </div>
    </div>

    <!-- Panneau question (droite, prend tout l'espace restant) -->
    <div style="flex:1;position:relative;overflow:hidden;min-width:0">

      <!-- LEDs -->
      <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,${t.accent},#fff,${t.accent},#fff,${t.accent});background-size:200% 100%;animation:ledSweep 2.5s linear infinite;box-shadow:0 0 12px 2px ${t.accent},0 0 24px 4px ${t.accent}88;z-index:2"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,${t.accent},#fff,${t.accent},#fff,${t.accent});background-size:200% 100%;animation:ledSweep 2.5s linear infinite reverse;box-shadow:0 0 12px 2px ${t.accent},0 0 24px 4px ${t.accent}88;z-index:2"></div>
      <div style="position:absolute;top:4px;left:0;bottom:4px;width:4px;background:linear-gradient(180deg,${t.accent},#fff,${t.accent});background-size:100% 200%;animation:ledSweep 3s linear infinite;box-shadow:0 0 12px 2px ${t.accent};z-index:2"></div>

      <!-- Contenu -->
      <div style="width:100%;height:100%;background:linear-gradient(160deg,rgba(20,20,60,.6) 0%,rgba(10,10,40,.7) 100%);backdrop-filter:blur(16px);border-left:3px solid ${t.accent}cc;display:flex;flex-direction:column;padding:20px 30px 20px 26px;gap:14px;box-sizing:border-box;overflow:hidden;pointer-events:all">

        <!-- Header -->
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
          <div style="display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;background:${t.accent}44;border:1px solid ${t.accent}aa;white-space:nowrap;box-shadow:0 0 8px ${t.accent}55"><span>${r.icon}</span><span style="color:white;font-size:.7rem;font-weight:700">${r.name}</span></div>
          <span style="color:rgba(255,255,255,.75);font-size:.75rem;font-weight:700;white-space:nowrap">${rType==="patate"?`🥔 M.${(gs.patateManche||0)+1}/4`:rType==="carton"?`🎯 Tir`:rType==="chrono"?`⏱ Chrono`:`Q${gs.qIdx+1}/${qTotal}`}</span>
          <div style="flex:1;height:6px;background:rgba(255,255,255,.15);border-radius:3px;overflow:hidden"><div style="height:100%;width:${((gs.qIdx+1)/qTotal*100)}%;background:linear-gradient(90deg,${t.dark},${t.accent});border-radius:3px;box-shadow:0 0 6px ${t.accent}"></div></div>
          ${timerHtml}
        </div>

        ${elimBar}

        <!-- Question -->
        <div style="flex-shrink:0;padding:24px 32px;border-radius:20px;background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.4);box-shadow:0 4px 30px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.2)">
          <p style="font-size:clamp(1.2rem,3vw,2.2rem);font-weight:800;line-height:1.5;text-align:center;color:white;margin:0">${q.q}</p>
        </div>

        <!-- Réponses 2×2 -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;flex:1;min-height:0">
          ${aHtml}
        </div>

        ${buzzInd}
        ${res}

      </div>
    </div>
  </div>`);
}

// ── Lancement ──
window.G = { buzz:actBuzz, ans:actAnswer, pick:actPick };
Home();
