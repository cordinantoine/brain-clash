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
// Indexé par : slug Firebase (depuis /questions/_themes)
// + l'entrée `culture` est gardée comme fallback visuel (Home, defaults).
const THEMES = {
  // ── Fallback visuel (utilisé par setBG("culture") sur l'écran d'accueil) ──
  culture : { id:"culture", name:"Culture Générale", emoji:"🧠", accent:"#a78bfa", dark:"#7c3aed", stars:true },

  // ── Slugs Firebase (depuis /questions/_themes) ──
  animaux                : { id:"animaux",                name:"Animaux",                  emoji:"🐾", accent:"#84cc16", dark:"#3f6212", stars:false },
  art_mode               : { id:"art_mode",               name:"Art & Mode",               emoji:"🎨", accent:"#ec4899", dark:"#9d174d", stars:false },
  automobile_transport   : { id:"automobile_transport",   name:"Automobile & Transport",   emoji:"🚗", accent:"#3b82f6", dark:"#1e40af", stars:false },
  bandes_dessinees       : { id:"bandes_dessinees",       name:"Bandes dessinées",         emoji:"📚", accent:"#fb7185", dark:"#9f1239", stars:false },
  boissons               : { id:"boissons",               name:"Boissons",                 emoji:"🍷", accent:"#c026d3", dark:"#86198f", stars:false },
  cinema                 : { id:"cinema",                 name:"Cinéma",                   emoji:"🎬", accent:"#fbbf24", dark:"#d97706", stars:true  },
  culture_generale       : { id:"culture_generale",       name:"Culture générale",         emoji:"🧠", accent:"#a78bfa", dark:"#7c3aed", stars:true  },
  disney_animation       : { id:"disney_animation",       name:"Disney & Animation",       emoji:"🏰", accent:"#ec4899", dark:"#9d174d", stars:true  },
  divers                 : { id:"divers",                 name:"Divers",                   emoji:"🎲", accent:"#94a3b8", dark:"#475569", stars:false },
  expressions_langue     : { id:"expressions_langue",     name:"Expressions & Langue",     emoji:"💬", accent:"#6366f1", dark:"#3730a3", stars:false },
  fetes_traditions       : { id:"fetes_traditions",       name:"Fêtes & Traditions",       emoji:"🎉", accent:"#f97316", dark:"#9a3412", stars:false },
  football               : { id:"football",               name:"Football",                 emoji:"⚽", accent:"#22c55e", dark:"#15803d", stars:false },
  gastronomie            : { id:"gastronomie",            name:"Gastronomie",              emoji:"🍳", accent:"#fb923c", dark:"#9a3412", stars:false },
  geographie_europe      : { id:"geographie_europe",      name:"Géographie Europe",        emoji:"🇪🇺", accent:"#3b82f6", dark:"#1d4ed8", stars:true  },
  geographie_france      : { id:"geographie_france",      name:"Géographie France",        emoji:"🇫🇷", accent:"#2563eb", dark:"#1e3a8a", stars:true  },
  geographie_mondiale    : { id:"geographie_mondiale",    name:"Géographie mondiale",      emoji:"🌍", accent:"#60a5fa", dark:"#1d4ed8", stars:true  },
  harry_potter           : { id:"harry_potter",           name:"Harry Potter",             emoji:"⚡", accent:"#fcd34d", dark:"#92400e", stars:true  },
  histoire_ancienne      : { id:"histoire_ancienne",      name:"Histoire ancienne",        emoji:"🏛️", accent:"#d4a574", dark:"#92400e", stars:false },
  histoire_moderne       : { id:"histoire_moderne",      name:"Histoire moderne",         emoji:"📜", accent:"#b45309", dark:"#7c2d12", stars:false },
  jeux_video             : { id:"jeux_video",             name:"Jeux vidéo",               emoji:"🎮", accent:"#c084fc", dark:"#7e22ce", stars:false },
  litterature            : { id:"litterature",            name:"Littérature",              emoji:"📖", accent:"#a78bfa", dark:"#5b21b6", stars:true  },
  marques_pub            : { id:"marques_pub",            name:"Marques & Pub",            emoji:"🏷️", accent:"#ef4444", dark:"#7f1d1d", stars:false },
  marvel_super_heros     : { id:"marvel_super_heros",     name:"Marvel & Super-héros",     emoji:"🦸", accent:"#dc2626", dark:"#7f1d1d", stars:false },
  monuments_tourisme     : { id:"monuments_tourisme",     name:"Monuments & Tourisme",     emoji:"🗼", accent:"#06b6d4", dark:"#155e75", stars:false },
  musique_francaise      : { id:"musique_francaise",      name:"Musique française",        emoji:"🎤", accent:"#3b82f6", dark:"#1d4ed8", stars:false },
  musique_internationale : { id:"musique_internationale", name:"Musique internationale",   emoji:"🎵", accent:"#f472b6", dark:"#be185d", stars:false },
  mysteres_imaginaire    : { id:"mysteres_imaginaire",    name:"Mystères & Imaginaire",    emoji:"🔮", accent:"#8b5cf6", dark:"#5b21b6", stars:true  },
  nature_plantes         : { id:"nature_plantes",         name:"Nature & Plantes",         emoji:"🌿", accent:"#16a34a", dark:"#14532d", stars:false },
  people_celebrites      : { id:"people_celebrites",      name:"People & Célébrités",      emoji:"⭐", accent:"#facc15", dark:"#a16207", stars:true  },
  personnalites_celebres : { id:"personnalites_celebres", name:"Personnalités célèbres",   emoji:"👑", accent:"#eab308", dark:"#854d0e", stars:false },
  realisateurs_acteurs   : { id:"realisateurs_acteurs",   name:"Réalisateurs & Acteurs",   emoji:"🎭", accent:"#f59e0b", dark:"#92400e", stars:false },
  science_fiction        : { id:"science_fiction",        name:"Science-fiction",          emoji:"🚀", accent:"#0ea5e9", dark:"#075985", stars:true  },
  science_technologie    : { id:"science_technologie",    name:"Science & Technologie",    emoji:"🔬", accent:"#22d3ee", dark:"#0e7490", stars:true  },
  series_fantastiques    : { id:"series_fantastiques",    name:"Séries fantastiques",      emoji:"🐉", accent:"#9ca3af", dark:"#374151", stars:true  },
  series_tv              : { id:"series_tv",              name:"Séries TV",                emoji:"📺", accent:"#8b5cf6", dark:"#5b21b6", stars:false },
  sports_collectifs      : { id:"sports_collectifs",      name:"Sports collectifs",        emoji:"🏐", accent:"#10b981", dark:"#065f46", stars:false },
  sports_olympiques      : { id:"sports_olympiques",      name:"Sports olympiques",        emoji:"🥇", accent:"#f59e0b", dark:"#92400e", stars:false },
  star_wars              : { id:"star_wars",              name:"Star Wars",                emoji:"⭐", accent:"#fde047", dark:"#a16207", stars:true  },
  technologie_web        : { id:"technologie_web",        name:"Technologie & Web",        emoji:"💻", accent:"#0284c7", dark:"#075985", stars:false },
  television_francaise   : { id:"television_francaise",   name:"Télévision française",     emoji:"📺", accent:"#6366f1", dark:"#3730a3", stars:false },
  tennis                 : { id:"tennis",                 name:"Tennis",                   emoji:"🎾", accent:"#a3e635", dark:"#3f6212", stars:false },
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
//   mode             : "fixed" (l'hôte choisit les thèmes) | "last_picks" (le dernier choisit)
//   themes           : slugs sélectionnés (mode fixed uniquement)
//   availableThemes  : slugs disponibles pour la partie (mode last_picks)
let CD = { name:"", maxP:4, mode:"fixed", themes:[], availableThemes:[], rounds:[], cartonBallons:3 };

// ── Cache des thèmes Firebase (chargés depuis /questions/_themes) ──
// Rempli paresseusement par loadFbThemes() avant l'écran de sélection.
let FB_THEMES = null;
async function loadFbThemes() {
  if (FB_THEMES) return FB_THEMES;
  const data = await fg("questions/_themes");
  FB_THEMES = Array.isArray(data) ? data : (data ? toArr(data) : []);
  return FB_THEMES;
}

// ── Normalise un array Firebase (objet {0:..,1:..} → vrai array) ──
const toArr = v => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return Object.keys(v).sort((a,b) => +a - +b).map(k => v[k]);
};
