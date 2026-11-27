/* Zahlenbänder (kjg-zahlen und Team-Seite): Zahlen zählen hoch, sobald das Band sichtbar ist.
   Team-Seite: Höhe des Bands merken, damit das Titelbild es genau an den unteren Bildschirmrand schiebt. */
KJG.beiBereit(() => {
  "use strict";
  const DAUER_MS = 2400;          // Gesamtdauer des Hochzählens
  const LETZTER_SCHRITT_MS = 400; // so lange steht der vorletzte Wert, bevor die Zahl auf den Endwert umschaltet
  const MIN_EXPONENT = 1.5;
  const SICHTBAR_ANTEIL = 0.3;    // startet, wenn 30 % des Bands sichtbar sind

  const teamBand = document.querySelector(".hero-simple.short + .stats");
  if (teamBand) {
    const messen = () => document.documentElement.style.setProperty("--stats-h", teamBand.offsetHeight + "px");
    messen();
    window.addEventListener("resize", messen);
  }

  const zahlen = [...document.querySelectorAll(".stats .num")];
  const band = document.querySelector(".stats");
  if (!zahlen.length || !band || KJG.ruhig || !("IntersectionObserver" in window)) return;

  const sprache = KJG.en ? "en-US" : "de-DE";
  const hochzaehlen = (el) => {
    const text = el.textContent.trim();
    const ziel = parseInt(text.replace(/[.,\s]/g, ""), 10);
    if (!Number.isFinite(ziel)) return;
    const format = new Intl.NumberFormat(sprache, { useGrouping: /[.,]/.test(text) });
    // Verlauf: schnell am Anfang, dann immer langsamer. Der Exponent wird je Zahl so gewählt, dass der Wert „Ziel − 1“
    // genau LETZTER_SCHRITT_MS sichtbar ist (bei 1977 ebenso wie bei 21).
    const exponent = Math.max(MIN_EXPONENT, Math.log(ziel) / Math.log(DAUER_MS / LETZTER_SCHRITT_MS));
    const start = performance.now();
    const schritt = (jetzt) => {
      const t = Math.min(1, (jetzt - start) / DAUER_MS);
      if (t >= 1) { el.textContent = text; return; }
      el.textContent = format.format(Math.floor(ziel * (1 - Math.pow(1 - t, exponent))));
      window.requestAnimationFrame(schritt);
    };
    el.textContent = format.format(0);
    window.requestAnimationFrame(schritt);
  };
  const beobachter = new IntersectionObserver((eintraege) => {
    if (!eintraege.some((e) => e.isIntersecting)) return;
    zahlen.forEach(hochzaehlen);
    beobachter.disconnect();
  }, { threshold: SICHTBAR_ANTEIL });
  beobachter.observe(band);
});
