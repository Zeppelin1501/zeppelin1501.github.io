/* ═══════════════════════════════════════════════
   ZEPPELIN 3D — nav.js v2
   Custom cursor · Ripple · Parallax · Scroll-reveal · Score
═══════════════════════════════════════════════ */

/* ── SCORE ── */
var _score = parseInt(localStorage.getItem('zep3d_score') || '0');
function updateScoreEl() {
  var el = document.getElementById('scoreVal');
  if (el) el.textContent = String(_score).padStart(5,'0');
}
function addScore(n) {
  _score += n;
  localStorage.setItem('zep3d_score', _score);
  updateScoreEl();
}
window.addScore = addScore;
var activeSceneId = '';

/* ── CUSTOM CURSOR ── */
var cursorEl, cursorDot;
var mouseX = 0, mouseY = 0;
var dotX = 0, dotY = 0;

function initCursor() {
  cursorEl  = document.getElementById('cursor');
  cursorDot = document.getElementById('cursor-dot');
  if (!cursorEl) return;

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorEl.style.left  = mouseX + 'px';
    cursorEl.style.top   = mouseY + 'px';
    // dot follows with slight lag via rAF
  });

  document.addEventListener('mousedown', function(e) {
    cursorEl.classList.add('click');
    spawnRipple(e.clientX, e.clientY);
    setTimeout(function(){ cursorEl.classList.remove('click'); }, 200);
  });

  // Hover state on interactive elements
  document.addEventListener('mouseover', function(e) {
    var t = e.target.closest('a,button,.tl-item,.sk-node,.tech-pill,.pc,.btn,.sdot,.gnav-pill,.flt-btn,.pro-tab,#gameCanvas,.game-btn');
    if (t) cursorEl.classList.add('hover');
    else cursorEl.classList.remove('hover');
  });

  // Animate dot with smooth follow
  (function dotLoop() {
    dotX += (mouseX - dotX) * 0.14;
    dotY += (mouseY - dotY) * 0.14;
    if (cursorDot) {
      cursorDot.style.left = dotX + 'px';
      cursorDot.style.top  = dotY + 'px';
    }
    requestAnimationFrame(dotLoop);
  })();
}

/* ── CLICK RIPPLE ── */
function spawnRipple(x, y) {
  var r = document.createElement('div');
  r.className = 'ripple';
  r.style.left   = x + 'px';
  r.style.top    = y + 'px';
  r.style.width  = '16px';
  r.style.height = '16px';
  document.body.appendChild(r);
  setTimeout(function(){ r.remove(); }, 700);
}

/* ── MOUSE PARALLAX FOR EACH SECTION ── */
var sectionParallax = {};
function initParallax() {
  document.querySelectorAll('.scene').forEach(function(sec) {
    sec.addEventListener('mousemove', function(e) {
      var rect = sec.getBoundingClientRect();
      var cx = (e.clientX - rect.left) / rect.width  - 0.5;
      var cy = (e.clientY - rect.top)  / rect.height - 0.5;
      // Store for each scene's camera to read
      sectionParallax[sec.id] = { x: cx, y: cy };
    });
    sec.addEventListener('mouseleave', function() {
      sectionParallax[sec.id] = { x: 0, y: 0 };
    });
  });
}
window.getParallax = function(id) {
  return sectionParallax[id] || { x: 0, y: 0 };
};

function syncNavMetrics() {
  var nav = document.getElementById('gnav');
  if (nav) {
    document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
  }
}

/* ── SCROLL-REVEAL VIA IntersectionObserver ── */
function initReveal() {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        // Animate skill bars when skills section enters
        if (e.target.closest('#s-skills')) {
          document.querySelectorAll('.sk-fill').forEach(function(bar) {
            var pct = bar.dataset.pct || bar.style.getPropertyValue('--target-pct') || '80%';
            bar.style.width = pct;
          });
        }
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(function(el) { obs.observe(el); });

  // Skill bar animation trigger
  var skillObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.sk-fill[data-pct]').forEach(function(bar) {
          setTimeout(function(){ bar.style.width = bar.dataset.pct; }, 200);
        });
      }
    });
  }, { threshold: 0.2 });
  var skillSec = document.getElementById('s-skills');
  if (skillSec) skillObs.observe(skillSec);
}

/* ── NAV ACTIVE + SCROLL DOTS ── */
function initNavObserver() {
  var scenes  = Array.from(document.querySelectorAll('.scene'));
  var pills   = document.querySelectorAll('.gnav-pill');
  var dots    = document.querySelectorAll('.sdot');

  function setActive(id) {
    if (!id || id === activeSceneId) return;
    activeSceneId = id;
    var idx = scenes.findIndex(function(scene) { return scene.id === id; });
    pills.forEach(function(p, i) { p.classList.toggle('active', i === idx); });
    dots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
  }

  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        setActive(e.target.id);
      }
    });
  }, { rootMargin: '-38% 0px -38% 0px', threshold: 0 });

  scenes.forEach(function(s){ obs.observe(s); });
  if (scenes[0]) setActive(scenes[0].id);
}

/* ── SCROLL DOT CLICK ── */
function scrollToScene(idx) {
  var scenes = document.querySelectorAll('.scene');
  if (scenes[idx]) scenes[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.scrollToScene = scrollToScene;

/* ── INIT ALL ── */
document.addEventListener('DOMContentLoaded', function() {
  updateScoreEl();
  syncNavMetrics();
  initCursor();
  initParallax();
  initReveal();
  initNavObserver();
  window.addEventListener('resize', syncNavMetrics);

  // Mobile: hide cursor
  window.addEventListener('touchstart', function() {
    document.body.classList.add('using-touch');
  }, { once: true });
});
