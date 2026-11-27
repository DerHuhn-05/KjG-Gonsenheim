/* Startseite (mobil): „Unser Angebot für euch“ und „Soziale Aktionen“ als Slider mit Pfeilen und Punkten.
   Wischen und Einrasten macht das CSS, hier kommen nur die Bedienelemente dazu. */
KJG.beiBereit(() => {
  "use strict";
  const ENDE_TOLERANZ = 2;   // px – so nah am Rand gilt der Slider als ganz links bzw. ganz rechts
  const verhalten = KJG.ruhig ? "auto" : "smooth";

  document.querySelectorAll(".cards-section .cards").forEach((liste) => {
    const karten = [...liste.children];
    if (karten.length < 2) return;
    const abstandZumStart = (karte) => karte.offsetLeft - karten[0].offsetLeft;

    const pfeil = (richtung) => {
      const knopf = document.createElement("button");
      knopf.type = "button";
      knopf.className = "slider-pfeil";
      knopf.setAttribute("aria-label", richtung < 0 ? KJG.T("Vorherige Karte", "Previous card") : KJG.T("Nächste Karte", "Next card"));
      knopf.innerHTML = `<img src="${KJG.basis}icons/slider-${richtung < 0 ? "links" : "rechts"}.svg" width="12" height="20" alt="">`;
      knopf.addEventListener("click", () => liste.scrollBy({ left: richtung * abstandZumStart(karten[1]), behavior: verhalten }));
      return knopf;
    };
    const zurueck = pfeil(-1), weiter = pfeil(1);

    const punkte = document.createElement("div");
    punkte.className = "slider-punkte";
    karten.forEach((karte, i) => {
      const punkt = document.createElement("button");
      punkt.type = "button";
      punkt.setAttribute("aria-label", KJG.T(`Karte ${i + 1} anzeigen`, `Show card ${i + 1}`));
      punkt.addEventListener("click", () => liste.scrollTo({ left: abstandZumStart(karte), behavior: verhalten }));
      punkte.appendChild(punkt);
    });

    const leiste = document.createElement("div");
    leiste.className = "slider-nav";
    leiste.append(zurueck, punkte, weiter);
    liste.after(leiste);

    const markieren = () => {
      // aktive Karte = die, deren Lage der aktuellen Scroll-Position am nächsten ist
      const amEnde = liste.scrollLeft + liste.clientWidth >= liste.scrollWidth - ENDE_TOLERANZ;
      let aktiv = 0, kleinsterAbstand = Infinity;
      karten.forEach((karte, i) => {
        const abstand = Math.abs(abstandZumStart(karte) - liste.scrollLeft);
        if (abstand < kleinsterAbstand) { kleinsterAbstand = abstand; aktiv = i; }
      });
      if (amEnde) aktiv = karten.length - 1;
      [...punkte.children].forEach((punkt, i) => punkt.setAttribute("aria-current", String(i === aktiv)));
      zurueck.disabled = liste.scrollLeft <= ENDE_TOLERANZ;
      weiter.disabled = amEnde;
    };
    liste.addEventListener("scroll", () => window.requestAnimationFrame(markieren), { passive: true });
    window.addEventListener("resize", markieren);
    markieren();
  });
});
