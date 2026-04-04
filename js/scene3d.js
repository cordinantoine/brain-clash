/* ════════════════════════════════════════════
   scene3d.js — BRAIN CLASH
   Contient : scène Three.js, silhouette 3D,
              ambiances par thème, animations
              + écran question & scoreboard 3D
   Dépend de  : three.min.js (chargé avant)
   Expose     : window.SCENE3D { setTheme, talk, react, idle,
                  updateQuestion, updateReveal, updateScores, resetScreen }
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
  _camera.aspect = window.innerWidth / window.innerHeight;
  _camera.updateProjectionMatrix();
  _renderer.setSize(window.innerWidth, window.innerHeight);
});

// ════════════════════════════════════════════
//  PERSONNAGE (silhouette)
// ════════════════════════════════════════════
const _siloGroup = new THREE.Group();
_scene.add(_siloGroup);

function _mkMesh(geo, col = 0x08051a) {
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color:col, roughness:.92, metalness:.04 }));
}

const _head  = _mkMesh(new THREE.SphereGeometry(.27, 16, 16));   _head.position.set(0, 3.1, 0); _head.castShadow = true;
const _neck  = _mkMesh(new THREE.CylinderGeometry(.09, .11, .18, 8)); _neck.position.set(0, 2.78, 0);
const _torso = _mkMesh(new THREE.BoxGeometry(.7, .88, .3));        _torso.position.set(0, 2.2, 0); _torso.castShadow = true;
const _hips  = _mkMesh(new THREE.BoxGeometry(.58, .28, .26));      _hips.position.set(0, 1.66, 0);

const _lSh = new THREE.Group(); _lSh.position.set(-.42, 2.58, 0);
const _rSh = new THREE.Group(); _rSh.position.set( .42, 2.58, 0);

function _makeArm(side) {
  const g  = new THREE.Group();
  const up = _mkMesh(new THREE.CylinderGeometry(.085, .075, .52, 8));
  up.position.set(side * -.1, -.26, 0); up.rotation.z = side * .18;
  const lo = _mkMesh(new THREE.CylinderGeometry(.07, .06, .46, 8));
  lo.position.set(side * -.05, -.78, .04);
  const ha = _mkMesh(new THREE.SphereGeometry(.08, 8, 8));
  ha.position.set(side * -.03, -1.08, .07);
  g.add(up, lo, ha);
  return g;
}
_lSh.add(_makeArm(-1));
_rSh.add(_makeArm(1));

const _lLeg = new THREE.Group(); _lLeg.position.set(-.17, 1.5, 0);
const _rLeg = new THREE.Group(); _rLeg.position.set( .17, 1.5, 0);

function _makeLeg(side) {
  const g  = new THREE.Group();
  const th = _mkMesh(new THREE.CylinderGeometry(.105, .095, .52, 8)); th.position.set(0, -.26, 0);
  const sh = _mkMesh(new THREE.CylinderGeometry(.082, .072, .48, 8)); sh.position.set(0, -.78, 0);
  const fo = _mkMesh(new THREE.BoxGeometry(.13, .085, .24));           fo.position.set(side*.02, -1.08, .05);
  g.add(th, sh, fo);
  return g;
}
_lLeg.add(_makeLeg(-1));
_rLeg.add(_makeLeg(1));

_siloGroup.add(_head, _neck, _torso, _hips, _lSh, _rSh, _lLeg, _rLeg);
_siloGroup.position.set(0, -.65, -1.2);

// Sol réfléchissant
const _floor = new THREE.Mesh(
  new THREE.PlaneGeometry(22, 22),
  new THREE.MeshStandardMaterial({ color:0x080618, roughness:.35, metalness:.5 })
);
_floor.rotation.x = -Math.PI / 2;
_floor.position.y = -.64;
_floor.receiveShadow = true;
_scene.add(_floor);

// Reflet
const _refl = _siloGroup.clone();
_refl.scale.set(1, -0.28, 1);
_refl.position.y = -1.3;
_refl.traverse(c => {
  if (c.isMesh) { c.material = c.material.clone(); c.material.opacity = .1; c.material.transparent = true; }
});
_scene.add(_refl);

// ════════════════════════════════════════════
//  LUMIÈRES
// ════════════════════════════════════════════
const _ambLight  = new THREE.AmbientLight(0x3a2f7a, .55);
_scene.add(_ambLight);

const _spotLight = new THREE.SpotLight(0xa78bfa, 2.4, 20, Math.PI/5, .4, 1.4);
_spotLight.position.set(0, 8, 2.5);
_spotLight.castShadow = true;
_scene.add(_spotLight);

const _spotTarget = new THREE.Object3D();
_spotTarget.position.set(0, 1.6, -.5);
_scene.add(_spotTarget);
_spotLight.target = _spotTarget;

const _rimLight  = new THREE.PointLight(0x7c3aed, 1.4, 12);
_rimLight.position.set(-2.8, 3.2, -3.5);
_scene.add(_rimLight);

const _fillLight = new THREE.PointLight(0xa78bfa, .7, 8);
_fillLight.position.set(0, -.3, .8);
_scene.add(_fillLight);

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
  _siloGroup.traverse(c => {
    if (c.isMesh && !c.material.transparent) {
      c.material.color.setHex(t.siloCol);
      c.material.emissive = new THREE.Color(t.glowCol);
      c.material.emissiveIntensity = .045;
    }
  });
  _buildParticles(t.partCol);
}
_applyTheme3d('culture');

// ════════════════════════════════════════════
//  ANIMATIONS PERSONNAGE
// ════════════════════════════════════════════
let _animState = 'idle';
let _animTime  = 0;

function _setAnim(state) { _animState = state; _animTime = 0; }

function _tickCharacter(t) {
  _animTime += .016;

  if (_animState === 'idle') {
    _siloGroup.position.y = -.65 + Math.sin(t*.75) * .014;
    _torso.rotation.z     = Math.sin(t*.55) * .013;
    _head.rotation.y      = Math.sin(t*.38) * .07;
    _head.rotation.x      = 0;
    _lSh.rotation.z       = Math.sin(t*.65+.4) * .05;
    _rSh.rotation.z       = -Math.sin(t*.65+.4) * .05;
    _lSh.rotation.x = _rSh.rotation.x = 0;
    _lLeg.rotation.x = _rLeg.rotation.x = 0;
    _siloGroup.rotation.y = Math.sin(t*.2) * .04;

  } else if (_animState === 'talk') {
    _siloGroup.position.y = -.65 + Math.sin(t*1.7) * .022;
    _head.rotation.x      = Math.sin(t*2.1) * .11;
    _head.rotation.y      = Math.sin(t*1.05) * .17;
    _torso.rotation.z     = Math.sin(t*1.25) * .038;
    _torso.rotation.x     = Math.sin(t*.85) * .022;
    _lSh.rotation.x = -.55 + Math.sin(t*1.95) * .32;
    _lSh.rotation.z =  .28 + Math.sin(t*1.45+.9) * .18;
    _rSh.rotation.x = -.28 + Math.sin(t*1.55+.75) * .42;
    _rSh.rotation.z = -.38 + Math.sin(t*2.05) * .22;
    _siloGroup.rotation.y = Math.sin(t*.45) * .07;

  } else if (_animState === 'react') {
    const j = Math.max(0, Math.sin(_animTime*4.5)) * .28;
    _siloGroup.position.y = -.65 + j;
    _head.rotation.x = -.18 + Math.sin(t*3) * .09;
    _head.rotation.y = Math.sin(t*2.2) * .13;
    _lSh.rotation.x = -1.3 + Math.sin(t*3) * .18;   _lSh.rotation.z =  .65;
    _rSh.rotation.x = -1.3 + Math.sin(t*3.2) * .18; _rSh.rotation.z = -.65;
    _lLeg.rotation.x =  Math.sin(_animTime*4.5) * .28;
    _rLeg.rotation.x = -Math.sin(_animTime*4.5) * .28;
    if (_animTime > 2.5) _setAnim('idle');
  }

  _refl.position.x = _siloGroup.position.x;
  _refl.rotation.y = _siloGroup.rotation.y;
}

// ════════════════════════════════════════════
//  LOGO 3D
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
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#a78bfa';
  ctx.shadowBlur = 40;
  ctx.fillText('BRAIN', 512, 90);
  ctx.shadowColor = '#7c3aed';
  ctx.shadowBlur = 50;
  ctx.fillStyle = '#a78bfa';
  ctx.fillText('CLASH', 512, 195);
  const tex = new THREE.CanvasTexture(cvs);
  tex.needsUpdate = true;
  const geo = new THREE.PlaneGeometry(5, 1.25);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  _logoMesh = new THREE.Mesh(geo, mat);
  _logoMesh.position.set(0, 4.2, -1.2);
  _logoMesh.visible = false;
  _scene.add(_logoMesh);
}
_buildLogo();

function _showLogo(visible) {
  _logoVisible = visible;
  if (_logoMesh) _logoMesh.visible = visible;
}

function _tickLogo(t) {
  if (!_logoMesh || !_logoVisible) return;
  _logoMesh.position.y = 4.2 + Math.sin(t * 0.8) * 0.12;
  _logoMesh.rotation.y = Math.sin(t * 0.4) * 0.15;
  _logoMesh.material.opacity = 0.85 + Math.sin(t * 1.5) * 0.15;
}

// ════════════════════════════════════════════
//  ÉCRAN DE QUESTION (caché par défaut)
//  Plane avec CanvasTexture, visible uniquement
//  pendant la phase question
// ════════════════════════════════════════════
let _qCanvas = null, _qTexture = null, _qMesh = null;
let _sbCanvas = null, _sbTexture = null, _sbMesh = null;
let _currentQuestion = null;

function _buildScreens() {
  // Écran question — à droite du personnage, incliné légèrement
  _qCanvas = document.createElement('canvas');
  _qCanvas.width = 1024; _qCanvas.height = 768;
  _qTexture = new THREE.CanvasTexture(_qCanvas);
  const qMat = new THREE.MeshBasicMaterial({ map: _qTexture, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  _qMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3.375), qMat);
  _qMesh.position.set(3.2, 2.2, -2);
  _qMesh.rotation.y = -Math.PI / 8;
  _qMesh.visible = false;
  _scene.add(_qMesh);

  // Scoreboard — à gauche
  _sbCanvas = document.createElement('canvas');
  _sbCanvas.width = 512; _sbCanvas.height = 768;
  _sbTexture = new THREE.CanvasTexture(_sbCanvas);
  const sbMat = new THREE.MeshBasicMaterial({ map: _sbTexture, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  _sbMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 3), sbMat);
  _sbMesh.position.set(-3.5, 2.2, -2);
  _sbMesh.rotation.y = Math.PI / 8;
  _sbMesh.visible = false;
  _scene.add(_sbMesh);
}
_buildScreens();

// ── Utilitaires canvas ──
function _hexToRgb(hex) {
  return { r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255 };
}

function _hexStr(hex) {
  const { r, g, b } = _hexToRgb(hex);
  return `rgb(${r},${g},${b})`;
}

function _wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  words.forEach(w => {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

// ── Dessiner l'écran question ──
function _drawQuestionCanvas(q, revealIdx) {
  const cvs = _qCanvas;
  const ctx = cvs.getContext('2d');
  const accent = _hexStr((THEME3D[_currentThemeId] || THEME3D.culture).accentCol);

  // Fond semi-transparent
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.roundRect(10, 10, cvs.width - 20, cvs.height - 20, 24);
  ctx.fill();

  // Bordure colorée
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.roundRect(10, 10, cvs.width - 20, cvs.height - 20, 24);
  ctx.stroke();

  // Question
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const lines = _wrapText(ctx, q.q, cvs.width - 100);
  let y = 60;
  lines.forEach(l => { ctx.fillText(l, cvs.width / 2, y); y += 46; });

  // Séparateur
  ctx.strokeStyle = accent + '88';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, y + 10); ctx.lineTo(cvs.width - 60, y + 10);
  ctx.stroke();
  y += 32;

  // Réponses A/B/C/D
  const labels = ['A', 'B', 'C', 'D'];
  labels.forEach((lbl, i) => {
    if (!q.a || !q.a[i]) return;
    const oy = y + i * 130;
    const isCorrect = i === q.c;
    const isRevealed = revealIdx !== undefined;

    // Fond bouton
    if (isRevealed) {
      ctx.fillStyle = isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)';
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
    }
    ctx.beginPath();
    ctx.roundRect(50, oy, cvs.width - 100, 115, 16);
    ctx.fill();

    // Bordure
    ctx.strokeStyle = isRevealed && isCorrect ? '#22c55e' : (accent + '66');
    ctx.lineWidth = isRevealed && isCorrect ? 3 : 2;
    ctx.beginPath();
    ctx.roundRect(50, oy, cvs.width - 100, 115, 16);
    ctx.stroke();

    // Lettre
    ctx.fillStyle = accent;
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lbl, 80, oy + 38);

    // Texte réponse
    ctx.fillStyle = '#ffffff';
    ctx.font = '26px Arial, sans-serif';
    const aLines = _wrapText(ctx, q.a[i], cvs.width - 200);
    aLines.forEach((al, ai) => ctx.fillText(al, 130, oy + 34 + ai * 34));

    // Check vert si bonne réponse révélée
    if (isRevealed && isCorrect) {
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'right';
      ctx.fillText('✓', cvs.width - 70, oy + 32);
    }
  });

  // Fun fact si révélé
  if (revealIdx !== undefined && q.f) {
    const factY = y + 4 * 130 + 10;
    ctx.fillStyle = accent + 'cc';
    ctx.font = 'italic 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    const factLines = _wrapText(ctx, '💡 ' + q.f, cvs.width - 100);
    factLines.slice(0, 2).forEach((fl, fi) => ctx.fillText(fl, cvs.width / 2, factY + fi * 30));
  }

  _qTexture.needsUpdate = true;
}

// ── Dessiner le scoreboard ──
function _drawScoreboardCanvas(scores, players) {
  const cvs = _sbCanvas;
  const ctx = cvs.getContext('2d');
  const accent = _hexStr((THEME3D[_currentThemeId] || THEME3D.culture).accentCol);

  ctx.clearRect(0, 0, cvs.width, cvs.height);
  ctx.fillStyle = 'rgba(0,0,0,0.82)';
  ctx.roundRect(10, 10, cvs.width - 20, cvs.height - 20, 20);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.roundRect(10, 10, cvs.width - 20, cvs.height - 20, 20);
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SCORES', cvs.width / 2, 55);

  ctx.strokeStyle = accent + '66';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 75); ctx.lineTo(cvs.width - 40, 75);
  ctx.stroke();

  const playerColors = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#8b5cf6','#ec4899','#14b8a6'];
  const sorted = scores.map((s, i) => ({ score: s, name: players?.[i] || ('P' + (i+1)), i }))
    .sort((a, b) => b.score - a.score).slice(0, 8);

  sorted.forEach((p, rank) => {
    const py = 110 + rank * 78;
    const col = playerColors[p.i % 8];

    ctx.fillStyle = col + '22';
    ctx.roundRect(30, py - 10, cvs.width - 60, 65, 12);
    ctx.fill();

    // Rang
    ctx.fillStyle = rank === 0 ? '#fbbf24' : 'rgba(255,255,255,0.4)';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(rank === 0 ? '🥇' : (rank + 1) + '.', 45, py + 30);

    // Nom
    ctx.fillStyle = col;
    ctx.font = 'bold 24px Arial';
    ctx.fillText(p.name.substring(0, 10), 90, py + 30);

    // Score
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(p.score, cvs.width - 45, py + 32);
  });

  _sbTexture.needsUpdate = true;
}

// ════════════════════════════════════════════
//  BOUCLE D'ANIMATION
// ════════════════════════════════════════════
const _clock3d = new THREE.Clock();

function _loop3d() {
  requestAnimationFrame(_loop3d);
  const t = _clock3d.getElapsedTime();

  _tickCharacter(t);
  _tickLogo(t);

  // Légère oscillation des écrans
  if (_qMesh && _qMesh.visible) {
    _qMesh.position.y = 2.2 + Math.sin(t * 0.6) * 0.04;
  }
  if (_sbMesh && _sbMesh.visible) {
    _sbMesh.position.y = 2.2 + Math.sin(t * 0.5 + 1) * 0.04;
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

  _camera.position.x = Math.sin(t*.1) * .2;
  _camera.position.y = 2.0 + Math.sin(t*.15) * .07;
  _camera.lookAt(0, 1.6, 0);

  _renderer.render(_scene, _camera);
}
_loop3d();

// ════════════════════════════════════════════
//  NOUVELLES FONCTIONS API — Questions & Scores
// ════════════════════════════════════════════

function _updateQuestion(q) {
  if (!q) return;
  _currentQuestion = q;
  _drawQuestionCanvas(q, undefined);
  _qMesh.visible = true;
  // Masquer le logo quand une question est affichée
  if (_logoMesh) _logoMesh.visible = false;
}

function _updateReveal(revealed, result) {
  if (!revealed || !_currentQuestion) return;
  _drawQuestionCanvas(_currentQuestion, _currentQuestion.c);
  if (result && ((result.pts || 0) > 0 || result.scorer)) {
    _setAnim('react');
  }
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
  // Restaurer le logo si visible précédemment
  if (_logoMesh && _logoVisible) _logoMesh.visible = true;
}

// ════════════════════════════════════════════
//  API PUBLIQUE
// ════════════════════════════════════════════
window.SCENE3D = {
  setTheme      : _applyTheme3d,
  talk          : () => _setAnim('talk'),
  react         : () => _setAnim('react'),
  idle          : () => _setAnim('idle'),
  showLogo      : _showLogo,
  updateQuestion: _updateQuestion,
  updateReveal  : _updateReveal,
  updateScores  : _updateScores,
  resetScreen   : _resetScreen,
};
