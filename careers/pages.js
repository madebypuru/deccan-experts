/* Deccan Experts inner pages. */
(() => {
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scrubbed statement: as its section scrolls through its pinned screen, each word goes from dim and blurred to
     sharp, in reading order, a few words overlapping so it reads as one sweep. ---------- */
  document.querySelectorAll("[data-scrub]").forEach((el) => {
    // wrap each word (keeping <em> and its italics) in a span
    const words = [];
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.append(t); return; }
          const w = document.createElement("span");
          w.className = "w";
          w.textContent = t;
          words.push(w);
          frag.append(w);
        });
        n.replaceWith(frag);
      } else walk(n);
    });
    walk(el);
    if (REDUCED) return;

    const sec = el.closest("section");
    const SPAN = 4; // how many words are mid-reveal at once
    let raf = 0;
    const paint = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight) / 0.8)); // done by 80% of the hold
      const head = p * (words.length + SPAN);
      words.forEach((w, i) => {
        const t = Math.min(1, Math.max(0, (head - i) / SPAN));
        w.style.opacity = (0.12 + 0.88 * t).toFixed(3);
        w.style.filter = t >= 1 ? "none" : `blur(${((1 - t) * 6).toFixed(2)}px)`;
      });
    };
    const ask = () => { if (!raf) raf = requestAnimationFrame(paint); };
    addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask);
    paint();
  });
  /* ---------- drawn timelines: start drawing once the line is well into view ---------- */
  const draws = document.querySelectorAll("[data-draw]");
  if (draws.length) {
    if (REDUCED) draws.forEach((d) => d.classList.add("is-in"));
    else {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }), { rootMargin: "0px 0px -25% 0px" });
      draws.forEach((d) => io.observe(d));
    }
  }
  /* ---------- sideways strips: the section is as tall as the strip is wide, and scrolling through it slides the strip
     from its start to its end while the screen holds ---------- */
  document.querySelectorAll("[data-hscroll]").forEach((sec) => {
    const track = sec.querySelector("[data-hscroll-track]");
    const win = track.parentElement;
    let dist = 0, raf = 0;
    const measure = () => {
      const pad = parseFloat(getComputedStyle(win).paddingLeft) || 0;
      dist = Math.max(0, track.scrollWidth + pad * 2 - innerWidth);
      sec.style.height = `${innerHeight + dist}px`;
      paint();
    };
    const paint = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const p = dist ? Math.min(1, Math.max(0, -r.top / dist)) : 0;
      track.style.transform = `translateX(${(-p * dist).toFixed(1)}px)`;
    };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
    addEventListener("resize", measure);
    measure();
  });
  /* ---------- year ruler: one year open at a time; hovering a year opens it (the last one hovered stays open), arrows step ---------- */
  document.querySelectorAll("[data-years]").forEach((list) => {
    const years = [...list.children];
    const sec = list.closest("section");
    const arws = sec.querySelectorAll("[data-step]");
    let cur = years.findIndex((y) => y.classList.contains("is-on"));
    const open = (i) => {
      cur = Math.max(0, Math.min(years.length - 1, i));
      years.forEach((y, k) => {
        y.classList.toggle("is-on", k === cur);
        y.querySelector("button").setAttribute("aria-pressed", k === cur);
      });
      arws.forEach((a) => { a.disabled = (+a.dataset.step < 0 && cur === 0) || (+a.dataset.step > 0 && cur === years.length - 1); });
    };
    // pointing at a year opens it, and it stays open after the pointer leaves; click and keyboard do the same
    years.forEach((y, i) => {
      y.addEventListener("pointerenter", () => open(i));
      y.querySelector("button").addEventListener("click", () => open(i));
      y.querySelector("button").addEventListener("focus", () => open(i));
    });
    arws.forEach((a) => a.addEventListener("click", () => open(cur + +a.dataset.step)));
    open(cur);
  });
  /* ---------- blog filters: show one topic's posts, or all of them ---------- */
  document.querySelectorAll("[data-blog]").forEach((grid) => {
    const tabs = [...grid.closest("section").querySelectorAll(".bl-tab")];
    const cards = [...grid.querySelectorAll(".bl-card")];
    tabs.forEach((t) => t.addEventListener("click", () => {
      const cat = t.dataset.cat;
      tabs.forEach((x) => { x.classList.toggle("is-on", x === t); x.setAttribute("aria-pressed", x === t); });
      cards.forEach((c) => { c.hidden = cat !== "all" && c.dataset.cat !== cat; });
      grid.classList.toggle("is-filtered", cat !== "all");
    }));
  });
  /* ---------- On this page: mark the section you're reading ---------- */
  const toc = document.querySelector(".hc-toc");
  if (toc) {
    const links = [...toc.querySelectorAll("a")];
    const secs = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    let raf = 0;
    const spy = () => {
      raf = 0;
      const line = innerHeight * 0.3;
      let cur = 0;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) cur = i; });
      links.forEach((a, i) => a.classList.toggle("is-on", i === cur));
    };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(spy); }, { passive: true });
    spy();
  }
})();
