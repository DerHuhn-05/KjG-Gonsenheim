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
Sie funktioniert als Scrollytelling: Sobald 80 % der Karte sichtbar sind, beginnt der Zoom von Mainz nach Gonsenheim und folgt dem Scrollen (vor und zurück); die Karte bleibt dabei stehen. Erst wenn ganz herangezoomt ist, „ploppt“ der Pin auf; beim Weiterscrollen fährt die waagrechte Linie vom Pin aus und danach der Kasten „Wo Sie uns finden“ (Oberkante auf Höhe der Linie) nach unten aus. Die groben und mittleren Straßen sind immer sichtbar, nur die allerkleinsten werden scrollgesteuert ergänzt (Steuerung in `assets/js/main.js`, Abschnitt „Über uns: Karte“).
Die eigenständige Datei liegt unter `assets/img/karte-mainz.svg`. Position des Pins (Karteneinheiten): `794, 666` – steht in `main.js` (`GX`, `GY`) und im Pin-Element der Seite.
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

Beim Laden ersetzt `module.js` jeden Tag durch das fertige Markup (identisch zu handgeschriebenem HTML, CSS und `main.js` bleiben unverändert).
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
