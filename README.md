# KjG Mainz-Gonsenheim – Website

Statische Website (HTML/CSS, kein Build-Schritt) nach den Figma-Entwürfen.

## Seiten
| Datei | Inhalt |
|---|---|
| `index.html` | Startseite mit Video im Header |
| `events.html` | Unsere Events (Übersicht mit 72h-Aktion, MoWo, Trainee-Wochenende) |
| `mowo.html` | Monsterwochenende |
| `72h-aktion.html` | 72-Stunden-Aktion |
| `trainee-wochenende.html` | Trainee-Wochenende |
| `aktion.html` | Vorlage für weitere Aktionen |
| `faq.html` | Häufig gestellte Fragen (aufklappbar) |
| `impressum.html`, `datenschutz.html` | Muster mit gelb markierten Platzhaltern – vor Veröffentlichung ausfüllen und prüfen lassen |
| `team.html`, `gruppenstunde.html` | Platzhalter |

## Bilder & Video
Alle Bilder kommen in den Ordner [`bilder/`](bilder/). Jede Bildfläche lädt automatisch die Datei
`<seite>-<nummer>.jpg` (auch `.jpeg`, `.png`, `.webp`), z. B. `mowo-2.jpg`. Fehlt ein Bild, zeigt die Seite
dort eine graue Fläche mit dem erwarteten Dateinamen. Die vollständige Liste steht in [`bilder/README.md`](bilder/README.md).

Das Startseiten-Video heißt `bilder/startseite-video.mp4`.

## Schriften
Inter und Fira Sans liegen lokal in `assets/fonts/` – es wird keine Verbindung zu Google Fonts aufgebaut.

## Veröffentlichen
Settings → Pages → Source: „Deploy from a branch“, Branch `main`, Ordner `/ (root)`.
