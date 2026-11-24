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
  //  - Startseite „Unser Angebot für euch“: Karten (nur mobil)
  // ---------------------------------------------------------------
  const quer = [
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
  // Zela 2027: Termine als Drehrad
  //  1. Petrol-Streifen bleibt in der Mitte stehen und zieht sich auf volle Höhe auf
  //  2. dann drehen die Stationen seitlich durch (Desktop: immer drei sichtbar)
  //  3. zu den Rändern werden sie blasser und kleiner (Karussell)
  // ---------------------------------------------------------------
  const rad = document.querySelector(".z-termine");
  const radPin = rad && rad.querySelector(".z-termine-pin");
  const radLeiste = rad && rad.querySelector(".z-timeline");
  const radPunkte = radLeiste ? [...radLeiste.children] : [];
  let STREIFEN = 361;        // Höhe des Petrol-Streifens im Ausgangszustand (mobil etwas höher)
  const DREH_TEMPO = 1.4;    // Scroll-Pixel pro Pixel Drehung (größer = langsamer)
  let radMass = null;

  const radMessen = () => {
    if (!rad || !radPin || !radLeiste) return;
    if (ruhig) { rad.classList.add("static"); return; }
    rad.classList.add("rad");
    const breite = rad.clientWidth;
    const kopf = breite >= 1273 ? 100 : 72;                    // Höhe der Petrol-Kopfzeile beim Scrollen
    STREIFEN = radPin.querySelector(".z-termine-buehne").offsetHeight;
    const hoehe = Math.max(STREIFEN, window.innerHeight - kopf);
    const desktop = breite > 960;
    const abstand = desktop ? Math.min(480, Math.max(320, breite * 0.3)) : Math.max(190, breite * 0.55);
    const [von, bis] = [0, radPunkte.length - 1];               // Station 1 steht anfangs in der Mitte, Station 5 am Ende
    const aufziehen = hoehe - STREIFEN;
    const drehen = (bis - von) * abstand * DREH_TEMPO;
    rad.style.setProperty("--kopf", kopf + "px");
    rad.style.setProperty("--pin-h", hoehe + "px");
    rad.style.setProperty("--abstand", abstand + "px");
    rad.style.marginTop = (STREIFEN - hoehe) / 2 + "px";        // Streifen sitzt im Ablauf wie bisher
    rad.style.height = hoehe + aufziehen + drehen + "px";
    radMass = { breite, kopf, hoehe, abstand, von, bis, aufziehen, drehen };
  };

  const radBewegen = () => {
    if (!radMass) return;
    const m = radMass;
    const weg = m.kopf - rad.getBoundingClientRect().top;      // Scroll-Strecke seit dem Andocken
    const auf = m.aufziehen > 0 ? Math.min(1, Math.max(0, weg / m.aufziehen)) : 1;
    rad.style.setProperty("--clip", ((1 - auf) * (m.hoehe - STREIFEN)) / 2 + "px");
    const dreh = Math.min(1, Math.max(0, (weg - m.aufziehen) / m.drehen));
    const mitte = m.von + dreh * (m.bis - m.von);               // Index der Station in der Mitte
    const x = m.breite / 2 - m.abstand / 2 - mitte * m.abstand;
    radLeiste.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
    radPunkte.forEach((li, i) => {
      const d = Math.min(1.6, Math.abs(i - mitte));             // Abstand zur Mitte in Stationen
      li.style.transform = `scale(${(1 - 0.14 * d).toFixed(3)})`;
      li.style.opacity = (1 - 0.3 * Math.max(0, d - 0.5)).toFixed(3);
    });
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
    radBewegen();
    geplant = false;
  };
  const anstossen = () => { if (!geplant) { geplant = true; requestAnimationFrame(aktualisieren); } };
  window.addEventListener("scroll", anstossen, { passive: true });
  window.addEventListener("resize", () => { querMessen(); radMessen(); anstossen(); });
  window.addEventListener("load", () => { querMessen(); radMessen(); anstossen(); });
  querMessen();
  radMessen();
  aktualisieren();
});
