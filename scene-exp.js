/* scene-exp.js — Neon City */
var expS = null;
var exp3d = { buildings: [], dots: [], lines: [] };

const EXP_DATA = [
  {role:'Unity & XR Developer', co:'Option 1 World · Dubai', date:'APR 2025 — NOW',
   bullets:['AI-driven VR with multiplayer spatial anchors','Convai AI bots for dynamic NPCs','GPU particle systems + live sensor data','Leap Motion, Arduino, LiDAR, Kinect network','DMX lighting synced to Unity event triggers'],
   tags:['Unity 6','VR/XR','Convai AI','LiDAR','DMX']},
  {role:'Software Developer (Unity3D)', co:'Creative Technology LLC · Dubai', date:'JAN 2023 — APR 2025',
   bullets:['2D/3D apps for high-profile events worldwide','Object Recognition tech integration','Leap Motion & Kinect gesture experiences','Arduino & Raspberry Pi Unity integration','Projection mapping for large-scale events'],
   tags:['Unity3D','Object Recognition','Arduino','Raspberry Pi','Projection']},
  {role:'Unity Developer', co:'Practically · India', date:'AUG – NOV 2021',
   bullets:['Terrain tools & C# water/snow shaders','Drone, car & bike physics multiplayer','WebGL integration, Unity Memory Profiler'],
   tags:['Unity','C# Shaders','WebGL','Multiplayer']},
  {role:'Mobile Developer (Intern)', co:'Tech Reinvented · India', date:'SEP – NOV 2021',
   bullets:['QA bug fixing & Google Play publishing','Unity Memory Profiler optimization'],
   tags:['Unity','QA','Mobile','Google Play']},
];
window.EXP_DATA = EXP_DATA;

document.addEventListener('DOMContentLoaded', () => {
  // Build DOM timeline
  const tl = document.getElementById('expTimeline');
  if (tl) {
    EXP_DATA.forEach(e => {
      tl.insertAdjacentHTML('beforeend', `
        <div class="tl-item">
          <div class="tl-head">
            <div><div class="tl-role">${e.role}</div><div class="tl-co">${e.co}</div></div>
            <div class="tl-date">${e.date}</div>
          </div>
          <div class="tl-bullets">${e.bullets.map(b=>`<div class="tl-b">${b}</div>`).join('')}</div>
          <div class="tl-tags">${e.tags.map(t=>`<span class="tl-tag">${t}</span>`).join('')}</div>
        </div>`);
    });
  }

  // 3D scene
  expS = new SceneBase('canvas-exp');
  expS.init((scene, cam, base) => {
    cam.position.set(0, 4, 22);
    expS._baseCamY = 4;
    expS._lookY = 0;
    scene.fog = new THREE.FogExp2(0x020108, 0.022);
    scene.add(new THREE.AmbientLight(0x080410, 1));
    ptLight(scene, C.PINK,   2, -6, 6, 0);
    ptLight(scene, C.VIOLET, 2.5, 6, 4, 5);
    ptLight(scene, C.CYAN,   1.5, 0, 2, -5);
    addStars(scene, 1200, 160);
    addGrid(scene, -7, 0x3a0060, 0x120030);

    // City buildings
    for (let i = 0; i < 30; i++) {
      const x = (Math.random()-.5)*50, h = 2 + Math.random()*10, w = .8 + Math.random()*1.5;
      const col = [C.VIOLET, C.PINK, C.CYAN, C.PURPLE][i%4];
      const geo = new THREE.BoxGeometry(w, h, w);
      const mat = new THREE.MeshStandardMaterial({ color:0x0a0020, emissive:col, emissiveIntensity:0.14, roughness:0.5, metalness:0.8 });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, -7+h/2, -(5+Math.random()*10));
      scene.add(m);
      const edges = new THREE.EdgesGeometry(geo);
      const lm = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color:col, transparent:true, opacity:0.28 }));
      lm.position.copy(m.position);
      scene.add(lm);
      exp3d.buildings.push(m);
    }

    // Timeline dots
    EXP_DATA.forEach((e, i) => {
      const col = [C.GREEN, C.CYAN, C.VIOLET, C.PINK][i];
      const orb = icoMesh(scene, 0.3, col, -12, 3 - i*2.8, 5, 1);
      base.float(orb, 0.15, 0.6, i);
      exp3d.dots.push(orb);
    });

    // Vertical data streams
    for (let i = 0; i < 8; i++) {
      const x = (Math.random()-.5)*20;
      const pts = Array.from({length:20}, (_,j) => new THREE.Vector3(x+(Math.random()-.5)*.3, j*.8-6, (Math.random()-.5)*2-3));
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color:[C.CYAN,C.VIOLET,C.GREEN][i%3], transparent:true, opacity:.15+Math.random()*.18 })
      );
      scene.add(line);
      exp3d.lines.push({ line, off: Math.random()*Math.PI*2 });
    }
  });
});

function tickExp(t) {
  if (!expS || !expS._ok || !expS.isVisible(420)) return;
  var cam = expS.camera;
  var p = window.getParallax ? window.getParallax('s-exp') : {x:0,y:0};
  cam.position.x += (p.x * 2 - cam.position.x) * 0.035;
  cam.position.y += (-p.y * 1.5 - (cam.position.y - expS._baseCamY)) * 0.035;
  cam.lookAt(0, expS._lookY || 0, 0);
  exp3d.buildings.forEach((b,i) => { b.material.emissiveIntensity = 0.1 + Math.sin(t*.5+i*.4)*.08; });
  exp3d.dots.forEach(d => { d.rotation.y += 0.02; });
  expS.tickFloaters(t);
  exp3d.lines.forEach(({line, off}) => { line.material.opacity = .1 + Math.sin(t*1.5+off)*.12; });
  expS.render();
}
window.tickExp = tickExp;
