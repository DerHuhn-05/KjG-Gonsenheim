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
  // Über uns: Karte – zoomt beim Erscheinen von Mainz nach Gonsenheim.
  // Es wird der viewBox des SVG animiert (nicht per CSS skaliert), damit alles auf jeder Stufe gestochen scharf bleibt.
  // ---------------------------------------------------------------
  const karteSek = document.querySelector(".karte-sektion");
  if (karteSek) {
    const svg = karteSek.querySelector("svg.karte");
    const pin = svg.querySelector(".k-pin");
    const MZ_W = 2400, MZ_H = 2607, GX = 794, GY = 666, GH = 835;   // Gesamtkarte, Standort, sichtbare Höhe beim Zoom (Karteneinheiten)
    const ansicht = (zoom) => {
      const W = svg.clientWidth || 1, H = svg.clientHeight || 1;
      if (!zoom) return { cx: MZ_W / 2, cy: MZ_H / 2, s: Math.max(MZ_H / H, MZ_W / W) * 1.04 };
      const s = Math.max(GH / H, 1000 / W);
      return { cx: GX, cy: GY - 0.07 * H * s, s };                    // Pin etwas unterhalb der Mitte, damit der Kopf Platz hat
    };
    const setzen = (c) => {
      const W = svg.clientWidth || 1, H = svg.clientHeight || 1;
      svg.setAttribute("viewBox", `${(c.cx - W * c.s / 2).toFixed(2)} ${(c.cy - H * c.s / 2).toFixed(2)} ${(W * c.s).toFixed(2)} ${(H * c.s).toFixed(2)}`);
      pin.setAttribute("transform", `translate(${GX} ${GY}) scale(${c.s.toFixed(4)})`);   // Pin bleibt in Bildschirmgröße
    };
    let zustand = "uebersicht", lauf = 0;
    const zoomen = (nach) => {
      const id = ++lauf;
      karteSek.classList.remove("fein", "bewegt");
      const von = zustand === "uebersicht" && nach === "zoom" ? ansicht(false) : ansicht(nach !== "zoom");
      const ziel = ansicht(nach === "zoom");
      zustand = nach;
      if (nach === "zoom") karteSek.classList.add("zoom"); else karteSek.classList.remove("zoom");
      if (ruhig || nach !== "zoom") { setzen(ziel); if (nach === "zoom") karteSek.classList.add("fein"); return; }
      karteSek.classList.add("bewegt");
      const t0 = performance.now(), DAUER = 2200;
      const schritt = (jetzt) => {
        if (id !== lauf) return;
        const t = Math.min(1, (jetzt - t0) / DAUER);
        const e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;            // sanft an- und auslaufend
        const s = Math.exp(Math.log(von.s) + (Math.log(ziel.s) - Math.log(von.s)) * e);  // Zoom exponentiell (gleichmäßig wirkend)
        const u = (1 / s - 1 / von.s) / (1 / ziel.s - 1 / von.s);                         // Mittelpunkt wandert passend zum Zoom
        setzen({ cx: von.cx + (ziel.cx - von.cx) * u, cy: von.cy + (ziel.cy - von.cy) * u, s });
        if (t < 1) requestAnimationFrame(schritt); else { karteSek.classList.remove("bewegt"); karteSek.classList.add("fein"); }
      };
      requestAnimationFrame(schritt);
    };
    setzen(ansicht(false));
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((e) => {
        const r = e[0].intersectionRatio;
        if (r >= 0.55 && zustand !== "zoom") zoomen("zoom");
        else if (r < 0.05 && zustand === "zoom") zoomen("uebersicht");   // außer Sicht: zurück zur Übersicht, damit es beim nächsten Mal wieder zoomt
      }, { threshold: [0, 0.05, 0.55] }).observe(karteSek);
    } else { zustand = "zoom"; setzen(ansicht(true)); karteSek.classList.add("zoom", "fein"); }
    let kb = window.innerWidth;
    window.addEventListener("resize", () => { if (window.innerWidth !== kb) { kb = window.innerWidth; setzen(ansicht(zustand === "zoom")); } });
  }

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
  const radBuehne = radPin && radPin.querySelector(".z-termine-buehne");
  let radMass = null;
  let radLetzte = { weg: null, clip: null, versatz: null, lage: null, st: [] };   // zuletzt gesetzte Werte – unveränderte werden nicht neu geschrieben

  const STREIFEN_V = 400;     // Höhe des Streifens mobil (vertikale Variante, passt zu --streifen im CSS)
  const LI_H = 190;           // Höhe (= Abstand) einer Station mobil
  const FOKUS_START = 78;     // mobil: Lage der aktiven Station im Streifen (von oben im Listenbereich)

  const radMessen = () => {
    if (!rad || !radPin || !radLeiste) return;
    // läuft auch bei „Bewegung reduzieren“: die Bewegung folgt nur dem eigenen Scrollen
    rad.classList.add("rad");
    const breite = rad.clientWidth;
    const kopf = breite >= 1273 ? 100 : 72;                    // Höhe der Petrol-Kopfzeile beim Scrollen
    const vertikal = breite <= 960;                            // mobil: Stationen wandern senkrecht, Desktop: seitlich
    rad.classList.toggle("vertikal", vertikal);
    STREIFEN = vertikal ? STREIFEN_V : radPin.querySelector(".z-termine-buehne").offsetHeight;
    const hoehe = Math.max(STREIFEN, window.innerHeight - kopf);
    const abstand = vertikal ? LI_H : Math.min(480, Math.max(320, breite * 0.3));
    const [von, bis] = [0, radPunkte.length - 1];               // Station 1 steht anfangs vorn, Station 5 am Ende
    const aufziehen = hoehe - STREIFEN;
    const drehen = (bis - von) * abstand * DREH_TEMPO;
    let listeH = 0;
    if (vertikal) {                                            // Überschrift oben, darunter der Listenbereich
      const oben = radPin.querySelector(".inner").offsetHeight + 12;
      listeH = hoehe - oben;
      rad.style.setProperty("--liste-oben", oben + "px");
    }
    rad.style.setProperty("--kopf", kopf + "px");
    rad.style.setProperty("--pin-h", hoehe + "px");
    rad.style.setProperty("--abstand", abstand + "px");
    rad.style.marginTop = (STREIFEN - hoehe) / 2 + "px";        // Streifen sitzt im Ablauf wie bisher
    rad.style.marginBottom = (STREIFEN - hoehe) / 2 + "px";     // … und endet auch wieder dort (Streifen schließt am Ende)
    rad.style.height = hoehe + 2 * aufziehen + drehen + "px";   // öffnen + durchdrehen + schließen
    if (radBuehne) radBuehne.style.transform = "";             // beim Wechsel Desktop ↔ mobil Inline-Stil zurücksetzen
    radLetzte = { weg: null, clip: null, versatz: null, lage: null, st: [] };
    // Dokumentposition einmal merken – so braucht jedes Frame keine Layout-Abfrage mehr
    const rect = rad.getBoundingClientRect();
    radMass = { breite, kopf, hoehe, abstand, von, bis, aufziehen, drehen, vertikal, listeH, anfang: rect.top + window.scrollY };
  };

  const radBewegen = () => {
    if (!radMass) return;
    const m = radMass;
    const L = radLetzte;
    const gesamt = 2 * m.aufziehen + m.drehen;
    const weg = Math.min(gesamt + 1, Math.max(-1, window.scrollY - (m.anfang - m.kopf)));   // Strecke seit dem Andocken, vor/nach der Sektion festgehalten
    if (weg === L.weg) return;                                  // nichts zu tun, solange man weit weg ist
    L.weg = weg;
    const oeffnen = m.aufziehen > 0 ? Math.min(1, Math.max(0, weg / m.aufziehen)) : 1;
    const schliessen = m.aufziehen > 0 ? Math.min(1, Math.max(0, (weg - m.aufziehen - m.drehen) / m.aufziehen)) : 0;
    const auf = oeffnen * (1 - schliessen);                     // 0 = Streifen, 1 = volle Höhe (Hin- und Rückweg)
    const clip = Math.round(((1 - auf) * (m.hoehe - STREIFEN)) / 2 * 2) / 2;
    if (clip !== L.clip) { L.clip = clip; radPin.style.clipPath = `inset(${clip}px 0)`; }   // direkt am Element, keine Variable im ganzen Baum
    const dreh = Math.min(1, Math.max(0, (weg - m.aufziehen) / m.drehen));
    const mitte = m.von + dreh * (m.bis - m.von);               // Index der aktiven Station
    let lage;
    if (m.vertikal) {
      // 1. Der Hintergrund füllt sich: der Inhalt rückt vom Streifen nach oben, die Fläche wird ganz Petrol
      if (clip !== L.versatz) { L.versatz = clip; radBuehne.style.transform = `translate3d(0, ${clip}px, 0)`; }
      // 2. Die aktive Station wandert dabei von oben in die Mitte des Listenbereichs, danach läuft die Liste nach oben durch
      const fokus = FOKUS_START + (m.listeH / 2 - FOKUS_START) * auf;
      lage = `translate3d(0, ${(fokus - m.abstand / 2 - mitte * m.abstand).toFixed(1)}px, 0)`;
    } else {
      lage = `translate3d(${(m.breite / 2 - m.abstand / 2 - mitte * m.abstand).toFixed(1)}px, 0, 0)`;
    }
    if (lage !== L.lage) { L.lage = lage; radLeiste.style.transform = lage; }
    radPunkte.forEach((li, i) => {
      const d = Math.min(1.6, Math.abs(i - mitte));             // Abstand zur aktiven Station in Stationen
      const st = `scale(${(1 - 0.14 * d).toFixed(3)})|${(1 - 0.3 * Math.max(0, d - 0.5)).toFixed(3)}`;
      if (st !== L.st[i]) { L.st[i] = st; const [t, o] = st.split("|"); li.style.transform = t; li.style.opacity = o; }
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
    const DAUER = 2400;    // Gesamtdauer in Millisekunden
    const LETZTER = 400;   // so lange steht der vorletzte Wert, bevor die Zahl auf den Endwert umschaltet (0,4 s)
    const hochzaehlen = (el) => {
      const text = el.textContent.trim();
      const ziel = parseInt(text.replace(/[.,\s]/g, ""), 10);
      if (!Number.isFinite(ziel)) return;
      const format = new Intl.NumberFormat(sprache, { useGrouping: /[.,]/.test(text) });
      // Verlauf: schnell am Anfang, dann immer langsamer. Der Exponent wird je Zahl so gewählt, dass der
      // Wert „Ziel − 1“ genau LETZTER Millisekunden sichtbar ist (bei 1977 ebenso wie bei 21).
      const p = Math.max(1.5, Math.log(ziel) / Math.log(DAUER / LETZTER));
      const start = performance.now();
      const schritt = (jetzt) => {
        const t = Math.min(1, (jetzt - start) / DAUER);
        const wert = t >= 1 ? ziel : Math.floor(ziel * (1 - Math.pow(1 - t, p)));
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
