// The 1% grid. A glass slab holds a 10 x 10 field of small dark glass cubes: a hundred applicants. One of them, near the
// middle, burns cyan: the top 1%. A column of light widens from its top face up to a large glass cube floating over the
// back of the grid: the model, which burns white. Two plates: "1 in 100" on the slab, "Frontier AI" on the model.
// Sequence, as it really happens: the expert's cube sends a packet of work up out of its top face (its core gives a small
// flare as it sends); the packet rises through the column at a constant speed, spreading with it; it enters the model's
// bottom face; only then does the model's core flare and settle. One packet leaves every 0.8 s, so the column is never
// empty, and the model flares once for each.
// 0.30 s: a packet leaves the expert's cube (its core flares) and fades in over 0.25 s.
// 0.30 to 2.70 s: it rises (linear), fading out over its last 0.25 s as it enters the model.
// 0.30 s into every 0.8 s: a packet arrives (2.4 s is three steps of 0.8) and the model's core flares, easing back.
// Seam (4.0 s = 0 s): five packets on five lanes, 0.8 s apart, so every 0.8 s step looks the same; each goes back while
//   hidden.
import { kit, INK, svgDoc, keyframes, n, C30, EASE_OUT, part } from "../../.claude/skills/illos-hud/kit.mjs";

export const meta = {
  theme: "scifi",
  subject: "hero-top1",
  name: "The 1% grid",
  size: "page",
  alt: "A field of a hundred small glass cubes on a glass slab, one of them glowing. A column of light rises from it to a large glass cube floating above, and packets of light stream up the column into it; its white core flares as each one arrives.",
};
export const params = {};

const W = 520;
const H = 520;
const T = 4.0;
const GAP = 0.8;
const RIDE = 2.4;
const LEAVE = 0.3; // into each 0.8 s step: a packet leaves (and, RIDE being whole steps, one arrives)
const N = 10; // cubes a side
const P = 22; // the grid's pitch
const s = 14; // a small cube's side
const HOT = [5, 4]; // the 1%: grid column (x) and row (y)
const B = 108; // the model's side
const Z0 = 156; // the model's bottom face

export function render() {
  const k = kit({ ox: 242, oy: 262 });
  const cls = "sf-hero-top1";
  const f = (v) => String(Math.round(v * 10) / 10);
  const Q = (pts) => pts.map((q, i) => `${i ? "L" : "M"}${k.iso(...q).map(f).join(" ")}`).join("") + "Z";
  const seg = (a, b) => `M${k.iso(...a).map(f).join(" ")}L${k.iso(...b).map(f).join(" ")}`;
  const C = INK.data;
  const G = INK.ground;
  const I = INK.read;
  const id = (t) => `${cls}-${t}`;
  const hx = HOT[0] * P + s / 2; // the expert's cube, centre
  const hy = HOT[1] * P + s / 2;
  const MX = hx; // the model floats right over it
  const MY = hy;

  const defs = [
    `<radialGradient id="${id("core")}"><stop offset="0" stop-color="${I}" stop-opacity="0.95"/><stop offset="0.22" stop-color="${C}" stop-opacity="0.9"/><stop offset="0.55" stop-color="${C}" stop-opacity="0.32"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${id("cool")}"><stop offset="0" stop-color="${C}" stop-opacity="0.9"/><stop offset="0.5" stop-color="${C}" stop-opacity="0.38"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${id("bloom")}"><stop offset="0" stop-color="${C}" stop-opacity="0.1"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${id("dot")}"><stop offset="0" stop-color="${C}" stop-opacity="0.9"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="${id("glass")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity="0.1"/><stop offset="1" stop-color="${C}" stop-opacity="0.02"/></linearGradient>`,
    `<linearGradient id="${id("top")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C}" stop-opacity="0.06"/><stop offset="1" stop-color="${C}" stop-opacity="0.14"/></linearGradient>`,
    `<filter id="${id("soft")}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>`,
    `<filter id="${id("haze")}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.7"/></filter>`,
  ];
  // The column: brightest where it leaves the expert's cube, thinning as it widens toward the model.
  const [c0x, c0y] = k.iso(hx, hy, s);
  const [c1x, c1y] = k.iso(MX, MY, Z0);
  defs.push(`<linearGradient id="${id("column")}" gradientUnits="userSpaceOnUse" x1="${f(c0x)}" y1="${f(c0y)}" x2="${f(c1x)}" y2="${f(c1y)}"><stop offset="0" stop-color="${C}" stop-opacity="0.34"/><stop offset="0.55" stop-color="${C}" stop-opacity="0.13"/><stop offset="1" stop-color="${C}" stop-opacity="0.06"/></linearGradient>`);
  defs.push(`<linearGradient id="${id("column-back")}" gradientUnits="userSpaceOnUse" x1="${f(c0x)}" y1="${f(c0y)}" x2="${f(c1x)}" y2="${f(c1y)}"><stop offset="0" stop-color="${C}" stop-opacity="0.16"/><stop offset="1" stop-color="${C}" stop-opacity="0.03"/></linearGradient>`);

  // A glass cube with its low corner at (x0, y0, z0) and side a: hidden edges faint, a stepped core, translucent faces.
  // kind: "dim" for the ninety-nine, "cool" for the expert, "hot" for the model.
  const cube = (x0, y0, z0, a, kind) => {
    const v = (x, y, z) => [x0 + x * a, y0 + y * a, z0 + z * a];
    const centre = k.iso(x0 + a / 2, y0 + a / 2, z0 + a / 2);
    const hex = (sc) => {
      const c = (x, y, z) => [x0 + a / 2 + (x - 0.5) * a * sc, y0 + a / 2 + (y - 0.5) * a * sc, z0 + a / 2 + (z - 0.5) * a * sc];
      return Q([c(0, 0, 1), c(1, 0, 1), c(1, 0, 0), c(1, 1, 0), c(0, 1, 0), c(0, 1, 1)]);
    };
    const edges = [
      [v(0, 0, 1), v(1, 0, 1)], [v(1, 0, 1), v(1, 1, 1)], [v(1, 1, 1), v(0, 1, 1)], [v(0, 1, 1), v(0, 0, 1)],
      [v(0, 1, 1), v(0, 1, 0)], [v(1, 1, 1), v(1, 1, 0)], [v(1, 0, 1), v(1, 0, 0)],
      [v(0, 1, 0), v(1, 1, 0)], [v(1, 1, 0), v(1, 0, 0)],
    ].map(([p, q]) => seg(p, q)).join("");
    const out = [`<path d="${Q([v(0, 0, 1), v(1, 0, 1), v(1, 0, 0), v(1, 1, 0), v(0, 1, 0), v(0, 1, 1)])}" fill="${G}" fill-opacity="0.6"/>`];
    if (kind !== "dim") {
      out.push(`<path d="${[[v(0, 0, 0), v(1, 0, 0)], [v(0, 0, 0), v(0, 1, 0)], [v(0, 0, 0), v(0, 0, 1)]].map(([p, q]) => seg(p, q)).join("")}" stroke="${C}" stroke-opacity="0.3" stroke-width="0.8" fill="none"/>`);
      out.push(`<g filter="url(#${id("haze")})">${(kind === "hot" ? [[0.58, 0.06], [0.45, 0.12], [0.34, 0.24], [0.25, 0.4]] : [[0.82, 0.08], [0.64, 0.16], [0.48, 0.34], [0.34, 0.55]]).map(([sc, o]) => `<path d="${hex(sc)}" fill="${C}" fill-opacity="${kind === "hot" ? o : o * 1.1}"/>`).join("")}</g>`);
      out.push(`<circle cx="${f(centre[0])}" cy="${f(centre[1])}" r="${f(a * (kind === "hot" ? 0.6 : 0.95))}" fill="url(#${id("bloom")})"/>`);
      out.push(`<circle class="${kind === "hot" ? "rx" : "tx"}" cx="${f(centre[0])}" cy="${f(centre[1])}" r="${f(a * (kind === "hot" ? 0.24 : 0.42))}" fill="url(#${id(kind === "hot" ? "core" : "cool")})"/>`);
    }
    out.push(`<path d="${Q([v(0, 0, 1), v(1, 0, 1), v(1, 1, 1), v(0, 1, 1)])}" fill="url(#${id("top")})"/>`);
    out.push(`<path d="${Q([v(0, 1, 1), v(1, 1, 1), v(1, 1, 0), v(0, 1, 0)])}" fill="url(#${id("glass")})"/>`);
    out.push(`<path d="${Q([v(1, 1, 1), v(1, 0, 1), v(1, 0, 0), v(1, 1, 0)])}" fill="url(#${id("glass")})" fill-opacity="0.7"/>`);
    if (kind === "dim") out.push(`<path d="${edges}" stroke="${C}" stroke-width="0.8" stroke-opacity="0.26" fill="none" stroke-linejoin="round"/>`);
    else {
      out.push(`<path d="${edges}" stroke="${C}" stroke-width="2.4" stroke-opacity="0.1" fill="none" filter="url(#${id("soft")})"/>`);
      out.push(`<path d="${edges}" stroke="${C}" stroke-width="1" stroke-opacity="${kind === "cool" ? 0.7 : 0.52}" fill="none" stroke-linejoin="round"/>`);
    }
    if (kind === "hot") {
      const [ax, ay] = centre;
      const [ex, ey] = k.iso(...v(1, 1, 0));
      out.push(`<path d="M${f(ax)} ${f(ay)}L${f(ax + (ex - ax) * 0.45)} ${f(ay + (ey - ay) * 0.45)}" stroke="${I}" stroke-opacity="0.4" stroke-width="1.3" stroke-linecap="round" filter="url(#${id("soft")})"/>`);
      out.push(`<circle cx="${f(ax + (ex - ax) * 0.12)}" cy="${f(ay + (ey - ay) * 0.12)}" r="4.5" fill="${I}" fill-opacity="0.9" filter="url(#${id("soft")})"/>`);
      out.push(`<path d="${seg(v(1, 1, 0), v(1, 0, 0))}" stroke="${I}" stroke-opacity="0.55" stroke-width="1.1"/>`);
    }
    return out.join("");
  };

  // A plate standing on an edge that runs along -y at height z from (x, yStart): its text fitted to it, in that plane.
  const plate = (x, yStart, z, len, txt, name) => {
    const at = (u, w) => { const [px, py] = k.iso(x, yStart - u, z); return [px, py - w]; };
    const TH = 15;
    const PAD = 6;
    const FS = 8;
    const pts = [at(0, 0), at(len, 0), at(len, TH), at(0, TH)];
    const [tx, ty] = at(PAD, (TH - FS * 0.73) / 2);
    return part(name, `<path d="M${pts.map((q) => q.map(f).join(" ")).join("L")}Z" fill="${G}" fill-opacity="0.65" stroke="${C}" stroke-opacity="0.38" stroke-width="0.8"/>` + `<text class="lab" transform="matrix(${f(C30)},-0.5,0,1,${f(tx)},${f(ty)})" font-family="Inter Display, Inter, system-ui, sans-serif" font-size="${FS}" textLength="${len - 2 * PAD}" lengthAdjust="spacingAndGlyphs" fill="${C}" fill-opacity="0.72" stroke="none">${txt}</text>`);
  };

  const still = [];
  // The slab under the grid: a thin plate of glass.
  const L0 = -14;
  const L1 = (N - 1) * P + s + 14;
  still.push(part("slab", `<path d="${Q([[L0, L0, 0], [L1, L0, 0], [L1, L1, 0], [L0, L1, 0]])}" fill="${C}" fill-opacity="0.03"/>` + `<path d="${Q([[L0, L1, 0], [L1, L1, 0], [L1, L1, -6], [L0, L1, -6]])}" fill="${C}" fill-opacity="0.05"/>` + `<path d="${Q([[L1, L1, 0], [L1, L0, 0], [L1, L0, -6], [L1, L1, -6]])}" fill="${C}" fill-opacity="0.035"/>` + `<path d="${seg([L0, L0, 0], [L1, L0, 0]) + seg([L1, L0, 0], [L1, L1, 0]) + seg([L1, L1, 0], [L0, L1, 0]) + seg([L0, L1, 0], [L0, L0, 0]) + seg([L0, L1, -6], [L1, L1, -6]) + seg([L1, L1, -6], [L1, L0, -6]) + seg([L0, L1, 0], [L0, L1, -6]) + seg([L1, L1, 0], [L1, L1, -6]) + seg([L1, L0, 0], [L1, L0, -6])}" stroke="${C}" stroke-opacity="0.24" stroke-width="0.8" fill="none"/>`));
  // The ninety-nine, back to front; the expert's cube is drawn after the column, so the light rises out of it.
  const cells = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) cells.push([i, j]);
  cells.sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[0] - b[0]);
  still.push(part("grid", cells.filter(([i, j]) => !(i === HOT[0] && j === HOT[1])).map(([i, j]) => cube(i * P, j * P, 0, s, "dim")).join("")));
  // The column: four faces from the expert's top face out to the model's bottom face; the far two dimmer.
  const lo = (x, y) => [hx + x * s / 2, hy + y * s / 2, s];
  const hi = (x, y) => [MX + x * B / 2, MY + y * B / 2, Z0];
  const face = (a, b) => Q([lo(...a), lo(...b), hi(...b), hi(...a)]);
  still.push(part("column", `<path d="${face([-1, -1], [1, -1])}" fill="url(#${id("column-back")})"/>` + `<path d="${face([-1, -1], [-1, 1])}" fill="url(#${id("column-back")})"/>` + `<path d="${face([-1, 1], [1, 1])}" fill="url(#${id("column")})"/>` + `<path d="${face([1, -1], [1, 1])}" fill="url(#${id("column")})" fill-opacity="0.8"/>` + `<path d="${[[-1, 1], [1, 1], [1, -1]].map((q) => seg(lo(...q), hi(...q))).join("")}" stroke="${C}" stroke-opacity="0.2" stroke-width="0.8"/>`));
  // Fine dust in the column.
  const DUST = [[0.2, 0.3, 0.2], [-0.5, 0.1, 0.35], [0.6, -0.4, 0.45], [-0.2, -0.7, 0.55], [0.8, 0.5, 0.62], [-0.7, 0.6, 0.7], [0.1, 0.9, 0.78], [0.45, -0.85, 0.86], [-0.85, -0.2, 0.9], [0.3, 0.05, 0.94], [-0.4, 0.4, 0.5], [0.65, 0.75, 0.3]];
  still.push(part("dust", DUST.map(([a, b, t], i) => { const r = s / 2 + (B / 2 - s / 2) * t; const [x, y] = k.iso(hx + a * r, hy + b * r, s + (Z0 - s) * t); return `<circle cx="${f(x)}" cy="${f(y)}" r="${i % 3 ? 0.8 : 1.2}" fill="${C}" fill-opacity="${i % 2 ? 0.45 : 0.75}"/>`; }).join("")));
  still.push(part("expert-cube", cube(HOT[0] * P, HOT[1] * P, 0, s, "cool")));
  still.push(part("model-cube", cube(MX - B / 2, MY - B / 2, Z0, B, "hot")));
  // The plates: one on the slab's near right edge, one on the model's top left edge.
  still.push(plate(L1, L1 - 14, 0, 62, "1 in 100", "plate-slab"));
  still.push(plate(MX - B / 2, MY + B / 2 - 6, Z0 + B, 70, "Frontier AI", "plate-model"));

  // ---- motion ----
  const css = [`text{font-family:"Inter Display","Inter",system-ui,sans-serif;font-variation-settings:"opsz" 32}`];
  const kf = (name, stops, total = T) => css.push(keyframes(`${cls}_${name}`, stops, total));
  const moving = [];
  // Five lanes: where on the expert's top face a packet leaves, and where on the model's bottom face it arrives.
  const LANES = [[-0.4, 0.3], [0.5, -0.3], [0.1, 0.7], [-0.6, -0.5], [0.7, 0.45]];
  LANES.forEach(([a, b], i) => {
    const [x, y] = k.iso(hx + a * s * 0.4, hy + b * s * 0.4, s + 2);
    const [ex, ey] = k.iso(MX + a * B * 0.42, MY + b * B * 0.42, Z0 - 2);
    const dx = ex - x;
    const dy = ey - y;
    const len = Math.hypot(dx, dy);
    const [bx, by] = [x - (dx / len) * 42, y - (dy / len) * 42]; // the trail, back down the lane
    defs.push(`<linearGradient id="${id(`trail${i}`)}" gradientUnits="userSpaceOnUse" x1="${f(bx)}" y1="${f(by)}" x2="${f(x)}" y2="${f(y)}"><stop offset="0" stop-color="${C}" stop-opacity="0"/><stop offset="1" stop-color="${C}" stop-opacity="0.32"/></linearGradient>`);
    const tr = (u) => `transform:translate(${n(dx * u)}px,${n(dy * u)}px)`;
    moving.push(part(`packet-${i + 1}`, `<g class="pk${i}" style="animation-delay:${n(-i * GAP)}s"><path d="M${f(bx)} ${f(by)}L${f(x)} ${f(y)}" stroke="url(#${id(`trail${i}`)})" stroke-width="8" stroke-linecap="round"/><circle cx="${f(x)}" cy="${f(y)}" r="10" fill="url(#${id("dot")})"/><circle cx="${f(x)}" cy="${f(y)}" r="4" fill="${C}"/><circle cx="${f(x - 0.8)}" cy="${f(y - 0.8)}" r="1.3" fill="${I}" fill-opacity="0.8"/></g>`));
    kf(`pk${i}`, [[0, `opacity:0;${tr(0)}`], [LEAVE, `opacity:0;${tr(0)}`, "linear"], [LEAVE + 0.25, `opacity:1;${tr(0.25 / RIDE)}`, "linear"], [LEAVE + RIDE - 0.25, `opacity:1;${tr((RIDE - 0.25) / RIDE)}`, "linear"], [LEAVE + RIDE, `opacity:0;${tr(1)}`, "step-end"], [T, `opacity:0;${tr(1)}`]]);
    css.push(`.pk${i}{opacity:0;animation:${cls}_pk${i} ${T}s linear}`);
  });
  // The model flares as each packet arrives (RIDE is a whole number of steps, so arrivals fall at the top of each step).
  kf("rx", [[0, "opacity:0.62"], [LEAVE, "opacity:0.62", "step-end"], [LEAVE + 0.01, "opacity:1", EASE_OUT], [GAP, "opacity:0.62"]], GAP);
  css.push(`.rx{opacity:0.62;animation:${cls}_rx ${GAP}s linear}`);
  // The expert's core gives a small flare as each packet leaves.
  kf("tx", [[0, "opacity:0.72"], [LEAVE, "opacity:0.72", "step-end"], [LEAVE + 0.01, "opacity:1", EASE_OUT], [GAP, "opacity:0.72"]], GAP);
  css.push(`.tx{opacity:0.72;animation:${cls}_tx ${GAP}s linear}`);

  return svgDoc(cls, "The 1% grid", css.join("\n"), defs.join(""), still.join("") + moving.join(""), { w: W, h: H, desc: meta.alt });
}
