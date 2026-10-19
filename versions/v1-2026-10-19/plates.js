/* Deccan Experts — plates: a painting with one instrument dial laid over the tool of the trade.
   Figma "Section 1" (213:1563): the painting is the human judgment, the vector layer is the record.

   Markup:
     <div class="plate" data-plate="ind-finance" [data-kind="compass"] [data-side="left"]>
       <img class="plate__img" src="assets/brand/ind-finance.jpg" alt="">
     </div>
   The focal point, dial size and caption come from PLATES below (fractions of the source image). */
(function () {
  "use strict";

  // x, y: centre of the instrument in the painting (0–1). d: dial diameter as a fraction of image width.
  // fig / note: plate caption, drafted in the Figma voice ("FIG. 1 · THE HAND / Instruction, 1787.").
  const PLATES = {
    // ind-* points match the restored daylight originals (not the nocturne set)
    "ind-research": { x: 0.344, y: 0.40, d: 0.26, fig: "Fig. 01 · The sphere", note: "Evaluation, 1621." },
    "ind-medicine": { x: 0.80, y: 0.225, d: 0.26, fig: "Fig. 02 · The plate", note: "Diagnosis, 1895." },
    "ind-software": { x: 0.61, y: 0.67, d: 0.30, fig: "Fig. 03 · The keys", note: "Reference solution, 1843." },
    "ind-finance": { x: 0.306, y: 0.54, d: 0.30, fig: "Fig. 04 · The balance", note: "Reconciliation, 1514." },
    "ind-physical": { x: 0.547, y: 0.655, d: 0.26, fig: "Fig. 05 · The grip", note: "Demonstration, 1738." },
    "why-guidance": { x: 0.555, y: 0.665, d: 0.40, fig: "Fig. 06 · The finger", note: "Instruction, by hand." },
    "why-hours": { x: 0.865, y: 0.53, d: 0.30, fig: "Fig. 07 · The clock", note: "Past midnight, by choice." },
    "why-pay": { x: 0.57, y: 0.54, d: 0.44, fig: "Fig. 08 · The scale", note: "Paid biweekly, to the coin." },
    "why-network": { x: 0.49, y: 0.525, d: 0.50, fig: "Fig. 09 · The globe", note: "Fewer than 1 in 100." },
    "blog-1": { x: 0.54, y: 0.50, d: 0.30, fig: "Fig. 10 · The sphere", note: "Asked again, 1588." },
    "blog-2": { x: 0.425, y: 0.667, d: 0.24, fig: "Fig. 11 · The quill", note: "One quiet shift." },
    "blog-3": { x: 0.51, y: 0.75, d: 0.26, fig: "Fig. 12 · The hand", note: "Who trained it." },
    "record": { x: 0.40, y: 0.67, d: 0.30, fig: "Entry 0421 · The record", note: "Written down, verified, paid." },
  };

  const NS = "http://www.w3.org/2000/svg";
  const r1 = (n) => Math.round(n * 100) / 100;

  // Reticle (Figma 21 · The disciplines): ring, dashed ring, tick ring, centre cross.
  function reticle() {
    let ticks = "";
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * Math.PI * 2;
      const long = i % 18 === 0;
      const ri = long ? 70 : 77, ro = long ? 100 : 86;
      ticks += `M${r1(Math.sin(a) * ri)} ${r1(-Math.cos(a) * ri)}L${r1(Math.sin(a) * ro)} ${r1(-Math.cos(a) * ro)}`;
    }
    return `<svg class="plate__dial-svg" viewBox="-104 -104 208 208" aria-hidden="true">
      <g class="spin"><path d="${ticks}" stroke="#fff" stroke-opacity=".7" stroke-width="1.2" vector-effect="non-scaling-stroke"/></g>
      <circle r="77" fill="none" stroke="#fff" stroke-opacity=".55" vector-effect="non-scaling-stroke"/>
      <circle r="88" fill="none" stroke="#fff" stroke-opacity=".35" stroke-dasharray="1 3" vector-effect="non-scaling-stroke"/>
      <path d="M-19 0H19M0 -19V19" stroke="#fff" stroke-opacity=".6" vector-effect="non-scaling-stroke"/>
    </svg>`;
  }

  // Compass (Figma T5 · Annotated masters post): ring, dotted ring, graduated ticks, bearings, centre dot.
  function compass() {
    let ticks = "";
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      const major = i % 10 === 0;
      const ri = 90.5, ro = major ? 100 : 94.5;
      ticks += `M${r1(Math.sin(a) * ri)} ${r1(-Math.cos(a) * ri)}L${r1(Math.sin(a) * ro)} ${r1(-Math.cos(a) * ro)}`;
    }
    const labels = ["N", "03", "06", "E", "12", "15", "S", "21", "24", "W", "30", "33"]
      .map((t, i) => {
        const a = (i / 12) * Math.PI * 2;
        return `<text x="${r1(Math.sin(a) * 113)}" y="${r1(-Math.cos(a) * 113)}">${t}</text>`;
      }).join("");
    return `<svg class="plate__dial-svg" viewBox="-128 -128 256 256" aria-hidden="true">
      <circle r="90.5" fill="none" stroke="#fff" stroke-opacity=".45" vector-effect="non-scaling-stroke"/>
      <circle r="98" fill="none" stroke="#fff" stroke-opacity=".35" stroke-dasharray="1 2.5" vector-effect="non-scaling-stroke"/>
      <g class="spin"><path d="${ticks}" stroke="#fff" stroke-opacity=".75" vector-effect="non-scaling-stroke"/></g>
      <g class="plate__bearings">${labels}</g>
      <circle r="2.6" fill="#fff"/>
    </svg>`;
  }

  // Map a point in the source image to the box, honouring object-fit: cover and object-position.
  function coverMap(img, box, px, py) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(box.width / iw, box.height / ih);
    const w = iw * scale, h = ih * scale;
    const pos = getComputedStyle(img).objectPosition.split(" ").map((v) => parseFloat(v) / 100);
    const ox = (box.width - w) * (isNaN(pos[0]) ? 0.5 : pos[0]);
    const oy = (box.height - h) * (isNaN(pos[1]) ? 0.5 : pos[1]);
    return { x: ox + px * w, y: oy + py * h, w };
  }

  function build(el) {
    if (el.dataset.plateReady) return;
    const spec = PLATES[el.dataset.plate];
    const img = el.querySelector(".plate__img");
    if (!spec || !img) return;
    el.dataset.plateReady = "1";
    const kind = el.dataset.kind || "reticle";
    const layer = document.createElement("div");
    layer.className = "plate__layer";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML = `
      <div class="plate__dial plate__dial--${kind}">${kind === "compass" ? compass() : reticle()}</div>
      ${el.dataset.caption === "off" ? "" : `<svg class="plate__leader"><polyline fill="none" stroke="#fff" stroke-opacity=".6" points=""/></svg>
      <div class="plate__cap"><em>${spec.fig}</em><span>${spec.note}</span></div>`}`;
    el.appendChild(layer);
    const dial = layer.querySelector(".plate__dial");
    const cap = layer.querySelector(".plate__cap");
    const line = layer.querySelector(".plate__leader polyline");

    const layout = () => {
      if (!img.naturalWidth) return;
      const box = el.getBoundingClientRect();
      if (!box.width) return;
      // data-focus-y: re-crop so the instrument lands at that height of the box (keeps it clear of copy)
      if (el.dataset.focusY) {
        const s = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
        const h = img.naturalHeight * s;
        const want = parseFloat(el.dataset.focusY) * box.height - spec.y * h;
        const frac = box.height - h === 0 ? 0.5 : Math.min(1, Math.max(0, want / (box.height - h)));
        img.style.objectPosition = `50% ${(frac * 100).toFixed(2)}%`;
      }
      const p = coverMap(img, box, spec.x, spec.y);
      const size = Math.max(64, spec.d * p.w);
      dial.style.cssText = `left:${p.x}px;top:${p.y}px;width:${size}px;height:${size}px`;
      if (!cap) return;
      // caption sits below-left of the dial (or right when the dial hugs the left edge)
      const side = el.dataset.side || (p.x > box.width * 0.5 ? "left" : "right");
      const gap = size * 0.62;
      const cw = cap.offsetWidth, ch = cap.offsetHeight;
      let cx = side === "left" ? p.x - gap - cw : p.x + gap;
      let cy = el.dataset.capY === "above" ? p.y - gap * 0.9 - ch - 6 : p.y + gap * 0.9;
      cx = Math.min(Math.max(cx, 14), box.width - cw - 14);
      cy = Math.min(Math.max(cy, 14), box.height - ch - 14);
      cap.style.left = `${cx}px`;
      cap.style.top = `${cy}px`;
      // leader: centre → corner of the caption's underline → along the underline
      const uy = cy + ch + 6;
      const ex = side === "left" ? cx + cw : cx;
      const sx = side === "left" ? cx : cx + cw;
      line.setAttribute("points", `${p.x},${p.y} ${ex},${uy} ${sx},${uy}`);
      layer.querySelector(".plate__leader").setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    };
    if (img.complete) layout(); else img.addEventListener("load", layout, { once: true });
    new ResizeObserver(layout).observe(el);
  }

  window.Plates = {
    init(root) { (root || document).querySelectorAll("[data-plate]").forEach(build); },
  };
})();
