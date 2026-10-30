/* Deccan Experts hero: see-through nav while over the hero, and cursor parallax on the portrait and ring. */
(() => {
  const hx = document.querySelector(".hx");
  if (!hx) return;
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");

  // the hero slides up under the sticky nav by exactly the nav's height
  // and fills what's left of the first screen below the announcement bar
  const bar = document.querySelector(".topbar");
  const fitHeader = () => {
    if (header) hx.style.setProperty("--hdr", header.offsetHeight + "px");
    if (bar) hx.style.setProperty("--bar", bar.offsetHeight + "px");
  };
  fitHeader();
  addEventListener("resize", fitHeader);
  if (header) {
    const over = () => header.classList.toggle("is-over", hx.getBoundingClientRect().bottom > header.offsetHeight + 40);
    addEventListener("scroll", over, { passive: true });
    over();
  }

  // cursor parallax: the portrait leans away from the pointer, the ring leans toward it
  const img = hx.querySelector(".hx__img"), ring = hx.querySelector(".hx__ring");
  if (img && ring && window.gsap && !REDUCED && matchMedia("(hover: hover)").matches) {
    const ix = gsap.quickTo(img, "x", { duration: 1.6, ease: "power3.out" }), iy = gsap.quickTo(img, "y", { duration: 1.6, ease: "power3.out" });
    const rx = gsap.quickTo(ring, "x", { duration: 2, ease: "power3.out" }), ry = gsap.quickTo(ring, "y", { duration: 2, ease: "power3.out" });
    hx.addEventListener("pointermove", e => {
      const r = hx.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      ix(nx * -22); iy(ny * -14); rx(nx * 30); ry(ny * 20);
    });
    hx.addEventListener("pointerleave", () => { ix(0); iy(0); rx(0); ry(0); });
  }
})();
