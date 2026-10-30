// A streak of light for the Deccan Experts drawings: a bright head (a hexagon or a dot, with a glow and a glint) and a
// soft trail behind it, carried whole at a steady speed, built like the applicant packets in 01 (the approved look).
// The Figma's "hexagon on a line" is always one of these in flight, never a fixed post.
//
//   const s = streak({ id: id("up1"), name: "up1", cls, T, head: [x, y], dir: [0, -1], from: 40, speed: 60, hex: 4 });
//   defs += s.defs;  moving.push(part("streak-1", s.markup));  css.push(...s.css);
//
// `head` is where the Figma shows the head, which is where it is at t = 0 (the loop starts on the Figma's pose).
// `dir` is the direction it travels (unit). `from` is how far it has come from its source at t = 0: it emerges there at
// t = T - from / speed (the trail comes out behind it), passes the pose at the seam, travels on for `exit` seconds while it
// fades, and is hidden until it emerges again. `clip` (screen points) is the region it shows in: cut it at its source so
// it comes out of the thing that sends it, and at whatever it goes into.
import { keyframes, n, INK } from "../../.claude/skills/illos-hud/kit.mjs";

export function streak({ id, name, cls, T, head, dir, from, speed, exit = 0.35, len = 46, width = 9, hex = 0, clip = null }) {
  const C = INK.data;
  const I = INK.read;
  const f = (v) => String(Math.round(v * 10) / 10);
  const [hx, hy] = head;
  const tail = [hx - dir[0] * len, hy - dir[1] * len];
  const a = from / speed; // how long before the seam it emerges
  const hexagon = (r) => `M${Array.from({ length: 6 }, (_, i) => [hx + r * Math.cos((Math.PI / 3) * i + Math.PI / 6), hy + r * Math.sin((Math.PI / 3) * i + Math.PI / 6)].map(f).join(" ")).join("L")}Z`;
  const defs = [
    `<linearGradient id="${id}-t" gradientUnits="userSpaceOnUse" x1="${f(tail[0])}" y1="${f(tail[1])}" x2="${f(hx)}" y2="${f(hy)}"><stop offset="0" stop-color="${C}" stop-opacity="0"/><stop offset="1" stop-color="${C}" stop-opacity="0.34"/></linearGradient>`,
    `<linearGradient id="${id}-c" gradientUnits="userSpaceOnUse" x1="${f(tail[0])}" y1="${f(tail[1])}" x2="${f(hx)}" y2="${f(hy)}"><stop offset="0" stop-color="${C}" stop-opacity="0"/><stop offset="1" stop-color="${C}" stop-opacity="0.8"/></linearGradient>`,
    `<radialGradient id="${id}-g"><stop offset="0" stop-color="${C}" stop-opacity="0.9"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient>`,
    clip ? `<clipPath id="${id}-k"><path d="M${clip.map((q) => q.map(f).join(" ")).join("L")}Z"/></clipPath>` : "",
  ].join("");
  const body = `<g class="${name}"><path d="M${f(tail[0])} ${f(tail[1])}L${f(hx)} ${f(hy)}" stroke="url(#${id}-t)" stroke-width="${width}" stroke-linecap="round"/><path d="M${f(tail[0])} ${f(tail[1])}L${f(hx)} ${f(hy)}" stroke="url(#${id}-c)" stroke-width="1.4"/><circle cx="${f(hx)}" cy="${f(hy)}" r="10" fill="url(#${id}-g)" fill-opacity="0.75"/>` +
    (hex ? `<path d="${hexagon(hex)}" fill="${C}"/>` : `<circle cx="${f(hx)}" cy="${f(hy)}" r="4" fill="${C}"/>`) +
    `<circle cx="${f(hx - 0.6)}" cy="${f(hy - 0.6)}" r="1.3" fill="${I}" fill-opacity="0.8"/></g>`;
  const markup = clip ? `<g clip-path="url(#${id}-k)">${body}</g>` : body;
  const tr = (s) => `transform:translate(${n(dir[0] * s)}px,${n(dir[1] * s)}px)`;
  const css = [
    keyframes(`${cls}_${name}`, [
      [0, `opacity:1;${tr(0)}`],
      [exit, `opacity:0;${tr(speed * exit)}`, "step-end"],
      [exit + 0.01, `opacity:0;${tr(-from)}`],
      [T - a, `opacity:0;${tr(-from)}`, "step-end"],
      [T - a + 0.01, `opacity:1;${tr(-from + speed * 0.01)}`],
      [T, `opacity:1;${tr(0)}`],
    ], T),
    `.${name}{animation:${cls}_${name} ${T}s linear}`,
  ];
  return { defs, markup, css };
}

// A streak sent from one thing to another at a given time, for drawings with no Figma pose to start on: it comes out of
// `from` at `launch`, travels at `speed` to `to`, goes in there trail last (it is cut at both ends, square to its path),
// and waits hidden. `arrive` in the result is when its head reaches `to`, to time what happens there.
//
//   const s = shot({ id: id("note"), name: "nt", cls, T, from: [x0, y0], to: [x1, y1], launch: 0.8, speed: 80 });
export function shot({ id, name, cls, T, from, to, launch, speed, len = 40, width = 8, hex = 0, reach = 40 }) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dist = Math.hypot(dx, dy);
  const dir = [dx / dist, dy / dist];
  const nrm = [-dir[1], dir[0]];
  const end = launch + (dist + len) / speed; // the trail is all the way in
  const s = streak({ id, name, cls, T, head: from, dir, from: 1, speed, len, width, hex }); // its markup and paint; its timing is replaced below
  const q = (p, a, b) => [p[0] + nrm[0] * a + dir[0] * b, p[1] + nrm[1] * a + dir[1] * b];
  const clip = [q(from, -reach, 0), q(from, reach, 0), q(to, reach, 0), q(to, -reach, 0)];
  const f = (v) => String(Math.round(v * 10) / 10);
  const tr = (d) => `transform:translate(${n(dir[0] * d)}px,${n(dir[1] * d)}px)`;
  const defs = s.defs + `<clipPath id="${id}-k"><path d="M${clip.map((p) => p.map(f).join(" ")).join("L")}Z"/></clipPath>`;
  const markup = `<g clip-path="url(#${id}-k)">${s.markup}</g>`;
  const css = [
    keyframes(`${cls}_${name}`, [
      [0, `opacity:0;${tr(0)}`],
      [launch, `opacity:0;${tr(0)}`, "step-end"],
      [launch + 0.01, `opacity:1;${tr(speed * 0.01)}`],
      [end, `opacity:1;${tr(dist + len)}`, "step-end"],
      [end + 0.01, `opacity:0;${tr(0)}`],
      [T, `opacity:0;${tr(0)}`],
    ], T),
    `.${name}{opacity:0;animation:${cls}_${name} ${T}s linear}`,
  ];
  return { defs, markup, css, arrive: launch + dist / speed, end };
}
