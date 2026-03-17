/* scene-projects.js - Professional project showcase */
var projS = null;
var prj = { portals: [], cluster: [] };

var FILTER_LABELS = {
  all: 'All',
  immersive: 'Immersive',
  surface: 'Surfaces',
  ai: 'AI / Vision',
  xr: 'XR / Sim',
  gov: 'Gov / Public',
  expo: 'Expo'
};

var PROJECTS_DATA = [
  { n:'Saadiyat Interactive Screen',      m:'Museum installation',            cat:'surface',    links:['https://youtu.be/FX0afiQd_ns?si=dpUZR4C6FMYgtewB'] },
  { n:'ROSHN Saudi Tangible Table',       m:'Tangible tabletop experience',   cat:'surface',    links:['https://youtu.be/-vwWV_vOh30?si=8azd4UWM2f4BxXzf'] },
  { n:'MOD Dubai Immersive Room',         m:'Infinity floor experience',      cat:'immersive',  links:['https://youtu.be/6ijqjQdkrLc?si=pnoZbHBweLYp7qWR'] },
  { n:'Public Investment Fund',           m:'Immersive brand activation',     cat:'expo',       links:['https://youtu.be/CcCCGBIgXic?si=s-UwrvMdSsbm8ilp'] },
  { n:'SCDE Abu Dhabi',                   m:'Interactive public showcase',    cat:'gov',        links:['https://youtu.be/-IAImEtTIyI?si=J1DR0_4PoDcu0atF'] },
  { n:'VR Quiz Dubai Police',             m:'VR engagement experience',       cat:'gov',        links:['https://youtu.be/Gjo2M1jRsKY?si=3TnQGrFO4zXEEyEX'] },
  { n:'AR Mirror Photobooth',             m:'Augmented photo activation',     cat:'ai',         links:['https://youtu.be/VjlDrQsfkZU?si=8N_EVK65vkkGhYff'] },
  { n:'Interactive Wall Game',            m:'Wall-based game system',         cat:'surface',    links:['https://youtu.be/WIZrp0L6RiU?si=ZqXuUrtY_A6Vo5OZ'] },
  { n:'Interactive Projector Game',       m:'Projection game experience',     cat:'surface',    links:['https://youtu.be/b3VGP2fp2_o?si=5PiHZoI5XfKr2AFW9'] },
  { n:'Visit Qatar Interactive Floor',    m:'Interactive floor system',       cat:'surface',    links:['https://youtu.be/cFKVkosiqnM?si=c4xyXRAcPxT9WlZB'] },
  { n:'Salam LEAP 2024',                  m:'Expo interactive installation',  cat:'expo',       links:['https://youtu.be/hLJ4OD2fWBY?si=KjZSy2goIHMoqU3i'] },
  { n:'Interactive Display',              m:'Realtime screen interaction',    cat:'surface',    links:['https://youtu.be/v0KO1pabQRE?si=bznYK_Cw-mVcDNIV'] },
  { n:'Leap Motion Control',              m:'Gesture control interaction',    cat:'xr',         links:['https://www.youtube.com/watch?v=UnBDD_jRgqg'] },
  { n:'AI Powered Interactive Dome',      m:'AI-driven dome experience',      cat:'ai',         links:['https://www.youtube.com/watch?v=0jEvEhWXLR4'] },
  { n:'Interactive Volumetric LED',       m:'Volumetric LED content',         cat:'immersive',  links:['https://www.youtube.com/watch?v=8AU3v5KBcJg'] },
  { n:'Flying Simulator GITEX 2025',      m:'Simulation experience',          cat:'xr',         links:['https://www.youtube.com/watch?v=e0kLcEF3am4'] },
  { n:'DELL GITEX 2025',                  m:'Trade-show activation',          cat:'expo',       links:['https://www.youtube.com/watch?v=k4cv8R0QHYk'] },
  { n:'Dubai Airshow 2025',               m:'Aviation event installation',    cat:'expo',       links:['https://www.youtube.com/watch?v=mbOgAVLoVsQ'] },
  { n:'CyberQ 2025',                      m:'Dual-view event showcase',       cat:'expo',       links:['https://www.youtube.com/watch?v=KIBYnkmziAs','https://www.youtube.com/watch?v=xzpfyU-xb4k'] },
  { n:'AI Photobooth',                    m:'AI capture activation',          cat:'ai',         links:['https://www.youtube.com/watch?v=14gzsba5qpk'] },
  { n:'Interactive Hololoop',             m:'Looping holographic display',    cat:'immersive',  links:['https://www.youtube.com/watch?v=-L6tp8eD3pY'] },
  { n:'Interactive Transparent LED',      m:'Transparent LED experience',     cat:'immersive',  links:['https://www.youtube.com/watch?v=pMg2XaLZ4vA'] }
];
window.PROJECTS_DATA = PROJECTS_DATA;

function extractVideoId(url) {
  try {
    var parsed = new URL(url);
    if (parsed.hostname.indexOf('youtu.be') >= 0) {
      return parsed.pathname.replace('/', '');
    }
    if (parsed.searchParams.get('v')) return parsed.searchParams.get('v');
  } catch (err) {}
  return '';
}

function categoryTone(cat) {
  return {
    immersive: { bg:'#17091f', fc:'#ff4dbb' },
    surface: { bg:'#081a2a', fc:'#00e5ff' },
    ai: { bg:'#071b14', fc:'#00ff88' },
    xr: { bg:'#140f05', fc:'#ffd700' },
    gov: { bg:'#120812', fc:'#9b5ff5' },
    expo: { bg:'#171009', fc:'#ff8800' }
  }[cat] || { bg:'#0b1020', fc:'#9b5ff5' };
}

function syncProjectGridReady(grid) {
  if (!grid) return;
  grid.classList.add('in');
  grid.style.opacity = '1';
  grid.style.transform = 'translateY(0)';
}

function hydrateProjectCards(grid) {
  if (!grid) return;
  var cards = grid.querySelectorAll('.pc');
  cards.forEach(function(card, index) {
    var project = PROJECTS_DATA[index];
    if (!project) return;

    var actionsEl = card.querySelector('.pc-actions');
    if (!actionsEl) {
      actionsEl = document.createElement('div');
      actionsEl.className = 'pc-actions';
      card.querySelector('.pc-body').appendChild(actionsEl);
    }

    if (!actionsEl.children.length) {
      project.links.forEach(function(link, linkIndex) {
        var action = document.createElement('a');
        action.href = link;
        action.target = '_blank';
        action.rel = 'noopener';
        action.className = 'pc-link-btn';
        action.textContent = project.links.length > 1 ? 'Watch Reel ' + (linkIndex + 1) : 'Watch Reel';
        actionsEl.appendChild(action);
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var grid = document.getElementById('projGrid');
  if (grid && !grid.children.length) {
    PROJECTS_DATA.forEach(function(project, projectIndex) {
      var tone = categoryTone(project.cat);
      var firstLink = project.links[0];
      var videoId = extractVideoId(firstLink);
      var thumb = videoId ? 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg' : '';
      var actions = project.links.map(function(link, index) {
        return '<a href="' + link + '" target="_blank" rel="noopener" class="pc-link-btn">' +
          (project.links.length > 1 ? 'Watch Reel ' + (index + 1) : 'Watch Reel') +
        '</a>';
      }).join('');

      grid.insertAdjacentHTML('beforeend', [
        '<article class="pc" data-cat="' + project.cat + '">',
        '  <div class="pc-thumb" style="background:' + tone.bg + ';">',
        thumb
          ? '    <img src="' + thumb + '" alt="' + project.n + '" loading="' + (projectIndex < 6 ? 'eager' : 'lazy') + '"' + (projectIndex < 3 ? ' fetchpriority="high"' : '') + '>'
          : '    <div style="width:100%;height:100%;background:' + tone.bg + ';"></div>',
        '  </div>',
        '  <div class="pc-body">',
        '    <div class="pc-eng ' + project.cat + '">' + FILTER_LABELS[project.cat] + '</div>',
        '    <div class="pc-name">' + project.n + '</div>',
        '    <div class="pc-meta">' + project.m + '</div>',
        '    <div class="pc-actions">' + actions + '</div>',
        '  </div>',
        '</article>'
      ].join(''));
    });

    syncProjectGridReady(grid);
    requestAnimationFrame(function() {
      hydrateProjectCards(grid);
      syncProjectGridReady(grid);
      if (window.resizeSceneBases) window.resizeSceneBases();
    });
  } else if (grid) {
    hydrateProjectCards(grid);
    syncProjectGridReady(grid);
  }

  document.querySelectorAll('.flt-btn').forEach(function(btn) {
    var key = btn.dataset.filter;
    var count = key === 'all'
      ? PROJECTS_DATA.length
      : PROJECTS_DATA.filter(function(project) { return project.cat === key; }).length;
    btn.textContent = FILTER_LABELS[key] + ' (' + count + ')';

    btn.addEventListener('click', function() {
      document.querySelectorAll('.flt-btn').forEach(function(button) {
        button.classList.remove('active');
      });
      btn.classList.add('active');
      document.querySelectorAll('.pc').forEach(function(card) {
        card.classList.toggle('hidden', key !== 'all' && card.dataset.cat !== key);
      });
      syncProjectGridReady(grid);
      if (window.addScore) addScore(15);
    });
  });

  projS = new SceneBase('canvas-projects');
  projS.init(function(scene, cam, base) {
    cam.position.set(0, 3, 24);
    projS._baseCamY = 3;
    projS._lookY = 0;
    scene.fog = new THREE.FogExp2(0x020010, 0.017);
    scene.add(new THREE.AmbientLight(0x0a0520, 1.2));
    ptLight(scene, C.VIOLET, 3, -8, 5, 0);
    ptLight(scene, C.PINK,   2,  8, 4, 5);
    ptLight(scene, C.CYAN,   2,  0,-2, 8);
    addStars(scene, 2200, 210);
    addGrid(scene, -7, 0x2a0060, 0x100030);

    var portalColors = [C.VIOLET, C.CYAN, C.GREEN, C.PINK, C.GOLD, C.RED];
    var total = PROJECTS_DATA.length;
    PROJECTS_DATA.forEach(function(project, index) {
      var angle = (index / total) * Math.PI * 2;
      var radius = 9.5 + (index % 3) * 1.2;
      var y = ((index % 4) - 1.5) * 2.4;
      var color = portalColors[index % portalColors.length];
      var portal = glowRing(scene, 0.72, color, Math.sin(angle) * radius, y, Math.cos(angle) * radius - 2.5);
      portal.rotation.y = angle;
      base.float(portal, 0.15, 0.35 + index * 0.025, index * 0.45);

      var disc = new THREE.Mesh(
        new THREE.CircleGeometry(0.66, 24),
        new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.05, side: THREE.DoubleSide })
      );
      disc.position.set(Math.sin(angle) * radius, y, Math.cos(angle) * radius - 2.5);
      disc.rotation.y = angle;
      scene.add(disc);
      prj.portals.push({ portal: portal, disc: disc });
    });

    for (var i = 0; i < 8; i++) {
      var clusterAngle = (i / 8) * Math.PI * 2;
      var orb = icoMesh(scene, 0.32, [C.VIOLET, C.CYAN, C.PINK, C.GOLD][i % 4], Math.sin(clusterAngle) * 2.1, Math.cos(clusterAngle) * 1.5, 0, 0.55);
      base.float(orb, 0.24, 0.6, i);
      prj.cluster.push(orb);
    }

    var plane = new THREE.Mesh(
      new THREE.PlaneGeometry(44, 44, 22, 22),
      new THREE.MeshBasicMaterial({ color: C.VIOLET, wireframe: true, transparent: true, opacity: 0.05 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -6;
    scene.add(plane);
  });
});

function tickProjects(t) {
  if (!projS || !projS._ok || !projS.isVisible(420)) return;
  var cam = projS.camera;
  var p = window.getParallax ? window.getParallax('s-projects') : { x: 0, y: 0 };
  cam.position.x += (p.x * 2 - cam.position.x) * 0.035;
  cam.position.y += (-p.y * 1.5 - (cam.position.y - (projS._baseCamY || 3))) * 0.035;
  cam.lookAt(0, 0, 0);
  prj.portals.forEach(function(item, index) {
    item.portal.rotation.z += 0.02;
    item.portal.material.emissiveIntensity = 0.76 + Math.sin(t * 2 + index) * 0.35;
    item.disc.material.opacity = 0.03 + Math.sin(t * 1.4 + index) * 0.03;
  });
  prj.cluster.forEach(function(orb) {
    orb.rotation.y += 0.02;
  });
  projS.tickFloaters(t);
  projS.render();
}
window.tickProjects = tickProjects;
