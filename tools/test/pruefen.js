/* Automatische Prüfung aller Seiten (läuft lokal und in GitHub Actions)
   Aufruf aus dem Projektordner:  node tools/test/pruefen.js
   Prüft je Seite (deutsch + englisch) bei Desktop- und Handy-Breite:
     1. keine JavaScript-Fehler
     2. nichts ragt seitlich über den Bildschirm hinaus
     3. alle Sprungmarken (#…) und internen Links zeigen auf etwas, das es gibt
     4. die interaktiven Teile funktionieren (Kopfzeile, Menü, Slider, Karte, Zeitleiste, Zitate, Lagerfeuer)
   Beendet sich mit Fehlercode 1, sobald etwas nicht stimmt. */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const WURZEL = path.resolve(__dirname, "../..");
const BREITEN = [
  { name: "Desktop", width: 1440, height: 900 },
  { name: "Handy", width: 390, height: 844 },
];
const seiten = [
  ...fs.readdirSync(WURZEL).filter((f) => f.endsWith(".html")),
  ...fs.readdirSync(path.join(WURZEL, "en")).filter((f) => f.endsWith(".html")).map((f) => "en/" + f),
];
const url = (seite) => "file://" + path.join(WURZEL, seite);
const probleme = [];
const melden = (ort, text) => probleme.push(`${ort}: ${text}`);
const warten = (seite, ms) => seite.waitForTimeout(ms);

// innerhalb eines Scrollytellings an eine Stelle scrollen (0 = Anfang, 1 = Ende) und kurz warten
const scrolleZu = async (seite, auswahl, anteil) => {
  await seite.evaluate(([a, t]) => {
    const el = document.querySelector(a);
    const oben = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: oben + t * (el.offsetHeight - window.innerHeight), behavior: "instant" });   // die Seite scrollt sonst weich
  }, [auswahl, anteil]);
  await warten(seite, 400);
};

// Funktionsprüfungen für einzelne Seiten
const FUNKTIONEN = {
  "index.html": async (seite, ort, breite) => {
    await seite.evaluate(() => window.scrollTo({ top: 300, behavior: "instant" }));
    await warten(seite, 200);
    if (!(await seite.$(".site-header.scrolled"))) melden(ort, "Kopfzeile wird beim Scrollen nicht Petrol");
    if (breite.name !== "Handy") return;
    if (!(await seite.$(".slider-nav"))) melden(ort, "Slider-Bedienung fehlt");
    await seite.click(".menu-toggle");
    await warten(seite, 200);
    if (!(await seite.$(".site-header.open"))) melden(ort, "Menü öffnet nicht");
  },
  "ueber-uns.html": async (seite, ort) => {
    await scrolleZu(seite, ".karte-sektion", 1);
    if (!(await seite.$(".karte-sektion.zoom"))) melden(ort, "Karte zoomt nicht heran");
    const sichtbar = await seite.$eval(".karte-label", (k) => getComputedStyle(k).visibility);
    if (sichtbar !== "visible") melden(ort, "Adress-Kasten fährt nicht aus");
  },
  "zela-2027.html": async (seite, ort) => {
    await scrolleZu(seite, ".zeitleiste", 0.5);
    if (!(await seite.$(".zl-eintrag.an"))) melden(ort, "Zeitleiste: keine Station aktiv");
    if (!(await seite.$(".zl-gross.zeigen"))) melden(ort, "Zeitleiste: Stichwort erscheint nicht");
    if (!(await seite.$(".z-quote .wort"))) melden(ort, "Zitate: Wörter werden nicht einzeln gefüllt");
  },
  "team.html": async (seite, ort) => {
    const knoepfe = await seite.$$eval(".feuer-dots button", (b) => b.length);
    if (knoepfe !== 10) melden(ort, `Lagerfeuer: ${knoepfe} statt 10 Knöpfe (2 Pfeile + 8 Personen)`);
    await scrolleZu(seite, ".feuer", 0.5);
    const sichtbar = await seite.$$eval(".feuer-it.an", (k) => k.length);
    if (sichtbar !== 1) melden(ort, `Lagerfeuer: ${sichtbar} statt 1 sichtbarer Kachel`);
  },
};

const seitePruefen = async (tab, seite, breite, jsFehler) => {
  const ort = `${seite} (${breite.name})`;
  await tab.goto(url(seite));
  await warten(tab, 300);

  const ueberstand = await tab.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (ueberstand > 0) melden(ort, `ragt ${ueberstand} px seitlich hinaus`);

  const ohneZiel = await tab.evaluate(() => [...document.querySelectorAll('a[href^="#"]')]
    .map((a) => a.getAttribute("href"))
    .filter((h) => h.length > 1 && !document.getElementById(h.slice(1))));
  if (ohneZiel.length) melden(ort, "Sprungmarken ohne Ziel: " + [...new Set(ohneZiel)].join(", "));

  const interneLinks = await tab.evaluate(() => [...document.querySelectorAll("a[href]")]
    .map((a) => a.getAttribute("href"))
    .filter((h) => /\.html(#.*)?$/.test(h) && !/^https?:/.test(h)));
  for (const link of new Set(interneLinks)) {
    const datei = path.join(WURZEL, path.dirname(seite), link.split("#")[0]);
    if (!fs.existsSync(datei)) melden(ort, "Link ins Leere: " + link);
  }

  const funktion = FUNKTIONEN[path.basename(seite)];
  if (funktion) await funktion(tab, ort, breite);
  if (jsFehler.length) melden(ort, "JavaScript-Fehler: " + jsFehler.join(" | "));
};

(async () => {
  const browser = await chromium.launch();
  for (const breite of BREITEN) {
    const tab = await browser.newPage({ viewport: { width: breite.width, height: breite.height } });
    let jsFehler = [];
    tab.on("pageerror", (e) => jsFehler.push(e.message));
    for (const seite of seiten) {
      jsFehler = [];
      await seitePruefen(tab, seite, breite, jsFehler);
    }
    await tab.close();
  }
  await browser.close();
  if (probleme.length) {
    console.error(`✗ ${probleme.length} Problem(e):\n  ` + probleme.join("\n  "));
    process.exit(1);
  }
  console.log(`✓ ${seiten.length} Seiten × ${BREITEN.length} Breiten geprüft – alles in Ordnung`);
})();
