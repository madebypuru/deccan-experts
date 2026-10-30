/* Why Deccan — each tile plays its little story once when it scrolls into view; a spotlight follows the cursor. */
(() => {
  const grid = document.querySelector("[data-why]");
  if (!grid) return;
  const $ = (s, el = grid) => el.querySelector(s);
  const $$ = (s, el = grid) => [...el.querySelectorAll(s)];
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const G = window.gsap && !REDUCED ? window.gsap : null;
  const onView = (el, fn) => new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { threshold: .35 }).observe(el);

  // spotlight
  $$(".wy").forEach(t => t.addEventListener("pointermove", e => {
    const r = t.getBoundingClientRect();
    t.style.setProperty("--mx", e.clientX - r.left + "px");
    t.style.setProperty("--my", e.clientY - r.top + "px");
  }));

  // A · the domain lead's note lands, you start typing, then reply
  const a = $(".wy--a");
  if (a) {
    const lead = $(".wy-msg--lead", a), you = $(".wy-msg--you", a);
    onView(a, () => {
      if (!G) { a.classList.add("is-replied"); return; }
      G.to(lead, { opacity: 1, y: 0, duration: .7, ease: "power3.out", delay: .5 });
      G.to(you, { opacity: 1, y: 0, duration: .7, ease: "power3.out", delay: 1.6 });
      G.delayedCall(3.4, () => a.classList.add("is-replied"));
    });
  }

  // B · your hours fill in: a few blocks a day, more on some days, none on Sunday
  const b = $(".wy--b");
  if (b) {
    const PICK = { 0: [1, 2, 3, 8, 9], 1: [6, 7, 8, 9], 2: [1, 2, 3], 3: [7, 8, 9, 10], 4: [2, 3, 4, 5], 5: [3, 4] };
    const cells = [];
    Object.entries(PICK).forEach(([d, hs]) => hs.forEach(h => cells.push($(`[data-c="${d}-${h}"]`, b))));
    const hrs = $("[data-hrs]", b);
    onView(b, () => {
      const order = cells.sort(() => Math.random() - .5);
      if (!G) { order.forEach(c => c.classList.add("is-on")); hrs.textContent = order.length; return; }
      order.forEach((c, i) => G.delayedCall(.3 + i * .09, () => { c.classList.add("is-on"); hrs.textContent = i + 1; }));
    });
  }

  // C · cycle 1 lands as paid, cycle 2 shows processing, the total counts up
  const c = $(".wy--c");
  if (c) {
    const rows = $$(".wy-pay__row", c), usd = $("[data-usd]", c);
    const fmt = v => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    onView(c, () => {
      if (!G) { usd.textContent = fmt(1240); return; }
      rows.forEach((r, i) => G.to(r, { opacity: 1, y: 0, duration: .6, ease: "power3.out", delay: .3 + i * .5 }));
      const n = { v: 0 };
      G.to(n, { v: 1240, duration: 1.6, ease: "power2.out", delay: .5, onUpdate: () => (usd.textContent = fmt(n.v)) });
    });
  }

  // D · a hundred applicants fade back; one stays lit
  const d = $(".wy--d");
  if (d) {
    const dots = $$(".wy-few__dots i", d), one = dots[46];
    onView(d, () => {
      one.classList.add("is-one");
      if (!G) { dots.forEach(x => x !== one && x.classList.add("is-dim")); return; }
      dots.filter(x => x !== one).sort(() => Math.random() - .5)
        .forEach((x, i) => G.delayedCall(.4 + i * .012, () => x.classList.add("is-dim")));
    });
  }
})();
