document.addEventListener("DOMContentLoaded", () => {
  const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");

  // ---------------------------------------------------------------
  // Header: transparent oben, Petrol-Leiste sobald gescrollt wird
  // ---------------------------------------------------------------
  const SCHWELLE = 10; // Pixel
  const headerPruefen = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > SCHWELLE || header.classList.contains("open"));
  };

  // Mobile-Menü (Hamburger)
  const toggle = document.querySelector(".menu-toggle");
  if (toggle && header) {
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      headerPruefen();
    });
  }

  // ---------------------------------------------------------------
  // Zela 2027: Zeitleiste – Fläche bleibt stehen, Zeitleiste schiebt sich nach links
  // ---------------------------------------------------------------
  const termine = document.querySelector(".z-termine");
  const pin = termine && termine.querySelector(".z-termine-pin");
  const leiste = termine && termine.querySelector(".z-timeline");
  const TEMPO = 1.4;          // Scroll-Pixel pro Pixel Verschiebung (größer = langsamer)
  let weg = 0;                // Verschiebung in Pixeln

  const leisteMessen = () => {
    if (!termine || !pin || !leiste) return;
    if (ruhig) { termine.classList.add("static"); return; }
    leiste.style.transform = "none";
    const breite = pin.clientWidth;
    const letzter = leiste.lastElementChild;
    const mitteLetzter = leiste.offsetLeft + letzter.offsetLeft + letzter.offsetWidth / 2;
    const rand = breite >= 1273 ? 205 : 40;          // Desktop: rechter Rasterrand (Spalte 12)
    weg = Math.max(0, mitteLetzter - (breite - rand));
    termine.style.height = pin.offsetHeight + weg * TEMPO + "px";
  };

  const leisteBewegen = () => {
    if (!termine || !pin || !leiste || ruhig || !weg) return;
    const oben = parseFloat(getComputedStyle(pin).top) || 0;
    const strecke = termine.offsetHeight - pin.offsetHeight;
    const p = Math.min(1, Math.max(0, (oben - termine.getBoundingClientRect().top) / strecke));
    leiste.style.transform = `translate3d(${-p * weg}px, 0, 0)`;
  };

  // ---------------------------------------------------------------
  // Unser Team: runde Fotos bewegen sich beim Scrollen leicht mit (Parallax)
  // ---------------------------------------------------------------
  const kreise = ruhig ? [] : [...document.querySelectorAll(".person .circle")];
  const PARALLAX = 0.12;   // Stärke der Bewegung
  const MAX_WEG = 60;      // höchstens so viele Pixel nach oben/unten
  const kreiseBewegen = () => {
    const mitte = window.innerHeight / 2;
    for (const k of kreise) {
      const r = k.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) continue;
      const abstand = r.top + r.height / 2 - mitte;
      const y = Math.max(-MAX_WEG, Math.min(MAX_WEG, -abstand * PARALLAX));
      k.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    }
  };

  // ---------------------------------------------------------------
  // Einflug-Animationen: Inhalte schieben sich beim Scrollen herein (nicht im Hero)
  // ---------------------------------------------------------------
  const EINFLIEGEN = [
    ".jump li", ".jumplinks li", ".z-jump li",
    ".tile > .text", ".tile > .media",
    ".cards-section h2", ".card",
    ".about h2", ".about p", ".about .more-link",
    ".faq h2", ".faq-item", ".faq-more",
    ".z-termine-pin .inner h2",
    ".z-feature > .text", ".z-feature > .media",
    ".z-quote blockquote", ".z-quote .circle",
    ".event-tile > .text", ".event-tile > .media",
    ".feature > .text", ".feature > .media",
    ".stats li", ".team h2", ".person",
    ".prose > *", ".site-footer .grid > *",
  ];
  if (!ruhig && "IntersectionObserver" in window) {
    const elemente = [...new Set(document.querySelectorAll(EINFLIEGEN.join(",")))];
    const vw = window.innerWidth;
    const geschwister = new Map();
    for (const el of elemente) {
      const r = el.getBoundingClientRect();
      const mitte = r.left + r.width / 2;
      el.dataset.reveal = r.width > vw * 0.6 || vw < 700 ? "up" : mitte < vw * 0.45 ? "left" : mitte > vw * 0.55 ? "right" : "up";
      // gleichartige Elemente nebeneinander/untereinander leicht versetzt starten
      const n = geschwister.get(el.parentElement) || 0;
      geschwister.set(el.parentElement, n + 1);
      el.style.setProperty("--reveal-delay", Math.min(n, 5) * 90 + "ms");
    }
    document.documentElement.classList.add("reveal-ready");
    const io = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    elemente.forEach((el) => io.observe(el));
  }

  // ---------------------------------------------------------------
  // Unser Team: Kennzahlen zählen hoch, sobald das Zahlenband sichtbar ist
  // ---------------------------------------------------------------
  const zahlen = [...document.querySelectorAll(".stats .num")];
  if (zahlen.length && !ruhig) {
    const sprache = document.documentElement.lang === "en" ? "en-US" : "de-DE";
    const DAUER = 1800; // Millisekunden
    const hochzaehlen = (el) => {
      const text = el.textContent.trim();
      const ziel = parseInt(text.replace(/[.,\s]/g, ""), 10);
      if (!Number.isFinite(ziel)) return;
      const format = new Intl.NumberFormat(sprache, { useGrouping: /[.,]/.test(text) });
      const start = performance.now();
      const schritt = (jetzt) => {
        const t = Math.min(1, (jetzt - start) / DAUER);
        const wert = Math.round(ziel * (1 - Math.pow(1 - t, 3)));   // erst schnell, dann langsam
        el.textContent = format.format(wert);
        if (t < 1) requestAnimationFrame(schritt); else el.textContent = text;
      };
      el.textContent = format.format(0);
      requestAnimationFrame(schritt);
    };
    const band = document.querySelector(".stats");
    const zio = new IntersectionObserver((e) => {
      if (e.some((x) => x.isIntersecting)) { zahlen.forEach(hochzaehlen); zio.disconnect(); }
    }, { threshold: 0.3 });
    zio.observe(band);
  }

  // ---------------------------------------------------------------
  // Gemeinsame Scroll-Schleife
  // ---------------------------------------------------------------
  let geplant = false;
  const aktualisieren = () => {
    headerPruefen();
    leisteBewegen();
    if (kreise.length) kreiseBewegen();
    geplant = false;
  };
  const anstossen = () => { if (!geplant) { geplant = true; requestAnimationFrame(aktualisieren); } };
  window.addEventListener("scroll", anstossen, { passive: true });
  window.addEventListener("resize", () => { leisteMessen(); anstossen(); });
  window.addEventListener("load", () => { leisteMessen(); anstossen(); });
  leisteMessen();
  aktualisieren();
});
