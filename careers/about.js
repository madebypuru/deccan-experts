/* About Us — motion. Same vocabulary as the Careers page and deccan.ai:
   blur-fade-up reveals, word stagger on headings, soft out-cubic settles, auto-advancing dot carousels. */
(() => {
  const root = document.documentElement;
  if (!window.gsap) { root.classList.remove("js"); return; }
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SNAP = "power3.out";                    // settle, not snap
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const onView = (el, fn, opts = { threshold: .25 }) => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, opts);
    io.observe(el);
  };
  const splitWords = el => {
    const walk = node => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(w => {
          if (!w) return;
          if (/^\s+$/.test(w)) frag.append(w);
          else { const s = document.createElement("span"); s.style.display = "inline-block"; s.textContent = w; frag.append(s); }
        });
        node.replaceWith(frag);
      } else [...node.childNodes].forEach(walk);
    };
    walk(el);
    return $$("span", el);
  };

  /* ---------- reveals ---------- */

  // each element fades back to its own designed opacity (some copy sits at 60–70%)
  const reveals = $$("[data-reveal]");
  reveals.forEach(el => { el._to = +getComputedStyle(el).opacity || 1; gsap.set(el, { visibility: "visible", opacity: REDUCED ? el._to : 0 }); });
  if (!REDUCED) {
    const queue = new Set();
    let flushing = false;
    const flush = () => {
      flushing = false;
      [...queue].sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left)
        .forEach((el, i) => {
          const delay = i * .1;
          if (el.dataset.reveal === "words") {
            gsap.set(el, { opacity: el._to });
            gsap.fromTo(splitWords(el), { opacity: 0, y: 10, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power2.out", stagger: .09, delay });
          } else {
            gsap.fromTo(el, { opacity: 0, y: 20, filter: "blur(12px)" }, { opacity: el._to, y: 0, filter: "blur(0px)", duration: 1.1, ease: "power2.out", delay, clearProps: "filter,transform" });
          }
        });
      queue.clear();
    };
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      queue.add(e.target);
      if (!flushing) { flushing = true; requestAnimationFrame(flush); }
    }), { threshold: .15, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(el => io.observe(el));
  }

  /* ---------- count-ups ---------- */

  $$("[data-count]").forEach(el => {
    const to = +el.dataset.count, suf = el.dataset.suffix || "";
    if (REDUCED) return;
    el.textContent = "0" + suf;
    onView(el, () => {
      const o = { v: 0 };
      gsap.to(o, { v: to, duration: 2, ease: "power2.out", delay: .2, onUpdate: () => { el.textContent = Math.round(o.v) + suf; } });
    }, { threshold: .6 });
  });

  /* ---------- dot carousel controller (shared) ---------- */

  function carousel(ctrls, count, interval, onGo) {
    const dotsEl = $(".dots", ctrls), play = $(".play", ctrls);
    dotsEl.innerHTML = Array.from({ length: count }, (_, i) => `<button class="dot" role="tab" aria-label="Go to ${i + 1}"><span><i></i></span></button>`).join("");
    const dots = $$(".dot", dotsEl);
    let cur = 0, paused = REDUCED, visible = false, prog = null;
    const tick = () => {
      prog && prog.kill();
      dots.forEach((d, k) => { d.classList.toggle("is-on", k === cur); d.setAttribute("aria-selected", k === cur); gsap.set($("i", d), { width: 0 }); });
      prog = gsap.to($("i", dots[cur]), { width: "100%", duration: interval, ease: "none", onComplete: () => go(cur + 1) });
      if (paused || !visible) prog.pause();
    };
    const go = (i, user) => { const prev = cur; cur = (i + count) % count; if (cur !== prev || user) onGo(cur, prev); tick(); };
    // follow an outside change (e.g. the user scrolled) without animating; restarts the countdown
    const set = i => { cur = (i + count) % count; tick(); };
    dots.forEach((d, i) => d.addEventListener("click", () => go(i, true)));
    play.addEventListener("click", () => {
      paused = !paused;
      play.setAttribute("aria-pressed", paused);
      play.setAttribute("aria-label", paused ? "Play rotation" : "Pause rotation");
      paused ? prog.pause() : visible && prog.resume();
    });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; prog && (visible && !paused ? prog.resume() : prog.pause()); }, { threshold: .3 }).observe(ctrls.closest("section"));
    tick();
    return { go, set };
  }

  /* ---------- hero: looping carousel. Every photo is a card that carries its own glass frame.
     The next photo travels into focus and grows to the frame's size while its gradient glow
     blurs in around it; the focused one leaves off the left edge with its frame; the rest
     drift along, and the one that left re-enters from the right. ---------- */

  const deck = $(".deck"), media = $(".ab-hero__media");
  if (deck) {
    const cards = $$(".card", deck);
    const glows = cards.map(c => $(".card__glow", c));
    const slotEls = $$("[data-slot]", media).sort((a, b) => a.dataset.slot - b.dataset.slot);
    // geometry relative to .ab-hero__media, from layout (unaffected by reveal transforms)
    const box = el => { let x = 0, y = 0; for (let n = el; n && n !== media; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; } return { x, y, w: el.offsetWidth, h: el.offsetHeight }; };
    let slots = [], order = cards.map((_, i) => i);   // order[k] = card sitting in slot k
    const measure = () => {
      const s = slotEls.map(box);
      const gap = s[2].x - s[1].x;
      s.push({ ...s[2], x: s[2].x + gap });          // waiting just past the right edge
      const left = media.getBoundingClientRect().left + scrollX;
      s.exit = { ...s[0], x: -left - s[0].w - 80 };  // fully off the left of the screen
      s.pad = 30 * s[0].w / 570;                      // Figma's 30px frame inset, scaled with the frame
      return s;
    };
    // focused = framed (inset + glow); everyone else is a bare photo
    const look = (k, pad) => k === 0 ? { "--pad": pad + "px" } : { "--pad": "0px" };
    const place = () => {
      slots = measure();
      order.forEach((c, k) => {
        gsap.set(cards[c], { x: slots[k].x, y: slots[k].y, width: slots[k].w, height: slots[k].h, zIndex: 4 - k, opacity: 1, ...look(k, slots.pad) });
        gsap.set(glows[c], { opacity: k ? 0 : 1, filter: "blur(0px)" });
      });
    };
    place();
    addEventListener("resize", place);
    let busy = false;
    carousel($('[data-carousel="hero"]'), cards.length, 5, () => {
      if (busy) return;
      busy = true;
      const [out, ...rest] = order;
      const dur = 1.6, ease = "power2.inOut";
      // the focused card leaves first, frame and all, easing off the left edge
      gsap.set(cards[out], { zIndex: 1 });
      gsap.to(cards[out], { x: slots.exit.x, duration: dur, ease });
      gsap.to(cards[out], { opacity: 0, duration: dur * .45, ease: "power1.in", delay: dur * .55 });
      rest.forEach((c, k) => {
        const to = slots[k], delay = .12 + k * .1;
        gsap.set(cards[c], { zIndex: 5 - k });
        gsap.to(cards[c], { x: to.x, y: to.y, width: to.w, height: to.h, duration: dur, ease, delay, ...look(k, slots.pad) });
        // the one arriving in focus: its gradient frame blurs in as it settles
        if (k === 0) gsap.fromTo(glows[c], { opacity: 0, filter: "blur(28px)" }, { opacity: 1, filter: "blur(0px)", duration: dur * .9, ease: "power2.out", delay: delay + dur * .35 });
      });
      gsap.delayedCall(dur + .5, () => {
        order = [...rest, out];
        const back = slots[order.length - 1];
        gsap.set(cards[out], { x: back.x, y: back.y, width: back.w, height: back.h, zIndex: 1, opacity: 1, "--pad": "0px" });
        gsap.set(glows[out], { opacity: 0 });
        busy = false;
      });
    });
  }

  /* ---------- mission: words light up as you scroll ---------- */

  const mission = $("[data-scrub]");
  if (mission) {
    const words = splitWords(mission);
    if (REDUCED || !window.ScrollTrigger) words.forEach(w => (w.style.opacity = 1));
    else gsap.fromTo(words, { opacity: .2 }, { opacity: 1, ease: "none", duration: .14, stagger: .12,   // one word at a time, barely overlapping
      scrollTrigger: { trigger: mission, start: "top 85%", end: "bottom 30%", scrub: .3 } });
    // the glow behind the words swells with them
    const glow = $(".mission__glow");
    if (glow && !REDUCED && window.ScrollTrigger) gsap.fromTo(glow, { opacity: .35, scale: .86 }, { opacity: .85, scale: 1, ease: "none",
      scrollTrigger: { trigger: mission, start: "top 85%", end: "bottom 30%", scrub: .3 } });
  }

  /* ---------- research timeline ---------- */

  const track = $(".tl__track");
  if (track) {
    // copy is Figma placeholder content
    const ENTRIES = Array.from({ length: 8 }, () => ({ date: "July 2019", name: "V7 Darwin Beta at CVPR", img: "img/about/timeline.webp" }));
    const ticks = '<div class="tl__ticks">' + "<i></i>".repeat(14) + "</div>";
    track.innerHTML = ENTRIES.map((e, i) => `
      <div class="tl__col tl__col--${i % 2 ? "b" : "a"}">
        <div class="tl__pic"><img src="${e.img}" alt=""></div>
        <span class="tl__mark"></span>${ticks}
        <div class="tl__txt"><span class="tl__date">${e.date}</span><span class="tl__name">${e.name}</span></div>
      </div>`).join("");
    const cols = $$(".tl__col", track);
    const REST = -2;                                   // the photos' resting tilt
    gsap.set($$(".tl__pic", track), { rotation: REST, transformPerspective: 700 });

    // In: each photo is dropped onto the table like a polaroid — tilted and small, it settles to
    // its resting angle, then develops from washed-out white to full colour. Its ticks and marker
    // rise with it. Columns animate as they enter the timeline's visible area, not all at once.
    if (!REDUCED) {
      cols.forEach((c, i) => {
        const up = c.classList.contains("tl__col--a");
        gsap.set($$(".tl__ticks i", c), { scaleY: 0 });
        gsap.set($(".tl__mark", c), { scaleY: 0 });
        gsap.set($(".tl__pic", c), { opacity: 0, y: up ? -34 : 34, rotation: up ? -11 : 8, scale: .86 });
        gsap.set($(".tl__pic img", c), { filter: "grayscale(1) brightness(1.75) contrast(.7)" });
        gsap.set($(".tl__txt", c), { opacity: 0, y: 12, filter: "blur(6px)" });
      });
      const land = c => {
        gsap.to($$(".tl__ticks i", c), { scaleY: 1, duration: .8, ease: SNAP, stagger: { each: .025, from: "start" } });
        gsap.to($(".tl__mark", c), { scaleY: 1, duration: 1, ease: SNAP, delay: .1 });
        gsap.to($(".tl__pic", c), { opacity: 1, y: 0, rotation: REST, scale: 1, duration: 1.1, ease: "back.out(1.5)", delay: .15 });
        gsap.to($(".tl__pic img", c), { filter: "grayscale(0) brightness(1) contrast(1)", duration: 1.8, ease: "power2.out", delay: .45, clearProps: "filter" });
        gsap.to($(".tl__txt", c), { opacity: 1, y: 0, filter: "blur(0px)", duration: .7, ease: "power2.out", delay: .35, clearProps: "filter" });
      };
      // wait until the section is on screen, then reveal columns as they scroll into the timeline
      onView(track, () => {
        let n = 0;
        const io = new IntersectionObserver(entries => entries.forEach(e => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          gsap.delayedCall(Math.min(n++, 3) * .14, () => land(e.target));
          setTimeout(() => (n = Math.max(0, n - 1)), 600);
        }), { root: track.parentElement, threshold: .3 });
        cols.forEach(c => io.observe(c));
      }, { threshold: .2 });
    }

    // Hover: the photo straightens and lifts toward you, tilting in 3D after the cursor with a soft glare.
    // The column's marker brightens (CSS) and its ticks ripple.
    if (matchMedia("(hover: hover)").matches && !REDUCED) cols.forEach(c => {
      const pic = $(".tl__pic", c);
      const rx = gsap.quickTo(pic, "rotationX", { duration: .5, ease: "power3.out" });
      const ry = gsap.quickTo(pic, "rotationY", { duration: .5, ease: "power3.out" });
      pic.addEventListener("pointerenter", () => {
        if (pic.closest(".is-dragging")) return;
        pic.classList.add("is-hover");
        gsap.to(pic, { rotation: 0, scale: 1.06, y: c.classList.contains("tl__col--a") ? -6 : 6, duration: .6, ease: SNAP, overwrite: "auto" });
        gsap.to(pic, { "--go": 1, duration: .4 });
        gsap.fromTo($$(".tl__ticks i", c), { scaleY: 1 }, { keyframes: [{ scaleY: 1.45, duration: .18, ease: "power2.out" }, { scaleY: 1, duration: .5, ease: "elastic.out(1,.5)" }], stagger: .02, overwrite: "auto" });
      });
      pic.addEventListener("pointermove", e => {
        const r = pic.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
        ry(nx * 16); rx(-ny * 12);
        pic.style.setProperty("--gx", (nx + .5) * 100 + "%");
        pic.style.setProperty("--gy", (ny + .5) * 100 + "%");
      });
      pic.addEventListener("pointerleave", () => {
        pic.classList.remove("is-hover");
        rx(0); ry(0);
        gsap.to(pic, { rotation: REST, scale: 1, y: 0, duration: .8, ease: "elastic.out(1,.6)", overwrite: "auto" });
        gsap.to(pic, { "--go": 0, duration: .4 });
      });
    });
    // One scroll position, two drivers: the user (trackpad, touch, wheel, drag) and the player.
    // The four dots are four evenly spaced stops along the scroll range.
    const tl = track.parentElement, PAGES = 4;
    const range = () => Math.max(0, tl.scrollWidth - tl.clientWidth);
    const stop = i => range() * i / (PAGES - 1);
    const nearest = () => Math.round(tl.scrollLeft / (range() / (PAGES - 1) || 1));
    let auto = null;                                   // the player's glide, if one is running
    const stopAuto = () => { auto && auto.kill(); auto = null; };
    const ctl = carousel($('[data-carousel="tl"]'), PAGES, 4, i => {
      stopAuto();
      auto = gsap.to(tl, { scrollLeft: stop(i), duration: 1.4, ease: "power2.inOut", onComplete: () => { auto = null; } });
    });
    // hand-scrolling moves the active dot and restarts the countdown
    let settle;
    tl.addEventListener("scroll", () => {
      if (auto) return;
      clearTimeout(settle);
      settle = setTimeout(() => ctl.set(nearest()), 120);
    }, { passive: true });
    // a vertical mouse wheel scrolls the timeline sideways until it hits an end, then the page takes over
    tl.addEventListener("wheel", e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { stopAuto(); return; }   // trackpad swipe: native
      const d = e.deltaY * (e.deltaMode === 1 ? 32 : 1);
      const atEnd = d > 0 ? tl.scrollLeft >= range() - 1 : tl.scrollLeft <= 0;
      if (atEnd) return;
      e.preventDefault();
      stopAuto();
      tl.scrollLeft += d;
    }, { passive: false });
    // drag with the mouse, with a little momentum on release
    let drag = null;
    tl.addEventListener("pointerdown", e => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      stopAuto();
      drag = { x: e.clientX, left: tl.scrollLeft, v: 0, t: performance.now(), moved: false };
    });
    addEventListener("pointermove", e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) { drag.moved = true; tl.classList.add("is-dragging"); }
      if (!drag.moved) return;
      const now = performance.now(), next = drag.left - dx;
      drag.v = (next - tl.scrollLeft) / Math.max(1, now - drag.t);
      drag.t = now;
      tl.scrollLeft = next;
    });
    addEventListener("pointerup", () => {
      if (!drag) return;
      if (drag.moved) gsap.to(tl, { scrollLeft: tl.scrollLeft + drag.v * 280, duration: .8, ease: "power3.out" });
      tl.classList.remove("is-dragging");
      drag = null;
    });
  }

  /* ---------- what quality means: pinned, four beats ---------- */

  const quality = $(".quality");
  if (quality) {
    // a page can supply its own four points (number, title, line) via window.QUALITY_STEPS
    const STEPS = window.QUALITY_STEPS || [
      ["01", "Accuracy", "Every data point is labeled with care and expertise."],
      ["02", "Consistency", "Uniform standards, no matter who annotates."],
      ["03", "Usability", "Data is ready for your ML models—no extra cleanup."],
      ["04", "Reliability", "You get exactly what you expect, every time."],
    ];
    const h3 = $(".q-copy h3", quality), p = $(".q-copy p", quality);
    const sheen = $(".q-orb__sheen", quality), glint = $(".q-orb__glint", quality), ring = $(".q-ring", quality), orb = $(".q-orb", quality), dial = $(".q-dial", quality);
    const STEP = 90;                                   // every circular element turns a quarter-turn per beat

    // build the dial: point k sits k×90° clockwise from the top; numbers stay upright
    dial.innerHTML = STEPS.map(([n], k) =>
      `<div class="q-arm${k ? "" : " is-on"}" style="transform:rotate(${k * STEP}deg)"><span class="q-tick"><img src="img/about/q-line.png" alt=""></span><span class="q-pt">${n}</span></div>`).join("");
    const arms = $$(".q-arm", dial), pts = $$(".q-pt", dial), ticks = $$(".q-tick", dial);
    const angle = { v: 0 };
    const upright = () => pts.forEach((pt, k) => gsap.set(pt, { rotation: -(k * STEP + angle.v) }));
    // centre the dial on the ring and size it so the active point lands where Figma puts the badge (y≈310)
    const placeDial = () => {
      const cy = orb.offsetTop + orb.offsetHeight / 2;
      dial.style.top = cy + "px";
      dial.style.setProperty("--r", (cy - 310) + "px");
    };
    placeDial();
    addEventListener("resize", placeDial);
    gsap.set(ring, { xPercent: -50, x: 0 });
    gsap.set(ticks[0], { scaleY: 1 });
    upright();
    const turnTo = i => {
      const to = -i * STEP;
      gsap.to(angle, { v: to, duration: 1.6, ease: "power2.inOut", overwrite: true,
        onUpdate: () => { gsap.set(dial, { rotation: angle.v }); upright(); } });
      gsap.to([ring, sheen], { rotation: to, duration: 1.6, ease: "power2.inOut", overwrite: "auto" });
      gsap.fromTo(glint, { opacity: .95 }, { opacity: .5, duration: 1.8, ease: "power2.out", delay: .5 });
      arms.forEach((a, k) => a.classList.toggle("is-on", k === i));
      ticks.forEach((t, k) => gsap.to(t, { scaleY: k === i ? 1 : 0, duration: k === i ? 1 : .4, ease: k === i ? SNAP : "power2.inOut", delay: k === i ? .7 : 0 }));
    };
    const letters = (el, text) => { el.innerHTML = [...text].map(c => `<span>${c}</span>`).join(""); return $$("span", el); };

    let cur = 0;
    const show = (i, dir) => {
      if (i === cur) return;
      const [, t, d] = STEPS[i];
      turnTo(i);
      gsap.killTweensOf([...$$("span", h3), p]);
      gsap.to($$("span", h3), { opacity: 0, y: -8, filter: "blur(8px)", duration: .3, ease: "power2.inOut", stagger: .01 });
      gsap.to(p, { opacity: 0, filter: "blur(4px)", duration: .3, ease: "power2.inOut" });
      gsap.delayedCall(.35, () => {
        gsap.fromTo(letters(h3, t), { opacity: 0, y: 12, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: .9, ease: SNAP, stagger: .025 });
        p.textContent = d;
        gsap.fromTo(p, { opacity: 0, y: 8, filter: "blur(6px)" }, { opacity: .7, y: 0, filter: "blur(0px)", duration: .9, ease: "power2.out", delay: .15 });
      });
      cur = i;
    };
    letters(h3, STEPS[0][1]);

    if (window.ScrollTrigger && !REDUCED) {
      ScrollTrigger.create({
        trigger: quality, start: "top top", end: "+=" + innerHeight * 2.4, pin: true, scrub: .6,
        onUpdate: st => {
          const i = Math.min(3, Math.floor(st.progress * 4 * .999));
          if (i !== cur) show(i, i > cur ? 1 : -1);
        },
      });
      // the ring breathes while you read
      gsap.to(ring, { scale: 1.015, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 50%" });
    }
  }

  /* ---------- team. Default: accordion — the next person opens into the card.
     .lead--auto: auto-scrolling portrait rows. Each region drifts on its own (USA left, India right), stops under
     the cursor while the hovered card expands, can be dragged or flicked, and loops seamlessly at any team size. ---------- */

  const IN_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.6 5.4H.9V15h2.7V5.4zM2.25 1A1.56 1.56 0 1 0 2.2 4.1 1.56 1.56 0 0 0 2.25 1zM15.1 9.5c0-2.6-1.4-4.3-3.6-4.3-1.3 0-2.2.7-2.6 1.4V5.4H6.3V15H9v-5c0-1.2.5-2.2 1.7-2.2s1.6 1 1.6 2.2v5h2.8V9.5z"/></svg>';

  // Names, roles, backgrounds, photos and profiles are from deccan.ai/about-us.
  const TEAMS = {
    usa: [
      {"img": "img/about/team/rukeshreddy.webp", "name": "Rukesh Reddy", "role": "Founder", "cred": "IIT Bombay, IIM Ahmedabad", "linkedin": "https://www.linkedin.com/in/rukeshreddy"},
      {"img": "img/about/team/navaneeth.webp", "name": "Navaneeth Bodla", "role": "AI & Research", "cred": "Ex Adobe, Cruise, PhD from UMD, BITS Pilani", "linkedin": "https://www.linkedin.com/in/navaneeth-bodla-b1175833"},
      {"img": "img/about/team/shivangi.webp", "name": "Shivangi Yadav", "role": "Evals", "cred": "Ex Meta, PhD from Michigan State, IIIT Delhi", "linkedin": "https://www.linkedin.com/in/shivangi-yadav-2656a15b"},
      {"img": "img/about/team/akhedia.webp", "name": "Ankit Khedia", "role": "Multimodal", "cred": "Ex Meta, Google, IIT Kharagpur, Georgia Tech", "linkedin": "https://www.linkedin.com/in/akhedia"},
      {"img": "img/about/team/samir.webp", "name": "Samir Janveja", "role": "GTM", "cred": "Ex Google, UCB Haas, Michigan Ross", "linkedin": "https://www.linkedin.com/in/samir-janveja"},
      {"img": "img/about/team/kmrvishal.webp", "name": "Vishal Kumar", "role": "Solutions", "cred": "Ex Amazon, Scale AI, Arizona State", "linkedin": "https://www.linkedin.com/in/kmrvishal"},
      {"img": "img/about/team/jsahni.webp", "name": "Jagdeep Sahni", "role": "New Accounts", "cred": "Ex Intuit, AWS, Northwestern University", "linkedin": "https://www.linkedin.com/in/jsahni"},
      {"img": "img/about/team/narendar.webp", "name": "Narendar Sriram", "role": "Robotics", "cred": "Ex OSARO, CMU Robotics Institute", "linkedin": "https://www.linkedin.com/in/narendar-sriram"},
    ],
    india: [
      {"img": "img/about/team/purvabhandari.webp", "name": "Purva Bhandari", "role": "Strategy", "cred": "Ex Google, McKinsey, IIT Madras, IIM Ahd", "linkedin": "https://www.linkedin.com/in/purvabhandari"},
      {"img": "img/about/team/sajomathews.webp", "name": "Sajo Mathews", "role": "Applied AI", "cred": "Ex-Founder CTO, Zapr (acquired by Samsung), IIT Kgp, IIM Ahd", "linkedin": "https://www.linkedin.com/in/sajomathews"},
      {"img": "img/about/team/sarawagi.webp", "name": "Ankur Sarawagi", "role": "GTM", "cred": "Ex Cofounder Nearby, Bain, IIT Bombay", "linkedin": "https://www.linkedin.com/in/sarawagi"},
      {"img": "img/about/team/gopipep.webp", "name": "Gopi Pepakayala", "role": "RevOps", "cred": "Ex-Founder OSVid, AWS, IIT Madras", "linkedin": "https://www.linkedin.com/in/gopipep"},
      {"img": "img/about/team/syed.webp", "name": "Shakeel Imdad", "role": "Delivery", "cred": "Ex Scale AI, HighRadius, NIT Durgapur, ISB", "linkedin": "https://www.linkedin.com/in/syed-imdad"},
      {"img": "img/about/team/jaiprasadr.webp", "name": "Jaiprasad Reddy", "role": "Coding & RL", "cred": "Ex MENSA Brands, NIT Surathkal", "linkedin": "https://www.linkedin.com/in/jaiprasadr"},
      {"img": "img/about/team/krishnanand.webp", "name": "Krishna B", "role": "Scaled Operations", "cred": "Ex Amazon (Nova / Alexa Ops)", "linkedin": "https://www.linkedin.com/in/krishnanand-b-81a9581b"},
      {"img": "img/about/team/arpitmaheshwari.webp", "name": "Arpit Maheshwari", "role": "Growth & Partnerships", "cred": "Ex Uber AI, Scale AI, IIT Kanpur, FMS Delhi", "linkedin": "https://www.linkedin.com/in/arpitmaheshwari"},
      {"img": "img/about/team/ginika.webp", "name": "Ginika Gupta", "role": "People & Culture", "cred": "Ex Indigo, 15+ yrs. of exp., IIM Kozhikode", "linkedin": "https://www.linkedin.com/in/ginika-nishank-gupta"},
      {"img": "img/about/team/pr.webp", "name": "Mahesh Reddy", "role": "Platforms", "cred": "Ex Hackerrank, 15+ yrs. of exp.", "linkedin": "https://www.linkedin.com/in/pr-mahesh"},
      {"img": "img/about/team/sparsh.webp", "name": "Sparsh Ganjoo", "role": "Founders Office", "cred": "Ex- VC, 3one4 Capital", "linkedin": "https://www.linkedin.com/in/sparsh-ganjoo"},
    ],
  };
  const accordion = region => {
    const people = peopleFor(region), box = $(".people", region);
    box.innerHTML = people.map((m, i) => `
      <div class="person${i ? "" : " is-on"}" tabindex="0" role="button" aria-label="${m.name}">
        <div class="person__glow" aria-hidden="true"><img src="img/about/glow-small.webp" alt=""><img src="img/hero-team-bg-blur.webp" alt=""></div>
        <div class="person__card"><img src="${m.img}" alt="${m.name}"></div>
        <div class="person__who"><b>${m.name}</b><small>${m.role} <img src="img/about/rule-v.svg" alt=""> ${m.cred}</small></div>
      </div>`).join("");
    const cards = $$(".person", box);
    const open = i => cards.forEach((c, k) => c.classList.toggle("is-on", k === i));
    const ctl = carousel($(".ctrls", region), cards.length, 5, i => open(i));
    cards.forEach((c, i) => {
      c.addEventListener("click", () => ctl.go(i, true));
      c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ctl.go(i, true); } });
    });
  };
  // a region can bring its own people as JSON (the Experts About page does); otherwise it's a deccan.ai team above
  const peopleFor = region => {
    const own = $('script[type="application/json"]', region);
    return own ? JSON.parse(own.textContent) : TEAMS[region.dataset.region];
  };
  const initials = n => n.split(" ").slice(0, 2).map(w => w[0]).join("");
  const card = m => `
      <div class="mate">
        <div class="mate__card"><div>${m.img ? `<img src="${m.img}" alt="${m.name}" draggable="false">` : `<span class="mate__ini" aria-hidden="true">${initials(m.name)}</span>`}</div>${m.linkedin ? `<a class="mate__in" href="${m.linkedin}" target="_blank" rel="noopener" draggable="false" aria-label="${m.name} on LinkedIn">${IN_ICON}</a>` : ""}</div>
        <div class="mate__who"><b>${m.name}</b><small><span>${m.role}</span><span>${m.cred}</span></small></div>
      </div>`;
  const marquee = (box, people, dir) => {
    const panel = box.closest(".tm__panel");           // option 2: a country that's switched away stops moving
    const set = people.map(card).join("");
    box.innerHTML = `<div class="crew__track">${set}</div>`;
    const track = $(".crew__track", box);
    // repeat the set until there's always a full screen of people beyond one copy, so the loop is seamless
    let copies = 1;
    const fill = () => {
      track.insertAdjacentHTML("beforeend", copies < 2 ? set : ""); copies = Math.max(copies, 2);
      const one = track.children[people.length].offsetLeft - track.children[0].offsetLeft;  // one set, gap included
      while (one * (copies - 1) < innerWidth + one) { track.insertAdjacentHTML("beforeend", set); copies++; }
      return one;
    };
    let span = fill();
    addEventListener("resize", () => { span = fill(); });
    if (REDUCED) { box.style.overflowX = "auto"; return; }

    const BASE = 72;                                   // px per second
    let x = dir > 0 ? -span : 0, speed = BASE, paused = false, visible = false, drag = false, sx = 0, x0 = 0, lx = 0, lt = 0, flick = 0;
    const wrap = v => ((v % span) - span) % span;      // keep x within (-span, 0]
    const target = { s: BASE };
    gsap.ticker.add((t, dt) => {
      if (!visible || drag || (panel && !panel.classList.contains("is-on"))) return;
      flick *= .94;
      speed += (target.s - speed) * .08;
      x = wrap(x + (dir * speed + flick) * dt / 1000);
      gsap.set(track, { x });
    });
    new IntersectionObserver(([e]) => visible = e.isIntersecting, { rootMargin: "100px" }).observe(box);
    const ease = () => target.s = paused ? 0 : box.matches(":hover") ? 0 : BASE;
    box.addEventListener("pointerenter", ease);
    box.addEventListener("pointerleave", ease);
    box.addEventListener("pointerdown", e => {
      if (e.button || e.target.closest("a")) return;   // let the LinkedIn link take its own click
      drag = true; sx = lx = e.clientX; x0 = x; lt = performance.now(); flick = 0;
      box.setPointerCapture(e.pointerId); box.classList.add("is-drag");
    });
    box.addEventListener("pointermove", e => {
      if (!drag) return;
      const now = performance.now();
      flick = (e.clientX - lx) / Math.max(1, now - lt) * 1000; lx = e.clientX; lt = now;
      x = wrap(x0 + e.clientX - sx); gsap.set(track, { x });
    });
    const up = () => { if (!drag) return; drag = false; box.classList.remove("is-drag"); flick = gsap.utils.clamp(-2400, 2400, flick); };
    box.addEventListener("pointerup", up);
    box.addEventListener("pointercancel", up);
    return { pause: v => { paused = v; ease(); } };
  };
  const pauseButton = (play, rows) => {
    const ICON = { pause: '<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 1h2v8H2zM6 1h2v8H6z" fill="#f6f3f4"/></svg>', play: '<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z" fill="#f6f3f4"/></svg>' };
    let paused = false;
    play.innerHTML = ICON.pause;
    play.addEventListener("click", () => {
      paused = !paused;
      play.innerHTML = paused ? ICON.play : ICON.pause;
      play.setAttribute("aria-pressed", paused);
      play.setAttribute("aria-label", paused ? "Play rotation" : "Pause rotation");
      rows.forEach(r => r.pause(paused));
    });
  };
  $$("[data-region]").forEach((region, ri) => {
    if (!region.closest(".lead--auto")) return accordion(region);
    const people = peopleFor(region);
    $(".count", region).textContent = `${people.length} people`;
    const row = marquee($(".crew", region), people, ri % 2 ? 1 : -1);
    if (row) pauseButton($(".play", region), [row]);
  });

  /* Option 2 · text on the left, country switch on the right, and the chosen country's people in two
     rows that slide by themselves in opposite directions. Panels share one grid cell, so the section
     keeps its height and every photo is already loaded when you switch. */
  const tm = $(".tm");
  if (tm) {
    const tabs = $$(".tm__tab", tm), thumb = $(".tm__thumb", tm), panels = $$(".tm__panel", tm), rows = [];
    panels.forEach(p => {
      const people = TEAMS[p.dataset.team], half = Math.ceil(people.length / 2);
      [people.slice(0, half), people.slice(half)].forEach((group, i) => {
        const box = document.createElement("div");
        box.className = "crew";
        p.append(box);
        const row = marquee(box, group, i ? 1 : -1);
        if (row) rows.push(row);
      });
    });
    if (rows.length) pauseButton($(".play", tm), rows);
    else $(".play", tm).hidden = true;
    tabs.forEach(t => { $("small", t).textContent = TEAMS[t.dataset.team].length; });
    const place = () => {
      const t = tabs.find(b => b.getAttribute("aria-selected") === "true");
      thumb.style.width = t.offsetWidth + "px";
      thumb.style.transform = `translateX(${t.offsetLeft}px)`;
    };
    const show = next => {
      if (next.getAttribute("aria-selected") === "true") return;
      tabs.forEach(t => { const on = t === next; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
      place();
      panels.forEach(p => {
        const on = p.dataset.team === next.dataset.team, crews = $$(".crew", p);
        gsap.killTweensOf(crews);
        if (on) {
          p.classList.add("is-on");
          if (REDUCED) return gsap.set(crews, { clearProps: "opacity,filter,transform" });
          gsap.fromTo(crews, { opacity: 0, y: 16, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: .7, ease: "expo.out", stagger: .08, delay: .1, clearProps: "opacity,filter,transform" });
        } else if (p.classList.contains("is-on")) {
          if (REDUCED) return p.classList.remove("is-on");
          gsap.to(crews, { opacity: 0, y: -8, filter: "blur(6px)", duration: .2, ease: "power2.in", onComplete: () => { if ($(`[aria-selected="true"]`, tm).dataset.team === p.dataset.team) return; p.classList.remove("is-on"); gsap.set(crews, { clearProps: "opacity,filter,transform" }); } });
        }
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => show(t));
      t.addEventListener("keydown", e => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const n = tabs[(i + tabs.length + (e.key === "ArrowRight" ? 1 : -1)) % tabs.length];
        n.focus(); show(n);
      });
    });
    place();
    addEventListener("resize", place);
    document.fonts?.ready.then(place);
  }

  /* ---------- office collage (same behaviour as Careers) ---------- */

  const office = $(".office");
  if (office) {
    const shots = $$(".shot", office);
    if (!REDUCED) {
      const cta = $(".office__cta", office).getBoundingClientRect();
      const cx = cta.left + cta.width / 2, cy = cta.top + cta.height / 2;
      const order = shots.map(el => { const b = el.getBoundingClientRect(); return Math.hypot(b.left + b.width / 2 - cx, b.top + b.height / 2 - cy); });
      gsap.set(shots, { opacity: 0, scale: .82, filter: "blur(18px)" });
      onView(office, () => shots.forEach((el, i) => gsap.to(el, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.6, ease: SNAP, delay: .1 + order[i] / 1400, clearProps: "filter" })), { threshold: .2 });
    }
    const depth = shots.map(el => Math.min(1, (el.offsetWidth * el.offsetHeight) / (320 * 275)) * .9 + .15);
    const movers = shots.map(el => ({
      x: gsap.quickTo(el, "x", { duration: 1.6, ease: "power2.out" }),
      y: gsap.quickTo(el, "y", { duration: 1.6, ease: "power2.out" }),
      r: gsap.quickTo(el, "rotation", { duration: 1.9, ease: "power2.out" }),
    }));
    const desktop = () => matchMedia("(min-width: 1201px) and (hover: hover)").matches;
    office.addEventListener("pointermove", e => {
      if (!desktop()) return;
      const r = office.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      movers.forEach((m, i) => { m.x(-nx * 46 * depth[i]); m.y(-ny * 34 * depth[i]); m.r(nx * 1.6 * depth[i]); });
    });
    office.addEventListener("pointerleave", () => movers.forEach(m => { m.x(0); m.y(0); m.r(0); }));
  }
})();
