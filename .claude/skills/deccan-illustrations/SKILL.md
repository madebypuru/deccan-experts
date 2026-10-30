---
name: deccan-illustrations
description: Use when drawing, recreating, animating or fixing an illustration for the Deccan Experts site (careers/experts.html), for example the How it works step art, or any new spot in the same glowing-glass style. Builds on the Illos skills (workflow, kit projection, motion rules, checker) with this site's own look.
---

# Deccan Experts illustrations

The site's illustrations are **glowing glass objects in isometric on near-black**: translucent cubes, discs and panels
with fine cyan edges, soft stepped cores of light, beams with travelling particles, and small labels set in the plane of
the object. The source designs live in Figma: file `oWsOGQlRg24CwjAvbEKF6G`, section node `537:2` (five 518 x 339
frames, one per How it works step). Each finished drawing is an Illos scene (`illos/<subject>.mjs`) that renders one
animated SVG, checked with the Illos checker and inlined into its card.

Read first: `../../../illos/request-invite.mjs` (the approved pattern: two glass cubes, a beam, packets) and the Illos
skills it builds on (`~/.claude/skills/illos/SKILL.md`, `illos-motion/SKILL.md`, `illos-check/SKILL.md`).

This is not the Illos HUD look. HUD is lines only; this style uses gradient fills and soft light. Keep the Illos
*workflow and motion rules*, not the HUD rule "lines and points, never solids".

## The look, as rules

1. **Dark only.** Drawn for the site's dark ground (`#050808` in the Figma). Light mode is not a target; the checker's
   light frames will look washed out, and that is expected.
2. **One colour, many strengths.** Everything is the cyan (`INK.data`, set on the page to `#7efcfe`), at different
   opacities, plus near-white (`INK.read`, `#f5fdfe`) only for the single hottest point. Never a literal hex in the
   scene: gradients use `stop-color="${INK.data}"` with `stop-opacity`, so the page's roles drive the colour.
3. **Glass is dark, light is inside.** Faces are a thin wash of cyan (opacity 0.02 to 0.14) over a dark fill; the
   brightness comes from a core inside the object, not from the faces. If the whole object glows, it is wrong.
4. **Cores are stepped, not round.** A core is three or four nested copies of the object's own silhouette (for a cube,
   its hexagon at scale 0.82, 0.64, 0.48, 0.34, opacity rising inward), lightly blurred (`stdDeviation` 1.7), with a small
   radial centre on top. A big radial gradient alone reads as a ball of fog: the Figma always shows the shape.
5. **Edges are fine and quiet.** 1 px cyan at about 0.5 opacity, with a faint blurred copy under it (2.4 px, 0.1).
   Hidden back edges stay visible at about 0.3: it is glass. Only the edge that catches the light (the near bottom edge of
   the hot object) goes near-white.
6. **Only the receiving / important object burns white.** One white-hot spot per drawing, offset a little toward the
   object's near corner, with one soft streak toward that corner.
7. **Beams fill the channel.** A beam between two objects is the prism between their facing faces: the top sheet
   brightest (0.42 at the source fading to 0.12), the near side dimmer and fading downward. A single flat sheet looks thin.
8. **Particles are heads with long soft trails.** Head: a 4 px cyan dot, a 10 px radial glow and a tiny white glint.
   Trail: about 46 world units long, 9 px wide, a gradient from 0 to 0.32 opacity, pointing back along the travel
   direction. Spread them through the beam's height and width, not on one line.
9. **Dust is sparse.** 10 to 15 tiny dots (r 0.8 to 1.2) inside beams and near hot objects, half bright, half dim.
10. **Labels sit in the object's plane.** A small plate (dark fill 0.65, cyan stroke 0.38) on an edge, with the text set
    in that plane through `transform="matrix(cos30, -0.5, 0, 1, x, y)"` (for a plane along the world y axis). Inter
    Display, about 7.2 px, cyan at 0.72, class `lab`. Text is real `<text>`, never outlined strokes. Keep labels to the
    ones the Figma has.
    **The text must fit its plate exactly**: give it `textLength = plate length - 2 * padding` with
    `lengthAdjust="spacingAndGlyphs"` (font widths vary, so never trust a guessed width), start it at the padding, and
    centre it vertically by putting the baseline at `(plate height - 0.73 * font size) / 2` above the plate's bottom
    edge. Look at it at 4x zoom before calling it done: text running past the plate is the first thing a viewer sees.
11. **Detail level.** Match the Figma, do not add instruments, rulers, dials or grids the design does not have, and do
    not drop the small things it does have (hidden edges, dust, the glint on a particle, the light catching an edge).

## Geometry

- Canvas: the Figma frame's own size, 518 x 339 (`svgDoc(..., { w: 518, h: 339 })`), so coordinates map one to one.
- Projection: `kit({ ox, oy })` from the HUD kit is true isometric and matches the Figma (screen x = ox + (x - y) * cos30,
  screen y = oy + (x + y) / 2 - z).
- Measure from the Figma, then solve for `ox, oy` and sizes: a cube's half width on screen is `side * cos30`, its top
  face is `side` tall on screen. Example: the applicant cube's near bottom corner is at (172, 285) and its side is 59, so
  `ox = 172, oy = 285 - 59`; the second cube sits 212.5 units along -y.
- Draw back to front: the far object, the beam, dust, the near object, labels, then the moving parts.
- **Not every frame is true isometric.** Profile, Induction, Launchpad and Live Projects are flatter or front-on; the
  Live Projects board's face is not even a parallelogram (138 px tall at the left, 122 at the right). Export the frame
  at 3x (`download_assets`, `defaultScale: 3`, saved as `ref/<nn>-<name>@3x.png`), measure the real corners there, and
  build those parts from the measured points (draw contents in the measured plane with `matrix(eu.x, eu.y, 0, 1, x, y)`)
  rather than forcing them onto `kit()`. Ellipses (discs, coins, pedestals) are usually flatter than isometric's 0.5.

## Liquid glass

The Figma's moving "gradient" is a refraction shader (Apple-style liquid glass: light bent through rippled glass), not a
gradient that slides. Plain vector gradients do not read as it. Use `illos/liquid.mjs`:

```js
const lq = liquid({ id: id("lq"), shape: `<path d="${FACE}"/>`, box: [x, y, w, h], T, stops, period, angle, freq, scale, seed });
defs += lq.defs; still.push(lq.markup); css.push(...lq.css);
```

- A fixed `feTurbulence` + `feDisplacementMap` field is the glass; bands of light (`stops`: [offset, role, opacity])
  drift through it by exactly one `period` per cycle, so the loop has no seam.
- Put it only on the big glass surfaces the Figma shows lit that way (a pedestal, a panel, the board's face), clipped to
  that shape, over the surface's own dark fill and under its edges and contents.
- The filter goes on through a class, not a `filter` attribute: the checker's "no blur on a moving part" rule reads
  attributes, and this is a deliberate, measured exception. Cost grows with the area: a pedestal or panel is about 0.2%
  of a phone core, the 172 x 236 Live Projects face about 8% (within the 25% budget). Keep areas small.

## Workflow

1. **Get the frame.** `get_screenshot` of the frame node, saved to `careers/illos/ref/<nn>-<name>.png`; read
   `get_metadata` for the layer names (they name the parts and the labels).
2. **Measure** the corners and sizes in that PNG, and sample colours (PIL) if anything looks off.
3. **Write the sequence** at the top of the scene (Illos motion: cause before effect, a loop that joins), then the scene.
4. **Check:** `node ~/.claude/skills/illos-check/check.mjs illos/<subject>.mjs --svg careers/illos/<subject>.svg`.
   It must end "all checks passed". Expected warnings in this style: the span (the Figma often fills 55 to 65% of the
   frame; keep the Figma's composition) and a label crossed by its own plate or edge.
5. **Compare against the Figma**, side by side, on the dark ground with the page's colour roles:
   `http://localhost:4174/careers/illos/compare.html?n=<subject>` (headless Chrome at device scale 2 works well). Go
   through it part by part: position, beam extent, particle size and trail, core shape, glass darkness, edge strength,
   label size. Fix and compare again until nothing reads differently.
6. **Look at the sheet** (`illos/out/<subject>.png`) for the motion: frames in order, the seam pair matching, reduced
   motion showing the start.
7. **Show one, get feedback, then do the rest.**

## Motion

- Follow `illos-motion`: one cycle T (3 to 8 s), shorter tracks only at T divided by a whole number, no positive delays,
  base CSS equal to the first keyframe.
- Streams of particles share one track with negative delays (`animation-delay: -i * gap`), so the loop is the same at
  every gap step. Each one fades in over 0.25 s, rides at constant speed, fades out over 0.25 s, and goes back while hidden.
- A receiving core flares when a particle arrives (a track of length `gap`, stepping up at `ride % gap`, easing back). A
  sending core gives a small flare as each one leaves.
- No blur on anything that moves: animate opacity of gradient fills, translate plain shapes. Blur filters only on static
  layers. A part that is still in one drawing and moves in another (a cube) needs an unblurred version: its stepped core
  with a soft wide stroke on each step instead of the blur.
- **The motion is the step's story, told literally, not ambient light.** Ask what physically happens in the step and
  animate exactly that; the user rejected motion that only decorated the still (drops running down pillars, packets
  riding fixed beams). What was approved:
  - *Paid Launchpad:* a new coin falls onto the stack (ease in, small bounce); as it lands, three streaks of light shoot
    up out of the stack (money in = celebration) while the stack settles down one coin and the bottom coin sinks into
    the pedestal (clip the stack at its foot) and fades. The "pillars" with hexagons in the Figma are not posts: each is
    a moving streak, the hexagon its head and the line its trail. Move the whole streak (head and trail) and clip it at
    the stack's top so it rises out of the stack trail last; never draw a fixed line with a light crawling up it. The
    loop starts at the Figma's pose (streaks in flight, trails reaching the stack), so the coin lands just before the seam.
  - *Project Deployment:* all four cubes fly in toward the board at one angle, each pulling its trail (the trail is
    part of the cube's moving group, never a static line on the floor) straight at its own place on the face (the
    Figma's two slots and two frames, moved onto each cube's line). The face is whole: a hole slides open only as its
    cube comes within about 1.6 cube sides, the cube shrinks in and fades, its trail drawn in after it, and the hole
    slides shut once it is through. No cube waits outside, and no slot or frame is drawn on the face at rest. Speed
    falls steadily to a third on the way in and holds into the hole, so nothing stops dead.
  - *Profile Evaluation:* the hexagon on a line by the sphere is a scan streak rising out of the pedestal's rim; the
    three hexagons with lines in front of the panel are checks shooting straight out of the panel's face (along its
    depth, toward the applicant), heads first; once they are out, the profile lights.
  - *Induction:* the hexagon on a line between Calibration and Standards is a streak coming up out of Calibration and
    slipping into Standards (clipped at both panels' edges), after the rows light and the sphere flares.
- **Light with a trail moves like the applicant packets in 01** (the approved reference): a bright head with a glow and
  a glint, a soft wide trail (about 9 px, rounded, fading to nothing behind it), carried whole at a steady speed. Any
  light that travels in these drawings (packets, streaks, cubes' trails) is built this way.
- **Every hexagon on a line in the Figma is a streak in flight. Use `illos/streak.mjs`** for it: give it the head's
  Figma place, its direction, how far it has come from its source and its speed; it comes out of its source (clip it
  there, and at whatever it goes into), passes the Figma place at the seam, travels on while it fades, and waits hidden.
  So the loop always starts on the Figma's pose. Pick each streak's speed so its trail length in the Figma is how far
  it has come (about 50 to 90 px/s reads as light, slower reads as a crawl), and time the story's other events around
  the moment the streaks pass their places.
- Drawings and stories that were rejected, to not repeat: a fixed pillar with a marker crawling up it; static markers
  that only light up; drops running down pillars; packets riding fixed beams on the floor; objects parked by the thing
  they belong in ("stuck outside the box": if the story is things going in, every one of them goes in); openings that
  are always open instead of opening for what passes through; decorative curved strokes on a glass face.
- For a part on a curved path or a speed curve that crosses the seam, sample the motion as a function of time into
  keyframes (every 0.05 s, plus the event times; see `track()` in `illos/project-deployment.mjs`), with its phase chosen
  so t = 0 is the Figma's composition. Drop a sample only if the line from the last point kept to the next one passes
  every sample in between within a tolerance (0.15 px for positions, 0.01 for scales): checking each point against its
  own neighbours alone throws away whole smooth curves (it flattened the 05 holes to always open).
- Check the motion by seeking, not only the sheet: open the SVG at `http://localhost:4174/careers/illos/<subject>.svg`,
  pause every animation at a time (`document.getAnimations().forEach(a => { a.pause(); a.currentTime = t * 1000 })`) and
  screenshot the moments that tell the story.

## On the page

- Inline the SVG in the card (`<div class="h3c__ill" data-illos>`), with the colour roles set on the card art:
  `--illos-ground:#050808; --illos-ink:#f5fdfe; --illos-accent:#7efcfe; --illos-accent-dim:#2a8f96;
  --illos-line:#588f98; --illos-faint:rgba(255,255,255,.1)`.
- `experts.js` already pauses every `[data-illos]` when it is off screen.
- **The hero** (`illos/hero-top1.mjs`, "The 1% grid") has no Figma frame: it is drawn from the rules above on its own
  520 x 520 canvas. It sits in `.hx__art`, absolutely placed over the right two columns and ending above the CTA stack,
  with the roles set on `.hx` (ground `#0c1d20`, the hero's night). On phones it moves above the copy. Its plates are the
  only labels ("1 in 100", "Frontier AI"); they hide below 300 px wide.

## Lessons so far

- A radial gradient core makes a fog ball; nested blurred silhouettes make the stepped glass core the design has.
- A big bloom circle floods the whole cube with cyan: keep it at 0.1 or less.
- Thin trails read as needles; the Figma trails are wide and soft.
- The beam is a channel (top and side), not a sheet.
- Edges at full cyan look like neon wire; the Figma edges are muted.
- The Illos HUD palette check passes as long as every colour comes from `INK` roles, including gradient stops.
- A label sized by eye overflowed its plate ("New Applicant" at 7.6 px ran past the end): fit text with `textLength`.
- A big object needs a smaller core. The card-sized steps (0.82 to 0.34 of the silhouette) on a 108-unit cube lit the
  whole cube; for anything over about 80 units use 0.58, 0.45, 0.34, 0.25 at opacity 0.06 to 0.4, a core radius of 0.24
  of the side, a bloom of 0.6, and a shorter white streak (0.45 of the way to the corner).
- A column that widens from a small source to a big receiver (a frustum) is still a channel: four faces, the near two at
  0.34 fading to 0.06, the far two at 0.16 fading to 0.03. Brighter than that and it reads as fog.
- A crowd is the quiet part: the ninety-nine cubes are dark glass with 0.26 edges, no core and no blur. Only the one that
  matters gets a core, and it stays cyan; the white goes to the receiver.
- Never let a flare land on the loop's seam. Flares fire at a step boundary; if that boundary is also 0 s the checker sees
  a jump. Send and arrive a fraction into each step (`LEAVE = 0.3`), with the RIDE a whole number of steps.
- `RIDE % GAP` in floating point can come out as 0.7999 instead of 0: compute such offsets by hand or round them.
- Literal white or black (for a mask) fails the palette check: make the shape with an off-centre radial gradient of the
  roles instead.
- In light theme `INK.read` is near-black: a "white-hot" flash or streak drawn with it turns grey. Use `INK.data` for
  flashes and streaks that must glow in both themes.
- Read `experts.html` fresh before re-inlining: other work edits the same file. Replace each `<svg class="sf-<subject>"`
  through its `</svg>`, and check afterwards that the page has no duplicate ids.
- **Use the design's own parts for the story; never invent a new one.** The holes the Live Projects cubes go into are
  the board's dark slots (plain dark fill, fine cyan edge). A new glowing frame with a flash was rejected outright.
  A slot opens and shuts by sliding across its own width (the unit square mapped onto its quad, `scaleX` inside).
- **No hard clip edges on a moving object.** Cutting a cube with a straight half-plane ("behind the face") read as a
  weird mask. To go into a hole, the object shrinks toward its centre over the hole (it is going away) and fades in the
  dark; its trail is in the same scaling group, so it is drawn in after it.
- A hard-edged rectangle laid over glass to darken part of it leaves a visible seam across the face (the 02 panel's
  dark right half read as a stray line). Shade glass only with gradients that fade to nothing.
- Anything cut into or drawn on a face (holes, slots, labels, bars) must lie in that face's plane: build it in the
  face's own coordinates (across, down) and map it back, so its edges run parallel to the face's edges where it sits.
  Copying a Figma quad and sliding it to a new place left the 05 holes skewed against the board.

## Drawings with no Figma (the Why Deccan cards)

> Superseded on the page: the Why cards are now flat UI cards in HTML/CSS (`careers/why.css`), in the manner of the
> bento on deccan.ai/enterprise-os (borderless glow cards split by two fading hairlines, title and line on top, a UI
> running off each card's bottom edge, a soft teal haze behind). The isometric scenes below (`illos/why-*.mjs`) are kept
> only as a reference for drawing in the glass style without a Figma frame.
>
> **Study a reference; never copy it.** The first flat pass reproduced the reference's own drawings (its pipeline, its
> ring with a status pill, its log, its stack) and was rejected as copying. What makes those cards work: each one *is*
> the product's mechanism in its own words; real microcopy; one motion that demonstrates the mechanism; greys with one
> small accent, solid = done and dashed = pending; a different silhouette per card; cropped so it reads as a glimpse of
> a live system. So each Why card shows how *its* benefit works, with its own silhouette: A a portrait sheet of your
> answer where a domain lead highlights a phrase, pins a margin note and resolves it; B wide 24-hour lanes where a block
> of hours is dragged to the evening; C a real month calendar where today steps through and the 2nd and 17th pay out;
> D stage columns of applicants narrowing to one lit dot. No two cards may share a frame (the user also rejected two
> isometric cards that were both "object on a disc + tilted text panel + a light between").

The four Why cards (`illos/why-guided`, `why-hours`, `why-paid`, `why-few.mjs`) have no Figma frames; they were drawn
in this style from each card's own story, at 440 x 260 (D: 320 x 256 beside its HTML number).
- Start from the card's sentence and show it literally, with the same parts as How it works: glass panels in the
  plane along world x (`matrix(cos30, 0.5, 0, 1, x, y)`) for anything with words or rows, glass spheres for people,
  glass cubes for Deccan and the network, thin slabs for a field of things (a week, a hundred applicants), pedestals.
- For a light sent from one thing to another at a set moment, use `shot()` in `illos/streak.mjs`: it leaves `from` at
  `launch`, goes into `to` trail last (cut square to its path at both ends), and returns `arrive` to time what happens
  there (a row lights, a flag goes up, a total steps up).
- Numbers that change are crossfades between fixed texts ($0.00, then $1,240.00, then $2,420.00); totals that must stay
  crisp and readable (the "<1%", "22 h this week") stay as the card's own HTML beside or under the drawing.
- Put a marker next to the thing it belongs to, not at the far end of a sloped row: on a panel in the x plane the rows
  drop as they go right, so a flag at the far right of row A sits level with row B's start and reads as B's.
- Colour roles for these cards are set on `.wy__ill` / `.wy-few__ill` in `why.css`, with the card's own ground
  (`#0b0c0c`); `experts.js` pauses every `[data-illos]` off screen, so the cards need no script of their own.
- Size each drawing to its art band (300 px with 28 px padding: at most about 410 x 242), or it spills into the padding.


## The Work panel cards (flat 2D UI, not glass, not isometric)

The "How experts help AI learn" panel (`.tw__panel` in `careers/experts.html`) is **not** an Illos drawing. The user
rejected an isometric HUD version: these are flat 2D cards, built in HTML/CSS (`.eo-*` in `experts.css`), after the card
visuals on deccan.ai/enterprise-os:
- A hairline window (10 px top radius, open at the bottom, faded out by a mask) with a tab bar: the active tab on a grey
  chip, `|` separators, a status pill on the right (dark, 1 px border, coloured dot: green running, yellow ranking, red
  recording or flagged), and a white hairline under the tabs that fills as a timer.
- Steps are pills: solid grey for done, dashed for active or pending (cyan dashed for the active one, red for a failed one),
  with a small score chip inside. Elbow connectors are 1 px white lines with small cyan arrowheads.
- Textures are halftone dot fields (`radial-gradient` dots on a 4 px grid); logs are translucent grey cards over a back
  window with three dots and a dot matrix, joined by dashed loop arrows.
- Everything is sized in one unit, `--u: calc(100cqw / 608)` on `.eo`, never `em`: an element with its own font size
  would scale its padding and positions by that size. Absolute positions inside a scene are percentages of its frame.
- Only the open card animates, and only while the panel is on screen (`data-illos` on the panel feeds `--illos-play`).
