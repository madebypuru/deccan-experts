/* Why Deccan — a spotlight follows the cursor over each tile; the tiles' drawings animate on their own. */
(() => {
  const grid = document.querySelector("[data-why]");
  if (!grid) return;
  const $$ = (s, el = grid) => [...el.querySelectorAll(s)];

  // spotlight
  $$(".wy").forEach(t => t.addEventListener("pointermove", e => {
    const r = t.getBoundingClientRect();
    t.style.setProperty("--mx", e.clientX - r.left + "px");
    t.style.setProperty("--my", e.clientY - r.top + "px");
  }));

  // A to D are drawn as Illos scenes (illos/why-guided, why-hours, why-paid, why-few.mjs); they run on their own and
  // experts.js pauses them off screen.
})();
