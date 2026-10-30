/* Deccan Experts landing: role tabs, the how-it-works card, FAQ and grow-in images.
   The stage (hiring.js), culture-code grid (values.js), reel (team.js) and dial / office / reveals (about.js) are shared. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "power3.out";

  /* ---------- roles: five categories, six roles each ---------- */

  // [title, line, where, hours, level, rate]
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

  const tabs = $(".ex-tabs"), jobs = $(".ex-jobs");
  if (tabs && jobs) {
    const ink = $(".ex-tabs__ink", tabs);
    const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    // at rest a card shows level, title and rate; the description, terms and Apply open on hover / focus
    const card = ([t, d, where, hrs, lvl, rate]) => `<a class="ex-job" href="#apply">
        <span class="ex-job__lvl">${lvl}</span>
        <h4>${esc(t)}</h4>
        <span class="ex-job__more"><span><span class="ex-job__d">${esc(d)}</span><span class="ex-job__meta">${where} · ${hrs}</span></span></span>
        <span class="ex-job__foot"><span class="ex-job__rate">$${rate}<small>/hr</small></span><span class="ex-job__go"><em>Apply</em><img src="img/arrow-ne.svg" alt=""></span></span>
      </a>`;
    // the grid version closes the role grid with the sign-up call instead of a separate strip
    const SIGNUP = `<div class="ex-jobs__cta"><p>These are just a few of the roles open right now. Sign up to see every project matched to your expertise.</p><a class="hx__cta hx__cta--a" href="#apply">Sign up to explore all roles <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l5 5-5 5M8 3l5 5-5 5"/></svg></a></div>`;
    const names = Object.keys(ROLES);
    names.forEach((n, i) => tabs.insertAdjacentHTML("beforeend",
      `<button role="tab" id="ex-tab-${i}" aria-selected="${i ? "false" : "true"}" aria-controls="ex-jobs">${n}</button>`));
    jobs.id = "ex-jobs";
    const btns = $$("button", tabs);
    let cur = -1;
    const moveInk = () => {
      const b = btns[Math.max(cur, 0)];
      ink.style.width = b.offsetWidth + "px";
      ink.style.transform = `translateX(${b.offsetLeft}px)`;
    };
    const show = (i, animate) => {
      if (i === cur) return;
      cur = i;
      btns.forEach((b, k) => b.setAttribute("aria-selected", k === i));
      jobs.setAttribute("aria-labelledby", btns[i].id);
      moveInk();
      const fill = () => {
        jobs.innerHTML = ROLES[names[i]].map(card).join("") + SIGNUP;
        if (animate && window.gsap && !REDUCED)
          gsap.fromTo($$(".ex-job", jobs), { opacity: 0, y: 18, filter: "blur(8px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: .9, ease: EASE, stagger: .05, clearProps: "filter" });
      };
      if (animate && window.gsap && !REDUCED && jobs.children.length)
        gsap.to($$(".ex-job", jobs), { opacity: 0, y: -8, filter: "blur(6px)", duration: .3, ease: "power2.in", stagger: .02, onComplete: fill });
      else fill();
    };
    btns.forEach((b, i) => b.addEventListener("click", () => show(i, true)));
    tabs.addEventListener("keydown", e => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      const n = (cur + d + btns.length) % btns.length;
      show(n, true); btns[n].focus();
    });
    show(0, false);
    addEventListener("resize", moveInk);
    document.fonts && document.fonts.ready.then(moveInk);
  }

  /* ---------- images grow into place as they scroll in (data-grow = starting scale) ---------- */

  const grow = $$("[data-grow]");
  if (grow.length && !REDUCED) {
    let ticking = false;
    const paint = () => {
      ticking = false;
      const vh = innerHeight;
      grow.forEach(el => {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * .95 - r.top) / (vh * .9)));
        const from = +el.dataset.grow, e = p * p * (3 - 2 * p);
        el.style.transform = `scale(${from + (1 - from) * e})`;
      });
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    addEventListener("resize", paint);
    paint();
  }

  /* ---------- FAQ accordion ---------- */

  /* ---------- the work: clicking a row opens it and plays its task in the panel ---------- */
  $$("[data-tw]").forEach(tw => {
    const rows = $$(".tw__r", tw), scenes = $$(".tw__sc", tw);
    rows.forEach((r, i) => $(".tw__q", r).addEventListener("click", () => {
      rows.forEach((x, k) => { x.classList.toggle("is-on", k === i); $(".tw__q", x).setAttribute("aria-expanded", k === i); });
      scenes.forEach((s, k) => s.classList.toggle("is-on", k === i));
    }));
  });

  $$(".qa").forEach(qa => {
    const q = $(".qa__q", qa);
    q.addEventListener("click", () => {
      const open = !qa.classList.contains("is-open");
      qa.classList.toggle("is-open", open);
      q.setAttribute("aria-expanded", open);
    });
  });



  /* ---------- testimonials: the wall's columns drift at different speeds as it scrolls by ---------- */

  const drift = $$("[data-drift]");
  if (drift.length && !REDUCED && matchMedia("(min-width: 821px)").matches) {
    let ticking = false;
    const paint = () => {
      ticking = false;
      drift.forEach(col => {
        const r = col.parentElement.getBoundingClientRect();
        const p = (innerHeight / 2 - (r.top + r.height / 2)) * +col.dataset.drift;
        col.style.transform = `translateY(${p.toFixed(1)}px)`;
      });
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    paint();
  }


  /* ---------- Illos drawings loop while they are on screen and pause when they are not ---------- */
  if (!REDUCED) {
    $$("[data-illos]").forEach(el => {
      el.style.setProperty("--illos-play", "paused");
      new IntersectionObserver(entries => entries.forEach(e => el.style.setProperty("--illos-play", e.isIntersecting ? "running" : "paused"))).observe(el);
    });
  }

  /* ---------- how it works: the card nearest the middle of the screen is the active step; the arc turns to it ---------- */

  const how = $(".how3");
  if (how) {
    const cards = $$(".h3c", how), lbls = $$(".arc__lbl", how), rot = $(".arc__rot", how);
    const STEP = 15, R = 560;              // degrees between labels; ring radius in the svg's units (centre sits off to the left)
    // tick ring + two faint orbits, drawn once
    if (rot) {
      let g = `<circle r="${R}" stroke="rgba(255,255,255,.1)"/><circle r="${R - 150}" stroke="rgba(255,255,255,.05)"/><circle r="${R - 300}" stroke="rgba(255,255,255,.04)"/>`;
      for (let a = 0; a < 360; a += 1.5) {
        const big = a % 15 === 0, r1 = R + 14, r2 = R + (big ? 34 : 24), c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180);
        g += `<line x1="${(c * r1).toFixed(1)}" y1="${(s * r1).toFixed(1)}" x2="${(c * r2).toFixed(1)}" y2="${(s * r2).toFixed(1)}" stroke="rgba(255,255,255,${big ? .16 : .07})"/>`;
      }
      rot.innerHTML = g;
    }
    const arc = $(".arc", how);
    const st = { v: 0 };
    const place = () => {
      const h = arc.clientHeight, scale = 1200 / 1200;          // svg is drawn at 1:1 px
      const cx = -380, cy = h / 2;                                // ring centre in .arc coordinates (its right edge lands at x=180)
      lbls.forEach((l, k) => {
        const a = (k - st.v) * STEP * Math.PI / 180, x = cx + Math.cos(a) * (R + 74) * scale, y = cy + Math.sin(a) * (R + 74) * scale;
        const li = l.parentElement; li.style.transform = `translate(${x.toFixed(1)}px, ${(y - h / 2).toFixed(1)}px)`;
        l.style.opacity = l.classList.contains("is-on") ? "" : Math.max(.08, .38 - Math.abs(k - st.v) * .1);
      });
      if (rot) rot.setAttribute("transform", `rotate(${(-st.v * STEP).toFixed(2)})`);
    };
    let cur = -1;
    const set = i => {
      if (i === cur) return;
      cur = i;
      cards.forEach((c, k) => c.classList.toggle("is-on", k === i));
      lbls.forEach((l, k) => l.classList.toggle("is-on", k === i));
      if (window.gsap && !REDUCED) gsap.to(st, { v: i, duration: 1, ease: "power3.inOut", onUpdate: place });
      else { st.v = i; place(); }
    };
    const pick = () => {
      const mid = innerHeight / 2;
      let best = 0, bd = Infinity;
      cards.forEach((c, k) => { const r = c.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid); if (d < bd) { bd = d; best = k; } });
      set(best);
    };
    lbls.forEach((l, k) => l.addEventListener("click", () => {
      const r = cards[k].getBoundingClientRect();
      scrollTo({ top: scrollY + r.top + r.height / 2 - innerHeight / 2, behavior: "smooth" });
    }));
    let ticking = false;
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; pick(); }); } }, { passive: true });
    addEventListener("resize", place);
    set(0); place(); pick();
  }


  /* ---------- pins: team.js creates the reel's pin before about.js creates the dial's, though the dial sits
     above it on this page — re-sort by page order so the reel's start includes the dial's pin spacing ---------- */
  if (window.ScrollTrigger) {
    const resort = () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); };
    resort();
    addEventListener("load", resort);
  }
})();
