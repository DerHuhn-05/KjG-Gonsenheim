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
  // Über uns: Karte als Scrollytelling.
  //  - Ab 80 % Sichtbarkeit beginnt der Zoom von Mainz nach Gonsenheim, die Karte bleibt dabei stehen
  //  - der Zoom folgt direkt dem Scrollen (vor und zurück)
  //  - erst wenn ganz herangezoomt ist, „ploppt“ der Pin auf
  // Gezoomt wird über den viewBox des SVG (nicht per CSS skaliert), damit alles scharf bleibt.
  // ---------------------------------------------------------------
  const karteSek = document.querySelector(".karte-sektion");
  if (karteSek) {
    const svg = karteSek.querySelector("svg.karte");
    const buehne = karteSek.querySelector(".karte-buehne");
    const pin = svg.querySelector(".k-pin");
    const linie = karteSek.querySelector(".karte-linie");
    const kLabel = karteSek.querySelector(".karte-label");
    const detail = svg.querySelector(".k-detail");
    const kHinweis = karteSek.querySelector(".scroll-hinweis");
    const MZ_W = 2400, MZ_H = 2607, GX = 794, GY = 666, GH = 835;   // Gesamtkarte, Standort, sichtbare Höhe beim Zoom (Karteneinheiten)
    const ansicht = (zoom) => {
      const W = svg.clientWidth || 1, H = svg.clientHeight || 1;
      if (!zoom) return { cx: MZ_W / 2, cy: MZ_H / 2, s: Math.max(MZ_H / H, MZ_W / W) * 1.04 };
      const s = Math.max(GH / H, 1000 / W);
      const fx = W < 560 ? 0.76 : W < 960 ? 0.62 : 0.5;               // Pin liegt weiter rechts, damit links Platz für den Kasten bleibt (waagrechte Verbindungslinie)
      return { cx: GX + (0.5 - fx) * W * s, cy: GY - 0.07 * H * s, s };   // Pin etwas unterhalb der Mitte, damit der Kopf Platz hat
    };
    const setzen = (c) => {
      const W = svg.clientWidth || 1, H = svg.clientHeight || 1;
      svg.setAttribute("viewBox", `${(c.cx - W * c.s / 2).toFixed(2)} ${(c.cy - H * c.s / 2).toFixed(2)} ${(W * c.s).toFixed(2)} ${(H * c.s).toFixed(2)}`);
      pin.setAttribute("transform", `translate(${GX} ${GY}) scale(${c.s.toFixed(4)})`);   // Pin bleibt in Bildschirmgröße
    };
    // Der Kasten hängt mit seiner Oberkante an der waagrechten Linie: Linie und Kastenoberkante liegen auf der Höhe der Pin-Spitze.
    // (Pin-Position im ganz gezoomten Zustand, in Bildschirmkoordinaten der Bühne)
    let linienLaenge = 0;
    const linieSetzen = () => {
      if (!linie || !kLabel) return;
      const W = svg.clientWidth || 1, H = svg.clientHeight || 1, z = ansicht(true);
      const px = W / 2 + (GX - z.cx) / z.s, py = H / 2 + (GY - z.cy) / z.s;
      kLabel.style.maxWidth = "";
      const b = buehne.getBoundingClientRect();
      const links = kLabel.getBoundingClientRect().left - b.left;
      kLabel.style.maxWidth = Math.max(190, Math.min(W - 32, px - 44 - links)) + "px";      // links vom Pin bleibt Platz für die Linie
      const hoehe = kLabel.offsetHeight;
      const rahmen = parseFloat(getComputedStyle(kLabel).borderTopWidth) || 0;
      kLabel.style.top = Math.max(8, Math.min(H - hoehe - 8, py - rahmen / 2)) + "px";       // Mitte des oberen Rahmens = Mitte der Linie (Höhe der Pin-Spitze)
      kLabel.style.bottom = "auto";
      const sx = kLabel.getBoundingClientRect().right - b.left - rahmen / 2;                // Linie endet in der Mitte der Rahmenecke → beides geht ineinander über
      linie.setAttribute("viewBox", `0 0 ${W} ${H}`);
      const d = `M${px.toFixed(1)} ${py.toFixed(1)}L${sx.toFixed(1)} ${py.toFixed(1)}`;      // von der Pin-Spitze nach links bis zur Kastenecke
      linie.querySelectorAll("path").forEach((pf) => pf.setAttribute("d", d));          // Kontur und weiße Linie
      linienLaenge = Math.ceil(Math.abs(px - sx) + 4);
      linie.style.setProperty("--len", linienLaenge + "px");
      linie.querySelectorAll("circle").forEach((c) => { c.setAttribute("cx", px.toFixed(1)); c.setAttribute("cy", py.toFixed(1)); });
    };
    // Linie und Kasten fahren beim Scrollen aus: q = Fortschritt der Linie (0–1), r = Fortschritt des Kastens (0–1)
    const ausfahren = (q, r) => {
      if (!linie || !kLabel) return;
      linie.querySelectorAll(".karte-linie-halo, .karte-linie-pfad").forEach((pf) => { pf.style.strokeDashoffset = (linienLaenge * (1 - q)).toFixed(1) + "px"; });
      linie.querySelectorAll("circle").forEach((c) => { c.style.opacity = q > 0 ? 1 : 0; });
      kLabel.style.clipPath = r >= 1 ? "none" : `inset(0 0 ${((1 - r) * 100).toFixed(1)}% 0)`;   // wächst von der Linie aus nach unten
      kLabel.style.visibility = r > 0.02 ? "visible" : "hidden";
    };
    const zwischen = (von, ziel, p) => {
      const e = p * p * (3 - 2 * p);                                                    // weiche Kurve über den Scrollweg
      const s = Math.exp(Math.log(von.s) + (Math.log(ziel.s) - Math.log(von.s)) * e);  // Zoom exponentiell (wirkt gleichmäßig)
      const u = (1 / s - 1 / von.s) / (1 / ziel.s - 1 / von.s);                         // Mittelpunkt wandert passend zum Zoom
      return { cx: von.cx + (ziel.cx - von.cx) * u, cy: von.cy + (ziel.cy - von.cy) * u, s };
    };

    let mass = null, letztes = "";
    const karteMessen = () => {
      const kopf = window.innerWidth >= 1273 ? 100 : 72;
      const vh = window.innerHeight;
      karteSek.style.setProperty("--kopf", kopf + "px");
      const hoeheB = buehne.offsetHeight;
      // Scrollstrecke, während die Karte steht: Zoom, dann Linie ausfahren, dann Kasten ausfahren, kurzer Halt
      const zoomL = Math.round(vh * 0.88), linieL = Math.round(vh * 0.28), kastenL = Math.round(vh * 0.28), halt = Math.round(vh * 0.1) + 20;      // Endbild bleibt noch kurz stehen (+20 px)
      karteSek.style.height = hoeheB + zoomL + linieL + kastenL + halt + "px";
      const oben = karteSek.getBoundingClientRect().top + window.scrollY;
      mass = {
        start: oben - (vh - 0.8 * hoeheB),                               // 80 % der Karte sind sichtbar → Zoom beginnt
        zoomEnde: oben - kopf + zoomL,                                   // ganz herangezoomt: Pin ploppt auf
        zoomL, linieL, kastenL,
      };
      letztes = "";
      linieSetzen();
      karteBewegen();
    };
    const klemmen = (v) => Math.min(1, Math.max(0, v));
    const karteBewegen = () => {
      if (!mass) return;
      const y = window.scrollY;
      const p = klemmen((y - mass.start) / (mass.zoomEnde - mass.start));
      const q = klemmen((y - mass.zoomEnde) / mass.linieL);
      const r = klemmen((y - mass.zoomEnde - mass.linieL) / mass.kastenL);
      if (kHinweis) kHinweis.style.opacity = (1 - klemmen((r - 0.2) / 0.4)).toFixed(2);   // „Weiter scrollen“ verschwindet, sobald die Kachel ausfährt
      const schluessel = p.toFixed(4) + q.toFixed(4) + r.toFixed(4);
      if (schluessel === letztes) return;
      letztes = schluessel;
      setzen(zwischen(ansicht(false), ansicht(true), p));
      karteSek.classList.toggle("zoom", p >= 1);                         // Pin „ploppt“ erst auf, wenn ganz herangezoomt ist
      // Straßen: die groben sind immer da (die Form der Stadt bleibt erkennbar), nur die allerkleinsten werden ab 43 % des Zooms an festen Scrollpositionen ergänzt – nicht zeitgesteuert, daher auch bei schnellem Scrollen ohne Lücken
      if (detail) detail.style.opacity = klemmen((p - 0.43) / 0.3).toFixed(3);   // beginnt bei 43 % (7 Prozentpunkte früher als zuvor), voll bei 73 %
      ausfahren(q, r);
    };
    if (ruhig || !("IntersectionObserver" in window)) {
      const fertig = () => { setzen(ansicht(true)); linieSetzen(); ausfahren(1, 1); };   // „Bewegung reduzieren“: gleich die fertige Karte, ohne Scrollytelling
      karteSek.classList.add("zoom");
      if (detail) detail.style.opacity = 1;
      fertig();
      window.addEventListener("load", fertig);
      window.addEventListener("resize", fertig);
    } else {
      karteSek.classList.add("scrolly");
      setzen(ansicht(false));
      karteMessen();
      window.addEventListener("scroll", () => requestAnimationFrame(karteBewegen), { passive: true });
      window.addEventListener("load", karteMessen);
      let kb = window.innerWidth;
      window.addEventListener("resize", () => { if (window.innerWidth !== kb) { kb = window.innerWidth; karteMessen(); } });
    }
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
  const radHinweis = radPin && radPin.querySelector(".scroll-hinweis");   // „Weiter scrollen“ mit Pfeil
  let radMass = null;
  let radLetzte = { weg: null, clip: null, versatz: null, lage: null, st: [] };   // zuletzt gesetzte Werte – unveränderte werden nicht neu geschrieben

  const STREIFEN_V = 400;     // Höhe des Streifens mobil (vertikale Variante, passt zu --streifen im CSS)
  const LI_H = 190;           // Höhe (= Abstand) einer Station mobil
  const FOKUS_START = 78;     // mobil: Lage der aktiven Station im Streifen (von oben im Listenbereich)
  // mobil: „Fischaugen“-Effekt – je näher eine Station der Mitte kommt, desto größer wird sie und desto mehr Abstand hat sie zu den Nachbarn
  const G_MIN = 118, G_MAX = 290, SIGMA = 0.85;                // Abstand zwischen zwei Stationen: außen G_MIN px, in der Mitte G_MAX px
  const fischPos = (d, gmin, gmax) => Math.sign(d) * (gmin * Math.abs(d) + (gmax - gmin) * SIGMA * Math.atan(Math.abs(d) / SIGMA));   // Lage relativ zur Mitte (Integral des Abstands)
  const fischSkala = (d) => 0.72 + 0.53 / (1 + (d / 0.8) * (d / 0.8));                // Mitte 1,25 → außen 0,72
  const fischAlpha = (d) => 1 / (1 + 0.45 * d * d);

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
      rad.style.setProperty("--liste-h", listeH + "px");
    }
    rad.style.setProperty("--rad-breite", breite + "px");
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
    if (radHinweis) {                                           // Hinweis „Weiter scrollen“: sichtbar, solange die Zeitleiste steht und noch nicht fast am Ende ist
      const an = weg > 0 && weg < m.aufziehen + 0.85 * m.drehen;
      const hinweis = `${an ? 1 : 0}|${(clip + 18).toFixed(0)}`;
      if (hinweis !== L.hinweis) { L.hinweis = hinweis; radHinweis.style.opacity = an ? 1 : 0; radHinweis.style.top = (clip + 18) + "px"; }
    }
    let lage;
    if (m.vertikal) {
      // 1. Der Hintergrund füllt sich: der Inhalt rückt vom Streifen nach oben, die Fläche wird ganz Petrol
      if (clip !== L.versatz) { L.versatz = clip; radBuehne.style.transform = `translate3d(0, ${clip}px, 0)`; }
      // 2. Die aktive Station wandert dabei von oben in die Mitte des Listenbereichs, danach läuft die Liste nach oben durch
      const fokus = FOKUS_START + (m.listeH / 2 - FOKUS_START) * auf;
      lage = "none";                                              // die Liste selbst bleibt stehen, jede Station wandert einzeln (Fischauge, siehe unten)
      radPunkte.forEach((li, i) => {
        const d = i - mitte;
        const dy = fokus + fischPos(d, G_MIN, G_MAX) - (i + 0.5) * m.abstand;     // Zielposition minus natürliche Lage in der Liste
        const st = `translate3d(0, ${dy.toFixed(1)}px, 0) scale(${fischSkala(d).toFixed(3)})|${fischAlpha(d).toFixed(3)}`;
        if (st !== L.st[i]) { L.st[i] = st; const [t, o] = st.split("|"); li.style.transform = t; li.style.opacity = o; }
      });
    } else {
      // Desktop: dasselbe Fischauge waagrecht – die mittlere Station ist am größten und hat den größten Abstand zu den Nachbarn
      lage = "none";
      radPunkte.forEach((li, i) => {
        const d = i - mitte;
        const dx = m.breite / 2 + fischPos(d, 0.6 * m.abstand, 1.2 * m.abstand) - (i + 0.5) * m.abstand;
        const st = `translate3d(${dx.toFixed(1)}px, 0, 0) scale(${fischSkala(d).toFixed(3)})|${fischAlpha(d).toFixed(3)}`;
        if (st !== L.st[i]) { L.st[i] = st; const [t, o] = st.split("|"); li.style.transform = t; li.style.opacity = o; }
      });
    }
    if (lage !== L.lage) { L.lage = lage; radLeiste.style.transform = lage; }
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
