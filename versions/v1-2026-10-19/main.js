/* Deccan Experts — nav · roles tabs · testimonials · reveal · newsletter */
(function () {
  "use strict";
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- nav ---------- */
  const nav = $("#nav");
  const burger = $(".nav__burger", nav);
  const heroEl = document.getElementById("hero");
  const onScroll = () => {
    const past = heroEl ? window.scrollY > heroEl.offsetHeight - 90 : window.scrollY > 40;
    nav.classList.toggle("is-tab", past);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$(".nav__mobile a", nav).forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- hero legends (Figma R6) ---------- */
  // Face boxes in painting pixels (1600 × 900 frame). wave 1 = faces that arrive first.
  // [x, y, w, h, discipline · place, name, what they'd do today, record line, wave]
  const LEGENDS = [
    [86, 322, 66, 80, "Coding · England", "Ada Lovelace", "Would review a model’s code before it ever runs.", "London, 1815 · wrote the first published algorithm", 1],
    [322, 352, 60, 80, "Language · Japan", "Murasaki Shikibu", "Would tell you when a model’s prose rings false.", "Kyoto, c. 973 · wrote The Tale of Genji", 1],
    [650, 160, 66, 84, "Reasoning · Greece", "Plato", "Would question every step of a model’s argument.", "Athens, c. 428 BCE · founded the Academy", 1],
    [780, 172, 58, 72, "Astronomy · Egypt", "Hypatia", "Would check a model’s star charts against the sky.", "Alexandria, c. 360 · taught astronomy and mathematics", 2],
    [722, 448, 66, 76, "Mathematics · India", "Srinivasa Ramanujan", "Would check a model’s proofs, line by line.", "Kumbakonam, 1887 · self-taught, 3,900 results", 1],
    [1008, 180, 64, 84, "Computer vision · Iraq", "Ibn al-Haytham", "Would test what a model claims to see.", "Basra, c. 965 · wrote the Book of Optics", 1],
    [1195, 184, 60, 82, "Physical AI · China", "Zhang Heng", "Would ground a model’s physics in real instruments.", "Nanyang, 78 CE · built the first seismoscope", 2],
    [1178, 510, 86, 112, "Law · Mali", "Ahmad Baba", "Would weigh a model’s rulings against precedent.", "Araouane, 1556 · Timbuktu jurist, 40+ works", 2],
    [1421, 264, 62, 82, "Forecasting · USA", "Benjamin Banneker", "Would hold a model’s forecasts to the almanac.", "Maryland, 1731 · calculated his own almanacs", 2],
  ];
  const hero = $("#hero");
  const legendsEl = $("#legends");
  if (hero && legendsEl) {
    const pct = (n) => +n.toFixed(4) + "%";
    legendsEl.innerHTML = LEGENDS.map(([x, y, w, h, tag, name, line, rec, wave], i) => {
      const L = (x / 1600) * 100, T = (y / 900) * 100, W = (w / 1600) * 100, H = (h / 900) * 100;
      const style = [
        `--x:${pct(L)}`, `--y:${pct(T)}`, `--w:${pct(W)}`, `--h:${pct(H)}`,
        `--bs:${pct(10000 / W)} ${pct(10000 / H)}`,
        `--bp:${pct((L / (100 - W)) * 100)} ${pct((T / (100 - H)) * 100)}`,
      ].join(";");
      const end = x > 1100 ? " lg--end" : "";
      const edge = wave === 2 ? " lg--edge" : "";
      return `<button class="lg${end}${edge}" style="${style}" data-wave="${wave}" aria-label="${name}, ${tag}">
        <span class="lg__face"></span><span class="lg__frame"></span>
        <span class="lg__tag"><em>${tag.replace(" · ", " &nbsp;·&nbsp; ")}</em><strong>${name}</strong></span>
        <span class="lg__card" role="tooltip"><em>Plate ${String(i + 1).padStart(2, "0")} &nbsp;·&nbsp; ${tag}</em><strong>${name}</strong><span>${line}</span><small>${rec}</small></span>
      </button>`;
    }).join("");

    const lgs = $$(".lg", legendsEl);
    const setActive = (el) => {
      lgs.forEach((l) => l.classList.toggle("is-active", l === el));
      hero.classList.toggle("has-active", !!el);
    };
    lgs.forEach((l) => {
      l.addEventListener("mouseenter", () => hero.classList.contains("is-settled") && setActive(l));
      l.addEventListener("mouseleave", () => setActive(null));
      l.addEventListener("focus", () => hero.classList.contains("is-settled") && setActive(l));
      l.addEventListener("blur", () => setActive(null));
      l.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!hero.classList.contains("is-settled")) return;
        setActive(l.classList.contains("is-active") ? null : l);
      });
    });
    document.addEventListener("click", () => setActive(null));
    document.addEventListener("keydown", (e) => e.key === "Escape" && setActive(null));

    // Timeline: 0–0.9s faces arrive · 0.9s room starts filling in · 1.5s camera pulls back while the copy,
    // shade and nav rise with it (one expo-out curve) · 3.3s settled, hover on.
    const ZOOM_MS = 1800, ROOM_MS = 900;
    const root = document.documentElement;
    const countEl = $("#legend-count");
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    let count = 0;
    const bump = () => { count += 1; if (countEl) countEl.textContent = String(count).padStart(2, "0"); };
    let roomAt = 0, zoomAt = 0, done = false;
    const pullBack = () => {
      if (!roomAt) { hero.classList.add("is-room"); roomAt = performance.now(); }
      if (!zoomAt) { hero.classList.add("is-zoom", "is-copy"); zoomAt = performance.now(); root.classList.remove("hero-intro"); }
    };
    const finish = () => {
      hero.classList.remove("is-intro", "is-room");
      hero.classList.add("is-settled");
    };
    const settle = (instant) => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      ["wheel", "touchstart", "keydown"].forEach((ev) => window.removeEventListener(ev, skip));
      lgs.forEach((l) => l.classList.add("is-in"));
      if (countEl) countEl.textContent = "09";
      pullBack();
      if (instant === true) return finish();
      const now = performance.now();
      setTimeout(finish, Math.max(ROOM_MS - (now - roomAt), ZOOM_MS - (now - zoomAt), 0));
    };
    const skip = () => settle(false);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || window.scrollY > 40) {
      settle(true);
    } else {
      root.classList.add("hero-intro");
      hero.classList.add("is-intro");
      // centre outward
      const first = lgs.filter((l) => l.dataset.wave === "1")
        .sort((a, b) => Math.abs(parseFloat(a.style.getPropertyValue("--x")) - 45) - Math.abs(parseFloat(b.style.getPropertyValue("--x")) - 45));
      const rest = lgs.filter((l) => l.dataset.wave === "2");
      const go = () => {
        first.forEach((l, i) => at(120 + i * 110, () => { l.classList.add("is-in"); bump(); }));
        at(900, () => { hero.classList.add("is-room"); roomAt = performance.now(); });
        at(1500, () => {
          pullBack();
          rest.forEach((l, i) => at(i * 90, () => { l.classList.add("is-in"); bump(); }));
        });
        at(1500 + ZOOM_MS, () => settle(false));
      };
      const img = $(".hero__painting", hero);
      // start once the painting has loaded, so faces and room never pop in half-drawn
      let started = false;
      const start = () => { if (!started) { started = true; go(); } };
      if (img.complete && img.naturalWidth) start(); else img.addEventListener("load", start, { once: true });
      setTimeout(start, 3000);
      ["wheel", "touchstart", "keydown"].forEach((ev) => window.addEventListener(ev, skip, { passive: true }));
    }
  }

  /* ---------- land dots: the Figma map grid, smoothed into a finer field for the globe ---------- */
  const DOT_ROWS = ["0000111100000111111000000000001111111111111111111111000", "0111111111101111111111100000111111111111111111111111111", "1111111111110011111110000011111111111111111111111111111", "0011111111111001111000000011111011111111111111111111110", "0001111111110000000000000001111111111111111111111111110", "0000111111100000000000000011111110111111111111111111100", "0000011111100000000000000111111111110111111111111110000", "0000001111000000000000000111111111110001111111111100000", "0000000111000000000000000111111111111000111111100000000", "0000000011000000000000000011111111111000011110000000000", "0000000001111100000000000001111111110000001100100000000", "0000000000111111000000000001111111100000000100110000000", "0000000000011111110000000000111111100000000001111100000", "0000000000001111110000000000111111000000000011111110000", "0000000000001111100000000000011110000000000011111111000", "0000000000001111000000000000011100000000000001111111000", "0000000000001110000000000000001000000000000000111000000", "0000000000001100000000000000000000000000000000000000010", "0000000000011000000000000000000000000000000000000000000", "0000000000010000000000000000000000000000000000000000000"];
  // Smooth the coarse 55×20 Figma grid into a finer field (bilinear sample, threshold) so dots can be small.
  const FINE = 3;
  const coarse = (c, r) => (DOT_ROWS[r] && DOT_ROWS[r][c] === "1" ? 1 : 0);
  const FIELD = [];
  const FC = DOT_ROWS[0].length * FINE, FR = DOT_ROWS.length * FINE;
  for (let fy = 0; fy < FR; fy++) for (let fx = 0; fx < FC; fx++) {
    const u = (fx + 0.5) / FINE - 0.5, v = (fy + 0.5) / FINE - 0.5;
    const c0 = Math.floor(u), r0 = Math.floor(v), du = u - c0, dv = v - r0;
    const val = coarse(c0, r0) * (1 - du) * (1 - dv) + coarse(c0 + 1, r0) * du * (1 - dv) + coarse(c0, r0 + 1) * (1 - du) * dv + coarse(c0 + 1, r0 + 1) * du * dv;
    if (val > 0.42) FIELD.push([fx, fy]);
  }
  // Where the paintings come from, in coarse-grid coordinates.
  const MARKERS = [
    { c: 29.2, r: 1.6, label: "Norway", img: "art-dahl.jpg" },
    { c: 31.3, r: 6.2, label: "Egypt", img: "art-persian.jpg" },
    { c: 35.4, r: 5.4, label: "Iran", img: "art-persian.jpg" },
    { c: 38.6, r: 7.6, label: "India", img: "art-mughal.jpg" },
    { c: 43.2, r: 4.6, label: "China", img: "art-chinese.jpg" },
    { c: 48.6, r: 4.2, label: "Japan", img: "art-hiroshige.jpg" },
  ];
  const reducedMap = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- globe: the same land dots, projected onto a turning sphere ---------- */
  // Figma grid → degrees: columns span ≈ −168°…+178° lon, rows ≈ 75°N…55°S.
  const toLon = (c) => -168 + c * 6.4, toLat = (r) => 75 - r * 6.84;
  const RAD = Math.PI / 180;
  const initGlobe = (el) => {
    const cv = $("canvas", el), ctx = cv.getContext("2d"), card = $(".atlas-card", el);
    const pts = FIELD.map(([fx, fy]) => ({ lon: toLon((fx + 0.5) / FINE - 0.5) * RAD, lat: toLat((fy + 0.5) / FINE - 0.5) * RAD }));
    const mk = MARKERS.map((m) => ({ ...m, lon: toLon(m.c) * RAD, lat: toLat(m.r) * RAD, sx: 0, sy: 0, vis: false }));
    mk.forEach((m) => { const i = new Image(); i.src = "assets/brand/" + m.img; });
    let S = 0, cx = 0, cy = 0, R = 0, yaw = -60 * RAD, tilt = 0, raf = 0, onScreen = false;
    let drag = null, mx = -1e4, my = -1e4, inside = false, active = null;
    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      S = el.getBoundingClientRect().width;
      cv.width = S * dpr; cv.height = S * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = S / 2; cy = S / 2; R = S * 0.4;
      draw();
    };
    const project = (lon, lat) => {
      const l = lon + yaw, cl = Math.cos(lat);
      const x = cl * Math.sin(l), y = Math.sin(lat), z = cl * Math.cos(l);
      const y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
      return [cx + R * x, cy - R * y2, z2];
    };
    const draw = () => {
      ctx.clearRect(0, 0, S, S);
      // rim + dial ticks (the emblem's ring)
      ctx.strokeStyle = "rgba(20,40,42,.35)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.stroke();
      for (let i = 0; i < 120; i++) {
        const a = (i / 120) * 6.2832, long = i % 10 === 0;
        const r1 = R + 10, r2 = R + (long ? 20 : 14);
        ctx.strokeStyle = long ? "rgba(20,40,42,.55)" : "rgba(20,40,42,.22)";
        ctx.beginPath(); ctx.moveTo(cx + r1 * Math.sin(a), cy - r1 * Math.cos(a)); ctx.lineTo(cx + r2 * Math.sin(a), cy - r2 * Math.cos(a)); ctx.stroke();
      }
      ctx.font = "10px 'Geist Mono', monospace"; ctx.fillStyle = "rgba(20,40,42,.6)"; ctx.textAlign = "center";
      ctx.fillText("N", cx, cy - R - 28); ctx.textAlign = "left";
      // land dots, depth-shaded; dots near the cursor brighten
      const base = Math.max(0.7, S / 560);
      for (const p of pts) {
        const [x, y, z] = project(p.lon, p.lat);
        if (z <= 0) continue;
        const near = inside ? Math.max(0, 1 - Math.hypot(mx - x, my - y) / (S * 0.12)) : 0;
        ctx.fillStyle = near > 0.4 ? `rgba(11,79,86,${0.35 + near * 0.6})` : `rgba(20,40,42,${0.12 + z * 0.4 + near * 0.4})`;
        ctx.beginPath(); ctx.arc(x, y, base * (0.6 + z * 0.6) * (1 + near), 0, 6.2832); ctx.fill();
      }
      // markers
      for (const m of mk) {
        const [x, y, z] = project(m.lon, m.lat);
        m.sx = x; m.sy = y; m.vis = z > 0.15;
        if (!m.vis) continue;
        const on = m === active;
        ctx.globalAlpha = Math.min(1, 0.55 + z * 1.1);
        // clear the dot field under the marker so the ring reads
        ctx.fillStyle = "#f3efe6";
        ctx.beginPath(); ctx.arc(x, y, on ? 15 : 11, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = `rgba(20,40,42,${on ? 0.55 : 0.28})`;
        ctx.beginPath(); ctx.arc(x, y, on ? 14 : 10, 0, 6.2832); ctx.stroke();
        ctx.fillStyle = on ? "#2f37a8" : "#f3efe6"; ctx.strokeStyle = on ? "#2f37a8" : "rgba(20,40,42,.85)";
        ctx.beginPath(); ctx.arc(x, y, on ? 5 : 4, 0, 6.2832); ctx.fill(); ctx.stroke();
        // label on a paper tag, so dots never run through the letters
        const label = m.label.toUpperCase();
        ctx.font = "500 11px 'Geist Mono', monospace";
        const tw = ctx.measureText(label).width, lx = x + (on ? 19 : 15), lh = 20;
        ctx.fillStyle = "rgba(243,239,230,.96)"; ctx.strokeStyle = on ? "rgba(20,40,42,.45)" : "rgba(20,40,42,.18)";
        ctx.beginPath(); ctx.rect(lx - 0.5, y - lh / 2 - 0.5, tw + 13, lh); ctx.fill(); ctx.stroke();
        ctx.fillStyle = on ? "#14282a" : "rgba(20,40,42,.88)";
        ctx.fillText(label, lx + 6, y + 4);
        ctx.font = "10px 'Geist Mono', monospace";
        ctx.globalAlpha = 1;
      }
    };
    const pick = () => {
      let best = null, bd = 30;
      mk.forEach((m) => { if (!m.vis) return; const d = Math.hypot(mx - m.sx, my - m.sy); if (d < bd) { bd = d; best = m; } });
      if (best !== active) {
        active = best;
        if (best) { $("img", card).src = "assets/brand/" + best.img; $("figcaption", card).textContent = best.label.toUpperCase(); }
        card.classList.toggle("is-on", !!best);
      }
      if (active) {
        const flip = active.sx > S * 0.6;
        card.style.transform = `translate(${active.sx + (flip ? -232 : 22)}px, ${Math.max(0, active.sy - 120)}px)`;
      }
    };
    const loop = () => {
      if (!drag && !active && !reducedMap) yaw += 0.0008;
      if (!drag) tilt *= 0.96;
      draw(); if (inside) pick();
      raf = onScreen ? requestAnimationFrame(loop) : 0;
    };
    el.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, yaw, tilt }; el.setPointerCapture(e.pointerId); el.classList.add("is-dragging"); });
    el.addEventListener("pointermove", (e) => {
      const b = el.getBoundingClientRect(); mx = e.clientX - b.left; my = e.clientY - b.top; inside = true;
      if (drag) {
        yaw = drag.yaw + (e.clientX - drag.x) * 0.006;
        tilt = Math.max(-0.3, Math.min(0.3, drag.tilt + (e.clientY - drag.y) * 0.003));
      }
      if (!raf) { draw(); pick(); }
    });
    const end = () => { drag = null; el.classList.remove("is-dragging"); };
    el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end);
    el.addEventListener("pointerleave", () => { inside = false; active = null; card.classList.remove("is-on"); if (!raf) draw(); });
    new ResizeObserver(layout).observe(el);
    new IntersectionObserver((en) => { onScreen = en[0].isIntersecting; if (onScreen && !raf) raf = requestAnimationFrame(loop); }).observe(el);
  };
  $$("[data-globe]").forEach(initGlobe);

  /* ---------- industries: painting follows the hovered field ---------- */
  const inds = $$("#inds-list .ind");
  const indImgs = $$(".inds2__media img");
  const showInd = (key) => {
    inds.forEach((a) => a.classList.toggle("is-on", a.dataset.ind === key));
    indImgs.forEach((im) => im.classList.toggle("is-on", im.dataset.ind === key));
  };
  inds.forEach((a) => {
    a.addEventListener("mouseenter", () => showInd(a.dataset.ind));
    a.addEventListener("focus", () => showInd(a.dataset.ind));
  });

  /* ---------- roles ---------- */
  // [title, description, location, hours, level, rate]
  const ROLES = {
    General: [
      ["AI Data Quality Analyst", "Review and rate AI outputs from anywhere — no prior AI experience needed.", "Remote", "10–20 hrs/wk", "Entry level", 45],
      ["Prompt Writer", "Craft creative prompts that push the boundaries of machine reasoning.", "Remote", "Flexible hours", "Mid level", 50],
      ["Subject-Matter Reviewer", "Bring deep expertise in your field to review and validate model outputs.", "Remote", "Project-based", "Senior", 65],
      ["Model Response Ranker", "Compare competing AI answers and judge which one a real user would trust.", "Remote", "10–20 hrs/wk", "Entry level", 48],
      ["Red Team Analyst", "Probe models for unsafe, biased or evasive behaviour before they ship.", "Remote", "Flexible hours", "Mid level", 62],
      ["Physical AI Data Collector", "Wear the head-mount camera and capture real-world demonstrations for embodied AI.", "On-site", "Project-based", "No experience needed", 40],
    ],
    Coding: [
      ["Software Engineer — Code Quality", "Review agent pull requests and write reference solutions for coding tasks.", "Remote", "15–25 hrs/wk", "Mid–Senior", 60],
      ["AI Annotation Expert — LLM Reasoning", "Author frontier evaluation questions that push the strongest models past their limits.", "Remote", "Flexible hours", "Mid level", 55],
      ["Trajectory & PR Reviewer", "Trace a model’s reasoning step by step and score where it holds up — or breaks down.", "Remote", "Project-based", "Senior", 58],
      ["Systems & Infrastructure Reviewer", "Assess model reasoning on distributed systems, concurrency and performance.", "Remote", "10–20 hrs/wk", "Senior", 72],
      ["Security Code Auditor", "Find the vulnerabilities that model-written code quietly introduces.", "Remote", "Project-based", "5+ yrs experience", 78],
      ["Data & ML Engineering Expert", "Evaluate pipelines, training code and evaluation harnesses written by agents.", "Remote", "Flexible hours", "Mid–Senior", 68],
    ],
    Legal: [
      ["Legal Reasoning Analyst", "Test how models reason through statutes, precedent and legal argument.", "Remote", "Project-based", "JD / LLB", 85],
      ["Contract Review Specialist", "Review model-drafted clauses and flag risk, ambiguity and omissions.", "Remote", "10–20 hrs/wk", "5+ yrs practice", 80],
      ["Compliance & Policy Reviewer", "Evaluate model outputs against regulatory and policy requirements.", "Remote", "Flexible hours", "Senior", 75],
      ["Litigation Reasoning Expert", "Score how models construct arguments, cite authority and handle counterclaims.", "Remote", "Flexible hours", "Litigator", 88],
      ["IP & Patent Reviewer", "Check claim construction, prior art reasoning and patentability analysis.", "Remote", "Project-based", "Patent attorney", 92],
      ["Corporate Law Task Author", "Write the transactional problems that expose where models fall short.", "Remote", "10–20 hrs/wk", "Senior", 82],
    ],
    Medical: [
      ["Clinical AI Specialist", "Review model outputs for clinical accuracy and flag unsafe advice.", "Remote", "Project-based", "MD / MBBS", 90],
      ["Diagnostic Review Expert", "Assess diagnostic reasoning and imaging interpretation across specialties.", "Remote", "10–20 hrs/wk", "Specialist", 85],
      ["Pharmacology Validator", "Verify dosing, interactions and contraindications in generated guidance.", "Remote", "Flexible hours", "PharmD / PhD", 80],
      ["Surgical & Procedural Reviewer", "Evaluate procedural reasoning, indications and peri-operative guidance.", "Remote", "Project-based", "Surgeon", 95],
      ["Mental Health Safety Reviewer", "Assess how models respond in sensitive clinical and crisis contexts.", "Remote", "Flexible hours", "Licensed clinician", 82],
      ["Medical Literature Validator", "Verify citations, study design claims and evidence grading in model output.", "Remote", "10–20 hrs/wk", "PhD / MD", 78],
    ],
    Finance: [
      ["Finance & Accounting Task Author", "Design expert reconciliation tasks that challenge advanced AI agents.", "Remote", "Project-based", "CA / CFA", 95],
      ["Quantitative Modelling Reviewer", "Pressure-test valuation and risk models produced by frontier systems.", "Remote", "Flexible hours", "Senior", 90],
      ["Audit & Reconciliation Expert", "Check statements, ledgers and controls the way a real audit would.", "Remote", "10–20 hrs/wk", "5+ yrs experience", 78],
      ["Markets & Trading Analyst", "Judge model reasoning on derivatives, hedging and market microstructure.", "Remote", "Project-based", "Buy-side experience", 98],
      ["Financial Reporting Reviewer", "Validate IFRS and GAAP treatment in model-generated statements.", "Remote", "Flexible hours", "CA / CPA", 85],
      ["Risk & Compliance Expert", "Stress-test how models handle regulatory limits and reporting duties.", "Remote", "10–20 hrs/wk", "Senior", 88],
    ],
  };

  const ART = { General: "research", Coding: "software", Legal: "finance", Medical: "medicine", Finance: "finance" };
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const tabsEl = $("#optabs");
  const rolesEl = $("#roles");
  const cats = Object.keys(ROLES);

  tabsEl.innerHTML = cats
    .map((c, i) => `<button class="optab${i === 0 ? " is-active" : ""}" role="tab" id="tab-${c}" aria-controls="panel-${c}" aria-selected="${i === 0}">${c}<sup>${ROLES[c].length}</sup></button>`)
    .join("");

  rolesEl.innerHTML = cats
    .map((c, i) => {
      const cards = ROLES[c]
        .map(([t, d, loc, hrs, lvl, rate], j) => `
          <a class="role" href="apply.html" style="animation-delay:${j * 40}ms">
            <span class="role__art plate" data-caption="off" data-focus-y="0.52" data-plate="ind-${/Physical AI/.test(t) ? "physical" : ART[c]}" aria-hidden="true"><img class="plate__img" src="assets/brand/ind-${/Physical AI/.test(t) ? "physical" : ART[c]}.jpg" alt="" loading="lazy"></span>
            <span class="role__id"><span>${c.slice(0, 3).toUpperCase()}-${String(j + 1).padStart(2, "0")}</span><span><i class="ph ph-map-pin"></i> ${loc}</span></span>
            <h3>${esc(t)}</h3>
            <p>${esc(d)}</p>
            <div class="role__tags"><span><i class="ph ph-clock"></i>${hrs}</span><span><i class="ph ph-graduation-cap"></i>${esc(lvl)}</span></div>
            <div class="role__foot">
              <div class="role__rate"><strong>$${rate}/hr</strong><span>Fixed rate</span></div>
              <span class="role__go" aria-hidden="true"><i class="ph ph-arrow-right"></i></span>
            </div>
          </a>`)
        .join("");
      return `<div class="roles" role="tabpanel" id="panel-${c}" aria-labelledby="tab-${c}"${i === 0 ? "" : " hidden"}>${cards}</div>`;
    })
    .join("");

  const tabs = $$(".optab", tabsEl);
  const select = (idx) => {
    tabs.forEach((t, i) => {
      t.classList.toggle("is-active", i === idx);
      t.setAttribute("aria-selected", String(i === idx));
      $("#panel-" + cats[i]).hidden = i !== idx;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(i));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const n = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      tabs[n].focus();
      select(n);
    });
  });

  /* ---------- testimonials ---------- */
  // [name, role, school, quote, video poster]
  const VOICES = [
    ["Ananya S.", "Data Scientist", "IISc", "Deccan gave me the flexibility to learn, work and earn at my own pace — with fair pay and constant learning alongside my degree.", "art-mughal.jpg"],
    ["Ponrajalaxmi R.", "Architecture", "NIT Tiruchirappalli", "My journey has been remarkable. I've grown enormously in evaluation and model work, with great support — and it fits around my studies."],
    ["Sasikiran K.", "Engineering", "NIT Warangal", null],
    ["Karthik M.", "Physician", "AIIMS", "I've worked as a prompter, writer and reviewer across many projects. The income is real, payments are always on time, and I choose my own hours.", "art-dahl.jpg"],
    ["Rahul G.", "Linguistics", "University of Delhi", "The calibre of the projects — and the peers around me — is unlike anything I've found. I contribute alongside my research and it's genuinely rewarding."],
    ["Meera V.", "Physics PhD", "IIT Bombay", null],
  ];
  const initials = (n) => n.split(/\s+/).map((p) => p[0]).join("").replace(".", "").slice(0, 2).toUpperCase();
  const card = ([name, role, school, quote, poster], dup) => {
    const who = `<div class="vcard__who"><span class="vcard__mono"><img src="assets/brand/bracket.svg" alt="">${initials(name)}</span><div><strong>${name}</strong><span>${role} · ${school}</span></div></div>`;
    if (poster) {
      return `<article class="vcard vcard--video"${dup ? ' aria-hidden="true"' : ""}>
        <div class="vcard__media"><img class="bg" src="assets/brand/${poster}" alt="" loading="lazy"><span class="vcard__tag">Video</span>
          <button class="vcard__play" aria-label="Play video testimonial"${dup ? ' tabindex="-1"' : ""}><i class="ph-fill ph-play"></i></button></div>
        <span class="vcard__q">“</span><blockquote>${quote}</blockquote>${who}</article>`;
    }
    return `<article class="vcard"${dup ? ' aria-hidden="true"' : ""}><span class="vcard__q">“</span><blockquote>${quote}</blockquote>${who}</article>`;
  };
  // Sasikiran K. and Meera V. are photo-only in the content (no quote), so they wait for photos.
  const withQuotes = VOICES.filter((v) => v[3]);
  const rail = $("#voices");
  rail.innerHTML = withQuotes.map((v) => card(v, false)).join("") + withQuotes.map((v) => card(v, true)).join("");

  /* ---------- footer: the rooftop pins; content rises out of the sky, then the rest arrives ---------- */
  const footer = $("#footer");
  if (footer) {
    const clamp01 = (v) => Math.min(1, Math.max(0, v));
    const onFooter = () => {
      const total = footer.offsetHeight - window.innerHeight;
      if (total < 40) return;                       // static layout (phones, reduced motion)
      const raw = -footer.getBoundingClientRect().top / total;   // negative while the footer is still arriving
      const p = clamp01(raw);
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      footer.style.setProperty("--p", p.toFixed(4));
      // reveal starts as the footer rises into view, not after the pin has run
      footer.style.setProperty("--pa", ease(clamp01((raw + 0.32) / 0.4)).toFixed(4));
      footer.style.setProperty("--pb", ease(clamp01((raw + 0.02) / 0.22)).toFixed(4));
    };
    onFooter();
    window.addEventListener("scroll", onFooter, { passive: true });
    window.addEventListener("resize", onFooter);
  }

  /* ---------- rooftop stars: each domain is a star tied to the instrument ---------- */
  const starWrap = $("#rt-stars");
  if (starWrap) {
    const line = $("#rt-line"), card = $("#rt-card");
    const HUB = { x: 35.98, y: 53.0 };               // centre of the armillary dial
    const stars = $$(".rt-star", starWrap);
    const show = (st) => {
      stars.forEach((s) => s.classList.toggle("is-on", s === st));
      starWrap.classList.toggle("has-on", !!st);
      card.classList.toggle("is-on", !!st);
      if (!st) return;
      const x = +st.dataset.x, y = +st.dataset.y;
      line.setAttribute("x1", x); line.setAttribute("y1", y);
      line.setAttribute("x2", HUB.x); line.setAttribute("y2", HUB.y);
      const list = ROLES[st.dataset.cat];
      const rates = list ? list.map((r) => r[5]) : [];
      $("em", card).textContent = list ? `${list.length} open roles · $${Math.min(...rates)}–${Math.max(...rates)}/hr` : "Open roles";
      $("strong", card).textContent = st.dataset.name;
      $("span", card).textContent = list ? list.slice(0, 2).map((r) => r[0]).join(" · ") : "";
      const b = starWrap.getBoundingClientRect();
      const px = (x / 100) * b.width, py = (y / 100) * b.height;
      const flip = x > 70;
      card.style.setProperty("--cx", `${flip ? px - 236 : px + 18}px`);
      card.style.setProperty("--cy", `${py + 22}px`);
    };
    stars.forEach((s) => {
      s.addEventListener("mouseenter", () => show(s));
      s.addEventListener("focus", () => show(s));
      s.addEventListener("mouseleave", () => show(null));
      s.addEventListener("blur", () => show(null));
    });
  }

  /* ---------- reveal ---------- */
  // footer links roll to a muted copy on hover
  $$(".flinks a").forEach((a) => { const t = a.textContent; a.innerHTML = `<span>${t}</span><span aria-hidden="true">${t}</span>`; });
  if (window.Plates) window.Plates.init();
  const reveals = $$(".reveal, .footer__stage, .plate");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  /* how-it-works: light the dots as the row enters */
  const steps = $$("#steps .step");
  if ("IntersectionObserver" in window && steps.length) {
    const so = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      steps.forEach((s, i) => setTimeout(() => s.classList.add("is-on"), 300 + i * 260));
      so.disconnect();
    }, { threshold: 0.4 });
    so.observe($("#steps"));
  }

  /* ---------- faq: one open at a time ---------- */
  const qas = $$(".qa");
  qas.forEach((d) => d.addEventListener("toggle", () => {
    if (d.open) qas.forEach((o) => { if (o !== d) o.open = false; });
  }));

  /* ---------- newsletter ---------- */
  const form = $("#news");
  const ok = $("#news-ok");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("input", form);
    if (!input.checkValidity() || !input.value) {
      ok.textContent = "Enter a valid email address.";
      input.focus();
      return;
    }
    ok.textContent = "You're on the list.";
    form.reset();
  });
})();
