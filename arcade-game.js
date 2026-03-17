/* arcade-game.js - Neon Rift Runner */
(function() {
  var arcade = {
    state: 'idle',
    canvas: null,
    ctx: null,
    wrap: null,
    overlay: null,
    overlayTitle: null,
    overlayText: null,
    scoreEl: null,
    bestEl: null,
    integrityEl: null,
    pulseEl: null,
    startBtn: null,
    restartBtn: null,
    width: 960,
    height: 540,
    dpr: 1,
    time: 0,
    lastFrame: 0,
    elapsed: 0,
    score: 0,
    best: parseInt(localStorage.getItem('zep3d_arcade_best') || '0', 10),
    combo: 0,
    comboWindow: 0,
    hazards: [],
    pickups: [],
    particles: [],
    stars: [],
    pointer: { active: false, x: 0, y: 0 },
    keys: {},
    timers: { hazard: 0, energy: 0, shield: 7 },
    player: {
      x: 480,
      y: 420,
      r: 16,
      speed: 360,
      integrity: 3,
      invuln: 0,
      shield: 0,
      pulse: 0,
      pulseWave: 0
    }
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function setOverlayBody(text) {
    if (!arcade.overlayText) return;
    arcade.overlayText.innerHTML = '';
    String(text).split('\n').forEach(function(line, index, arr) {
      arcade.overlayText.appendChild(document.createTextNode(line));
      if (index < arr.length - 1) arcade.overlayText.appendChild(document.createElement('br'));
    });
  }

  function showOverlay(title, text) {
    if (arcade.overlayTitle) arcade.overlayTitle.textContent = title;
    setOverlayBody(text);
    if (arcade.overlay) arcade.overlay.classList.remove('hidden');
  }

  function hideOverlay() {
    if (arcade.overlay) arcade.overlay.classList.add('hidden');
  }

  function updateHud() {
    if (arcade.scoreEl) arcade.scoreEl.textContent = String(Math.floor(arcade.score)).padStart(4, '0');
    if (arcade.bestEl) arcade.bestEl.textContent = String(Math.floor(arcade.best)).padStart(4, '0');
    if (arcade.integrityEl) arcade.integrityEl.textContent = String(arcade.player.integrity);
    if (arcade.pulseEl) arcade.pulseEl.textContent = String(Math.round(arcade.player.pulse)).padStart(3, '0') + '%';
  }

  function updateButtons() {
    if (!arcade.startBtn) return;
    if (arcade.state === 'running') arcade.startBtn.textContent = 'Pause';
    else if (arcade.state === 'paused') arcade.startBtn.textContent = 'Resume';
    else if (arcade.state === 'gameover') arcade.startBtn.textContent = 'Run Again';
    else arcade.startBtn.textContent = 'Start Run';
  }

  function createStars() {
    arcade.stars = [];
    for (var i = 0; i < 70; i++) {
      arcade.stars.push({
        x: Math.random() * arcade.width,
        y: Math.random() * arcade.height,
        z: rand(0.2, 1.2)
      });
    }
  }

  function resizeCanvas() {
    if (!arcade.canvas) return;
    var rect = arcade.canvas.getBoundingClientRect();
    var width = Math.max(320, Math.round(rect.width || arcade.wrap.clientWidth || 960));
    var height = Math.round(width * 9 / 16);
    arcade.dpr = Math.min(window.devicePixelRatio || 1, 2);
    arcade.width = width;
    arcade.height = height;
    arcade.canvas.width = Math.round(width * arcade.dpr);
    arcade.canvas.height = Math.round(height * arcade.dpr);
    arcade.canvas.style.height = height + 'px';
    arcade.ctx.setTransform(arcade.dpr, 0, 0, arcade.dpr, 0, 0);
    createStars();
    arcade.player.x = clamp(arcade.player.x || width * 0.5, 36, width - 36);
    arcade.player.y = clamp(arcade.player.y || height * 0.78, height * 0.36, height - 36);
  }

  function resetRun() {
    arcade.elapsed = 0;
    arcade.score = 0;
    arcade.combo = 0;
    arcade.comboWindow = 0;
    arcade.hazards = [];
    arcade.pickups = [];
    arcade.particles = [];
    arcade.timers.hazard = 0.45;
    arcade.timers.energy = 1.1;
    arcade.timers.shield = 8;
    arcade.player.integrity = 3;
    arcade.player.invuln = 0;
    arcade.player.shield = 0;
    arcade.player.pulse = 0;
    arcade.player.pulseWave = 0;
    arcade.player.x = arcade.width * 0.5;
    arcade.player.y = arcade.height * 0.78;
    updateHud();
  }

  function addParticles(x, y, color, count, force) {
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = rand(force * 0.4, force);
      arcade.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(0.35, 0.8),
        maxLife: rand(0.35, 0.8),
        size: rand(2, 5),
        color: color
      });
    }
  }

  function spawnHazard() {
    var difficulty = 1 + arcade.elapsed / 22;
    var radius = rand(14, 26);
    arcade.hazards.push({
      x: rand(radius + 20, arcade.width - radius - 20),
      y: -radius - 24,
      r: radius,
      speed: rand(160, 245) * difficulty,
      drift: rand(-65, 65),
      seed: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      spin: rand(-3.8, 3.8)
    });
  }

  function spawnPickup(kind) {
    arcade.pickups.push({
      kind: kind,
      x: rand(32, arcade.width - 32),
      y: -18,
      r: kind === 'shield' ? 12 : 10,
      speed: kind === 'shield' ? 165 : 185,
      wobble: Math.random() * Math.PI * 2
    });
  }

  function hitTest(entity, radius) {
    var dx = entity.x - arcade.player.x;
    var dy = entity.y - arcade.player.y;
    var rr = entity.r + radius;
    return dx * dx + dy * dy < rr * rr;
  }

  function spendIntegrity() {
    if (arcade.player.invuln > 0) return false;
    arcade.player.integrity = Math.max(0, arcade.player.integrity - 1);
    arcade.player.invuln = 1.15;
    arcade.player.pulse = Math.max(0, arcade.player.pulse - 30);
    arcade.combo = 0;
    arcade.comboWindow = 0;
    addParticles(arcade.player.x, arcade.player.y, '#ff4466', 18, 220);
    if (arcade.player.integrity <= 0) {
      finishRun(false);
      return true;
    }
    return false;
  }

  function triggerPulse() {
    if (arcade.state !== 'running' || arcade.player.pulse < 100) return;
    arcade.player.pulse = 0;
    arcade.player.pulseWave = 0.45;
    var removed = 0;
    arcade.hazards = arcade.hazards.filter(function(hazard) {
      var dx = hazard.x - arcade.player.x;
      var dy = hazard.y - arcade.player.y;
      if (dx * dx + dy * dy < 175 * 175) {
        removed++;
        addParticles(hazard.x, hazard.y, '#00e5ff', 8, 180);
        return false;
      }
      return true;
    });
    if (removed > 0) {
      arcade.score += removed * 45;
      if (window.addScore) addScore(removed * 8);
    }
  }

  function finishRun(newBest) {
    arcade.state = 'gameover';
    if (arcade.score > arcade.best) {
      arcade.best = Math.floor(arcade.score);
      localStorage.setItem('zep3d_arcade_best', String(arcade.best));
      newBest = true;
    }
    if (newBest && window.addScore) addScore(120);
    updateHud();
    updateButtons();
    showOverlay(
      newBest ? 'New High Score' : 'Run Complete',
      newBest
        ? 'You pushed the rift farther than any previous run. Start another run and try to break it again.'
        : 'Collect energy cores, charge your pulse with each pickup, and use Space when the meter hits 100%.'
    );
  }

  function startRun() {
    resetRun();
    arcade.state = 'running';
    hideOverlay();
    updateButtons();
  }

  function pauseRun(message) {
    if (arcade.state !== 'running') return;
    arcade.state = 'paused';
    updateButtons();
    showOverlay('Run Paused', message || 'Resume when you are ready. Arrow keys, WASD, mouse, and touch all work here.');
  }

  function resumeRun() {
    if (arcade.state !== 'paused') return;
    arcade.state = 'running';
    hideOverlay();
    updateButtons();
  }

  function updatePointer(event) {
    if (!arcade.canvas) return;
    var rect = arcade.canvas.getBoundingClientRect();
    arcade.pointer.x = clamp(event.clientX - rect.left, 0, arcade.width);
    arcade.pointer.y = clamp(event.clientY - rect.top, 0, arcade.height);
  }

  function overlayIntroText() {
    if (arcade.width <= 460) {
      return 'Collect green cores.\nAvoid red shards.\nPulse at 100%.';
    }
    return 'Pilot the signal craft through a collapsing data lane. Collect green cores, avoid red shards, and fire a pulse with Space when the meter reaches 100%.';
  }

  function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    var words = text.split(/\s+/);
    var line = '';
    var currentY = y;

    words.forEach(function(word) {
      var next = line ? line + ' ' + word : word;
      if (ctx.measureText(next).width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = word;
        currentY += lineHeight;
      } else {
        line = next;
      }
    });

    if (line) ctx.fillText(line, x, currentY);
    return currentY;
  }

  function handleInput(dt) {
    var moveX = 0;
    var moveY = 0;
    if (arcade.keys.ArrowLeft || arcade.keys.KeyA) moveX -= 1;
    if (arcade.keys.ArrowRight || arcade.keys.KeyD) moveX += 1;
    if (arcade.keys.ArrowUp || arcade.keys.KeyW) moveY -= 1;
    if (arcade.keys.ArrowDown || arcade.keys.KeyS) moveY += 1;

    if (arcade.pointer.active) {
      arcade.player.x += (arcade.pointer.x - arcade.player.x) * Math.min(1, dt * 10);
      arcade.player.y += (arcade.pointer.y - arcade.player.y) * Math.min(1, dt * 10);
    } else if (moveX || moveY) {
      var len = Math.sqrt(moveX * moveX + moveY * moveY) || 1;
      arcade.player.x += (moveX / len) * arcade.player.speed * dt;
      arcade.player.y += (moveY / len) * arcade.player.speed * dt;
    }

    arcade.player.x = clamp(arcade.player.x, 28, arcade.width - 28);
    arcade.player.y = clamp(arcade.player.y, arcade.height * 0.34, arcade.height - 28);
  }

  function updateRun(dt) {
    arcade.elapsed += dt;
    arcade.score += dt * (28 + arcade.elapsed * 1.2);
    arcade.comboWindow = Math.max(0, arcade.comboWindow - dt);
    if (arcade.comboWindow <= 0) arcade.combo = 0;

    arcade.player.invuln = Math.max(0, arcade.player.invuln - dt);
    arcade.player.shield = Math.max(0, arcade.player.shield - dt);
    arcade.player.pulseWave = Math.max(0, arcade.player.pulseWave - dt);

    handleInput(dt);

    var difficulty = 1 + arcade.elapsed / 20;
    arcade.timers.hazard -= dt;
    arcade.timers.energy -= dt;
    arcade.timers.shield -= dt;

    if (arcade.timers.hazard <= 0) {
      spawnHazard();
      arcade.timers.hazard = Math.max(0.24, 0.68 - difficulty * 0.05);
    }
    if (arcade.timers.energy <= 0) {
      spawnPickup('energy');
      arcade.timers.energy = rand(0.95, 1.45);
    }
    if (arcade.timers.shield <= 0) {
      spawnPickup('shield');
      arcade.timers.shield = rand(11, 16);
    }

    arcade.hazards = arcade.hazards.filter(function(hazard) {
      hazard.y += hazard.speed * dt;
      hazard.x += Math.sin(hazard.seed + hazard.y * 0.015) * hazard.drift * dt;
      hazard.rot += hazard.spin * dt;

      if (hazard.y - hazard.r > arcade.height + 40) return false;

      if (hitTest(hazard, arcade.player.r)) {
        if (arcade.player.shield > 0) {
          arcade.score += 30;
          addParticles(hazard.x, hazard.y, '#00ff88', 8, 160);
          return false;
        }
        spendIntegrity();
        return false;
      }
      return true;
    });

    if (arcade.state !== 'running') {
      updateHud();
      return;
    }

    arcade.pickups = arcade.pickups.filter(function(pickup) {
      pickup.y += pickup.speed * dt;
      pickup.x += Math.sin(pickup.wobble + pickup.y * 0.018) * 42 * dt;
      pickup.wobble += dt * 1.9;

      if (pickup.y - pickup.r > arcade.height + 40) return false;

      if (hitTest(pickup, arcade.player.r + 2)) {
        if (pickup.kind === 'shield') {
          arcade.player.shield = Math.max(arcade.player.shield, 6.5);
          arcade.score += 110;
          arcade.player.pulse = clamp(arcade.player.pulse + 18, 0, 100);
          addParticles(pickup.x, pickup.y, '#00e5ff', 12, 140);
          if (window.addScore) addScore(18);
        } else {
          arcade.combo += 1;
          arcade.comboWindow = 2.4;
          arcade.player.pulse = clamp(arcade.player.pulse + 25, 0, 100);
          arcade.score += 120 + Math.min(arcade.combo, 6) * 28;
          addParticles(pickup.x, pickup.y, '#00ff88', 14, 170);
          if (window.addScore) addScore(15);
        }
        return false;
      }
      return true;
    });

    arcade.particles = arcade.particles.filter(function(particle) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= 0.988;
      particle.vy *= 0.988;
      particle.life -= dt;
      return particle.life > 0;
    });

    updateHud();
  }

  function drawBackground(time) {
    var ctx = arcade.ctx;
    var gradient = ctx.createLinearGradient(0, 0, 0, arcade.height);
    gradient.addColorStop(0, '#04091c');
    gradient.addColorStop(1, '#02030d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, arcade.width, arcade.height);

    ctx.save();
    ctx.strokeStyle = 'rgba(0,229,255,0.12)';
    ctx.lineWidth = 1;
    for (var i = 0; i < 10; i++) {
      var y = ((i / 9) * arcade.height + (time * 120)) % arcade.height;
      var scale = y / arcade.height;
      var inset = scale * arcade.width * 0.36;
      ctx.beginPath();
      ctx.moveTo(inset, y);
      ctx.lineTo(arcade.width - inset, y);
      ctx.stroke();
    }
    for (var j = -4; j <= 4; j++) {
      ctx.beginPath();
      ctx.moveTo(arcade.width * 0.5, arcade.height);
      ctx.lineTo(arcade.width * 0.5 + j * 95, arcade.height * 0.18);
      ctx.stroke();
    }
    ctx.restore();

    arcade.stars.forEach(function(star) {
      star.y += star.z * (arcade.state === 'running' ? 120 : 30) * (1 / 60);
      if (star.y > arcade.height) {
        star.y = -4;
        star.x = Math.random() * arcade.width;
      }
      arcade.ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + star.z * 0.5) + ')';
      arcade.ctx.fillRect(star.x, star.y, star.z * 1.8, star.z * 1.8);
    });
  }

  function drawHazard(hazard) {
    var ctx = arcade.ctx;
    ctx.save();
    ctx.translate(hazard.x, hazard.y);
    ctx.rotate(hazard.rot);
    ctx.strokeStyle = 'rgba(255,68,102,0.9)';
    ctx.fillStyle = 'rgba(255,68,102,0.18)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -hazard.r);
    ctx.lineTo(hazard.r * 0.95, 0);
    ctx.lineTo(0, hazard.r);
    ctx.lineTo(-hazard.r * 0.95, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawPickup(pickup) {
    var ctx = arcade.ctx;
    var pulse = 1 + Math.sin(arcade.time * 4 + pickup.wobble) * 0.12;
    ctx.save();
    ctx.translate(pickup.x, pickup.y);
    ctx.scale(pulse, pulse);
    ctx.lineWidth = 2;
    if (pickup.kind === 'shield') {
      ctx.strokeStyle = 'rgba(0,229,255,0.92)';
      ctx.fillStyle = 'rgba(0,229,255,0.18)';
      ctx.beginPath();
      ctx.arc(0, 0, pickup.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, pickup.r * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(0,255,136,0.96)';
      ctx.fillStyle = 'rgba(0,255,136,0.18)';
      ctx.beginPath();
      ctx.moveTo(0, -pickup.r);
      ctx.lineTo(pickup.r * 0.8, 0);
      ctx.lineTo(0, pickup.r);
      ctx.lineTo(-pickup.r * 0.8, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPlayer() {
    var ctx = arcade.ctx;
    var invulnAlpha = arcade.player.invuln > 0 ? 0.42 + Math.sin(arcade.time * 24) * 0.25 : 1;
    ctx.save();
    ctx.translate(arcade.player.x, arcade.player.y);
    ctx.globalAlpha = invulnAlpha;

    if (arcade.player.shield > 0) {
      ctx.strokeStyle = 'rgba(0,229,255,0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, arcade.player.r + 12, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (arcade.player.pulseWave > 0) {
      var wave = 1 - arcade.player.pulseWave / 0.45;
      ctx.strokeStyle = 'rgba(0,229,255,' + (1 - wave) + ')';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 32 + wave * 160, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0,229,255,0.15)';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, -arcade.player.r - 7);
    ctx.lineTo(arcade.player.r, arcade.player.r + 6);
    ctx.lineTo(0, arcade.player.r - 2);
    ctx.lineTo(-arcade.player.r, arcade.player.r + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ff4dbb';
    ctx.beginPath();
    ctx.moveTo(-6, arcade.player.r + 5);
    ctx.lineTo(0, arcade.player.r + 18 + Math.sin(arcade.time * 24) * 4);
    ctx.lineTo(6, arcade.player.r + 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawParticles() {
    arcade.particles.forEach(function(particle) {
      var alpha = particle.life / particle.maxLife;
      arcade.ctx.fillStyle = particle.color.replace(')', ',' + alpha + ')').replace('rgb', 'rgba');
      if (particle.color.indexOf('#') === 0) {
        arcade.ctx.fillStyle = particle.color;
        arcade.ctx.globalAlpha = alpha;
      } else {
        arcade.ctx.globalAlpha = 1;
      }
      arcade.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      arcade.ctx.globalAlpha = 1;
    });
  }

  function drawUiHints() {
    if (arcade.state !== 'running') return;
    var ctx = arcade.ctx;
    var baseFont = arcade.width <= 420 ? 9 : arcade.width <= 620 ? 10 : 12;
    var inset = arcade.width <= 420 ? 12 : 18;
    var maxWidth = arcade.width - inset * 2;
    ctx.save();
    ctx.font = baseFont + 'px "Share Tech Mono", monospace';
    ctx.fillStyle = 'rgba(215,205,239,0.75)';
    drawWrappedText(
      ctx,
      arcade.width <= 420
        ? 'Green cores charge pulse. Cyan shields you. Pulse at 100%.'
        : 'Collect green cores. Shield pickups are cyan. Pulse with SPACE at 100%.',
      inset,
      arcade.height - (arcade.width <= 420 ? 32 : 18),
      maxWidth,
      baseFont + 4
    );
    if (arcade.combo > 1) {
      ctx.fillStyle = 'rgba(255,215,0,0.92)';
      ctx.fillText('COMBO x' + arcade.combo, inset, arcade.width <= 420 ? 22 : 26);
    }
    ctx.restore();
  }

  function render() {
    drawBackground(arcade.time);
    arcade.hazards.forEach(drawHazard);
    arcade.pickups.forEach(drawPickup);
    drawPlayer();
    drawParticles();
    drawUiHints();
  }

  function frame(now) {
    if (!arcade.lastFrame) arcade.lastFrame = now;
    var dt = Math.min(0.032, (now - arcade.lastFrame) / 1000);
    arcade.lastFrame = now;
    arcade.time = now / 1000;

    if (arcade.state === 'running') updateRun(dt);
    render();
    requestAnimationFrame(frame);
  }

  document.addEventListener('DOMContentLoaded', function() {
    arcade.canvas = document.getElementById('gameCanvas');
    arcade.overlay = document.getElementById('gameOverlay');
    arcade.overlayTitle = document.getElementById('gameOverlayTitle');
    arcade.overlayText = document.getElementById('gameOverlayText');
    arcade.scoreEl = document.getElementById('gameScore');
    arcade.bestEl = document.getElementById('gameBest');
    arcade.integrityEl = document.getElementById('gameIntegrity');
    arcade.pulseEl = document.getElementById('gamePulse');
    arcade.startBtn = document.getElementById('gameStartBtn');
    arcade.restartBtn = document.getElementById('gameRestartBtn');
    if (!arcade.canvas) return;

    arcade.ctx = arcade.canvas.getContext('2d');
    arcade.wrap = arcade.canvas.parentElement;
    resizeCanvas();
    resetRun();
    updateButtons();
    showOverlay('Neon Rift Runner', overlayIntroText());

    arcade.startBtn.addEventListener('click', function() {
      if (arcade.state === 'idle' || arcade.state === 'gameover') startRun();
      else if (arcade.state === 'running') pauseRun();
      else resumeRun();
    });

    arcade.restartBtn.addEventListener('click', function() {
      startRun();
    });

    arcade.canvas.addEventListener('pointerdown', function(event) {
      arcade.pointer.active = true;
      updatePointer(event);
      if (arcade.state === 'idle' || arcade.state === 'gameover') startRun();
    });

    arcade.canvas.addEventListener('pointermove', function(event) {
      updatePointer(event);
    });

    arcade.canvas.addEventListener('pointerup', function() {
      arcade.pointer.active = false;
    });

    arcade.canvas.addEventListener('pointercancel', function() {
      arcade.pointer.active = false;
    });

    arcade.canvas.addEventListener('pointerleave', function() {
      arcade.pointer.active = false;
    });

    window.addEventListener('keydown', function(event) {
      var keysToStop = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
      if ((arcade.state === 'running' || arcade.state === 'paused') && keysToStop.indexOf(event.code) >= 0) {
        event.preventDefault();
      }

      arcade.keys[event.code] = true;

      if (event.code === 'Enter' && (arcade.state === 'idle' || arcade.state === 'gameover')) {
        startRun();
      } else if (event.code === 'KeyP') {
        if (arcade.state === 'running') pauseRun();
        else if (arcade.state === 'paused') resumeRun();
      } else if (event.code === 'Space') {
        if (arcade.state === 'paused') resumeRun();
        else triggerPulse();
      }
    });

    window.addEventListener('keyup', function(event) {
      arcade.keys[event.code] = false;
    });

    window.addEventListener('resize', function() {
      resizeCanvas();
      if (arcade.state !== 'running') {
        showOverlay(
          arcade.overlayTitle ? arcade.overlayTitle.textContent : 'Neon Rift Runner',
          arcade.overlayText && arcade.overlayText.textContent ? arcade.overlayText.textContent : overlayIntroText()
        );
      }
    });

    if (window.ResizeObserver) {
      new ResizeObserver(function() {
        resizeCanvas();
      }).observe(arcade.wrap);
    }

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) pauseRun('The run paused while the tab was hidden. Resume when you are ready.');
    });

    var section = document.getElementById('s-arcade');
    if (section && window.IntersectionObserver) {
      new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting && arcade.state === 'running') {
            pauseRun('The run paused while you were outside the arcade section.');
          }
        });
      }, { threshold: 0.1 }).observe(section);
    }

    requestAnimationFrame(frame);
  });
})();
