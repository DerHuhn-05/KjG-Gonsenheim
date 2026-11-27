/* Einflug-Animationen: Inhalte schieben sich beim Scrollen herein (nicht im Hero). Bei „Bewegung reduzieren“ aus. */
KJG.beiBereit(() => {
  "use strict";
  if (KJG.ruhig || !("IntersectionObserver" in window)) return;

  const EINFLIEGEN = [
    ".tile > .text", ".tile > .media",
    ".cards-section h2", ".card",
    ".about h2", ".about p", ".about .more-link",
    ".faq h2", ".faq-item", ".faq-more",
    ".z-feature > .text", ".z-feature > .media",
    ".z-quote blockquote", ".z-quote .circle",
    ".event-tile > .text", ".event-tile > .media",
    ".feature > .text", ".feature > .media",
    ".stats li",
    ".prose > *",
  ];
  const BREIT = 0.6;                 // Elemente breiter als 60 % des Fensters kommen von unten
  const SCHMALES_FENSTER = 700;      // px – darunter kommt alles von unten
  const LINKS_BIS = 0.45, RECHTS_AB = 0.55;   // Lage der Elementmitte im Fenster → Einflugrichtung
  const VERSATZ_MS = 90, MAX_VERSATZ = 5;     // Geschwister starten leicht nacheinander (höchstens 5 Stufen)
  const SICHTBAR_RAND = "0px 0px -40px 0px";  // erscheint, sobald 40 px im Bild sind
  const SPRUNG_START_MS = 150, SPRUNG_VERSATZ_MS = 80;

  const elemente = [...new Set(document.querySelectorAll(EINFLIEGEN.join(",")))];
  const vw = window.innerWidth;
  const richtung = (rahmen) => {
    const mitte = rahmen.left + rahmen.width / 2;
    if (rahmen.width > vw * BREIT || vw < SCHMALES_FENSTER) return "up";
    if (mitte < vw * LINKS_BIS) return "left";
    if (mitte > vw * RECHTS_AB) return "right";
    return "up";
  };
  const geschwister = new Map();
  for (const el of elemente) {
    el.dataset.reveal = richtung(el.getBoundingClientRect());
    const n = geschwister.get(el.parentElement) || 0;
    geschwister.set(el.parentElement, n + 1);
    el.style.setProperty("--reveal-delay", Math.min(n, MAX_VERSATZ) * VERSATZ_MS + "ms");
  }
  document.documentElement.classList.add("reveal-ready");
  const beobachter = new IntersectionObserver((eintraege) => {
    for (const e of eintraege) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("is-visible");
      beobachter.unobserve(e.target);
    }
  }, { rootMargin: SICHTBAR_RAND, threshold: 0 });
  elemente.forEach((el) => beobachter.observe(el));

  // Sprungmarken fliegen direkt beim Laden herein
  const sprungmarken = [...document.querySelectorAll(".jump li, .jumplinks li, .z-jump li")];
  sprungmarken.forEach((el, i) => { el.dataset.reveal = "up"; el.style.setProperty("--reveal-delay", SPRUNG_START_MS + i * SPRUNG_VERSATZ_MS + "ms"); });
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => sprungmarken.forEach((el) => el.classList.add("is-visible"))));
});
