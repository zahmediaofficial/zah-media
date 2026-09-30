"use strict";
// Jotform owns the form, upload, validation and native thank-you screen.
// No submission messages are interpreted as success by this wrapper.
window.addEventListener("DOMContentLoaded", () => {
  if (typeof window.jotformEmbedHandler === "function") {
    window.jotformEmbedHandler("iframe[id='JotFormIFrame-262725740128053']", "https://form.jotform.com/");
  }
  const intro = document.querySelector(".intro");
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
});
