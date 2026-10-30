/* Grid version only (experts.html?style=grid): section heads get the hero's stacked CTAs in the fourth column,
   and sections close on a mono label strip with hatched runs, like the hero's bottom row. */
(() => {
  if (!document.documentElement.classList.contains("gx")) return;
  const ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3l5 5-5 5M8 3l5 5-5 5"/></svg>';

  // heads: the section's own action becomes the hero's hairline secondary, in the fourth column
  document.querySelectorAll(".sec-title, .ops__head, .why__head").forEach(head => {
    const own = [...head.children].find(el => el.matches("a.btn"));
    if (!own) return;
    const box = document.createElement("div");
    box.className = "gx-ctas";
    box.appendChild(Object.assign(document.createElement("a"), { className: "hx__cta hx__cta--b", href: own.getAttribute("href") || "#", textContent: own.textContent.trim() }));
    own.replaceWith(box);
    head.classList.add("gx-head");
  });

  // closing strips — facts already stated on the page
  const STRIPS = {
    ".ex-roles": ["Remote first", "Fixed rates in USD", "Paid biweekly", "<b>30</b>&nbsp;roles shown"],
    ".faq": ["Biweekly payouts", "Cycle 1 · on the 2nd", "Cycle 2 · on the 17th", "support@deccanexperts.ai"],
  };
  Object.entries(STRIPS).forEach(([sel, items]) => {
    const sec = document.querySelector(sel);
    if (!sec) return;
    const ul = document.createElement("ul");
    ul.className = "gx-strip" + (sec.classList.contains("shell") ? "" : " shell");
    ul.setAttribute("aria-hidden", "true");
    ul.innerHTML = items.map((t, i) => `<li>${t}${i < items.length - 1 ? "<i></i>" : ""}</li>`).join("");
    sec.appendChild(ul);
  });
})();
