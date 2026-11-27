/* Zela 2027, ab „Programm“: Scrollytelling
   - Text und Bild jedes Abschnitts gleiten beim Scrollen von der Seite herein (Bild von seiner Seite, Text von der anderen),
     direkt an die Scrollposition gekoppelt – auch rückwärts
   - in den Zitaten füllen sich die Wörter beim Scrollen Stück für Stück (von blass zu voller Deckkraft)
   Bei „Bewegung reduzieren“ bleibt alles ruhig und voll sichtbar. */
KJG.beiBereit(() => {
  "use strict";
  const bereich = document.querySelector(".z-content");
  if (!bereich || KJG.ruhig) return;

  const VERSATZ_DESKTOP = 160, VERSATZ_HANDY = 56;   // px – so weit außen starten Bild und Text
  const HANDY_BIS = 960;
  const START = 1.0;        // Bewegung beginnt, wenn die Oberkante am unteren Fensterrand ist …
  const ENDE = 0.5;         // … und ist fertig, wenn sie die Fenstermitte erreicht
  const TEXT_ANTEIL = 0.6;  // der Text gleitet etwas kürzer als das Bild
  const WORT_BLASS = 0.18;  // Deckkraft eines noch nicht gelesenen Wortes
  const ZITAT_START = 0.85, ZITAT_ENDE = 0.35;   // Wörter füllen sich, während das Zitat von 85 % bis 35 % der Fensterhöhe wandert

  const auslaufen = (t) => 1 - Math.pow(1 - t, 3);   // schnell los, weich ankommen

  // Abschnitte: Bild kommt von seiner Seite (reverse = Bild links), Text von der anderen
  // (mobil ist .text „display: contents“ – dann bewegen sich Überschrift und Absätze einzeln)
  const abschnitte = [...bereich.querySelectorAll(".z-feature")].map((el) => ({
    el,
    bild: el.querySelector(":scope > .media"),
    textHuelle: el.querySelector(":scope > .text"),
    text: [],
    richtung: el.classList.contains("reverse") ? -1 : 1,
  }));
  const textZuordnen = () => abschnitte.forEach((a) => {
    a.text.forEach((t) => { t.style.transform = ""; t.style.opacity = ""; });
    a.text = getComputedStyle(a.textHuelle).display === "contents" ? [...a.textHuelle.children] : [a.textHuelle];
  });
  textZuordnen();
  KJG.beiBreitenAenderung(textZuordnen);

  // Zitate: Wörter einzeln in <span> packen (Zeilenumbrüche <br> bleiben erhalten)
  const zitate = [...bereich.querySelectorAll(".z-quote")].map((el) => {
    const absatz = el.querySelector("blockquote p");
    const woerter = [];
    [...absatz.childNodes].forEach((knoten) => {
      if (knoten.nodeType !== Node.TEXT_NODE) return;
      const teile = knoten.textContent.split(/(\s+)/);
      const ersatz = document.createDocumentFragment();
      teile.forEach((teil) => {
        if (!teil) return;
        if (/^\s+$/.test(teil)) { ersatz.append(teil); return; }
        const wort = document.createElement("span");
        wort.className = "wort";
        wort.textContent = teil;
        woerter.push(wort);
        ersatz.append(wort);
      });
      knoten.replaceWith(ersatz);
    });
    return { el, bild: el.querySelector(".circle"), woerter, richtung: el.classList.contains("circle-right") ? 1 : -1 };
  });
  bereich.classList.add("seitlich");

  const fortschritt = (rahmen, vh, start, ende) => KJG.klemmen((vh * start - rahmen.top) / (vh * (start - ende)));
  const schieben = (el, x, deckkraft) => {
    if (!el) return;
    el.style.transform = x ? `translate3d(${x.toFixed(1)}px,0,0)` : "";
    el.style.opacity = deckkraft >= 1 ? "" : deckkraft.toFixed(3);
  };

  KJG.beimScrollen(() => {
    const vh = window.innerHeight;
    const versatz = window.innerWidth <= HANDY_BIS ? VERSATZ_HANDY : VERSATZ_DESKTOP;
    abschnitte.forEach(({ el, bild, text, richtung }) => {
      const rahmen = el.getBoundingClientRect();
      if (rahmen.top > vh * 1.2 || rahmen.bottom < -vh * 0.2) return;   // weit weg: nichts tun
      const e = auslaufen(fortschritt(rahmen, vh, START, ENDE));
      schieben(bild, richtung * versatz * (1 - e), e);
      text.forEach((t) => schieben(t, -richtung * versatz * TEXT_ANTEIL * (1 - e), e));
    });
    zitate.forEach(({ el, bild, woerter, richtung }) => {
      const rahmen = el.getBoundingClientRect();
      if (rahmen.top > vh * 1.2 || rahmen.bottom < -vh * 0.2) return;
      const e = auslaufen(fortschritt(rahmen, vh, START, ENDE));
      schieben(bild, richtung * versatz * (1 - e), e);
      const lesen = fortschritt(rahmen, vh, ZITAT_START, ZITAT_ENDE) * woerter.length;   // so viele Wörter sind „gelesen“
      woerter.forEach((wort, i) => {
        const d = WORT_BLASS + (1 - WORT_BLASS) * KJG.klemmen(lesen - i);
        wort.style.opacity = d >= 1 ? "" : d.toFixed(3);
      });
    });
  });
});
