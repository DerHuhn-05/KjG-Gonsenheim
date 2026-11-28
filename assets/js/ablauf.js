/* Detailseiten der Angebote und Aktionen: Scrollytelling
   - Abschnitte: das Bild bleibt stehen, der aktive Absatz ist voll sichtbar, die übrigen blass
   - Zitat (zwischen den Abschnitten): die Buchstaben füllen sich beim Scrollen nacheinander von leicht transparent zu voll */
KJG.beiBereit(() => {
  "use strict";
  const SCHRITT_LINIE = 0.6, HANDY_SCHRITT_LINIE = 0.8;   // ein Absatz ist aktiv, sobald seine Oberkante über dieser Höhe liegt (Anteil des Fensters)
  const BUCHSTABE_BLASS = 0.2;                            // Deckkraft eines noch nicht „gelesenen“ Buchstabens
  // das erste Wort ist von Anfang an gefüllt; der Rest füllt sich erst, wenn das Zitat kurz vor der Bildschirmmitte ist
  const ZITAT_START = 0.6, ZITAT_ENDE = 0.25;             // Oberkante des Zitats wandert von 60 % auf 25 % der Fensterhöhe
  const HANDY_ZITAT_START = 0.62, HANDY_ZITAT_ENDE = 0.28;

  const abschnitte = [...document.querySelectorAll(".story")].map((story) => {
    story.classList.add("aktiv");
    return { schritte: [...story.querySelectorAll(".story-schritt")], zuletzt: -1 };
  });

  // Zitat in Buchstaben zerlegen. Vorleseprogramme bekommen den Text am Stück, die Buchstaben-Spans sind für sie verborgen.
  const buchstaben = [];
  let erstesWort = 0;   // so viele Buchstaben hat das erste Wort – sie sind immer voll
  const zitat = document.querySelector(".ablauf-zitat blockquote p");
  if (zitat && !KJG.ruhig) {
    const text = zitat.textContent.replace(/\s+/g, " ").trim();
    const vorlesen = document.createElement("span");
    vorlesen.className = "sr-only";
    vorlesen.textContent = text;
    const sichtbar = document.createElement("span");
    sichtbar.setAttribute("aria-hidden", "true");
    text.split(" ").forEach((wort, i) => {
      if (i) sichtbar.append(" ");
      const wortSpan = document.createElement("span");
      wortSpan.className = "zitat-wort";   // ein Wort bricht nie mitten im Wort um
      for (const zeichen of wort) {
        const b = document.createElement("span");
        b.className = "zitat-b";
        b.textContent = zeichen;
        buchstaben.push(b);
        if (i === 0) erstesWort++;
        wortSpan.append(b);
      }
      sichtbar.append(wortSpan);
    });
    zitat.replaceChildren(vorlesen, sichtbar);
  }
  if (!abschnitte.length && !buchstaben.length) return;

  const letzterUeber = (elemente, linie) => {
    let index = 0;
    elemente.forEach((el, i) => { if (el.getBoundingClientRect().top < linie) index = i; });
    return index;
  };

  KJG.beimScrollen(() => {
    const vh = window.innerHeight, handy = KJG.handy();
    const linie = vh * (handy ? HANDY_SCHRITT_LINIE : SCHRITT_LINIE);
    abschnitte.forEach((a) => {
      const aktiv = letzterUeber(a.schritte, linie);
      if (aktiv === a.zuletzt) return;
      a.zuletzt = aktiv;
      a.schritte.forEach((el, i) => el.classList.toggle("an", i === aktiv));
    });

    if (buchstaben.length) {
      const [start, ende] = handy ? [HANDY_ZITAT_START, HANDY_ZITAT_ENDE] : [ZITAT_START, ZITAT_ENDE];
      const r = zitat.getBoundingClientRect();
      const gelesen = erstesWort + KJG.klemmen((vh * start - r.top) / (vh * (start - ende))) * (buchstaben.length - erstesWort);
      buchstaben.forEach((b, i) => {
        const d = BUCHSTABE_BLASS + (1 - BUCHSTABE_BLASS) * KJG.klemmen(gelesen - i);
        b.style.opacity = d >= 1 ? "" : d.toFixed(3);
      });
    }
  });
});
