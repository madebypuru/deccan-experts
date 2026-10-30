// Project deployment. A thick glass board of live projects stands at the left, its face lit like liquid light. Four glass
// cubes, the live projects, fly into it, each pulling a trail of light; the board opens a hole for each as it comes close.
// Drawn from the Figma frame "3" (Deccan AI Experts design, node 420:1053), at its own 518 x 339. The board's top edge
// slopes at about -0.45, not true isometric, so the board is built from the Figma's measured corners and its contents
// are drawn in that plane.
// Sequence, as it really happens: projects go live by flying into the board. Every cube travels in from off the frame at
// the same angle (34 degrees, close to the Figma's beams), pulling its trail, straight at its own place on the face (the
// Figma's two slots and two frames). The face is whole until a cube comes close: then a dark hole slides open there,
// the cube shrinks into it (it is going away, into the board), its trail drawn in after it, and fades in the dark; once
// it has passed through, the hole slides shut. Nothing waits outside the board: every cube is on its way in.
// Each cube flies in fast and slows as it nears the board (its speed falls steadily to a third), then keeps that pace
// into the hole: it never stops. They go in at about 0.1, 0.3, 1.0 and 1.35 s, and are back in from off the frame by
// about 1.9 to 3.1 s for the next run.
// A hole slides open (ease out, 0.35 s) as its cube comes within about one and a half cube widths, and slides shut
// (ease in, 0.35 s) just after the cube is through.
// The board's liquid light drifts through its rippled glass the whole time, one repeat of its bands per cycle.
// Seam (4.8 s = 0 s): every cube is in flight at the place the Figma shows; the two nearest the face have their holes
// open; everything moves straight through.
import { kit, INK, svgDoc, keyframes, n, C30, part } from "../../.claude/skills/illos-hud/kit.mjs";
import { liquid } from "./liquid.mjs";

export const meta = {
  theme: "scifi",
  subject: "project-deployment",
  name: "Project deployment",
  size: "spot",
  bleed: true, // the cubes fly in from off the frame at the lower right, trails behind them, as in the Figma
  alt: "A thick glass board labelled Live Projects with a glowing face, and four glass cubes flying into it trailing light. As each cube comes close a dark hole slides open in the face; the cube shrinks into it and is gone, and the hole slides shut.",
};
export const params = {};

const W = 518;
const H = 339;
const T = 4.8;
// The board's front face corners (screen, measured from the Figma's 3x export; it is not a parallelogram: the face is
// 138 tall at the left, 122 at the right), and how far back its thickness goes (screen offset).
const FTL = [170.7, 153.3];
const FTR = [342.7, 56];
const FBR = [342.5, 178];
const FBL = [170.7, 291.7];
const BACK = [-20.5, -15.7];
// Where the cubes go in: the Figma's two dark slots and two empty frames, as screen quads (top left, top right, bottom
// right, bottom left). They are holes that open only while a cube goes through; each is cut in the face's plane where
// its cube's line meets the face, sized to the cube.
const SLOTS = [[[260, 128.3], [284.3, 108.3], [284.3, 135], [260, 153.3]], [[234.7, 165], [260, 145], [260, 173.3], [234.7, 194.3]]];
const FRAMES = [[[188.7, 173.3], [213.3, 152.7], [213.3, 181], [188.7, 201]], [[189.3, 236.7], [213.3, 222.7], [213.3, 253.3], [189.3, 265]]];
// The cubes: centre on screen, side.
const CUBES = [[205, 176.7, 19], [329.3, 156.7, 24], [218.3, 253.3, 24.6], [322.3, 231.7, 34.6]];
// Each cube's run: which cube, its hole, how far behind its Figma place it starts (off the frame), how long it takes to
// reach the hole, its trail's length and strength, and how small it gets going in. Far cubes first (drawn behind).
const LANES = [[0, FRAMES[0], 330, 2.6, 190, 0.14, 0.65], [1, SLOTS[0], 280, 3.2, 210, 0.16, 0.55], [2, FRAMES[1], 205, 2.0, 250, 0.24, 0.5], [3, SLOTS[1], 260, 3.6, 300, 0.3, 0.38]];
const DIR = [-Math.cos((34 * Math.PI) / 180), -Math.sin((34 * Math.PI) / 180)];

export function render() {
  void kit;
  const cls = "sf-project-deployment";
  const f = (v) => String(Math.round(v * 10) / 10);
  const C = INK.data;
  const G = INK.ground;
  const I = INK.read;
  const id = (s) => `${cls}-${s}`;
  const P = (pts) => `M${pts.map((q) => q.map(f).join(" ")).join("L")}Z`;
  const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s];
  const TOPLEN = Math.hypot(FTR[0] - FTL[0], FTR[1] - FTL[1]);
  const EU = [(FTR[0] - FTL[0]) / TOPLEN, (FTR[1] - FTL[1]) / TOPLEN]; // along the board's top edge
  // A cube centred on (cx, cy) with side s, in true isometric.
  const cube = (cx, cy, s) => {
    const h = s / 2;
    const v = (x, y, z) => [cx + (x - y) * h * C30, cy + ((x + y) * h) / 2 - z * h];
    return { v, centre: [cx, cy] };
  };

  const defs = [
    `<radialGradient id="${id("core")}"><stop offset="0" stop-color="${I}" stop-opacity="0.95"/><stop offset="0.25" stop-color="${C}" stop-opacity="0.85"/><stop offset="0.6" stop-color="${C}" stop-opacity="0.25"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${id("dot")}"><stop offset="0" stop-color="${C}" stop-opacity="0.9"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    // The face: liquid light, brightest toward the top right.
    `<radialGradient id="${id("face")}" gradientUnits="userSpaceOnUse" cx="${FTR[0]}" cy="${FTR[1]}" r="200"><stop offset="0" stop-color="${C}" stop-opacity="0.98"/><stop offset="0.35" stop-color="${C}" stop-opacity="0.85"/><stop offset="0.62" stop-color="${C}" stop-opacity="0.25"/><stop offset="0.85" stop-color="${C}" stop-opacity="0.06"/></radialGradient>`,
    `<linearGradient id="${id("edge")}" gradientUnits="userSpaceOnUse" x1="${FTL[0]}" y1="0" x2="${FTR[0]}" y2="0"><stop offset="0" stop-color="${C}" stop-opacity="0.45"/><stop offset="0.16" stop-color="${C}" stop-opacity="0"/><stop offset="0.86" stop-color="${C}" stop-opacity="0"/><stop offset="1" stop-color="${C}" stop-opacity="0.75"/></linearGradient>`,
    `<linearGradient id="${id("glass")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity="0.16"/><stop offset="1" stop-color="${C}" stop-opacity="0.05"/></linearGradient>`,
    `<pattern id="${id("dots")}" width="3.4" height="3.4" patternUnits="userSpaceOnUse"><circle cx="1.7" cy="1.7" r="0.45" fill="${C}" fill-opacity="0.5"/></pattern>`,
    `<filter id="${id("haze")}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.8"/></filter>`,
    `<filter id="${id("soft")}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>`,
  ];

  const still = [];
  // ---- the board ----
  const BTL = add(FTL, BACK);
  const BTR = add(FTR, BACK);
  const BBL = add(FBL, BACK);
  still.push(part("board-sides", `<path d="${P([BTL, BTR, FTR, FTL])}" fill="${G}" fill-opacity="0.6"/><path d="${P([BTL, BTR, FTR, FTL])}" fill="url(#${id("dots")})"/><path d="${P([BTL, FTL, FBL, BBL])}" fill="${G}" fill-opacity="0.6"/><path d="${P([BTL, FTL, FBL, BBL])}" fill="url(#${id("dots")})"/>`));
  // The face: liquid light, brightest at the top right and along the far edge, dark ink through the middle. It is whole:
  // holes open in it only while a cube goes through.
  const FACE = P([FTL, FTR, FBR, FBL]);
  // The face's liquid: dark pools with dim-cyan rims and a bright crest, drifting through the rippled glass.
  const lq = liquid({ id: id("lq"), shape: `<path d="${FACE}"/>`, box: [170.7, 56, 172, 235.7], T, period: 150, angle: -38, freq: [0.007, 0.013], scale: 62, seed: 4,
    stops: [[0, G, 0], [0.2, INK.dataDim, 0.25], [0.3, G, 0.85], [0.4, INK.dataDim, 0.35], [0.5, C, 0], [0.62, C, 0.6], [0.67, I, 0.2], [0.74, C, 0.25], [1, G, 0]] });
  defs.push(lq.defs);
  still.push(part("board-face", `<path d="${FACE}" fill="${G}"/><path d="${FACE}" fill="url(#${id("face")})"/><path d="${FACE}" fill="url(#${id("edge")})"/>` +
    lq.markup));
  still.push(part("board-edges", `<path d="${P([FTL, FTR, FBR, FBL])}" stroke="${C}" stroke-opacity="0.7" stroke-width="1" fill="none"/><path d="M${f(BTL[0])} ${f(BTL[1])}L${f(BTR[0])} ${f(BTR[1])}L${f(FTR[0])} ${f(FTR[1])}M${f(BTL[0])} ${f(BTL[1])}L${f(BBL[0])} ${f(BBL[1])}L${f(FBL[0])} ${f(FBL[1])}M${f(BTL[0])} ${f(BTL[1])}L${f(FTL[0])} ${f(FTL[1])}" stroke="${C}" stroke-opacity="0.55" stroke-width="0.9" fill="none"/>`));
  // The tag: a plate standing on the board's back top edge, its name fitted to it, in that plane.
  const TU0 = 2;
  const TU1 = 60;
  const TH = 14;
  const PAD = 5;
  const FS = 7.4;
  const tp = (u, w) => [BTL[0] + u * EU[0], BTL[1] + u * EU[1] - w];
  const [tx, ty] = tp(TU0 + PAD, (TH - FS * 0.73) / 2);
  still.push(part("tag", `<path d="${P([tp(TU0, 0), tp(TU1, 0), tp(TU1, TH), tp(TU0, TH)])}" fill="${G}" fill-opacity="0.7" stroke="${C}" stroke-opacity="0.45" stroke-width="0.8"/><text class="lab" transform="matrix(${f(EU[0])},${f(EU[1])},0,1,${f(tx)},${f(ty)})" font-family="Inter Display, Inter, system-ui, sans-serif" font-size="${FS}" textLength="${TU1 - TU0 - 2 * PAD}" lengthAdjust="spacingAndGlyphs" fill="${C}" fill-opacity="0.85" stroke="none">&gt; Live Projects</text>`));

  // ---- the cubes ----
  // A cube in flight drops the blur on its inner glow (a blurred part that moves costs every frame); its stepped glow
  // and core carry it.
  const cubeSvg = ([cx, cy, s], i, still = true) => {
    const { v, centre } = cube(cx, cy, s);
    const sil = P([v(-1, -1, 1), v(1, -1, 1), v(1, -1, -1), v(1, 1, -1), v(-1, 1, -1), v(-1, 1, 1)]);
    const hex = (sc) => { const w = (x, y, z) => { const [px, py] = v(x * sc, y * sc, z * sc); return [px, py]; }; return P([w(-1, -1, 1), w(1, -1, 1), w(1, -1, -1), w(1, 1, -1), w(-1, 1, -1), w(-1, 1, 1)]); };
    const hidden = [[v(-1, -1, -1), v(1, -1, -1)], [v(-1, -1, -1), v(-1, 1, -1)], [v(-1, -1, -1), v(-1, -1, 1)]].map(([a, b]) => `M${a.map(f).join(" ")}L${b.map(f).join(" ")}`).join("");
    const edges = [[v(-1, -1, 1), v(1, -1, 1)], [v(1, -1, 1), v(1, 1, 1)], [v(1, 1, 1), v(-1, 1, 1)], [v(-1, 1, 1), v(-1, -1, 1)], [v(-1, 1, 1), v(-1, 1, -1)], [v(1, 1, 1), v(1, 1, -1)], [v(1, -1, 1), v(1, -1, -1)], [v(-1, 1, -1), v(1, 1, -1)], [v(1, 1, -1), v(1, -1, -1)]].map(([a, b]) => `M${a.map(f).join(" ")}L${b.map(f).join(" ")}`).join("");
    return [
      `<path d="${sil}" fill="${G}" fill-opacity="0.5"/>`,
      `<path d="${hidden}" stroke="${I}" stroke-opacity="0.22" stroke-width="0.7" fill="none"/>`,
      `<g${still ? ` filter="url(#${id("haze")})"` : ""}>${[[0.8, 0.12], [0.58, 0.22], [0.4, 0.38]].map(([sc, o]) => `<path d="${hex(sc)}" fill="${C}" fill-opacity="${o}"${still ? "" : ` stroke="${C}" stroke-opacity="${o * 0.5}" stroke-width="2.5" stroke-linejoin="round"`}/>`).join("")}</g>`,
      `<circle class="core${i}" cx="${f(centre[0])}" cy="${f(centre[1])}" r="${f(s * 0.62)}" fill="url(#${id("core")})"/>`,
      `<path d="${P([v(-1, -1, 1), v(1, -1, 1), v(1, 1, 1), v(-1, 1, 1)])}" fill="${I}" fill-opacity="0.08"/>`,
      `<path d="${P([v(-1, 1, 1), v(1, 1, 1), v(1, 1, -1), v(-1, 1, -1)])}" fill="${I}" fill-opacity="0.09"/>`,
      `<path d="${P([v(1, 1, 1), v(1, -1, 1), v(1, -1, -1), v(1, 1, -1)])}" fill="${I}" fill-opacity="0.06"/>`,
      `<path d="${edges}" stroke="${I}" stroke-opacity="0.5" stroke-width="0.9" fill="none" stroke-linejoin="round"/>`,
    ].join("");
  };
  // ---- motion ----
  const css = [`text{font-family:"Inter Display","Inter",system-ui,sans-serif;font-variation-settings:"opsz" 32}`];
  const kf = (name, stops, total = T) => css.push(keyframes(`${cls}_${name}`, stops, total));
  const moving = [];
  const holes = []; // drawn under every cube
  const origin = ([x, y]) => `transform-box:view-box;transform-origin:${n(x)}px ${n(y)}px`;
  const easeOut = (x) => 1 - (1 - x) ** 3;
  const easeIn = (x) => x ** 3;
  // Keyframes from a function of time: sampled every 0.05 s and at the given times; a point is dropped only when the
  // straight line from the last point kept to the next one passes within `tol` of every sample in between (px for
  // positions, a small fraction for scales and opacity); `jumps` are instants where the value changes in one step (unseen).
  const track = (name, fn, fmt, times, jumps = [], tol = 0.15) => {
    const ts = new Set([0, T]);
    for (let t = 0; t <= T + 1e-9; t += 0.05) ts.add(Math.round(t * 1000) / 1000);
    times.forEach((t) => ts.add(Math.round((((t % T) + T) % T) * 1000) / 1000));
    const js = jumps.map((t) => Math.round((((t % T) + T) % T) * 1000) / 1000);
    js.forEach((t) => { ts.add(t); ts.add(Math.round((t + 0.01) * 1000) / 1000); });
    const pts = [...ts].filter((t) => t >= 0 && t <= T).sort((a, b) => a - b).map((t) => ({ t, v: js.includes(t) ? fn(t - 1e-6) : fn(t), step: js.includes(t) }));
    const keep = [pts[0]];
    let last = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const b = pts[i + 1];
      const a = pts[last];
      const fits = !pts[i].step && !pts[i - 1].step && pts.slice(last + 1, i + 1).every((p) => p.v.every((v, j) => Math.abs(a.v[j] + ((b.v[j] - a.v[j]) * (p.t - a.t)) / (b.t - a.t) - v) <= tol));
      if (!fits) { keep.push(pts[i]); last = i; }
    }
    keep.push(pts[pts.length - 1]);
    kf(name, keep.map((p) => (p.step ? [p.t, fmt(p.v), "step-end"] : [p.t, fmt(p.v)])));
    return fmt(keep[0].v);
  };

  LANES.forEach(([ci, Q0, D0, J, LEN, OP, K], li) => {
    const [cx, cy, s] = CUBES[ci];
    const cls2 = `ln${li}`;
    // The hole's centre, how far along DIR the cube travels until it is over it, and the hole moved onto the cube's line.
    const hc0 = [(Q0[0][0] + Q0[2][0]) / 2, (Q0[0][1] + Q0[2][1]) / 2];
    const DOOR = (hc0[0] - cx) / DIR[0];
    const hit = [cx + DIR[0] * DOOR, cy + DIR[1] * DOOR];
    // The hole is cut in the face's own plane: a rectangle in the face's (across, down) coordinates around the hit
    // point, so its top and bottom follow the face's slope there and its sides stay upright, like the face's edges.
    const across = (hit[0] - FTL[0]) / (FTR[0] - FTL[0]);
    const onFace = (a, b) => { const t = [FTL[0] + (FTR[0] - FTL[0]) * a, FTL[1] + (FTR[1] - FTL[1]) * a]; const d = [FBL[0] + (FBR[0] - FBL[0]) * a, FBL[1] + (FBR[1] - FBL[1]) * a]; return [t[0] + (d[0] - t[0]) * b, t[1] + (d[1] - t[1]) * b]; };
    const tall = onFace(across, 1)[1] - onFace(across, 0)[1];
    const down = (hit[1] - onFace(across, 0)[1]) / tall;
    const wa = (1.25 * s) / (FTR[0] - FTL[0]);
    const hb = (1.45 * s) / tall;
    const Q = [onFace(across - wa / 2, down - hb / 2), onFace(across + wa / 2, down - hb / 2), onFace(across + wa / 2, down + hb / 2), onFace(across - wa / 2, down + hb / 2)];
    // Speed falls steadily from v0 to a third of it on the way to the hole, then holds while it goes in.
    const v0 = (2 * (DOOR + D0)) / (J * (1 + 1 / 3));
    const v1 = v0 / 3;
    const E = 0.45;
    const pos = (u) => (u <= J ? -D0 + v0 * u - ((v0 - v1) * u * u) / (2 * J) : DOOR + v1 * (u - J));
    const timeAt = (d) => { let lo = 0; let hi = J; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (pos(m) < d) lo = m; else hi = m; } return lo; };
    const u0 = timeAt(0); // where it is at the start: its place in the Figma
    const tOf = (u) => u - u0;
    const uOf = (t) => (((t + u0) % T) + T) % T;
    const uEnd = J + E;
    // The hole: a plain dark opening with a fine edge, drawn in the face's plane (the unit square mapped onto the quad),
    // sliding open across its width as the cube comes close, and shut once it is through.
    const mx = `matrix(${f(Q[1][0] - Q[0][0])},${f(Q[1][1] - Q[0][1])},${f(Q[3][0] - Q[0][0])},${f(Q[3][1] - Q[0][1])},${f(Q[0][0])},${f(Q[0][1])})`;
    holes.push(part(`hole-${li + 1}`, `<g transform="${mx}"><g class="${cls2}h"><path d="M0 0H1V1H0Z" fill="${G}" fill-opacity="0.94"/><path d="M0 0H1V1H0Z" stroke="${C}" stroke-opacity="0.75" stroke-width="0.9" vector-effect="non-scaling-stroke" fill="none"/></g></g>`));
    const open = Math.max(0.36, timeAt(DOOR - 1.6 * s)) - 0.35; // fully open as the cube comes within 1.6 sides
    const shut = uEnd + 0.05;
    const slotAt = (u) => [Math.max(0.001, u < open ? 0 : u < open + 0.35 ? easeOut((u - open) / 0.35) : u < shut ? 1 : u < shut + 0.35 ? 1 - easeIn((u - shut) / 0.35) : 0)];
    const slot = (v) => `opacity:${v[0] < 0.01 ? 0 : 1};transform:translateX(0.5px) scaleX(${n(v[0])}) translateX(-0.5px)`;
    const h0 = track(`${cls2}h`, (t) => slotAt(uOf(t)), slot, [tOf(open), tOf(open + 0.35), tOf(shut), tOf(shut + 0.35)], [], 0.01);
    css.push(`.${cls2}h{${h0};transform-origin:0 0;animation:${cls}_${cls2}h ${T}s linear}`);
    // The cube and its trail travel together, then shrink into the slot and fade; the cube waits off the frame for its
    // next run.
    const ang = (Math.atan2(-DIR[1], -DIR[0]) * 180) / Math.PI;
    defs.push(`<linearGradient id="${id(`trail${li}`)}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C}" stop-opacity="${OP}"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></linearGradient>`);
    defs.push(`<linearGradient id="${id(`streak${li}`)}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C}" stop-opacity="0.95"/><stop offset="0.5" stop-color="${C}" stop-opacity="0.35"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></linearGradient>`);
    const trail = `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(ang)})"><g class="${cls2}t"><rect x="0" y="${f(-0.62 * s)}" width="${LEN}" height="${f(1.24 * s)}" fill="url(#${id(`trail${li}`)})"/><rect x="0" y="-0.8" width="${f(LEN * 0.7)}" height="1.6" fill="url(#${id(`streak${li}`)})"/></g></g>`;
    moving.push(part(`cube-${ci + 1}`, `<g class="${cls2}"><g class="${cls2}s">${trail}${cubeSvg(CUBES[ci], ci, false)}</g></g>`));
    const at = (u) => [u <= uEnd ? pos(u) : -D0];
    const mv = (v) => `transform:translate(${n(DIR[0] * v[0])}px,${n(DIR[1] * v[0])}px)`;
    const m0 = track(cls2, (t) => at(uOf(t)), mv, [tOf(J), tOf(T)], [tOf(uEnd)]);
    css.push(`.${cls2}{${m0};animation:${cls}_${cls2} ${T}s linear}`);
    // Going in: it shrinks toward its own centre (ease in) and fades over the second half; back to full size off the frame.
    const inAt = (u) => {
      if (u < J || u > uEnd + 0.005) return [1, 1];
      const x = (u - J) / E;
      return [1 - (1 - K) * easeIn(Math.min(1, x * 1.15)), x < 0.5 ? 1 : 1 - (x - 0.5) / 0.5];
    };
    const goIn = (v) => `opacity:${n(v[1])};transform:scale(${n(v[0])})`;
    const s0 = track(`${cls2}s`, (t) => inAt(uOf(t)), goIn, [tOf(J), tOf(uEnd)], [tOf(uEnd)], 0.01);
    css.push(`.${cls2}s{${s0};${origin([cx, cy])};animation:${cls}_${cls2}s ${T}s linear}`);
  });
  // The liquid drifts through the glass by exactly one repeat of its bands per cycle.
  css.push(...lq.css);

  return svgDoc(cls, "Project deployment", css.join("\n"), defs.join(""), still.join("") + holes.join("") + moving.join(""), { w: W, h: H, desc: meta.alt });
}
