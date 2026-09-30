"use strict";
// Jotform owns the form, upload, validation and native thank-you screen.
// No submission messages are interpreted as success by this wrapper.
window.addEventListener("DOMContentLoaded", () => {
  if (typeof window.jotformEmbedHandler === "function") {
    window.jotformEmbedHandler("iframe[id='JotFormIFrame-262725740128053']", "https://form.jotform.com/");
  }
});
// Start only once the page is visible, rather than while mobile assets load.
(() => {
  const intro = document.querySelector(".intro");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let started = false;
  const startIntro = () => {
    if (started || document.visibilityState !== "visible") return;
    started = true;
    if (motion.matches) { intro.remove(); return; }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      intro.classList.add("intro-playing");
      window.setTimeout(() => intro.remove(), 3000);
    }));
  };
  startIntro();
  document.addEventListener("visibilitychange", startIntro);
  intro.addEventListener("animationend", (event) => {
    if (event.animationName === "intro-exit") intro.remove();
  });
  // Dismiss decoration immediately when keyboard users move into the page.
  document.addEventListener("keydown", () => intro.remove(), {once: true});
  document.querySelector(".button").addEventListener("click", (event) => {
    event.preventDefault();
    const section = document.getElementById("identification");
    section.focus({preventScroll: true});
    section.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start"});
  });
})();
