/* scene-skills.js — Circuit Board */
var skillsS = null;
var skl = { rings: [], center: null, wire: null };

const SKILLS_DATA = [
  {n:'Unity Development', pct:92, stars:5},
  {n:'C# / OOP',          pct:90, stars:5},
  {n:'VR / XR Systems',   pct:82, stars:4},
  {n:'AI Integration',    pct:80, stars:4},
  {n:'Hardware',          pct:82, stars:4},
  {n:'Shader / VFX Graph',pct:75, stars:3},
  {n:'Troubleshooting',   pct:90, stars:5},
  {n:'Pixel Art',         pct:72, stars:3},
];
window.SKILLS_DATA = SKILLS_DATA;

const TECH_STACK = [
  'Unity 6','Unreal Engine 5','C#','C++','Python','JavaScript',
  'ECS/DOTS','Shader Graph','VFX Graph','XR Toolkit','OpenXR',
  'Unity Sentis','Convai AI','Leap Motion','Kinect','LiDAR',
  'Arduino','Raspberry Pi','DMX Lighting','Plastic SCM','GitHub'
];

document.addEventListener('DOMContentLoaded', () => {
  // Build DOM
  const grid = document.getElementById('skillGrid');
  if (grid) {
    SKILLS_DATA.forEach(sk => {
      const stars = Array.from({length:5}, (_,i) => `<div class="ss ${i<sk.stars?'on':''}"></div>`).join('');
      grid.insertAdjacentHTML('beforeend', `
        <div class="sk-node">
          <div class="sk-top"><span class="sk-name">${sk.n}</span><span class="sk-lvl">LVL ${Math.round(sk.pct/10)}</span></div>
          <div class="sk-bar"><div class="sk-fill" style="width:${sk.pct}%"></div></div>
          <div class="sk-stars">${stars}</div>
        </div>`);
    });
  }
  const cloud = document.getElementById('techCloud');
  if (cloud) TECH_STACK.forEach(t => cloud.insertAdjacentHTML('beforeend', `<span class="tech-pill">${t}</span>`));

  // 3D scene
  skillsS = new SceneBase('canvas-skills');
  skillsS.init((scene, cam, base) => {
    cam.position.set(0, 8, 22);
    skillsS._baseCamY = 8;
    skillsS._lookY = 0;
    cam.lookAt(0, 0, 0);
    scene.fog = new THREE.FogExp2(0x020815, 0.022);
    scene.add(new THREE.AmbientLight(0x051525, 1.2));
    ptLight(scene, C.CYAN,   3,  0, 8,  0);
    ptLight(scene, C.GREEN,  2, -8, 4,  4);
    ptLight(scene, C.VIOLET, 2,  8, 4, -4);
    addStars(scene, 1200, 160);

    // Grid floor
    const wm = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60, 30, 30),
      new THREE.MeshStandardMaterial({ color:0x001020, emissive:0x002244, emissiveIntensity:0.3, wireframe:true, transparent:true, opacity:0.4 })
    );
    wm.rotation.x = -Math.PI/2; wm.position.y = -6;
    scene.add(wm);

    // Skill torus rings
    const COLS = [C.VIOLET,C.CYAN,C.GREEN,C.PINK,C.GOLD,C.RED,C.VIOLET,C.CYAN];
    SKILLS_DATA.forEach((sk, i) => {
      const a = (i/SKILLS_DATA.length)*Math.PI*2, r = 8;
      const tGeo = new THREE.TorusGeometry(0.6, 0.07, 8, 40, Math.PI*2*(sk.pct/100));
      const tMat = new THREE.MeshStandardMaterial({ color:COLS[i], emissive:COLS[i], emissiveIntensity:0.8, roughness:0.1, metalness:0.8 });
      const torus = new THREE.Mesh(tGeo, tMat);
      torus.position.set(Math.sin(a)*r, 2, Math.cos(a)*r);
      torus.rotation.x = Math.PI/2;
      scene.add(torus);
      base.float(torus, 0.3, 0.5 + i*.1, i*.8);
      skl.rings.push(torus);
    });

    // Central icosahedron
    skl.center = icoMesh(scene, 1.8, C.CYAN, 0, 1, 0, 0.4);
    skl.wire = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.2, 1),
      new THREE.MeshBasicMaterial({ color:C.CYAN, wireframe:true, transparent:true, opacity:0.14 })
    );
    scene.add(skl.wire);

    // Circuit traces
    for (let i = 0; i < 16; i++) {
      const a = (i/16)*Math.PI*2;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, .5, 0),
        new THREE.Vector3(Math.sin(a)*8, .5, Math.cos(a)*8)
      ]);
      scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color:C.CYAN, transparent:true, opacity:0.07 })));
    }
  });
});

function tickSkills(t) {
  if (!skillsS || !skillsS._ok || !skillsS.isVisible(420)) return;
  var cam = skillsS.camera;
  var p = window.getParallax ? window.getParallax('s-skills') : {x:0,y:0};
  cam.position.x += (p.x * 2 - cam.position.x) * 0.035;
  cam.position.y += (-p.y * 1.5 - (cam.position.y - skillsS._baseCamY)) * 0.035;
  cam.lookAt(0, skillsS._lookY || 0, 0);
  skl.rings.forEach((r, i) => { r.rotation.z += 0.015 + i*.003; r.rotation.x += 0.006; });
  skillsS.tickFloaters(t);
  if (skl.center) { skl.center.rotation.y += 0.01; skl.center.rotation.x += 0.006; }
  if (skl.wire)   { skl.wire.rotation.y  -= 0.008; skl.wire.rotation.z   += 0.005; }
  skillsS.render();
}
window.tickSkills = tickSkills;
