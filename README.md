# KjG Mainz-Gonsenheim – Website

Startseite als statisches HTML/CSS (kein Build-Schritt), 1:1 nach dem Figma-Entwurf „Startseite“.

**Raster:** 1440 px breit · 12 Spalten à 85 px · 20 px Spaltenabstand · 100 px Außenrand
(Spalte *n* beginnt bei x = 100 + (n − 1) · 105 px).

## Dateien
| Pfad | Inhalt |
|---|---|
| `index.html` | Startseite |
| `zela-2027.html` | Zeltlager 2027 (verlinkt von „Anmeldung Zela 2027“ und „genauere infos“ auf der Startseite) |
| `assets/css/style.css` | Styles (Desktop 1:1 nach Entwurf, darunter Tablet/Handy) |
| `assets/fonts/` | Overpass, Inter, Fira Sans – lokal, keine Verbindung zu Google |
| `bilder/` | Bilder und Header-Video, siehe [`bilder/README.md`](bilder/README.md) |
| `icons/` | Alle Icons als SVG (Pfeile, Chevron, Menü), siehe [`icons/README.md`](icons/README.md) |

## Veröffentlichen (Cloudflare Pages)
Framework preset: **None** · Build command: **leer** · Build output directory: **`/`**

## Anmelde-Link Zela 2027
In `zela-2027.html` nach `ANMELDE-LINK` suchen und `#ANMELDE-LINK-HIER-EINTRAGEN` durch die Adresse der Anmeldung ersetzen.
