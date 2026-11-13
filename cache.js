// Prize-cache reveal used by the arcade games: tap the cube, it cracks, a reel lands on the prize.
// playCache({prize:[title, sub], color, pool:[[title, color], ...], auto}, done)
window.playCache = function (o, done) {
  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:50;touch-action:none;background:rgba(2,8,7,.93)';
  document.body.appendChild(cv);
  const g = cv.getContext('2d'), DPR = Math.min(devicePixelRatio || 1, 3);
  let W, H; const fit = () => { W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; g.setTransform(DPR, 0, 0, DPR, 0, 0); }; fit();
  const MONO = 'ui-monospace,Menlo,Consolas,monospace', WHITE = '#eafffb', C = o.color;
  const KANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン';
  const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[(Math.random() * a.length) | 0], clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3), easeBack = t => { t = clamp(t, 0, 1); const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const txt = (s, x, y, size, col, glow = 0) => { g.font = '700 ' + size + 'px ' + MONO; g.textAlign = 'center'; g.fillStyle = col; g.shadowColor = col; g.shadowBlur = glow; g.fillText(s, x, y); g.shadowBlur = 0; };
  let phase = 'cache', pt = 0, time = 0, last = performance.now(), flash = 0, burst = [], cracks = [], alive = true;
  const reel = Array.from({ length: 22 }, () => pick(o.pool)); reel.push([o.prize[0], C]); reel.push(pick(o.pool)); const reelTo = reel.length - 2;
  const crack = () => { if (phase !== 'cache') return; phase = 'crack'; pt = 0; cracks = Array.from({ length: 9 }, () => ({ a: rnd(0, 6.28), l: rnd(.3, 1), j: rnd(-.5, .5) })); };
  cv.addEventListener('pointerdown', crack);
  function rays(cx, cy, alpha, R) { g.save(); g.translate(cx, cy); g.rotate(time * .5); g.globalCompositeOperation = 'screen';
    for (let i = 0; i < 14; i++) { g.rotate(Math.PI * 2 / 14); const gr = g.createLinearGradient(0, 0, R, 0); gr.addColorStop(0, C); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = alpha * (i % 2 ? .5 : 1); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.lineTo(R, -R * .09); g.lineTo(R, R * .09); g.closePath(); g.fill(); }
    g.restore(); g.globalAlpha = 1; }
  function cube(cx, cy, s, ax, ay, col, inner) {
    const V = []; for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) V.push([x, y, z]);
    const P = V.map(([x, y, z]) => { let X = x * Math.cos(ay) + z * Math.sin(ay), Z = -x * Math.sin(ay) + z * Math.cos(ay); let Y = y * Math.cos(ax) - Z * Math.sin(ax); Z = y * Math.sin(ax) + Z * Math.cos(ax); const k = 3.2 / (3.2 + Z); return [cx + X * s * k, cy + Y * s * k]; });
    const E = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
    g.strokeStyle = col; g.lineWidth = inner ? 1 : 2.5; g.shadowColor = col; g.shadowBlur = inner ? 6 : 18; g.beginPath(); for (const [a, b] of E) { g.moveTo(P[a][0], P[a][1]); g.lineTo(P[b][0], P[b][1]); } g.stroke(); g.shadowBlur = 0; }
  function glitch(n, amp) { for (let i = 0; i < n; i++) { const y = (Math.random() * H) | 0, h = (4 + Math.random() * 26) | 0; g.drawImage(cv, 0, y * DPR, cv.width, h * DPR, (Math.random() - .5) * amp, y, W, h); } }
  function frame(now) {
    if (!alive) return; const dt = Math.min(.05, (now - last) / 1000); last = now; time += dt; pt += dt;
    g.clearRect(0, 0, W, H); const cx = W / 2, cy = H * .45;
    if (phase === 'cache' || phase === 'crack') {
      const k = phase === 'crack' ? pt : 0, s = Math.min(W * .2, 86) * easeBack(phase === 'cache' ? pt / .5 : 1) * (1 + k * .25), sh = k * k * 14, ox = rnd(-sh, sh), oy = rnd(-sh, sh), spin = time * (.9 + k * 9), col = k > .55 ? C : WHITE;
      rays(cx, cy, .05 + k * .35, H * .55); cube(cx + ox, cy + oy, s, spin * .7, spin, col, false); cube(cx + ox, cy + oy, s * .5, -spin, -spin * 1.3, C, true); txt('?', cx + ox, cy + oy + 14, 40, col, 16);
      if (phase === 'crack') { g.strokeStyle = WHITE; g.lineWidth = 2; g.shadowColor = C; g.shadowBlur = 14; for (const c of cracks) { const L = s * 1.7 * c.l * Math.min(1, k * 1.6); g.beginPath(); g.moveTo(cx + ox, cy + oy); g.lineTo(cx + ox + Math.cos(c.a + c.j) * L * .5, cy + oy + Math.sin(c.a + c.j) * L * .5); g.lineTo(cx + ox + Math.cos(c.a) * L, cy + oy + Math.sin(c.a) * L); g.stroke(); } g.shadowBlur = 0; glitch(3 + k * 8 | 0, 40 + k * 80);
        if (pt >= 1) { phase = 'reel'; pt = 0; flash = 1; for (let i = 0; i < 90; i++) { const a = rnd(0, 6.28), v = rnd(120, 720); burst.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: rnd(.6, 1.4), c: pick(KANA), k: Math.random() < .4 }); } } }
      else { txt('YOU WON A PRIZE CACHE', cx, cy - s * 2.1 - 10, 13, C); g.globalAlpha = .55 + .45 * Math.sin(time * 5); txt('TAP TO CRACK IT', cx, cy + s * 2.1 + 26, 16, WHITE, 10); g.globalAlpha = 1; if (o.auto && pt > 1.4) crack(); }
    }
    if (phase === 'reel') {
      rays(cx, cy, .4, H * .7); const rowH = 54, cw = Math.min(340, W * .88), win = rowH * 3, pos = reelTo * easeOut(pt / 2.2);
      g.save(); g.beginPath(); g.rect(cx - cw / 2, cy - win / 2, cw, win); g.clip(); g.fillStyle = 'rgba(2,14,12,.9)'; g.fillRect(cx - cw / 2, cy - win / 2, cw, win);
      for (let i = Math.max(0, (pos | 0) - 2); i < Math.min(reel.length, (pos | 0) + 3); i++) { const d = Math.abs(i - pos), fs = Math.min(d < .5 ? 28 : 20, cw / (reel[i][0].length * .64)); g.globalAlpha = clamp(1 - d * .55, .12, 1); txt(reel[i][0], cx, cy + (i - pos) * rowH + 10, fs, d < .5 ? WHITE : reel[i][1], d < .5 ? 16 : 0); }
      g.restore(); g.globalAlpha = 1; g.strokeStyle = C; g.lineWidth = 2; g.shadowColor = C; g.shadowBlur = 16; g.strokeRect(cx - cw / 2, cy - win / 2, cw, win); g.shadowBlur = 0; txt('DECRYPTING…', cx, cy - win / 2 - 14, 12, C);
      if (pt >= 2.35) { alive = false; cv.style.transition = 'opacity .25s'; cv.style.opacity = 0; setTimeout(() => cv.remove(), 260); done(); return; }
    }
    g.font = '14px ' + MONO; g.textAlign = 'center';
    for (const q of burst) { q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= .985; q.vy = q.vy * .985 + 260 * dt; q.l -= dt; const a = clamp(q.l, 0, 1); if (q.k) { g.fillStyle = C; g.globalAlpha = a; g.fillRect(q.x, q.y, 4, 4); g.globalAlpha = 1; } else { g.fillStyle = 'rgba(234,255,251,' + a + ')'; g.fillText(q.c, q.x, q.y); } } burst = burst.filter(q => q.l > 0);
    if (flash > 0) { g.fillStyle = 'rgba(234,255,251,' + flash + ')'; g.fillRect(0, 0, W, H); flash -= dt * 2.4; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
};
