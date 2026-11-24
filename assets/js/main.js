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
      const en = document.documentElement.lang === "en";
      toggle.setAttribute("aria-label", open ? (en ? "Close menu" : "Menü schließen") : (en ? "Open menu" : "Menü öffnen"));
      headerPruefen();
    });
  }

  // ---------------------------------------------------------------
  // Startseite: Video spielt automatisch (stumm), Knopf zum Pausieren/Abspielen
  // ---------------------------------------------------------------
  const video = document.querySelector(".hero video");
  const videoKnopf = document.querySelector(".video-toggle");
  if (video) {
    video.muted = true;                      // stumm ist Voraussetzung für Autoplay auf dem Handy
    video.setAttribute("playsinline", "");
    const starten = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
    if (!ruhig) starten(); else video.pause();
    if (videoKnopf) {
      const en = document.documentElement.lang === "en";
      const bild = videoKnopf.querySelector("img");
      const anzeigen = () => {
        const pausiert = video.paused;
        bild.src = bild.src.replace(/video-(play|pause)\.svg/, pausiert ? "video-play.svg" : "video-pause.svg");
        videoKnopf.setAttribute("aria-label", pausiert ? (en ? "Play video" : "Video abspielen") : (en ? "Pause video" : "Video pausieren"));
      };
      videoKnopf.addEventListener("click", () => { if (video.paused) starten(); else video.pause(); });
      video.addEventListener("play", anzeigen);
      video.addEventListener("pause", anzeigen);
      anzeigen();
    }
  }

  // ---------------------------------------------------------------
  // Scrollytelling: Bereich bleibt beim Scrollen stehen, Inhalt schiebt sich seitlich durch,
  // erst danach scrollt die Seite weiter.
  //  - Zela 2027: Zeitleiste (alle Bildschirmgrößen)
  //  - Startseite „Unser Angebot für euch“: Karten (nur mobil)
  // ---------------------------------------------------------------
  const quer = [
    { sektion: ".z-termine", buehne: ".z-termine-pin", leiste: ".z-timeline", tempo: 1.4,
      ende: (b) => (b >= 1273 ? 205 : 40),                       // letzter Punkt endet am rechten Rasterrand
      ziel: (l) => { const x = l.lastElementChild; return x.offsetLeft + x.offsetWidth / 2; } },
    { sektion: ".cards-section.events", buehne: ".wrap", leiste: ".cards", tempo: 1.2, nur: "(max-width: 960px)",
      ende: () => 16,                                              // letzte Karte endet am rechten Rand
      ziel: (l) => { const x = l.lastElementChild; return x.offsetLeft + x.offsetWidth; } },
  ].map((q) => {
    const sektion = document.querySelector(q.sektion);
    return sektion && { ...q, sektion, buehne: sektion.querySelector(q.buehne), leiste: sektion.querySelector(q.leiste), weg: 0 };
  }).filter((q) => q && q.buehne && q.leiste);

  const querMessen = () => {
    for (const q of quer) {
      const aktiv = !q.nur || window.matchMedia(q.nur).matches;
      q.leiste.style.transform = "";
      q.sektion.style.height = "";
      q.weg = 0;
      if (!aktiv) continue;
      if (ruhig) { q.sektion.classList.add("static"); continue; }
      const breite = q.buehne.clientWidth;
      const rechts = q.leiste.offsetLeft + q.ziel(q.leiste);
      q.weg = Math.max(0, rechts - (breite - q.ende(breite)));
      const st = getComputedStyle(q.sektion);
      q.sektion.style.height = parseFloat(st.paddingTop) + q.buehne.offsetHeight + q.weg * q.tempo + parseFloat(st.paddingBottom) + "px";
    }
  };

  const querBewegen = () => {
    for (const q of quer) {
      if (!q.weg) continue;
      const st = getComputedStyle(q.sektion);
      const oben = parseFloat(getComputedStyle(q.buehne).top) || 0;
      const strecke = q.weg * q.tempo;
      const p = Math.min(1, Math.max(0, (oben - q.sektion.getBoundingClientRect().top - parseFloat(st.paddingTop)) / strecke));
      q.leiste.style.transform = `translate3d(${-p * q.weg}px, 0, 0)`;
    }
  };

  // ---------------------------------------------------------------
  // Einflug-Animationen: Inhalte schieben sich beim Scrollen herein (nicht im Hero)
  // ---------------------------------------------------------------
  const EINFLIEGEN = [
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
    ".prose > *",
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
    }, { rootMargin: "0px 0px -40px 0px", threshold: 0 });   // erscheint, sobald 40 px im Bild sind
    elemente.forEach((el) => io.observe(el));

    // Kapitelpfeile (Sprungmarken) fliegen direkt beim Laden herein
    const pfeile = [...document.querySelectorAll(".jump li, .jumplinks li, .z-jump li")];
    pfeile.forEach((el, i) => { el.dataset.reveal = "up"; el.style.setProperty("--reveal-delay", 150 + i * 80 + "ms"); });
    requestAnimationFrame(() => requestAnimationFrame(() => pfeile.forEach((el) => el.classList.add("is-visible"))));
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
    querBewegen();
    geplant = false;
  };
  const anstossen = () => { if (!geplant) { geplant = true; requestAnimationFrame(aktualisieren); } };
  window.addEventListener("scroll", anstossen, { passive: true });
  window.addEventListener("resize", () => { querMessen(); anstossen(); });
  window.addEventListener("load", () => { querMessen(); anstossen(); });
  querMessen();
  aktualisieren();
});
