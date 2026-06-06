// Capture tous les écrans de l'interface joueur.
//
// Prérequis :
//   1. npm install            (depuis ce dossier — installe puppeteer-core)
//   2. serveur "Brain Clash (Player)" lancé sur :8081
//      (via la palette Claude Code "Launch", ou : node -e "require('http')..."
//       cf. .claude/launch.json)
//   3. Chrome installé à l'emplacement défini par CHROME ci-dessous
//
// Lancement :  node shot.js
// Sortie :     ../../docs/screens/*.png  (30 captures, viewport 375×812 @2x)
//
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:8081/';
const OUT = path.resolve(__dirname, '..', '..', 'docs', 'screens');

// ── Sample data shared across scenes ────────────────────────────
const ROOM_PLAYERS = [
  { name:'Toi',     avatar:0,  isHost:false },
  { name:'Antoine', avatar:7,  isHost:true  },
  { name:'Léa',     avatar:5,  isHost:false },
];
const GS_PLAYERS = ['Toi','Antoine','Léa'];
const SCORES     = [120, 80, 50];
const PLAYER_AVS = [0, 7, 5];

const Q = { q:'Quel est le plus grand océan du monde ?', a:['Pacifique','Atlantique','Indien','Arctique'], c:0, f:'Le Pacifique couvre 1/3 de la surface du globe.' };

// Boot helper: defines `setupGame` in the page scope.
const BOOT = `
window.__init = (round) => {
  ME = 'Toi';
  CODE = 'ABC42';
  MY_INDEX = 0;
  PLAYER_AVATARS = ${JSON.stringify(PLAYER_AVS)};
  showScreen('screen-game');
  const r = RT.find(x => x.id === round) || RT[0];
  G('hdr-round-name').textContent = r.icon + ' ' + r.name;
  G('hdr-round-name').style.color = '#a78bfa';
  G('hdr-round-desc').textContent = r.desc;
  G('hdr-timer').textContent = '11s';
  // Scores strip
  const players = ${JSON.stringify(GS_PLAYERS)};
  const scores = ${JSON.stringify(SCORES)};
  G('scores-strip').innerHTML = players.map((p, i) => {
    const av = AVATARS[PLAYER_AVATARS[i]] || AVATARS[0];
    const isMe = p === ME;
    const colorStyle = isMe ? '' : 'border-color:'+av.bg+';box-shadow:0 0 10px '+av.bg+'55,0 0 20px '+av.bg+'22';
    return '<div class="score-pill '+(isMe?'me':'')+'" style="'+colorStyle+'"><img class="score-pill-avatar" src="JS/assets/avatars/'+av.file+'" style="border:2px solid '+av.bg+'"><span class="score-pill-name">'+p+'</span><span class="score-pill-val">'+scores[i]+'</span></div>';
  }).join('');
};
window.__baseGs = (overrides) => Object.assign({
  phase:'question', roundIdx:0, qIdx:0,
  rQs:{0:[${JSON.stringify(Q)}]},
  players:${JSON.stringify(GS_PLAYERS)}, scores:${JSON.stringify(SCORES)},
  answers:{}, revealed:false, buzzed:null, buzzedOut:[], roundElim:[],
  balloons:[3,3,3], patateManche:0, patateHolder:null,
  pickTarget:false, chronoRanking:null, ready:{},
}, overrides||{});
window.__baseRoom = (overrides) => Object.assign({
  rounds:['qcm'], mode:'fixed', theme:'culture',
  players:${JSON.stringify(ROOM_PLAYERS)},
}, overrides||{});
`;

// ── Scenes ──────────────────────────────────────────────────────
const SCENES = [
  // ── Hors-jeu ──
  { file:'01-rejoindre.png', setup:null },

  { file:'02-salle-attente.png', setup:`(() => {
    ME='Toi'; CODE='ABC42'; showScreen('screen-lobby');
    G('lobby-code-val').textContent='ABC42';
    G('lobby-player-name').textContent='Toi';
    renderLobbyPlayers(${JSON.stringify(ROOM_PLAYERS)});
  })()` },

  // ── 3a Buzzer ──
  { file:'03a-buzzer.png', setup:`(() => {
    __init('buzzer');
    G('hdr-timer').textContent='8s';
    renderState(__baseRoom({rounds:['buzzer']}), __baseGs({buzzed:null}));
  })()` },

  // ── 3b Réponses ──
  { file:'03b-reponses-idle.png', setup:`(() => {
    __init('qcm');
    renderState(__baseRoom({rounds:['qcm']}), __baseGs({}));
  })()` },

  { file:'03b-reponses-selectionnee.png', setup:`(() => {
    __init('buzzer');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['buzzer']}), __baseGs({buzzed:'Toi', answers:{Toi:{ansIdx:0,time:Date.now()}}}));
  })()` },

  { file:'03b-reponses-revelation.png', setup:`(() => {
    __init('qcm');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['qcm']}), __baseGs({revealed:true, answers:{Toi:{ansIdx:1,time:Date.now()}}, result:{msg:'Bonne réponse !',pts:100,scorer:'Antoine'}}));
  })()` },

  { file:'03b-patate-porteur.png', setup:`(() => {
    __init('patate');
    G('hdr-timer').textContent='🥔';
    renderState(__baseRoom({rounds:['patate']}), __baseGs({patateHolder:'Toi', patateManche:1}));
  })()` },

  // ── 3c Attente (polyvalent) ──
  { file:'03c-attente-pret.png', setup:`(() => {
    __init('qcm');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['qcm']}), __baseGs({phase:'roundIntro', ready:{}}));
  })()` },

  { file:'03c-attente-picker.png', setup:`(() => {
    __init('qcm');
    G('hdr-timer').textContent='—';
    const room = __baseRoom({rounds:['qcm'], mode:'last_picks', pickerDone:false, picker:{name:'Toi'}, pickerThemes:[
      {slug:'cinema',name:'Cinéma'},{slug:'sport',name:'Sport'},{slug:'histoire_moderne',name:'Histoire'},{slug:'science_technologie',name:'Sciences'}
    ], pickerSelectedTheme:'cinema', pickerSelectedDifficulty:'Intermédiaire'});
    renderState(room, __baseGs({phase:'roundIntro'}));
  })()` },

  { file:'03c-attente-picker-themes.png', setup:`(() => {
    __init('qcm');
    G('hdr-timer').textContent='—';
    const room = __baseRoom({rounds:['qcm'], mode:'last_picks', pickerDone:false, picker:{name:'Toi'}, pickerThemes:[
      {slug:'cinema',name:'Cinéma'},{slug:'sport',name:'Sport'},{slug:'histoire_moderne',name:'Histoire'},{slug:'science_technologie',name:'Sciences'}
    ]});
    renderState(room, __baseGs({phase:'roundIntro'}));
  })()` },

  { file:'03c-attente-picker-autre.png', setup:`(() => {
    __init('qcm');
    G('hdr-timer').textContent='—';
    const room = __baseRoom({rounds:['qcm'], mode:'last_picks', pickerDone:false, picker:{name:'Antoine'}, pickerThemes:[
      {slug:'cinema',name:'Cinéma'},{slug:'sport',name:'Sport'},{slug:'histoire_moderne',name:'Histoire'},{slug:'science_technologie',name:'Sciences'}
    ], pickerSelectedTheme:'cinema'});
    renderState(room, __baseGs({phase:'roundIntro'}));
  })()` },

  { file:'03c-attente-decompte.png', setup:`(() => {
    __init('qcm');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['qcm']}), __baseGs({phase:'roundIntro', countdownStart:Date.now()}));
  })()` },

  { file:'03c-attente-reponse-envoyee.png', setup:`(() => {
    __init('qcm');
    G('hdr-timer').textContent='9s';
    renderState(__baseRoom({rounds:['qcm']}), __baseGs({answers:{Toi:{ansIdx:0,time:Date.now()}}}));
  })()` },

  { file:'03c-attente-autre-buzz.png', setup:`(() => {
    __init('buzzer');
    G('hdr-timer').textContent='5s';
    renderState(__baseRoom({rounds:['buzzer']}), __baseGs({buzzed:'Antoine'}));
  })()` },

  { file:'03c-attente-autre-choisit-cible.png', setup:`(() => {
    __init('steal');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['steal']}), __baseGs({buzzed:'Antoine', pickTarget:true, answers:{Antoine:{ansIdx:0,time:Date.now()}}, revealed:false}));
  })()` },

  { file:'03c-attente-elimine.png', setup:`(() => {
    __init('carton');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['carton']}), __baseGs({roundElim:['Toi'], balloons:[0,2,3]}));
  })()` },

  { file:'03c-attente-patate-autre.png', setup:`(() => {
    __init('patate');
    G('hdr-timer').textContent='🥔';
    renderState(__baseRoom({rounds:['patate']}), __baseGs({patateHolder:'Antoine', patateManche:2}));
  })()` },

  { file:'03c-attente-patate-boom.png', setup:`(() => {
    __init('patate');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['patate']}), __baseGs({patateExplosion:true, patateHolder:'Antoine', revealed:true, result:{msg:'💥 BOOM ! Antoine a la patate',pts:-200,scorer:'Antoine'}}));
  })()` },

  // ── 3d Résultat ──
  { file:'03d-resultat-bon.png', setup:`(() => {
    __init('buzzer');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['buzzer']}), __baseGs({revealed:true, buzzed:'Toi', answers:{Toi:{ansIdx:0,time:Date.now()}}, result:{msg:'Bonne réponse !',pts:1000,scorer:'Toi'}}));
  })()` },

  { file:'03d-resultat-mauvais.png', setup:`(() => {
    __init('buzzer');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['buzzer']}), __baseGs({revealed:true, buzzed:'Toi', answers:{Toi:{ansIdx:1,time:Date.now()}}, result:{msg:'Mauvaise réponse',pts:0,scorer:null}}));
  })()` },

  { file:'03d-resultat-temps-ecoule.png', setup:`(() => {
    __init('buzzer');
    G('hdr-timer').textContent='0s';
    renderState(__baseRoom({rounds:['buzzer']}), __baseGs({revealed:true, answers:{}, result:{msg:'Temps écoulé',pts:0,scorer:null}}));
  })()` },

  // ── 3e Buzz raté ──
  { file:'03e-buzz-rate.png', setup:`(() => {
    __init('buzzer');
    G('hdr-timer').textContent='4s';
    renderState(__baseRoom({rounds:['buzzer']}), __baseGs({buzzedOut:['Toi'], buzzed:null}));
  })()` },

  // ── 3f Scoreboard ──
  { file:'03f-scores.png', setup:`(() => {
    __init('qcm');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['qcm']}), __baseGs({phase:'scoreboard'}));
  })()` },

  // ── 3g Final ──
  { file:'03g-final.png', setup:`(() => {
    __init('qcm');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['qcm']}), __baseGs({phase:'final', scores:[1240,980,720]}));
  })()` },

  // ── 3h Écran intermédiaire ──
  { file:'03h-inter-qcm.png', setup:`(() => {
    __init('qcm');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['qcm']}), __baseGs({phase:'questionResult', answers:{Toi:{ansIdx:0,time:1},Léa:{ansIdx:0,time:2}}, result:{msg:'Bonne réponse !',pts:100}}));
  })()` },

  { file:'03h-inter-buzzer.png', setup:`(() => {
    __init('buzzer');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['buzzer']}), __baseGs({phase:'questionResult', answers:{Toi:{ansIdx:0,time:1}}, result:{msg:'Bonne réponse !',pts:300,scorer:'Toi'}}));
  })()` },

  { file:'03h-inter-buzzer-rate.png', setup:`(() => {
    __init('buzzer');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['buzzer']}), __baseGs({phase:'questionResult', buzzed:'Toi', buzzedOut:['Toi'], answers:{Toi:{ansIdx:3,time:1}}, result:{msg:'Mauvaise réponse',pts:-15,scorer:null}}));
  })()` },

  { file:'03h-inter-buzzer-timeout.png', setup:`(() => {
    __init('buzzer');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['buzzer']}), __baseGs({phase:'questionResult', answers:{}, result:{msg:'Temps écoulé',pts:0,scorer:null}}));
  })()` },

  { file:'03h-inter-chrono.png', setup:`(() => {
    __init('chrono');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['chrono']}), __baseGs({phase:'questionResult', chronoRanking:[{name:'Antoine',pts:200,correct:true},{name:'Toi',pts:100,correct:true},{name:'Léa',pts:0,correct:false}]}));
  })()` },

  { file:'03h-inter-steal.png', setup:`(() => {
    __init('steal');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['steal']}), __baseGs({phase:'questionResult', result:{msg:'Antoine vole 50 pts à Léa !',pts:50,scorer:'Antoine'}}));
  })()` },

  { file:'03h-inter-patate.png', setup:`(() => {
    __init('patate');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['patate']}), __baseGs({phase:'questionResult', patateManche:3, patateHolder:'Léa', result:{msg:'💥 BOOM ! Léa a la patate',pts:-200,scorer:'Léa'}}));
  })()` },

  { file:'03h-inter-carton.png', setup:`(() => {
    __init('carton');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['carton']}), __baseGs({phase:'questionResult', balloons:[3,2,1], result:{msg:'Antoine crève un ballon de Léa !',pts:0,scorer:'Antoine'}}));
  })()` },

  // ── 3i Choisir une cible ──
  { file:'03i-choisir-cible-steal.png', setup:`(() => {
    __init('steal');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['steal']}), __baseGs({buzzed:'Toi', pickTarget:true, answers:{Toi:{ansIdx:0,time:1}}}));
  })()` },

  { file:'03i-choisir-cible-carton.png', setup:`(() => {
    __init('carton');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['carton']}), __baseGs({buzzed:'Toi', pickTarget:true, answers:{Toi:{ansIdx:0,time:1}}, balloons:[3,2,1]}));
  })()` },

  // ── 3j Classement Chrono ──
  { file:'03j-classement-chrono.png', setup:`(() => {
    __init('chrono');
    G('hdr-timer').textContent='—';
    renderState(__baseRoom({rounds:['chrono']}), __baseGs({revealed:true, chronoRanking:[{name:'Antoine',pts:200,correct:true},{name:'Toi',pts:100,correct:true},{name:'Léa',pts:0,correct:false}], result:{msg:'Classement',pts:100}}));
  })()` },
];

(async () => {
  // Clean out dir first.
  if (fs.existsSync(OUT)) for (const f of fs.readdirSync(OUT)) fs.unlinkSync(path.join(OUT, f));
  else fs.mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  page.on('pageerror', e => console.error('PAGEERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });

  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.evaluate(BOOT);

  for (const s of SCENES) {
    if (s.setup) {
      // Clean stale leftovers from previous scenes (.reveal-msg, .answer-sent are inserted afterEnd of #answer-grid).
      await page.evaluate(() => document.querySelectorAll('.reveal-msg, .answer-sent').forEach(e => e.remove()));
      try { await page.evaluate(s.setup); }
      catch (e) { console.error('SETUP FAIL', s.file, e.message); continue; }
    } else {
      // For the join screen — reload to get a clean state.
      await page.reload({ waitUntil: 'networkidle0' });
      await page.evaluate(BOOT);
    }
    await new Promise(r => setTimeout(r, 400));
    const out = path.join(OUT, s.file);
    await page.screenshot({ path: out });
    console.log('✓', s.file);
  }

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
