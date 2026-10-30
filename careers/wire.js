/* Wireframe illustrations for the Deccan Experts "how it works" cards.
   Tiny 3D line renderer on <canvas>: each mesh is vertices + edges, slowly turning, front edges brighter than
   back ones. "scan" also splits the object into a dim and a lit half along a sweeping line. */
(() => {
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const INK = [127, 224, 211], DIM = [120, 112, 120];

  // ---------- mesh builders ----------
  const extrude = (pts, d, oy = 0) => {
    const n = pts.length, v = [], e = [];
    pts.forEach(([x, z]) => v.push([x, oy - d / 2, z]));
    pts.forEach(([x, z]) => v.push([x, oy + d / 2, z]));
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; e.push([i, j], [i + n, j + n], [i, i + n]); }
    return { v, e };
  };
  const merge = (...ms) => { const v = [], e = []; ms.forEach(m => { const o = v.length; v.push(...m.v); e.push(...m.e.map(([a, b]) => [a + o, b + o])); }); return { v, e }; };
  const rect = (w, h, r = 0) => [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
  const circle = (r, n = 28) => Array.from({ length: n }, (_, i) => [Math.cos(i / n * Math.PI * 2) * r, Math.sin(i / n * Math.PI * 2) * r]);
  // eight-point asterisk (like the Deccan spark): long arms on the axes, shorter on the diagonals
  const star = () => {
    const p = [];
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2, L = i % 2 ? .82 : 1.15, w = .1, c = .2;
      const a1 = a - Math.PI / 8;
      p.push([Math.cos(a1) * c, Math.sin(a1) * c]);
      p.push([Math.cos(a) * L - Math.sin(a) * w, Math.sin(a) * L + Math.cos(a) * w].map((x, k) => x));
      p.push([Math.cos(a) * L + Math.sin(a) * w, Math.sin(a) * L - Math.cos(a) * w]);
    }
    // reorder so the outline runs: inner corner → arm edge → arm tip → arm edge
    const out = [];
    for (let i = 0; i < 8; i++) { const [c0, t1, t2] = [p[i * 3], p[i * 3 + 2], p[i * 3 + 1]]; out.push(c0, t1, t2); }
    return out;
  };
  const MESHES = {
    // three profile cards, fanned
    invite: () => merge(...[0, 1, 2].map(k => {
      const m = extrude(rect(1.5, 1), .05, (k - 1) * .32);
      m.v = m.v.map(([x, y, z]) => [x + (k - 1) * .12, y, z - (k - 1) * .1]);
      return m;
    })),
    // the spark, standing up (rotate so it faces the camera)
    scan: () => { const m = extrude(star(), .22); m.v = m.v.map(([x, y, z]) => [x, z, y]); return m; },
    // four standards plates, spaced
    layers: () => merge(...[0, 1, 2, 3].map(k => extrude(rect(1.3, 1.3), .06, (k - 1.5) * .3))),
    // a stack of coins
    coins: () => merge(...[0, 1, 2, 3, 4].map(k => { const m = extrude(circle(.62, 30), .13, (2 - k) * .17 + .1); m.v = m.v.map(([x, y, z]) => [x + (k % 2 ? .04 : -.03), y, z]); return m; })),
    // a dot globe with two orbit rings
    globe: () => {
      const v = [], e = [], N = 520;
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
        v.push([Math.cos(th) * r * .95, y * .95, Math.sin(th) * r * .95]);
      }
      const ring = (R, tilt) => { const o = v.length, n = 64; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; v.push([Math.cos(a) * R, Math.sin(a) * R * Math.sin(tilt), Math.sin(a) * R * Math.cos(tilt)]); e.push([o + i, o + (i + 1) % n]); } };
      ring(1.35, .18); ring(1.6, -.12);
      return { v, e, dots: N };
    },
  };

  // ---------- renderer ----------
  const cards = [...document.querySelectorAll("canvas[data-mesh]")];
  if (!cards.length) return;
  const items = cards.map(cv => ({ cv, ctx: cv.getContext("2d"), kind: cv.dataset.mesh, mesh: MESHES[cv.dataset.mesh](), on: false, t0: performance.now() }));

  const size = it => {
    const r = it.cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
    it.w = r.width; it.h = r.height; it.cv.width = r.width * d; it.cv.height = r.height * d; it.ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  items.forEach(size);
  addEventListener("resize", () => items.forEach(size));

  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  function draw(it, now) {
    const { ctx, w, h, mesh, kind } = it, t = (now - it.t0) / 1000;
    ctx.clearRect(0, 0, w, h);
    const S = Math.min(w, h) * (kind === "globe" ? .3 : kind === "scan" ? .3 : kind === "invite" ? .34 : .27);
    const ry = REDUCED ? .5 : kind === "scan" ? .45 + Math.sin(t * .5) * .45 : t * (kind === "globe" ? .25 : .35) + .6, rx = kind === "scan" ? .12 : kind === "globe" ? .35 : .62;
    const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    // gentle breathing for the stacks
    const spread = kind === "layers" ? 1 + Math.sin(t * 1.2) * .18 : 1;
    const P = mesh.v.map(([x, y, z]) => {
      y *= spread;
      let X = x * cy + z * sy, Z = -x * sy + z * cy;
      let Y = y * cx - Z * sx; Z = y * sx + Z * cx;
      const f = 3.2 / (3.2 + Z);
      return [w / 2 + X * S * f, h / 2 + Y * S * f, Z];
    });
    // the scan line sweeps across the "scan" card
    const scanX = kind === "scan" ? w / 2 + Math.sin(t * .9) * w * .22 : -1;
    if (kind === "scan") {
      ctx.fillStyle = "rgba(255,255,255,.025)"; ctx.fillRect(0, 0, scanX, h);
      ctx.strokeStyle = "rgba(127,224,211,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(scanX, 0); ctx.lineTo(scanX, h); ctx.stroke();
    }
    ctx.lineWidth = 1.15;
    for (const [a, b] of mesh.e) {
      const A = P[a], B = P[b], z = (A[2] + B[2]) / 2, front = Math.max(0, Math.min(1, .55 - z * .45));
      if (kind === "scan") {
        // split each edge at the scan line: dim to the left, lit to the right
        const seg = (p, q, lit) => { ctx.strokeStyle = lit ? rgba(INK, .25 + front * .75) : rgba(DIM, .18 + front * .25); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); };
        if ((A[0] - scanX) * (B[0] - scanX) < 0) {
          const k = (scanX - A[0]) / (B[0] - A[0]), M = [scanX, A[1] + (B[1] - A[1]) * k];
          seg(A, M, A[0] > scanX); seg(M, B, B[0] > scanX);
        } else seg(A, B, A[0] > scanX);
      } else {
        ctx.strokeStyle = rgba(INK, .12 + front * .8);
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
      }
    }
    if (mesh.dots) for (let i = 0; i < mesh.dots; i++) {
      const p = P[i], a = p[2] < 0 ? .85 : .14;
      ctx.fillStyle = rgba(INK, a); ctx.fillRect(p[0] - .9, p[1] - .9, 1.8, 1.8);
    }
  }

  let raf = 0;
  const loop = now => { raf = 0; let any = false; items.forEach(it => { if (it.on) { draw(it, now); any = true; } }); if (any && !REDUCED) raf = requestAnimationFrame(loop); };
  const io = new IntersectionObserver(es => {
    es.forEach(e => { const it = items.find(i => i.cv === e.target); it.on = e.isIntersecting; if (it.on && !it.w) size(it); });
    if (!raf) raf = requestAnimationFrame(loop);
  }, { rootMargin: "100px" });
  items.forEach(it => io.observe(it.cv));
  items.forEach(it => draw(it, performance.now()));   // a first frame even before any scroll

  // ---------- pills: typed ID, cycling regions ----------
  document.querySelectorAll("[data-type]").forEach(el => {
    const full = el.dataset.type; let n = 9;
    if (REDUCED) return;
    setInterval(() => { n = n >= full.length ? 9 : n + 1; el.innerHTML = full.slice(0, n) + `<span class="t">${full.slice(n)}</span>`; }, 140);
  });
  document.querySelectorAll("[data-cycle]").forEach(el => {
    const list = el.dataset.cycle.split("|"); let k = 0;
    if (REDUCED) return;
    setInterval(() => {
      k = (k + 1) % list.length;
      if (!window.gsap) { el.textContent = list[k]; return; }
      gsap.to(el, { opacity: 0, y: -6, duration: .2, onComplete: () => { el.textContent = list[k]; gsap.fromTo(el, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .45, ease: "power3.out" }); } });
    }, 2400);
  });
})();
