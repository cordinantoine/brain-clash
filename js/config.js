/* ════════════════════════════════════════════
   config.js — BRAIN CLASH
   Contient : toutes les constantes globales
              partagées par game.js et ui.js
   Pour personnaliser le jeu, modifie ce fichier
   ════════════════════════════════════════════ */

// ── Définition des thèmes (UI) ──
// accent  = couleur principale des boutons et textes
// dark    = couleur foncée pour les gradients
// stars   = afficher des étoiles CSS en arrière-plan
const THEMES = {
  culture : { id:"culture",  name:"Culture Générale", emoji:"🧠", accent:"#a78bfa", dark:"#7c3aed", stars:true  },
  music   : { id:"music",    name:"Musique",           emoji:"🎵", accent:"#f472b6", dark:"#be185d", stars:false },
  cinema  : { id:"cinema",   name:"Cinéma / Séries",   emoji:"🎬", accent:"#fbbf24", dark:"#d97706", stars:true  },
  sport   : { id:"sport",    name:"Sport",             emoji:"⚽", accent:"#34d399", dark:"#059669", stars:false },
  histoire: { id:"histoire", name:"Histoire",          emoji:"🏛️", accent:"#d4a574", dark:"#92400e", stars:false },
  science : { id:"science",  name:"Sciences",          emoji:"🔬", accent:"#22d3ee", dark:"#0891b2", stars:true  },
  geo     : { id:"geo",      name:"Géographie",        emoji:"🌍", accent:"#60a5fa", dark:"#2563eb", stars:true  },
  gaming  : { id:"gaming",   name:"Jeux Vidéo",        emoji:"🎮", accent:"#c084fc", dark:"#7e22ce", stars:false },
  hp      : { id:"hp",       name:"Harry Potter",      emoji:"⚡", accent:"#fcd34d", dark:"#92400e", stars:true  },
  nba     : { id:"nba",      name:"NBA",               emoji:"🏀", accent:"#f97316", dark:"#c2410c", stars:false },
  football: { id:"football", name:"Football",           emoji:"⚽", accent:"#22c55e", dark:"#15803d", stars:false },
  francaise:{ id:"francaise",name:"Culture Française",  emoji:"🇫🇷", accent:"#3b82f6", dark:"#1d4ed8", stars:true  },
  lotr    : { id:"lotr",     name:"Seigneur des Anneaux",emoji:"💍", accent:"#eab308", dark:"#a16207", stars:true  },
};

// ── Types de rounds disponibles ──
const RT = [
  { id:"qcm",    name:"QCM Classique",        icon:"📝",  desc:"Tout le monde répond au même QCM. Bonne réponse = points." },
  { id:"buzzer", name:"Buzzer Rapide",         icon:"⚡",  desc:"Le plus rapide à buzzer ET donner la bonne réponse gagne des points !" },
  { id:"chrono", name:"Contre la Montre",      icon:"⏱️",  desc:"Tout le monde répond en même temps. Classement par rapidité !" },
  { id:"steal",  name:"Vol de Points",         icon:"😈",  desc:"Tous répondent ! Le premier correct vole des points à un adversaire." },
  { id:"patate", name:"Patate Chaude",         icon:"🥔",  desc:"Une bombe aléatoire à chaque question… elle explose et ça fait mal !" },
  { id:"carton", name:"Tir à la Carabine",     icon:"🎯",  desc:"Dernier survivant avec des ballons 🎈 gagne ! Bonne réponse → crevez un ballon adverse." },
];

// ── Couleurs des joueurs ──
const COL = [
  { bg:"#ef4444", gw:"#ef444455" },
  { bg:"#3b82f6", gw:"#3b82f655" },
  { bg:"#22c55e", gw:"#22c55e55" },
  { bg:"#f59e0b", gw:"#f59e0b55" },
  { bg:"#a855f7", gw:"#a855f755" },
  { bg:"#ec4899", gw:"#ec489955" },
  { bg:"#14b8a6", gw:"#14b8a655" },
  { bg:"#f97316", gw:"#f9731655" },
];

// ── Avatars joueurs ──
const AVATARS = [
  { file:'IMG_9031.PNG', bg:'#1a5fd4' },  // pirate
  { file:'IMG_9038.PNG', bg:'#1a1a2e' },  // sorcière
  { file:'IMG_9039.PNG', bg:'#8b5e3c' },  // archéologue
  { file:'IMG_9040.PNG', bg:'#e8e8e8' },  // inventrice
  { file:'IMG_9041.PNG', bg:'#6b6b6b' },  // soldat
  { file:'IMG_9042.PNG', bg:'#e8407a' },  // athlète
  { file:'IMG_9050.PNG', bg:'#e86020' },  // cowboy
  { file:'IMG_9051.PNG', bg:'#00c8c8' },  // astronaute
  { file:'IMG_9052.PNG', bg:'#c81820' },  // viking
  { file:'IMG_9053.PNG', bg:'#7820c0' },  // samouraï
  { file:'IMG_9054.PNG', bg:'#f5d000' },  // chef cuisto
  { file:'IMG_9055.PNG', bg:'#78d800' },  // scientifique fou
];

// Chemin relatif vers les avatars (depuis index.html)
const AVATAR_PATH = 'JS/assets/avatars/';

// ── Labels des réponses ──
const LB = ["A", "B", "C", "D"];

// ── État global de la session ──
// Ces variables sont lues/écrites par game.js et ui.js
let ME   = "";     // prénom du joueur local
let CODE = "";     // code de la salle courante
let HOST = false;  // est-ce que je suis l'hôte ?
let STOP = null;   // fonction pour stopper le listener Firebase
let HTIMER = null; // timer de l'hôte (délai de réponse)
let I_BUZZED = false;         // ai-je déjà buzzé cette question ?
let lastAnswerKey = "";       // clé pour détecter les nouvelles réponses

// ── Configuration d'une partie en cours de création ──
let CD = { name:"", maxP:4, themes:[], rounds:[], cartonBallons:3 };

// ── Normalise un array Firebase (objet {0:..,1:..} → vrai array) ──
const toArr = v => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return Object.keys(v).sort((a,b) => +a - +b).map(k => v[k]);
};
