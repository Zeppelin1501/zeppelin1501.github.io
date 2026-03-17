/* scene-about.js — Crystal Cave */
var aboutS = null;
var abt = { crystals: [], sphere: null, helixPts: [], light1: null };

document.addEventListener('DOMContentLoaded', () => {
  aboutS = new SceneBase('canvas-about');
  aboutS.init((scene, cam, base) => {
    cam.position.set(0, 2, 18);
    aboutS._baseCamY = 2;
    aboutS._lookY = 0;
    scene.fog = new THREE.FogExp2(0x050020, 0.025);
    scene.add(new THREE.AmbientLight(0x0a0530, 1));
    abt.light1 = ptLight(scene, C.PURPLE, 3, -6, 4, 0);
    ptLight(scene, C.CYAN, 2, 8, 2, 5);

    addStars(scene, 1500, 180);
    addGrid(scene, -7, 0x1a0060, 0x080030);

    // Crystal pillars
    for (let i = 0; i < 20; i++) {
      const a = (i/20)*Math.PI*2, r = 7 + Math.random()*5, h = 1 + Math.random()*4;
      const col = [C.VIOLET, C.CYAN, C.PINK, C.PURPLE][i%4];
      const m = new THREE.Mesh(
        new THREE.ConeGeometry(0.15 + Math.random()*.25, h, 5),
        new THREE.MeshStandardMaterial({ color:col, emissive:col, emissiveIntensity:0.3, roughness:0.1, metalness:0.9, transparent:true, opacity:0.7 })
      );
      m.position.set(Math.sin(a)*r, -7 + h/2, Math.cos(a)*r);
      scene.add(m);
      base.float(m, 0.15, 0.4 + Math.random()*.5, i*.5);
      abt.crystals.push(m);
    }

    // Wireframe sphere (left side decoration)
    abt.sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 32),
      new THREE.MeshStandardMaterial({ color:C.VIOLET, emissive:C.VIOLET, emissiveIntensity:0.3, wireframe:true })
    );
    abt.sphere.position.set(-9, 0, 2);
    scene.add(abt.sphere);

    // DNA helix (right side)
    for (let i = 0; i < 80; i++) {
      const tNorm = i/80, angle = tNorm*Math.PI*4;
      [1, -1].forEach((sign, strand) => {
        const orb = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 6, 6),
          new THREE.MeshBasicMaterial({ color: strand ? C.CYAN : C.VIOLET })
        );
        orb.position.set(9 + Math.cos(angle)*1.2*sign, i*.15 - 5, Math.sin(angle)*1.2);
        scene.add(orb);
        abt.helixPts.push({ orb, tNorm, sign });
      });
    }
  });
});

function tickAbout(t) {
  if (!aboutS || !aboutS._ok || !aboutS.isVisible(420)) return;
  var cam = aboutS.camera;
  var p = window.getParallax ? window.getParallax('s-about') : {x:0,y:0};
  cam.position.x += (p.x * 2 - cam.position.x) * 0.035;
  cam.position.y += (-p.y * 1.5 - (cam.position.y - aboutS._baseCamY)) * 0.035;
  cam.lookAt(0, aboutS._lookY || 0, 0);
  abt.crystals.forEach(c => { c.rotation.y += 0.005; });
  aboutS.tickFloaters(t);
  if (abt.sphere) { abt.sphere.rotation.y += 0.008; abt.sphere.rotation.x += 0.004; }
  abt.helixPts.forEach(({ orb, tNorm, sign }) => {
    const a = tNorm*Math.PI*4 + t*.5*sign;
    orb.position.x = 9 + Math.cos(a)*1.2*sign;
    orb.position.z = Math.sin(a)*1.2;
  });
  aboutS.render();
}
window.tickAbout = tickAbout;
