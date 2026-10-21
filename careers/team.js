/* Meet the team — one reel in the page's own scroll. On desktop the section pins and
   vertical scroll drives the strip sideways: the featured film first, then photos and
   quotes. Photos drift inside their frames, quotes resolve word by word (deccan.ai's
   split-word blur). On touch screens it is a native swipe strip. */
(() => {
  // in-page links glide (instead of CSS scroll-behavior, which fights pinning)
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    const to = a && a.getAttribute("href").length > 1 && document.querySelector(a.getAttribute("href"));
    if (!to) return;
    e.preventDefault();
    to.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // hiring steps on phones: each card blur-fades up as it scrolls in (no stage animation)
  const stepCards = document.querySelectorAll(".steps-m .sm");
  if (window.gsap && stepCards.length && matchMedia("(max-width: 820px)").matches) {
    gsap.set(stepCards, { opacity: 0, y: 24, filter: "blur(8px)" });
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      gsap.to(e.target, { opacity: 1, y: 0, filter: "blur(0px)", duration: .55, ease: "power2.out", clearProps: "filter,transform" });
    }), { threshold: .25 });
    stepCards.forEach(c => io.observe(c));
  }

  const sec = document.querySelector(".team");
  if (!sec || !window.gsap) return;
  const reel = sec.querySelector(".reel");
  const track = sec.querySelector(".reel__track");
  const bar = sec.querySelector(".reel__bar i");
  const items = [...sec.querySelectorAll(".reel__item")];

  sec.querySelectorAll("[data-words]").forEach(el => {
    el.innerHTML = el.textContent.trim().split(/(\s+)/)
      .map(w => /^\s+$/.test(w) ? w : `<span class="wd">${w}</span>`).join("");
  });
  const words = el => el.querySelectorAll(".wd");
  const WORDS_FROM = { opacity: .12, y: 8, filter: "blur(6px)" };
  const WORDS_TO = { opacity: 1, y: 0, filter: "blur(0px)", duration: .5, ease: "power2.out", stagger: .045 };

  const mm = gsap.matchMedia();

  mm.add("(min-width: 821px)", () => {
    if (!window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const dist = () => Math.max(0, track.scrollWidth - reel.clientWidth);

    const strip = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        // scrub: true keeps the strip locked 1:1 to the scroll, so nothing catches up
        // (and "snaps") when the pin engages or releases
        trigger: sec, start: "top top", end: () => "+=" + dist(), pin: true, scrub: true,
        invalidateOnRefresh: true,
        onUpdate: st => gsap.set(bar, { scaleX: st.progress }),
      },
    });

    // the film eases up from slightly small as the section arrives
    gsap.fromTo(sec.querySelector(".reel__video"), { scale: .92 }, {
      scale: 1, ease: "none",
      scrollTrigger: { trigger: sec, start: "top 85%", end: "top top", scrub: true },
    });

    // photos drift inside their frames against the strip's motion
    sec.querySelectorAll(".reel__photo > img").forEach(img =>
      gsap.fromTo(img, { xPercent: 5 }, { xPercent: -5, ease: "none",
        scrollTrigger: { trigger: img.parentElement, containerAnimation: strip, start: "left right", end: "right left", scrub: true } }));

    // each tile rises in as it reaches the screen; its quote resolves word by word
    items.slice(1).forEach(it => {
      gsap.fromTo(it, { y: 46, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: .7, ease: "power3.out",
        scrollTrigger: { trigger: it, containerAnimation: strip, start: "left 92%", toggleActions: "play none none reverse" } });
      const q = it.querySelector("[data-words]");
      if (q) gsap.fromTo(words(q), WORDS_FROM, { ...WORDS_TO, delay: .15,
        scrollTrigger: { trigger: it, containerAnimation: strip, start: "left 80%", toggleActions: "play none none reverse" } });
    });

    // fonts, late images and other sections' changes shift the layout above; re-measure whenever
    // the page height changes so the pin's start/end never go stale (a stale end can leave it stuck)
    let lastH = 0, rt;
    const refresh = () => ScrollTrigger.refresh();
    const watch = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - lastH) < 2) return;
      lastH = h;
      clearTimeout(rt); rt = setTimeout(refresh, 120);
    });
    watch.observe(document.body);
    addEventListener("load", refresh, { once: true });
    document.fonts && document.fonts.ready.then(refresh);

    return () => { watch.disconnect(); gsap.set([track, ...items], { clearProps: "all" }); };
  });

  mm.add("(max-width: 820px)", () => {
    // native swipe: reveal quotes as tiles scroll into view
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const q = e.target.querySelector("[data-words]");
      if (q) gsap.fromTo(words(q), WORDS_FROM, WORDS_TO);
    }), { root: reel, threshold: .4 });
    items.forEach(it => io.observe(it));
    const onScroll = () => gsap.set(bar, { scaleX: reel.scrollLeft / Math.max(1, reel.scrollWidth - reel.clientWidth) });
    reel.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); reel.removeEventListener("scroll", onScroll); };
  });
})();
