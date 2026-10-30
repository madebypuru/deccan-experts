/* Testimonial wall: "View more" opens the clipped wall to its full height (and back), like Flighty's. */
(() => {
  const box = document.querySelector(".voices"), btn = box && box.querySelector(".voices__more");
  if (!btn) return;
  const label = btn.querySelector("span");
  const closed = () => parseFloat(getComputedStyle(box).maxHeight) || box.offsetHeight;
  let shut = 0;
  btn.addEventListener("click", () => {
    const open = !box.classList.contains("is-open");
    if (open) {
      shut = closed();
      box.style.maxHeight = shut + "px";
      box.classList.add("is-open");
      box.style.maxHeight = box.scrollHeight + 120 + "px";
    } else {
      box.style.maxHeight = box.scrollHeight + "px";
      requestAnimationFrame(() => { box.classList.remove("is-open"); box.style.maxHeight = shut + "px"; });
      // keep the section in view while it folds back up
      const top = box.getBoundingClientRect().top + scrollY - 160;
      if (scrollY > top) scrollTo({ top, behavior: "smooth" });
    }
    btn.setAttribute("aria-expanded", open);
    label.textContent = open ? "Show less" : "View more";
    // the page grew/shrank; let pinned sections below re-measure once the animation settles
    setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 1150);
  });
})();
