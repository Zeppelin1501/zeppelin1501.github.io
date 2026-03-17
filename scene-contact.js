/* scene-contact.js — Signal Warp */
var contactS = null;
var ctc = { warpRings: [], nodes: [], txSphere: null, txInner: null };

document.addEventListener('DOMContentLoaded', () => {
  contactS = new SceneBase('canvas-contact');
  contactS.init((scene, cam, base) => {
    cam.position.set(0, 0, 20);
    contactS._baseCamY = 0;
    contactS._lookY = 0;
    scene.fog = new THREE.FogExp2(0x010210, 0.020);
    scene.add(new THREE.AmbientLight(0x051020, 1));
    ptLight(scene, C.CYAN,   3,  0, 6,  0);
    ptLight(scene, C.GREEN,  2, -8, 2,  4);
    ptLight(scene, C.VIOLET, 2,  8, 2, -4);
    addStars(scene, 1500, 180);

    // Warp tunnel — 24 concentric rings flying toward viewer
    for (let i = 0; i < 24; i++) {
      const r = 1 + i*.6;
      const col = i % 2 === 0 ? C.CYAN : C.VIOLET;
      const rng = glowRing(scene, r, col, 0, 0, -i*1.5);
      rng.material.transparent = true;
      rng.material.opacity = Math.max(0.05, 0.5 - i*.015);
      ctc.warpRings.push(rng);
    }

    // Ground grid
    const sg = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60, 30, 30),
      new THREE.MeshBasicMaterial({ color:C.CYAN, wireframe:true, transparent:true, opacity:0.06 })
    );
    sg.rotation.x = -Math.PI/2; sg.position.y = -6;
    scene.add(sg);

    // Floating data nodes orbit the warp
    for (let i = 0; i < 16; i++) {
      const a = (i/16)*Math.PI*2, r = 6 + Math.random()*4;
      const col = [C.CYAN, C.GREEN, C.VIOLET][i%3];
      const orb = icoMesh(scene, .15 + Math.random()*.2, col,
        Math.sin(a)*r, (Math.random()-.5)*5, Math.cos(a)*r - 3, 1);
      base.float(orb, 0.2, 0.5 + Math.random()*.5, i);
      ctc.nodes.push(orb);
    }

    // Central transmission sphere
    ctc.txSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 32, 32),
      new THREE.MeshStandardMaterial({ color:C.GREEN, emissive:C.GREEN, emissiveIntensity:0.4, roughness:0.1, metalness:0.9, wireframe:true })
    );
    scene.add(ctc.txSphere);
    ctc.txInner = icoMesh(scene, 0.8, C.GREEN, 0, 0, 0, 0.8);
  });
});

function tickContact(t) {
  if (!contactS || !contactS._ok || !contactS.isVisible(420)) return;
  var cam = contactS.camera;
  var p = window.getParallax ? window.getParallax('s-contact') : {x:0,y:0};
  cam.position.x += (p.x * 2 - cam.position.x) * 0.035;
  cam.position.y += (-p.y * 1.5 - (cam.position.y - contactS._baseCamY)) * 0.035;
  cam.lookAt(0, contactS._lookY || 0, 0);
  // Warp tunnel flies forward
  ctc.warpRings.forEach((r, i) => {
    r.rotation.z += 0.008 + i*.001;
    r.position.z = (-i*1.5 + (t*3) % (24*1.5)) - 24;
  });
  ctc.nodes.forEach(n => { n.rotation.y += 0.02; });
  contactS.tickFloaters(t);
  if (ctc.txSphere) { ctc.txSphere.rotation.y += 0.015; ctc.txSphere.rotation.x += 0.008; }
  if (ctc.txInner)  {
    ctc.txInner.rotation.y -= 0.02;
    ctc.txInner.material.emissiveIntensity = 0.6 + Math.sin(t*2)*.4;
  }
  contactS.render();
}
window.tickContact = tickContact;
