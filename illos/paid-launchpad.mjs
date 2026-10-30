// Paid launchpad. A stack of three glass coins, the top one bearing a "$", stands on a wide iridescent pedestal over a
// dotted base. Three streaks of light shoot up out of the stack: each is a bright hexagon head with a trail of light
// behind it, not a fixed pillar.
// Drawn from the Figma frame "3" (Deccan AI Experts design, node 420:962), at its own 518 x 339. Its ellipses are flatter
// than true isometric (ry/rx about 0.45 for the coins), so this scene follows the Figma's own ellipses, not the iso kit.
// Sequence, as it really happens: a trial task is paid: a new coin drops onto the top of the stack (it speeds up as it
// falls and settles with a small bounce); the moment it lands, three streaks of light shoot up out of the stack, heads
// first, trails behind (money in, a small celebration), and the "$" on the new coin flares; at the same time the stack
// settles down by one coin as the bottom coin sinks into the pedestal and fades, so it is three coins again.
// The start of the loop is the moment the Figma shows: the stack is three coins and the streaks are in flight, trails
// reaching back down to the stack.
// 0.00 to 0.30 s: the streaks keep rising at the same speed, their trails lifting off the stack, and fade out at the top.
// 2.70 to 3.50 s: the new coin fades in above the stack and falls (ease in); 3.50 to 3.65 s: it lands, lifts 3 px, settles.
// 3.50 s: the streaks leave the stack, each at its own constant speed so all three reach the Figma's places at 4.4 s;
//   like the applicant packets, a bright head with a soft trail behind it.
// 3.65 to 4.40 s: the stack settles down one coin (ease in and out); the bottom coin sinks and fades.
// Seam (4.4 s = 0 s): three coins, streaks in flight; the settled stack and the resting one are the same picture, so the
// parts swap back unseen. The pedestal's liquid drifts the whole time.
import { kit, INK, svgDoc, keyframes, n, EASE_OUT, EASE_IN_OUT, part } from "../../.claude/skills/illos-hud/kit.mjs";
import { liquid } from "./liquid.mjs";

export const meta = {
  theme: "scifi",
  subject: "paid-launchpad",
  name: "Paid launchpad",
  size: "spot",
  alt: "A stack of three glowing glass coins marked with a dollar sign, on a wide iridescent pedestal. A new coin drops onto the stack; as it lands, three streaks of light shoot up out of it, trails behind them, and the stack settles down as the bottom coin sinks away.",
};
export const params = {};

const T = 4.4;
const W = 518;
const H = 339;
const CX = 254.6; // the stack's axis
const COIN = { rx: 80.9, ry: 36.4, top: 128, h: 23.7, n: 3 }; // the top face's centre y, each coin's height
const FACE = { rx: 64.4, ry: 27.6, y: 132.4 }; // the raised face on the top coin
const PED = { cx: 251.6, cy: 205.3, rx: 120, ry: 72.4 }; // the glass pedestal's top
const BASE = { cx: 250.6, cy: 241.8, rx: 107.4, ry: 64, depth: 28 }; // the dotted base under it
// The streaks: x, the head's y in the Figma, and where the trail meets the stack there.
const PILLARS = [[178.2, 69.8, 120], [211.1, 32.4, 108], [331.9, 45.8, 112]];
const RISE = 0.9; // how long a streak takes from the stack to its Figma place
const LAND = T - RISE; // the new coin lands and the streaks leave the stack
const SLIDE = [LAND + 0.15, T]; // the stack settles down one coin

export function render() {
  void kit;
  const cls = "sf-paid-launchpad";
  const f = (v) => String(Math.round(v * 10) / 10);
  const C = INK.data;
  const G = INK.ground;
  const I = INK.read;
  const A = INK.alert;
  const id = (s) => `${cls}-${s}`;
  const hexagon = ([x, y], r) => `M${Array.from({ length: 6 }, (_, i) => [x + r * Math.cos((Math.PI / 3) * i + Math.PI / 6), y + r * Math.sin((Math.PI / 3) * i + Math.PI / 6)].map(f).join(" ")).join("L")}Z`;
  // A cylinder's side between two heights (the near half only), as one closed path.
  const side = (cx, rx, ry, yTop, yBot) => `M${f(cx - rx)} ${f(yTop)}A${f(rx)} ${f(ry)} 0 0 0 ${f(cx + rx)} ${f(yTop)}V${f(yBot)}A${f(rx)} ${f(ry)} 0 0 1 ${f(cx - rx)} ${f(yBot)}Z`;
  const frontArc = (cx, rx, ry, y) => `M${f(cx - rx)} ${f(y)}A${f(rx)} ${f(ry)} 0 0 0 ${f(cx + rx)} ${f(y)}`;

  let defs = [
    `<radialGradient id="${id("dot")}"><stop offset="0" stop-color="${C}" stop-opacity="0.9"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    // The pedestal top: rim light, strongest at the front left; dark in the middle.
    `<radialGradient id="${id("ped")}" cx="0.7" cy="0.28" r="0.78"><stop offset="0.6" stop-color="${C}" stop-opacity="0"/><stop offset="0.86" stop-color="${C}" stop-opacity="0.2"/><stop offset="1" stop-color="${C}" stop-opacity="0.6"/></radialGradient>`,
    // The coins' sides: dark at the edges, glowing in the middle, like light inside the glass.
    `<linearGradient id="${id("band")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C}" stop-opacity="0.12"/><stop offset="0.5" stop-color="${C}" stop-opacity="0.95"/><stop offset="1" stop-color="${C}" stop-opacity="0.1"/></linearGradient>`,
    `<linearGradient id="${id("band-v")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G}" stop-opacity="0.35"/><stop offset="0.5" stop-color="${G}" stop-opacity="0"/><stop offset="1" stop-color="${G}" stop-opacity="0.25"/></linearGradient>`,
    // The face: lifted glass, lighter at the front.
    `<linearGradient id="${id("face")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity="0.4"/><stop offset="1" stop-color="${C}" stop-opacity="0.62"/></linearGradient>`,
    `<linearGradient id="${id("trail")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity="0.75"/><stop offset="0.4" stop-color="${C}" stop-opacity="0.4"/><stop offset="1" stop-color="${C}" stop-opacity="0.08"/></linearGradient>`,
    `<pattern id="${id("dots")}" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.45" fill="${C}" fill-opacity="0.45"/></pattern>`,
    `<filter id="${id("soft")}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.5"/></filter>`,
    `<filter id="${id("halo")}" x="-40%" y="-60%" width="180%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>`,
    `<linearGradient id="${id("rise")}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C}" stop-opacity="0.16"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></linearGradient>`,
    `<filter id="${id("glow")}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3"/></filter>`,
  ].join("");

  const still = [];
  const LQ = []; // liquid glass layers (see liquid.mjs)
  // ---- base and pedestal ----
  still.push(part("base", `<path d="${side(BASE.cx, BASE.rx, BASE.ry, BASE.cy - BASE.depth, BASE.cy)}" fill="url(#${id("dots")})"/><path d="M${f(BASE.cx - BASE.rx)} ${f(BASE.cy - BASE.depth)}V${f(BASE.cy)}M${f(BASE.cx + BASE.rx)} ${f(BASE.cy - BASE.depth)}V${f(BASE.cy)}" stroke="${C}" stroke-opacity="0.3" stroke-width="0.8"/><path d="${frontArc(BASE.cx, BASE.rx, BASE.ry, BASE.cy)}" stroke="${C}" stroke-opacity="0.45" stroke-width="0.9" fill="none"/>`));
  still.push(part("pedestal", `<ellipse cx="${PED.cx}" cy="${PED.cy}" rx="${PED.rx}" ry="${PED.ry}" fill="${G}"/><ellipse cx="${PED.cx}" cy="${PED.cy}" rx="${PED.rx}" ry="${PED.ry}" fill="url(#${id("ped")})"/>` +
    // iridescent touches: a green-cyan swell at the front right, a faint warm edge at the left, a refraction under the stack
    `<path d="M${f(PED.cx + 40)} ${f(PED.cy + 64)}C${f(PED.cx + 80)} ${f(PED.cy + 54)} ${f(PED.cx + 106)} ${f(PED.cy + 36)} ${f(PED.cx + 116)} ${f(PED.cy + 16)}" stroke="${C}" stroke-opacity="0.55" stroke-width="5" fill="none" filter="url(#${id("glow")})"/>` +
    `<path d="M${f(PED.cx - 112)} ${f(PED.cy - 10)}C${f(PED.cx - 108)} ${f(PED.cy - 28)} ${f(PED.cx - 96)} ${f(PED.cy - 42)} ${f(PED.cx - 84)} ${f(PED.cy - 50)}" stroke="${A}" stroke-opacity="0.16" stroke-width="2.4" fill="none" filter="url(#${id("soft")})"/>` +
    `<path d="M${f(PED.cx + 2)} ${f(PED.cy + 32)}C${f(PED.cx - 1)} ${f(PED.cy + 48)} ${f(PED.cx + 1)} ${f(PED.cy + 60)} ${f(PED.cx + 3)} ${f(PED.cy + 72)}" stroke="${C}" stroke-opacity="0.7" stroke-width="2.6" fill="none" filter="url(#${id("soft")})"/>` +
    `<ellipse cx="${PED.cx}" cy="${PED.cy}" rx="${PED.rx}" ry="${PED.ry}" stroke="${C}" stroke-opacity="0.5" stroke-width="0.9" fill="none"/>`));

  // The pedestal's glass: liquid aurora drifting through it.
  LQ.push(liquid({ id: id("lq"), shape: `<ellipse cx="${PED.cx}" cy="${PED.cy}" rx="${PED.rx}" ry="${PED.ry}"/>`, box: [PED.cx - PED.rx, PED.cy - PED.ry, 2 * PED.rx, 2 * PED.ry], T, period: 130, angle: -50, freq: [0.01, 0.017], scale: 52, seed: 5, stops: [[0, G, 0], [0.3, C, 0], [0.4, C, 0.5], [0.45, I, 0.22], [0.52, C, 0.18], [0.6, A, 0.1], [0.7, C, 0], [1, G, 0]] }));
  still.push(part("pedestal-liquid", LQ[LQ.length - 1].markup));

  // ---- the haze over the stack ----
  still.push(part("haze", `<rect x="${f(CX - 72)}" y="40" width="144" height="${f(COIN.top - 40)}" fill="url(#${id("rise")})" filter="url(#${id("halo")})"/>`));

  // ---- the coin stack ----
  const bottom = COIN.top + COIN.h * COIN.n;
  // Light round the stack's foot and a halo: they stay put while the coins move.
  still.push(part("stack-light", `<ellipse cx="${CX}" cy="${f(bottom + 4)}" rx="${f(COIN.rx + 14)}" ry="${f(COIN.ry + 8)}" fill="url(#${id("dot")})" fill-opacity="0.15"/><path d="${side(CX, COIN.rx + 8, COIN.ry + 4, COIN.top + 4, bottom + 2)}" fill="${C}" fill-opacity="0.25" filter="url(#${id("halo")})"/>`));
  // The "$" lies on the face: drawn upright, turned in the face's plane, then flattened as the face is.
  const dollar = (fy, fill, o) => `<g transform="translate(${CX} ${f(fy)}) scale(1 0.6) rotate(-24)"><text x="0" y="2" text-anchor="middle" dominant-baseline="central" font-family="Inter Display, Inter, system-ui, sans-serif" font-weight="700" font-size="86" fill="${fill}" fill-opacity="${o}" stroke="none">$</text></g>`;
  // One coin in slot i (0 is the top; -1 is the place above the stack): its side, the seam under it, and, for the top
  // coin, its glass top, raised face and "$".
  const coin = (i, top, strength) => {
    const y0 = COIN.top + COIN.h * i;
    const y1 = y0 + COIN.h;
    const d = side(CX, COIN.rx, COIN.ry, y0, y1);
    let out = `<path d="${d}" fill="${G}"/><path d="${d}" fill="url(#${id("band")})" fill-opacity="${strength}"/><path d="${d}" fill="url(#${id("band-v")})"/>`;
    out += `<path d="${frontArc(CX, COIN.rx, COIN.ry, y1)}" stroke="${I}" stroke-opacity="0.85" stroke-width="1.2" fill="none"/><path d="M${f(CX - COIN.rx)} ${f(y0)}V${f(y1)}M${f(CX + COIN.rx)} ${f(y0)}V${f(y1)}" stroke="${C}" stroke-opacity="0.45" stroke-width="0.9"/>`;
    if (top) {
      const fy = FACE.y + COIN.h * i;
      out += `<ellipse cx="${CX}" cy="${f(y0)}" rx="${COIN.rx}" ry="${COIN.ry}" fill="${G}"/><ellipse cx="${CX}" cy="${f(y0)}" rx="${COIN.rx}" ry="${COIN.ry}" fill="${C}" fill-opacity="0.22"/><ellipse cx="${CX}" cy="${f(y0)}" rx="${COIN.rx}" ry="${COIN.ry}" stroke="${C}" stroke-opacity="0.6" stroke-width="1" fill="none"/>`;
      out += `<ellipse cx="${CX}" cy="${f(fy)}" rx="${FACE.rx}" ry="${FACE.ry}" fill="url(#${id("face")})"/><ellipse cx="${CX}" cy="${f(fy)}" rx="${FACE.rx}" ry="${FACE.ry}" stroke="${C}" stroke-opacity="0.35" stroke-width="0.8" fill="none"/>`;
      out += dollar(fy, C, 0.9);
    }
    return out;
  };

  // ---- motion ----
  const css = [`text{font-family:"Inter Display","Inter",system-ui,sans-serif;font-variation-settings:"opsz" 32}`];
  const kf = (name, stops) => css.push(keyframes(`${cls}_${name}`, stops, T));
  const moving = [];
  const ty = (d) => `transform:translateY(${n(d)}px)`;
  const H1 = COIN.h;
  // The streaks, behind the stack: a hexagon head with a soft glow and a trail of light down to where it left the stack.
  // Each is clipped at the stack's top, so it comes up out of the stack, trail last. No blur: they move.
  PILLARS.forEach(([x, y, end], i) => {
    const L = end - y;
    const v = L / RISE;
    defs += `<clipPath id="${id(`above${i}`)}"><rect x="${f(x - 20)}" y="1" width="40" height="${f(end - 1)}"/></clipPath>`;
    moving.push(part(`streak-${i + 1}`, `<g clip-path="url(#${id(`above${i}`)})"><g class="up${i}"><rect x="${f(x - 4.5)}" y="${f(y + 2)}" width="9" height="${f(L - 2)}" rx="4.5" fill="url(#${id("trail")})" fill-opacity="0.42"/><rect x="${f(x - 0.7)}" y="${f(y + 3)}" width="1.4" height="${f(L - 3)}" fill="url(#${id("trail")})"/><circle cx="${f(x)}" cy="${f(y)}" r="10" fill="url(#${id("dot")})" fill-opacity="0.7"/><path d="${hexagon([x, y], 4)}" fill="${C}"/><circle cx="${f(x)}" cy="${f(y)}" r="1.3" fill="${I}" fill-opacity="0.8"/></g></g>`));
    kf(`up${i}`, [[0, `opacity:1;${ty(0)}`], [0.3, `opacity:0;${ty(-v * 0.3)}`, "step-end"], [0.31, `opacity:0;${ty(L)}`], [LAND, `opacity:0;${ty(L)}`, "step-end"], [LAND + 0.01, `opacity:1;${ty(L - v * 0.01)}`], [T, `opacity:1;${ty(0)}`]]);
    css.push(`.up${i}{animation:${cls}_up${i} ${T}s linear}`);
  });
  // The stack as it stands: bottom coin first (it is the one that sinks away), then up to the top coin with its face.
  // The pedestal swallows the bottom coin: the stack is clipped at its own foot, so the coin sinks in rather than sliding over.
  defs += `<clipPath id="${id("foot")}"><path d="M0 0H518V${f(bottom)}H${f(CX + COIN.rx)}A${COIN.rx} ${COIN.ry} 0 0 1 ${f(CX - COIN.rx)} ${f(bottom)}H0Z"/></clipPath>`;
  moving.push(part("stack", `<g clip-path="url(#${id("foot")})"><g class="old"><g class="sink">${coin(2, false, 1)}</g>${coin(1, false, 1)}${coin(0, true, 1)}</g></g>`));
  kf("old", [[0, ty(0)], [SLIDE[0], ty(0), EASE_IN_OUT], [T, ty(H1)]]);
  css.push(`.old{animation:${cls}_old ${T}s linear}`);
  kf("sink", [[0, "opacity:1"], [SLIDE[0], "opacity:1", EASE_IN_OUT], [T - 0.1, "opacity:0"], [T, "opacity:0"]]);
  css.push(`.sink{animation:${cls}_sink ${T}s linear}`);
  // The new coin: fades in above, falls, lands with a small bounce, rides the stack down, and at the seam is the top coin.
  const FALL = 70;
  moving.push(part("new-coin", `<g class="nw"><g class="nwf">${coin(-1, true, 1)}<g class="df">${dollar(FACE.y - H1, I, 0.85)}</g></g></g>`));
  kf("nw", [[0, `opacity:0;${ty(-FALL)}`], [LAND - 0.8, `opacity:0;${ty(-FALL)}`, EASE_OUT], [LAND - 0.65, `opacity:1;${ty(-FALL * 0.82)}`, "cubic-bezier(.5,0,1,1)"], [LAND, `opacity:1;${ty(0)}`, EASE_OUT], [LAND + 0.07, `opacity:1;${ty(-3)}`, EASE_OUT], [SLIDE[0], `opacity:1;${ty(0)}`, EASE_IN_OUT], [T, `opacity:1;${ty(H1)}`]]);
  css.push(`.nw{opacity:0;transform:translateY(-${FALL}px);animation:${cls}_nw ${T}s linear}`);
  // The new coin's "$" flares as it lands.
  kf("df", [[0, "opacity:0"], [LAND, "opacity:0", "step-end"], [LAND + 0.01, "opacity:1", EASE_OUT], [T, "opacity:0"]]);
  css.push(`.df{opacity:0;animation:${cls}_df ${T}s linear}`);
  // The stack glows up as the coin lands, and settles.
  moving.push(part("stack-glow", `<path class="sg" d="${side(CX, COIN.rx, COIN.ry, COIN.top, bottom)}" fill="url(#${id("band")})"/>`));
  kf("sg", [[0, "opacity:0"], [LAND, "opacity:0", "step-end"], [LAND + 0.01, "opacity:0.7", EASE_OUT], [T, "opacity:0"]]);
  css.push(`.sg{opacity:0;animation:${cls}_sg ${T}s linear}`);
  // Sparkles over the top.
  moving.push(part("sparkles", [[213, 112, 0.9], [298, 109, 0.8], [263, 101, 0.7], [232, 150, 0.7], [288, 147, 0.8], [241, 82, 0.8], [262, 74, 0.7], [313, 93, 0.6]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 3 ? C : I}" fill-opacity="${i % 2 ? 0.55 : 0.8}"/>`).join("")));

  LQ.forEach((l) => css.push(...l.css));
  return svgDoc(cls, "Paid launchpad", css.join("\n"), defs + LQ.map((l) => l.defs).join(""), still.join("") + moving.join(""), { w: W, h: H, desc: meta.alt });
}
