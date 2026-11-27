/* Über uns: Karte als Scrollytelling
   - sobald 80 % der Karte sichtbar sind, beginnt der Zoom von Mainz nach Gonsenheim; die Karte bleibt dabei stehen (sticky)
   - der Zoom folgt direkt dem Scrollen (vor und zurück), erst ganz herangezoomt „ploppt“ der Pin auf
   - danach fährt die waagrechte Linie vom Pin aus und an ihr der Kasten mit der Adresse nach unten aus
   Gezoomt wird über den viewBox des SVG (nicht per CSS skaliert), damit alles scharf bleibt. */
KJG.beiBereit(() => {
  "use strict";
  const sektion = document.querySelector(".karte-sektion");
  if (!sektion) return;

  // Karte (in Karteneinheiten): Gesamtgröße, Standort der KjG (Spitze des Pins), sichtbare Höhe ganz herangezoomt
  const KARTE_BREITE = 2400, KARTE_HOEHE = 2607, PIN_X = 794, PIN_Y = 666, ZOOM_HOEHE = 835, ZOOM_MIN_BREITE = 1000;
  const RAND_GESAMT = 1.04;            // Gesamtansicht mit 4 % Luft
  const PIN_UNTER_MITTE = 0.07;        // Pin sitzt etwas unter der Bildmitte, damit sein Kopf Platz hat
  // Scrollstrecke (Anteil der Fensterhöhe), während die Karte steht
  const ZOOM_STRECKE = 0.88, LINIE_STRECKE = 0.28, KASTEN_STRECKE = 0.28, HALT_STRECKE = 0.4, HALT_EXTRA = 20;
  const START_SICHTBAR = 0.8;          // Zoom beginnt, wenn 80 % der Karte im Bild sind
  const DETAIL_AB = 0.43, DETAIL_UEBER = 0.3;   // kleinste Straßen: ab 43 % des Zooms einblenden, voll bei 73 %
  const KASTEN_MIN = 190, KASTEN_ABSTAND = 44, RAND = 8;

  const svg = sektion.querySelector("svg.karte");
  const buehne = sektion.querySelector(".karte-buehne");
  const pin = svg.querySelector(".k-pin");
  const linie = sektion.querySelector(".karte-linie");
  const kasten = sektion.querySelector(".karte-label");
  const detail = svg.querySelector(".k-detail");
  const groesse = () => ({ W: svg.clientWidth || 1, H: svg.clientHeight || 1 });

  // Pin liegt auf schmalen Bildschirmen weiter rechts, damit links Platz für Kasten und waagrechte Linie bleibt
  const pinLage = (W) => (W < 560 ? 0.76 : W < 960 ? 0.62 : 0.5);
  const ansicht = (herangezoomt) => {
    const { W, H } = groesse();
    if (!herangezoomt) return { cx: KARTE_BREITE / 2, cy: KARTE_HOEHE / 2, s: Math.max(KARTE_HOEHE / H, KARTE_BREITE / W) * RAND_GESAMT };
    const s = Math.max(ZOOM_HOEHE / H, ZOOM_MIN_BREITE / W);
    return { cx: PIN_X + (0.5 - pinLage(W)) * W * s, cy: PIN_Y - PIN_UNTER_MITTE * H * s, s };
  };
  const setzen = (blick) => {
    const { W, H } = groesse();
    svg.setAttribute("viewBox", `${(blick.cx - W * blick.s / 2).toFixed(2)} ${(blick.cy - H * blick.s / 2).toFixed(2)} ${(W * blick.s).toFixed(2)} ${(H * blick.s).toFixed(2)}`);
    pin.setAttribute("transform", `translate(${PIN_X} ${PIN_Y}) scale(${blick.s.toFixed(4)})`);   // Pin bleibt in Bildschirmgröße
  };
  // Zwischenstand zwischen Gesamtansicht und Zoom: weiche Kurve, Zoom exponentiell (wirkt gleichmäßig), Mittelpunkt wandert passend mit
  const zwischen = (von, ziel, p) => {
    const e = p * p * (3 - 2 * p);
    const s = Math.exp(Math.log(von.s) + (Math.log(ziel.s) - Math.log(von.s)) * e);
    const u = (1 / s - 1 / von.s) / (1 / ziel.s - 1 / von.s);
    return { cx: von.cx + (ziel.cx - von.cx) * u, cy: von.cy + (ziel.cy - von.cy) * u, s };
  };

  // Der Kasten hängt mit der Mitte seines oberen Rahmens an der waagrechten Linie (Höhe der Pin-Spitze im gezoomten Zustand)
  let linienLaenge = 0;
  const linieSetzen = () => {
    if (!linie || !kasten) return;
    const { W, H } = groesse(), z = ansicht(true);
    const px = W / 2 + (PIN_X - z.cx) / z.s, py = H / 2 + (PIN_Y - z.cy) / z.s;
    kasten.style.maxWidth = "";
    const b = buehne.getBoundingClientRect();
    const links = kasten.getBoundingClientRect().left - b.left;
    kasten.style.maxWidth = Math.max(KASTEN_MIN, Math.min(W - 32, px - KASTEN_ABSTAND - links)) + "px";
    const rahmen = parseFloat(getComputedStyle(kasten).borderTopWidth) || 0;
    kasten.style.top = Math.max(RAND, Math.min(H - kasten.offsetHeight - RAND, py - rahmen / 2)) + "px";
    kasten.style.bottom = "auto";
    const sx = kasten.getBoundingClientRect().right - b.left - rahmen / 2;   // Linie endet in der Rahmenecke – beides geht ineinander über
    linie.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const d = `M${px.toFixed(1)} ${py.toFixed(1)}L${sx.toFixed(1)} ${py.toFixed(1)}`;
    linie.querySelectorAll("path").forEach((pfad) => pfad.setAttribute("d", d));
    linienLaenge = Math.ceil(Math.abs(px - sx) + 4);
    linie.style.setProperty("--len", linienLaenge + "px");
    linie.querySelectorAll("circle").forEach((c) => { c.setAttribute("cx", px.toFixed(1)); c.setAttribute("cy", py.toFixed(1)); });
  };
  // Linie (q) und Kasten (r) fahren beim Scrollen aus, jeweils 0 … 1
  const ausfahren = (q, r) => {
    if (!linie || !kasten) return;
    linie.querySelectorAll(".karte-linie-halo, .karte-linie-pfad").forEach((pfad) => { pfad.style.strokeDashoffset = (linienLaenge * (1 - q)).toFixed(1) + "px"; });
    linie.querySelectorAll("circle").forEach((c) => { c.style.opacity = q > 0 ? 1 : 0; });
    kasten.style.clipPath = r >= 1 ? "none" : `inset(0 0 ${((1 - r) * 100).toFixed(1)}% 0)`;
    kasten.style.visibility = r > 0.02 ? "visible" : "hidden";
  };

  if (KJG.ruhig || !("IntersectionObserver" in window)) {   // „Bewegung reduzieren“: gleich die fertige Karte
    const fertig = () => { setzen(ansicht(true)); linieSetzen(); ausfahren(1, 1); };
    sektion.classList.add("zoom");
    if (detail) detail.style.opacity = 1;
    fertig();
    window.addEventListener("load", fertig);
    window.addEventListener("resize", fertig);
    return;
  }

  let mass = null, zuletzt = "";
  const messen = () => {
    const kopf = KJG.kopfHoehe(), vh = window.innerHeight;
    sektion.style.setProperty("--kopf", kopf + "px");
    const hoehe = buehne.offsetHeight;
    const zoomL = Math.round(vh * ZOOM_STRECKE), linieL = Math.round(vh * LINIE_STRECKE), kastenL = Math.round(vh * KASTEN_STRECKE);
    const halt = Math.round(vh * HALT_STRECKE) + HALT_EXTRA;
    sektion.style.height = hoehe + zoomL + linieL + kastenL + halt + "px";
    const oben = sektion.getBoundingClientRect().top + window.scrollY;
    mass = { start: oben - (vh - START_SICHTBAR * hoehe), zoomEnde: oben - kopf + zoomL, linieL, kastenL };
    zuletzt = "";
    linieSetzen();
  };
  const bewegen = () => {
    if (!mass) return;
    const y = window.scrollY;
    const p = KJG.klemmen((y - mass.start) / (mass.zoomEnde - mass.start));
    const q = KJG.klemmen((y - mass.zoomEnde) / mass.linieL);
    const r = KJG.klemmen((y - mass.zoomEnde - mass.linieL) / mass.kastenL);
    const stand = p.toFixed(4) + q.toFixed(4) + r.toFixed(4);
    if (stand === zuletzt) return;
    zuletzt = stand;
    setzen(zwischen(ansicht(false), ansicht(true), p));
    sektion.classList.toggle("zoom", p >= 1);
    // die groben Straßen sind immer da; nur die allerkleinsten kommen an festen Scrollpositionen dazu (auch bei schnellem Scrollen ohne Lücken)
    if (detail) detail.style.opacity = KJG.klemmen((p - DETAIL_AB) / DETAIL_UEBER).toFixed(3);
    ausfahren(q, r);
  };
  sektion.classList.add("scrolly");
  setzen(ansicht(false));
  messen();
  KJG.beimScrollen(bewegen);
  window.addEventListener("load", () => { messen(); bewegen(); });
  KJG.beiBreitenAenderung(() => { messen(); bewegen(); });
  const hinweis = sektion.querySelector(".scroll-hinweis");   // „Weiter scrollen“ bleibt bis zum Ende stehen
  if (hinweis) hinweis.style.opacity = 1;
});
