// ============================================================================
// BRAIN CLASH - Scene3D Module (Three.js r128)
// Comprehensive TV Game Show Set: Stage, Presenter, Audience, Screens
// ============================================================================

// Theme-specific 3D settings
const THEME3D = {
  culture: { fogColor: 0x1e1b4b, fogNear: 9, fogFar: 24, ambCol: 0x3a2f7a, ambInt: 0.55, spot1Col: 0xa78bfa, spot1Int: 2.4, rimCol: 0x7c3aed, rimInt: 1.4, stageCol: 0x2d1b69, accentCol: 0xa78bfa, partCol: 0xa78bfa, bgCol: 0x0a0918 },
  music: { fogColor: 0x1a2332, fogNear: 9, fogFar: 24, ambCol: 0x2d3e5f, ambInt: 0.55, spot1Col: 0x60a5fa, spot1Int: 2.4, rimCol: 0x3b82f6, rimInt: 1.4, stageCol: 0x1e3a5f, accentCol: 0x60a5fa, partCol: 0x60a5fa, bgCol: 0x0a0f18 },
  cinema: { fogColor: 0x2a1b3d, fogNear: 9, fogFar: 24, ambCol: 0x4a2f6d, ambInt: 0.55, spot1Col: 0xec4899, spot1Int: 2.4, rimCol: 0xdb2777, rimInt: 1.4, stageCol: 0x3d1f5c, accentCol: 0xec4899, partCol: 0xec4899, bgCol: 0x140a1a },
  sport: { fogColor: 0x2b1f0f, fogNear: 9, fogFar: 24, ambCol: 0x5a3f1f, ambInt: 0.55, spot1Col: 0xfbbf24, spot1Int: 2.4, rimCol: 0xf59e0b, rimInt: 1.4, stageCol: 0x42280f, accentCol: 0xfbbf24, partCol: 0xfbbf24, bgCol: 0x1a0f05 },
  histoire: { fogColor: 0x1f2937, fogNear: 9, fogFar: 24, ambCol: 0x374151, ambInt: 0.55, spot1Col: 0x6366f1, spot1Int: 2.4, rimCol: 0x4f46e5, rimInt: 1.4, stageCol: 0x1f2937, accentCol: 0x6366f1, partCol: 0x6366f1, bgCol: 0x111827 },
  science: { fogColor: 0x164e63, fogNear: 9, fogFar: 24, ambCol: 0x0e7490, ambInt: 0.55, spot1Col: 0x22d3ee, spot1Int: 2.4, rimCol: 0x06b6d4, rimInt: 1.4, stageCol: 0x0d4863, accentCol: 0x22d3ee, partCol: 0x22d3ee, bgCol: 0x082f49 },
  geo: { fogColor: 0x1e3a1f, fogNear: 9, fogFar: 24, ambCol: 0x3f5f40, ambInt: 0.55, spot1Col: 0x4ade80, spot1Int: 2.4, rimCol: 0x22c55e, rimInt: 1.4, stageCol: 0x2d5a30, accentCol: 0x4ade80, partCol: 0x4ade80, bgCol: 0x0f2818 },
  gaming: { fogColor: 0x312e81, fogNear: 9, fogFar: 24, ambCol: 0x4c3aa0, ambInt: 0.55, spot1Col: 0xa78bfa, spot1Int: 2.4, rimCol: 0x8b5cf6, rimInt: 1.4, stageCol: 0x3f2d75, accentCol: 0xa78bfa, partCol: 0xa78bfa, bgCol: 0x1a0f3d },
  hp: { fogColor: 0x1a1a1a, fogNear: 9, fogFar: 24, ambCol: 0x333333, ambInt: 0.55, spot1Col: 0xfbbf24, spot1Int: 2.4, rimCol: 0xf59e0b, rimInt: 1.4, stageCol: 0x2d2d2d, accentCol: 0xfbbf24, partCol: 0xfbbf24, bgCol: 0x0d0d0d },
  nba: { fogColor: 0x1f1f1f, fogNear: 9, fogFar: 24, ambCol: 0x3a3a3a, ambInt: 0.55, spot1Col: 0xef4444, spot1Int: 2.4, rimCol: 0xdc2626, rimInt: 1.4, stageCol: 0x3d2d2d, accentCol: 0xef4444, partCol: 0xef4444, bgCol: 0x0f0f0f },
  football: { fogColor: 0x1e2d1e, fogNear: 9, fogFar: 24, ambCol: 0x3f4f3f, ambInt: 0.55, spot1Col: 0x10b981, spot1Int: 2.4, rimCol: 0x059669, rimInt: 1.4, stageCol: 0x2d3d2d, accentCol: 0x10b981, partCol: 0x10b981, bgCol: 0x0f1f0f },
  francaise: { fogColor: 0x2d1e1e, fogNear: 9, fogFar: 24, ambCol: 0x5f3f3f, ambInt: 0.55, spot1Col: 0xf87171, spot1Int: 2.4, rimCol: 0xef4444, rimInt: 1.4, stageCol: 0x4d3d3d, accentCol: 0xf87171, partCol: 0xf87171, bgCol: 0x1a0f0f },
  lotr: { fogColor: 0x1a1410, fogNear: 9, fogFar: 24, ambCol: 0x3a2818, ambInt: 0.55, spot1Col: 0xd97706, spot1Int: 2.4, rimCol: 0xb45309, rimInt: 1.4, stageCol: 0x3d2d1d, accentCol: 0xd97706, partCol: 0xd97706, bgCol: 0x0d0a08 }
};

// Private state
const _state = {
  scene: null, camera: null, renderer: null,
  stage: null, stageGroup: null,
  presenter: null, presenterGroup: null,
  audience: null, audienceGroup: null,
  questionScreen: null, scoreboard: null,
  ambientLight: null, spotLight: null, rimLight: null,
  animationState: 'idle', speaking: false,
  animationClock: new THREE.Clock(), animationTime: 0,
  currentThemeId: 'culture', currentQuestion: null, currentScores: null,
  questionCanvas: null, questionTexture: null,
  scoreboardCanvas: null, scoreboardTexture: null,
  particles: [], particleGeometry: null, particlePoints: null,
  presenterArmL: null, presenterArmR: null, presenterHead: null, presenterMouth: null,
  presenterTorso: null, audienceFigures: []
};

// ============================================================================
// INITIALIZATION
// ============================================================================

function _initScene() {
  // Scene
  _state.scene = new THREE.Scene();
  _state.scene.background = new THREE.Color(THEME3D.culture.bgCol);
  _state.scene.fog = new THREE.Fog(THEME3D.culture.fogColor, THEME3D.culture.fogNear, THEME3D.culture.fogFar);

  // Camera
  _state.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  _state.camera.position.set(0, 1.5, 8);
  _state.camera.lookAt(0, 1.5, 0);

  // Renderer
  const container = document.getElementById('canvas3d');
  _state.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  _state.renderer.setSize(window.innerWidth, window.innerHeight);
  _state.renderer.setPixelRatio(window.devicePixelRatio);
  _state.renderer.shadowMap.enabled = true;
  _state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(_state.renderer.domElement);

  // Lighting, Stage, Characters, Screens
  _initLighting();
  _initStage();
  _initPresenter();
  _initAudience();
  _initScreens();
  _initParticles();

  // Events
  window.addEventListener('resize', _onWindowResize);

  // Animation loop
  _animate();
}

function _initLighting() {
  const theme = THEME3D[_state.currentThemeId];

  _state.ambientLight = new THREE.AmbientLight(theme.ambCol, theme.ambInt);
  _state.scene.add(_state.ambientLight);

  _state.spotLight = new THREE.SpotLight(theme.spot1Col, theme.spot1Int);
  _state.spotLight.position.set(2, 5, 3);
  _state.spotLight.target.position.set(0, 1, 0);
  _state.spotLight.angle = Math.PI / 3;
  _state.spotLight.castShadow = true;
  _state.spotLight.shadow.mapSize.width = 2048;
  _state.spotLight.shadow.mapSize.height = 2048;
  _state.spotLight.shadow.camera.far = 20;
  _state.scene.add(_state.spotLight);
  _state.scene.add(_state.spotLight.target);

  _state.rimLight = new THREE.DirectionalLight(theme.rimCol, theme.rimInt);
  _state.rimLight.position.set(-3, 4, -4);
  _state.scene.add(_state.rimLight);
}

function _initStage() {
  _state.stageGroup = new THREE.Group();
  _state.scene.add(_state.stageGroup);

  const theme = THEME3D[_state.currentThemeId];

  // Platform
  const platformGeom = new THREE.BoxGeometry(8, 0.3, 6);
  const platformMat = new THREE.MeshStandardMaterial({
    color: theme.stageCol, metalness: 0.3, roughness: 0.7,
    emissive: theme.accentCol, emissiveIntensity: 0.2
  });
  const platform = new THREE.Mesh(platformGeom, platformMat);
  platform.position.y = -0.65;
  platform.castShadow = true;
  platform.receiveShadow = true;
  _state.stageGroup.add(platform);

  // Backdrop pylons
  const pylonGeom = new THREE.BoxGeometry(1.5, 5, 0.8);
  const pylonMat = new THREE.MeshStandardMaterial({
    color: theme.stageCol, metalness: 0.2, roughness: 0.8,
    emissive: theme.accentCol, emissiveIntensity: 0.15
  });

  for (let i = -1; i <= 1; i++) {
    const pylon = new THREE.Mesh(pylonGeom, pylonMat);
    pylon.position.set(i * 3, 1.5, -2.5);
    pylon.castShadow = true;
    pylon.receiveShadow = true;
    _state.stageGroup.add(pylon);
  }

  // Neon accents
  const neonMat = new THREE.LineBasicMaterial({
    color: theme.accentCol, linewidth: 2,
    fog: false
  });

  for (let y = 1; y <= 3; y++) {
    const points = [new THREE.Vector3(-4, y, -2.5), new THREE.Vector3(4, y, -2.5)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, neonMat);
    _state.stageGroup.add(line);
  }
}

function _initPresenter() {
  _state.presenterGroup = new THREE.Group();
  _state.presenterGroup.position.set(-2.5, -0.65, 1);
  _state.stageGroup.add(_state.presenterGroup);

  const skinColor = 0xd4a574;

  // Head
  const headGeom = new THREE.SphereGeometry(0.15, 16, 16);
  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor });
  _state.presenterHead = new THREE.Mesh(headGeom, skinMat);
  _state.presenterHead.position.y = 0.35;
  _state.presenterHead.castShadow = true;
  _state.presenterHead.receiveShadow = true;
  _state.presenterGroup.add(_state.presenterHead);

  // Torso
  const torsoGeom = new THREE.BoxGeometry(0.2, 0.3, 0.15);
  const clothMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f });
  _state.presenterTorso = new THREE.Mesh(torsoGeom, clothMat);
  _state.presenterTorso.position.y = 0.15;
  _state.presenterTorso.castShadow = true;
  _state.presenterTorso.receiveShadow = true;
  _state.presenterGroup.add(_state.presenterTorso);

  // Arms
  const armGeom = new THREE.BoxGeometry(0.08, 0.25, 0.08);
  _state.presenterArmL = new THREE.Mesh(armGeom, skinMat);
  _state.presenterArmL.position.set(-0.15, 0.2, 0);
  _state.presenterArmL.castShadow = true;
  _state.presenterArmL.receiveShadow = true;
  _state.presenterGroup.add(_state.presenterArmL);

  _state.presenterArmR = new THREE.Mesh(armGeom, skinMat);
  _state.presenterArmR.position.set(0.15, 0.2, 0);
  _state.presenterArmR.castShadow = true;
  _state.presenterArmR.receiveShadow = true;
  _state.presenterGroup.add(_state.presenterArmR);

  // Mouth
  const mouthGeom = new THREE.BoxGeometry(0.08, 0.05, 0.05);
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
  _state.presenterMouth = new THREE.Mesh(mouthGeom, mouthMat);
  _state.presenterMouth.position.set(0, 0.28, 0.12);
  _state.presenterGroup.add(_state.presenterMouth);
}

function _initAudience() {
  _state.audienceGroup = new THREE.Group();
  _state.audienceGroup.position.z = -2;
  _state.stageGroup.add(_state.audienceGroup);

  const skinColor = 0xd4a574;
  const clothMat = new THREE.MeshStandardMaterial({ color: 0x2d2d2d });
  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor });

  const rowCount = 4;
  const colCount = 6;
  const rowSpacing = 1.2;
  const colSpacing = 1.2;

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      const figureGroup = new THREE.Group();
      figureGroup.position.set(
        (col - colCount / 2) * colSpacing + colSpacing / 2,
        row * rowSpacing * 0.3,
        row * rowSpacing
      );

      const headGeom = new THREE.SphereGeometry(0.1, 8, 8);
      const head = new THREE.Mesh(headGeom, skinMat);
      head.position.y = 0.15;
      head.castShadow = true;
      figureGroup.add(head);

      const bodyGeom = new THREE.BoxGeometry(0.12, 0.2, 0.1);
      const body = new THREE.Mesh(bodyGeom, clothMat);
      body.position.y = 0.05;
      body.castShadow = true;
      figureGroup.add(body);

      const armGeom = new THREE.BoxGeometry(0.05, 0.15, 0.05);
      const armL = new THREE.Mesh(armGeom, skinMat);
      armL.position.set(-0.1, 0.05, 0);
      armL.castShadow = true;
      figureGroup.add(armL);
      figureGroup._armL = armL;

      const armR = new THREE.Mesh(armGeom, skinMat);
      armR.position.set(0.1, 0.05, 0);
      armR.castShadow = true;
      figureGroup.add(armR);
      figureGroup._armR = armR;

      figureGroup._waveOffset = Math.random() * Math.PI * 2;

      _state.audienceGroup.add(figureGroup);
      _state.audienceFigures.push(figureGroup);
    }
  }
}

function _initScreens() {
  // Question Screen
  _state.questionCanvas = document.createElement('canvas');
  _state.questionCanvas.width = 1024;
  _state.questionCanvas.height = 768;
  const qCtx = _state.questionCanvas.getContext('2d');
  qCtx.fillStyle = '#000';
  qCtx.fillRect(0, 0, 1024, 768);

  _state.questionTexture = new THREE.CanvasTexture(_state.questionCanvas);
  const screenMat = new THREE.MeshStandardMaterial({
    map: _state.questionTexture, emissiveMap: _state.questionTexture,
    emissive: 0xffffff, emissiveIntensity: 0.3,
    metalness: 0.2, roughness: 0.8
  });

  const screenGeom = new THREE.PlaneGeometry(3, 2.25);
  _state.questionScreen = new THREE.Mesh(screenGeom, screenMat);
  _state.questionScreen.position.set(2, 1.5, 0);
  _state.questionScreen.castShadow = true;
  _state.questionScreen.receiveShadow = true;
  _state.stageGroup.add(_state.questionScreen);

  // Scoreboard
  _state.scoreboardCanvas = document.createElement('canvas');
  _state.scoreboardCanvas.width = 512;
  _state.scoreboardCanvas.height = 768;
  const sCtx = _state.scoreboardCanvas.getContext('2d');
  sCtx.fillStyle = '#000';
  sCtx.fillRect(0, 0, 512, 768);

  _state.scoreboardTexture = new THREE.CanvasTexture(_state.scoreboardCanvas);
  const scoreboardMat = new THREE.MeshStandardMaterial({
    map: _state.scoreboardTexture, emissiveMap: _state.scoreboardTexture,
    emissive: 0xffffff, emissiveIntensity: 0.3,
    metalness: 0.2, roughness: 0.8
  });

  const scoreboardGeom = new THREE.PlaneGeometry(1.2, 2.5);
  _state.scoreboard = new THREE.Mesh(scoreboardGeom, scoreboardMat);
  _state.scoreboard.position.set(-2.5, 1.3, 0.5);
  _state.scoreboard.rotation.y = Math.PI / 12;
  _state.scoreboard.castShadow = true;
  _state.scoreboard.receiveShadow = true;
  _state.stageGroup.add(_state.scoreboard);
}

function _initParticles() {
  const theme = THEME3D[_state.currentThemeId];

  const particleCount = 200;
  const particleGeom = new THREE.BufferGeometry();

  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = Math.random() * 8 - 0.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

    velocities[i * 3] = (Math.random() - 0.5) * 0.5;
    velocities[i * 3 + 1] = 0.5 + Math.random() * 1;
    velocities[i * 3 + 2] = 0;
  }

  particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeom.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

  const particleMat = new THREE.PointsMaterial({
    color: theme.partCol, size: 0.1, sizeAttenuation: true,
    transparent: true, opacity: 0.6
  });

  _state.particlePoints = new THREE.Points(particleGeom, particleMat);
  _state.stageGroup.add(_state.particlePoints);
  _state.particles = Array.from({ length: particleCount }, (_, i) => ({ index: i, lifespan: Math.random() }));
}

// ============================================================================
// ANIMATION
// ============================================================================

function _animate() {
  requestAnimationFrame(_animate);

  const delta = _state.animationClock.getDelta();
  _state.animationTime += delta;

  _updatePresenterAnimation(delta);
  _updateAudienceAnimation(delta);
  _updateParticles(delta);

  _state.camera.position.x = Math.sin(_state.animationTime * 0.2) * 0.15;
  _state.camera.position.y = 1.5 + Math.sin(_state.animationTime * 0.3) * 0.1;

  _state.renderer.render(_state.scene, _state.camera);
}

function _updatePresenterAnimation(delta) {
  const time = _state.animationTime;
  const armL = _state.presenterArmL;
  const armR = _state.presenterArmR;
  const head = _state.presenterHead;
  const mouth = _state.presenterMouth;
  const torso = _state.presenterTorso;

  if (_state.animationState === 'idle') {
    torso.position.y = 0.15 + Math.sin(time * 1.5) * 0.02;
    head.position.y = 0.35 + Math.sin(time * 1.2) * 0.03;
    head.rotation.z = Math.sin(time * 0.8) * 0.1;
    armL.rotation.z = Math.sin(time * 1.2) * 0.15;
    armR.rotation.z = -Math.sin(time * 1.2) * 0.15;
    mouth.scale.y = 0.5;
  } else if (_state.animationState === 'talk') {
    torso.position.y = 0.15 + Math.sin(time * 2.5) * 0.03;
    head.rotation.z = Math.sin(time * 2) * 0.2;
    head.rotation.x = Math.sin(time * 1.8) * 0.15;

    armL.rotation.z = Math.sin(time * 3) * 0.6 + 0.2;
    armR.rotation.z = -Math.sin(time * 2.8) * 0.6 - 0.2;

    if (_state.speaking) {
      mouth.scale.y = 0.5 + Math.sin(time * 5) * 0.4;
    } else {
      mouth.scale.y = 0.5;
    }
  } else if (_state.animationState === 'react') {
    const reactTime = time - _state.reactStartTime;
    if (reactTime < 2.5) {
      const jumpHeight = Math.sin((reactTime / 2.5) * Math.PI) * 0.5;
      torso.position.y = 0.15 + jumpHeight;
      head.position.y = 0.35 + jumpHeight;

      armL.rotation.z = -Math.PI / 2;
      armR.rotation.z = Math.PI / 2;
      head.rotation.z = Math.sin(time * 5) * 0.3;
    } else {
      _state.animationState = 'idle';
    }
  }
}

function _updateAudienceAnimation(delta) {
  const time = _state.animationTime;

  _state.audienceFigures.forEach(fig => {
    const wavePhase = time * 2.5 + fig._waveOffset;
    const waveAmount = Math.sin(wavePhase) * 0.4;

    fig._armL.rotation.z = waveAmount + 0.3;
    fig._armR.rotation.z = -waveAmount - 0.3;
  });
}

function _updateParticles(delta) {
  if (!_state.particlePoints) return;

  const positions = _state.particlePoints.geometry.attributes.position.array;
  const velocities = _state.particlePoints.geometry.attributes.velocity.array;

  for (let i = 0; i < _state.particles.length; i++) {
    const idx = i * 3;

    positions[idx] += velocities[idx] * delta;
    positions[idx + 1] += velocities[idx + 1] * delta;
    positions[idx + 2] += velocities[idx + 2] * delta;

    if (positions[idx + 1] > 8) {
      positions[idx] = (Math.random() - 0.5) * 10;
      positions[idx + 1] = -0.5;
      positions[idx + 2] = (Math.random() - 0.5) * 6;
    }
  }

  _state.particlePoints.geometry.attributes.position.needsUpdate = true;
}

// ============================================================================
// PUBLIC API
// ============================================================================

function _setTheme(themeId) {
  if (!THEME3D[themeId]) return;

  _state.currentThemeId = themeId;
  const theme = THEME3D[themeId];

  _state.scene.fog.color.setHex(theme.fogColor);
  _state.scene.fog.near = theme.fogNear;
  _state.scene.fog.far = theme.fogFar;
  _state.scene.background.setHex(theme.bgCol);

  _state.ambientLight.color.setHex(theme.ambCol);
  _state.ambientLight.intensity = theme.ambInt;
  _state.spotLight.color.setHex(theme.spot1Col);
  _state.spotLight.intensity = theme.spot1Int;
  _state.rimLight.color.setHex(theme.rimCol);
  _state.rimLight.intensity = theme.rimInt;

  _state.stageGroup.children.forEach(child => {
    if (child.material && child.material.emissive) {
      child.material.color.setHex(theme.stageCol);
      child.material.emissive.setHex(theme.accentCol);
    }
  });

  if (_state.particlePoints && _state.particlePoints.material) {
    _state.particlePoints.material.color.setHex(theme.partCol);
    _state.particlePoints.material.emissive.setHex(theme.partCol);
  }
}

function _updateQuestion(questionData) {
  if (!questionData) return;

  _state.currentQuestion = questionData;
  _drawQuestionCanvas(questionData);
  _state.animationState = 'talk';
  _state.speaking = true;
}

function _updateReveal(revealed, result) {
  if (!revealed) return;

  if (result && (result.pts > 0 || result.scorer)) {
    _state.animationState = 'react';
    _state.reactStartTime = _state.animationTime;
  } else {
    _state.animationState = 'talk';
  }

  _state.speaking = false;
  _drawQuestionReveal(revealed, result);
}

function _updateScores(scores, playerNames) {
  if (!scores) return;

  _state.currentScores = scores;
  _drawScoreboardCanvas(scores, playerNames);
}

function _resetScreen() {
  _state.currentQuestion = null;
  _state.currentScores = null;
  _state.animationState = 'idle';
  _state.speaking = false;

  const qCtx = _state.questionCanvas.getContext('2d');
  qCtx.fillStyle = '#000';
  qCtx.fillRect(0, 0, _state.questionCanvas.width, _state.questionCanvas.height);
  _state.questionTexture.needsUpdate = true;

  const sCtx = _state.scoreboardCanvas.getContext('2d');
  sCtx.fillStyle = '#000';
  sCtx.fillRect(0, 0, _state.scoreboardCanvas.width, _state.scoreboardCanvas.height);
  _state.scoreboardTexture.needsUpdate = true;
}

function _setAnimation(state) {
  _state.animationState = state;
  if (state === 'react') {
    _state.reactStartTime = _state.animationTime;
  }
  if (state === 'idle') {
    _state.speaking = false;
  }
}

function _showLogo(visible) {
  // Legacy function placeholder
}

// ============================================================================
// CANVAS RENDERING
// ============================================================================

function _drawQuestionCanvas(q) {
  const canvas = _state.questionCanvas;
  const ctx = canvas.getContext('2d');
  const theme = THEME3D[_state.currentThemeId];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bgColor = _hexToRgb(theme.accentCol);
  ctx.fillStyle = `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.1)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = _hexToString(theme.accentCol);
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const questionLines = _wrapText(q.q, 50);
  let y = 60;
  questionLines.forEach(line => {
    ctx.fillText(line, canvas.width / 2, y);
    y += 50;
  });

  ctx.font = '28px Arial';
  const options = ['A', 'B', 'C', 'D'];
  const answerStartY = y + 40;
  options.forEach((opt, idx) => {
    const optY = answerStartY + idx * 70;

    ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.fillRect(50, optY, canvas.width - 100, 60);

    ctx.fillStyle = _hexToString(theme.accentCol);
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(opt + '.', 80, optY + 16);

    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(q.a[idx], 150, optY + 16);
  });

  _state.questionTexture.needsUpdate = true;
}

function _drawQuestionReveal(revealed, result) {
  if (!_state.currentQuestion) return;

  const canvas = _state.questionCanvas;
  const ctx = canvas.getContext('2d');
  const theme = THEME3D[_state.currentThemeId];
  const q = _state.currentQuestion;

  _drawQuestionCanvas(q);

  if (revealed && q.c !== undefined) {
    const optionStartY = 340;
    const correctIdx = q.c;
    const correctY = optionStartY + correctIdx * 70;

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, correctY, canvas.width - 100, 60);

    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('✓', canvas.width - 70, correctY + 10);
  }

  if (result && q.f) {
    ctx.fillStyle = _hexToString(theme.accentCol);
    ctx.font = 'italic 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Fun fact: ' + q.f.substring(0, 60) + '...', canvas.width / 2, canvas.height - 50);
  }

  _state.questionTexture.needsUpdate = true;
}

function _drawScoreboardCanvas(scores, playerNames) {
  const canvas = _state.scoreboardCanvas;
  const ctx = canvas.getContext('2d');
  const theme = THEME3D[_state.currentThemeId];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bgColor = _hexToRgb(theme.accentCol);
  ctx.fillStyle = `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, 0.1)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = _hexToString(theme.accentCol);
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('SCORES', canvas.width / 2, 40);

  const sorted = scores
    .map((s, idx) => ({ score: s, name: playerNames?.[idx] || 'Player ' + (idx + 1), idx }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  let y = 100;
  sorted.forEach((entry, rank) => {
    const colors = ['#ff1744', '#ff6e40', '#ffa726', '#ffca28', '#a4de6c', '#66bb6a', '#29b6f6', '#ab47bc'];
    const playerColor = colors[entry.idx % colors.length];

    ctx.fillStyle = playerColor;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${rank + 1}. ${entry.name}`, 40, y);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(entry.score.toString(), canvas.width - 40, y);

    y += 70;
  });

  _state.scoreboardTexture.needsUpdate = true;
}

// ============================================================================
// UTILITIES
// ============================================================================

function _wrapText(text, maxCharsPerLine) {
  const lines = [];
  const words = text.split(' ');
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  });
  if (currentLine) lines.push(currentLine);

  return lines;
}

function _hexToRgb(hex) {
  const r = (hex >> 16) & 255;
  const g = (hex >> 8) & 255;
  const b = hex & 255;
  return { r, g, b };
}

function _hexToString(hex) {
  const rgb = _hexToRgb(hex);
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

function _onWindowResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  _state.camera.aspect = w / h;
  _state.camera.updateProjectionMatrix();
  _state.renderer.setSize(w, h);
}

// ============================================================================
// INITIALIZATION & PUBLIC API
// ============================================================================

_initScene();

window.SCENE3D = {
  init: (containerId) => { },
  setTheme: _setTheme,
  updateQuestion: _updateQuestion,
  updateReveal: _updateReveal,
  updateScores: _updateScores,
  resetScreen: _resetScreen,

  talk: () => _setAnimation('talk'),
  idle: () => _setAnimation('idle'),
  react: () => _setAnimation('react'),
  showLogo: _showLogo
};

// ── Sol réfléchissant ──
const _floor = new THREE.Mesh(
  new THREE.PlaneGeometry(22, 22),
  new THREE.MeshStandardMaterial({ color:0x080618, roughness:.35, metalness:.5 })
);
_floor.rotation.x = -Math.PI / 2;
_floor.position.y = -.64;
_floor.receiveShadow = true;
_scene.add(_floor);

// ── Reflet au sol (clone semi-transparent aplati) ──
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
//  PARTICULES FLOTTANTES
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

// ── Brume & fond ──
_scene.fog = new THREE.Fog(0x1e1b4b, 9, 24);
_renderer.setClearColor(0x0a0918);

// ════════════════════════════════════════════
//  APPLIQUER UN THÈME
//  Appelé par setBG() dans ui.js à chaque
//  changement d'écran ou de thème
// ════════════════════════════════════════════
function _applyTheme3d(tid) {
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
_applyTheme3d('culture'); // thème initial

// ════════════════════════════════════════════
//  ÉTATS D'ANIMATION DU PERSONNAGE
//
//  idle  → respiration douce (lobby, accueil)
//  talk  → gesticule (question en cours)
//  react → célèbre (bonne réponse, victoire)
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
    // Gesticulation active : bras qui bougent, tête qui hoche
    _siloGroup.position.y = -.65 + Math.sin(t*1.7) * .022;
    _head.rotation.x      = Math.sin(t*2.1) * .11;
    _head.rotation.y      = Math.sin(t*1.05) * .17;
    _torso.rotation.z     = Math.sin(t*1.25) * .038;
    _torso.rotation.x     = Math.sin(t*.85) * .022;
    _lSh.rotation.x = -.55 + Math.sin(t*1.95) * .32;  // bras gauche levé
    _lSh.rotation.z =  .28 + Math.sin(t*1.45+.9) * .18;
    _rSh.rotation.x = -.28 + Math.sin(t*1.55+.75) * .42; // bras droit ample
    _rSh.rotation.z = -.38 + Math.sin(t*2.05) * .22;
    _siloGroup.rotation.y = Math.sin(t*.45) * .07;

  } else if (_animState === 'react') {
    // Célébration : saut + bras levés
    const j = Math.max(0, Math.sin(_animTime*4.5)) * .28;
    _siloGroup.position.y = -.65 + j;
    _head.rotation.x = -.18 + Math.sin(t*3) * .09;
    _head.rotation.y = Math.sin(t*2.2) * .13;
    _lSh.rotation.x = -1.3 + Math.sin(t*3) * .18;   _lSh.rotation.z =  .65;
    _rSh.rotation.x = -1.3 + Math.sin(t*3.2) * .18; _rSh.rotation.z = -.65;
    _lLeg.rotation.x =  Math.sin(_animTime*4.5) * .28;
    _rLeg.rotation.x = -Math.sin(_animTime*4.5) * .28;
    if (_animTime > 2.5) _setAnim('idle'); // retour auto en idle
  }

  // Le reflet suit le personnage
  _refl.position.x = _siloGroup.position.x;
  _refl.rotation.y = _siloGroup.rotation.y;
}

// ════════════════════════════════════════════
//  LOGO 3D "BRAIN CLASH"
//  Canvas 2D → texture → plane mesh
//  Option B du prompt (pas de dépendance FontLoader)
//  DOIT être avant _loop3d pour éviter le TDZ
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
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: true, side: THREE.DoubleSide,
    depthWrite: false
  });
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
//  BOUCLE D'ANIMATION PRINCIPALE
// ════════════════════════════════════════════
const _clock3d = new THREE.Clock();

function _loop3d() {
  requestAnimationFrame(_loop3d);
  const t = _clock3d.getElapsedTime();

  _tickCharacter(t);
  _tickLogo(t);

  // Particules : montée douce en boucle
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
//  API PUBLIQUE
//  Utilisée par ui.js et game.js pour
//  piloter la scène depuis le reste du jeu
// ════════════════════════════════════════════
window.SCENE3D = {
  setTheme : _applyTheme3d,  // changer l'ambiance
  talk     : () => _setAnim('talk'),   // gesticule
  react    : () => _setAnim('react'),  // célèbre
  idle     : () => _setAnim('idle'),   // respiration douce
  showLogo : _showLogo,                // afficher/masquer logo 3D
};
