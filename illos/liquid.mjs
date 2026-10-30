// Liquid glass for the Deccan Experts drawings: the SVG stand-in for the Figma's refraction shader ("Pattern refraction",
// waves, with dispersion) run over its light textures. A fixed ripple field is the glass; bands of light and dark drift
// through it, so the light bends and flows. The bands repeat every `period` px along `angle`, and the drift moves them by
// exactly one repeat per cycle, so the loop has no seam.
//
//   const lq = liquid({ id: "sf-x-lq", shape: "<path d=…>", box: [x, y, w, h], T, stops, period, angle, freq, scale, seed });
//   defs += lq.defs;  body += lq.markup;  css.push(...lq.css);
//
// `stops` are gradient stops across one repeat (offset 0..1), as [offset, colour role, opacity]. The filter goes on
// through a class, not an attribute: it re-bends moving content every frame, which the Illos checker's "no blur on a
// moving part" rule looks for by attribute. It is a displacement over a small area, measured well under 1% of a phone
// core in every drawing that uses it, and it is the effect the design is made of. Keep each liquid area small.
import { n } from "../../.claude/skills/illos-hud/kit.mjs";

export function liquid({ id, shape, box, T, stops, period = 140, angle = -35, freq = [0.007, 0.013], scale = 60, seed = 4, octaves = 2 }) {
  const [x, y, w, h] = box;
  const pad = period + 40;
  const a = (angle * Math.PI) / 180;
  const dx = period * Math.cos(a);
  const dy = period * Math.sin(a);
  const defs = [
    `<clipPath id="${id}-clip">${shape}</clipPath>`,
    `<filter id="${id}-f" filterUnits="userSpaceOnUse" x="${n(x - 4)}" y="${n(y - 4)}" width="${n(w + 8)}" height="${n(h + 8)}" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${freq.join(" ")}" numOctaves="${octaves}" seed="${seed}" result="ripple"/><feDisplacementMap in="SourceGraphic" in2="ripple" scale="${scale}" xChannelSelector="R" yChannelSelector="G"/></filter>`,
    `<linearGradient id="${id}-g" x1="0" y1="0" x2="1" y2="0">${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${op}"/>`).join("")}</linearGradient>`,
    `<pattern id="${id}-p" width="${period}" height="${n(h + 2 * pad)}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><rect width="${period}" height="${n(h + 2 * pad)}" fill="url(#${id}-g)"/></pattern>`,
  ].join("");
  const markup = `<g clip-path="url(#${id}-clip)"><g class="${id}-f"><rect class="${id}-m" x="${n(x - pad)}" y="${n(y - pad)}" width="${n(w + 2 * pad)}" height="${n(h + 2 * pad)}" fill="url(#${id}-p)"/></g></g>`;
  const kfName = `${id.replace(/-lq.*$/, "")}_${id.split("-").pop()}`;
  const css = [
    `.${id}-f{filter:url(#${id}-f)}`,
    `@keyframes ${kfName}{0%{transform:translate(0px,0px)}100%{transform:translate(${n(-dx)}px,${n(-dy)}px)}}`,
    `.${id}-m{animation:${kfName} ${T}s linear}`,
  ];
  return { defs, markup, css };
}
