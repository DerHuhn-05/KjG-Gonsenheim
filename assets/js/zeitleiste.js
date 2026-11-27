/* Zela 2027: Termine als senkrechte Zeitleiste (Scrollytelling)
   - die Linie in der Mitte (mobil links) füllt sich beim Scrollen
   - jede Station erscheint (Text + Foto), sobald sie die Bildschirmmitte erreicht; ihr Punkt füllt sich
   - ein großes, blasses Stichwort unten rechts zeigt immer die aktuelle Station */
KJG.beiBereit(() => {
  "use strict";
  const LINIE_BIS = 0.6;      // die Linie ist bis 60 % der Fensterhöhe gefüllt
  const AKTIV_BIS = 0.65;     // eine Station gilt als erreicht, wenn ihre Mitte über 65 % der Fensterhöhe liegt

  const leiste = document.querySelector(".zeitleiste");
  if (!leiste) return;
  const liste = leiste.querySelector(".zl-liste");
  const fuellung = leiste.querySelector(".zl-achse i");
  const stichwort = leiste.querySelector(".zl-gross");
  const stationen = [...leiste.querySelectorAll(".zl-eintrag")];
  let zuletzt = "";

  KJG.beimScrollen(() => {
    const vh = window.innerHeight;
    const rahmen = liste.getBoundingClientRect();
    const fortschritt = KJG.klemmen((vh * LINIE_BIS - rahmen.top) / rahmen.height);
    let aktuell = -1;
    stationen.forEach((station, i) => {
      const r = station.getBoundingClientRect();
      const erreicht = r.top + r.height / 2 < vh * AKTIV_BIS;
      station.classList.toggle("an", erreicht);
      if (erreicht) aktuell = i;
    });
    const zeigen = aktuell >= 0 && rahmen.bottom > vh * LINIE_BIS;
    const stand = `${fortschritt.toFixed(3)}|${aktuell}|${zeigen}`;
    if (stand === zuletzt) return;   // nur schreiben, wenn sich etwas geändert hat
    zuletzt = stand;
    fuellung.style.transform = `scaleY(${fortschritt.toFixed(4)})`;
    stichwort.classList.toggle("zeigen", zeigen);
    if (aktuell >= 0) stichwort.textContent = stationen[aktuell].dataset.stichwort;
  });
});
