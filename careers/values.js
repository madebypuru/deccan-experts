/* Culture Code — Metalab-style columns.
   Auto-advances while on screen; hovering or tapping takes over. */
(() => {
  if (!window.gsap) return;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const AUTO = 4.6;

  // auto-advance while visible; go(i) from interactions restarts the clock
  function driver(el, n, onGo, progressOf) {
    let cur = -1, prog = null, seen = false;
    const go = i => {
      i = (i + n) % n;
      if (i === cur) return;
      const prev = cur; cur = i;
      onGo(i, prev);
      prog && prog.kill();
      const target = progressOf ? progressOf(i) : {};
      prog = gsap.fromTo(target, { "--p": 0 }, { "--p": 1, duration: AUTO, ease: "none", onComplete: () => go(cur + 1) });
      if (!seen || REDUCED) prog.pause();
    };
    new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && cur < 0) go(0);
      else if (prog) seen && !REDUCED ? prog.resume() : prog.pause();
    }, { threshold: .35 }).observe(el);
    return go;
  }

  /* ---------- Our Culture Code ---------- */
  const cc = document.querySelector("[data-cc]");
  if (cc) {
    const cols = [...cc.querySelectorAll(".cc__col")];
    const rules = cols.map(c => c.querySelector(".cc__rule b"));
    const cursor = cc.querySelector(".cc__cursor");
    const go = driver(cc, cols.length, (i, prev) => {
      cols.forEach((c, k) => c.classList.toggle("is-on", k === i));
      rules.forEach((r, k) => k !== i && gsap.to(r, { "--p": 0, duration: .4, ease: "power2.out" }));
      cursor.textContent = String(i + 1).padStart(2, "0");
    }, i => rules[i]);
    cols.forEach((c, i) => { c.addEventListener("pointerenter", e => e.pointerType !== "touch" && go(i)); c.addEventListener("click", () => go(i)); });

    // Metalab's following ring, carrying the column number
    const qx = gsap.quickTo(cursor, "x", { duration: .45, ease: "power3.out" });
    const qy = gsap.quickTo(cursor, "y", { duration: .45, ease: "power3.out" });
    cc.addEventListener("pointermove", e => {
      if (e.pointerType === "touch") return;
      const r = cc.getBoundingClientRect();
      qx(e.clientX - r.left); qy(e.clientY - r.top);
    });
    cc.addEventListener("pointerenter", e => {
      if (e.pointerType === "touch") return;
      const r = cc.getBoundingClientRect();
      gsap.set(cursor, { x: e.clientX - r.left, y: e.clientY - r.top });
      gsap.to(cursor, { opacity: 1, scale: 1, duration: .4, ease: "back.out(2)", startAt: { scale: .4 } });
    });
    cc.addEventListener("pointerleave", () => gsap.to(cursor, { opacity: 0, scale: .4, duration: .25, ease: "power2.in" }));
  }
})();
