// Interactive Prototype Logic

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Hero Prototype
    if (typeof toggleBeforeAfter === 'function') {
        toggleBeforeAfter('before');
    }
    
    // Start How It Works Cycle
    if (typeof startHowCycle === 'function') {
        startHowCycle();
    }
});

// Hero Section: Before/After AI Toggle
function toggleBeforeAfter(state) {
    const beforeEl = document.getElementById('before-ai');
    const afterEl = document.getElementById('after-ai');
    const btns = document.querySelectorAll('.proto-btn');
    
    if (!beforeEl || !afterEl) return;

    if (btns) {
        btns.forEach(btn => btn.classList.remove('active'));
    }

    if (state === 'before') {
        beforeEl.classList.add('active');
        afterEl.classList.remove('active');
        if (btns && btns[0]) btns[0].classList.add('active');
    } else {
        beforeEl.classList.remove('active');
        afterEl.classList.add('active');
        if (btns && btns[1]) btns[1].classList.add('active');
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
        
    }, 1200); // Hızlandırıldı
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

let currentHowStep = 0;
let howProgressInterval;
const stepDuration = 2500; // 2.5 saniye olarak güncellendi

window.startHowCycle = function() {
    clearInterval(howProgressInterval);
    
    const progressBar = document.getElementById('how-progress');
    let startTime = Date.now();

    howProgressInterval = setInterval(() => {
        let elapsed = Date.now() - startTime;
        let progress = (elapsed / stepDuration) * 100;
        
        if (progressBar) {
            progressBar.style.width = Math.min(progress, 100) + '%';
        }
        
        if (elapsed >= stepDuration) {
            clearInterval(howProgressInterval); // Mevcut intervali temizle
            currentHowStep = (currentHowStep + 1) % howSteps.length;
            window.changeHowStep(currentHowStep, true);
            window.startHowCycle(); // Döngüyü yeniden başlat
        }
    }, 30); // 30ms ile daha da akıcı
};

window.changeHowStep = function(index, isAuto = false) {
    const stepperContainer = document.getElementById('how-stepper');
    if (!stepperContainer) return;
    
    // Eğer kullanıcı manuel tıkladıysa döngüyü sıfırla
    if (!isAuto) {
        currentHowStep = index;
        window.startHowCycle();
    }

    // Update active class on cards
    const cards = stepperContainer.querySelectorAll('.step-card');
    cards.forEach((card, i) => {
        if (i === index) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    
    // Update image
    const imgEl = document.getElementById('how-img');
    
    if (imgEl) {
        // Fade out slightly
        imgEl.style.opacity = '0.2';
        
        setTimeout(() => {
            imgEl.src = howSteps[index].img;
            
            // Fade back in with full brightness
            imgEl.style.opacity = '1';
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
    if (!ctx) return;
    const center = {x: canvas.width/2, y: canvas.height/2};
    let t=0;
    function draw(){
        if (!document.getElementById('hero-skeleton-canvas')) return;
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
// CANLI YAPAY ZEKA DEMOSU (HIZLI & BASIT)
// ==========================================

let demoWebcamActive = false;
let webcamStream = null;
let camAnimationId = null;
let previousFrame = null;
let motionIntensity = 0;
let mediapipePose = null;
let mediapipeCamera = null;
let mediapipeReady = false;
let useSimulatedSkeleton = false;

const skeletonCanvas = document.getElementById('skeleton-canvas');
const webcamVideo = document.getElementById('webcam-video');
const demoOverlay = document.getElementById('demo-overlay');

const poseConnections = [
    [11, 12], [11, 13], [13, 15],
    [12, 14], [14, 16],
    [11, 23], [12, 24],
    [23, 24], [23, 25], [25, 27],
    [24, 26], [26, 28]
];

// MediaPipe Pose landmark indices matching poseConnections above
const MEDIAPIPE_POSE_CONNECTIONS = poseConnections;

function initCanvasSize(canvas) {
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth || 640;
    canvas.height = parent.clientHeight || 480;
}

document.addEventListener('DOMContentLoaded', () => {
    initCanvasSize(document.getElementById('skeleton-canvas'));
    initCanvasSize(document.getElementById('skeleton-canvas-2'));
});

window.addEventListener('resize', () => {
    initCanvasSize(document.getElementById('skeleton-canvas'));
    const c2 = document.getElementById('skeleton-canvas-2');
    if (videoPoseActive && c2 && c2._ar) {
        c2.width = c2.parentElement.clientWidth || 640;
        c2.height = c2.width * c2._ar;
    } else {
        initCanvasSize(c2);
    }
});

function drawTechGrid(ctx, w, h) {
    ctx.strokeStyle = 'rgba(255,255,255,0.015)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 45) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 45) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
}

function drawSkeleton(ctx, lm, w, h) {
    // connections
    poseConnections.forEach(([i, j]) => {
        const a = lm[i], b = lm[j];
        if (a && b && a.visibility > 0.5 && b.visibility > 0.5) {
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    });
    // joints
    lm.forEach(p => {
        if (p && p.visibility > 0.5) {
            ctx.beginPath();
            ctx.arc(p.x * w, p.y * h, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    });
}

// --- MEDIAPIPE POSE INTEGRATION ---
function initMediaPipePose() {
    if (mediapipePose) return true;
    if (typeof Pose === 'undefined') {
        useSimulatedSkeleton = true;
        return false;
    }
    try {
        mediapipePose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });
        mediapipePose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            selfieMode: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        mediapipePose.onResults(onPoseResults);
        mediapipeReady = true;
        useSimulatedSkeleton = false;
        return true;
    } catch (e) {
        console.warn('MediaPipe Pose init failed, using simulated skeleton:', e);
        useSimulatedSkeleton = true;
        return false;
    }
}

// Smoothing için önceki landmark'ları sakla
let _prevWebcamLm = null;
let _prevVideoLm = null;

// Biyomekanik veri (Stage 3 için)
let _lastBiomechanics = {
    torakal_aci: 0,
    omuz_tipi: 'Normal',
    omuz_tork_indeksi: 1.0
};

function extractBiomechanicsFromLandmarks(lm) {
    if (!lm || lm.length < 33) return;
    const ls = lm[11], rs = lm[12];
    const lh = lm[23], rh = lm[24];
    if (!ls || !rs || !lh || !rh || ls.visibility < 0.5 || rs.visibility < 0.5) return;

    const sw = Math.sqrt((rs.x - ls.x) ** 2 + (rs.y - ls.y) ** 2);
    const hw = Math.sqrt((rh.x - lh.x) ** 2 + (rh.y - lh.y) ** 2);
    const shoulderZ = (ls.z + rs.z) / 2;
    const hipZ = (lh.z + rh.z) / 2;
    const angle = Math.abs(shoulderZ - hipZ) * 100;
    const ratio = sw / (hw || 0.01);
    const shoulderType = ratio > 1.35 ? 'Geniş' : 'Normal';

    _lastBiomechanics = {
        torakal_aci: Math.min(Math.max(Math.round(angle), 20), 90),
        omuz_tipi: shoulderType,
        omuz_tork_indeksi: shoulderType === 'Geniş' ? 1.5 : 1.0
    };

    // Canlı güncelle: Stage 3 formundaki AI verisi
    const angleEl = document.getElementById('med-bio-angle');
    const shEl = document.getElementById('med-bio-shoulder');
    if (angleEl) angleEl.textContent = _lastBiomechanics.torakal_aci;
    if (shEl) shEl.textContent = _lastBiomechanics.omuz_tipi;
}

function smoothLandmarks(current, prev, factor) {
    if (!prev) return current;
    const smoothed = [];
    for (let i = 0; i < current.length; i++) {
        if (prev[i] && current[i].visibility > 0.5) {
            smoothed[i] = {
                x: prev[i].x * factor + current[i].x * (1 - factor),
                y: prev[i].y * factor + current[i].y * (1 - factor),
                z: prev[i].z * factor + current[i].z * (1 - factor),
                visibility: current[i].visibility
            };
        } else {
            smoothed[i] = current[i];
        }
    }
    return smoothed;
}

function onPoseResults(results) {
    if (!demoWebcamActive) return;
    const canvas = skeletonCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    if (results && results.image) {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(results.image, 0, 0, w, h);

        drawTechGrid(ctx, w, h);

        if (results.poseLandmarks) {
            const smoothed = smoothLandmarks(results.poseLandmarks, _prevWebcamLm, 0.5);
            _prevWebcamLm = smoothed;
            drawSkeleton(ctx, smoothed, w, h);
            extractBiomechanicsFromLandmarks(smoothed);

            // İlk algılama: side steps gizle, ana yazı sabit kalsın
            if (!window._poseDetected) {
                window._poseDetected = true;
                const sp = document.getElementById('side-steps');
                if (sp) sp.style.display = 'none';
            }
        }

        // motion detection from results image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w; tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(results.image, 0, 0, w, h);
        const imageData = tempCtx.getImageData(0, 0, w, h);
        const pixels = imageData.data;
        if (previousFrame) {
            let diff = 0, count = 0;
            for (let i = 0; i < pixels.length; i += 8) {
                const dr = Math.abs(pixels[i] - previousFrame[i]);
                const dg = Math.abs(pixels[i+1] - previousFrame[i+1]);
                const db = Math.abs(pixels[i+2] - previousFrame[i+2]);
                if (dr > 25 || dg > 25 || db > 25) diff++;
                count++;
            }
            motionIntensity = motionIntensity * 0.7 + (diff / count) * 0.3;
        }
        previousFrame = new Uint8Array(pixels);
    }

    const motionBar = document.getElementById('motion-bar');
    const motionLevel = document.getElementById('motion-level');
    if (motionBar) motionBar.style.width = Math.min(motionIntensity * 100, 100) + '%';
    if (motionLevel) {
        if (motionIntensity > 0.15) motionLevel.textContent = 'YÜKSEK';
        else if (motionIntensity > 0.05) motionLevel.textContent = 'ORTA';
        else motionLevel.textContent = 'DÜŞÜK';
    }

    // fps
    const fpsEl = document.getElementById('fps-val');
    if (fpsEl) {
        const now = performance.now();
        if (!fpsEl._count) { fpsEl._count = 0; fpsEl._time = now; }
        fpsEl._count++;
        if (now - fpsEl._time > 1000) {
            fpsEl.textContent = Math.round(fpsEl._count * 1000 / (now - fpsEl._time));
            fpsEl._count = 0;
            fpsEl._time = now;
        }
    }
}

// --- FALLBACK SIMULATED SKELETON LOOP (used when MediaPipe is unavailable) ---
function startWebcamFallback() {
    if (!demoWebcamActive) return;
    const canvas = skeletonCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    if (webcamVideo.readyState >= 2) {
        ctx.save();
        ctx.clearRect(0, 0, w, h);
        ctx.scale(-1, 1);
        ctx.translate(-w, 0);
        ctx.drawImage(webcamVideo, 0, 0, w, h);
        ctx.restore();

        drawTechGrid(ctx, w, h);

        // motion detection via frame diff
        const imageData = ctx.getImageData(0, 0, w, h);
        const pixels = imageData.data;
        if (previousFrame) {
            let diff = 0, count = 0;
            for (let i = 0; i < pixels.length; i += 8) {
                const dr = Math.abs(pixels[i] - previousFrame[i]);
                const dg = Math.abs(pixels[i+1] - previousFrame[i+1]);
                const db = Math.abs(pixels[i+2] - previousFrame[i+2]);
                if (dr > 25 || dg > 25 || db > 25) diff++;
                count++;
            }
            motionIntensity = motionIntensity * 0.7 + (diff / count) * 0.3;
        }
        previousFrame = new Uint8Array(pixels);

        // simulated skeleton
        let wst = window._webcamSimTime || 0;
        wst += 0.02;
        window._webcamSimTime = wst;
        const cycle = (Math.sin(wst) + 1) / 2;
        const lm = Array.from({length: 33}, () => ({x: 0, y: 0, visibility: 0}));
        const baseX = 0.5, baseY = 0.5;
        lm[11] = { x: baseX - 0.05, y: baseY - 0.10, visibility: 1 };
        lm[12] = { x: baseX + 0.05, y: baseY - 0.10, visibility: 1 };
        lm[13] = { x: baseX - 0.12 - 0.04 * cycle, y: baseY - 0.02 + 0.03 * cycle, visibility: 1 };
        lm[14] = { x: baseX + 0.12 + 0.04 * cycle, y: baseY - 0.02 + 0.03 * cycle, visibility: 1 };
        lm[15] = { x: baseX - 0.20 - 0.06 * cycle, y: baseY + 0.06, visibility: 1 };
        lm[16] = { x: baseX + 0.20 + 0.06 * cycle, y: baseY + 0.06, visibility: 1 };
        lm[23] = { x: baseX - 0.04, y: baseY + 0.06, visibility: 1 };
        lm[24] = { x: baseX + 0.04, y: baseY + 0.06, visibility: 1 };
        lm[25] = { x: baseX - 0.08 * cycle, y: baseY + 0.18 + 0.06 * cycle, visibility: 1 };
        lm[26] = { x: baseX + 0.08 * cycle, y: baseY + 0.18 + 0.06 * cycle, visibility: 1 };
        lm[27] = { x: baseX - 0.06, y: baseY + 0.30, visibility: 1 };
        lm[28] = { x: baseX + 0.06, y: baseY + 0.30, visibility: 1 };
        drawSkeleton(ctx, lm, w, h);

        const motionBar = document.getElementById('motion-bar');
        const motionLevel = document.getElementById('motion-level');
        if (motionBar) motionBar.style.width = Math.min(motionIntensity * 100, 100) + '%';
        if (motionLevel) {
            if (motionIntensity > 0.15) motionLevel.textContent = 'YÜKSEK';
            else if (motionIntensity > 0.05) motionLevel.textContent = 'ORTA';
            else motionLevel.textContent = 'DÜŞÜK';
        }
    }

    const fpsEl = document.getElementById('fps-val');
    if (fpsEl) {
        const now = performance.now();
        if (!fpsEl._count) { fpsEl._count = 0; fpsEl._time = now; }
        fpsEl._count++;
        if (now - fpsEl._time > 1000) {
            fpsEl.textContent = Math.round(fpsEl._count * 1000 / (now - fpsEl._time));
            fpsEl._count = 0;
            fpsEl._time = now;
        }
    }

    camAnimationId = requestAnimationFrame(startWebcamFallback);
}

window.toggleWebcamDemo = async function() {
    if (demoWebcamActive) {
        demoWebcamActive = false;
        if (mediapipeCamera) {
            try { mediapipeCamera.stop(); } catch(e) {}
            mediapipeCamera = null;
        }
        if (camAnimationId) { cancelAnimationFrame(camAnimationId); camAnimationId = null; }
        if (webcamStream) { webcamStream.getTracks().forEach(t => t.stop()); webcamStream = null; }
        if (demoOverlay) {
            demoOverlay.style.display = 'flex';
            demoOverlay.style.opacity = '1';
            const t = document.getElementById('overlay-title');
            const d = document.getElementById('overlay-desc');
            const b = document.querySelector('#demo-overlay .demo-main-btn');
            if (t) t.textContent = 'Kamera Pasif';
            if (d) d.textContent = 'AI hareket analizini başlatmak için kamerayı açın.';
            if (b) b.style.display = 'inline-flex';
        }
        // Side panel reset
        const si = document.getElementById('side-icon');
        const st = document.getElementById('side-title');
        const sd = document.getElementById('side-desc');
        const ss = document.getElementById('side-steps');
        if (si) si.className = 'fa-solid fa-camera-slash';
        if (st) st.textContent = 'Kamera Pasif';
        if (sd) { sd.textContent = 'İzniniz bekleniyor...'; sd.style.fontSize = '1.1rem'; sd.style.fontWeight = '600'; sd.style.color = '#a0a0a0'; }
        if (ss) ss.style.display = 'none';
        window._poseDetected = false;
        document.querySelectorAll('.demo-main-btn').forEach(b => {
            b.classList.remove('active');
            b.textContent = 'Kamerayı Aç';
        });
        document.querySelector('.stream-tag-fps').style.display = 'none';
        document.querySelector('.stream-tag-status').style.display = 'none';
        document.getElementById('motion-panel').style.display = 'none';
        previousFrame = null;
        _prevWebcamLm = null;
        return;
    }

    if (videoPoseActive) {
        stopVideoPose();
    }

    demoWebcamActive = true;
    previousFrame = null;

    document.querySelectorAll('.demo-main-btn').forEach(b => {
        b.classList.add('active');
        b.innerHTML = '<i class="fa-solid fa-circle-pause"></i> Durdur';
    });

    // Side panel: loading aşaması
    window._poseDetected = false;
    const si = document.getElementById('side-icon');
    const st = document.getElementById('side-title');
    const sd = document.getElementById('side-desc');
    const ss = document.getElementById('side-steps');
    if (si) si.className = 'fa-solid fa-spinner fa-spin';
    if (st) st.textContent = 'Model Yükleniyor';
    if (sd) sd.innerHTML = 'Model tarayıcınıza uygun hale getiriliyor...<br><span style="font-size:0.85rem;color:#818cf8;">Gerçek uygulamada kesinlikle gecikme olmayacak.</span>';
    if (ss) ss.style.display = 'none';

    try {
        const useMp = initMediaPipePose() && typeof Camera !== 'undefined';

        if (useMp) {
            mediapipeCamera = new Camera(webcamVideo, {
                onFrame: async () => {
                    if (mediapipePose && demoWebcamActive) {
                        try { await mediapipePose.send({ image: webcamVideo }); } catch(e) {}
                    }
                },
                width: 640,
                height: 480
            });
            await mediapipeCamera.start();
        } else {
            webcamStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            webcamVideo.srcObject = webcamStream;
            await webcamVideo.play();
            startWebcamFallback();
        }

        // Side panel: kamera açıldı, yönlendirme
        if (si) si.className = 'fa-solid fa-camera';
        if (st) st.textContent = 'Kamera Hazır';
        if (sd) sd.innerHTML = 'Lütfen ayağa kalkıp kollarınızı hareket ettirin.';
        if (ss) ss.style.display = 'flex';

        demoOverlay.style.opacity = '0';
        setTimeout(() => { demoOverlay.style.display = 'none'; }, 300);

        document.querySelector('.stream-tag-fps').style.display = 'flex';
        document.querySelector('.stream-tag-status').style.display = 'flex';
        document.getElementById('motion-panel').style.display = 'block';
    } catch (err) {
        console.error(err);
        demoWebcamActive = false;
        alert('Kamera açılamadı. İzinleri kontrol edin.');
    }
};

// --- VIDEO UPLOAD & POSE PROCESSING ---
let videoPoseActive = false;
let videoAnimId = null;

window.loadSampleVideo = async function() {
    const overlay = document.getElementById('demo-overlay-2');
    const fpsTag = document.querySelector('#demo-stage-2 .stream-tag-fps');
    const statusBadge = document.getElementById('video-status-badge');
    const canvas = document.getElementById('skeleton-canvas-2');
    const video = document.getElementById('uploaded-video');

    initMediaPipePose();
    if (videoAnimId) { cancelAnimationFrame(videoAnimId); videoAnimId = null; }

    video.muted = true;
    video.style.display = 'none';
    video.crossOrigin = 'anonymous';
    video.src = 'https://kfblottdhsdgbehldcvd.supabase.co/storage/v1/object/public/ornek/aaa.mp4';

    const metaLoaded = new Promise(resolve => {
        video.addEventListener('loadedmetadata', function onMeta() {
            video.removeEventListener('loadedmetadata', onMeta);
            const pw = canvas.parentElement.clientWidth || 640;
            const r = video.videoHeight / video.videoWidth;
            canvas.width = pw;
            canvas.height = pw * r;
            canvas._ar = r;
            resolve(true);
        }, { once: true });
        video.addEventListener('error', function onErr() {
            video.removeEventListener('error', onErr);
            resolve(false);
        }, { once: true });
        video.load();
    });
    const ok = await metaLoaded;
    if (!ok) { alert('Örnek video yüklenemedi.'); return; }

    if (mediapipePose) {
        mediapipePose.setOptions({ selfieMode: false });
        mediapipePose.onResults(onVideoPoseResults);
    }

    overlay.style.opacity = '0';
    setTimeout(() => overlay.style.display = 'none', 300);
    if (fpsTag) fpsTag.style.display = 'flex';
    if (statusBadge) statusBadge.style.display = 'flex';
    canvas.style.cursor = 'pointer';
    canvas.onclick = stopVideoPose;

    try {
        await video.play();
        videoPoseActive = true;
        processVideoFrame();
    } catch (err) {
        alert('Örnek video oynatılamadı. Kendi videonuzu yükleyin.');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('btn-sample-video');
    if (btn) btn.addEventListener('click', window.loadSampleVideo);
});

window.handleVideoUpload = async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const overlay = document.getElementById('demo-overlay-2');
    const fpsTag = document.querySelector('#demo-stage-2 .stream-tag-fps');
    const statusBadge = document.getElementById('video-status-badge');
    const canvas = document.getElementById('skeleton-canvas-2');
    const video = document.getElementById('uploaded-video');

    // Init MediaPipe
    initMediaPipePose();

    // Reset onceki video varsa
    if (videoAnimId) { cancelAnimationFrame(videoAnimId); videoAnimId = null; }

    const url = URL.createObjectURL(file);
    video.muted = true;
    video.src = url;
    video.style.display = 'none';

    // Canvas'i video boyutuna göre ayarla ve oynat
    await new Promise(resolve => {
        video.addEventListener('loadedmetadata', function onMeta() {
            video.removeEventListener('loadedmetadata', onMeta);
            const pw = canvas.parentElement.clientWidth || 640;
            const r = video.videoHeight / video.videoWidth;
            canvas.width = pw;
            canvas.height = pw * r;
            canvas._ar = r; // sonradan resize için
            resolve();
        }, { once: true });
        video.load();
    });

    // Video için selfieMode'u kapat (ayna efekti olmasın)
    if (mediapipePose) {
        mediapipePose.setOptions({ selfieMode: false });
        mediapipePose.onResults(onVideoPoseResults);
    }

    // Hide overlay, show badges
    overlay.style.opacity = '0';
    setTimeout(() => overlay.style.display = 'none', 300);
    if (fpsTag) fpsTag.style.display = 'flex';
    if (statusBadge) statusBadge.style.display = 'flex';

    // Canvas'a tıklayınca durdur
    canvas.style.cursor = 'pointer';
    canvas.onclick = stopVideoPose;

    try {
        await video.play();
        videoPoseActive = true;
        processVideoFrame();
    } catch (err) {
        console.warn('Video play failed:', err);
    }
};

function onVideoPoseResults(results) {
    if (!videoPoseActive) return;

    if (results && results.poseLandmarks) {
        _prevVideoLm = smoothLandmarks(results.poseLandmarks, _prevVideoLm, 0.55);
        extractBiomechanicsFromLandmarks(_prevVideoLm);
    }

    // FPS
    const fpsEl = document.getElementById('fps-val-2');
    if (fpsEl) {
        const now = performance.now();
        if (!fpsEl._count) { fpsEl._count = 0; fpsEl._time = now; }
        fpsEl._count++;
        if (now - fpsEl._time > 1000) {
            fpsEl.textContent = Math.round(fpsEl._count * 1000 / (now - fpsEl._time));
            fpsEl._count = 0;
            fpsEl._time = now;
        }
    }
}

let _videoSendBusy = false;

async function processVideoFrame() {
    if (!videoPoseActive) return;
    const canvas = document.getElementById('skeleton-canvas-2');
    const video = document.getElementById('uploaded-video');
    if (!video || !canvas || video.ended) { stopVideoPose(); return; }
    if (video.paused || video.readyState < 2) {
        videoAnimId = requestAnimationFrame(processVideoFrame);
        return;
    }

    // Her frame: videoyu ve son bilinen iskeleti çiz
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(video, 0, 0, w, h);
    drawTechGrid(ctx, w, h);
    if (_prevVideoLm) drawSkeleton(ctx, _prevVideoLm, w, h);

    // MediaPipe'e gönder (bekleme)
    if (mediapipePose && !_videoSendBusy) {
        _videoSendBusy = true;
        mediapipePose.send({ image: video }).finally(() => {
            _videoSendBusy = false;
        });
    }

    videoAnimId = requestAnimationFrame(processVideoFrame);
}

function stopVideoPose() {
    videoPoseActive = false;
    if (videoAnimId) { cancelAnimationFrame(videoAnimId); videoAnimId = null; }
    const video = document.getElementById('uploaded-video');
    if (video) {
        video.pause();
        if (video.src && video.src.startsWith('blob:')) URL.revokeObjectURL(video.src);
        video.src = '';
        video.style.display = 'none';
    }
    const overlay = document.getElementById('demo-overlay-2');
    if (overlay) { overlay.style.display = 'flex'; overlay.style.opacity = '1'; }
    const fps = document.querySelector('#demo-stage-2 .stream-tag-fps');
    if (fps) fps.style.display = 'none';
    const sb = document.getElementById('video-status-badge');
    if (sb) sb.style.display = 'none';
    _prevVideoLm = null;
    // Restore original canvas
    const cnv = document.getElementById('skeleton-canvas-2');
    if (cnv) {
        const ctx = cnv.getContext('2d');
        ctx.clearRect(0, 0, cnv.width, cnv.height);
        cnv.style.cursor = 'default';
        if (cnv._stopHandler) { cnv.removeEventListener('click', cnv._stopHandler); cnv._stopHandler = null; }
    }
    // Webcam'e dönünce selfieMode'u geri aç
    if (mediapipePose) {
        mediapipePose.setOptions({ selfieMode: true });
        mediapipePose.onResults(onPoseResults);
    }
}

// --- DEMO STAGE SWITCHING ---
window.switchDemoStage = function(stage) {
    if (stage !== 1 && demoWebcamActive) {
        toggleWebcamDemo();
    }
    if (stage !== 2 && videoPoseActive) {
        stopVideoPose();
    }
    document.querySelectorAll('.demo-tab-btn').forEach((b, i) => b.classList.toggle('active', i + 1 === stage));
    document.querySelectorAll('.demo-stage').forEach(s => { s.style.display = 'none'; s.classList.remove('active'); });
    const target = document.getElementById('demo-stage-' + stage);
    if (target) {
        target.style.display = stage === 3 ? 'block' : 'flex';
        target.offsetHeight;
        target.classList.add('active');
    }
};

// ==========================================
// KLİNİK KARAR MOTORU (Kural Tabanlı)
// ==========================================
const _klinikMotor = (function() {
    const ruleLibrary = [
        {
            id: 'OXF_KIF_01',
            source: 'Oxford Nuffield Dept. of Orthopaedics',
            targetMetric: 'torakal_aci',
            minVal: 40, maxVal: 52,
            riskLevel: 'Hafif-Orta Kifoz',
            targetMuscles: ['Rhomboideus', 'Lower Trapezius', 'Serratus Anterior'],
            contraindications: ['Behind-the-Neck Shoulder Press', 'Heavy Shoulder Overhead Press'],
            clinicalNote: 'Sırt ekstansörlerinde kronik gerilim. Göğüs grubuna esneklik, sırt grubuna izotonik yüklenme.'
        },
        {
            id: 'STAN_IMP_02',
            source: 'Stanford Sports Medicine & Biomechanics',
            targetMetric: 'omuz_tork_indeksi',
            minVal: 1.2, maxVal: 5.0,
            riskLevel: 'Subakromiyal Sıkışma Riski',
            targetMuscles: ['Infraspinatus', 'Supraspinatus', 'Teres Minor (Rotator Cuff)'],
            contraindications: ['Upright Row', 'Barbell Bench Press (Tam Derinlik)'],
            clinicalNote: 'Geniş omuz yapısı subakromiyal boşluğu daraltır. Glenohumeral stabilizasyon şart.'
        },
        {
            id: 'HARV_CORE_03',
            source: 'Harvard Medical School Spine Care Guide',
            targetMetric: 'torakal_aci',
            minVal: 40, maxVal: 90,
            riskLevel: 'Kinetik Zincir Koruma',
            targetMuscles: ['Transversus Abdominis', 'Multifidus', 'Erector Spinae'],
            contraindications: ['Heavy Spinal Loading (Traditional Deadlift From Floor)'],
            clinicalNote: 'Aksiyel yüklenmede omurga stabilitesi için IAP optimizasyonu ve derin core aktivasyonu.'
        }
    ];

    function generateProgram(triggered, userRisk, age, weight, fields) {
        const intensity = age > 60 ? 0.6 : age > 40 ? 0.8 : 1.0;
        const level = (fields && fields.level) || 'intermediate';
        const days = (fields && fields.days) || 3;
        const isDeskJob = (fields && fields.occupation) === 'desk';
        const pastInjuries = (fields && fields.pastInjuries) || [];

        const exercises = [];

        // Isınma (seviyeye göre)
        if (level === 'beginner') {
            exercises.push({ name: 'Glute Bridge', sets: 2, reps: '10-12', rest: '60sn', type: 'Isınma', priority: 'Zorunlu' });
            exercises.push({ name: 'Cat-Camel', sets: 2, reps: '8', rest: '45sn', type: 'Mobilite', priority: 'Zorunlu' });
        } else {
            exercises.push({ name: 'Glute Bridge', sets: 3, reps: '12-15', rest: '60sn', type: 'Isınma', priority: 'Zorunlu' });
            exercises.push({ name: 'Cat-Camel', sets: 2, reps: '10', rest: '45sn', type: 'Mobilite', priority: 'Zorunlu' });
        }

        // Masa başı çalışanlara ekstra mobilite
        if (isDeskJob) {
            exercises.push({ name: 'Thoracic Extension (Foam Roller)', sets: 2, reps: '10', rest: '45sn', type: 'Mobilite', priority: 'Önerilen' });
            exercises.push({ name: 'Hip Flexor Stretch', sets: 2, reps: '30sn/side', rest: '30sn', type: 'Esneme', priority: 'Önerilen' });
        }

        const hasKyphosis = triggered.some(r => r.id === 'OXF_KIF_01');
        const hasShoulder = triggered.some(r => r.id === 'STAN_IMP_02');
        const hasCore = triggered.some(r => r.id === 'HARV_CORE_03');

        if (hasKyphosis) {
            exercises.push({ name: 'Face Pull', sets: 3, reps: '15', rest: '60sn', type: 'Düzeltici', priority: 'Öncelikli' });
            exercises.push({ name: 'Prone Y-Raise', sets: 3, reps: '12', rest: '60sn', type: 'Düzeltici', priority: 'Öncelikli' });
            exercises.push({ name: 'Banded Pull-Apart', sets: 3, reps: '20', rest: '45sn', type: 'Aktivasyon', priority: 'Öncelikli' });
        }
        if (hasShoulder) {
            exercises.push({ name: 'External Rotation (Band)', sets: 3, reps: '15', rest: '60sn', type: 'Rotator Cuff', priority: 'Öncelikli' });
            exercises.push({ name: 'Dumbbell Floor Press', sets: 4, reps: '10-12', rest: '90sn', type: 'Ana', priority: 'Güvenli' });
            exercises.push({ name: 'Lateral Raise (Light)', sets: 3, reps: '15', rest: '45sn', type: 'Aksesuar', priority: 'Düşük Yük' });
        }
        if (hasCore || userRisk === 'hernia') {
            exercises.push({ name: 'Dead Bug', sets: 3, reps: '10/side', rest: '60sn', type: 'Core', priority: 'Öncelikli' });
            exercises.push({ name: 'Side Plank', sets: 3, reps: '20-30sn', rest: '45sn', type: 'Core', priority: 'Öncelikli' });
            exercises.push({ name: 'Seated Leg Press', sets: 4, reps: '10-12', rest: '120sn', type: 'Ana', priority: 'Güvenli' });
        }
        // Geçmiş sakatlıklara göre ekstra
        if (pastInjuries.includes('bel') || pastInjuries.includes('boyun')) {
            exercises.push({ name: 'Chin Tucks', sets: 2, reps: '10', rest: '30sn', type: 'Düzeltici', priority: 'Önerilen' });
        }
        if (pastInjuries.includes('diz')) {
            exercises.push({ name: 'Terminal Knee Extension (Band)', sets: 3, reps: '15', rest: '45sn', type: 'Düzeltici', priority: 'Önerilen' });
        }
        if (pastInjuries.includes('kalca')) {
            exercises.push({ name: 'Clamshell (Band)', sets: 3, reps: '12/side', rest: '45sn', type: 'Aktivasyon', priority: 'Önerilen' });
        }

        // Hedefe göre ana egzersiz (seviye ayarlı)
        const mainSets = level === 'beginner' ? 3 : level === 'advanced' ? 5 : 4;
        if (fields && fields.goal === 'fatloss') {
            exercises.push({ name: 'Kettlebell Swing', sets: mainSets, reps: '15-20', rest: '45sn', type: 'Kondisyon', priority: 'Öncelikli' });
            exercises.push({ name: 'Battle Ropes', sets: 3, reps: '30sn', rest: '30sn', type: 'Kondisyon', priority: 'Opsiyonel' });
        } else if (fields && fields.goal === 'rehab') {
            exercises.push({ name: 'Stationary Bike', sets: 1, reps: '15dk', rest: '-', type: 'Kardiyo', priority: 'Isınma' });
            exercises.push({ name: 'Bodyweight Squat', sets: 3, reps: '12-15', rest: '60sn', type: 'Ana', priority: 'Temel' });
        } else {
            exercises.push({ name: 'Goblet Squat', sets: mainSets, reps: '10-12', rest: '90sn', type: 'Ana', priority: 'Temel' });
            if (level !== 'beginner') {
                exercises.push({ name: 'Romanian Deadlift', sets: mainSets - 1, reps: '10-12', rest: '90sn', type: 'Ana', priority: 'Temel' });
            }
        }

        // Süre hesaplama
        const dur = days <= 2 ? '35-40 dk' : days <= 3 ? '45-50 dk' : '55-65 dk';

        return {
            intensity: Math.round(intensity * 100) + '%',
            duration: dur,
            exercises,
            warning: triggered.length > 0
                ? 'Klinik protokol aktif — kontrendike hareketlerden kaçının.'
                : 'Standart protokol uygulanıyor.'
        };
    }

    function run(userInputs, aiBiomechanics) {
        const triggered = [];
        const ta = aiBiomechanics.torakal_aci || 0;
        const oti = aiBiomechanics.omuz_tork_indeksi || 1.0;

        for (const r of ruleLibrary) {
            if (r.targetMetric === 'torakal_aci' && ta >= r.minVal && ta <= r.maxVal) triggered.push(r);
            else if (r.targetMetric === 'omuz_tork_indeksi' && oti >= r.minVal && oti <= r.maxVal) triggered.push(r);
        }

        const muscles = [...new Set(triggered.flatMap(r => r.targetMuscles))];
        const contraindications = [...new Set(triggered.flatMap(r => r.contraindications))];
        const refs = triggered.map(r => ({ institution: r.source, clinicalFinding: r.clinicalNote, category: r.riskLevel }));
        const program = generateProgram(triggered, userInputs.condition, userInputs.age, userInputs.weight, userInputs);

        return {
            meta: { age: userInputs.age, goal: userInputs.goal },
            clinicalResults: {
                riskStatus: triggered.length > 0 ? 'Kontrollü Klinik Müdahale Gerekli' : 'Normal',
                targetMuscles: muscles,
                restrictedExercises: contraindications,
                literature: refs,
                program
            }
        };
    }

    return { run };
})();

// --- MEDICAL PLAN (Stage 3) ---
window.generateMedicalPlan = function() {
    const fields = {
        age: parseInt(document.getElementById('med-age').value),
        weight: parseInt(document.getElementById('med-weight').value),
        height: parseInt(document.getElementById('med-height').value),
        gender: document.getElementById('med-gender').value,
        level: document.getElementById('med-level').value,
        days: parseInt(document.getElementById('med-days').value),
        condition: document.getElementById('med-condition').value,
        goal: document.getElementById('med-goal').value,
        occupation: document.getElementById('med-occupation').value,
        pastInjuries: [...document.querySelectorAll('#med-injuries-container input[type=checkbox]:checked')]
            .map(cb => cb.value).filter(v => v !== 'none')
    };

    if (!fields.age || !fields.weight) {
        alert('Lütfen Yaş ve Kilo bilgilerinizi giriniz.');
        return;
    }

    document.getElementById('plan-empty-state').style.display = 'none';
    document.getElementById('plan-result-state').style.display = 'none';
    document.getElementById('plan-loading-state').style.display = 'flex';

    setTimeout(() => {
        document.getElementById('plan-loading-state').style.display = 'none';
        document.getElementById('plan-result-state').style.display = 'block';

        const bio = _lastBiomechanics;
        const result = _klinikMotor.run(fields, bio);
        const cr = result.clinicalResults;
        const prog = cr.program;

        // --- Terminal header ---
        let html = '<div style="font-family: monospace; font-size: 0.8rem; color: #888; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; margin-bottom: 1.5rem;">' +
            '> RUNNING HARVARD BIOMECHANICS PROTOCOL V2.4<br>' +
            '> YAŞ: ' + fields.age + ' | KİLO: ' + fields.weight + 'kg | BOY: ' + (fields.height || '—') + 'cm | CİNSİYET: ' + (fields.gender === 'male' ? 'ERKEK' : 'KADIN') + '<br>' +
            '> SEVİYE: ' + fields.level.toUpperCase() + ' | GÜN/HAFTA: ' + fields.days + ' | MESLEK: ' + fields.occupation.toUpperCase() + '<br>' +
            '> AI TORAKAL AÇI: ' + bio.torakal_aci + '° | OMUZ: ' + bio.omuz_tipi +
            (fields.pastInjuries.length ? ' | GEÇMİŞ: ' + fields.pastInjuries.join(', ').toUpperCase() : '') +
            '</div>';

        // --- Profil özeti ---
        html += '<div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;">' +
            '<span style="background:rgba(99,102,241,0.15); color:#818cf8; padding:0.25rem 0.75rem; border-radius:99px; font-size:0.75rem;">🎯 ' + goalLabel(fields.goal) + '</span>' +
            '<span style="background:rgba(34,197,94,0.15); color:#22c55e; padding:0.25rem 0.75rem; border-radius:99px; font-size:0.75rem;">📅 ' + fields.days + ' gün/hafta</span>' +
            '<span style="background:rgba(245,158,11,0.15); color:#f59e0b; padding:0.25rem 0.75rem; border-radius:99px; font-size:0.75rem;">💼 ' + occupationLabel(fields.occupation) + '</span>' +
            '</div>';

        // --- Risk durumu ---
        const riskColor = cr.riskStatus === 'Normal' ? '#4cd964' : '#ff9500';
        html += '<p style="color: ' + riskColor + '; font-weight: 600; margin-bottom: 1rem;"><i class="fa-solid fa-shield-halved"></i> ' + cr.riskStatus + '</p>';

        // --- Hedef kaslar ---
        if (cr.targetMuscles.length > 0) {
            html += '<div style="margin-bottom: 1.2rem;"><strong style="color:#818cf8; font-size:0.85rem;">HEDEF KAS GRUPLARI</strong><div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.5rem;">' +
                cr.targetMuscles.map(m => '<span style="background:rgba(99,102,241,0.15); color:#a5b4fc; padding:0.2rem 0.6rem; border-radius:99px; font-size:0.8rem;">' + m + '</span>').join('') +
                '</div></div>';
        }

        // --- Yasaklı hareketler ---
        if (cr.restrictedExercises.length > 0) {
            html += '<div style="margin-bottom: 1.2rem;"><strong style="color:#ef4444; font-size:0.85rem;">KONTRENDİKE HAREKETLER</strong><ul style="padding-left:1.2rem; margin-top:0.5rem;">' +
                cr.restrictedExercises.map(e => '<li style="color:#f87171; margin-bottom:0.25rem; font-size:0.85rem;">❌ ' + e + '</li>').join('') +
                '</ul></div>';
        }

        // --- Egzersiz programı ---
        html += '<div style="margin-bottom: 1.2rem;"><strong style="color:#22c55e; font-size:0.85rem;">EGZERSİZ PROGRAMI</strong>' +
            '<p style="color:#888; font-size:0.78rem; margin-top:0.3rem;">Yoğunluk: ' + prog.intensity + ' | Süre: ' + prog.duration + '</p>' +
            '<div style="overflow-x:auto;">' +
            '<table style="width:100%; border-collapse:collapse; margin-top:0.3rem; font-size:0.78rem;">' +
            '<thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1); color:#888;">' +
            '<th style="text-align:left; padding:0.35rem 0.4rem;">Egzersiz</th>' +
            '<th style="padding:0.35rem 0.4rem;">Set</th>' +
            '<th style="padding:0.35rem 0.4rem;">Tekrar</th>' +
            '<th style="padding:0.35rem 0.4rem;">Dinlenme</th>' +
            '<th style="padding:0.35rem 0.4rem;">Öncelik</th></tr></thead><tbody>' +
            prog.exercises.map(ex => {
                const pColor = ex.priority === 'Zorunlu' ? '#4cd964' :
                    ex.priority === 'Öncelikli' ? '#22c55e' :
                    ex.priority === 'Güvenli' ? '#818cf8' : '#888';
                return '<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">' +
                    '<td style="padding:0.35rem 0.4rem; color:#fff;">' + ex.name + '</td>' +
                    '<td style="padding:0.35rem 0.4rem; text-align:center; color:#ccc;">' + ex.sets + '</td>' +
                    '<td style="padding:0.35rem 0.4rem; text-align:center; color:#ccc;">' + ex.reps + '</td>' +
                    '<td style="padding:0.35rem 0.4rem; text-align:center; color:#ccc;">' + ex.rest + '</td>' +
                    '<td style="padding:0.35rem 0.4rem; text-align:center;"><span style="color:' + pColor + '; font-size:0.72rem;">' + ex.priority + '</span></td>' +
                    '</tr>';
            }).join('') +
            '</tbody></table></div></div>';

        // --- BMI & metabolizma bilgisi ---
        if (fields.height) {
            const bmi = (fields.weight / ((fields.height / 100) ** 2)).toFixed(1);
            const bmiCat = bmi < 18.5 ? 'Zayıf' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Fazla Kilolu' : 'Obez';
            html += '<div style="margin-bottom:1.2rem; padding:0.6rem; background:rgba(255,255,255,0.02); border-radius:8px;">' +
                '<strong style="color:#888; font-size:0.8rem;">VÜCUT KİTLE İNDEKSİ</strong>' +
                '<p style="color:#fff; font-size:1.1rem; margin:0.2rem 0 0 0;">' + bmi + ' <span style="color:#888; font-size:0.8rem;">(' + bmiCat + ')</span></p></div>';
        }

        // --- Literatür referansları ---
        if (cr.literature.length > 0) {
            html += '<div style="margin-bottom: 1.2rem;"><strong style="color:#f59e0b; font-size:0.85rem;">KLİNİK LİTERATÜR</strong>' +
                cr.literature.map(l => '<div style="margin-top:0.4rem; padding:0.5rem; background:rgba(245,158,11,0.05); border-left:3px solid #f59e0b; border-radius:4px;">' +
                    '<strong style="color:#fbbf24; font-size:0.72rem;">' + l.institution + '</strong>' +
                    '<p style="color:#ccc; font-size:0.78rem; margin:0.2rem 0 0 0;">' + l.clinicalFinding + '</p>' +
                    '<span style="color:#f59e0b; font-size:0.65rem;">Kategori: ' + l.category + '</span>' +
                    '</div>').join('') +
                '</div>';
        }

        // --- Uyarı ---
        html += '<div style="margin-top:1rem; padding:0.7rem; background:rgba(99,102,241,0.08); border-left:4px solid #6366f1; border-radius:4px;">' +
            '<i class="fa-solid fa-microchip" style="color:#818cf8;"></i> ' +
            '<span style="color:#a5b4fc; font-size:0.82rem;">' + prog.warning + '</span></div>';

        document.getElementById('plan-dynamic-content').innerHTML = html;
    }, 1200);
};

function goalLabel(g) {
    return { strength: 'Güç & Kas', fatloss: 'Kilo Verme', rehab: 'Rehabilitasyon' }[g] || g;
}
function occupationLabel(o) {
    return { desk: 'Masa Başı', standing: 'Ayakta', active: 'Fiziksel Aktif' }[o] || o;
}
