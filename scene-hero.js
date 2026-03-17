/* scene-hero.js — Deep Space Nebula with mouse interaction */
var heroS = null;
var hero = { orb:null, rings:[], floaters:[], particles:null, pVerts:null, pVel:[], l1:null, l2:null, camTarget:{x:0,y:0} };

document.addEventListener('DOMContentLoaded', function() {
  heroS = new SceneBase('canvas-hero');
  heroS.init(function(scene, cam, base) {
    cam.position.set(0, 0, 20);
    scene.fog = new THREE.FogExp2(0x030210, 0.016);
    scene.add(new THREE.AmbientLight(0x110822, 1.5));
    hero.l1 = ptLight(scene, C.VIOLET, 3.5, -10, 5, 5);
    hero.l2 = ptLight(scene, C.CYAN,   2.5,  10, 3, 8);
    ptLight(scene, C.PINK, 1.8, 0, -4, 12);

    addStars(scene, 3500, 260);
    addGrid(scene, -8);

    // Central orb — bigger
    hero.orb = icoMesh(scene, 1.5, C.VIOLET, 0, 0, 2, 0.7);
    base.float(hero.orb, 0.45, 0.8, 0);

    // Orbiting rings — bigger
    [[C.CYAN,3.5,0],[C.VIOLET,5,Math.PI/3],[C.PINK,4.2,Math.PI*.7]].forEach(function(arr) {
      var rng = glowRing(scene, arr[0], arr[1], 0, 0, 2, Math.PI/2 + arr[2]);
      rng.rotation.z = arr[2];
      hero.rings.push(rng);
    });

    // Constellation
    for (var i = 0; i < 14; i++) {
      var a = (i/14)*Math.PI*2, rd = 7 + Math.random()*7;
      var m = icoMesh(scene, 0.15+Math.random()*0.22, [C.VIOLET,C.CYAN,C.PINK,C.GREEN][i%4],
        Math.sin(a)*rd, (Math.random()-.5)*5, Math.cos(a)*rd-3, 0.9);
      base.float(m, 0.22+Math.random()*.3, 0.5+Math.random(), i);
      hero.floaters.push(m);
    }

    // Particle nebula
    var pCount = 1000;
    hero.pVerts = new Float32Array(pCount*3);
    var pCols   = new Float32Array(pCount*3);
    var nc = [[.5,.25,1],[0,.9,1],[1,.3,.75],[0,1,.53]];
    for (var j = 0; j < pCount; j++) {
      var pa = Math.random()*Math.PI*2, pr = 5+Math.random()*16;
      hero.pVerts[j*3]   = Math.sin(pa)*pr;
      hero.pVerts[j*3+1] = (Math.random()-.5)*11;
      hero.pVerts[j*3+2] = Math.cos(pa)*pr-3;
      var c = nc[j%4]; pCols[j*3]=c[0]; pCols[j*3+1]=c[1]; pCols[j*3+2]=c[2];
      hero.pVel.push({vx:(Math.random()-.5)*.007, vy:(Math.random()-.5)*.005, vz:(Math.random()-.5)*.007});
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(hero.pVerts,3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pCols,3));
    hero.particles = new THREE.Points(pGeo, new THREE.PointsMaterial({size:.1,sizeAttenuation:true,vertexColors:true,transparent:true,opacity:.75}));
    scene.add(hero.particles);
  });
});

function tickHero(t) {
  if (!heroS || !heroS._ok || !heroS.isVisible(420)) return;
  var cam = heroS.camera;

  // Mouse parallax
  var p = window.getParallax ? window.getParallax('s-hero') : {x:0,y:0};
  hero.camTarget.x += (p.x * 2.5 - hero.camTarget.x) * 0.04;
  hero.camTarget.y += (-p.y * 1.5 - hero.camTarget.y) * 0.04;
  cam.position.x = hero.camTarget.x;
  cam.position.y = hero.camTarget.y;
  cam.lookAt(0, 0, 0);

  if (hero.orb) { hero.orb.rotation.y += 0.012; hero.orb.rotation.x += 0.006; }
  hero.rings.forEach(function(r,i){ r.rotation.z += 0.008+i*.003; r.rotation.y += 0.005; });
  hero.floaters.forEach(function(f){ f.rotation.y += 0.02; });
  heroS.tickFloaters(t);

  if (hero.l1) { hero.l1.position.x=Math.sin(t*.4)*12; hero.l1.position.z=Math.cos(t*.4)*12; }
  if (hero.l2) { hero.l2.position.x=Math.sin(t*.3+2)*10; hero.l2.position.z=Math.cos(t*.3+2)*10; }

  if (hero.particles && hero.pVerts) {
    var v=hero.pVerts, vel=hero.pVel;
    for (var i=0;i<vel.length;i++) {
      v[i*3]+=vel[i].vx; v[i*3+1]+=vel[i].vy; v[i*3+2]+=vel[i].vz;
      var d=Math.sqrt(v[i*3]*v[i*3]+v[i*3+2]*v[i*3+2]);
      if (d>24||Math.abs(v[i*3+1])>8) {
        var a=Math.random()*Math.PI*2, r=5+Math.random()*9;
        v[i*3]=Math.sin(a)*r; v[i*3+1]=(Math.random()-.5)*9; v[i*3+2]=Math.cos(a)*r-3;
      }
    }
    hero.particles.geometry.attributes.position.needsUpdate=true;
  }
  heroS.render();
}
window.tickHero = tickHero;
