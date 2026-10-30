// New applicant. Two glass cubes stand in isometric on the dark ground: the applicant's (front left, tagged "New
// Applicant") and Deccan's (back right). A beam of light lies between their top faces and data travels along it.
// Drawn from the Figma frame "8" (Deccan AI Experts design, node 477:270), at its own 518 x 339.
// Sequence, as it really happens: the applicant's cube sends a packet of their details out of its far face; the packet
// rides the beam at a constant speed; it enters Deccan's cube; only then does that cube's core flare and settle. One
// packet leaves every 0.8 s, so there is always one in flight, and the receiving core flares once for each.
// 0.00 s: a packet leaves the applicant's cube (its core gives a small flare as it sends) and fades in over 0.25 s.
// 0.00 to 3.60 s: the packet rides the beam (linear), fading out over its last 0.25 s as it enters Deccan's cube.
// 0.40 s into every 0.8 s: a packet arrives and Deccan's core flares, then eases back over 0.65 s.
// Seam (4.0 s = 0 s): five packets share one track, 0.8 s apart, so the loop is the same at every 0.8 s step; each
//   packet goes back to the start while hidden.
import { kit, INK, svgDoc, keyframes, n, C30, EASE_OUT, part } from "../../.claude/skills/illos-hud/kit.mjs";

export const meta = {
  theme: "scifi",
  subject: "request-invite",
  name: "New applicant",
  size: "spot",
  alt: "Two glass cubes in isometric joined by a beam of light. Packets of data leave the applicant's cube, tagged New Applicant, ride the beam and enter the second cube, whose glowing core flares as each one arrives.",
};
export const params = {};

const W = 518;
const H = 339;
const T = 4.0;
const S = 59; // cube side
const D = 212.5; // how far the second cube sits along -y
const GAP = 0.8; // one packet every 0.8 s
const RIDE = 3.6; // a packet's trip along the beam
// Where in the beam each packet rides: across (share of the cube's width) and height (share of its side).
const LANES = [[0.25, 0.92], [0.7, 0.62], [0.45, 0.8], [0.9, 0.35], [0.55, 0.5]];

export function render() {
  const k = kit({ ox: 172, oy: 226 });
  const cls = "sf-request-invite";
  const f = (v) => String(Math.round(v * 10) / 10);
  const P = (pts) => pts.map((q, i) => `${i ? "L" : "M"}${k.iso(...q).map(f).join(" ")}`).join("") + "Z";
  const C = INK.data; // the cyan
  const G = INK.ground;
  const I = INK.read; // the near-white of a hot core
  const id = (s) => `${cls}-${s}`;

  // ---- paint: gradients only, no blur on anything that moves ----
  const defs = [
    // A core: white-hot centre, cyan, fading to nothing.
    `<radialGradient id="${id("core")}"><stop offset="0" stop-color="${I}" stop-opacity="0.95"/><stop offset="0.22" stop-color="${C}" stop-opacity="0.9"/><stop offset="0.55" stop-color="${C}" stop-opacity="0.32"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    // A cool core: cyan all through, no white (only the receiving cube burns white).
    `<radialGradient id="${id("cool")}"><stop offset="0" stop-color="${C}" stop-opacity="0.85"/><stop offset="0.5" stop-color="${C}" stop-opacity="0.35"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${id("bloom")}"><stop offset="0" stop-color="${C}" stop-opacity="0.1"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${id("dot")}"><stop offset="0" stop-color="${C}" stop-opacity="0.9"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    // Glass faces: a little cyan over the dark, lighter toward the top edge.
    `<linearGradient id="${id("glass")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity="0.1"/><stop offset="1" stop-color="${C}" stop-opacity="0.02"/></linearGradient>`,
    `<linearGradient id="${id("top")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C}" stop-opacity="0.06"/><stop offset="1" stop-color="${C}" stop-opacity="0.14"/></linearGradient>`,
    // The beam: strong where it leaves the applicant's cube, thinner toward Deccan's.
    `<linearGradient id="${id("beam")}" gradientUnits="userSpaceOnUse" x1="${f(k.iso(S / 2, 0, S)[0])}" y1="${f(k.iso(S / 2, 0, S)[1])}" x2="${f(k.iso(S / 2, -D + S, S)[0])}" y2="${f(k.iso(S / 2, -D + S, S)[1])}"><stop offset="0" stop-color="${C}" stop-opacity="0.42"/><stop offset="0.7" stop-color="${C}" stop-opacity="0.22"/><stop offset="1" stop-color="${C}" stop-opacity="0.12"/></linearGradient>`,
    `<filter id="${id("soft")}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>`,
    // The cores are soft: their stepped shapes are blurred (they never move, so the blur is drawn once).
    `<filter id="${id("haze")}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="1.7"/></filter>`,
    // The beam's side, lit from the top.
    `<linearGradient id="${id("side")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity="0.2"/><stop offset="1" stop-color="${C}" stop-opacity="0.02"/></linearGradient>`,
  ].join("");

  // A glass cube with its corner at (0, y0, 0): hidden edges faint, a stepped core inside, translucent faces, cyan edges.
  const cube = (y0, hot) => {
    const v = (x, y, z) => [x * S, y0 + y * S, z * S];
    const centre = k.iso(S / 2, y0 + S / 2, S / 2);
    // The silhouette of a cube scaled about its centre: the six outer corners.
    const hex = (sc) => {
      const c = (x, y, z) => [S / 2 + (x - 0.5) * S * sc, y0 + S / 2 + (y - 0.5) * S * sc, S / 2 + (z - 0.5) * S * sc];
      return P([c(0, 0, 1), c(1, 0, 1), c(1, 0, 0), c(1, 1, 0), c(0, 1, 0), c(0, 1, 1)]);
    };
    const hidden = [[v(0, 0, 0), v(1, 0, 0)], [v(0, 0, 0), v(0, 1, 0)], [v(0, 0, 0), v(0, 0, 1)]].map(([a, b]) => `M${k.iso(...a).map(f).join(" ")}L${k.iso(...b).map(f).join(" ")}`).join("");
    const out = [];
    out.push(`<path d="${P([v(0, 0, 1), v(1, 0, 1), v(1, 0, 0), v(1, 1, 0), v(0, 1, 0), v(0, 1, 1)])}" fill="${G}" fill-opacity="0.55"/>`);
    out.push(`<path d="${hidden}" stroke="${C}" stroke-opacity="0.3" stroke-width="0.8" fill="none"/>`);
    // The stepped core: nested cube silhouettes, brighter toward the middle, then the glow itself.
    out.push(`<g filter="url(#${id("haze")})">${[[0.82, 0.08], [0.64, 0.16], [0.48, 0.34], [0.34, 0.55]].map(([sc, o]) => `<path d="${hex(sc)}" fill="${C}" fill-opacity="${o * (hot ? 1.2 : 1)}"/>`).join("")}</g>`);
    out.push(`<circle cx="${f(centre[0])}" cy="${f(centre[1])}" r="${f(S * 0.95)}" fill="url(#${id("bloom")})"/>`);
    out.push(`<circle class="${hot ? "rx" : "tx"}" cx="${f(centre[0])}" cy="${f(centre[1])}" r="${f(S * (hot ? 0.34 : 0.26))}" fill="url(#${id(hot ? "core" : "cool")})"/>`);
    // Translucent faces, then the edges.
    out.push(`<path d="${P([v(0, 0, 1), v(1, 0, 1), v(1, 1, 1), v(0, 1, 1)])}" fill="url(#${id("top")})"/>`);
    out.push(`<path d="${P([v(0, 1, 1), v(1, 1, 1), v(1, 1, 0), v(0, 1, 0)])}" fill="url(#${id("glass")})"/>`);
    out.push(`<path d="${P([v(1, 1, 1), v(1, 0, 1), v(1, 0, 0), v(1, 1, 0)])}" fill="url(#${id("glass")})" fill-opacity="0.7"/>`);
    const edges = [
      [v(0, 0, 1), v(1, 0, 1)], [v(1, 0, 1), v(1, 1, 1)], [v(1, 1, 1), v(0, 1, 1)], [v(0, 1, 1), v(0, 0, 1)],
      [v(0, 1, 1), v(0, 1, 0)], [v(1, 1, 1), v(1, 1, 0)], [v(1, 0, 1), v(1, 0, 0)],
      [v(0, 1, 0), v(1, 1, 0)], [v(1, 1, 0), v(1, 0, 0)],
    ].map(([a, b]) => `M${k.iso(...a).map(f).join(" ")}L${k.iso(...b).map(f).join(" ")}`).join("");
    out.push(`<path d="${edges}" stroke="${C}" stroke-width="2.4" stroke-opacity="0.1" fill="none" filter="url(#${id("soft")})"/>`);
    out.push(`<path d="${edges}" stroke="${C}" stroke-width="1" stroke-opacity="0.52" fill="none" stroke-linejoin="round"/>`);
    // Deccan's core burns white at its centre and throws a streak toward its near bottom corner.
    if (hot) {
      const [c0, c1] = centre;
      const [e0, e1] = k.iso(...v(1, 1, 0));
      out.push(`<path d="M${f(c0)} ${f(c1)}L${f(c0 + (e0 - c0) * 0.75)} ${f(c1 + (e1 - c1) * 0.75)}" stroke="${I}" stroke-opacity="0.5" stroke-width="1.4" stroke-linecap="round" filter="url(#${id("soft")})"/>`);
      out.push(`<circle cx="${f(c0 + (e0 - c0) * 0.12)}" cy="${f(c1 + (e1 - c1) * 0.12)}" r="5" fill="${I}" fill-opacity="0.9" filter="url(#${id("soft")})"/>`);
    }
    // The near bottom edge of the hot cube catches the light.
    if (hot) out.push(`<path d="M${k.iso(...v(1, 1, 0)).map(f).join(" ")}L${k.iso(...v(1, 0, 0)).map(f).join(" ")}" stroke="${I}" stroke-opacity="0.55" stroke-width="1.1"/>`);
    return out.join("");
  };

  const still = [];
  // Deccan's cube sits behind the beam, the applicant's in front of it.
  still.push(part("deccan-cube", cube(-D, true)));
  // The beam: a sheet of light in the plane of the top faces, from the applicant's far face to Deccan's near face.
  still.push(part("beam", `<path d="${P([[0, 0, S], [S, 0, S], [S, -D + S, S], [0, -D + S, S]])}" fill="url(#${id("beam")})"/>` + `<path d="${P([[S, 0, S], [S, -D + S, S], [S, -D + S, 0], [S, 0, 0]])}" fill="url(#${id("side")})"/>` + `<path d="M${k.iso(0, 0, S).map(f).join(" ")}L${k.iso(0, -D + S, S).map(f).join(" ")}" stroke="${C}" stroke-opacity="0.22" stroke-width="0.8"/>`));
  // Fine dust in the beam.
  const DUST = [[0.15, -0.12, 1], [0.55, -0.2, 0.8], [0.9, -0.3, 0.5], [0.3, -0.42, 0.9], [0.7, -0.5, 0.6], [0.1, -0.62, 1], [0.48, -0.7, 0.7], [0.85, -0.78, 0.4], [0.25, -0.88, 0.95], [0.62, -0.95, 0.75], [0.38, -0.3, 0.55], [0.95, -0.6, 0.3], [0.75, -0.84, 0.88], [0.4, -0.97, 0.45]];
  still.push(part("dust", DUST.map(([a, b, c], i) => { const [x, y] = k.iso(a * S, b * (D - S), c * S); return `<circle cx="${f(x)}" cy="${f(y)}" r="${i % 3 ? 0.8 : 1.2}" fill="${C}" fill-opacity="${i % 2 ? 0.45 : 0.75}"/>`; }).join("")));
  still.push(part("applicant-cube", cube(0, false)));
  // The tag: a small plate standing on the cube's far left top edge, its name set in that plane.
  const tagP = (u, w) => { const [x, y] = k.iso(0, S - u, S); return [x, y - w]; };
  // The plate runs from u0 to u1 along the edge (the edge's screen direction has length 1, so units are px) and is TH tall.
  // The text is fitted to the plate with textLength and centred on it: its cap height is about 0.73 of the font size.
  const U0 = 3;
  const U1 = S - 4;
  const TH = 14;
  const PAD = 5;
  const FS = 7.2;
  const tag = [tagP(U0, 0), tagP(U1, 0), tagP(U1, TH), tagP(U0, TH)];
  const [tx, ty] = tagP(U0 + PAD, (TH - FS * 0.73) / 2);
  still.push(part("tag", `<path d="M${tag.map((q) => q.map(f).join(" ")).join("L")}Z" fill="${G}" fill-opacity="0.65" stroke="${C}" stroke-opacity="0.38" stroke-width="0.8"/>` + `<text class="lab" transform="matrix(${f(C30)},-0.5,0,1,${f(tx)},${f(ty)})" font-family="Inter Display, Inter, system-ui, sans-serif" font-size="${FS}" textLength="${U1 - U0 - 2 * PAD}" lengthAdjust="spacingAndGlyphs" fill="${C}" fill-opacity="0.72" stroke="none">New Applicant</text>`));

  // ---- motion ----
  const css = [`text{font-family:"Inter Display","Inter",system-ui,sans-serif;font-variation-settings:"opsz" 32}`];
  const kf = (name, stops, total = T) => css.push(keyframes(`${cls}_${name}`, stops, total));
  const moving = [];
  // A packet: a streak behind it and a bright head, drawn at the start of its lane and carried along the beam.
  const L = D - S - 4; // how far it rides, in world units
  const [mx, my] = [L * C30, -L * 0.5]; // that, on screen
  const tr = (u) => `transform:translate(${n(mx * u)}px,${n(my * u)}px)`;
  const trails = [];
  LANES.forEach(([a, h], i) => {
    const [x, y] = k.iso(a * S, -2, h * S);
    const [bx, by] = [x - 46 * C30, y + 23]; // the trail's tail, back along the beam
    trails.push(`<linearGradient id="${id(`trail${i}`)}" gradientUnits="userSpaceOnUse" x1="${f(bx)}" y1="${f(by)}" x2="${f(x)}" y2="${f(y)}"><stop offset="0" stop-color="${C}" stop-opacity="0"/><stop offset="1" stop-color="${C}" stop-opacity="0.32"/></linearGradient>`);
    moving.push(part(`packet-${i + 1}`, `<g class="pk" style="animation-delay:${n(-i * GAP)}s"><path d="M${f(bx)} ${f(by)}L${f(x)} ${f(y)}" stroke="url(#${id(`trail${i}`)})" stroke-width="9" stroke-linecap="round"/><circle cx="${f(x)}" cy="${f(y)}" r="10" fill="url(#${id("dot")})"/><circle cx="${f(x)}" cy="${f(y)}" r="4" fill="${C}"/><circle cx="${f(x - 0.8)}" cy="${f(y - 0.8)}" r="1.3" fill="${I}" fill-opacity="0.8"/></g>`));
  });
  kf("pk", [[0, `opacity:0;${tr(0)}`, "linear"], [0.25, `opacity:1;${tr(0.25 / RIDE)}`, "linear"], [RIDE - 0.25, `opacity:1;${tr((RIDE - 0.25) / RIDE)}`, "linear"], [RIDE, `opacity:0;${tr(1)}`, "step-end"], [T, `opacity:0;${tr(1)}`]]);
  css.push(`.pk{opacity:0;animation:${cls}_pk ${T}s linear}`);
  // Deccan's core flares as each packet arrives (every 0.8 s, 0.05 s into the step), and settles.
  const at = RIDE % GAP;
  kf("rx", [[0, "opacity:0.62"], [at, "opacity:0.62", "step-end"], [at + 0.01, "opacity:1", EASE_OUT], [GAP - 0.1, "opacity:0.62"], [GAP, "opacity:0.62"]], GAP);
  css.push(`.rx{opacity:0.62;animation:${cls}_rx ${GAP}s linear}`);
  // The applicant's core gives a small flare as each packet leaves.
  kf("tx", [[0, "opacity:0.72", EASE_OUT], [0.06, "opacity:1", EASE_OUT], [0.55, "opacity:0.72"], [GAP, "opacity:0.72"]], GAP);
  css.push(`.tx{opacity:0.72;animation:${cls}_tx ${GAP}s linear}`);

  return svgDoc(cls, "New applicant", css.join("\n"), defs + trails.join(""), still.join("") + moving.join(""), { w: W, h: H, desc: meta.alt });
}
