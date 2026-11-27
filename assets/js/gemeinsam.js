/* =====================================================================
   Gemeinsame Helfer für alle Skripte der Website (wird vor allen anderen Skripten geladen)
   Jede Funktion der Seite liegt in einer eigenen kleinen Datei (kopfzeile.js, slider.js, karte.js …)
   und nutzt von hier nur, was sie braucht.
   ===================================================================== */
window.KJG = (function () {
  "use strict";

  const KOPF_BREAKPOINT = 1273;   // ab dieser Fensterbreite ist die Kopfzeile groß …
  const KOPF_GROSS = 100;         // … und so hoch (px)
  const KOPF_KLEIN = 72;          // darunter (Tablet, Handy)

  const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;   // „Bewegung reduzieren“ im Betriebssystem
  const en = document.documentElement.lang === "en";
  const basis = en ? "../" : "";                // englische Seiten liegen in en/ – Bilder und Icons eine Ebene höher

  const T = (deutsch, englisch) => (en ? englisch : deutsch);
  const klemmen = (wert, min = 0, max = 1) => Math.min(max, Math.max(min, wert));
  const kopfHoehe = () => (window.innerWidth >= KOPF_BREAKPOINT ? KOPF_GROSS : KOPF_KLEIN);

  // Alle scrollgesteuerten Teile teilen sich eine Schleife und laufen höchstens einmal pro Bildschirm-Frame
  const aufgaben = [];
  let geplant = false;
  const ausfuehren = () => { geplant = false; aufgaben.forEach((aufgabe) => aufgabe()); };
  const anstossen = () => { if (!geplant) { geplant = true; window.requestAnimationFrame(ausfuehren); } };
  window.addEventListener("scroll", anstossen, { passive: true });
  window.addEventListener("resize", anstossen);
  window.addEventListener("load", anstossen);
  const beimScrollen = (aufgabe) => { aufgaben.push(aufgabe); aufgabe(); };

  // Safari löst beim Ein-/Ausfahren der Adressleiste „resize“ aus (nur die Höhe ändert sich). Das darf die Seite nicht
  // neu vermessen, sonst springt sie beim Scrollen – deshalb nur bei geänderter Breite.
  const beiBreitenAenderung = (aufgabe) => {
    let breite = window.innerWidth;
    window.addEventListener("resize", () => {
      if (window.innerWidth === breite) return;
      breite = window.innerWidth;
      aufgabe();
    });
  };

  // erst starten, wenn module.js die Modul-Tags ersetzt hat: dessen DOMContentLoaded-Listener ist früher registriert.
  // (Verzögerte Skripte laufen schon im Zustand „interactive“, also noch vor DOMContentLoaded.)
  const beiBereit = (start) => {
    if (document.readyState === "complete") start();
    else document.addEventListener("DOMContentLoaded", start);
  };

  return { ruhig, en, basis, T, klemmen, kopfHoehe, beimScrollen, beiBreitenAenderung, beiBereit };
})();
