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
| `72h-aktion.html` · `aktion.html` | Detailseiten Soziale Aktionen |
| `team.html` | Unser Team |
| `wer-sind-wir.html` | Wer sind wir? |
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
In `mowo.html`, `trainee-wochenende.html`, `72h-aktion.html` und `aktion.html` nach `ANMELDE-LINK` suchen und `#ANMELDE-LINK-HIER-EINTRAGEN` durch die Adresse der Anmeldung ersetzen.
