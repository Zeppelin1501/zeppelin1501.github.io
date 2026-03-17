/* ═══════════════════════════════════════════════
   ZEPPELIN 3D — scene-utils.js
   Shared helpers used by every scene file
═══════════════════════════════════════════════ */

const C = {
  PURPLE: 0x7c3aed, VIOLET: 0x9b5ff5, CYAN: 0x00e5ff,
  PINK:   0xff4dbb, GOLD:   0xffd700, GREEN: 0x00ff88,
  RED:    0xff4466, ORANGE: 0xff6644
};
window.C = C;
window.__zepScenes = window.__zepScenes || [];

/* ── SceneBase: safe wrapper ──────────────────
   Never calls build() inside constructor.
   Call scene.init(buildFn) AFTER assignment.
─────────────────────────────────────────────── */
class SceneBase {
  constructor(canvasId) {
    this.canvas  = document.getElementById(canvasId);
    this.section = this.canvas ? this.canvas.closest('.scene') : null;
    this._ok     = !!(this.canvas && this.section);
    if (!this._ok) return;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false;

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, 1, 0.1, 300);
    this._floaters = [];
    window.__zepScenes.push(this);

    this._resizeBound = () => this._resize();
    window.addEventListener('resize', this._resizeBound);
    this._resize();
  }

  /* Call AFTER `const s = new SceneBase(...)` */
  init(buildFn) {
    if (!this._ok) return this;
    buildFn(this.scene, this.camera, this);   // pass `this` as 3rd arg
    return this;
  }

  _resize() {
    if (!this._ok) return;
    const w = this.section.clientWidth  || window.innerWidth;
    const h = Math.max(this.section.clientHeight || 0, window.innerHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  isVisible(margin = 320) {
    if (!this._ok) return false;
    const rect = this.section.getBoundingClientRect();
    return rect.bottom > -margin && rect.top < window.innerHeight + margin;
  }

  /* Register a mesh for float animation */
  float(mesh, amp = 0.3, speed = 1, offset = 0) {
    mesh.__floatAmp   = amp;
    mesh.__floatSpeed = speed;
    mesh.__floatOff   = offset;
    mesh.__baseY      = mesh.position.y;
    this._floaters.push(mesh);
  }

  /* Tick all floaters */
  tickFloaters(t) {
    this._floaters.forEach(m => {
      m.position.y = m.__baseY + Math.sin(t * m.__floatSpeed + m.__floatOff) * m.__floatAmp;
    });
  }

  render() {
    if (this._ok && this.isVisible(480)) this.renderer.render(this.scene, this.camera);
  }
}
window.SceneBase = SceneBase;
window.resizeSceneBases = function() {
  (window.__zepScenes || []).forEach(function(scene) {
    if (scene && typeof scene._resize === 'function') scene._resize();
  });
};

/* ── shared scene helpers ── */
function addStars(scene, count = 2000, spread = 200) {
  const v = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    v[i*3]   = (Math.random() - .5) * spread;
    v[i*3+1] = (Math.random() - .5) * spread;
    v[i*3+2] = (Math.random() - .5) * spread;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(v, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, sizeAttenuation: true }));
  scene.add(pts);
  return pts;
}

function addGrid(scene, y = -7, c1 = 0x3a1060, c2 = 0x120630) {
  const g = new THREE.GridHelper(100, 50, c1, c2);
  g.position.y = y;
  scene.add(g);
  return g;
}

function ptLight(scene, color, intensity, x, y, z) {
  const l = new THREE.PointLight(color, intensity, 35);
  l.position.set(x, y, z);
  scene.add(l);
  return l;
}

function icoMesh(scene, r, col, x, y, z, glow = 0.5) {
  const m = new THREE.Mesh(
    new THREE.IcosahedronGeometry(r, 1),
    new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: glow, roughness: 0.1, metalness: 0.8 })
  );
  m.position.set(x, y, z);
  scene.add(m);
  return m;
}

function glowRing(scene, r, col, x, y, z, rotX = Math.PI / 2) {
  const m = new THREE.Mesh(
    new THREE.TorusGeometry(r, 0.055, 8, 60),
    new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.0, roughness: 0.1, metalness: 0.9 })
  );
  m.position.set(x, y, z);
  m.rotation.x = rotX;
  scene.add(m);
  return m;
}

window.addStars   = addStars;
window.addGrid    = addGrid;
window.ptLight    = ptLight;
window.icoMesh    = icoMesh;
window.glowRing   = glowRing;
