/* Kopfzeile: transparent über dem Bild, Petrol sobald gescrollt wird; Hamburger-Menü auf kleinen Bildschirmen */
KJG.beiBereit(() => {
  "use strict";
  const SCHWELLE = 10;   // ab so vielen Pixeln Scrollweg wird die Kopfzeile Petrol
  const header = document.querySelector(".site-header");
  if (!header) return;

  // Text der Menüpunkte merken – das CSS reserviert damit die Breite der fetten Schrift (aktiver Punkt springt nicht)
  document.querySelectorAll(".main-nav a").forEach((a) => { a.dataset.t = a.textContent; });

  const pruefen = () => header.classList.toggle("scrolled", window.scrollY > SCHWELLE || header.classList.contains("open"));
  KJG.beimScrollen(pruefen);

  const knopf = document.querySelector(".menu-toggle");
  if (!knopf) return;
  const abdunkeln = document.createElement("div");   // Klick daneben schließt das Menü
  abdunkeln.className = "menu-backdrop";
  document.body.appendChild(abdunkeln);
  const menue = (offen) => {
    header.classList.toggle("open", offen);
    abdunkeln.classList.toggle("sichtbar", offen);
    document.documentElement.classList.toggle("menu-offen", offen);
    knopf.setAttribute("aria-expanded", String(offen));
    knopf.setAttribute("aria-label", offen ? KJG.T("Menü schließen", "Close menu") : KJG.T("Menü öffnen", "Open menu"));
    pruefen();
  };
  knopf.addEventListener("click", () => menue(!header.classList.contains("open")));
  abdunkeln.addEventListener("click", () => menue(false));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !header.classList.contains("open")) return;
    menue(false);
    knopf.focus();
  });
});
