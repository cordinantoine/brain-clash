/* ════════════════════════════════════════════
   scene3d.js — BRAIN CLASH
   Scène Three.js : silhouette 3D + plateau TV
   Dépend de  : three.min.js (chargé avant)
   ════════════════════════════════════════════ */

// ── Couleurs et ambiance par thème ──
const THEME3D = {
  culture : { fogColor:0x1e1b4b, fogNear:9,  fogFar:24, ambCol:0x3a2f7a, ambInt:.55, spot1Col:0xa78bfa, spot1Int:2.4, rimCol:0x7c3aed, rimInt:1.4, siloCol:0x0d0820, glowCol:0xa78bfa, floorCol:0x0a0820, partCol:0xa78bfa, bgCol:0x0a0918,  accentCol:0xa78bfa },
  music   : { fogColor:0x1a0014, fogNear:8,  fogFar:20, ambCol:0x2a0020, ambInt:.5,  spot1Col:0xf472b6, spot1Int:2.6, rimCol:0xbe185d, rimInt:1.5, siloCol:0x0e0008, glowCol:0xf472b6, floorCol:0x0a0005, partCol:0xf472b6, bgCol:0x080003,  accentCol:0xf472b6 },
  cinema  : { fogColor:0x180c00, fogNear:8,  fogFar:20, ambCol:0x281400, ambInt:.5,  spot1Col:0xfbbf24, spot1Int:2.8, rimCol:0xd97706, rimInt:1.6, siloCol:0x0f0700, glowCol:0xfbbf24, floorCol:0x0c0500, partCol:0xfbbf24, bgCol:0x0a0400,  accentCol:0xfbbf24 },
  sport   : { fogColor:0x071408, fogNear:8,  fogFar:20, ambCol:0x0a2010, ambInt:.5,  spot1Col:0x34d399, spot1Int:2.6, rimCol:0x059669, rimInt:1.5, siloCol:0x030a04, glowCol:0x34d399, floorCol:0x040c05, partCol:0x34d399, bgCol:0x030a04,  accentCol:0x34d399 },
  histoire: { fogColor:0x140e08, fogNear:8,  fogFar:20, ambCol:0x1c1208, ambInt:.5,  spot1Col:0xd4a574, spot1Int:2.4, rimCol:0x92400e, rimInt:1.4, siloCol:0x0c0804, glowCol:0xd4a574, floorCol:0x0a0703, partCol:0xd4a574, bgCol:0x080502,  accentCol:0xd4a574 },
  science : { fogColor:0x030e18, fogNear:8,  fogFar:21, ambCol:0x052030, ambInt:.5,  spot1Col:0x22d3ee, spot1Int:2.8, rimCol:0x0891b2, rimInt:1.6, siloCol:0x010810, glowCol:0x22d3ee, floorCol:0x020c14, partCol:0x22d3ee, bgCol:0x020a10,  accentCol:0x22d3ee },
  geo     : { fogColor:0x071020, fogNear:9,  fogFar:22, ambCol:0x0c1a30, ambInt:.5,  spot1Col:0x60a5fa, spot1Int:2.5, rimCol:0x2563eb, rimInt:1.4, siloCol:0x040810, glowCol:0x60a5fa, floorCol:0x050a18, partCol:0x60a5fa, bgCol:0x03060e,  accentCol:0x60a5fa },
  gaming  : { fogColor:0x0e0520, fogNear:8,  fogFar:20, ambCol:0x180040, ambInt:.5,  spot1Col:0xc084fc, spot1Int:2.7, rimCol:0x7e22ce, rimInt:1.6, siloCol:0x070014, glowCol:0xc084fc, floorCol:0x060010, partCol:0xc084fc, bgCol:0x04000c,  accentCol:0xc084fc },
  hp      : { fogColor:0x120800, fogNear:8,  fogFar:20, ambCol:0x1e1000, ambInt:.5,  spot1Col:0xfcd34d, spot1Int:2.8, rimCol:0x92400e, rimInt:1.6, siloCol:0x0c0600, glowCol:0xfcd34d, floorCol:0x0a0500, partCol:0xfcd34d, bgCol:0x080400,  accentCol:0xfcd34d },
  nba     : { fogColor:0x180800, fogNear:8,  fogFar:20, ambCol:0x281200, ambInt:.5,  spot1Col:0xf97316, spot1Int:2.6, rimCol:0xc2410c, rimInt:1.5, siloCol:0x0e0600, glowCol:0xf97316, floorCol:0x0c0500, partCol:0xf97316, bgCol:0x0a0400,  accentCol:0xf97316 },
  football: { fogColor:0x051208, fogNear:8,  fogFar:20, ambCol:0x082010, ambInt:.5,  spot1Col:0x22c55e, spot1Int:2.6, rimCol:0x15803d, rimInt:1.5, siloCol:0x030a04, glowCol:0x22c55e, floorCol:0x040c05, partCol:0x22c55e, bgCol:0x020802,  accentCol:0x22c55e },
  francaise:{ fogColor:0x06102a, fogNear:9,  fogFar:22, ambCol:0x0c1a3a, ambInt:.55, spot1Col:0x3b82f6, spot1Int:2.5, rimCol:0x1d4ed8, rimInt:1.4, siloCol:0x040810, glowCol:0x3b82f6, floorCol:0x050a18, partCol:0x3b82f6, bgCol:0x03060e,  accentCol:0x3b82f6 },
  lotr    : { fogColor:0x100a00, fogNear:8,  fogFar:20, ambCol:0x1c1200, ambInt:.5,  spot1Col:0xeab308, spot1Int:2.8, rimCol:0xa16207, rimInt:1.6, siloCol:0x0a0600, glowCol:0xeab308, floorCol:0x080400, partCol:0xeab308, bgCol:0x060300,  accentCol:0xeab308 },
};

// ════════════════════════════════════════════
//  INIT THREE.JS
// ════════════════════════════════════════════
const _canvas   = document.getElementById('canvas3d');
const _renderer = new THREE.WebGLRenderer({ canvas:_canvas, antialias:true });
_renderer.setSize(window.innerWidth, window.innerHeight);
_renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
_renderer.shadowMap.enabled = true;
_renderer.shadowMap.type    = THREE.PCFSoftShadowMap;

const _scene  = new THREE.Scene();
const _camera = new THREE.PerspectiveCamera(58, window.innerWidth/window.innerHeight, 0.1, 100);
_camera.position.set(0, 2.0, 7.0);
_camera.lookAt(0, 1.6, 0);

window.addEventListener('resize', () => {
  _resizeCanvas(!_gameMode);
});

// ════════════════════════════════════════════
//  PERSONNAGE AJ — GLTFLoader + AnimationMixer
// ════════════════════════════════════════════
const _siloGroup = new THREE.Group();
_scene.add(_siloGroup);

let _mixer        = null;
let _actions      = {};
let _currentAction = null;
let _animState    = 'idle';
let _ajLoaded     = false;

const _ANIM_FILES = {
  idle    : 'JS/assets/models/Idle.glb',
  talk    : 'JS/assets/models/Talking.glb',
  react   : 'JS/assets/models/Clapping.glb',
  defeated: 'JS/assets/models/Defeated.glb',
  think   : 'JS/assets/models/Thinking.glb',
  dance   : 'JS/assets/models/Dance.glb',
};

function _setAnim(name) {
  _animState = name;
  if (!_mixer || !_actions[name]) return;
  const next = _actions[name];
  if (_currentAction === next) return;
  if (_currentAction) _currentAction.fadeOut(0.3);
  next.reset().fadeIn(0.3).play();
  _currentAction = next;
}

function _loadAnimations(model) {
  _mixer = new THREE.AnimationMixer(model);
  _mixer.addEventListener('finished', () => {
    if (_animState === 'react' || _animState === 'defeated') _setAnim('idle');
  });
  const loader = new THREE.GLTFLoader();
  let loaded = 0, total = Object.keys(_ANIM_FILES).length;
  Object.entries(_ANIM_FILES).forEach(([name, path]) => {
    loader.load(path, (gltf) => {
      if (gltf.animations && gltf.animations.length > 0) {
        const action = _mixer.clipAction(gltf.animations[0]);
        if (name === 'react' || name === 'defeated') {
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
        }
        _actions[name] = action;
      }
      if (++loaded === total) _setAnim('idle');
    }, undefined, (e) => { console.warn('[AJ anim]', name, e); ++loaded; });
  });
}

(function _loadAJ() {
  const loader = new THREE.GLTFLoader();
  loader.load('JS/assets/models/Aj.glb', (gltf) => {
    const model = gltf.scene;
    model.rotation.y = Math.PI;
    model.traverse(c => {
      if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
    });
    _siloGroup.add(model);
    _siloGroup.position.set(0, -1.02, -0.3);
    _siloGroup.scale.set(2.2, 2.2, 2.2);
    _ajLoaded = true;
    _loadAnimations(model);
    // Glow du thème courant
    const t = THEME3D[_currentThemeId] || THEME3D.culture;
    model.traverse(c => {
      if (c.isMesh && c.material && !c.material.transparent) {
        c.material.emissive = new THREE.Color(t.glowCol);
        c.material.emissiveIntensity = 0.04;
      }
    });
  }, undefined, (e) => console.error('[AJ model]', e));
})();

// Sol
const _floor = new THREE.Mesh(
  new THREE.PlaneGeometry(22, 22),
  new THREE.MeshStandardMaterial({ color:0x080618, roughness:.35, metalness:.5 })
);
_floor.rotation.x = -Math.PI / 2;
_floor.position.y = -1.02;
_floor.receiveShadow = true;
_scene.add(_floor);

// ════════════════════════════════════════════
//  LUMIÈRES
// ════════════════════════════════════════════
const _ambLight  = new THREE.AmbientLight(0x3a2f7a, 1.4);
_scene.add(_ambLight);

const _spotLight = new THREE.SpotLight(0xa78bfa, 5.0, 20, Math.PI/5, .4, 1.2);
_spotLight.position.set(0, 7, 3);
_spotLight.castShadow = true;
_scene.add(_spotLight);

const _spotTarget = new THREE.Object3D();
_spotTarget.position.set(0, 0.5, -.5);
_scene.add(_spotTarget);
_spotLight.target = _spotTarget;

const _rimLight  = new THREE.PointLight(0x7c3aed, 2.2, 12);
_rimLight.position.set(-2.8, 3.2, -2);
_scene.add(_rimLight);

const _fillLight = new THREE.PointLight(0xa78bfa, 1.2, 10);
_fillLight.position.set(0, 1.0, 3);
_scene.add(_fillLight);

// Lumière clé fixe (toujours active, non modifiée par les thèmes)
const _keyLight = new THREE.PointLight(0xffffff, 3.0, 14);
_keyLight.position.set(0, 3, 4);
_scene.add(_keyLight);

// ════════════════════════════════════════════
//  PARTICULES
// ════════════════════════════════════════════
let _particles = null;

function _buildParticles(col) {
  if (_particles) { _scene.remove(_particles); _particles.geometry.dispose(); _particles.material.dispose(); }
  const N = 200, pos = new Float32Array(N*3), spd = new Float32Array(N), iniY = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i*3]   = (Math.random()-.5)*16;
    pos[i*3+1] = Math.random()*9 - 1;
    pos[i*3+2] = (Math.random()-.5)*12 - 1.5;
    spd[i]  = Math.random()*.38 + .12;
    iniY[i] = pos[i*3+1];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.userData = { spd, iniY };
  _particles = new THREE.Points(geo, new THREE.PointsMaterial({ color:col, size:.04, transparent:true, opacity:.65, sizeAttenuation:true }));
  _scene.add(_particles);
}

_scene.fog = new THREE.Fog(0x1e1b4b, 9, 24);
_renderer.setClearColor(0x0a0918);

// ════════════════════════════════════════════
//  THÈME
// ════════════════════════════════════════════
let _currentThemeId = 'culture';
let _gameMode = false;

function _applyTheme3d(tid) {
  _currentThemeId = tid;
  const t = THEME3D[tid] || THEME3D.culture;
  _renderer.setClearColor(t.bgCol);
  _scene.fog.color.setHex(t.fogColor); _scene.fog.near = t.fogNear; _scene.fog.far = t.fogFar;
  _ambLight.color.setHex(t.ambCol);    _ambLight.intensity = t.ambInt;
  _spotLight.color.setHex(t.spot1Col); _spotLight.intensity = t.spot1Int;
  _rimLight.color.setHex(t.rimCol);    _rimLight.intensity = t.rimInt;
  _fillLight.color.setHex(t.glowCol);
  _floor.material.color.setHex(t.floorCol);
  // Emissive glow uniquement (ne pas écraser les couleurs du costume)
  _siloGroup.traverse(c => {
    if (c.isMesh && !c.material.transparent) {
      c.material.emissive = new THREE.Color(t.glowCol);
      c.material.emissiveIntensity = .03;
    }
  });
  _buildParticles(t.partCol);
  // Met à jour les éléments du plateau si actif
  if (_gameMode) _updateSetColors(t);
}
_applyTheme3d('culture');

// ════════════════════════════════════════════
//  ANIMATIONS PERSONNAGE (délégué au mixer AJ)
// ════════════════════════════════════════════
function _tickCharacter(t) {
  if (!_ajLoaded) return;
  const baseY = -1.02;
  _siloGroup.position.y = baseY + Math.sin(t * .55) * .008;
  _siloGroup.rotation.y = Math.PI + Math.sin(t * .18) * .055;
}

// ════════════════════════════════════════════
//  LOGO 3D (accueil uniquement)
// ════════════════════════════════════════════
let _logoMesh = null;
let _logoVisible = false;

function _buildLogo() {
  if (_logoMesh) return;
  const cvs = document.createElement('canvas');
  cvs.width = 1024; cvs.height = 256;
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  ctx.font = '900 120px "Poppins", sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff'; ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 40;
  ctx.fillText('BRAIN', 512, 90);
  ctx.shadowColor = '#7c3aed'; ctx.shadowBlur = 50; ctx.fillStyle = '#a78bfa';
  ctx.fillText('CLASH', 512, 195);
  const tex = new THREE.CanvasTexture(cvs); tex.needsUpdate = true;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  _logoMesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.25), mat);
  _logoMesh.position.set(0, 4.2, -1.2);
  _logoMesh.visible = false;
  _scene.add(_logoMesh);
}
_buildLogo();

function _showLogo(v) { _logoVisible = v; if (_logoMesh) _logoMesh.visible = v; }

function _tickLogo(t) {
  if (!_logoMesh || !_logoVisible) return;
  _logoMesh.position.y = 4.2 + Math.sin(t * 0.8) * 0.12;
  _logoMesh.rotation.y = Math.sin(t * 0.4) * 0.15;
  _logoMesh.material.opacity = 0.85 + Math.sin(t * 1.5) * 0.15;
}

// ════════════════════════════════════════════════════════════════════
//  ██████  PLATEAU TV — Game Mode  ██████
//  Activé uniquement quand un jeu démarre.
//  Contient : fond coloré, spots, pupitre, public, bannière,
//             écran question, scoreboard
// ════════════════════════════════════════════════════════════════════
const _setGroup = new THREE.Group();   // tout le décor plateau
_setGroup.visible = false;
_scene.add(_setGroup);

// ── Extras lumières plateau ──
const _setSpots = [];

// ── Fond dégradé coloré ──
let _backdropMesh = null;

// ── Public (silhouettes) ──
const _audienceFigures = [];

// ── Pupitre ──
let _podiumGroup = null;

// ── Bannière BRAIN CLASH ──
let _bannerMesh = null;

// ── Écrans ──
let _qCanvas = null, _qTexture = null, _qMesh = null;
let _sbCanvas = null, _sbTexture = null, _sbMesh = null;
let _currentQuestion = null;

function _buildGameSet() {
  // ── 1. FOND COLORÉ (grande toile derrière la scène) ──
  const bdCvs = document.createElement('canvas');
  bdCvs.width = 512; bdCvs.height = 512;
  const bdCtx = bdCvs.getContext('2d');
  const grad = bdCtx.createRadialGradient(256, 300, 20, 256, 256, 400);
  grad.addColorStop(0, '#1e3a8a');
  grad.addColorStop(0.3, '#4338ca');
  grad.addColorStop(0.6, '#7e22ce');
  grad.addColorStop(0.8, '#0f172a');
  grad.addColorStop(1, '#020617');
  bdCtx.fillStyle = grad;
  bdCtx.fillRect(0, 0, 512, 512);
  // Bandes colorées
  const colors = ['#3b82f6','#a855f7','#ec4899','#22c55e','#eab308'];
  colors.forEach((c, i) => {
    bdCtx.globalAlpha = 0.12;
    bdCtx.fillStyle = c;
    bdCtx.fillRect(0, 80 + i * 80, 512, 50);
  });
  bdCtx.globalAlpha = 1;

  const bdTex = new THREE.CanvasTexture(bdCvs);
  _backdropMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10),
    new THREE.MeshBasicMaterial({ map: bdTex, fog: false })
  );
  _backdropMesh.position.set(0, 3, -6);
  _setGroup.add(_backdropMesh);

  // ── 2. SPOTS LUMINEUX (cônes transparents) ──
  const spotPositions = [
    { x:-4, col:0x3b82f6 }, { x:-2, col:0xa855f7 },
    { x: 0, col:0xffffff }, { x: 2, col:0xec4899 }, { x: 4, col:0x22c55e }
  ];
  spotPositions.forEach(sp => {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(1.2, 6, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: sp.col, transparent: true, opacity: 0.06, side: THREE.DoubleSide, fog: false, depthWrite: false })
    );
    cone.position.set(sp.x, 5.5, -3);
    cone.rotation.x = Math.PI;
    _setGroup.add(cone);
    _setSpots.push(cone);

    // Petite lumière pointLight à la base
    const pl = new THREE.PointLight(sp.col, 0.6, 8);
    pl.position.set(sp.x, 8, -3);
    _setGroup.add(pl);
  });

  // ── 5. BANNIÈRE BRAIN CLASH (haut du plateau) ──
  const bCvs = document.createElement('canvas');
  bCvs.width = 1024; bCvs.height = 192;
  const bCtx = bCvs.getContext('2d');
  // Fond
  const bGrad = bCtx.createLinearGradient(0, 0, 1024, 0);
  bGrad.addColorStop(0, '#1e1b4b'); bGrad.addColorStop(0.5, '#312e81'); bGrad.addColorStop(1, '#1e1b4b');
  bCtx.fillStyle = bGrad;
  bCtx.roundRect(0, 0, 1024, 192, 16); bCtx.fill();
  // Bordure
  bCtx.strokeStyle = '#a78bfa'; bCtx.lineWidth = 6;
  bCtx.roundRect(3, 3, 1018, 186, 14); bCtx.stroke();
  // Texte
  bCtx.font = '900 90px "Poppins", Arial, sans-serif';
  bCtx.textAlign = 'center'; bCtx.textBaseline = 'middle';
  bCtx.shadowColor = '#a78bfa'; bCtx.shadowBlur = 30;
  bCtx.fillStyle = '#ffffff';
  bCtx.fillText('BRAIN CLASH', 512, 100);

  const bTex = new THREE.CanvasTexture(bCvs);
  _bannerMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 1.125),
    new THREE.MeshBasicMaterial({ map: bTex, transparent: true, fog: false, depthWrite: false })
  );
  _bannerMesh.position.set(0, 5.8, -4);
  _setGroup.add(_bannerMesh);

  // ── 6. ÉCRAN QUESTION (droite) ──
  _qCanvas = document.createElement('canvas');
  _qCanvas.width = 1024; _qCanvas.height = 768;
  _qTexture = new THREE.CanvasTexture(_qCanvas);
  const qMat = new THREE.MeshBasicMaterial({ map: _qTexture, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  _qMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 3.9), qMat);
  _qMesh.position.set(3.8, 2.8, -3.5);
  _qMesh.rotation.y = -0.15;
  _qMesh.visible = false;
  _setGroup.add(_qMesh);

  // ── 7. SCOREBOARD (gauche) ──
  _sbCanvas = document.createElement('canvas');
  _sbCanvas.width = 512; _sbCanvas.height = 768;
  _sbTexture = new THREE.CanvasTexture(_sbCanvas);
  const sbMat = new THREE.MeshBasicMaterial({ map: _sbTexture, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  _sbMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.6), sbMat);
  _sbMesh.position.set(-4.2, 2.8, -3.5);
  _sbMesh.rotation.y = 0.15;
  _sbMesh.visible = false;
  _setGroup.add(_sbMesh);
}
_buildGameSet();

// Mise à jour couleurs du plateau selon le thème
function _updateSetColors(t) {
  // Update backdrop gradient
  if (_backdropMesh) {
    const bdCvs = document.createElement('canvas');
    bdCvs.width = 512; bdCvs.height = 512;
    const ctx = bdCvs.getContext('2d');
    const grad = ctx.createRadialGradient(256, 300, 20, 256, 256, 400);
    const accent = _hexStr(t.accentCol);
    const rim    = _hexStr(t.rimCol);
    grad.addColorStop(0, accent);
    grad.addColorStop(0.4, rim);
    grad.addColorStop(0.7, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    _backdropMesh.material.map = new THREE.CanvasTexture(bdCvs);
    _backdropMesh.material.needsUpdate = true;
  }
}

// ════════════════════════════════════════════
//  ENTER / EXIT GAME MODE
// ════════════════════════════════════════════
let _gamePlayerCount = 4;

function _resizeCanvas(fullscreen) {
  if (fullscreen) {
    _canvas.style.inset = '0';
    _canvas.style.left = '';
    _canvas.style.bottom = '';
    _canvas.style.width = '';
    _canvas.style.height = '';
    _renderer.setSize(window.innerWidth, window.innerHeight);
    _camera.aspect = window.innerWidth / window.innerHeight;
  } else {
    // Largeur = 28% (alignée avec le panneau scores en haut à gauche)
    const w = Math.round(window.innerWidth * 0.28);
    // Hauteur dynamique : écran total − hauteur panneau scores − marge
    // Panneau scores : header ~54px + n×50px par joueur + 6px gap inter-rangées
    const scoreH = 54 + _gamePlayerCount * 50 + (_gamePlayerCount - 1) * 6 + 32; // +32 marges
    const h = Math.max(200, window.innerHeight - scoreH - 16);
    _canvas.style.inset = 'auto';
    _canvas.style.left = '0';
    _canvas.style.bottom = '0';
    _canvas.style.width = w + 'px';
    _canvas.style.height = h + 'px';
    _renderer.setSize(w, h);
    _camera.aspect = w / h;
  }
  _camera.updateProjectionMatrix();
}

// Appelé depuis drawQ_host quand le nombre de joueurs est connu
function _setPlayerCount(n) {
  _gamePlayerCount = Math.max(1, n || 4);
  if (_gameMode) _resizeCanvas(false);
}

function _enterGameMode() {
  if (_gameMode) return;
  _gameMode = true;
  _setGroup.visible = true;
  if (_logoMesh) _logoMesh.visible = false;
  // AJ : avancé, même taille qu'en home
  _siloGroup.position.set(0, -1.02, -0.3);
  _siloGroup.scale.set(2.2, 2.2, 2.2);
  // Brouillard repoussé
  _scene.fog.near = 12;
  _scene.fog.far = 30;
  // Canvas en bas à gauche
  _resizeCanvas(false);
  const t = THEME3D[_currentThemeId] || THEME3D.culture;
  _updateSetColors(t);
}

function _exitGameMode() {
  if (!_gameMode) return;
  _gameMode = false;
  _setGroup.visible = false;
  _currentQuestion = null;
  if (_qMesh) _qMesh.visible = false;
  if (_sbMesh) _sbMesh.visible = false;
  // Restaurer position/taille AJ
  _siloGroup.position.set(0, -1.02, -0.3);
  _siloGroup.scale.set(2.2, 2.2, 2.2);
  // Restaurer brouillard
  const t = THEME3D[_currentThemeId] || THEME3D.culture;
  _scene.fog.near = t.fogNear;
  _scene.fog.far = t.fogFar;
  // Canvas fullscreen
  _resizeCanvas(true);
  if (_logoMesh && _logoVisible) _logoMesh.visible = true;
}

// ════════════════════════════════════════════
//  ANIMATION DU PUBLIC
// ════════════════════════════════════════════
function _tickAudience(t) {
  if (!_gameMode) return;
  _audienceFigures.forEach(fig => {
    const wave = Math.sin(t * 2.5 + fig._phase) * 0.5 + 0.5; // 0..1
    // Bras qui se lèvent et s'abaissent
    fig._armL.rotation.z =  0.3 + wave * 1.2;
    fig._armR.rotation.z = -0.3 - wave * 1.2;
    fig._armL.position.y = 0.5 + wave * 0.15;
    fig._armR.position.y = 0.5 + wave * 0.15;
  });
}

// ════════════════════════════════════════════
//  UTILITAIRES CANVAS
// ════════════════════════════════════════════
function _hexToRgb(hex) { return { r:(hex>>16)&255, g:(hex>>8)&255, b:hex&255 }; }
function _hexStr(hex) { const {r,g,b}=_hexToRgb(hex); return `rgb(${r},${g},${b})`; }

function _wrapText(ctx, text, maxWidth) {
  const words = text.split(' '), lines = [];
  let line = '';
  words.forEach(w => {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  });
  if (line) lines.push(line);
  return lines;
}

// ════════════════════════════════════════════
//  DESSINER L'ÉCRAN QUESTION
//  Style inspiré de l'image de référence :
//  boutons colorés A(bleu) B(rouge) C(vert) D(jaune)
// ════════════════════════════════════════════
const _answerColors = [
  { bg: '#1d4ed8', border: '#3b82f6', label: 'A' }, // Bleu
  { bg: '#b91c1c', border: '#ef4444', label: 'B' }, // Rouge
  { bg: '#15803d', border: '#22c55e', label: 'C' }, // Vert
  { bg: '#a16207', border: '#eab308', label: 'D' }, // Jaune
];

function _drawQuestionCanvas(q, revealIdx) {
  const cvs = _qCanvas, ctx = cvs.getContext('2d');
  const W = cvs.width, H = cvs.height;
  const accent = _hexStr((THEME3D[_currentThemeId] || THEME3D.culture).accentCol);

  // Fond
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(8,8,30,0.92)';
  ctx.beginPath(); ctx.roundRect(0, 0, W, H, 20); ctx.fill();

  // Bordure luminescente
  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  ctx.shadowColor = accent; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.roundRect(4, 4, W-8, H-8, 18); ctx.stroke();
  ctx.shadowBlur = 0;

  // Question texte
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  const lines = _wrapText(ctx, q.q, W - 80);
  let y = 50;
  lines.forEach(l => { ctx.fillText(l, W / 2, y); y += 52; });

  // Grille 2×2 des réponses
  const gapX = 24, gapY = 20;
  const btnW = (W - gapX * 3) / 2;
  const btnH = 110;
  const startY = Math.max(y + 30, 260);

  _answerColors.forEach((ac, i) => {
    if (!q.a || !q.a[i]) return;
    const col = i % 2, row = Math.floor(i / 2);
    const bx = gapX + col * (btnW + gapX);
    const by = startY + row * (btnH + gapY);
    const isCorrect = i === q.c;
    const isRevealed = revealIdx !== undefined;

    // Fond bouton
    if (isRevealed && isCorrect) {
      ctx.fillStyle = '#15803d';
    } else if (isRevealed && !isCorrect) {
      ctx.fillStyle = 'rgba(30,30,50,0.6)';
    } else {
      ctx.fillStyle = ac.bg;
    }
    ctx.beginPath(); ctx.roundRect(bx, by, btnW, btnH, 14); ctx.fill();

    // Bordure
    ctx.strokeStyle = (isRevealed && isCorrect) ? '#4ade80' : (isRevealed ? 'rgba(100,100,120,0.4)' : ac.border);
    ctx.lineWidth = (isRevealed && isCorrect) ? 4 : 3;
    ctx.beginPath(); ctx.roundRect(bx, by, btnW, btnH, 14); ctx.stroke();

    // Lettre dans un cercle
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(bx + 40, by + btnH / 2, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(ac.label, bx + 40, by + btnH / 2 + 1);

    // Texte réponse
    ctx.fillStyle = isRevealed && !isCorrect ? 'rgba(255,255,255,0.3)' : '#ffffff';
    ctx.font = (isRevealed && isCorrect) ? 'bold 26px Arial' : '26px Arial';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const aLines = _wrapText(ctx, q.a[i], btnW - 90);
    aLines.forEach((al, ai) => ctx.fillText(al, bx + 72, by + btnH / 2 - (aLines.length - 1) * 16 + ai * 32));

    // Check vert
    if (isRevealed && isCorrect) {
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText('✓', bx + btnW - 20, by + btnH / 2);
    }
  });

  // Fun fact
  if (revealIdx !== undefined && q.f) {
    const fy = startY + 2 * (btnH + gapY) + 10;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.roundRect(gapX, fy, W - gapX * 2, 72, 12); ctx.fill();
    ctx.fillStyle = accent;
    ctx.font = 'italic 22px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const factLines = _wrapText(ctx, '💡 ' + q.f, W - 80);
    factLines.slice(0, 2).forEach((fl, fi) => ctx.fillText(fl, W / 2, fy + 12 + fi * 28));
  }

  _qTexture.needsUpdate = true;
}

// ════════════════════════════════════════════
//  DESSINER LE SCOREBOARD
// ════════════════════════════════════════════
function _drawScoreboardCanvas(scores, players) {
  const cvs = _sbCanvas, ctx = cvs.getContext('2d');
  const W = cvs.width, H = cvs.height;
  const accent = _hexStr((THEME3D[_currentThemeId] || THEME3D.culture).accentCol);

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(8,8,30,0.92)';
  ctx.beginPath(); ctx.roundRect(0, 0, W, H, 16); ctx.fill();
  ctx.strokeStyle = accent; ctx.lineWidth = 4;
  ctx.shadowColor = accent; ctx.shadowBlur = 15;
  ctx.beginPath(); ctx.roundRect(3, 3, W-6, H-6, 14); ctx.stroke();
  ctx.shadowBlur = 0;

  // Titre
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 28px Arial'; ctx.textAlign = 'center';
  ctx.fillText('CLASSEMENT', W / 2, 40);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '18px Arial';
  ctx.fillText('DES JOUEURS', W / 2, 65);

  // Séparateur
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(30, 82); ctx.lineTo(W - 30, 82); ctx.stroke();

  const pColors = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#8b5cf6','#ec4899','#14b8a6'];
  const sorted = scores.map((s, i) => ({ score: s, name: players?.[i] || ('P'+(i+1)), i }))
    .sort((a, b) => b.score - a.score).slice(0, 8);

  sorted.forEach((p, rank) => {
    const py = 100 + rank * 78;
    const col = pColors[p.i % 8];

    // Fond ligne
    ctx.fillStyle = col + '18';
    ctx.beginPath(); ctx.roundRect(16, py, W - 32, 65, 10); ctx.fill();

    // Avatar (cercle coloré)
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(48, py + 32, 18, 0, Math.PI * 2); ctx.fill();
    // Initiale dans le cercle
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.name.charAt(0).toUpperCase(), 48, py + 33);

    // Rang
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = rank < 3 ? '#fbbf24' : 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 16px Arial';
    const medals = ['🥇','🥈','🥉'];
    ctx.fillText(rank < 3 ? medals[rank] : (rank + 1) + '.', 20, py + 4);

    // Nom
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(p.name.substring(0, 9), 76, py + 14);

    // Score
    ctx.fillStyle = col;
    ctx.font = 'bold 14px Arial';
    ctx.fillText(p.score.toLocaleString() + ' pts', 76, py + 42);
  });

  _sbTexture.needsUpdate = true;
}

// ════════════════════════════════════════════
//  BOUCLE D'ANIMATION
// ════════════════════════════════════════════
const _clock3d = new THREE.Clock();
let _prevT = 0;

function _loop3d() {
  requestAnimationFrame(_loop3d);
  const t     = _clock3d.getElapsedTime();
  const delta = t - _prevT;
  _prevT = t;

  if (_mixer) _mixer.update(delta);
  _tickCharacter(t);
  _tickLogo(t);

  // Oscillation écrans
  if (_qMesh && _qMesh.visible) {
    _qMesh.position.y = 2.8 + Math.sin(t * 0.6) * 0.04;
  }
  if (_sbMesh && _sbMesh.visible) {
    _sbMesh.position.y = 2.8 + Math.sin(t * 0.5 + 1) * 0.04;
  }

  // Rotation légère des cônes de spot
  if (_gameMode) {
    _setSpots.forEach((cone, i) => {
      cone.rotation.z = Math.sin(t * 0.3 + i * 1.2) * 0.08;
    });
  }

  // Particules
  if (_particles) {
    const pos = _particles.geometry.attributes.position.array;
    const { spd, iniY } = _particles.geometry.userData;
    for (let i = 0; i < spd.length; i++) {
      pos[i*3+1] += spd[i] * .006;
      if (pos[i*3+1] > 8) pos[i*3+1] = iniY[i] - 7;
    }
    _particles.geometry.attributes.position.needsUpdate = true;
    _particles.rotation.y += .0004;
  }

  if (_gameMode) {
    // Petit canvas en bas à gauche : zoom serré sur AJ, tête visible
    _camera.position.x = Math.sin(t*.09) * .05;
    _camera.position.y = 1.2 + Math.sin(t*.12) * .03;
    _camera.position.z = 4.8;
    _camera.lookAt(0, 1.0, 0);
  } else {
    // Plein écran : AJ cadré entier avec légère hauteur pour voir sa tête
    _camera.position.x = Math.sin(t*.1) * .12;
    _camera.position.y = 1.2 + Math.sin(t*.15) * .04;
    _camera.position.z = 5.5;
    _camera.lookAt(0, 1.0, 0);
  }

  _renderer.render(_scene, _camera);
}
_loop3d();

// ════════════════════════════════════════════
//  API : Questions & Scores
// ════════════════════════════════════════════
function _updateQuestion(q) {
  if (!q) return;
  _currentQuestion = q;
  _drawQuestionCanvas(q, undefined);
  _qMesh.visible = true;
}

function _updateReveal(revealed, result) {
  if (!revealed || !_currentQuestion) return;
  _drawQuestionCanvas(_currentQuestion, _currentQuestion.c);
  if (result && ((result.pts || 0) > 0 || result.scorer)) _setAnim('react');
}

function _updateScores(scores, players) {
  if (!scores || !scores.length) return;
  _drawScoreboardCanvas(scores, players);
  _sbMesh.visible = true;
}

function _resetScreen() {
  _currentQuestion = null;
  if (_qMesh) _qMesh.visible = false;
  if (_sbMesh) _sbMesh.visible = false;
  if (_logoMesh && _logoVisible) _logoMesh.visible = true;
}

// ════════════════════════════════════════════
//  API PUBLIQUE
// ════════════════════════════════════════════
window.SCENE3D = {
  setTheme       : _applyTheme3d,
  talk           : () => _setAnim('talk'),
  react          : () => _setAnim('react'),
  idle           : () => _setAnim('idle'),
  defeated       : () => _setAnim('defeated'),
  think          : () => _setAnim('think'),
  showLogo       : _showLogo,
  updateQuestion : _updateQuestion,
  updateReveal   : _updateReveal,
  updateScores   : _updateScores,
  resetScreen    : _resetScreen,
  enterGameMode  : _enterGameMode,
  exitGameMode   : _exitGameMode,
  setPlayerCount : _setPlayerCount,
};
