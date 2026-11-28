/* Detailseiten der Angebote und Aktionen: Scrollytelling
   - Kapitel-Leiste: bleibt unter der Kopfzeile stehen, markiert das aktuelle Kapitel, Balken zeigt den Lesefortschritt
   - Geschichte: das Bild bleibt stehen, der aktive Schritt ist voll sichtbar, die übrigen blass; das Bild wechselt mit dem Abschnitt
   - Zitat: die Buchstaben füllen sich beim Scrollen nacheinander von leicht transparent zu voll */
KJG.beiBereit(() => {
  "use strict";
  const KAPITEL_LINIE = 0.35;   // ein Kapitel ist aktiv, sobald seine Oberkante über 35 % der Fensterhöhe liegt
  const SCHRITT_LINIE = 0.6;    // ein Schritt ist aktiv, sobald seine Oberkante über 60 % der Fensterhöhe liegt
  const BUCHSTABE_BLASS = 0.2;  // Deckkraft eines noch nicht „gelesenen“ Buchstabens
  const ZITAT_START = 0.85, ZITAT_ENDE = 0.3;   // die Buchstaben füllen sich, während das Zitat von 85 % bis 30 % wandert
  const HANDY_SCHRITT_LINIE = 0.8, HANDY_ZITAT_START = 0.95, HANDY_ZITAT_ENDE = 0.5;

  const leiste = document.querySelector(".kapitel");
  if (!leiste) return;
  const links = [...leiste.querySelectorAll("a")];
  const balken = leiste.querySelector(".kapitel-balken i");
  const kapitel = [...document.querySelectorAll("[data-kapitel]")];

  const story = document.querySelector(".story");
  const schritte = story ? [...story.querySelectorAll(".story-schritt")] : [];
  const bilder = story ? [...story.querySelectorAll(".story-b")] : [];
  const zaehler = story && story.querySelector(".story-zahl");
  if (story) story.classList.add("aktiv");

  // Zitat in Buchstaben zerlegen. Vorleseprogramme bekommen den Text am Stück, die Buchstaben-Spans sind für sie verborgen.
  const buchstaben = [];
  const zitat = document.querySelector(".ablauf-zitat blockquote p");
  if (zitat && !KJG.ruhig) {
    const voll = document.createElement("span");
    voll.className = "sr-only";
    voll.textContent = zitat.textContent.replace(/\s+/g, " ").trim();
    const sichtbar = document.createElement("span");
    sichtbar.setAttribute("aria-hidden", "true");
    zitat.textContent.replace(/\s+/g, " ").trim().split(" ").forEach((wort, i) => {
      if (i) sichtbar.append(" ");
      const wortSpan = document.createElement("span");
      wortSpan.className = "zitat-wort";   // ein Wort bricht nie mitten im Wort um
      for (const zeichen of wort) {
        const b = document.createElement("span");
        b.className = "zitat-b";
        b.textContent = zeichen;
        buchstaben.push(b);
        wortSpan.append(b);
      }
      sichtbar.append(wortSpan);
    });
    zitat.replaceChildren(voll, sichtbar);
  }

  let kapitelZuletzt = -1, schrittZuletzt = -1;
  const letzterUeber = (elemente, linie) => {
    let index = 0;
    elemente.forEach((el, i) => { if (el.getBoundingClientRect().top < linie) index = i; });
    return index;
  };

  KJG.beimScrollen(() => {
    const vh = window.innerHeight;
    const seite = document.documentElement;
    balken.style.width = (KJG.klemmen(window.scrollY / Math.max(1, seite.scrollHeight - vh)) * 100).toFixed(1) + "%";

    const k = letzterUeber(kapitel, vh * KAPITEL_LINIE);
    if (k !== kapitelZuletzt) {
      kapitelZuletzt = k;
      const ziel = "#" + kapitel[k].id;
      links.forEach((a) => {
        const aktiv = a.getAttribute("href") === ziel;
        if (aktiv) a.setAttribute("aria-current", "step"); else a.removeAttribute("aria-current");
        if (aktiv) leiste.querySelector(".kapitel-in").scrollTo({ left: a.offsetLeft - 24, behavior: KJG.ruhig ? "auto" : "smooth" });
      });
    }

    if (schritte.length) {
      const s = letzterUeber(schritte, vh * (KJG.handy() ? HANDY_SCHRITT_LINIE : SCHRITT_LINIE));
      if (s !== schrittZuletzt) {
        schrittZuletzt = s;
        schritte.forEach((el, i) => el.classList.toggle("an", i === s));
        const bild = Number(schritte[s].dataset.bild);
        bilder.forEach((el, i) => el.classList.toggle("an", i === bild));
        if (zaehler) zaehler.textContent = `${s + 1} / ${schritte.length}`;
      }
    }

    if (buchstaben.length) {
      const r = zitat.getBoundingClientRect();
      const [zs, ze] = KJG.handy() ? [HANDY_ZITAT_START, HANDY_ZITAT_ENDE] : [ZITAT_START, ZITAT_ENDE];
      const gelesen = KJG.klemmen((vh * zs - r.top) / (vh * (zs - ze))) * buchstaben.length;
      buchstaben.forEach((b, i) => {
        const d = BUCHSTABE_BLASS + (1 - BUCHSTABE_BLASS) * KJG.klemmen(gelesen - i);
        b.style.opacity = d >= 1 ? "" : d.toFixed(3);
      });
    }
  });
});
