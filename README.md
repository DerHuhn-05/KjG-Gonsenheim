# KjG Mainz-Gonsenheim – Website

Startseite als statisches HTML/CSS (kein Build-Schritt), 1:1 nach dem Figma-Entwurf „Startseite“.

**Raster:** 1440 px breit · 12 Spalten à 85 px · 20 px Spaltenabstand · 100 px Außenrand
(Spalte *n* beginnt bei x = 100 + (n − 1) · 105 px).

## Seiten
| Datei | Seite |
|---|---|
| `index.html` | Startseite |
| `zela-2027.html` | Zela 2027 |
| `events.html` | Unsere Events (Übersicht) |
| `gruppenstunde.html` · `mowo.html` · `trainee-wochenende.html` | Event-Detailseiten |
| `soziale-aktionen.html` | Soziale Aktionen (Übersicht) |
| `72h-aktion.html` · `aktion.html` (Hilfe im Stadtteil) · `klamottenspende.html` | Detailseiten Soziale Aktionen |
| `team.html` | Unser Team |
| `ueber-uns.html` | Über uns (früher „Wer sind wir?“), mit Standort-Karte |
| `faq.html` | Häufig gestellte Fragen |
| `impressum.html` · `datenschutz.html` | Impressum und Datenschutz (Muster mit gelb markierten Platzhaltern) |

## Sprachen
Deutsch liegt im Hauptordner, Englisch in `en/` (gleiche Dateinamen). Der DE | EN-Schalter oben rechts
wechselt zur selben Seite in der anderen Sprache. Englische Seiten neu erzeugen: siehe
[`tools/i18n/README.md`](tools/i18n/README.md).

## Ordner
| Pfad | Inhalt |
|---|---|
| `assets/css/style.css` | Grundlayout, Kopf/Footer, Startseite, Zela 2027 |
| `assets/css/unterseiten.css` | alle übrigen Seiten |
| `assets/fonts/` | Inter (normal und kursiv) – eine Schrift für die ganze Website, lokal, keine Verbindung zu Google |
| `bilder/` | Bilder und Header-Video, siehe [`bilder/README.md`](bilder/README.md) |
| `icons/` | Alle Icons als SVG, siehe [`icons/README.md`](icons/README.md) |

## Veröffentlichen (Cloudflare Pages)
Framework preset: **None** · Build command: **leer** · Build output directory: **`/`**

## Anmelde-Links
Zela 2027 (Startseite und `zela-2027.html`) führt auf das Google-Formular und öffnet es in einem neuen Tab.
In `72h-aktion.html`, `aktion.html` und `klamottenspende.html` nach `ANMELDE-LINK` suchen und `#ANMELDE-LINK-HIER-EINTRAGEN` durch die Adresse der Anmeldung ersetzen.


## Standort-Karte (Über uns)

Die Karte auf `ueber-uns.html` ist ein reines SVG (bleibt auf jeder Zoomstufe scharf): Hintergrund Petrol, Straßen Weiß, Gewässer in der Akzentfarbe (Koralle `#F05B83`), dazu ein Pin mit dem KjG-Logo in Petrol.
Sie funktioniert als Scrollytelling: Sobald 80 % der Karte sichtbar sind, beginnt der Zoom von Mainz nach Gonsenheim und folgt dem Scrollen (vor und zurück); die Karte bleibt dabei stehen. Erst wenn ganz herangezoomt ist, „ploppt“ der Pin auf; beim Weiterscrollen fährt die waagrechte Linie vom Pin aus und danach der Kasten „Wo Sie uns finden“ (Oberkante auf Höhe der Linie) nach unten aus. Die groben und mittleren Straßen sind immer sichtbar, nur die allerkleinsten werden scrollgesteuert ergänzt (Steuerung in `assets/js/karte.js`).
Die eigenständige Datei liegt unter `assets/img/karte-mainz.svg`. Position des Pins (Karteneinheiten): `794, 666` – steht in `karte.js` (`PIN_X`, `PIN_Y`) und im Pin-Element der Seite.
Kartendaten: © OpenStreetMap-Mitwirkende, ODbL (steht auf der Karte).


## Aufbau: wiederkehrende Bausteine als Module

Header, Footer, Bildflächen, Sprungmarken, Kacheln, Karten, Text-Bild-Abschnitte, Personen, Zitate, FAQ-Einträge und Seitenköpfe
stehen **einmal** in `assets/js/module.js`. In den Seiten genügt ein kurzer Tag, z. B.

```html
<kjg-header seite="team.html" aktiv="team.html"></kjg-header>
<kjg-kachel klasse="tile" id="zela" href="zela-2027.html" link="genauere infos" bild="startseite-1" bild-alt="Bild Zeltlager 2027">
  <h2>Zela 2027</h2>
  <p>Auch in diesem Jahr veranstalten wir ein Zeltlager …</p>
</kjg-kachel>
<kjg-footer></kjg-footer>
```

Beim Laden ersetzt `module.js` jeden Tag durch das fertige Markup (identisch zu handgeschriebenem HTML, CSS und die übrigen Skripte bleiben unverändert).
Texte einer Seite bleiben als Kinder der Tags im HTML, Texte, die in jedem Modul gleich sind (Menü, Footer, „genauere infos“ …), stehen
in `module.js` in Deutsch und Englisch. Alle Attribute sind im Kopf von `module.js` dokumentiert.
Menüpunkte, Footer-Links, Instagram-/Facebook-/Google-Maps-Adresse ändert man dort an **einer** Stelle für alle Seiten.
Ohne JavaScript bleibt der Seiteninhalt lesbar, Header und Footer fehlen dann.

### Seiten neu erzeugen

Die Seiten (`*.html` und `en/*.html`) werden aus `tools/build/` erzeugt (Texte in `inhalt.py`, Seitenaufbau in `gen*.py`, englische Fassung über `tools/i18n/`):

```bash
sh tools/build/bauen.sh
```

Neue deutsche Texte brauchen eine englische Übersetzung (`inhalt.py` bzw. `tools/i18n/i18n_en.py`), sonst bricht der Bau mit einer Liste der fehlenden Texte ab.
Die Kartenquelle für `tools/build/karte/karte.py` (OpenStreetMap-Auszug) liegt nicht im Repository; fertig aufbereitet ist die Karte in `tools/build/karte/karte_body.svgpart`.

## Team-Seite: Lagerfeuer-Scrollytelling

Die Team-Seite zeigt die Personen im Kreis um ein Lagerfeuer (Idee aus dem Artefakt „Das Lagerfeuer“, im Stil der Website).
- Markup: `feuer_html()` in `tools/build/gensub.py`; Texte, Stichworte und Lieblingslieder je Person: `TEAM`, `FEUER_PERSON` in `tools/build/inhalt.py` (neue Person = neuer Eintrag in beiden Listen und in `GRUPPEN`/`GRUPPE` in `lagerfeuer.js`).
- Darstellung: `assets/css/lagerfeuer.css`, Steuerung: `assets/js/lagerfeuer.js` (nur auf der Team-Seite geladen).
- Fotos: `team-2.jpg` … `team-9.jpg` (Reihenfolge: Lena, Jonas, Sophie, Max, Hanna, Felix, Anna, Thomas).

## Zela-Seite: Zeitleiste „Alle Infos auf einen Blick“

Senkrechte Zeitleiste (Scrollytelling) nach dem Vorbild des Artefakts „Team – Zeitleiste“, im Stil der Website: Petrol-Fläche, weiße Linie in der Mitte (mobil links), die sich beim Scrollen füllt; die Stationen wechseln links/rechts (Text mit rosa Icon | Foto), unten rechts steht das Stichwort der aktuellen Station groß und blass.
- Markup: `genzela.py` (Klasse `zeitleiste`, je Station `data-stichwort`), Stil: Ende von `style.css`, Steuerung: `assets/js/zeitleiste.js`.
- Fotos: `zela-zeit-1.jpg` … `zela-zeit-5.jpg`.

## Skripte (assets/js)

Jede Funktion liegt in einer eigenen kleinen Datei. Welche eine Seite lädt, steht in `skripte()` (`tools/build/bausteine.py`).

| Datei | Aufgabe | Seiten |
|---|---|---|
| `bilder.js` | Platzhalter, solange ein Bild fehlt | alle |
| `module.js` | ersetzt die Modul-Tags (`kjg-header`, `kjg-kachel` …) durch fertiges Markup | alle |
| `gemeinsam.js` | gemeinsame Helfer (`KJG.klemmen`, `KJG.kopfHoehe`, eine gemeinsame Scroll-Schleife …) – immer zuerst | alle |
| `kopfzeile.js` | Kopfzeile wird beim Scrollen Petrol, Hamburger-Menü | alle |
| `einflug.js` | Einflug-Animationen beim Scrollen | alle |
| `kennzahlen.js` | Zahlen zählen hoch | alle |
| `video.js`, `slider.js` | Video im Hero, Slider (mobil) | Startseite |
| `zeitleiste.js` | Zeitleiste „Alle Infos auf einen Blick“ | Zela 2027 |
| `karte.js` | Karten-Scrollytelling | Über uns |
| `lagerfeuer.js` | Lagerfeuer-Scrollytelling | Team |

Einstellbare Werte (Abstände, Dauern, Anteile) stehen jeweils als benannte Konstanten oben in der Datei.

## Automatische Prüfung

`npm run pruefen` (bzw. `node tools/test/pruefen.js`) öffnet alle Seiten (deutsch und englisch) bei Desktop- und Handy-Breite im Browser und prüft: keine JavaScript-Fehler, kein seitlicher Überstand, alle Sprungmarken und internen Links haben ein Ziel, Kopfzeile, Menü, Slider, Karte, Zeitleiste und Lagerfeuer funktionieren.

Auf GitHub läuft das bei jedem Push automatisch (`.github/workflows/pruefen.yml`). Vorher wird die Seite neu gebaut: Ändert das Bauen etwas, wurde eine HTML-Datei von Hand bearbeitet oder das Neubauen vergessen – dann schlägt die Prüfung fehl. Ergebnis: auf GitHub unter „Actions“ (grüner Haken bzw. rotes Kreuz am Commit).

Einmalig lokal einrichten (nur für die Prüfung nötig): `npm ci` und `npx playwright install chromium`.
