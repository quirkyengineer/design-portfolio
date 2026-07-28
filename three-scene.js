/* ============================================================
   Three.js — Interactive 3D Scenes
   Hero: Morphing particle mesh that follows mouse
   Contact: Floating wireframe torus knot
   ============================================================ */

window.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // Wait for Three.js to load
  if (typeof THREE === 'undefined') return;

  /* ─────────────────────────────────────────────
     HERO — Interactive Particle Sphere Mesh
     A morphing particle sphere that gently reacts
     to mouse position, creating a sense of depth.
     ───────────────────────────────────────────── */
  const heroCanvas = document.getElementById('heroCanvas');
  if (!heroCanvas) return;

  const heroScene = new THREE.Scene();
  const heroCam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  heroCam.position.z = 30;

  const heroRenderer = new THREE.WebGLRenderer({
    canvas: heroCanvas,
    alpha: true,
    antialias: true,
  });
  heroRenderer.setSize(window.innerWidth, window.innerHeight);
  heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // --- Create particle system ---
  const particleCount = 2000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const originalPositions = new Float32Array(particleCount * 3);

  // Coral: #e8654a → RGB(232, 101, 74)
  // Sage:  #7d8c6e → RGB(125, 140, 110)
  // Warm:  #d9d0c7 → RGB(217, 208, 199)

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    // Distribute particles on a sphere surface
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 12 + Math.random() * 4;

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    originalPositions[i3] = positions[i3];
    originalPositions[i3 + 1] = positions[i3 + 1];
    originalPositions[i3 + 2] = positions[i3 + 2];

    // Random color between coral, sage, and warm
    const colorChoice = Math.random();
    if (colorChoice < 0.35) {
      colors[i3] = 0.91; colors[i3 + 1] = 0.396; colors[i3 + 2] = 0.29; // coral
    } else if (colorChoice < 0.6) {
      colors[i3] = 0.49; colors[i3 + 1] = 0.55; colors[i3 + 2] = 0.43; // sage
    } else {
      colors[i3] = 0.85; colors[i3 + 1] = 0.816; colors[i3 + 2] = 0.78; // warm
    }

    sizes[i] = Math.random() * 2.5 + 0.5;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Custom shader for round points with soft glow
  const particleMat = new THREE.ShaderMaterial({
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = smoothstep(80.0, 20.0, -mvPosition.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.1, dist) * vAlpha * 0.7;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  heroScene.add(particles);

  // --- Wireframe icosahedron core ---
  const icoGeo = new THREE.IcosahedronGeometry(8, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0xe8654a,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const icoMesh = new THREE.Mesh(icoGeo, icoMat);
  heroScene.add(icoMesh);

  // --- Orbiting rings ---
  const ringGeo = new THREE.TorusGeometry(16, 0.05, 8, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xd9d0c7,
    transparent: true,
    opacity: 0.15,
  });

  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI * 0.35;
  ring1.rotation.y = Math.PI * 0.15;
  heroScene.add(ring1);

  const ring2 = new THREE.Mesh(ringGeo, ringMat.clone());
  ring2.rotation.x = Math.PI * 0.6;
  ring2.rotation.y = Math.PI * 0.45;
  ring2.material.opacity = 0.1;
  heroScene.add(ring2);

  // --- Mouse tracking ---
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // --- Animation loop ---
  const clock = new THREE.Clock();

  function animateHero() {
    requestAnimationFrame(animateHero);

    const elapsed = clock.getElapsedTime();

    // Smooth follow
    targetX += (mouseX - targetX) * 0.02;
    targetY += (mouseY - targetY) * 0.02;

    // Rotate entire particle system gently
    particles.rotation.y = elapsed * 0.05 + targetX * 0.3;
    particles.rotation.x = elapsed * 0.03 + targetY * 0.2;

    // Morph particles — subtle wave displacement
    const posArr = particleGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const ox = originalPositions[i3];
      const oy = originalPositions[i3 + 1];
      const oz = originalPositions[i3 + 2];

      const wave = Math.sin(elapsed * 0.8 + ox * 0.3) * 0.5
                 + Math.cos(elapsed * 0.6 + oy * 0.4) * 0.3;

      posArr[i3] = ox + wave * 0.8;
      posArr[i3 + 1] = oy + wave * 0.6;
      posArr[i3 + 2] = oz + Math.sin(elapsed * 0.5 + oz * 0.2) * 0.4;
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Rotate wireframe core
    icoMesh.rotation.x = elapsed * 0.1 + targetY * 0.5;
    icoMesh.rotation.y = elapsed * 0.15 + targetX * 0.5;

    // Rotate rings
    ring1.rotation.z = elapsed * 0.08;
    ring2.rotation.z = -elapsed * 0.06;

    heroRenderer.render(heroScene, heroCam);
  }

  animateHero();


  /* ─────────────────────────────────────────────
     CONTACT — Floating Wireframe Torus Knot
     Subtle 3D element that adds depth to the
     dark contact section.
     ───────────────────────────────────────────── */
  const contactCanvas = document.getElementById('contactCanvas');
  if (contactCanvas) {
    const cScene = new THREE.Scene();
    const cCam = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    cCam.position.z = 20;

    const cRenderer = new THREE.WebGLRenderer({
      canvas: contactCanvas,
      alpha: true,
      antialias: true,
    });
    cRenderer.setSize(window.innerWidth, window.innerHeight);
    cRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Torus knot wireframe
    const tkGeo = new THREE.TorusKnotGeometry(6, 1.8, 100, 16, 2, 3);
    const tkMat = new THREE.MeshBasicMaterial({
      color: 0xe8654a,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const torusKnot = new THREE.Mesh(tkGeo, tkMat);
    cScene.add(torusKnot);

    // Small floating particles
    const cParticleCount = 400;
    const cPositions = new Float32Array(cParticleCount * 3);
    for (let i = 0; i < cParticleCount; i++) {
      cPositions[i * 3] = (Math.random() - 0.5) * 40;
      cPositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      cPositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    const cParticleGeo = new THREE.BufferGeometry();
    cParticleGeo.setAttribute('position', new THREE.BufferAttribute(cPositions, 3));
    const cParticleMat = new THREE.PointsMaterial({
      color: 0xf08d76,
      size: 0.08,
      transparent: true,
      opacity: 0.4,
    });
    const cParticles = new THREE.Points(cParticleGeo, cParticleMat);
    cScene.add(cParticles);

    function animateContact() {
      requestAnimationFrame(animateContact);
      const t = clock.getElapsedTime();

      torusKnot.rotation.x = t * 0.08;
      torusKnot.rotation.y = t * 0.12;

      cParticles.rotation.y = t * 0.02;
      cParticles.rotation.x = t * 0.01;

      cRenderer.render(cScene, cCam);
    }

    animateContact();

    // Resize handler for contact canvas
    window.addEventListener('resize', () => {
      cCam.aspect = window.innerWidth / window.innerHeight;
      cCam.updateProjectionMatrix();
      cRenderer.setSize(window.innerWidth, window.innerHeight);
    });
  }


  /* ─────────────────────────────────────────────
     RESIZE HANDLER — Hero
     ───────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    heroCam.aspect = window.innerWidth / window.innerHeight;
    heroCam.updateProjectionMatrix();
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
  });

});
