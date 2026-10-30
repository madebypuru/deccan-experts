/* Two line-and-gradient pieces after giga.ai:
   1. The Work — bundles of hairline strands, one per kind of work, converging on "the model". The active bundle lights
      teal and carries light pulses; it advances on its own, and the tabs or the source labels pick one.
   2. The closing call — a drifting teal/gold gradient seen through vertical glass ribs that bend toward the cursor. */
(() => {
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const onView = (el, cb) => new IntersectionObserver(([e]) => cb(e.isIntersecting), { rootMargin: "80px" }).observe(el);

  /* ================= 1. strand field ================= */
  const stage = document.querySelector("[data-flow]");
  if (stage) {
    const cv = stage.querySelector(".flow__cv"), ctx = cv.getContext("2d");
    const srcs = [...stage.querySelectorAll(".flow__src")], tabs = [...stage.querySelectorAll(".flow__tab")];
    const copies = [...stage.querySelectorAll(".flow__copy")], node = stage.querySelector(".flow__node");
    const K = srcs.length, PER = 18, SAMPLES = 72, DUR = 6500;
    let W = 0, H = 0, N = [0, 0], bundles = [], cur = 0, t0 = performance.now(), held = 0, live = false, born = 0;

    // cubic bezier sample
    const bez = (p0, p1, p2, p3, t) => { const u = 1 - t; return [
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; };
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    const layout = () => {
      const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      const phone = W < 700;
      N = phone ? [W * .9, H * .8] : [W * .79, H * .64];
      seed = 7;
      bundles = srcs.map((_, i) => {
        const y = H * (phone ? .5 + i * .07 : .3 + i * .125), x = W * (phone ? .03 : .045) + (i % 2) * W * .035;
        const strands = Array.from({ length: PER }, (_, k) => {
          const col = k % 3, sx = x + col * 11 + rnd() * 3, sy = y - 26 + (k / PER) * 52 + rnd() * 2;
          const p1 = [W * (.3 + rnd() * .08), sy + (N[1] - sy) * .04], p2 = [W * (.5 + rnd() * .06), N[1] + (sy - N[1]) * (.1 + rnd() * .08)];
          const pts = Array.from({ length: SAMPLES + 1 }, (_, s) => bez([sx, sy], p1, p2, N, s / SAMPLES));
          return { pts, off: rnd(), speed: .16 + rnd() * .12 };
        });
        srcs[i].style.transform = `translate(${x.toFixed(0)}px, ${(y - 52).toFixed(0)}px)`;
        return { strands, x, y };
      });
      node.style.transform = `translate(${N[0].toFixed(0)}px, ${N[1].toFixed(0)}px) translateY(-50%)`;
    };

    const select = i => {
      cur = (i + K) % K; t0 = performance.now();
      srcs.forEach((s, k) => s.classList.toggle("is-on", k === cur));
      tabs.forEach((b, k) => b.setAttribute("aria-selected", k === cur));
      copies.forEach((c, k) => c.classList.toggle("is-on", k === cur));
    };
    tabs.forEach((b, i) => b.addEventListener("click", () => select(i)));
    srcs.forEach((s, i) => { s.addEventListener("click", () => select(i)); s.addEventListener("mouseenter", () => select(i)); });

    // eased brightness per bundle, so the hand-over between bundles fades rather than snaps
    const glow = Array(K).fill(0);
    const draw = now => {
      const t = now / 1000, reveal = REDUCED ? 1 : Math.min(1, (now - born) / 1800), rv = 1 - Math.pow(1 - reveal, 3);
      if (!REDUCED && now - t0 > DUR) select(cur + 1);
      ctx.clearRect(0, 0, W, H);
      // a soft teal pool behind the node
      const g = ctx.createRadialGradient(N[0], N[1], 0, N[0], N[1], 260);
      g.addColorStop(0, "rgba(17,153,142,.22)"); g.addColorStop(1, "rgba(17,153,142,0)");
      ctx.fillStyle = g; ctx.fillRect(N[0] - 260, N[1] - 260, 520, 520);
      const upto = Math.max(2, Math.floor(SAMPLES * rv));
      bundles.forEach((b, i) => {
        glow[i] += ((i === cur ? 1 : 0) - glow[i]) * .06;
        const a = glow[i];
        ctx.lineWidth = .8 + a * .3;
        ctx.strokeStyle = `rgba(${Math.round(255 - a * 128)},${Math.round(255 - a * 31)},${Math.round(255 - a * 44)},${(.07 + a * .3).toFixed(3)})`;
        for (const s of b.strands) {
          ctx.beginPath(); ctx.moveTo(s.pts[0][0], s.pts[0][1]);
          for (let k = 1; k <= upto; k++) ctx.lineTo(s.pts[k][0], s.pts[k][1]);
          ctx.stroke();
          // the strand's start point
          ctx.fillStyle = `rgba(255,255,255,${(.25 + a * .6).toFixed(3)})`; ctx.fillRect(s.pts[0][0] - 1, s.pts[0][1] - 1, 2, 2);
        }
        // light pulses travelling toward the model along the lit bundle
        if (a > .05 && !REDUCED && reveal >= 1) {
          ctx.globalCompositeOperation = "lighter";
          for (const s of b.strands) {
            const p = (t * s.speed + s.off) % 1, i0 = Math.floor(p * SAMPLES), len = 7;
            ctx.beginPath();
            for (let k = 0; k <= len && i0 + k <= SAMPLES; k++) { const q = s.pts[i0 + k]; k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
            ctx.strokeStyle = `rgba(190,255,245,${(a * .55).toFixed(3)})`; ctx.lineWidth = 1.3; ctx.stroke();
          }
          ctx.globalCompositeOperation = "source-over";
        }
      });
    };
    const loop = now => { if (!live) return; draw(now); requestAnimationFrame(loop); };
    onView(stage, v => {
      if (!v && live) held = performance.now() - t0;
      if (v && !live) { if (!born) born = performance.now(); t0 = performance.now() - held; live = true; requestAnimationFrame(loop); }
      live = v;
    });
    addEventListener("resize", () => { layout(); draw(performance.now()); });
    layout(); select(0); born = performance.now(); draw(born);
  }

  /* ================= 2. ribbed-glass gradient field ================= */
  const sec = document.querySelector(".closer");
  if (sec) {
    const cv = sec.querySelector(".closer__field"), ctx = cv.getContext("2d");
    const off = document.createElement("canvas"), octx = off.getContext("2d");
    const RIB = 30, SCALE = .5;                   // rib width in css px; the colour field renders at half size
    let W = 0, H = 0, d = 1, live = false, px = -9999, ease = -9999;
    const size = () => {
      const r = cv.getBoundingClientRect(); d = Math.min(devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * d; cv.height = H * d;
      off.width = Math.ceil(W * SCALE); off.height = Math.ceil(H * SCALE);
    };
    // drifting blobs: brand teal, deep green, mint, and a little of the hero's gold
    const BLOBS = [
      { c: [17, 153, 142], r: .55, x: .62, y: .55, ax: .12, ay: .1, s: .11 },
      { c: [11, 94, 87], r: .7, x: .3, y: .7, ax: .1, ay: .08, s: .08 },
      { c: [127, 224, 211], r: .28, x: .78, y: .3, ax: .08, ay: .12, s: .14 },
      { c: [201, 163, 98], r: .32, x: .9, y: .82, ax: .06, ay: .05, s: .1 },
    ];
    const paint = t => {
      const w = off.width, h = off.height;
      octx.fillStyle = "#061113"; octx.fillRect(0, 0, w, h);
      octx.globalCompositeOperation = "lighter";
      for (const b of BLOBS) {
        const x = (b.x + Math.sin(t * b.s) * b.ax) * w, y = (b.y + Math.cos(t * b.s * 1.3) * b.ay) * h, R = b.r * Math.max(w, h);
        const g = octx.createRadialGradient(x, y, 0, x, y, R);
        g.addColorStop(0, `rgba(${b.c},.75)`); g.addColorStop(.5, `rgba(${b.c},.22)`); g.addColorStop(1, `rgba(${b.c},0)`);
        octx.fillStyle = g; octx.fillRect(0, 0, w, h);
      }
      octx.globalCompositeOperation = "source-over";
    };
    const draw = now => {
      const t = now / 1000;
      paint(REDUCED ? 0 : t);
      ease += (px - ease) * .08;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      const n = Math.ceil(W / RIB);
      for (let i = 0; i < n; i++) {
        const x = i * RIB, cx = x + RIB / 2;
        // each rib is a lens: it shows a slightly shifted, squeezed slice of the field behind it
        const near = Math.max(0, 1 - Math.abs(cx - ease) / 220);
        const shift = Math.sin(i * .9 + (REDUCED ? 0 : t * .35)) * 14 + (cx - ease) * .35 * near;
        const sw = RIB * (1.5 + near * .6);
        ctx.drawImage(off, (cx - sw / 2 + shift) * SCALE, 0, sw * SCALE, H * SCALE, x, 0, RIB + .5, H);
        // glass edges: a bright hairline on the left, a shadow on the right
        ctx.fillStyle = `rgba(255,255,255,${(.05 + near * .12).toFixed(3)})`; ctx.fillRect(x, 0, 1, H);
        ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.fillRect(x + RIB - 2, 0, 2, H);
      }
    };
    const loop = now => { if (!live) return; draw(now); if (!REDUCED) requestAnimationFrame(loop); };
    sec.addEventListener("pointermove", e => { const r = sec.getBoundingClientRect(); px = e.clientX - r.left; if (ease < -5000) ease = px; });
    sec.addEventListener("pointerleave", () => { px = -9999; ease = -9999; });
    onView(sec, v => { const was = live; live = v; if (v && !was) requestAnimationFrame(loop); });
    addEventListener("resize", () => { size(); draw(performance.now()); });
    size(); draw(performance.now());
  }
})();
