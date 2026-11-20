# KjG Mainz-Gonsenheim – Website

Statische Website (HTML/CSS, kein Build-Schritt) nach den Figma-Entwürfen.

## Seiten
| Datei | Inhalt |
|---|---|
| `events.html` | Unsere Events (Übersicht mit 72h-Aktion, MoWo, Trainee-Wochenende) |
| `mowo.html` | Monsterwochenende |
| `72h-aktion.html` | 72-Stunden-Aktion |
| `trainee-wochenende.html` | Trainee-Wochenende |
| `aktion.html` | Vorlage für weitere Aktionen |
| `faq.html` | Häufig gestellte Fragen (aufklappbar) |
| `team.html`, `gruppenstunde.html`, `impressum.html`, `datenschutz.html` | Platzhalter |

`index.html` leitet auf `events.html` weiter.

## Bilder einsetzen
Die grauen Flächen sind Bild-Platzhalter (`<div class="media">`). Bild einfügen z.B. mit
`style="background-image:url('assets/img/mowo.jpg')"`.

## Veröffentlichen
Settings → Pages → Source: „Deploy from a branch“, Branch `main`, Ordner `/ (root)`.
