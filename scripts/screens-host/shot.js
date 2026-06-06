// Capture tous les écrans de l'interface HÔTE (TV / plateau).
//
// Prérequis :
//   1. npm install
//   2. serveur "Brain Clash (Host)" lancé sur :8080
//   3. Chrome installé à l'emplacement CHROME ci-dessous
//
// Lancement : node shot.js
// Sortie :    ../../docs/screens-host/*.png  (viewport 1920×1080)
//
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:8080/';
const OUT = path.resolve(__dirname, '..', '..', 'docs', 'screens-host');

// ── Sample data shared ──────────────────────────────────────────
const ROOM_PLAYERS = [
  { name:'Antoine', avatar:7,  isHost:false },
  { name:'Léa',     avatar:5,  isHost:false },
  { name:'Max',     avatar:0,  isHost:false },
];
const GS_PLAYERS = ['Antoine','Léa','Max'];
const SCORES     = [340, 220, 180];

const Q = { q:'Quel est le plus grand océan du monde ?', a:['Pacifique','Atlantique','Indien','Arctique'], c:0, f:'Le Pacifique couvre 1/3 de la surface du globe.' };

// Mock pour Create(2) qui dépend de FB_THEMES (normalement chargé async).
const FB_THEMES_MOCK = [
  {slug:'cinema',                name:'Cinéma'},
  {slug:'sport',                 name:'Sport'},
  {slug:'histoire_moderne',      name:'Histoire'},
  {slug:'science_technologie',   name:'Sciences'},
  {slug:'jeux_video',            name:'Jeux vidéo'},
  {slug:'musique_internationale',name:'Musique'},
  {slug:'harry_potter',          name:'Harry Potter'},
  {slug:'football',              name:'Football'},
  {slug:'animaux',               name:'Animaux'},
  {slug:'geographie_mondiale',   name:'Géographie'},
];

const BOOT = `
window.__setBaseGlobals = () => {
  HOST = true;
  CODE = 'ABC42';
  ME = '';
};
window.__baseRoom = (overrides) => Object.assign({
  code:'ABC42',
  theme:'culture', themes:['cinema','sport','histoire_moderne'],
  mode:'fixed',
  rounds:['qcm','buzzer','chrono','steal','patate','carton'],
  cartonBallons:3,
  maxP:4,
  players:${JSON.stringify(ROOM_PLAYERS)},
  hostName:'',
  phase:'lobby',
  ts:Date.now(),
}, overrides||{});
window.__baseGs = (overrides) => Object.assign({
  phase:'question', roundIdx:0, qIdx:0,
  rQs:{0:[${JSON.stringify(Q)}]},
  players:${JSON.stringify(GS_PLAYERS)}, scores:${JSON.stringify(SCORES)},
  answers:{}, revealed:false, buzzed:null, buzzedOut:[], roundElim:[],
  balloons:[3,3,3], patateManche:0, patateHolder:null,
  pickTarget:false, chronoRanking:null, ready:{}, lives:[3,3,3],
  timerStart:Date.now(), timerDur:30,
}, overrides||{});
`;

const SCENES = [
  // ── Hors-jeu : accueil + 3 étapes de création + lobby ──
  { file:'00-accueil.png', setup:`Home()` },

  { file:'01-create-1-joueurs.png', setup:`(() => {
    CD = {name:'',maxP:4,mode:'fixed',themes:[],availableThemes:[],rounds:[],cartonBallons:3};
    Create(1);
  })()` },

  { file:'02-create-2-themes-fixed.png', setup:`(() => {
    FB_THEMES = ${JSON.stringify(FB_THEMES_MOCK)};
    CD = {name:'',maxP:4,mode:'fixed',themes:['cinema','sport','science_technologie','jeux_video'],availableThemes:[],rounds:[],cartonBallons:3};
    Create(2);
  })()` },

  { file:'02b-create-2-themes-last-picks.png', setup:`(() => {
    FB_THEMES = ${JSON.stringify(FB_THEMES_MOCK)};
    CD = {name:'',maxP:4,mode:'last_picks',themes:[],availableThemes:[],rounds:[],cartonBallons:3};
    Create(2);
  })()` },

  { file:'03-create-3-rounds.png', setup:`(() => {
    CD = {name:'',maxP:4,mode:'fixed',themes:['cinema','sport'],availableThemes:[],rounds:['qcm','buzzer','chrono','carton'],cartonBallons:3};
    Create(3);
  })()` },

  { file:'04-lobby.png', setup:`(() => {
    __setBaseGlobals();
    Lobby(__baseRoom());
  })()` },

  // ── En partie ──
  { file:'05-loading.png', setup:`(() => {
    __setBaseGlobals();
    drawLoading(__baseRoom({theme:'cinema'}));
  })()` },

  { file:'06-intro-presentation.png', setup:`(() => {
    __setBaseGlobals();
    drawIntro(__baseRoom({theme:'cinema'}), __baseGs({phase:'roundIntro', ready:{'Antoine':true}}));
  })()` },

  { file:'07-intro-picker.png', setup:`(() => {
    __setBaseGlobals();
    drawIntro(
      __baseRoom({theme:'culture', mode:'last_picks', pickerDone:false, picker:{name:'Max'}, pickerThemes:[
        {slug:'cinema',name:'Cinéma'},{slug:'sport',name:'Sport'},{slug:'histoire_moderne',name:'Histoire'},{slug:'science_technologie',name:'Sciences'}
      ], pickerSelectedTheme:'cinema', pickerSelectedDifficulty:'Intermédiaire'}),
      __baseGs({phase:'roundIntro'})
    );
  })()` },

  { file:'08-intro-decompte.png', setup:`(() => {
    __setBaseGlobals();
    drawIntro(__baseRoom({theme:'cinema'}), __baseGs({phase:'roundIntro', ready:{'Antoine':true,'Léa':true,'Max':true}, countdownStart:Date.now()}));
  })()` },

  { file:'09-question.png', setup:`(() => {
    __setBaseGlobals();
    drawQ_host(__baseRoom({theme:'culture'}), __baseGs({}));
  })()` },

  { file:'09b-question-chrono.png', setup:`(() => {
    __setBaseGlobals();
    drawQ_host(__baseRoom({rounds:['chrono','qcm','buzzer','steal','patate','carton'],theme:'culture'}), __baseGs({answers:{Antoine:{ansIdx:0,time:1}}}));
  })()` },

  { file:'09c-question-carton.png', setup:`(() => {
    __setBaseGlobals();
    drawQ_host(__baseRoom({rounds:['carton','qcm','buzzer','chrono','steal','patate'],theme:'culture'}), __baseGs({balloons:[3,1,0], roundElim:['Max']}));
  })()` },

  { file:'09d-question-patate.png', setup:`(() => {
    __setBaseGlobals();
    drawQ_host(__baseRoom({rounds:['patate','qcm','buzzer','chrono','steal','carton'],theme:'culture'}), __baseGs({patateHolder:'Léa', patateManche:1}));
  })()` },

  { file:'10-question-revelation.png', setup:`(() => {
    __setBaseGlobals();
    drawQ_host(__baseRoom({theme:'culture'}), __baseGs({revealed:true, answers:{Antoine:{ansIdx:0,time:1}}, result:{msg:'Antoine répond bien !',pts:100,scorer:'Antoine'}, scores:[440,220,180]}));
  })()` },

  { file:'10b-question-revelation-personne.png', setup:`(() => {
    __setBaseGlobals();
    drawQ_host(__baseRoom({theme:'culture'}), __baseGs({revealed:true, answers:{Antoine:{ansIdx:1,time:1},Léa:{ansIdx:2,time:2},Max:{ansIdx:3,time:3}}, result:{msg:'Personne n\\'a trouvé !',pts:0}}));
  })()` },

  { file:'10c-question-revelation-timeout.png', setup:`(() => {
    __setBaseGlobals();
    drawQ_host(__baseRoom({theme:'culture'}), __baseGs({revealed:true, answers:{}, result:{msg:'⏱️ Temps écoulé !',pts:0}}));
  })()` },

  { file:'10d-question-buzz-en-cours.png', setup:`(() => {
    __setBaseGlobals();
    drawQ_host(__baseRoom({rounds:['buzzer','qcm','chrono','steal','patate','carton'],theme:'culture'}), __baseGs({buzzed:'Antoine', answers:{}}));
  })()` },

  // ── Écrans intermédiaires (variantes) ──
  { file:'11-inter-qcm.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['qcm'],theme:'culture'}), __baseGs({phase:'questionResult', answers:{Antoine:{ansIdx:0,time:1},Max:{ansIdx:0,time:2}}, result:{msg:'+100 pts',pts:100}, scores:[440,220,280]}));
  })()` },

  { file:'11b-inter-qcm-personne.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['qcm'],theme:'culture'}), __baseGs({phase:'questionResult', answers:{Antoine:{ansIdx:1,time:1},Léa:{ansIdx:2,time:2},Max:{ansIdx:3,time:3}}, result:{msg:'Personne n\\'a trouvé !',pts:0}, scores:[340,220,180]}));
  })()` },

  { file:'12-inter-buzzer.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['buzzer'],theme:'culture'}), __baseGs({phase:'questionResult', buzzed:'Antoine', answers:{Antoine:{ansIdx:0,time:1}}, result:{msg:'Antoine remporte 300 pts !',pts:300,scorer:'Antoine'}, scores:[640,220,180]}));
  })()` },

  { file:'12b-inter-buzzer-timeout.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['buzzer'],theme:'culture'}), __baseGs({phase:'questionResult', answers:{}, result:{msg:'⏱️ Temps écoulé !',pts:0}, scores:[340,220,180]}));
  })()` },

  { file:'13-inter-chrono.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['chrono'],theme:'culture'}), __baseGs({phase:'questionResult', chronoRanking:[
      {name:'Antoine',pts:200,correct:true},
      {name:'Max',pts:100,correct:true},
      {name:'Léa',pts:0,correct:false},
    ], result:{msg:'Classement',pts:200}}));
  })()` },

  { file:'14-inter-steal.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['steal'],theme:'culture'}), __baseGs({phase:'questionResult', result:{msg:'Antoine vole 50 pts à Léa !',pts:50,scorer:'Antoine'}, scores:[390,170,180]}));
  })()` },

  { file:'14b-inter-steal-personne.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['steal'],theme:'culture'}), __baseGs({phase:'questionResult', result:{msg:'Personne n\\'a trouvé !',pts:0}, scores:[340,220,180]}));
  })()` },

  { file:'15-inter-patate.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['patate'],theme:'culture'}), __baseGs({phase:'questionResult', patateManche:3, patateHolder:'Léa', result:{msg:'💥 BOOM ! Léa a la patate',pts:-200,scorer:'Léa'}, scores:[340,20,180]}));
  })()` },

  { file:'15b-inter-patate-passe.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['patate'],theme:'culture'}), __baseGs({phase:'questionResult', patateManche:1, patateHolder:'Max', result:{msg:'Antoine passe la patate à Max',pts:0,scorer:'Antoine'}, scores:[340,220,180]}));
  })()` },

  { file:'15c-inter-patate-rate.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['patate'],theme:'culture'}), __baseGs({phase:'questionResult', patateManche:2, patateHolder:'Antoine', result:{msg:'Antoine répond mal — la patate reste',pts:0,scorer:null}, scores:[340,220,180]}));
  })()` },

  { file:'16-inter-carton.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['carton'],theme:'culture'}), __baseGs({phase:'questionResult', balloons:[3,2,1], result:{msg:'🎯 Antoine crève un ballon de Léa !',pts:0,scorer:'Antoine'}}));
  })()` },

  { file:'16b-inter-carton-picking.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['carton'],theme:'culture'}), __baseGs({phase:'questionResult', balloons:[3,3,2], pickTarget:true, buzzed:'Antoine', result:{msg:'🎯 Antoine choisit sa cible…',pts:0,scorer:'Antoine'}}));
  })()` },

  { file:'16c-inter-carton-self.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['carton'],theme:'culture'}), __baseGs({phase:'questionResult', balloons:[2,3,3], result:{msg:'❌ Antoine perd un ballon !',pts:0,scorer:'Antoine'}}));
  })()` },

  { file:'16d-inter-carton-timeout.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['carton'],theme:'culture'}), __baseGs({phase:'questionResult', balloons:[3,3,3], result:{msg:'⏱️ Temps écoulé !',pts:0}}));
  })()` },

  { file:'16e-inter-carton-survivor.png', setup:`(() => {
    __setBaseGlobals();
    drawQuestionResult(__baseRoom({rounds:['carton'],theme:'culture'}), __baseGs({phase:'questionResult', balloons:[3,0,0], roundElim:['Léa','Max'], result:{msg:'🏆 Antoine est le dernier debout !',pts:500,scorer:'Antoine'}, scores:[840,220,180]}));
  })()` },

  // ── Classements ──
  { file:'17-scoreboard.png', setup:`(() => {
    __setBaseGlobals();
    drawScore(__baseRoom({theme:'culture'}), __baseGs({phase:'scoreboard', roundIdx:1, scores:[640,220,280]}), false);
  })()` },

  { file:'18-final.png', setup:`(() => {
    __setBaseGlobals();
    drawScore(__baseRoom({theme:'culture'}), __baseGs({phase:'final', scores:[1240,860,520]}), true);
  })()` },
];

(async () => {
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

  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.evaluate(BOOT);

  for (const s of SCENES) {
    try { await page.evaluate(s.setup); }
    catch (e) { console.error('SETUP FAIL', s.file, e.message); continue; }
    await new Promise(r => setTimeout(r, 500));
    const out = path.join(OUT, s.file);
    await page.screenshot({ path: out });
    console.log('✓', s.file);
  }

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
