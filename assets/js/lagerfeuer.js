/* Team-Seite: Lagerfeuer-Scrollytelling
   Die Personen sitzen im Kreis ums Feuer. Die Szene bleibt beim Scrollen stehen (sticky); mit jedem Scroll-Schritt
   dreht sich der Kreis, bis die nächste Person vorn in der Mitte sitzt. Ihre Infos stehen in der Kachel daneben. */
KJG.beiBereit(() => {
  "use strict";
  const feuer = document.querySelector(".feuer");
  if (!feuer) return;

  const HANDY_BIS = 860;                       // px Fensterbreite – darunter: Kachel unten, Szene darüber
  const SCHRITT_ANTEIL = 0.7, SCHRITT_MIN = 360;   // Scrollweg pro Person (Anteil der Fensterhöhe, mindestens px)
  const AKTIV_GROESSE = { handy: 1.5, desktop: 1.3 };   // so stark wächst die Person vorn in der Mitte
  const HINTEN_GROESSE = 0.5, HINTEN_DAZU = 0.32;     // Größe hinten im Kreis bzw. Zuwachs nach vorn
  const HINTEN_DECKKRAFT = 0.35, VORNE_DECKKRAFT_DAZU = 0.3;
  const FEUER_SKALA_DESKTOP = 0.9, FLAMMEN_HOEHE = 242;   // SVG-Einheiten von der Flammenspitze bis zum Boden
  const NAME_ABSTAND = 24;                     // px vom Namen der aktiven Person bis zur Kachel (Handy)
  const KOMPAKT_UNTER = 0.48;                  // Handy: bleibt weniger als 48 % der Höhe für die Szene, entfällt das Zitat
  const HINWEIS_BIS = 0.97;                    // „Weiter scrollen“ blendet am Ende aus
  const GRUPPE_START = { lagerleitung: 0, planungsleitung: 3, pfarrleitung: 6 };   // Sprungmarken → erste Person der Gruppe

  const ring = feuer.querySelector(".feuer-ring");
  const stelle = feuer.querySelector(".feuer-stelle");
  const bahn = feuer.querySelector(".feuer-bahn");
  const info = feuer.querySelector(".feuer-info");
  const leiste = feuer.querySelector(".feuer-dots");
  const personen = [...feuer.querySelectorAll(".feuer-p")];
  const kacheln = [...feuer.querySelectorAll(".feuer-it")];
  const namen = personen.map((p) => p.querySelector(".feuer-name"));
  const N = personen.length;
  const winkelSchritt = (2 * Math.PI) / N;
  const VORN = Math.PI / 2;                    // Winkel der Person vorn in der Mitte
  const lerp = (a, b, t) => a + (b - a) * t;
  const weich = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  let aktiv = -1, handy = false, kopf = 100, hoehe = 600, schritt = 600, rx = 380, ry = 100, feuerSkala = FEUER_SKALA_DESKTOP;

  const zuPerson = (i) => {
    const oben = feuer.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: oben - kopf + i * schritt, behavior: KJG.ruhig ? "auto" : "smooth" });
  };

  // Bedienleiste: Pfeil · Nummern · Pfeil
  const pfeil = (richtung) => {
    const knopf = document.createElement("button");
    knopf.type = "button";
    knopf.className = "feuer-pfeil";
    knopf.setAttribute("aria-label", richtung < 0 ? KJG.T("Vorherige Person", "Previous person") : KJG.T("Nächste Person", "Next person"));
    knopf.innerHTML = `<img src="${KJG.basis}icons/slider-${richtung < 0 ? "links" : "rechts"}.svg" width="10" height="16" alt="">`;
    knopf.addEventListener("click", () => zuPerson(KJG.klemmen(aktiv + richtung, 0, N - 1)));
    return knopf;
  };
  const zurueck = pfeil(-1), weiter = pfeil(1);
  const nummern = personen.map((p, i) => {
    const knopf = document.createElement("button");
    knopf.type = "button";
    knopf.textContent = i + 1;
    knopf.setAttribute("aria-label", namen[i].textContent);
    knopf.addEventListener("click", () => zuPerson(i));
    return knopf;
  });
  leiste.append(zurueck, ...nummern, weiter);

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const ziel = a.getAttribute("href").slice(1);
    if (ziel in GRUPPE_START) a.addEventListener("click", (e) => { e.preventDefault(); zuPerson(GRUPPE_START[ziel]); });
  });

  // Handy: die Szene füllt den Platz über der Kachel; der Name der aktiven Person endet NAME_ABSTAND über der Kachel
  const handyLayout = () => {
    const unten = parseFloat(getComputedStyle(info).bottom) || 0;
    feuer.classList.remove("kompakt");
    let kachelOben = hoehe - unten - info.offsetHeight;
    if (kachelOben < hoehe * KOMPAKT_UNTER) { feuer.classList.add("kompakt"); kachelOben = hoehe - unten - info.offsetHeight; }
    const platz = kachelOben - NAME_ABSTAND;
    const fotoBreite = KJG.klemmen(platz * 0.3, 60, 112);
    personen.forEach((p) => { p.style.width = fotoBreite + "px"; });
    ry = KJG.klemmen(platz * 0.1, 26, 56);
    ring.style.top = platz - 26 - ry + "px";
    feuerSkala = KJG.klemmen((platz - 26 - ry - 0.75 * ry - 10) / FLAMMEN_HOEHE, 0.35, 1);   // Flammenspitze ca. 10 px unter dem Oberrand
  };
  const layout = () => {
    handy = window.innerWidth < HANDY_BIS;
    kopf = KJG.kopfHoehe();
    feuer.style.setProperty("--kopf", kopf + "px");
    hoehe = window.innerHeight - kopf;
    schritt = Math.max(SCHRITT_MIN, window.innerHeight * SCHRITT_ANTEIL);
    feuer.style.height = hoehe + (N - 1) * schritt + "px";
    rx = KJG.klemmen(window.innerWidth * (handy ? 0.37 : 0.22), 120, 400);
    ry = KJG.klemmen(hoehe * (handy ? 0.065 : 0.13), 40, 130);
    if (handy) handyLayout();
    else { ring.style.top = ""; personen.forEach((p) => { p.style.width = ""; }); feuerSkala = FEUER_SKALA_DESKTOP; }
    bahn.style.width = 2 * rx + "px";
    bahn.style.height = 2 * ry + "px";
  };

  let hinweis = null;   // „Weiter scrollen“ erzeugt module.js – erst bei Bedarf suchen
  const bewegen = () => {
    const rahmen = feuer.getBoundingClientRect();
    const p = KJG.klemmen((kopf - rahmen.top) / Math.max(1, rahmen.height - hoehe));
    const f = p * (N - 1);   // „Index“ der Person vorn, mit Nachkommastellen
    personen.forEach((person, i) => {
      const d = ((((i - f + N / 2) % N) + N) % N) - N / 2;   // Abstand zur vorderen Position (−N/2 … N/2)
      const winkel = VORN + d * winkelSchritt;
      const tiefe = (1 + Math.sin(winkel)) / 2;               // 0 = hinten, 1 = vorn
      const nah = weich(KJG.klemmen(1 - Math.abs(d)));       // 1 = genau vorn in der Mitte
      const groesse = lerp(HINTEN_GROESSE + HINTEN_DAZU * tiefe, handy ? AKTIV_GROESSE.handy : AKTIV_GROESSE.desktop, nah);
      person.style.transform = `translate(${(rx * Math.cos(winkel)).toFixed(1)}px,${(ry * Math.sin(winkel)).toFixed(1)}px) translate(-50%,-100%) scale(${groesse.toFixed(3)})`;
      person.style.zIndex = Math.round(tiefe * 100) + (nah > 0.5 ? 1 : 0);
      person.style.opacity = lerp(HINTEN_DECKKRAFT + VORNE_DECKKRAFT_DAZU * tiefe, 1, nah).toFixed(2);
      namen[i].style.opacity = nah.toFixed(2);
      person.classList.toggle("aktiv", nah > 0.6);
    });
    const vorn = Math.round(f);
    if (vorn !== aktiv) {
      aktiv = vorn;
      kacheln.forEach((k, j) => k.classList.toggle("an", j === vorn));
      zurueck.disabled = vorn === 0;
      weiter.disabled = vorn === N - 1;
      nummern.forEach((knopf, j) => {
        knopf.classList.toggle("an", j === vorn);
        if (j === vorn) knopf.setAttribute("aria-current", "true"); else knopf.removeAttribute("aria-current");
      });
    }
    const flamme = lerp(0.85, 1, weich(KJG.klemmen(p * 3))) * feuerSkala;   // das Feuer wächst am Anfang noch ein wenig
    stelle.style.transform = `translate(-50%,${(-0.75 * ry).toFixed(0)}px) translate(0,-100%) scale(${flamme.toFixed(3)})`;
    if (!hinweis) hinweis = feuer.querySelector(".scroll-hinweis");
    if (hinweis) hinweis.style.opacity = p < HINWEIS_BIS ? 1 : 0;
  };

  layout();
  KJG.beimScrollen(bewegen);
  KJG.beiBreitenAenderung(() => { layout(); bewegen(); });
  window.addEventListener("load", () => { layout(); bewegen(); });   // nach dem Laden der Schrift stimmt die Höhe der Infokachel
});
