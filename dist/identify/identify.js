"use strict";
window.addEventListener("DOMContentLoaded", () => {
  if (typeof window.jotformEmbedHandler === "function") {
    window.jotformEmbedHandler("iframe[id='JotFormIFrame-262725740128053']", "https://form.jotform.com/");
  }
});
(() => {
  const intro = document.querySelector(".intro");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer;
  let started = false;
  let sequence = 0;
  const dismiss = () => {
    sequence++;
    clearTimeout(timer);
    intro.hidden = true;
    intro.classList.remove("intro-playing");
  };
  const play = () => {
    const current = ++sequence;
    clearTimeout(timer);
    intro.classList.remove("intro-playing");
    intro.hidden = false;
    // Two frames let mobile browsers paint the opening state before animating.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (current !== sequence) return;
      intro.classList.add("intro-playing");
      timer = setTimeout(dismiss, motion.matches ? 1600 : 3000);
    }));
  };
  const start = () => {
    if (started || document.visibilityState !== "visible") return;
    started = true;
    play();
  };
  start();
  document.addEventListener("visibilitychange", start);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) play();
    else start();
  });
  document.querySelector(".replay-intro").addEventListener("click", play);
  document.addEventListener("keydown", dismiss);
  document.querySelector(".button").addEventListener("click", (event) => {
    event.preventDefault();
    dismiss();
    const section = document.getElementById("identification");
    section.focus({preventScroll: true});
    section.scrollIntoView({behavior: motion.matches ? "instant" : "smooth", block: "start"});
  });
})();
