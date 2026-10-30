// Profile evaluation. The applicant, a glass sphere, stands on an iridescent pedestal; a thin pillar of light rises from
// the pedestal's rim to a marker; beside them a thick glass panel holds their profile ("Profile #35": an avatar, two
// lines, three dots) with three markers floating in front of it, each joined to the panel by a trail of light.
// Drawn from the Figma frame "5" (Deccan AI Experts design, node 444:179), at its own 518 x 339.
// Sequence, as it really happens: a streak of light rises out of the pedestal's rim past the applicant (the scan); as it
// climbs, the panel sends its three checks out toward the applicant: three streaks shoot straight out of the panel's
// face, heads first, trails behind; once all three are out, the profile lights (avatar, lines, a wash over the panel).
// Every hexagon with a line in the Figma is one of these streaks in flight (see streak.mjs), never a fixed post.
// The loop starts on the Figma's pose: all four streaks in flight where the Figma shows them.
// 0.00 to 0.35 s: the streaks travel on at their own steady speeds and fade.
// 0.35 to 1.95 s: the profile lights and settles.
// 2.36 s: the scan streak comes up out of the pedestal's rim (90 px/s).
// 2.93 s: the three checks come out of the panel together (55 px/s).
// Seam (3.6 s = 0 s): the streaks pass their Figma places at their steady speeds; the pedestal's and panel's liquid drift.
import { kit, INK, svgDoc, keyframes, C30, EASE_OUT, part } from "../../.claude/skills/illos-hud/kit.mjs";
import { liquid } from "./liquid.mjs";
import { streak } from "./streak.mjs";

export const meta = {
  theme: "scifi",
  subject: "profile-evaluation",
  name: "Profile evaluation",
  size: "spot",
  alt: "A glass sphere on an iridescent pedestal beside a thick glass profile panel. A streak of light rises from the pedestal past the applicant, three streaks shoot out of the panel, and the profile lights up.",
};
export const params = {};

const W = 518;
const H = 339;
const T = 3.6;
// The panel, in the plane along world x: its front face's top left corner on screen, its size and depth.
const FTL = [275, 51.2];
const PW = 147.7; // along x (world units = screen units along the plane)
const PH = 107.5; // tall
const PD = 16.8; // deep, toward -y
// The three markers: where each meets the panel (u, v in the panel's plane) and how far in front of it it floats.
const MARKS = [[115, 40, 20], [84, 92, 20], [129, 75, 20]];
const GLOW = 0.35; // the profile lights once the checks are out

export function render() {
  const k = kit({ ox: 0, oy: 0 }); // only for svgDoc conventions; this scene places parts in screen space
  void k;
  const cls = "sf-profile-evaluation";
  const f = (v) => String(Math.round(v * 10) / 10);
  const C = INK.data;
  const G = INK.ground;
  const I = INK.read;
  const A = INK.alert; // only as a faint warm sheen on the pedestal's glass, as in the Figma
  const id = (s) => `${cls}-${s}`;
  const EX = [C30, 0.5]; // world +x on screen
  const BACK = [C30, -0.5]; // world -y on screen (into the panel)
  const pp = (u, v) => [FTL[0] + u * EX[0], FTL[1] + u * EX[1] + v]; // a point on the panel's front face
  const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s];
  const M = (pts) => `M${pts.map((q) => q.map(f).join(" ")).join("L")}Z`;
  const plane = `matrix(${f(C30)},0.5,0,1,${f(FTL[0])},${f(FTL[1])})`; // panel-local (u, v) to screen

  const defs = [
    `<radialGradient id="${id("ball")}" cx="0.52" cy="0.5" r="0.55"><stop offset="0" stop-color="${I}" stop-opacity="0.95"/><stop offset="0.2" stop-color="${C}" stop-opacity="0.95"/><stop offset="0.52" stop-color="${C}" stop-opacity="0.72"/><stop offset="0.85" stop-color="${C}" stop-opacity="0.22"/><stop offset="1" stop-color="${C}" stop-opacity="0.12"/></radialGradient>`,
    `<radialGradient id="${id("halo")}"><stop offset="0.7" stop-color="${C}" stop-opacity="0.12"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${id("dot")}"><stop offset="0" stop-color="${C}" stop-opacity="0.9"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${id("haze")}"><stop offset="0" stop-color="${C}" stop-opacity="0.06"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    // The pedestal's top: dark glass, a cyan rim light on the left and front.
    `<radialGradient id="${id("disc")}" cx="0.64" cy="0.36" r="0.68"><stop offset="0.6" stop-color="${C}" stop-opacity="0"/><stop offset="0.82" stop-color="${C}" stop-opacity="0.32"/><stop offset="1" stop-color="${C}" stop-opacity="0.85"/></radialGradient>`,
    `<radialGradient id="${id("rim")}" cx="0.5" cy="0.5" r="0.5"><stop offset="0.78" stop-color="${C}" stop-opacity="0"/><stop offset="1" stop-color="${C}" stop-opacity="0.35"/></radialGradient>`,
    `<linearGradient id="${id("streak")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity="0"/><stop offset="0.35" stop-color="${C}" stop-opacity="0.75"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></linearGradient>`,
    // The panel's face: lit glass on the left, deep in the middle, a little light again toward the right.
    `<linearGradient id="${id("face")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C}" stop-opacity="0.3"/><stop offset="0.45" stop-color="${C}" stop-opacity="0.08"/><stop offset="0.75" stop-color="${G}" stop-opacity="0.5"/><stop offset="1" stop-color="${C}" stop-opacity="0.12"/></linearGradient>`,
    `<linearGradient id="${id("shade")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0.36" stop-color="${G}" stop-opacity="0"/><stop offset="0.66" stop-color="${G}" stop-opacity="0.45"/><stop offset="1" stop-color="${G}" stop-opacity="0.4"/></linearGradient>`,
    `<radialGradient id="${id("flare")}"><stop offset="0" stop-color="${C}" stop-opacity="0.85"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    // A fine dot grid, as on the Figma's glass sides.
    `<pattern id="${id("dots")}" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.45" fill="${C}" fill-opacity="0.45"/></pattern>`,
    `<filter id="${id("soft")}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.4"/></filter>`,
    `<filter id="${id("blur")}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>`,
  ].join("");

  const hexagon = ([x, y], r) => M(Array.from({ length: 6 }, (_, i) => [x + r * Math.cos((Math.PI / 3) * i + Math.PI / 6), y + r * Math.sin((Math.PI / 3) * i + Math.PI / 6)]));
  const still = [];
  const LQ = []; // liquid glass layers (see liquid.mjs)
  // A low haze at the lower left, as in the Figma's background.

  // ---- the panel, back to front ----
  const ftr = pp(PW, 0);
  const fbl = pp(0, PH);
  const fbr = pp(PW, PH);
  const btl = add(FTL, BACK, PD);
  const btr = add(ftr, BACK, PD);
  const bbr = add(fbr, BACK, PD);
  still.push(part("panel-back", `<path d="M${f(btl[0])} ${f(btl[1])}L${f(btr[0])} ${f(btr[1])}L${f(bbr[0])} ${f(bbr[1])}" stroke="${C}" stroke-opacity="0.35" stroke-width="0.8" fill="none"/>`));
  // The top and right sides: dotted glass.
  still.push(part("panel-sides", `<path d="${M([FTL, btl, btr, ftr])}" fill="url(#${id("dots")})" fill-opacity="0.5"/><path d="${M([ftr, btr, bbr, fbr])}" fill="url(#${id("dots")})"/><path d="${M([ftr, btr, bbr, fbr])}" fill="${C}" fill-opacity="0.04"/>`));
  // The front face and what is on it, drawn in the panel's own plane.
  const face = [
    `<rect x="0" y="0" width="${PW}" height="${PH}" fill="${G}" fill-opacity="0.55"/>`,
    `<rect x="0" y="0" width="${PW}" height="${PH}" fill="url(#${id("face")})"/>`,
    `<ellipse cx="62" cy="30" rx="14" ry="44" fill="url(#${id("flare")})" filter="url(#${id("blur")})"/>`,
    // The right half sinks into deep glass gradually: no edge.
    `<rect x="0" y="0" width="${PW}" height="${PH}" fill="url(#${id("shade")})"/>`,
    `<text class="lab" x="6" y="15" font-family="Inter Display, Inter, system-ui, sans-serif" font-size="7" fill="${C}" fill-opacity="0.6" stroke="none">Profile #35</text>`,
    `<rect x="37.5" y="32" width="59" height="3.6" rx="0.6" fill="${C}" fill-opacity="0.7"/>`,
    `<rect x="37.5" y="43.6" width="31" height="3.6" rx="0.6" fill="${C}" fill-opacity="0.7"/>`,
    [109.4, 121.2, 132.8].map((u) => `<circle cx="${u}" cy="14.5" r="2.6" fill="${C}" fill-opacity="0.85"/>`).join(""),
    `<circle cx="13" cy="76" r="8.5" fill="${C}" fill-opacity="0.8"/><circle cx="13" cy="76" r="13" fill="url(#${id("dot")})" fill-opacity="0.5"/>`,
  ].join("");
  still.push(part("panel-face", `<g transform="${plane}">${face}</g>`));
  // The panel's glass: a soft band of light drifting through it.
  LQ.push(liquid({ id: id("lq2"), shape: `<path d="${M([FTL, ftr, fbr, fbl])}"/>`, box: [FTL[0], FTL[1], PW * C30, PH + PW * 0.5], T, period: 130, angle: -20, freq: [0.01, 0.018], scale: 40, seed: 11, stops: [[0, C, 0], [0.35, C, 0], [0.48, C, 0.38], [0.55, I, 0.14], [0.65, C, 0], [1, C, 0]] }));
  still.push(part("panel-liquid", LQ[LQ.length - 1].markup));
  const edges = [FTL, ftr, fbr, fbl].map((q) => q.map(f).join(" "));
  still.push(part("panel-edges", `<path d="M${edges.join("L")}Z" stroke="${C}" stroke-opacity="0.6" stroke-width="1" fill="none"/><path d="M${f(FTL[0])} ${f(FTL[1])}L${f(btl[0])} ${f(btl[1])}M${f(ftr[0])} ${f(ftr[1])}L${f(btr[0])} ${f(btr[1])}M${f(fbr[0])} ${f(fbr[1])}L${f(bbr[0])} ${f(bbr[1])}" stroke="${C}" stroke-opacity="0.55" stroke-width="0.9"/>`));
  // Where the three checks are in the Figma: just in front of the panel.
  const marks = MARKS.map(([u, v, d]) => { const fp = pp(u, v); return { fp, m: add(fp, BACK, -d) }; });

  // ---- the applicant: pedestal, pillar, sphere ----
  const DC = [217, 242];
  const RX = 78;
  const RY = 44;
  const DEP = 15;
  // The side, a dotted band, and its bottom rim.
  still.push(part("pedestal-side", `<path d="M${DC[0] - RX} ${DC[1]}A${RX} ${RY} 0 0 0 ${DC[0] + RX} ${DC[1]}V${DC[1] + DEP}A${RX} ${RY} 0 0 1 ${DC[0] - RX} ${DC[1] + DEP}Z" fill="url(#${id("dots")})"/><path d="M${DC[0] - RX} ${DC[1] + DEP}A${RX} ${RY} 0 0 0 ${DC[0] + RX} ${DC[1] + DEP}" stroke="${C}" stroke-opacity="0.5" stroke-width="0.9" fill="none"/><path d="M${DC[0] - RX} ${DC[1]}V${DC[1] + DEP}M${DC[0] + RX} ${DC[1]}V${DC[1] + DEP}" stroke="${C}" stroke-opacity="0.3" stroke-width="0.8"/>`));
  // The top: dark glass with its rim light, a refraction streak under the sphere, and a faint warm sheen at the front right.
  // The top: dark glass; a crescent of rim light at the left and front (a radial gradient centred back and right, so
  // only the far edge of it, the front left rim, lights); a vivid refraction streak under the sphere; a faint warm sheen at the front right rim.
  still.push(part("pedestal-top", `<ellipse cx="${DC[0]}" cy="${DC[1]}" rx="${RX}" ry="${RY}" fill="${G}"/><ellipse cx="${DC[0]}" cy="${DC[1]}" rx="${RX}" ry="${RY}" fill="${C}" fill-opacity="0.05"/>` +
    `<ellipse cx="${DC[0]}" cy="${DC[1]}" rx="${RX}" ry="${RY}" fill="url(#${id("disc")})"/>` +
    `<path d="M${DC[0] - 2} ${DC[1] - 34}C${DC[0] - 9} ${DC[1] - 8} ${DC[0] - 4} ${DC[1] + 20} ${DC[0] + 3} ${DC[1] + 42}" stroke="url(#${id("streak")})" stroke-width="3.4" fill="none" filter="url(#${id("soft")})"/>` +
    `<path d="M${DC[0] - 1} ${DC[1] - 30}C${DC[0] - 7} ${DC[1] - 8} ${DC[0] - 3} ${DC[1] + 16} ${DC[0] + 2} ${DC[1] + 34}" stroke="${I}" stroke-opacity="0.45" stroke-width="1" fill="none"/>` +
    `<path d="M${DC[0] + 48} ${DC[1] + 30}C${DC[0] + 60} ${DC[1] + 24} ${DC[0] + 68} ${DC[1] + 16} ${DC[0] + 72} ${DC[1] + 8}" stroke="${A}" stroke-opacity="0.18" stroke-width="3" fill="none" filter="url(#${id("soft")})"/>` +
    `<path d="M${DC[0] + 30} ${DC[1] + 38}C${DC[0] + 50} ${DC[1] + 33} ${DC[0] + 64} ${DC[1] + 22} ${DC[0] + 72} ${DC[1] + 10}" stroke="${C}" stroke-opacity="0.45" stroke-width="2" fill="none" filter="url(#${id("soft")})"/>` +
    `<ellipse cx="${DC[0]}" cy="${DC[1]}" rx="${RX}" ry="${RY}" stroke="${C}" stroke-opacity="0.5" stroke-width="0.9" fill="none"/>`));
  // The pedestal's glass: liquid aurora drifting through it, as in the Figma's refraction over its iridescent texture.
  LQ.push(liquid({ id: id("lq"), shape: `<ellipse cx="${DC[0]}" cy="${DC[1]}" rx="${RX}" ry="${RY}"/>`, box: [DC[0] - RX, DC[1] - RY, 2 * RX, 2 * RY], T, period: 110, angle: -55, freq: [0.012, 0.02], scale: 46, seed: 7, stops: [[0, G, 0], [0.3, C, 0], [0.4, C, 0.5], [0.45, I, 0.22], [0.52, C, 0.18], [0.6, A, 0.1], [0.7, C, 0], [1, G, 0]] }));
  still.push(part("pedestal-liquid", LQ[LQ.length - 1].markup));
  // The scan streak rises from the pedestal's left rim; its head is here in the Figma.
  const PX = DC[0] - RX + 6;
  const PTOP = 128;
  // The sphere: glass with a glowing heart, a fine rim, and dust inside.
  const SC = [217.7, 163.6];
  const SR = 45;
  still.push(part("sphere", `<circle cx="${SC[0]}" cy="${SC[1]}" r="${SR + 14}" fill="url(#${id("halo")})"/><circle cx="${SC[0]}" cy="${SC[1]}" r="${SR}" fill="${G}" fill-opacity="0.6"/><circle cx="${SC[0]}" cy="${SC[1]}" r="${SR}" fill="url(#${id("ball")})"/><circle cx="${SC[0]}" cy="${SC[1]}" r="${SR}" stroke="${I}" stroke-opacity="0.35" stroke-width="0.9" fill="none"/>` +
    [[211, 130, 1.1], [201, 152, 0.9], [226, 141, 0.8], [190, 170, 0.8], [236, 186, 0.9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${I}" fill-opacity="0.7"/>`).join("")));
  // Sparkles in the air, mostly at the upper left.
  still.push(part("sparkles", [[149, 66, 0.9], [156, 82, 0.8], [130, 81, 0.7], [188, 121, 1], [159, 121, 0.9], [166, 187, 0.8], [92, 53, 0.7], [255, 108, 0.7], [118, 140, 0.6]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C}" fill-opacity="${i % 2 ? 0.45 : 0.75}"/>`).join("")));

  // ---- motion ----
  const css = [`text{font-family:"Inter Display","Inter",system-ui,sans-serif;font-variation-settings:"opsz" 32}`];
  const kf = (name, stops) => css.push(keyframes(`${cls}_${name}`, stops, T));
  const moving = [];
  let defs2 = "";
  const SP = []; // the streaks
  // The scan: up out of the pedestal's rim, past the applicant, quick.
  const SRC = DC[1] - 2;
  SP.push(streak({ id: id("scan"), name: "scan", cls, T, head: [PX, PTOP], dir: [0, -1], from: SRC - PTOP, speed: 90, len: 60, hex: 4.2, clip: [[PX - 20, 0], [PX + 20, 0], [PX + 20, SRC], [PX - 20, SRC]] }));
  // The checks: straight out of the panel's face (they start at its back glass, seen through it), toward the applicant.
  marks.forEach(({ fp, m }, i) => {
    const src = add(fp, BACK, PD);
    SP.push(streak({ id: id(`ck${i}`), name: `ck${i}`, cls, T, head: m, dir: [-C30, 0.5], from: 20 + PD, speed: 55, len: 40, hex: 3.6, clip: [[-10, -10], [src[0], -10], [src[0], H + 10], [-10, H + 10]] }));
  });
  SP.forEach((s2, i) => { defs2 += s2.defs; moving.push(part(i ? `check-${i}` : "scan", s2.markup)); css.push(...s2.css); });
  // The profile lights once every check has passed: a wash over the face, the avatar and the lines.
  moving.push(part("profile-lit", `<g class="pr" transform="${plane}"><rect x="0" y="0" width="${PW}" height="${PH}" fill="${C}" fill-opacity="0.08"/><rect x="37.5" y="32" width="59" height="3.6" rx="0.6" fill="${I}" fill-opacity="0.7"/><rect x="37.5" y="43.6" width="31" height="3.6" rx="0.6" fill="${I}" fill-opacity="0.7"/><circle cx="13" cy="76" r="8.5" fill="${I}" fill-opacity="0.75"/></g>`));
  kf("pr", [[0, "opacity:0"], [GLOW, "opacity:0", EASE_OUT], [GLOW + 0.25, "opacity:1", EASE_OUT], [GLOW + 1.6, "opacity:0"], [T, "opacity:0"]]);
  css.push(`.pr{opacity:0;animation:${cls}_pr ${T}s linear}`);

  LQ.forEach((l) => css.push(...l.css));
  return svgDoc(cls, "Profile evaluation", css.join("\n"), defs + defs2 + LQ.map((l) => l.defs).join(""), still.join("") + moving.join(""), { w: W, h: H, desc: meta.alt });
}
