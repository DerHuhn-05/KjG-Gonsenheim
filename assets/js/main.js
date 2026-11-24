document.addEventListener("DOMContentLoaded", () => {
  const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  // Team: Höhe des Kennzahlen-Streifens merken, damit das Titelbild ihn genau an den unteren Rand schiebt
  const kennzahlen = document.querySelector(".hero-simple.short + .stats");
  const kennzahlenMessen = () => { if (kennzahlen) document.documentElement.style.setProperty("--stats-h", kennzahlen.offsetHeight + "px"); };
  kennzahlenMessen(); window.addEventListener("resize", kennzahlenMessen);
  document.querySelectorAll(".main-nav a").forEach((a) => { a.dataset.t = a.textContent; });   // für die feste Breite (fett = aktiv)

  // ---------------------------------------------------------------
  // Header: transparent oben, Petrol-Leiste sobald gescrollt wird
  // ---------------------------------------------------------------
  const SCHWELLE = 10; // Pixel
  const headerPruefen = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > SCHWELLE || header.classList.contains("open"));
  };

  // Mobile-Menü (Hamburger): Hintergrund abdunkeln, Klick daneben oder Escape schließt
  const toggle = document.querySelector(".menu-toggle");
  if (toggle && header) {
    const dunkel = document.createElement("div");
    dunkel.className = "menu-backdrop";
    document.body.appendChild(dunkel);
    const en = document.documentElement.lang === "en";
    const menu = (offen) => {
      header.classList.toggle("open", offen);
      dunkel.classList.toggle("sichtbar", offen);
      document.documentElement.classList.toggle("menu-offen", offen);
      toggle.setAttribute("aria-expanded", String(offen));
      toggle.setAttribute("aria-label", offen ? (en ? "Close menu" : "Menü schließen") : (en ? "Open menu" : "Menü öffnen"));
      headerPruefen();
    };
    toggle.addEventListener("click", () => menu(!header.classList.contains("open")));
    dunkel.addEventListener("click", () => menu(false));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && header.classList.contains("open")) { menu(false); toggle.focus(); } });
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
    // außerhalb des Bildschirms anhalten (spart Akku und hält das Scrollen flüssig); nur wenn nicht manuell pausiert
    let vonHand = ruhig;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((e) => {
        if (e[0].isIntersecting) { if (!vonHand) starten(); } else video.pause();
      }, { threshold: 0 }).observe(video);
    }
    if (videoKnopf) {
      const en = document.documentElement.lang === "en";
      const bild = videoKnopf.querySelector("img");
      const anzeigen = () => {
        const pausiert = video.paused;
        bild.src = bild.src.replace(/video-(play|pause)\.svg/, pausiert ? "video-play.svg" : "video-pause.svg");
        videoKnopf.setAttribute("aria-label", pausiert ? (en ? "Play video" : "Video abspielen") : (en ? "Pause video" : "Video pausieren"));
      };
      videoKnopf.addEventListener("click", () => { if (video.paused) { vonHand = false; starten(); } else { vonHand = true; video.pause(); } });
      video.addEventListener("play", anzeigen);
      video.addEventListener("pause", anzeigen);
      anzeigen();
    }
  }

  // ---------------------------------------------------------------
  // Startseite „Unser Angebot für euch“ und „Soziale Aktionen“ (mobil): Slider mit Pfeilen und Punkten
  // (Wischen und Einrasten macht CSS)
  // ---------------------------------------------------------------
  const en = document.documentElement.lang === "en";
  document.querySelectorAll(".cards-section .cards").forEach((liste) => {
    const karten = [...liste.children];
    if (karten.length < 2) return;
    const nav = document.createElement("div");
    nav.className = "slider-nav";
    const pfeil = (richtung) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "slider-pfeil";
      b.setAttribute("aria-label", richtung < 0 ? (en ? "Previous card" : "Vorherige Karte") : (en ? "Next card" : "Nächste Karte"));
      b.innerHTML = `<img src="${en ? "../" : ""}icons/slider-${richtung < 0 ? "links" : "rechts"}.svg" width="12" height="20" alt="">`;
      b.addEventListener("click", () => {
        const schritt = karten[1].offsetLeft - karten[0].offsetLeft;
        liste.scrollBy({ left: richtung * schritt, behavior: ruhig ? "auto" : "smooth" });
      });
      return b;
    };
    const zurueck = pfeil(-1), weiter = pfeil(1);
    const punkte = document.createElement("div");
    punkte.className = "slider-punkte";
    karten.forEach((k, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", (en ? "Show card " : "Karte ") + (i + 1) + (en ? "" : " anzeigen"));
      b.addEventListener("click", () => liste.scrollTo({ left: k.offsetLeft - karten[0].offsetLeft, behavior: ruhig ? "auto" : "smooth" }));
      punkte.appendChild(b);
    });
    nav.append(zurueck, punkte, weiter);
    liste.after(nav);
    const markieren = () => {
      // aktive Karte = die, deren linke Kante der aktuellen Scroll-Position am nächsten liegt
      let nah = 0, d = Infinity;
      karten.forEach((k, i) => { const x = Math.abs(k.offsetLeft - karten[0].offsetLeft - liste.scrollLeft); if (x < d) { d = x; nah = i; } });
      const ende = liste.scrollLeft + liste.clientWidth >= liste.scrollWidth - 2;
      if (ende) nah = karten.length - 1;
      [...punkte.children].forEach((b, i) => b.setAttribute("aria-current", String(i === nah)));
      zurueck.disabled = liste.scrollLeft <= 2;
      weiter.disabled = ende;
    };
    liste.addEventListener("scroll", () => requestAnimationFrame(markieren), { passive: true });
    window.addEventListener("resize", markieren);
    markieren();
  });

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
    // läuft auch bei „Bewegung reduzieren“: die Bewegung folgt nur dem eigenen Scrollen
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
    radBewegen();
    geplant = false;
  };
  const anstossen = () => { if (!geplant) { geplant = true; requestAnimationFrame(aktualisieren); } };
  window.addEventListener("scroll", anstossen, { passive: true });
  // Safari löst beim Ein-/Ausfahren der Adressleiste „resize“ aus (nur die Höhe ändert sich) – das
  // darf die Seite nicht neu aufbauen, sonst springt sie beim Scrollen. Neu gemessen wird nur bei geänderter Breite.
  let letzteBreite = window.innerWidth;
  window.addEventListener("resize", () => {
    if (window.innerWidth === letzteBreite) return;
    letzteBreite = window.innerWidth;
    radMessen(); anstossen();
  });
  window.addEventListener("load", () => { radMessen(); anstossen(); });
  radMessen();
  aktualisieren();
});
