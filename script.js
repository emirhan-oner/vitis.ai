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
        img: 'https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?q=80&w=800&auto=format&fit=crop',
        pill: 'Plan Seçiliyor...'
    },
    {
        img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
        pill: 'Kamera Aktif'
    },
    {
        img: 'https://images.unsplash.com/photo-1554244933-d876deb6b2ff?q=80&w=800&auto=format&fit=crop',
        pill: 'İskelet Çıkarılıyor...'
    },
    {
        img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
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
