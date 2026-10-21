/* Hiring process — one shot, five beats. A single tile lattice re-arranges itself
   around one protagonist (the candidate) as they move through the process.
   Motion language from deccan.ai: blur-fade-up reveals, per-letter swaps on
   cubic-bezier(.16,1,.3,1), power3.inOut ticks, an auto-advancing progress bar.
   Coordinates are Figma's (1216×480 border box); every anchor is derived from tiles. */
(() => {
  const proc = document.querySelector(".process");
  if (!proc || !window.gsap) return;
  let instances = 0;

  // One engine per stage: the desktop stage (stepper, copy, autoplay) and, on phones,
  // a solo stage in each step card that plays just its own step when scrolled into view.
  function createStage(root, wrap, single) {
    const solo = single !== undefined, uid = ++instances;

    const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const AUTO = 5.6;                              // seconds per step on autoplay
    const W = 1216, H = 480, T = 108.41, P = 132.5;
    const SNAP = "expo.out";                       // ≈ the site's cubic-bezier(.16,1,.3,1)
    const SVGNS = "http://www.w3.org/2000/svg";

    const stage = wrap.querySelector(".hp-stage");
    const bgWrap = stage.querySelector(".hp-bgwrap");
    const world = stage.querySelector(".hp-world");
    const drift = stage.querySelector(".hp-drift");
    const sockLayer = stage.querySelector(".hp-sockets");
    const faceLayer = stage.querySelector(".hp-faces");
    const youLayer = stage.querySelector(".hp-youlayer");
    const svg = stage.querySelector(".hp-wires");
    const A = name => stage.querySelector(`[data-a="${name}"]`);
    const bgA = stage.querySelector(".hp-bg--a"), bgB = stage.querySelector(".hp-bg--b");

    const cell = (c, r, ox = 0, oy = 0) => ({ x: 18 + P * c + ox, y: -79 + P * r + oy });
    const mid = p => ({ x: p.x + T / 2, y: p.y + T / 2 });
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const ALL = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const rows = (spec, ox, oy) => spec.flatMap((cols, r) => cols.map(c => cell(c, r, ox, oy)));
    const inView = p => p.x > -T - 30 && p.x < W + 30 && p.y > -T - 30 && p.y < H + 30;
    const at = (el, x, y, cx = 0, cy = 0) => gsap.set(el, { x, y, xPercent: cx, yPercent: cy });

    // AI-generated portraits of fictional people (no real individuals) — swap for real headshots here.
    const FACES = Array.from({ length: 27 }, (_, i) => `img/faces/f${String((i * 7) % 27 + 1).padStart(2, "0")}.jpg`);
    let faceN = 0;

    /* ---------- layouts per step (from the Figma frames) ---------- */

    // 01 — the crowd: four offset clusters of a 6/6/4 flex-wrap, same 132.5 pitch
    const PATTERN = "FFEFEFEFFFEFFEEF";
    const CLUSTERS = [[535.58, -89.3], [-413, -276], [1228.19, 190.76], [-187.15, 235.93]];
    const crowd = { faces: [], sockets: [] };
    CLUSTERS.forEach(([gx, gy]) => [...PATTERN].forEach((ch, i) => {
      const row = i < 6 ? 0 : i < 12 ? 1 : 2, k = row < 2 ? i - row * 6 : i - 12;
      const p = { x: gx + 1 + (row < 2 ? 39.148 : 171.648) + k * P, y: gy + 1 + row * P, o: .6 };
      if (inView(p)) (ch === "F" ? crowd.faces : crowd.sockets).push(p);
    }));
    const centre = { x: 548, y: 186 };
    crowd.faces.sort((a, b) => dist(a, centre) - dist(b, centre));
    const youInCrowd = crowd.faces.shift();        // the candidate is hiding in the crowd

    const O3 = [67.64, -33.41];                    // step 03 slides the whole lattice
    const seat = cell(4, 2);
    const team = [[4,0,.42],[3,1,.42],[4,1,.52],[5,1,.42],[7,1,.22],[2,2,.42],[3,2,.52],[5,2,.52],[6,2,.42],[1,3,.22],[3,3,.42],[4,3,.52],[5,3,.42],[4,4,.42]]
      .map(([c, r, o]) => ({ ...cell(c, r), o }));
    const taken = new Set([...team, seat].map(p => p.x + "," + p.y));
    const o6 = p => ({ ...p, o: .6 });
    const IV = [cell(2, 1), cell(6, 1), cell(2, 3), cell(6, 3)];   // manager, peer, peer, cross-functional

    const SCENES = [
      { faces: crowd.faces, sockets: crowd.sockets, mode: "wave",
        you: { ...youInCrowd, o: .6, b: .14 }, glow: null, bg: [596.35, 69.2, .12, 0] },
      { faces: [], sockets: rows([ALL, ALL, [0, 1, 7, 8], ALL, ALL]).map(o6), mode: "pop",
        you: { ...cell(2, 2), o: 1, b: .2 }, glow: [180, 1], bg: [596.35, 69.2, .12, 0] },
      { faces: [], sockets: rows([[0,1,4,5,6,7,8], [0,1,8], [0,4,5,8], [0,1,8], [0,1,4,5,6,7,8]], ...O3).map(o6), mode: "pop",
        you: { ...cell(1, 2, ...O3), o: 1, b: .2 }, glow: [180, 1], bg: [432.64, 35.59, .21, 0] },
      { faces: IV.map(p => ({ ...p, o: .62 })),
        sockets: rows([ALL, [0,1,3,4,5,7,8], [0,1,2,3,5,6,7,8], [0,1,3,4,5,7,8], ALL]).map(o6), mode: "burst",
        you: { ...seat, o: 1, b: .28 }, glow: [260, .4], bg: [60, 0, .32, 0] },
      { faces: team, sockets: rows([ALL, ALL, ALL, ALL, ALL]).filter(p => !taken.has(p.x + "," + p.y)).map(o6), mode: "drop",
        you: { ...seat, o: 1, b: .4 }, glow: [240, 1], bg: [60, 0, 0, .32] },
    ];

    const COPY = [
      ["01", "Exceptional People", "Share your resume, portfolio, and a brief note about your interest in joining us."],
      ["02", "Introductory Call", "A 20 to 30 minute call to discuss your background and career goals while learning more about us."],
      ["03", "Technical / Role Assessment", "Complete a task or share past work to showcase your skills and problem-solving abilities."],
      ["04", "Interviews with the Team", "Engage with your potential manager and peers to discuss your expertise and fit for the role."],
      ["05", "Welcome Aboard", "You are in. Meet the team, get set up, and start shipping."],
    ];

    const ACTORS = [
      ["bracket", "labYou"],
      ["deccan", "glowTeam", "wire2", "dot2", "call", "labCand", "labTeam"],
      ["card", "wire3", "scan", "side1", "side2", "labCand3"],
      ["wires4", "convos", "labMgr", "labPeer1", "labPeer2", "labCross"],
      ["onboarded", "labSeat"],
    ];

    /* ---------- wires (dashed SVG paths revealed through a solid mask) ---------- */

    const defs = svg.querySelector("defs");
    function wire(name, d, { opacity = .9, width = 1.5, group } = {}) {
      const g = group || document.createElementNS(SVGNS, "g");
      if (!group) { g.setAttribute("data-a", name); g.classList.add("hp-a"); svg.appendChild(g); }
      const id = "hpm" + uid + "-" + name + "-" + g.childElementCount;   // unique across stage copies
      const mask = document.createElementNS(SVGNS, "mask");
      mask.setAttribute("id", id);
      mask.setAttribute("maskUnits", "userSpaceOnUse");
      mask.setAttribute("x", -50); mask.setAttribute("y", -50); mask.setAttribute("width", W + 100); mask.setAttribute("height", H + 100);
      const reveal = document.createElementNS(SVGNS, "path");
      reveal.setAttribute("d", d); reveal.setAttribute("stroke", "#fff"); reveal.setAttribute("stroke-width", 6); reveal.setAttribute("fill", "none");
      mask.appendChild(reveal); defs.appendChild(mask);
      const line = document.createElementNS(SVGNS, "path");
      line.setAttribute("d", d); line.setAttribute("stroke", "#fff"); line.setAttribute("stroke-opacity", opacity);
      line.setAttribute("stroke-width", width); line.setAttribute("stroke-dasharray", "4 5"); line.setAttribute("mask", `url(#${id})`);
      g.appendChild(line);
      const len = reveal.getTotalLength();
      gsap.set(reveal, { strokeDasharray: len, strokeDashoffset: len });
      (g._wires || (g._wires = [])).push({ line, reveal, len });
      return g;
    }
    const drawWire = (w, delay, dur = .55) => gsap.fromTo(w.reveal, { strokeDashoffset: w.len }, { strokeDashoffset: 0, duration: dur, ease: SNAP, delay });

    /* ---------- geometry for each beat ---------- */

    const box = p => ({ l: p.x, t: p.y, r: p.x + T, b: p.y + T, cx: p.x + T / 2, cy: p.y + T / 2 });
    const Y1 = box(youInCrowd), Y2 = box(SCENES[1].you), Y3 = box(SCENES[2].you), Y4 = box(seat);
    const DEC = box(cell(6, 2));
    const GAP = 10;
    const LBL = (P - T - 12) / 2;                  // labels sit centred in the 24px gutter between rows

    // 02 — candidate ↔ hiring team on one horizontal line
    const W2 = { x1: Y2.r + GAP, x2: DEC.l - GAP, y: Y2.cy };
    wire("wire2", `M${W2.x1} ${W2.y} H${W2.x2}`);
    at(A("deccan"), DEC.l, DEC.t);
    at(A("glowTeam"), DEC.cx - 162, DEC.cy - 162);
    at(A("call"), (W2.x1 + W2.x2) / 2, W2.y, -50, -50);
    at(A("labCand"), Y2.cx, Y2.b + LBL, -50);
    at(A("labTeam"), DEC.cx, DEC.b + LBL, -50);

    // 03 — candidate → assessment card
    const CARD = { x: 467.64, y: 91.14 };
    const card = A("card");
    at(card, CARD.x, CARD.y);
    wire("wire3", `M${Y3.r + GAP} ${Y3.cy} H${CARD.x - 1}`, { width: 1 });
    at(A("scan"), Y3.l, Y3.t);
    at(A("labCand3"), Y3.cx, Y3.b + LBL, -50);
    const topIn = el => { let y = 0; for (let n = el; n && n !== card; n = n.offsetParent) y += n.offsetTop; return y; };
    function placeSides() {           // align the side notes with the header and the live row
      const head = card.querySelector(".hp-card__head"), run = card.querySelector("[data-run]");
      const x = CARD.x + card.offsetWidth + GAP;
      at(A("side1"), x, CARD.y + topIn(head) + head.offsetHeight / 2, 0, -50);
      at(A("side2"), x, CARD.y + topIn(run) + run.offsetHeight / 2, 0, -50);
    }
    placeSides();

    // 04 — elbow connectors from the candidate into each interviewer
    const wires4 = document.createElementNS(SVGNS, "g");
    wires4.setAttribute("data-a", "wires4"); wires4.classList.add("hp-a"); svg.appendChild(wires4);
    const upY = (box(IV[0]).b + Y4.t) / 2, downY = (Y4.b + box(IV[2]).t) / 2;
    IV.forEach((p, i) => {
      const b = box(p), top = i < 2;
      wire("w4", top ? `M${Y4.cx} ${Y4.t} V${upY} H${b.cx} V${b.b}` : `M${Y4.cx} ${Y4.b} V${downY} H${b.cx} V${b.t}`,
        { opacity: .38, group: wires4 });
    });
    const pings = IV.map(() => { const c = document.createElementNS(SVGNS, "circle"); c.setAttribute("r", 2.6); c.style.opacity = 0; wires4.appendChild(c); return c; });
    at(A("convos"), Y4.r + 12, Y4.cy, 0, -50);
    [["labMgr", 0, -1], ["labPeer1", 1, -1], ["labPeer2", 2, 1], ["labCross", 3, 1]].forEach(([k, i, side]) => {
      const b = box(IV[i]);
      at(A(k), b.cx, side < 0 ? b.t - LBL - 12 : b.b + LBL, -50);
    });

    // 05 — your seat
    at(A("labSeat"), Y4.cx, Y4.t - LBL - 12, -50);
    at(A("onboarded"), Y4.cx, Y4.b, -50, -50);
    at(A("labYou"), Y1.cx, Y1.t - LBL - 12, -50);

    /* ---------- tile pools ---------- */

    function makeTile(face, layer) {
      const el = document.createElement("div");
      el.className = "hp-t" + (face ? " hp-t--face" : "");
      el.innerHTML = '<div class="hp-t__in">' + (face ? `<img src="${FACES[faceN++ % FACES.length]}" alt="">` : "") + "</div>";
      layer.appendChild(el);
      el._in = el.firstChild; el._p = { x: 0, y: 0 }; el._live = false; el._leaving = false;
      return el;
    }
    const pools = { faces: [], sockets: [] };
    const place = (el, p) => { gsap.set(el, { x: p.x, y: p.y }); el._p = { x: p.x, y: p.y }; };

    // Tiles that can travel do (nearest-first), the rest are pulled toward the
    // focus as they leave, and new ones arrive in the step's own manner.
    function morph(pool, layer, face, targets, focus, mode, first) {
      const live = pool.filter(e => e._live);
      const pairs = [];
      live.forEach(e => targets.forEach((t, j) => { const d = dist(e._p, t); if (d < 420) pairs.push([d, e, j]); }));
      pairs.sort((a, b) => a[0] - b[0]);
      const usedE = new Set(), usedT = new Set(), f = mid(focus);

      for (const [d, e, j] of pairs) {
        if (usedE.has(e) || usedT.has(j)) continue;
        usedE.add(e); usedT.add(j);
        const t = targets[j], lag = Math.min(.16, dist(mid(t), f) * .00022);
        gsap.killTweensOf(e);
        gsap.to(e, { x: t.x, y: t.y, opacity: t.o, duration: .62, ease: SNAP, delay: lag });
        if (d > 30) gsap.to(e._in, { keyframes: [{ scale: .86, duration: .13, ease: "power2.out" }, { scale: 1, duration: .5, ease: "back.out(3)" }], delay: lag });
        e._p = { x: t.x, y: t.y };
      }

      live.filter(e => !usedE.has(e)).forEach(e => {
        const c = mid(e._p), d = dist(c, f), lag = Math.min(.18, d * .00025), pull = d ? 26 / d : 0;
        e._live = false; e._leaving = true;
        gsap.killTweensOf([e, e._in]);
        gsap.to(e, { x: e._p.x + (f.x - c.x) * pull, y: e._p.y + (f.y - c.y) * pull, duration: .3, ease: "power2.in", delay: lag });
        gsap.to(e._in, { scale: .55, opacity: 0, filter: "blur(6px)", duration: .3, ease: "power2.in", delay: lag,
          onComplete: () => { e._leaving = false; gsap.set(e, { opacity: 0 }); } });
      });

      let n = 0;
      targets.forEach((t, j) => {
        if (usedT.has(j)) return;
        let e = pool.find(x => !x._live && !x._leaving);
        if (!e) { e = makeTile(face, layer); pool.push(e); }
        e._live = true;
        gsap.killTweensOf([e, e._in]);
        const d = dist(mid(t), f), base = first ? .05 : .18;
        if (mode === "burst") {                    // flung out of the candidate to their seats
          place(e, focus);
          gsap.set(e, { opacity: t.o });
          gsap.fromTo(e._in, { scale: .4, opacity: 0, filter: "blur(4px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: .35, ease: "power2.out", delay: .2 + n * .07 });
          gsap.to(e, { x: t.x, y: t.y, duration: .72, ease: "back.out(1.3)", delay: .2 + n * .07 });
          e._p = { x: t.x, y: t.y };
        } else if (mode === "drop") {              // land on the table: big and soft, then down hard
          place(e, t);
          gsap.set(e, { opacity: t.o });
          gsap.fromTo(e._in, { scale: 1.32, opacity: 0, filter: "blur(8px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: .5, ease: "power4.out", delay: base + d * .00075 });
        } else {
          place(e, t);
          gsap.set(e, { opacity: t.o });
          gsap.fromTo(e._in, { scale: .5, opacity: 0, filter: "blur(10px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: .55, ease: "back.out(1.8)",
            delay: base + d * (mode === "wave" ? .0009 : .00045) });
        }
        n++;
      });
    }

    // Shockwave on landing: neighbours get shoved, then spring back.
    function shove(focus, delay, force = 14) {
      const f = mid(focus), R = 330;
      [...pools.faces, ...pools.sockets].forEach(e => {
        if (!e._live) return;
        const c = mid(e._p), d = dist(c, f);
        if (d < 4 || d > R) return;
        const k = force * (1 - d / R) ** 1.6;
        gsap.to(e._in, { keyframes: [
          { x: (c.x - f.x) / d * k, y: (c.y - f.y) / d * k, duration: .13, ease: "power3.out" },
          { x: 0, y: 0, duration: .75, ease: "elastic.out(1,.42)" },
        ], delay: delay + d * .00055 });
      });
      const ring = A("ring");
      gsap.killTweensOf(ring);
      gsap.fromTo(ring, { x: focus.x, y: focus.y, scale: .95, autoAlpha: .6 }, { scale: 2.4, autoAlpha: 0, duration: .9, ease: SNAP, delay });
    }
    // a tile "hears" something: border lights up, tiny kick
    function blip(tileIn, strength = 1) {
      gsap.fromTo(tileIn, { scale: 1 }, { keyframes: [{ scale: 1 + .045 * strength, duration: .1, ease: "power2.out" }, { scale: 1, duration: .55, ease: "back.out(3)" }] });
      gsap.fromTo(tileIn, { borderColor: "rgba(255,255,255,.7)" }, { borderColor: "", duration: .7, ease: "power2.out", clearProps: "borderColor" });
    }

    /* ---------- the candidate ---------- */

    const you = makeTile(true, youLayer);
    you.classList.add("hp-you");
    you._in.querySelector("img").src = "img/face.png";
    const glow = A("glow");

    function moveYou(to, first) {
      gsap.killTweensOf([you, you._in]);
      const d = dist(you._p, to);
      if (first) {
        place(you, to);
        gsap.set(you, { opacity: to.o, "--b": to.b });
        gsap.fromTo(you._in, { scale: .5, opacity: 0, filter: "blur(10px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: .55, ease: "back.out(1.8)", delay: .05 });
      } else {
        gsap.set(you._in, { opacity: 1, filter: "blur(0px)" });
        gsap.to(you, { x: to.x, y: to.y, opacity: to.o, "--b": to.b, duration: .78, ease: SNAP, delay: .04 });
        if (d > 30) gsap.to(you._in, { keyframes: [{ scale: 1.14, duration: .2, ease: "power2.out" }, { scale: 1, duration: .55, ease: "back.out(3)" }], delay: .04 });
      }
      you._p = { x: to.x, y: to.y };
      return d;
    }

    function moveGlow(g, to, first, delay = .04) {
      gsap.killTweensOf(glow);
      if (!g) { gsap.to(glow, { autoAlpha: 0, scale: .6, duration: .3, ease: "power2.in" }); return; }
      const S = g[0] * 1.8, c = mid(to), props = { x: c.x - S / 2, y: c.y - S / 2, width: S, height: S };
      if (+gsap.getProperty(glow, "opacity") < .01 || first) {
        gsap.set(glow, props);
        gsap.fromTo(glow, { autoAlpha: 0, scale: .4 }, { autoAlpha: g[1], scale: 1, duration: .9, ease: SNAP, delay: delay + .25 });
      } else {
        gsap.to(glow, { ...props, autoAlpha: g[1], scale: 1, duration: .8, ease: SNAP, delay });
      }
    }

    function moveBg(b, first) {
      const [dx, dy, oa, ob] = b, d = first ? 0 : 1.1;
      gsap.to(bgA, { x: W / 2 + dx - 2184.744 / 2, y: H / 2 + dy - 951.591 / 2, opacity: oa, duration: d, ease: "power3.inOut" });
      gsap.set(bgB, { x: W / 2 + 276.87 - 2184.744 / 2, y: H / 2 - 54 - 951.591 / 2 });
      gsap.to(bgB, { opacity: ob, duration: d, ease: "power1.inOut" });
    }

    /* ---------- per-step beats ---------- */

    function letters(el) {
      if (!el._split) { el.innerHTML = [...el.textContent].map(ch => `<span>${ch}</span>`).join(""); el._split = [...el.children]; }
      return el._split;
    }
    function typeIn(el, delay) {
      gsap.set(el, { autoAlpha: 1 });
      gsap.fromTo(letters(el), { opacity: 0, y: 8, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: .45, ease: "power2.out", stagger: .018, delay });
    }
    const pop = (el, delay, from = .6) =>
      gsap.fromTo(el, { autoAlpha: 0, scale: from, filter: "blur(8px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: .55, ease: "back.out(2.2)", delay });
    const show = el => gsap.set(el, { autoAlpha: 1 });

    let loops = [], timers = [];
    const keep = t => (loops.push(t), t);
    const every = (fn, ms) => timers.push(setInterval(fn, ms));
    const liveFaces = () => pools.faces.filter(e => e._live);

    const ENTER = [
      // 01 · a crowd of applicants; a selector hops between faces and locks onto you
      first => {
        keep(gsap.to(drift, { x: 14, y: -8, duration: 4.5, ease: "sine.inOut", yoyo: true, repeat: -1 }));
        const br = A("bracket");
        const near = liveFaces().map(e => ({ e, d: dist(e._p, you._p) })).filter(o => o.d > 10).sort((a, b) => a.d - b.d).slice(0, 5);
        const hops = [near[1], near[3], near[0]].filter(Boolean).map(o => o.e);
        if (!hops.length) return;
        const tl = keep(gsap.timeline({ delay: first ? 1.05 : .7 }));
        const pos = p => ({ x: p.x - 8, y: p.y - 8 });
        tl.set(br, { ...pos(hops[0]._p), scale: 1.35, autoAlpha: 0, filter: "blur(0px)" })
          .to(br, { autoAlpha: 1, scale: 1, duration: .35, ease: SNAP });
        hops.forEach((h, i) => {
          if (i) tl.to(br, { ...pos(h._p), duration: .3, ease: SNAP });
          tl.to(h, { opacity: .95, duration: .12, ease: "power2.out" }, "<.06")
            .to(h, { opacity: .6, duration: .35, ease: "power2.out" }, ">.06");
        });
        tl.to(br, { ...pos(you._p), duration: .38, ease: SNAP }, "-=.3")
          .to(br, { keyframes: [{ scale: .9, duration: .1 }, { scale: 1, duration: .5, ease: "back.out(3)" }] })
          .to(you, { opacity: 1, "--b": .4, duration: .35, ease: "power2.out" }, "<")
          .add(() => { blip(you._in, 1.4); moveGlow([150, .7], you._p, false, 0); typeIn(A("labYou"), 0); }, "<")
          .to(liveFaces(), { opacity: .48, duration: .6, ease: "power2.out" }, "<");
      },
      // 02 · the call: a dot leaves you, dissolves into Deccan, the next one follows
      () => {
        const dec = A("deccan");
        pop(dec, .3, .35);
        gsap.fromTo(dec.firstChild, { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: .55, ease: SNAP, delay: .45 });
        gsap.fromTo(A("glowTeam"), { autoAlpha: 0, scale: .4 }, { autoAlpha: 1, scale: 1, duration: 1, ease: SNAP, delay: .4 });
        const w2 = A("wire2");
        show(w2); drawWire(w2._wires[0], .5, .7);
        pop(A("call"), .75);
        typeIn(A("labCand"), .6);
        typeIn(A("labTeam"), .75);

        const dot = A("dot2"), R = 14.5;
        const tl = keep(gsap.timeline({ repeat: -1, delay: 1.15 }));
        tl.set(dot, { x: W2.x1 - R, y: W2.y - R, scale: 0, autoAlpha: 1, filter: "blur(0px)" })
          .add(() => blip(you._in, .6))
          .to(dot, { scale: 1, duration: .28, ease: "back.out(3)" })
          // travel only to the end of the line; the dissolve finishes exactly on arrival, then the card reacts
          .to(dot, { x: W2.x2 - R, duration: 1.05, ease: "power2.inOut" }, "<.04")
          .to(dot, { scale: .2, autoAlpha: 0, filter: "blur(8px)", duration: .38, ease: "power1.in" }, "-=.38")
          .add(() => { blip(dec, 1); gsap.fromTo(A("glowTeam"), { scale: 1.12 }, { scale: 1, duration: .8, ease: SNAP }); })
          .to({}, { duration: .3 });

        let secs = 24 * 60 + 6;
        const clock = A("call").querySelector(".hp-clock");
        clock.textContent = "24:06";
        every(() => { secs++; clock.textContent = `${String(secs / 60 | 0).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`; }, 1000);
      },
      // 03 · the assessment card grows out of Deccan and completes itself, row by row
      prev => {
        const w = card.offsetWidth, h = card.offsetHeight;
        const from = prev === 1 ? DEC : box(you._p);
        gsap.fromTo(card, { autoAlpha: 1, x: from.l, y: from.t, scaleX: T / w, scaleY: T / h },
          { x: CARD.x, y: CARD.y, scaleX: 1, scaleY: 1, duration: .72, ease: SNAP, delay: .12 });
        gsap.fromTo(card.children, { opacity: 0, y: 8, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: .45, ease: "power2.out", stagger: .06, delay: .3 });
        const rowsEl = [...card.querySelectorAll(".hp-row")], fill = card.querySelector(".hp-card__bar i");
        rowsEl.forEach(r => {
          r.classList.remove("is-done", "is-run");
          r.querySelector("img").src = "img/hp/dot-queued.svg";
          r.querySelector(".hp-row__m").textContent = "queued";
        });
        gsap.set(fill, { scaleX: 0 });
        gsap.fromTo(rowsEl, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: .4, ease: SNAP, stagger: .06, delay: .5 });
        const state = (r, s) => {
          r.classList.add(s === "done" ? "is-done" : "is-run");
          r.querySelector("img").src = s === "done" ? "img/hp/dot-done.svg" : "img/hp/dot-running.svg";
          const m = r.querySelector(".hp-row__m");
          m.textContent = s === "done" ? r.dataset.done : "running";
          gsap.fromTo(m, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .3, ease: "power2.out" });
          gsap.fromTo(r.querySelector(".hp-row__dot"), { scale: 1.8 }, { scale: 1, duration: .45, ease: "back.out(3)" });
        };
        const tl = keep(gsap.timeline({ delay: .95 }));
        tl.add(() => state(rowsEl[0], "done")).to(fill, { scaleX: .38, duration: .4, ease: "power3.out" }, "<")
          .add(() => state(rowsEl[1], "done"), "+=.32").to(fill, { scaleX: .74, duration: .4, ease: "power3.out" }, "<")
          .add(() => state(rowsEl[2], "run"), "+=.32").to(fill, { scaleX: 1, duration: 1.4, ease: "power1.out" }, "<");
        keep(gsap.fromTo(rowsEl[2].querySelector(".hp-row__dot"), { scale: .85 }, { scale: 1.2, duration: .55, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2 }));
        pop(card.querySelector(".hp-badge"), .7, .7);

        const w3 = A("wire3");
        show(w3); drawWire(w3._wires[0], .55, .45);
        const scan = A("scan");
        gsap.fromTo(scan, { autoAlpha: 0 }, { autoAlpha: 1, duration: .2, delay: .75 });
        keep(gsap.fromTo(scan.querySelectorAll(".hp-scan__beam, .hp-scan__trail"), { y: 0 }, { y: T, duration: 1.25, ease: "power2.inOut", yoyo: true, repeat: -1, delay: .75 }));
        placeSides();
        ["side1", "side2"].forEach((k, i) => {
          const el = A(k);
          show(el);
          gsap.fromTo(el.querySelector(".hp-line"), { scaleX: 0 }, { scaleX: 1, duration: .45, ease: SNAP, delay: .85 + i * .45 });
          typeIn(el.querySelector(".hp-label"), .95 + i * .45);
        });
        typeIn(A("labCand3"), .7);
      },
      // 04 · interviewers burst out of you; each connection draws in and talks back
      () => {
        show(wires4);
        const count = A("convos").querySelector(".hp-count");
        // roll the counter; if a roll is still running, finish it first so only one digit ever leaves
        const setCount = n => {
          const kids = [...count.children];
          kids.slice(0, -1).forEach(k => { gsap.killTweensOf(k); k.remove(); });
          const old = kids[kids.length - 1];
          if (old) { gsap.killTweensOf(old); gsap.set(old, { position: "relative", yPercent: 0, opacity: 1 }); }
          const nb = document.createElement("b");
          nb.textContent = n; count.appendChild(nb);
          if (old) { gsap.to(old, { yPercent: -100, opacity: 0, duration: .3, ease: "power3.inOut", onComplete: () => old.remove() }); gsap.set(nb, { position: "absolute", top: 0, left: 0 }); }
          gsap.fromTo(nb, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .3, ease: "power3.inOut", onComplete: () => gsap.set(nb, { position: "relative" }) });
        };
        count.innerHTML = "<b>0</b>";
        pop(A("convos"), .45);
        const talk = (i, delay, onArrive) => {
          const w = wires4._wires[i], c = pings[i], o = { t: 1 };
          return gsap.to(o, { t: 0, duration: .6, ease: "power2.inOut", delay,
            onStart: () => { gsap.set(c, { opacity: 1 }); blip(liveFaces().find(e => dist(e._p, IV[i]) < 2)?._in || you._in, .5); },
            onUpdate: () => { const pt = w.reveal.getPointAtLength(o.t * w.len); c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); },
            onComplete: () => { gsap.to(c, { opacity: 0, duration: .15 }); blip(you._in, .7); onArrive && onArrive(); } });
        };
        wires4._wires.forEach((w, i) => {
          drawWire(w, .55 + i * .08, .5);
          keep(talk(i, 1.05 + i * .22, () => setCount(i + 1)));
        });
        // afterwards the conversations keep going, one at a time
        let k = 0;
        keep(gsap.delayedCall(2.2, function next() { keep(talk((k++ * 3 + 1) % 4, 0)); keep(gsap.delayedCall(1.1, next)); }));
        [["labMgr"], ["labPeer1"], ["labPeer2"], ["labCross"]].forEach(([n], i) => typeIn(A(n), .7 + i * .06));
      },
      // 05 · the team settles around your seat, then waves hello
      () => {
        pop(A("onboarded"), .75);
        typeIn(A("labSeat"), .6);
        keep(gsap.to(glow, { scale: 1.1, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.4 }));
        const wave = () => liveFaces().forEach(e => {
          const d = dist(e._p, you._p);
          gsap.to(e._in, { keyframes: [{ scale: 1.05, y: -3, duration: .18, ease: "power2.out" }, { scale: 1, y: 0, duration: .6, ease: "back.out(2.5)" }], delay: d * .0011 });
        });
        keep(gsap.delayedCall(1.3, function hello() { wave(); keep(gsap.delayedCall(2.4, hello)); }));
      },
    ];

    function leave(step) {
      loops.forEach(t => t.kill()); loops = [];
      timers.forEach(clearInterval); timers = [];
      if (step < 0) return;
      if (step === 0) gsap.to(drift, { x: 0, y: 0, duration: .6, ease: "power3.inOut" });
      ACTORS[step].forEach(k => {
        const el = A(k);
        gsap.killTweensOf(el);
        gsap.killTweensOf(el.querySelectorAll("*"));
        gsap.to(el, { autoAlpha: 0, filter: "blur(6px)", scale: k === "card" ? .94 : .97, duration: .24, ease: "power2.in" });
      });
      pings.forEach(c => gsap.set(c, { opacity: 0 }));
    }

    /* ---------- copy: number roll + letter swap ---------- */

    const numBox = root.querySelector(".step__num");
    const title = root.querySelector(".step__text h4");
    const desc = root.querySelector(".step__text p");
    // words for the description; letters (grouped per word so lines never break mid-word) for the title
    const split = (el, text, unit) => {
      if (unit === "w") {
        el.innerHTML = text.split(/(\s+)/).map(t => `<span>${t}</span>`).join("");
        return [...el.children];
      }
      el.innerHTML = text.split(/(\s+)/).map(w => /^\s+$/.test(w) ? w
        : `<span class="w">${[...w].map(ch => `<span>${ch}</span>`).join("")}</span>`).join("");
      return [...el.querySelectorAll(".w > span")];
    };

    function swapCopy(i, dir, first) {
      if (!title) return;                          // phone cards carry their own static copy
      const [n, t, d] = COPY[i];
      if (first) { split(title, t); split(desc, d, "w"); return; }
      const old = numBox.querySelectorAll("b"), nb = document.createElement("b");
      nb.textContent = n; numBox.appendChild(nb);
      gsap.to(old, { yPercent: -100 * dir, opacity: 0, duration: .5, ease: "power3.inOut", onComplete: () => old.forEach(o => o.remove()) });
      gsap.fromTo(nb, { yPercent: 100 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .5, ease: "power3.inOut" });

      gsap.killTweensOf([...title.querySelectorAll("span"), ...desc.children]);
      gsap.to(title.querySelectorAll(".w > span"), { opacity: 0, y: -10, filter: "blur(10px)", duration: .16, ease: "power2.in", stagger: .006 });
      gsap.to(desc.children, { opacity: 0, filter: "blur(4px)", duration: .14, ease: "power2.in" });
      gsap.delayedCall(.2, () => {
        gsap.fromTo(split(title, t), { opacity: 0, y: 14, filter: "blur(12px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: .6, ease: SNAP, stagger: .016 });
        gsap.fromTo(split(desc, d, "w"), { opacity: 0, y: 10, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: .5, ease: "power2.out", stagger: .012, delay: .08 });
      });
    }

    /* ---------- stepper + autoplay (never pauses on hover; only off-screen) ---------- */

    const bars = [...root.querySelectorAll(".stepper__line")];
    let cur = -1, prog = null, visible = false;

    function runProgress() {
      if (solo) return;                            // a phone card plays one step, no stepper
      prog && prog.kill();
      bars.forEach((b, k) => {
        b.setAttribute("aria-selected", k === cur);
        if (k !== cur) gsap.to(b.firstChild, { scaleX: k < cur ? 1 : 0, duration: .45, ease: "power3.inOut" });
      });
      prog = gsap.fromTo(bars[cur].firstChild, { scaleX: 0 }, { scaleX: 1, duration: AUTO, ease: "none", onComplete: () => go(cur + 1) });
      if (!visible || REDUCED) prog.pause();
    }

    function go(i, dir) {
      i = (i + 5) % 5;
      if (i === cur) return;
      const prev = cur, first = prev < 0;
      dir = dir || (first || i > prev || (prev === 4 && i === 0) ? 1 : -1);
      cur = i;
      const sc = SCENES[i];
      leave(prev);
      morph(pools.sockets, sockLayer, false, sc.sockets, sc.you, sc.mode, first);
      morph(pools.faces, faceLayer, true, sc.faces, sc.you, sc.mode, first);
      const travelled = moveYou(sc.you, first);
      moveGlow(sc.glow, sc.you, first);
      moveBg(sc.bg, first);
      // actors keep their exit blur/scale; clear it before they come back
      ACTORS[i].forEach(k => { const el = A(k); gsap.killTweensOf(el); gsap.set(el, { filter: "blur(0px)", scale: 1 }); });
      ENTER[i](first ? true : prev);
      if (!first) shove(sc.you, travelled > 30 ? .5 : .2, sc.mode === "drop" ? 9 : 14);
      swapCopy(i, dir, first);
      camera(i, !first);
      spotHome();
      runProgress();
    }

    root.querySelectorAll(".arrows button").forEach(b => b.addEventListener("click", () => go(cur + +b.dataset.dir, +b.dataset.dir)));
    bars.forEach((b, k) => b.addEventListener("click", () => go(k)));

    /* ---------- cursor: parallax depth + a spotlight that reveals faces ---------- */

    const spot = { x: 608, y: 240 };
    const paintSpot = () => { faceLayer.style.setProperty("--sx", spot.x + "px"); faceLayer.style.setProperty("--sy", spot.y + "px"); };
    let pointerIn = false;
    function spotHome() { if (!pointerIn) { const c = mid(SCENES[Math.max(cur, 0)].you); gsap.to(spot, { x: c.x, y: c.y, duration: 1.2, ease: "power3.out", onUpdate: paintSpot }); } }
    const qx = gsap.quickTo(world, "x", { duration: .9, ease: "power3.out" }), qy = gsap.quickTo(world, "y", { duration: .9, ease: "power3.out" });
    const sx = gsap.quickTo(sockLayer, "x", { duration: 1.1, ease: "power3.out" }), sy = gsap.quickTo(sockLayer, "y", { duration: 1.1, ease: "power3.out" });
    const bx = gsap.quickTo(bgWrap, "x", { duration: 1.4, ease: "power3.out" }), by = gsap.quickTo(bgWrap, "y", { duration: 1.4, ease: "power3.out" });
    wrap.addEventListener("pointermove", e => {
      if (e.pointerType === "touch") return;
      pointerIn = true;
      const r = stage.getBoundingClientRect(), s = r.width / W;
      const px = (e.clientX - r.left) / s, py = (e.clientY - r.top) / s;
      const nx = px / W - .5, ny = py / H - .5;
      qx(nx * -16); qy(ny * -10);             // faces + actors: nearest layer
      sx(nx * 8); sy(ny * 5);                 // sockets lag behind → depth
      bx(nx * 30); by(ny * 18);               // light drifts the other way
      gsap.to(spot, { x: px + nx * 16, y: py + ny * 10, duration: .5, ease: "power3.out", overwrite: true, onUpdate: paintSpot });
    });
    wrap.addEventListener("pointerleave", () => { pointerIn = false; qx(0); qy(0); sx(0); sy(0); bx(0); by(0); spotHome(); });

    /* ---------- fit the 1216×480 stage; on narrow screens a camera pans to the action ---------- */

    const CAM = [608, 608, 565, 602, 608];
    let scale = 1;
    function camera(step, animate) {
      const w = wrap.clientWidth + 2;
      const x = Math.min(0, Math.max(w - W * scale, w / 2 - CAM[Math.max(step, 0)] * scale));
      gsap.to(stage, { x, duration: animate ? .9 : 0, ease: "power3.inOut", overwrite: "auto" });
    }
    function fit() {
      const w = wrap.clientWidth + 2;
      scale = Math.max(w / W, .44);
      gsap.set(stage, { scale });
      wrap.style.height = H * scale + "px";
      camera(cur, false);
    }
    fit();
    addEventListener("resize", fit);

    if (REDUCED) gsap.globalTimeline.timeScale(6);
    paintSpot();
    if (!solo) swapCopy(0, 1, true);

    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && cur < 0) go(solo ? single : 0);
      else if (prog) visible && !REDUCED ? prog.resume() : prog.pause();
    }, { threshold: .35 }).observe(wrap);
  }

  // phones: give every step card a pristine copy of the stage (cloned before any engine touches it)
  const master = proc.querySelector(".process__body > .mosaic");
  const cards = [...proc.querySelectorAll(".steps-m .sm")];
  const copies = cards.map(card => {
    const m = master.cloneNode(true);
    m.classList.add("mosaic--card");
    card.querySelector(".sm__img").replaceWith(m);
    return m;
  });
  createStage(proc, master);
  copies.forEach((m, i) => createStage(cards[i], m, i));
})();
