// Interactive Prototype Logic

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Hero Prototype
    toggleBeforeAfter('before');
    
    // Initialize Demo Prototype
    changeDemoState('wrong');
});

// Hero Section: Before/After AI Toggle
function toggleBeforeAfter(state) {
    const beforeEl = document.getElementById('before-ai');
    const afterEl = document.getElementById('after-ai');
    const btns = document.querySelectorAll('.proto-btn');
    
    if (!beforeEl || !afterEl) return;

    btns.forEach(btn => btn.classList.remove('active'));

    if (state === 'before') {
        beforeEl.classList.add('active');
        afterEl.classList.remove('active');
        if (btns[0]) btns[0].classList.add('active');
    } else {
        beforeEl.classList.remove('active');
        afterEl.classList.add('active');
        if (btns[1]) btns[1].classList.add('active');
    }
}

// Cyclical Demo Feedback Animation
const cycleItems = ['cycle-headphone', 'cycle-watch', 'cycle-phone'];
const lineItems = ['line-headphone', 'line-watch', 'line-phone'];
let currentCycleIndex = 0;

function startFeedbackCycle() {
    setInterval(() => {
        // Remove active class from all devices
        cycleItems.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.remove('active');
        });
        
        // Remove active-line from all text lines
        lineItems.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.classList.remove('active-line');
        });
        
        // Advance to next
        currentCycleIndex = (currentCycleIndex + 1) % cycleItems.length;
        
        // Activate device
        const currentEl = document.getElementById(cycleItems[currentCycleIndex]);
        if(currentEl) currentEl.classList.add('active');
        
        // Highlight the matching text line (gray = active)
        const currentLine = document.getElementById(lineItems[currentCycleIndex]);
        if(currentLine) currentLine.classList.add('active-line');
        
    }, 3000);
}

startFeedbackCycle();

// --- HOW IT WORKS INTERACTIVITY ---
const howSteps = [
    {
        img: 'görseller/step1.png',
        pill: 'Plan Seçiliyor...'
    },
    {
        img: 'görseller/step2.png',
        pill: 'Kamera Aktif'
    },
    {
        img: 'görseller/step3.png',
        pill: 'İskelet Çıkarılıyor...'
    },
    {
        img: 'görseller/step4.png',
        pill: 'Duruşu Düzeltin'
    }
];

window.changeHowStep = function(index) {
    const stepperContainer = document.getElementById('how-stepper');
    if (!stepperContainer) return;
    
    // Update active class on cards
    const cards = stepperContainer.querySelectorAll('.step-card');
    cards.forEach((card, i) => {
        if (i === index) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    
    // Update image and pill
    const imgEl = document.getElementById('how-img');
    const pillEl = document.getElementById('how-pill');
    
    if (imgEl && pillEl) {
        // Fade out slightly
        imgEl.style.opacity = '0.2';
        pillEl.style.transform = 'scale(0.9)';
        pillEl.style.opacity = '0.5';
        
        setTimeout(() => {
            imgEl.src = howSteps[index].img;
            pillEl.textContent = howSteps[index].pill;
            
            // Fade back in
            imgEl.style.opacity = '0.6';
            pillEl.style.transform = 'scale(1)';
            pillEl.style.opacity = '1';
        }, 300);
    }
};

// --- ADAPTIVE NAVIGATION SIMULATION (CANVAS + OSM TILES) ---
(function() {
  const canvas = document.getElementById('navMapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const ZOOM = 16, TILE = 256;
  function lon2x(lon) { return (lon + 180) / 360 * Math.pow(2, ZOOM); }
  function lat2y(lat) {
    const s = Math.sin(lat * Math.PI / 180);
    return (0.5 - Math.log((1+s)/(1-s)) / (4*Math.PI)) * Math.pow(2, ZOOM);
  }
  let cam = { tx: 0, ty: 0, scale: 1.1 };
  function geo2px(lat, lon) {
    return [
      canvas.width  / 2 + (lon2x(lon) - cam.tx) * TILE * cam.scale,
      canvas.height / 2 + (lat2y(lat)  - cam.ty) * TILE * cam.scale
    ];
  }
  function resize() {
    const p = canvas.parentElement.getBoundingClientRect();
    canvas.width  = p.width  || 560;
    canvas.height = p.height || 480;
  }
  resize();
  window.addEventListener('resize', () => { resize(); draw(); });

  const tileCache = {};
  function getTile(x, y) {
    const key = `${x},${y}`;
    if (tileCache[key]) return tileCache[key];
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const sub = ['a','b','c'][(Math.abs(x)+Math.abs(y))%3];
    img.src = `https://${sub}.tile.openstreetmap.org/${ZOOM}/${x}/${y}.png`;
    img.onload = () => { tileCache[key] = img; draw(); };
    tileCache[key] = img;
    return img;
  }

  const START = { lat: 41.0054, lon: 28.9727 };
  const END   = { lat: 41.0115, lon: 28.9835 };
  const PLANNED = [
    { lat: 41.0054, lon: 28.9727 }, { lat: 41.0063, lon: 28.9742 },
    { lat: 41.0072, lon: 28.9757 }, { lat: 41.0080, lon: 28.9768 },
    { lat: 41.0089, lon: 28.9785 }, { lat: 41.0099, lon: 28.9805 },
    { lat: 41.0115, lon: 28.9835 },
  ];
  const DEV_IDX = 3;
  const WRONG = [
    { lat: 41.0080, lon: 28.9768 }, { lat: 41.0065, lon: 28.9790 }, { lat: 41.0048, lon: 28.9810 },
  ];
  const REROUTE = [
    { lat: 41.0080, lon: 28.9768 }, { lat: 41.0088, lon: 28.9778 },
    { lat: 41.0097, lon: 28.9795 }, { lat: 41.0106, lon: 28.9812 }, { lat: 41.0115, lon: 28.9835 },
  ];

  let progress = 0, wrongProgress = 0, rerouteProgress = 0, lineProgress = 0;
  let phase = 'idle', pulseT = 0;

  function setCamOverview() {
    cam.tx = lon2x((START.lon + END.lon) / 2);
    cam.ty = lat2y((START.lat + END.lat) / 2);
    cam.scale = 1.05;
  }
  setCamOverview();

  function preload() {
    const cx = Math.floor(cam.tx), cy = Math.floor(cam.ty);
    for (let dx = -3; dx <= 3; dx++) for (let dy = -3; dy <= 3; dy++) getTile(cx+dx, cy+dy);
  }
  preload();

  function ptAlongRoute(route, t) {
    const i = Math.min(Math.floor(t), route.length - 2);
    const f = t - i;
    return { lat: route[i].lat + (route[i+1].lat-route[i].lat)*f, lon: route[i].lon + (route[i+1].lon-route[i].lon)*f };
  }
  function ptAlongWrong(t) { return ptAlongRoute(WRONG, t * (WRONG.length-1)); }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#070706'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const scl = cam.scale * TILE;
    const L = Math.floor(cam.tx - canvas.width/2/scl)-1, R = Math.ceil(cam.tx + canvas.width/2/scl)+1;
    const T = Math.floor(cam.ty - canvas.height/2/scl)-1, B = Math.ceil(cam.ty + canvas.height/2/scl)+1;
    for (let tx = L; tx <= R; tx++) for (let ty = T; ty <= B; ty++) {
      const img = getTile(tx, ty);
      if (img && img.complete && img.naturalWidth) {
        const px = canvas.width/2 + (tx - cam.tx)*scl, py = canvas.height/2 + (ty - cam.ty)*scl;
        ctx.drawImage(img, px, py, scl, scl);
      }
    }
    ctx.save(); ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=0.25;
    ctx.fillStyle='#070706'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.globalAlpha=1; ctx.restore();

    drawPoly(PLANNED, 'rgba(255,255,255,0.14)', 5, [9,6]);
    if (progress > 0) {
      const pts = [];
      for (let i=0; i<=Math.floor(progress) && i<PLANNED.length; i++) pts.push(PLANNED[i]);
      pts.push(ptAlongRoute(PLANNED, Math.min(progress, DEV_IDX)));
      drawPoly(pts, '#1db954', 6, null, true);
    }
    if (wrongProgress > 0) {
      const wPts = Array.from({length:21}, (_,i) => ptAlongWrong((i/20)*wrongProgress));
      drawPoly(wPts, '#e8432d', 5, [7,5]);
      if (wrongProgress > 0.2) {
        const p0 = ptAlongWrong(Math.max(0, wrongProgress-0.05));
        const p1 = ptAlongWrong(wrongProgress);
        const [x0,y0]=geo2px(p0.lat,p0.lon), [x1,y1]=geo2px(p1.lat,p1.lon);
        drawArrow(x1, y1, Math.atan2(y1-y0, x1-x0), '#e8432d', 10);
      }
    }
    if (lineProgress > 0 || phase === 'following' || phase === 'done') {
      const activeLineT = (phase === 'following' || phase === 'done') ? 1.0 : lineProgress;
      const maxT = activeLineT * (REROUTE.length - 1);
      const rPts = Array.from({length:41}, (_,i) => { 
        const t = (i/40) * maxT; 
        return t <= REROUTE.length - 1 ? ptAlongRoute(REROUTE, t) : null; 
      }).filter(Boolean);
      if (rPts.length > 1) {
        drawPoly(rPts, '#1db954', 5, [12,5], true);
        const tip = rPts[rPts.length - 1], prev = rPts[rPts.length - 2];
        const [px,py] = geo2px(prev.lat, prev.lon), [tx2,ty2] = geo2px(tip.lat, tip.lon);
        drawArrow(tx2, ty2, Math.atan2(ty2-py, tx2-px), '#1db954', 10);
      }
    }
    drawPin(START, '#ffffff', 'A');
    drawPin(END, '#ffa040', 'B');

    pulseT += 0.05;
    let runnerPt;
    if (phase === 'moving' || phase === 'idle') {
      runnerPt = ptAlongRoute(PLANNED, Math.min(progress, DEV_IDX));
    } else if (phase === 'wrong') {
      runnerPt = ptAlongWrong(wrongProgress);
    } else if (phase === 'following' || phase === 'done') {
      runnerPt = ptAlongRoute(REROUTE, rerouteProgress * (REROUTE.length - 1));
    } else {
      runnerPt = PLANNED[DEV_IDX];
    }
    const [rx,ry] = geo2px(runnerPt.lat, runnerPt.lon);
    const pr = 13 + Math.sin(pulseT)*4, pa = 0.22 + Math.sin(pulseT)*0.12;
    const col = phase==='wrong' ? '#e8432d' : '#1db954';
    ctx.beginPath(); ctx.arc(rx, ry, pr, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${phase==='wrong'?'232,67,45':'29,185,84'},${pa})`; ctx.fill();
    ctx.beginPath(); ctx.arc(rx, ry, 7, 0, Math.PI*2);
    ctx.fillStyle=col; ctx.fill(); ctx.strokeStyle='#fff'; ctx.lineWidth=2.5; ctx.stroke();
  }

  function drawPoly(pts, color, width, dash, glow) {
    if (!pts||pts.length<2) return;
    ctx.save();
    if (glow) { ctx.shadowColor=color; ctx.shadowBlur=10; }
    ctx.beginPath(); ctx.strokeStyle=color; ctx.lineWidth=width;
    ctx.lineCap='round'; ctx.lineJoin='round'; ctx.setLineDash(dash||[]);
    const [x0,y0]=geo2px(pts[0].lat,pts[0].lon); ctx.moveTo(x0,y0);
    for (let i=1; i<pts.length; i++) { const [x,y]=geo2px(pts[i].lat,pts[i].lon); ctx.lineTo(x,y); }
    ctx.stroke(); ctx.restore();
  }
  function drawArrow(x, y, angle, color, size) {
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
    ctx.beginPath(); ctx.moveTo(size,0); ctx.lineTo(-size*.55,size*.55); ctx.lineTo(-size*.55,-size*.55);
    ctx.closePath(); ctx.fillStyle=color; ctx.fill(); ctx.restore();
  }
  function drawPin(pt, color, label) {
    const [x,y] = geo2px(pt.lat, pt.lon);
    ctx.save(); ctx.shadowColor='rgba(0,0,0,0.5)'; ctx.shadowBlur=8;
    ctx.beginPath(); ctx.arc(x, y-20, 11, 0, Math.PI*2); ctx.fillStyle=color; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x-5,y-11); ctx.lineTo(x,y-1); ctx.lineTo(x+5,y-11);
    ctx.fillStyle=color; ctx.fill(); ctx.shadowBlur=0;
    ctx.fillStyle='#111'; ctx.font='bold 11px monospace';
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label,x,y-20); ctx.restore();
  }

  function easeInOut(t) { return t<0.5?2*t*t:-1+(4-2*t)*t; }
  function animateTo(getter, setter, target, dur, onDone) {
    const start=getter(), t0=performance.now();
    function step(now) {
      const raw=Math.min((now-t0)/dur,1), e=easeInOut(raw);
      setter(start+(target-start)*e); draw();
      if (raw<1) requestAnimationFrame(step); else { setter(target); draw(); onDone&&onDone(); }
    }
    requestAnimationFrame(step);
  }
  function panCam(toTx, toTy, toScale, dur, onDone) {
    const s0={tx:cam.tx,ty:cam.ty,scale:cam.scale}, t0=performance.now();
    function step(now) {
      const raw=Math.min((now-t0)/dur,1), e=1-Math.pow(1-raw,3);
      cam.tx=s0.tx+(toTx-s0.tx)*e; cam.ty=s0.ty+(toTy-s0.ty)*e; cam.scale=s0.scale+(toScale-s0.scale)*e;
      draw();
      if (raw<1) requestAnimationFrame(step); else { cam.tx=toTx; cam.ty=toTy; cam.scale=toScale; draw(); onDone&&onDone(); }
    }
    requestAnimationFrame(step);
  }

  // Animate a number element from 'from' to 'to' over 'dur' ms
  function animateNumber(elId, from, to, dur, color, onDone) {
    const el = document.getElementById(elId);
    if (!el) { onDone && onDone(); return; }
    const t0 = performance.now();
    el.style.color = color;
    function step(now) {
      const raw = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - raw, 3);
      el.textContent = Math.round(from + (to - from) * ease);
      if (raw < 1) requestAnimationFrame(step);
      else { el.textContent = to; onDone && onDone(); }
    }
    requestAnimationFrame(step);
  }

  function navShowPanel() {
    // Cascade: weight → sets+reps → rest → exercise name
    // Step 1: Weight 80→60 (green)
    setTimeout(() => {
      animateNumber('val-weight', 80, 60, 900, '#1db954');
      const h1 = document.getElementById('nh1');
      if (h1) h1.classList.add('show');
    }, 0);

    // Step 2: Sets 5→4, Reps 12→10 (red)
    setTimeout(() => {
      animateNumber('val-sets', 5, 4, 700, '#e8432d');
      animateNumber('val-reps', 12, 10, 700, '#e8432d');
      const h2 = document.getElementById('nh2');
      if (h2) h2.classList.add('show');
    }, 600);

    // Step 3: Rest 60→90 (red, goes up)
    setTimeout(() => {
      animateNumber('val-rest', 60, 90, 900, '#e8432d');
      const h3 = document.getElementById('nh3');
      if (h3) h3.classList.add('show');
    }, 1100);

    // Step 4: Exercise name flips
    setTimeout(() => {
      const ex = document.getElementById('val-exercise');
      if (ex) {
        ex.style.transition = 'opacity 0.3s';
        ex.style.opacity = '0';
        setTimeout(() => {
          ex.textContent = 'Leg Press';
          ex.style.color = '#1db954';
          ex.style.opacity = '1';
        }, 300);
      }
      const h0 = document.getElementById('nh0');
      if (h0) h0.classList.add('show');
    }, 1600);

    // Step 5: Show CTA button
    setTimeout(() => {
      const btn = document.getElementById('navCtaBtn');
      const note = document.getElementById('navCtaNote');
      if (btn) btn.classList.add('show');
      if (note) note.classList.add('show');
    }, 2200);
  }



  function navStartDemo() {
    phase='moving';
    animateTo(()=>progress, v=>{progress=v;}, DEV_IDX, 3200, () => {
      phase='wrong';
      setTimeout(() => {
        animateTo(()=>wrongProgress, v=>{wrongProgress=v;}, 1.0, 1400, () => {
          const toast=document.getElementById('navToast');
          if(toast) toast.classList.add('show');
          const devPt=PLANNED[DEV_IDX];
          panCam(lon2x(devPt.lon), lat2y(devPt.lat), 1.5, 700, () => {
            setTimeout(() => {
              phase='rerouting';
              let lineProgress = 0;
              panCam(lon2x((devPt.lon+END.lon)/2), lat2y((devPt.lat+END.lat)/2), 1.1, 700, () => {
                // First draw the line
                animateTo(()=>lineProgress, v=>{lineProgress=v;}, 1.0, 1000, () => {
                   // Then move the runner
                   phase = 'following';
                   animateTo(()=>rerouteProgress, v=>{rerouteProgress=v;}, 1.0, 2000, () => {
                      phase='done'; navShowPanel();
                   });
                });
              });
            }, 500);
          });
        });
      }, 200);
    });
  }

  window.navResetAll = function() {
    progress=0; wrongProgress=0; rerouteProgress=0; lineProgress=0; phase='idle';
    setCamOverview();
    // Reset toast
    const toast=document.getElementById('navToast');
    if(toast) toast.classList.remove('show');
    // Reset number values
    const resets = [
      { id:'val-weight', val:'80' }, { id:'val-sets', val:'5' },
      { id:'val-reps', val:'12' }, { id:'val-rest', val:'60' },
      { id:'val-exercise', val:'Squat' }
    ];
    resets.forEach(({id, val}) => {
      const el = document.getElementById(id);
      if (el) { el.textContent = val; el.style.color = ''; el.style.opacity = '1'; }
    });
    // Reset hints
    for (let i=0;i<4;i++) {
      const h=document.getElementById(`nh${i}`);
      if(h) h.classList.remove('show');
    }
    // Reset CTA
    const btn=document.getElementById('navCtaBtn'), note=document.getElementById('navCtaNote');
    if(btn) btn.classList.remove('show');
    if(note) note.classList.remove('show');
    draw();
    setTimeout(navStartDemo, 800);
  };

  (function loop() { draw(); requestAnimationFrame(loop); })();

  // ── Scroll-triggered restart ──
  // Start first time immediately, then restart every time section enters viewport
  setTimeout(navStartDemo, 800);

  const _adaptiveSection = document.getElementById('adaptive');
  if (_adaptiveSection) {
    const _navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Small delay so tiles have time to render before animation kicks in
          setTimeout(() => { window.navResetAll && window.navResetAll(); }, 200);
        }
      });
    }, { threshold: 0.3 });
    _navObserver.observe(_adaptiveSection);
  }
})();


// Auto-play demo for Hero Section just to show interactivity
let autoPlayHero = setInterval(() => {
    const beforeEl = document.getElementById('before-ai');
    if (!beforeEl) return;
    
    if(beforeEl.classList.contains('active')) {
        toggleBeforeAfter('after');
    } else {
        toggleBeforeAfter('before');
    }
}, 3000);

// Initialize Hero Skeleton Canvas Animation
function initHeroSkeleton(){
    const canvas = document.getElementById('hero-skeleton-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const center = {x: canvas.width/2, y: canvas.height/2};
    let t=0;
    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        const length = 80;
        const angle = Math.sin(t)*0.4; // swing angle
        const x2 = center.x + length*Math.sin(angle);
        const y2 = center.y + length*Math.cos(angle);
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.stroke();
        // joint
        ctx.beginPath();
        ctx.arc(x2, y2, 8, 0, Math.PI*2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        // update angle display
        const deg = Math.round((angle*180/Math.PI)+90);
        const angleEl = document.getElementById('hero-angle-display');
        if(angleEl) angleEl.textContent = deg + '°';
        t+=0.03;
        requestAnimationFrame(draw);
    }
    draw();
}

document.addEventListener('DOMContentLoaded', initHeroSkeleton);

// Stop auto-play when user interacts
const protoControls = document.querySelector('.prototype-controls');
if (protoControls) {
    protoControls.addEventListener('click', () => {
        clearInterval(autoPlayHero);
    });
}

// Intersection Observer for Scroll Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.3
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Find all animate elements inside the intersected section
            const elements = entry.target.querySelectorAll('.animate-on-scroll');
            elements.forEach(el => el.classList.add('visible'));
        } else {
            // Optional: Remove class when out of view so it repeats every time
            const elements = entry.target.querySelectorAll('.animate-on-scroll');
            elements.forEach(el => el.classList.remove('visible'));
        }
    });
}, observerOptions);

// Observe the problem section
const problemSection = document.getElementById('problem');
if (problemSection) {
    observer.observe(problemSection);
}

// ── Safety Protocol Simulation Logic ──
;(function() {
    const DURATIONS = [5000, 5000, 5000, 7000, 6000];
    const TOTAL_SCENES = 5;
    let currentScene = -1;
    let mainTimer = null;
    let countdownInterval = null;

    function initDots() {
        const container = document.getElementById('dots_container');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < TOTAL_SCENES; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.id = `safety_dot_${i}`;
            container.appendChild(dot);
        }
    }

    function updateDots(idx) {
        for (let i = 0; i < TOTAL_SCENES; i++) {
            const el = document.getElementById(`safety_dot_${i}`);
            if (el) el.classList.toggle('on', i === idx);
        }
    }

    function runProgressBar(dur) {
        const bar = document.getElementById('p_bar');
        if (!bar) return;
        bar.style.transition = 'none';
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.transition = `width ${dur}ms linear`;
            bar.style.width = '100%';
        }, 50);
    }

    function updateAmbient(idx) {
        const ambient = document.getElementById('ambient');
        if (!ambient) return;
        const colors = [
            'radial-gradient(circle at 30% 30%, #2b1400 0%, #000 70%)',
            'radial-gradient(circle at 70% 20%, #1a1a1a 0%, #000 70%)',
            'radial-gradient(circle at 50% 50%, #112a00 0%, #000 70%)',
            'radial-gradient(circle at 50% 50%, #3a0000 0%, #000 80%)',
            'radial-gradient(circle at 50% 80%, #5a0000 0%, #000 90%)'
        ];
        ambient.style.background = colors[idx];
    }

    function transitionTo(next) {
        clearTimeout(mainTimer);
        if (countdownInterval) clearInterval(countdownInterval);

        const prevSceneEl = document.getElementById(`s${currentScene}`);
        if (prevSceneEl) {
            prevSceneEl.classList.remove('enter');
            prevSceneEl.classList.add('exit');
        }

        currentScene = next;
        const nextSceneEl = document.getElementById(`s${currentScene}`);
        
        updateDots(currentScene);
        updateAmbient(currentScene);
        runProgressBar(DURATIONS[currentScene]);

        setTimeout(() => {
            if (prevSceneEl) prevSceneEl.classList.remove('exit');
            if (nextSceneEl) nextSceneEl.classList.add('enter');
        }, 100);

        if (currentScene === 3) startCountdown();
        if (currentScene === 4) animateEmergencyCalls();

        mainTimer = setTimeout(() => {
            if (currentScene < TOTAL_SCENES - 1) {
                transitionTo(currentScene + 1);
            }
        }, DURATIONS[currentScene]);
    }

    function startCountdown() {
        let seconds = 5;
        const text = document.getElementById('cdn_val');
        const circle = document.getElementById('cdf_circle');
        const offsetLimit = 440;
        
        if (text) text.textContent = seconds;
        if (circle) circle.style.strokeDashoffset = 0;

        countdownInterval = setInterval(() => {
            seconds--;
            if(text) text.textContent = Math.max(seconds, 0);
            if(circle) circle.style.strokeDashoffset = offsetLimit * (1 - seconds / 5);
            if (seconds <= 0) clearInterval(countdownInterval);
        }, 1000);
    }

    function animateEmergencyCalls() {
        ['ci0', 'ci1'].forEach((id, i) => {
            const el = document.getElementById(id);
            if(el) {
                el.classList.remove('show');
                setTimeout(() => el.classList.add('show'), 400 + (i * 300));
            }
        });
    }

    window.resetSafetyProtocol = function() {
        currentScene = -1;
        for (let i = 0; i < TOTAL_SCENES; i++) {
            const el = document.getElementById(`s${i}`);
            if (el) el.classList.remove('enter', 'exit');
        }
        initDots();
        transitionTo(0);
    };

    // Trigger simulation when scrolled into view
    const safetySection = document.getElementById('safety-protocol');
    if (safetySection) {
        const safetyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    window.resetSafetyProtocol();
                }
            });
        }, { threshold: 0.5 });
        safetyObserver.observe(safetySection);
    }
})();

// ==========================================
// CANLI YAPAY ZEKA DEMOSU (WEBCAM & SİMÜLASYON)
// ==========================================
let demoWebcamActive = false;
let demoSimulatorActive = false;
let demoCurrentExercise = 'squat';
let demoRepsCount = 0;
let demoAngle = 180;
let webcamStream = null;
let mediaPipePose = null;
let mediaPipeCamera = null;
let simAnimationId = null;
let simTime = 0;
let repState = 'up';
let lastFrameTime = performance.now();
let fpsCount = 0;
let fpsTimer = 0;

// DOM elements
const skeletonCanvas = document.getElementById('skeleton-canvas');
const webcamVideo = document.getElementById('webcam-video');
const demoOverlay = document.getElementById('demo-overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayDesc = document.getElementById('overlay-desc');
const overlayIcon = document.getElementById('overlay-icon');
const overlaySpinner = document.getElementById('overlay-spinner');
const repCounterVal = document.getElementById('demo-rep-counter');
const repFillBar = document.getElementById('rep-fill');
const angleVal = document.getElementById('demo-angle-val');
const angleFillRing = document.getElementById('angle-fill-ring');
const coachMessage = document.getElementById('coach-message');
const fpsVal = document.getElementById('fps-val');
const scannerLine = document.getElementById('demo-scanner');
const targetAngleDesc = document.getElementById('target-angle-desc');
const activeAngleDesc = document.getElementById('active-angle-desc');

// Skeleton connections mapping (shoulders, arms, torso, legs)
const poseConnections = [
    [11, 12], // shoulder to shoulder
    [11, 13], [13, 15], // left arm
    [12, 14], [14, 16], // right arm
    [11, 23], [12, 24], // shoulders to hips
    [23, 24], // hip to hip
    [23, 25], [25, 27], // left leg
    [24, 26], [26, 28]  // right leg
];

// Initialize canvas sizing
function initCanvasSize() {
    if (!skeletonCanvas) return;
    const parent = skeletonCanvas.parentElement;
    skeletonCanvas.width = parent.clientWidth || 640;
    skeletonCanvas.height = parent.clientHeight || 480;
}

window.addEventListener('resize', initCanvasSize);
document.addEventListener('DOMContentLoaded', () => {
    initCanvasSize();
    // Default angle circle fill
    updateAngleRing(180);
});

// Calculate Angle between three joints (p1: Hip, p2: Knee, p3: Ankle)
function getAngle(p1, p2, p3) {
    if (!p1 || !p2 || !p3) return 180;
    const rad = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs(rad * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360.0 - angle;
    return Math.round(angle);
}

// Update SVG Circular Progress Ring based on Angle
function updateAngleRing(angle) {
    if (!angleFillRing) return;
    // Map angle (from 180 standing to 40 bent) to progress percentage (0% to 100%)
    const percentage = Math.max(0, Math.min(100, (180 - angle) / (180 - 45) * 100));
    // SVG circle circumference is 2 * PI * 40 = 251.2
    const offset = 251.2 - (percentage / 100 * 251.2);
    angleFillRing.style.strokeDashoffset = offset;
    
    // Customize stroke color depending on exercise depth target
    if (demoCurrentExercise === 'squat') {
        if (angle < 95) {
            angleFillRing.style.stroke = '#22c55e'; // Neon Green on target depth
            angleFillRing.style.filter = 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))';
        } else {
            angleFillRing.style.stroke = '#6366f1'; // Indigo otherwise
            angleFillRing.style.filter = 'none';
        }
    } else { // biceps curl
        if (angle < 45) {
            angleFillRing.style.stroke = '#22c55e'; // Green on maximum curl contraction
            angleFillRing.style.filter = 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))';
        } else {
            angleFillRing.style.stroke = '#6366f1';
            angleFillRing.style.filter = 'none';
        }
    }
}

// Process joint angles and repetitions state machine
function processAnalytics(landmarks) {
    let p1, p2, p3;
    
    if (demoCurrentExercise === 'squat') {
        // Calculate Right Knee Angle: Hip (24) -> Knee (26) -> Ankle (28)
        p1 = landmarks[24];
        p2 = landmarks[26];
        p3 = landmarks[28];
        
        demoAngle = getAngle(p1, p2, p3);
        angleVal.textContent = demoAngle + '°';
        updateAngleRing(demoAngle);
        
        // Active angle text status
        if (demoAngle > 155) {
            activeAngleDesc.textContent = 'Ayakta (Düz)';
        } else if (demoAngle < 95) {
            activeAngleDesc.textContent = 'Mükemmel Derinlik!';
        } else {
            activeAngleDesc.textContent = 'Çöküyor...';
        }
        
        // Repetition State Machine
        if (demoAngle < 95 && repState === 'up') {
            repState = 'down';
            coachMessage.textContent = 'Harika derinlik! Kalçayı sıkarak yukarı kalkın.';
            coachMessage.style.color = '#22c55e';
            // Pulsing feedback on tag
            const tag = document.querySelector('.stream-tag-status');
            if (tag) {
                tag.style.background = '#22c55e';
                tag.style.color = '#000';
            }
        }
        
        if (demoAngle > 145 && repState === 'down') {
            repState = 'up';
            demoRepsCount++;
            repCounterVal.textContent = demoRepsCount;
            // Update rep fill progress bar
            const percent = (demoRepsCount % 10) * 10;
            repFillBar.style.width = (percent === 0 ? 100 : percent) + '%';
            coachMessage.textContent = 'Tebrikler! Çömelirken nefes alın, kalkarken verin.';
            coachMessage.style.color = '#fff';
            
            const tag = document.querySelector('.stream-tag-status');
            if (tag) {
                tag.style.background = 'rgba(0,0,0,0.8)';
                tag.style.color = '#fff';
            }
        }
        
    } else { // biceps curl
        // Calculate Right Elbow Angle: Shoulder (12) -> Elbow (14) -> Wrist (16)
        p1 = landmarks[12];
        p2 = landmarks[14];
        p3 = landmarks[16];
        
        demoAngle = getAngle(p1, p2, p3);
        angleVal.textContent = demoAngle + '°';
        updateAngleRing(demoAngle);
        
        // Active angle text status
        if (demoAngle > 150) {
            activeAngleDesc.textContent = 'Kol Düz (Başlangıç)';
        } else if (demoAngle < 45) {
            activeAngleDesc.textContent = 'Maksimum Kasılma!';
        } else {
            activeAngleDesc.textContent = 'Bükülüyor...';
        }
        
        // Repetition State Machine
        if (demoAngle < 45 && repState === 'up') {
            repState = 'down';
            coachMessage.textContent = 'Tepe noktada kasları sıkın! Yavaşça geri indirin.';
            coachMessage.style.color = '#22c55e';
            
            const tag = document.querySelector('.stream-tag-status');
            if (tag) {
                tag.style.background = '#22c55e';
                tag.style.color = '#000';
            }
        }
        
        if (demoAngle > 145 && repState === 'down') {
            repState = 'up';
            demoRepsCount++;
            repCounterVal.textContent = demoRepsCount;
            const percent = (demoRepsCount % 10) * 10;
            repFillBar.style.width = (percent === 0 ? 100 : percent) + '%';
            coachMessage.textContent = 'Harika tekrar! Formu bozmadan bükmeye devam edin.';
            coachMessage.style.color = '#fff';
            
            const tag = document.querySelector('.stream-tag-status');
            if (tag) {
                tag.style.background = 'rgba(0,0,0,0.8)';
                tag.style.color = '#fff';
            }
        }
    }
}

// Draw Neon High-Tech Skeleton Overlay
function drawSkeleton(ctx, landmarks, width, height) {
    // Draw lines
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.45)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    poseConnections.forEach(([i, j]) => {
        const p1 = landmarks[i];
        const p2 = landmarks[j];
        // Ensure joints are visible
        if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
            ctx.beginPath();
            ctx.moveTo(p1.x * width, p1.y * height);
            ctx.lineTo(p2.x * width, p2.y * height);
            ctx.stroke();
        }
    });
    
    // Draw joints
    const mainJoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
    landmarks.forEach((p, index) => {
        if (mainJoints.includes(index) && p.visibility > 0.5) {
            ctx.beginPath();
            ctx.arc(p.x * width, p.y * height, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#22c55e';
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0; // reset glow for subsequent lines
        }
    });
    
    // Highlight the active joint node with circular angle badge
    let activeJointIndex = (demoCurrentExercise === 'squat') ? 26 : 14;
    const activeJoint = landmarks[activeJointIndex];
    if (activeJoint && activeJoint.visibility > 0.5) {
        const x = activeJoint.x * width;
        const y = activeJoint.y * height;
        
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Label background box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(x + 22, y - 12, 54, 24);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 22, y - 12, 54, 24);
        
        // Label text value
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(demoAngle + '°', x + 49, y);
    }
}

// Draw tech grid background
function drawGrid(ctx, width, height) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.lineWidth = 1;
    const step = 45;
    
    for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

// Exercise selectors Tab
window.selectDemoExercise = function(exercise) {
    if (exercise === demoCurrentExercise) return;
    
    demoCurrentExercise = exercise;
    demoRepsCount = 0;
    repState = 'up';
    demoAngle = 180;
    
    // Update active tab visuals
    document.getElementById('tab-squat').classList.toggle('active', exercise === 'squat');
    document.getElementById('tab-curl').classList.toggle('active', exercise === 'curl');
    
    // Reset counter UI
    repCounterVal.textContent = '0';
    repFillBar.style.width = '0%';
    angleVal.textContent = '180°';
    updateAngleRing(180);
    
    // Update targets
    if (exercise === 'squat') {
        targetAngleDesc.textContent = '< 90° (Derinlik)';
        activeAngleDesc.textContent = 'Ayakta';
        document.getElementById('angle-label').textContent = 'Knee Angle';
    } else {
        targetAngleDesc.textContent = '< 45° (Bükülme)';
        activeAngleDesc.textContent = 'Kol Düz';
        document.getElementById('angle-label').textContent = 'Elbow Angle';
    }
    
    if (demoWebcamActive) {
        coachMessage.textContent = 'Hareket algılanıyor... Başlayın.';
    } else if (demoSimulatorActive) {
        coachMessage.textContent = 'Simülatör egzersizi değiştirildi.';
    } else {
        coachMessage.textContent = 'Egzersiz seçildi. Demoyu başlatın.';
    }
};

// Physics animation loop for high-tech skeleton simulator
function runSimulator() {
    if (!demoSimulatorActive) return;
    
    simTime += 0.025; // Speed multiplier for realistic tempo
    const canvas = skeletonCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#08080a';
    ctx.fillRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    
    // Sinusoidal movement cycle
    const cycle = (Math.sin(simTime) + 1) / 2; // 0 standing straight, 1 fully crouched or bent
    
    const landmarks = Array.from({length: 33}, () => ({x: 0, y: 0, visibility: 0}));
    
    let head, shoulder, elbow, wrist, hip, knee, ankle;
    
    if (demoCurrentExercise === 'squat') {
        // Squat physical interpolation points
        ankle = { x: 0.5, y: 0.85 };
        knee = { x: 0.5 - 0.10 * cycle, y: 0.70 + 0.03 * cycle };
        hip = { x: 0.5 - 0.08 * cycle, y: 0.55 + 0.16 * cycle };
        shoulder = { x: 0.5 - 0.04 * cycle, y: 0.35 + 0.16 * cycle };
        head = { x: 0.5 - 0.03 * cycle, y: 0.22 + 0.16 * cycle };
        
        // Arms reach forward for balance
        elbow = { x: 0.5 + 0.10 * cycle, y: 0.38 + 0.05 * cycle };
        wrist = { x: 0.5 + 0.22 * cycle, y: 0.38 + 0.05 * cycle };
    } else { // biceps curl
        // Standing static joints
        ankle = { x: 0.5, y: 0.85 };
        knee = { x: 0.5, y: 0.68 };
        hip = { x: 0.5, y: 0.52 };
        shoulder = { x: 0.5, y: 0.32 };
        head = { x: 0.5, y: 0.18 };
        elbow = { x: 0.5, y: 0.44 };
        
        // Arm wrist curling up and in
        wrist = { x: 0.5 + 0.07 * cycle, y: 0.56 - 0.24 * cycle };
    }
    
    // Distribute keypoints symmetric left/right with 3D separation offsets
    landmarks[11] = { x: shoulder.x - 0.05, y: shoulder.y, visibility: 1 };
    landmarks[12] = { x: shoulder.x + 0.05, y: shoulder.y, visibility: 1 };
    
    landmarks[13] = { x: elbow.x - 0.04, y: elbow.y, visibility: 1 };
    landmarks[14] = { x: elbow.x + 0.04, y: elbow.y, visibility: 1 };
    
    landmarks[15] = { x: wrist.x - 0.04, y: wrist.y, visibility: 1 };
    landmarks[16] = { x: wrist.x + 0.04, y: wrist.y, visibility: 1 };
    
    landmarks[23] = { x: hip.x - 0.04, y: hip.y, visibility: 1 };
    landmarks[24] = { x: hip.x + 0.04, y: hip.y, visibility: 1 };
    
    landmarks[25] = { x: knee.x - 0.03, y: knee.y, visibility: 1 };
    landmarks[26] = { x: knee.x + 0.03, y: knee.y, visibility: 1 };
    
    landmarks[27] = { x: ankle.x - 0.03, y: ankle.y, visibility: 1 };
    landmarks[28] = { x: ankle.x + 0.03, y: ankle.y, visibility: 1 };
    
    drawSkeleton(ctx, landmarks, width, height);
    processAnalytics(landmarks);
    
    // FPS counter calculation
    const now = performance.now();
    fpsCount++;
    if (now - fpsTimer >= 1000) {
        fpsVal.textContent = Math.round(fpsCount * 1000 / (now - fpsTimer));
        fpsCount = 0;
        fpsTimer = now;
    }
    
    simAnimationId = requestAnimationFrame(runSimulator);
}

// Stop Biyomechanical Simulator animation loop
function stopSimulator() {
    demoSimulatorActive = false;
    if (simAnimationId) {
        cancelAnimationFrame(simAnimationId);
        simAnimationId = null;
    }
    document.getElementById('btn-start-simulator').classList.remove('active');
    document.getElementById('btn-start-simulator').innerHTML = '<i class="fa-solid fa-circle-play"></i> Simülatörü Başlat';
}

// Toggle Simulated Fail-Safe Demo Mode
window.toggleSimulatorDemo = function() {
    if (demoSimulatorActive) {
        stopSimulator();
        resetDemoStates();
    } else {
        // If webcam is running, shut it off first
        if (demoWebcamActive) stopWebcam();
        
        demoSimulatorActive = true;
        document.getElementById('btn-start-simulator').classList.add('active');
        document.getElementById('btn-start-simulator').innerHTML = '<i class="fa-solid fa-circle-pause"></i> Simülatörü Durdur';
        
        // Hide overlay splash screen
        demoOverlay.style.opacity = '0';
        setTimeout(() => { demoOverlay.style.display = 'none'; }, 300);
        
        // Start scanner and tags
        scannerLine.classList.add('active');
        document.querySelector('.stream-tag-fps').style.display = 'flex';
        document.querySelector('.stream-tag-status').style.display = 'flex';
        
        // Reset variables
        demoRepsCount = 0;
        repCounterVal.textContent = '0';
        repFillBar.style.width = '0%';
        simTime = 0;
        repState = 'up';
        fpsTimer = performance.now();
        
        runSimulator();
    }
};

// Process Webcam MediaPipe Results Callback
function onPoseResults(results) {
    if (!demoWebcamActive) return;
    
    // Fade out overlay screen on first frames parsed
    if (demoOverlay.style.display !== 'none') {
        demoOverlay.style.opacity = '0';
        setTimeout(() => { demoOverlay.style.display = 'none'; }, 400);
        scannerLine.classList.add('active');
        document.querySelector('.stream-tag-fps').style.display = 'flex';
        document.querySelector('.stream-tag-status').style.display = 'flex';
    }
    
    const canvas = skeletonCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Draw mirrored background camera frame
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.scale(-1, 1);
    ctx.translate(-width, 0);
    ctx.drawImage(results.image, 0, 0, width, height);
    ctx.restore();
    
    // Draw grid overlay lightly
    drawGrid(ctx, width, height);
    
    if (results.poseLandmarks) {
        // Coordinate mirroring for direct tracking visualization
        const mirroredLandmarks = results.poseLandmarks.map(p => ({
            x: 1 - p.x, // mirror horizontally
            y: p.y,
            visibility: p.visibility
        }));
        
        drawSkeleton(ctx, mirroredLandmarks, width, height);
        processAnalytics(mirroredLandmarks);
    } else {
        coachMessage.textContent = 'Kullanıcı taranıyor... Kameranın önünde durun.';
        coachMessage.style.color = '#ef4444';
    }
    
    // Calculate Web FPS
    const now = performance.now();
    fpsCount++;
    if (now - fpsTimer >= 1000) {
        fpsVal.textContent = Math.round(fpsCount * 1000 / (now - fpsTimer));
        fpsCount = 0;
        fpsTimer = now;
    }
}

// Stop Webcam and release resources
function stopWebcam() {
    demoWebcamActive = false;
    
    if (mediaPipeCamera) {
        try {
            mediaPipeCamera.stop();
        } catch (e) {
            console.warn("MediaPipe camera stop error:", e);
        }
        mediaPipeCamera = null;
    }
    
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    
    document.getElementById('btn-start-camera').classList.remove('active');
    document.getElementById('btn-start-camera').innerHTML = '<i class="fa-solid fa-camera"></i> Demoyu Başlat';
}

// Reset entire demo console to default passive state
function resetDemoStates() {
    demoOverlay.style.display = 'flex';
    setTimeout(() => { demoOverlay.style.opacity = '1'; }, 50);
    overlayTitle.textContent = 'Kamera Pasif';
    overlayDesc.textContent = '"Demoyu Başlat" butonuna tıklayarak kamera izni verin veya "Simülatörü Başlat" seçeneğini kullanın.';
    overlayIcon.className = 'fa-solid fa-video-slash';
    overlaySpinner.style.display = 'none';
    
    scannerLine.classList.remove('active');
    document.querySelector('.stream-tag-fps').style.display = 'none';
    document.querySelector('.stream-tag-status').style.display = 'none';
    
    coachMessage.textContent = 'Harekete Başlamak İçin Demoyu Başlatın.';
    coachMessage.style.color = '';
    
    const canvas = skeletonCanvas;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#08080a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawGrid(ctx, canvas.width, canvas.height);
    }
    
    demoRepsCount = 0;
    repCounterVal.textContent = '0';
    repFillBar.style.width = '0%';
    angleVal.textContent = '180°';
    updateAngleRing(180);
}

// Toggle Camera MediaPipe Live Demo Mode
window.toggleWebcamDemo = async function() {
    if (demoWebcamActive) {
        stopWebcam();
        resetDemoStates();
    } else {
        // If simulator is running, shut it off first
        if (demoSimulatorActive) stopSimulator();
        
        demoWebcamActive = true;
        document.getElementById('btn-start-camera').classList.add('active');
        document.getElementById('btn-start-camera').innerHTML = '<i class="fa-solid fa-circle-pause"></i> Demoyu Durdur';
        
        // Show loading splash
        overlayTitle.textContent = 'Kamera Açılıyor...';
        overlayDesc.textContent = 'Lütfen tarayıcı kameranıza izin verin ve yapay zeka modelinin yüklenmesini bekleyin.';
        overlayIcon.className = 'fa-solid fa-camera-rotate';
        overlaySpinner.style.display = 'block';
        
        // Initialize MediaPipe Pose API if not created
        if (!mediaPipePose) {
            mediaPipePose = new Pose({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
            });
            mediaPipePose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            mediaPipePose.onResults(onPoseResults);
        }
        
        // Start streaming webcam feed
        try {
            webcamStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            webcamVideo.srcObject = webcamStream;
            webcamVideo.play();
            
            // Set FPS timers
            fpsTimer = performance.now();
            
            // Initialize camera loop
            if (!mediaPipeCamera) {
                mediaPipeCamera = new Camera(webcamVideo, {
                    onFrame: async () => {
                        if (demoWebcamActive) {
                            await mediaPipePose.send({ image: webcamVideo });
                        }
                    },
                    width: 640,
                    height: 480
                });
            }
            
            await mediaPipeCamera.start();
            
        } catch (err) {
            console.error("Kamera bağlantısı kurulamadı:", err);
            stopWebcam();
            resetDemoStates();
            alert("Kamera bağlantısı kurulamadı. Lütfen kamera erişim izinlerinizi kontrol edin veya 'Simülatörü Başlat' seçeneğini kullanın.");
        }
    }
};
