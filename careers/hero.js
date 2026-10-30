/* Deccan Experts hero: see-through nav while over the hero, and the faces at the table: hover (or tap) one and the
   room dims, that face stays lit and a card says what they do. */
(() => {
  const hx = document.querySelector(".hx");
  if (!hx) return;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");

  // the hero slides up under the sticky nav by exactly the nav's height
  // and fills what's left of the first screen below the announcement bar
  const bar = document.querySelector(".topbar");
  const fitHeader = () => {
    if (header) hx.style.setProperty("--hdr", header.offsetHeight + "px");
    if (bar) hx.style.setProperty("--bar", bar.offsetHeight + "px");
  };
  fitHeader();
  addEventListener("resize", fitHeader);
  if (header) {
    const over = () => header.classList.toggle("is-over", hx.getBoundingClientRect().bottom > header.offsetHeight + 40);
    addEventListener("scroll", over, { passive: true });
    over();
  }

  // the photo box covers the hero at the image's own proportions (hero.css), so it needs the hero's height
  const fitStage = () => hx.style.setProperty("--hh", hx.offsetHeight + "px");
  fitStage();
  new ResizeObserver(fitStage).observe(hx);

  // faces in image pixels (2688 × 1520): centre x, centre y; field, role, what they do here
  const FACES = [
    [320, 455, "Medicine", "Physician", "Checks a model’s diagnoses against the chart."],
    [710, 452, "Law", "Litigation counsel", "Weighs a model’s rulings against precedent."],
    [1018, 481, "Coding", "Software engineer", "Reviews a model’s code before it ever runs."],
    [1375, 500, "Chemistry", "Research chemist", "Tests a model’s reactions on paper first."],
    [1694, 533, "Mathematics", "Mathematician", "Checks a model’s proofs, line by line."],
    [1995, 561, "Language", "Linguist", "Tells you when a model’s prose rings false."],
    [2376, 568, "Physical AI", "Robotics engineer", "Grounds a model’s physics in real hardware."],
  ];
  const layer = hx.querySelector(".hx__faces"), photo = hx.querySelector(".hx__photo");
  if (!layer || !photo) return;
  const IW = 2688, IH = 1520, FW = 124, FH = 148, pct = n => +n.toFixed(4) + "%";
  layer.innerHTML = FACES.map(([cx, cy, field, role, line]) => {
    const W = FW / IW * 100, H = FH / IH * 100, L = (cx - FW / 2) / IW * 100, T = (cy - FH / 2) / IH * 100;
    const style = `--fx:${pct(L)};--fy:${pct(T)};--fw:${pct(W)};--fh:${pct(H)};--fbs:${pct(10000 / W)} ${pct(10000 / H)};--fbp:${pct(L / (100 - W) * 100)} ${pct(T / (100 - H) * 100)}`;
    return `<button class="hx-f${cx > IW * .66 ? " hx-f--end" : ""}" style="${style}" aria-label="${role}: ${line}">
      <span class="hx-f__lit"></span><span class="hx-f__fr"></span>
      <span class="hx-f__card" role="tooltip"><em>${field}</em><strong>${role}</strong><span>${line}</span></span>
    </button>`;
  }).join("");
  // the lit face is the same photo, cropped to the box
  const lit = () => layer.querySelectorAll(".hx-f__lit").forEach(el => { el.style.backgroundImage = `url("${photo.currentSrc || photo.src}")`; });
  photo.complete ? lit() : photo.addEventListener("load", lit, { once: true });

  const fs = [...layer.querySelectorAll(".hx-f")];
  const show = f => {
    fs.forEach(x => x.classList.toggle("is-on", x === f));
    hx.classList.toggle("has-face", !!f);
  };
  fs.forEach(f => {
    f.addEventListener("pointerenter", e => e.pointerType === "mouse" && show(f));
    f.addEventListener("pointerleave", e => e.pointerType === "mouse" && show(null));
    f.addEventListener("focus", () => show(f));
    f.addEventListener("blur", () => show(null));
    f.addEventListener("click", e => { e.stopPropagation(); if (e.pointerType === "mouse") return; show(f.classList.contains("is-on") ? null : f); });
  });
  document.addEventListener("click", () => show(null));
  document.addEventListener("keydown", e => e.key === "Escape" && show(null));
})();
