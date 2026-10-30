// Induction. The expert, a glass sphere, sits among three glass panels notched round it: Standards, Tooling (a wave and
// a cursor) and Calibration (rows of settings). A thin column of light drops from Calibration to an iridescent lens on a
// dotted base below.
// Drawn from the Figma frame "7" (Deccan AI Experts design, node 452:101), at its own 518 x 339.
// Sequence, as it really happens: the expert reads the standards (the Standards bar fills); then practises on the tools
// (the cursor runs along the Tooling wave, left to right); then calibrates (the Calibration rows light one after
// another); once all three are done the sphere's core flares: calibrated; and a streak of light shoots up out of the
// Calibration panel into Standards, carrying the calibration back to the standards the next run reads.
// The hexagon with a line between the two panels in the Figma is that streak in flight (see streak.mjs), not a post.
// 0.00 to 0.50 s: the streak goes on up into the Standards panel, trail following, and fades.
// 0.30 to 1.10 s: the Standards bar fills (ease out).
// 1.20 to 2.90 s: the cursor runs the wave (constant speed along it).
// 3.05 to 3.65 s: the four Calibration rows light in turn.
// 3.90 to 4.90 s: the sphere flares and settles.
// 4.79 s: the streak comes up out of the Calibration panel (50 px/s).
// 4.90 to 5.20 s: the bar fades back to empty.
// 0.00 to 0.60 s: the cursor fades at its resting place, returns hidden, and fades in at the start of the wave.
// Seam (5.2 s = 0 s): the bar is empty, the cursor rests at the end of the wave and the streak is where the Figma shows it.
import { kit, INK, svgDoc, keyframes, n, EASE_OUT, part } from "../../.claude/skills/illos-hud/kit.mjs";
import { liquid } from "./liquid.mjs";
import { streak } from "./streak.mjs";

export const meta = {
  theme: "scifi",
  subject: "induction",
  name: "Induction",
  size: "spot",
  alt: "A glass sphere among three glass panels named Standards, Tooling and Calibration, above an iridescent lens. The Standards bar fills, a cursor runs along the Tooling wave, the Calibration rows light one by one, the sphere's core flares, and a streak of light shoots up from Calibration into Standards.",
};
export const params = {};

const W = 518;
const H = 339;
const T = 5.2;
const SC = [253.2, 142.2]; // the sphere
const SR = 42.2;
const NOTCH = SR + 9; // the panels are cut back round the sphere by this radius
const ROWS = [[123.4, 161.3, 152.3], [123.4, 168.9, 144.3], [123.4, 175.6, 164.8], [123.4, 182.2, 154.1]]; // x0, y, x1

export function render() {
  void kit;
  const cls = "sf-induction";
  const f = (v) => String(Math.round(v * 10) / 10);
  const C = INK.data;
  const G = INK.ground;
  const I = INK.read;
  const A = INK.alert;
  const id = (s) => `${cls}-${s}`;
  const FONT = 'font-family="Inter Display, Inter, system-ui, sans-serif"';
  const label = (txt, x, y, extra = "") => `<text class="lab" x="${f(x)}" y="${f(y)}" ${FONT} font-size="6.6" fill="${C}" fill-opacity="0.55" stroke="none" ${extra}>${txt}</text>`;

  // A panel: a rounded rectangle with one corner cut back by an arc round the sphere. `corner` names that corner.
  const panel = (x0, y0, x1, y1, corner) => {
    const r = 3.5;
    // Where the notch circle crosses the panel's two edges at that corner.
    const cut = (fixedX, fixedY) => {
      const dy = Math.sqrt(Math.max(0, NOTCH * NOTCH - (fixedX - SC[0]) ** 2));
      const dx = Math.sqrt(Math.max(0, NOTCH * NOTCH - (fixedY - SC[1]) ** 2));
      return { dy, dx };
    };
    if (corner === "br") {
      const { dy, dx } = cut(x1, y1);
      const yOnRight = SC[1] - dy; // the notch meets the right edge here
      const xOnBottom = SC[0] - dx; // and the bottom edge here
      return `M${f(x0 + r)} ${f(y0)}H${f(x1 - r)}Q${f(x1)} ${f(y0)} ${f(x1)} ${f(y0 + r)}V${f(yOnRight)}A${NOTCH} ${NOTCH} 0 0 0 ${f(xOnBottom)} ${f(y1)}H${f(x0 + r)}Q${f(x0)} ${f(y1)} ${f(x0)} ${f(y1 - r)}V${f(y0 + r)}Q${f(x0)} ${f(y0)} ${f(x0 + r)} ${f(y0)}Z`;
    }
    if (corner === "tr") {
      const { dy, dx } = cut(x1, y0);
      const xOnTop = SC[0] - dx;
      const yOnRight = SC[1] + dy;
      return `M${f(x0 + r)} ${f(y0)}H${f(xOnTop)}A${NOTCH} ${NOTCH} 0 0 0 ${f(x1)} ${f(yOnRight)}V${f(y1 - r)}Q${f(x1)} ${f(y1)} ${f(x1 - r)} ${f(y1)}H${f(x0 + r)}Q${f(x0)} ${f(y1)} ${f(x0)} ${f(y1 - r)}V${f(y0 + r)}Q${f(x0)} ${f(y0)} ${f(x0 + r)} ${f(y0)}Z`;
    }
    // "bl": the notch is at the bottom left
    const { dy, dx } = cut(x0, y1);
    const yOnLeft = SC[1] - dy;
    const xOnBottom = SC[0] + dx;
    return `M${f(x0 + r)} ${f(y0)}H${f(x1 - r)}Q${f(x1)} ${f(y0)} ${f(x1)} ${f(y0 + r)}V${f(y1 - r)}Q${f(x1)} ${f(y1)} ${f(x1 - r)} ${f(y1)}H${f(xOnBottom)}A${NOTCH} ${NOTCH} 0 0 0 ${f(x0)} ${f(yOnLeft)}V${f(y0 + r)}Q${f(x0)} ${f(y0)} ${f(x0 + r)} ${f(y0)}Z`;
  };

  // The wave, traced from the Figma: flat out of the notch, a peak, a dip, a lower peak, flat past the panel's edge.
  const SEGS = [[[296, 130], [306, 130], [314, 109.3], [328, 109.3]], [[328, 109.3], [343, 109.3], [342, 144.3], [357, 144.3]], [[357, 144.3], [372, 144.3], [375, 116.3], [390, 116.3]], [[390, 116.3], [405, 116.3], [412, 131], [432, 131]]];
  const waveD = `M296 130` + SEGS.map(([, a, b, c]) => `C${a.join(" ")} ${b.join(" ")} ${c.join(" ")}`).join("");
  const bez = ([p0, p1, p2, p3], t) => [0, 1].map((j) => (1 - t) ** 3 * p0[j] + 3 * (1 - t) ** 2 * t * p1[j] + 3 * (1 - t) * t * t * p2[j] + t ** 3 * p3[j]);
  const wavePts = SEGS.flatMap((sg, i) => Array.from({ length: 24 }, (_, j) => bez(sg, j / 24)).slice(i ? 0 : 0)).concat([[432, 131]]);
  const CUR0 = 330; // the cursor's tip rides 12 px under the wave, from here
  const CUR1 = 401; // to where the Figma shows it at rest

  const defs = [
    `<radialGradient id="${id("ball")}" cx="0.5" cy="0.52" r="0.55"><stop offset="0" stop-color="${I}" stop-opacity="0.95"/><stop offset="0.18" stop-color="${C}" stop-opacity="0.95"/><stop offset="0.5" stop-color="${C}" stop-opacity="0.45"/><stop offset="0.85" stop-color="${C}" stop-opacity="0.1"/><stop offset="1" stop-color="${C}" stop-opacity="0.06"/></radialGradient>`,
    `<radialGradient id="${id("dot")}"><stop offset="0" stop-color="${C}" stop-opacity="0.9"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    // Panel glass: dark, lifting a little toward the top.
    `<linearGradient id="${id("glass")}" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${C}" stop-opacity="0.1"/><stop offset="1" stop-color="${C}" stop-opacity="0.02"/></linearGradient>`,
    // The lens: a dome of dark glass with rim light (brightest at the left and front) and a green-white refraction.
    `<radialGradient id="${id("lens")}" cx="0.68" cy="0.3" r="0.72"><stop offset="0.58" stop-color="${C}" stop-opacity="0"/><stop offset="0.84" stop-color="${C}" stop-opacity="0.28"/><stop offset="1" stop-color="${C}" stop-opacity="0.7"/></radialGradient>`,
    `<linearGradient id="${id("streak")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${I}" stop-opacity="0.7"/><stop offset="0.4" stop-color="${C}" stop-opacity="0.6"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></linearGradient>`,
    `<linearGradient id="${id("column")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity="0.3"/><stop offset="1" stop-color="${C}" stop-opacity="0.04"/></linearGradient>`,
    `<radialGradient id="${id("inner")}"><stop offset="0" stop-color="${C}" stop-opacity="0.14"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    `<pattern id="${id("dots")}" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.45" fill="${C}" fill-opacity="0.45"/></pattern>`,
    `<filter id="${id("soft")}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter>`,
  ].join("");

  const still = [];
  const LQ = []; // liquid glass layers (see liquid.mjs)
  // ---- the lens and its base ----
  const LC = [253.2, 237];
  const LRX = 76.4;
  const LRY = 36;
  const BASE = [253.2, 266.5];
  still.push(part("base", `<ellipse cx="${BASE[0]}" cy="${BASE[1]}" rx="77" ry="30.5" fill="url(#${id("dots")})"/><ellipse cx="${BASE[0]}" cy="${BASE[1]}" rx="77" ry="30.5" stroke="${C}" stroke-opacity="0.45" stroke-width="0.9" fill="none"/>`));
  // The dome: an ellipse for the rim, and a cap above it for the curve of the glass.
  const dome = `M${f(LC[0] - LRX)} ${f(LC[1])}A${LRX} ${LRY} 0 0 0 ${f(LC[0] + LRX)} ${f(LC[1])}C${f(LC[0] + LRX)} ${f(LC[1] - 36)} ${f(LC[0] + 38)} ${f(LC[1] - 45)} ${f(LC[0])} ${f(LC[1] - 45)}C${f(LC[0] - 38)} ${f(LC[1] - 45)} ${f(LC[0] - LRX)} ${f(LC[1] - 36)} ${f(LC[0] - LRX)} ${f(LC[1])}Z`;
  still.push(part("lens", `<path d="${dome}" fill="${G}"/><path d="${dome}" fill="url(#${id("lens")})"/>` +
    `<path d="M${f(LC[0] + 2)} ${f(LC[1] - 30)}C${f(LC[0] - 6)} ${f(LC[1] - 8)} ${f(LC[0] - 3)} ${f(LC[1] + 12)} ${f(LC[0] + 2)} ${f(LC[1] + 30)}" stroke="url(#${id("streak")})" stroke-width="3.4" fill="none" filter="url(#${id("soft")})"/>` +
    `<path d="M${f(LC[0] + 18)} ${f(LC[1] - 33)}C${f(LC[0] + 32)} ${f(LC[1] - 30)} ${f(LC[0] + 40)} ${f(LC[1] - 24)} ${f(LC[0] + 44)} ${f(LC[1] - 16)}" stroke="${C}" stroke-opacity="0.85" stroke-width="3.4" fill="none" filter="url(#${id("soft")})"/>` +
    `<path d="M${f(LC[0] - 66)} ${f(LC[1] - 8)}C${f(LC[0] - 60)} ${f(LC[1] - 22)} ${f(LC[0] - 46)} ${f(LC[1] - 30)} ${f(LC[0] - 30)} ${f(LC[1] - 34)}" stroke="${A}" stroke-opacity="0.16" stroke-width="2.4" fill="none" filter="url(#${id("soft")})"/>` +
    `<path d="${dome}" stroke="${C}" stroke-opacity="0.45" stroke-width="0.9" fill="none"/>`));
  // The lens's glass: liquid aurora drifting through it.
  LQ.push(liquid({ id: id("lq"), shape: `<path d="${dome}"/>`, box: [LC[0] - LRX, LC[1] - 45, 2 * LRX, 45 + LRY], T, period: 110, angle: -50, freq: [0.012, 0.02], scale: 46, seed: 9, stops: [[0, G, 0], [0.3, C, 0], [0.4, C, 0.5], [0.45, I, 0.22], [0.52, C, 0.18], [0.6, A, 0.1], [0.7, C, 0], [1, G, 0]] }));
  still.push(part("lens-liquid", LQ[LQ.length - 1].markup));
  // The column of light from the Calibration panel down to the lens.
  still.push(part("column", `<rect x="177" y="191" width="10" height="32" fill="url(#${id("column")})"/>`));

  // ---- the panels ----
  const panelStyle = (d) => `<path d="${d}" fill="${G}" fill-opacity="0.78"/><path d="${d}" fill="url(#${id("glass")})"/><path d="${d}" stroke="${C}" stroke-opacity="0.32" stroke-width="0.9" fill="none"/>`;
  still.push(part("standards", panelStyle(panel(174.1, 80.4, 243.4, 119.1, "br")) + label("Standards", 179, 90.5) + `<path d="M178.5 97H185.6" stroke="${C}" stroke-opacity="0.85" stroke-width="1.1"/><path d="M178.5 105H209.2M178.5 111H196" stroke="${C}" stroke-opacity="0.25" stroke-width="0.9"/>`));
  still.push(part("calibration", panelStyle(panel(114.5, 146.7, 214.4, 190.2, "tr")) + label("Calibration", 209.5, 186.5, 'text-anchor="end"') + `<path d="${ROWS.map(([x0, y, x1]) => `M${x0} ${y}H${x1}`).join("")}" stroke="${C}" stroke-opacity="0.35" stroke-width="0.9"/>`));
  still.push(part("tooling", panelStyle(panel(279, 79.1, 422.6, 157.8, "bl")) + `<ellipse cx="352" cy="112" rx="58" ry="34" fill="url(#${id("inner")})"/>` + label("Tooling", 287, 90.5) + `<path d="M287 97H317.7" stroke="${C}" stroke-opacity="0.4" stroke-width="0.9"/><path d="${waveD}" stroke="${C}" stroke-opacity="0.7" stroke-width="1" fill="none"/>`));
  // The streak's head between Standards and Calibration, where the Figma shows it.
  const MK = [187.1, 126.2];

  // ---- the sphere, over everything ----
  still.push(part("sphere", `<circle cx="${SC[0]}" cy="${SC[1]}" r="${SR}" fill="${G}" fill-opacity="0.7"/><circle class="core" cx="${SC[0]}" cy="${SC[1]}" r="${SR}" fill="url(#${id("ball")})"/><circle cx="${SC[0]}" cy="${SC[1]}" r="${SR}" stroke="${I}" stroke-opacity="0.32" stroke-width="0.9" fill="none"/>` +
    [[247, 108, 0.9], [271, 116, 0.8], [232, 128, 0.8], [282, 141, 0.9], [262, 170, 0.7], [237, 160, 0.8], [255, 103, 0.7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${I}" fill-opacity="0.65"/>`).join("")));

  // ---- motion ----
  const css = [`text{font-family:"Inter Display","Inter",system-ui,sans-serif;font-variation-settings:"opsz" 32}`];
  const kf = (name, stops) => css.push(keyframes(`${cls}_${name}`, stops, T));
  const moving = [];
  const origin = (x, y) => `transform-box:view-box;transform-origin:${n(x)}px ${n(y)}px`;
  // Standards: the second line fills from the left as it is read, holds, and fades back to empty at the end.
  moving.push(part("standards-bar", `<path class="sb" d="M178.5 105H209.2" stroke="${C}" stroke-opacity="0.9" stroke-width="1.1"/>`));
  kf("sb", [[0, "opacity:1;transform:scaleX(0)"], [0.3, "opacity:1;transform:scaleX(0)", EASE_OUT], [1.1, "opacity:1;transform:scaleX(1)"], [4.9, "opacity:1;transform:scaleX(1)", EASE_OUT], [5.15, "opacity:0;transform:scaleX(1)", "step-end"], [T, "opacity:1;transform:scaleX(0)"]]);
  css.push(`.sb{transform:scaleX(0);${origin(178.5, 105)};animation:${cls}_sb ${T}s linear}`);
  // Tooling: the cursor rides the wave, its point on the line, at a constant speed along it.
  const along = wavePts.filter(([x]) => x >= CUR0 - 0.01 && x <= CUR1 + 0.01).map(([x, y]) => [x, y + 12]);
  const lens = [0];
  for (let i = 1; i < along.length; i++) lens.push(lens[i - 1] + Math.hypot(along[i][0] - along[i - 1][0], along[i][1] - along[i - 1][1]));
  const [ax, ay] = along[0];
  const cursor = `<path d="M${f(ax)} ${f(ay)}l11 4.2-4.6 1.8-1.8 4.6z" fill="${C}"/>`;
  moving.push(part("cursor", `<g class="cu"><circle cx="${f(ax + 5)}" cy="${f(ay + 5)}" r="11" fill="url(#${id("dot")})" fill-opacity="0.6"/>${cursor}</g>`));
  const R0 = 1.2;
  const R1 = 2.9;
  const tr = ([x, y]) => `transform:translate(${n(x - ax)}px,${n(y - ay)}px)`;
  const ride = along.map((q, i) => [R0 + ((R1 - R0) * lens[i]) / lens[lens.length - 1], `opacity:1;${tr(q)}`, "linear"]);
  const END = tr(along[along.length - 1]);
  const START = tr(along[0]);
  kf("cu", [[0, `opacity:1;${END}`, EASE_OUT], [0.25, `opacity:0;${END}`, "step-end"], [0.26, `opacity:0;${START}`, EASE_OUT], [0.6, `opacity:1;${START}`, "linear"], ...ride, [T, `opacity:1;${END}`]]);
  css.push(`.cu{animation:${cls}_cu ${T}s linear}`);
  // Calibration: the rows light in turn.
  ROWS.forEach(([x0, y, x1], i) => {
    const t = 3.05 + i * 0.2;
    moving.push(part(`row-${i + 1}`, `<path class="rw${i}" d="M${x0} ${y}H${x1}" stroke="${C}" stroke-opacity="0.95" stroke-width="1.1"/>`));
    kf(`rw${i}`, [[0, "opacity:0"], [t, "opacity:0", "step-end"], [t + 0.01, "opacity:1", EASE_OUT], [t + 1.1, "opacity:0"], [T, "opacity:0"]]);
    css.push(`.rw${i}{opacity:0;animation:${cls}_rw${i} ${T}s linear}`);
  });
  // The sphere's core flares once all three are done.
  moving.push(part("sphere-flare", `<circle class="fl" cx="${SC[0]}" cy="${SC[1]}" r="${SR * 0.7}" fill="url(#${id("dot")})"/>`));
  kf("fl", [[0, "opacity:0"], [3.9, "opacity:0", EASE_OUT], [4.15, "opacity:0.9", EASE_OUT], [4.95, "opacity:0"], [T, "opacity:0"]]);
  css.push(`.fl{opacity:0;animation:${cls}_fl ${T}s linear}`);

  // The streak: up out of the Calibration panel's top, through the gap, into the Standards panel's bottom.
  const sk = streak({ id: id("up"), name: "up", cls, T, head: MK, dir: [0, -1], from: 146.7 - MK[1], speed: 50, exit: 0.5, len: 26, hex: 3.4, clip: [[MK[0] - 20, 119.1], [MK[0] + 20, 119.1], [MK[0] + 20, 146.7], [MK[0] - 20, 146.7]] });
  moving.push(part("streak", sk.markup));
  css.push(...sk.css);

  LQ.forEach((l) => css.push(...l.css));
  return svgDoc(cls, "Induction", css.join("\n"), defs + sk.defs + LQ.map((l) => l.defs).join(""), still.join("") + moving.join(""), { w: W, h: H, desc: meta.alt });
}
