/* ============================================
   ANSHU & VARSHA — OUR STORY
   Shared script for all pages
   ============================================ */

(function(){
  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Background canvas: stars + particles + hearts ---------------- */
  function initBackground(){
    const canvas = document.getElementById('bg-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    function resize(){
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const starCount = isMobile ? 40 : 90;
    const stars = Array.from({length: starCount}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      r: Math.random()*1.4 + 0.3,
      phase: Math.random()*Math.PI*2,
      speed: 0.008 + Math.random()*0.015
    }));

    const particleCount = isMobile ? 12 : 26;
    const particles = Array.from({length: particleCount}, () => ({
      x: Math.random()*w, y: Math.random()*h,
      r: Math.random()*2 + 0.6,
      vy: -(0.15 + Math.random()*0.3),
      vx: (Math.random()-0.5)*0.15,
      hue: Math.random() > 0.5 ? '155,123,216' : '255,158,196',
      alpha: 0.15 + Math.random()*0.25
    }));

    const heartCount = isMobile ? 3 : 6;
    const hearts = Array.from({length: heartCount}, () => spawnHeart(true));
    function spawnHeart(initial){
      return {
        x: Math.random()*w,
        y: initial ? Math.random()*h : h + 40,
        vy: -(0.18 + Math.random()*0.22),
        drift: (Math.random()-0.5)*0.4,
        size: 10 + Math.random()*14,
        alpha: 0.12 + Math.random()*0.18,
        t: Math.random()*Math.PI*2
      };
    }

    function drawHeart(x, y, size, alpha){
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ff9ec4';
      ctx.translate(x, y);
      ctx.beginPath();
      const s = size/16;
      ctx.moveTo(0, 4*s);
      ctx.bezierCurveTo(0, -2*s, -8*s, -2*s, -8*s, 3*s);
      ctx.bezierCurveTo(-8*s, 8*s, 0, 12*s, 0, 16*s);
      ctx.bezierCurveTo(0, 12*s, 8*s, 8*s, 8*s, 3*s);
      ctx.bezierCurveTo(8*s, -2*s, 0, -2*s, 0, 4*s);
      ctx.fill();
      ctx.restore();
    }

    function tick(){
      ctx.clearRect(0,0,w,h);

      // stars
      for(const s of stars){
        s.phase += s.speed;
        const tw = 0.5 + Math.sin(s.phase)*0.5;
        ctx.globalAlpha = 0.25 + tw*0.55;
        ctx.fillStyle = '#f7f5fb';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // particles
      for(const p of particles){
        p.x += p.vx; p.y += p.vy;
        if(p.y < -10){ p.y = h+10; p.x = Math.random()*w; }
        if(p.x < -10) p.x = w+10;
        if(p.x > w+10) p.x = -10;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
      }

      // hearts
      for(const hrt of hearts){
        hrt.y += hrt.vy;
        hrt.t += 0.02;
        hrt.x += Math.sin(hrt.t)*hrt.drift*0.4;
        if(hrt.y < -30){ Object.assign(hrt, spawnHeart(false)); }
        drawHeart(hrt.x, hrt.y, hrt.size, hrt.alpha);
      }

      if(!reduceMotion) requestAnimationFrame(tick);
    }
    tick();
  }

  /* ---------------- Cursor glow (desktop only) ---------------- */
  function initCursorGlow(){
    if(isMobile) return;
    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    glow.style.opacity = '0';
    document.body.appendChild(glow);
    let shown = false;
    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      if(!shown){ glow.style.opacity = '1'; shown = true; }
    });
  }

  /* ---------------- Page transitions ---------------- */
  function initPageNav(){
    const overlay = document.getElementById('transition-overlay');
    document.querySelectorAll('a[data-nav]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if(!href) return;
        e.preventDefault();
        const wrap = document.querySelector('.page-wrap');
        if(wrap) wrap.classList.add('fading-out');
        if(overlay) overlay.classList.add('active');
        setTimeout(() => { window.location.href = href; }, 620);
      });
    });
  }

  /* ---------------- Typing effect ---------------- */
  // lines: array of strings (can include \n for line breaks within a block)
  // opts: { speed, holdAfter, target }
  window.typeSequence = function(el, lines, opts = {}){
    if(!el) return;
    const speed = opts.speed || 34;
    const holdAfter = opts.holdAfter || 1400;
    const holdBetween = opts.holdBetween || 550;
    const onDone = opts.onDone || function(){};

    el.innerHTML = '';
    const textSpan = document.createElement('span');
    textSpan.className = 'type-target';
    const cursor = document.createElement('span');
    cursor.className = 'type-cursor';
    cursor.textContent = '\u00A0';
    el.appendChild(textSpan);
    el.appendChild(cursor);

    let lineIdx = 0;

    function typeLine(){
      if(lineIdx >= lines.length){
        cursor.style.display = 'none';
        onDone();
        return;
      }
      const line = lines[lineIdx];
      let charIdx = 0;
      textSpan.innerHTML = '';
      const lineEl = document.createElement('div');
      textSpan.appendChild(lineEl);

      function typeChar(){
        if(charIdx <= line.length){
          lineEl.textContent = line.slice(0, charIdx);
          charIdx++;
          setTimeout(typeChar, speed);
        } else {
          lineIdx++;
          setTimeout(typeLine, lineIdx < lines.length ? holdBetween : holdAfter);
        }
      }
      typeChar();
    }
    typeLine();
  };

  /* ---------------- Fade-loop text cycle ---------------- */
  window.startLoopText = function(el, lines, interval = 2600){
    if(!el) return;
    el.innerHTML = lines.map((l,i) => `<span${i===0?' class="show"':''}>${l}</span>`).join('');
    const spans = el.querySelectorAll('span');
    let idx = 0;
    if(spans.length < 2) return;
    setInterval(() => {
      spans[idx].classList.remove('show');
      idx = (idx + 1) % spans.length;
      spans[idx].classList.add('show');
    }, interval);
  };

  /* ---------------- Scroll reveal (timeline items, cards) ---------------- */
  window.initScrollReveal = function(selector, className = 'show', threshold = 0.35){
    const items = document.querySelectorAll(selector);
    if(!items.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add(className);
          io.unobserve(entry.target);
        }
      });
    }, { threshold });
    items.forEach(item => io.observe(item));
  };

  window.initTimelineDraw = function(){
    const tl = document.querySelector('.timeline');
    if(!tl) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          tl.style.setProperty('--draw-height', tl.offsetHeight + 'px');
          tl.classList.add('draw');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    io.observe(tl);
  };

  /* ---------------- Confetti burst ---------------- */
  window.launchConfetti = function(duration = 4200){
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:500;pointer-events:none;width:100%;height:100%;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;

    const colors = ['#ff9ec4','#f3c77e','#9b7bd8','#ffc9de','#ffffff'];
    const count = isMobile ? 70 : 150;
    const pieces = Array.from({length: count}, () => ({
      x: Math.random()*canvas.width,
      y: -20 - Math.random()*canvas.height*0.5,
      r: 4 + Math.random()*6,
      color: colors[Math.floor(Math.random()*colors.length)],
      vy: 1.5 + Math.random()*2.6,
      vx: (Math.random()-0.5)*2,
      rot: Math.random()*Math.PI,
      vr: (Math.random()-0.5)*0.2,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    }));

    const start = performance.now();
    function frame(now){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for(const p of pieces){
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if(p.y > canvas.height + 20){ p.y = -20; p.x = Math.random()*canvas.width; }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if(p.shape === 'rect'){
          ctx.fillRect(-p.r/2, -p.r/2*1.6, p.r, p.r*1.6);
        } else {
          ctx.beginPath();
          ctx.arc(0,0,p.r/2,0,Math.PI*2);
          ctx.fill();
        }
        ctx.restore();
      }
      if(now - start < duration){
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(frame);
  };

  /* ---------------- Image fallback for gallery ---------------- */
  window.attachImageFallback = function(){
    document.querySelectorAll('.g-card img, .carousel-slide img, .polaroid-photo img').forEach(img => {
      img.addEventListener('error', function(){
        const fallback = this.parentElement.querySelector('.g-fallback-holder');
        this.style.display = 'none';
        if(fallback) fallback.style.display = 'flex';
      }, { once: true });
    });
  };

  /* ---------------- Birthday countdown ---------------- */
  // Midnight (00:00) at the start of the birthday, India Standard Time.
  window.BIRTHDAY_TARGET = new Date('2026-10-27T00:00:00+05:30');

  window.getBirthdayRemaining = function(){
    const ms = window.BIRTHDAY_TARGET.getTime() - Date.now();
    const t = Math.max(0, Math.floor(ms / 1000));
    return { done: ms <= 0, days: Math.floor(t / 86400), hours: Math.floor(t % 86400 / 3600),
             minutes: Math.floor(t % 3600 / 60), seconds: t % 60 };
  };

  // root contains elements with data-unit="days|hours|minutes|seconds"
  window.startCountdown = function(root, onDone){
    if(!root) return;
    const els = {};
    root.querySelectorAll('[data-unit]').forEach(e => { els[e.dataset.unit] = e; });
    let timer;
    function update(){
      const r = window.getBirthdayRemaining();
      for(const k in els){
        const v = k === 'days' ? String(r[k]) : String(r[k]).padStart(2, '0');
        if(els[k].textContent !== v) els[k].textContent = v;
      }
      if(r.done){ clearInterval(timer); if(onDone) onDone(); }
    }
    update();
    if(!window.getBirthdayRemaining().done) timer = setInterval(update, 250);
  };

  /* ---------------- Scratch card ---------------- */
  // wrap contains a <canvas class="scratch-canvas"> laid over the hidden content.
  window.initScratchCard = function(wrap, opts = {}){
    const canvas = wrap.querySelector('canvas.scratch-canvas');
    if(!canvas) return null;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const threshold = opts.threshold || 0.45;
    let W = 0, H = 0, revealed = false, drawing = false, last = null, lastCheck = 0;

    function paint(){
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createLinearGradient(0, 0, W, H);
      ['#c9b3f0','#f0c9de','#f8e2a8','#e6a6c7','#b98cf0'].forEach((c, i) => g.addColorStop(i / 4, c));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for(let i = 0; i < W * H / 110; i++){
        ctx.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.35) + ')';
        ctx.fillRect(Math.random() * W, Math.random() * H, 1.6, 1.6);
      }
      ctx.fillStyle = 'rgba(23,15,38,0.6)';
      ctx.font = '600 ' + Math.max(13, Math.min(19, W / 24)) + 'px Poppins, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('✨ SCRATCH HERE ✨', W / 2, H / 2);
    }

    function scratchTo(p){
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(34, W / 11);
      ctx.beginPath();
      ctx.moveTo(last ? last.x : p.x, last ? last.y : p.y);
      ctx.lineTo(p.x + 0.1, p.y + 0.1);
      ctx.stroke();
      last = p;
    }

    function cleared(){
      let d;
      try { d = ctx.getImageData(0, 0, canvas.width, canvas.height).data; } catch(e){ return 0; }
      let c = 0, n = 0;
      for(let i = 3; i < d.length; i += 16){ n++; if(d[i] < 128) c++; }
      return n ? c / n : 0;
    }

    function reveal(){
      if(revealed) return;
      revealed = true;
      canvas.classList.add('gone');
      if(opts.onReveal) opts.onReveal();
    }

    const pos = e => { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    canvas.addEventListener('pointerdown', e => {
      if(revealed) return;
      drawing = true; last = null;
      try { canvas.setPointerCapture(e.pointerId); } catch(_){}
      scratchTo(pos(e)); e.preventDefault();
    });
    canvas.addEventListener('pointermove', e => {
      if(!drawing || revealed) return;
      scratchTo(pos(e));
      const now = performance.now();
      if(now - lastCheck > 150){ lastCheck = now; if(cleared() > threshold) reveal(); }
    });
    const end = () => { if(!drawing) return; drawing = false; last = null; if(cleared() > threshold) reveal(); };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);

    let lastW = 0;
    window.addEventListener('resize', () => {
      if(revealed || Math.abs(wrap.getBoundingClientRect().width - lastW) < 2) return;
      lastW = wrap.getBoundingClientRect().width; paint();
    });

    paint();
    lastW = W;
    return { reveal };
  };

  /* ---------------- Formatting for photo dates ---------------- */
  // "2022-03-14" -> "14 March 2022", "2022-03" -> "March 2022", any other text is shown as written.
  window.formatMemoryDate = function(d){
    if(!d) return '';
    const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(d);
    const names = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    if(!m || +m[2] < 1 || +m[2] > 12) return d;
    return (m[3] ? (+m[3]) + ' ' : '') + names[+m[2] - 1] + ' ' + m[1];
  };

  /* ---------------- Balloons: poppable, reveal a surprise message ---------------- */
  const BALLOON_COLORS = ['#e05c86', '#ff8fab', '#9b6dd6', '#d68f1f', '#f0a8c4'];
  const BALLOON_MESSAGES = [
    'You make ordinary days feel special 💕',
    "Here's to more laughs and more memories 🥂",
    "You're my favorite person, always 🎈",
    'So glad our paths crossed ❤️',
    'Wishing you all the happiness, today and always ✨',
    'You deserve every good thing coming your way 💫',
    'Pop! Another reason I adore you 😄'
  ];

  function getBalloonLayer(){
    let layer = document.getElementById('balloon-layer');
    if(!layer){
      layer = document.createElement('div');
      layer.id = 'balloon-layer';
      layer.className = 'balloon-layer';
      document.body.appendChild(layer);
    }
    return layer;
  }

  function miniBurst(x, y){
    for(let i = 0; i < 14; i++){
      const p = document.createElement('div');
      p.className = 'mini-burst-particle';
      const size = 4 + Math.random() * 5;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.background = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 50;
      p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 720);
    }
  }

  let balloonMsgTimer = null;
  function showBalloonMessage(text){
    let toast = document.getElementById('balloon-msg-toast');
    if(!toast){
      toast = document.createElement('div');
      toast.id = 'balloon-msg-toast';
      toast.className = 'balloon-msg-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(balloonMsgTimer);
    balloonMsgTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function popBalloon(b){
    if(b.classList.contains('pop')) return;
    const rect = b.getBoundingClientRect();
    b.classList.add('pop');
    miniBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    showBalloonMessage(BALLOON_MESSAGES[Math.floor(Math.random() * BALLOON_MESSAGES.length)]);
    setTimeout(() => { if(b.parentNode) b.remove(); }, 240);
  }

  window.spawnBalloons = function(count = 7){
    if(reduceMotion) return;
    const layer = getBalloonLayer();
    for(let i = 0; i < count; i++){
      const b = document.createElement('div');
      b.className = 'balloon';
      const left = 6 + Math.random() * 86;
      const dur = 9 + Math.random() * 5;
      const drift = (Math.random() * 60 - 30) + 'px';
      b.style.left = left + 'vw';
      b.style.background = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
      b.style.animationDuration = dur + 's';
      b.style.setProperty('--drift', drift);
      b.addEventListener('click', () => popBalloon(b));
      layer.appendChild(b);
      setTimeout(() => { if(b.parentNode) b.remove(); }, dur * 1000 + 500);
    }
  };

  /* ---------------- Falling petals + hearts ---------------- */
  window.startFallingPetals = function(){
    if(reduceMotion || document.getElementById('fall-canvas')) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'fall-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let w, h;
    function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#ff9ec4','#ffc9de','#f0c9de','#e6a6c7','#f4c869','#b98cf0'];
    function make(first){
      const heart = Math.random() < 0.3;
      return {
        heart,
        size: heart ? 10 + Math.random() * 10 : 5 + Math.random() * 6,
        x: Math.random() * w,
        y: first ? -Math.random() * h * 1.1 - 20 : -30 - Math.random() * 80,
        vy: 0.7 + Math.random() * 1.1,
        sway: 0.4 + Math.random() * 0.9,
        ph: Math.random() * 6.28, vph: 0.01 + Math.random() * 0.02,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.04,
        flip: Math.random() * 6.28, vf: 0.02 + Math.random() * 0.04,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.55 + Math.random() * 0.4
      };
    }
    const items = Array.from({ length: isMobile ? 26 : 48 }, () => make(true));

    function frame(){
      ctx.clearRect(0, 0, w, h);
      for(const p of items){
        p.ph += p.vph; p.x += Math.sin(p.ph) * p.sway; p.y += p.vy; p.rot += p.vr; p.flip += p.vf;
        if(p.y > h + 30) Object.assign(p, make(false));
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color;
        ctx.beginPath();
        if(p.heart){
          const s = p.size / 16;
          ctx.scale(s, s); ctx.translate(0, -8);
          ctx.moveTo(0, 4);
          ctx.bezierCurveTo(0, -2, -8, -2, -8, 3);
          ctx.bezierCurveTo(-8, 8, 0, 12, 0, 16);
          ctx.bezierCurveTo(0, 12, 8, 8, 8, 3);
          ctx.bezierCurveTo(8, -2, 0, -2, 0, 4);
        } else {
          const s = p.size;
          ctx.scale(0.25 + Math.abs(Math.cos(p.flip)) * 0.75, 1);
          ctx.moveTo(0, -s);
          ctx.bezierCurveTo(s * 0.85, -s * 0.4, s * 0.75, s * 0.7, 0, s);
          ctx.bezierCurveTo(-s * 0.75, s * 0.7, -s * 0.85, -s * 0.4, 0, -s);
        }
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(frame);
    }
    frame();
  };

  /* ---------------- Init on load ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initBackground();
    initCursorGlow();
    initPageNav();
  });
})();
