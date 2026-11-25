import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from inhalt import *
from bausteine import *
root = sys.argv[1]
REG = []

def bildname(n, where):
    name = f"startseite-{n}"
    REG.append((name + ".jpg", where))
    return name

def img(n, where, cls="media"):
    return tag_bild(bildname(n, where), where, cls)

DOWN = '<img class="down" src="icons/pfeil-unten.svg" width="14" height="16" alt="">'
RIGHT = '<img class="right" src="icons/pfeil-rechts.svg" width="22" height="12" alt="">'
RIGHT_W = '<img class="right" src="icons/pfeil-rechts-weiss.svg" width="22" height="12" alt="">'
SMALL_W = '<img class="pfeil" src="icons/pfeil-rechts-klein-weiss.svg" width="14" height="10" alt="">'
CHEV = '<img class="chev" src="icons/chevron-unten.svg" width="22" height="13" alt="">'
MENU = '<span class="bar1"></span><span class="bar2"></span>'   # wird per CSS zum X animiert

def cards(start, titles, links):
    out = []
    for k, t_ in enumerate(titles):
        alt = f"Bild {t_}"
        reg(alt, "Image: " + PAIRS[key(normalize(t_))])
        out.append(tag_karte(f"<h3>{t_}</h3>{card_text(t_)}", links[k], bildname(start + k, alt), alt, LINK_MEHR))
    return "\n".join(out)

JUMP = [  # (Text, Ziel, Position des Pfeils links in px im 1440er-Raster, Zeile) – Texte = tatsächliche Kapitelüberschriften
    ("Zela 2027", "#zela", 310, 1), ("Unser Angebot für euch", "#events", 503, 1), ("Über uns", "#ueber-uns", 846, 1),
    ("Unser Team", "#team", 415, 2), ("Soziale Aktionen", "#soziale-aktionen", 640, 2), ("Häufig gestellte Fragen", "#faq", 939, 2),
]
jump = tag_sprung([(h, t, x - 100, r) for t, h, x, r in JUMP], "start")

hero_poster = "bilder/startseite-video-poster.jpg"
REG.insert(0, ("startseite-video.mp4", "Video im Header (MP4, ohne Ton, möglichst < 10 MB) – Dateiname genau so, inkl. .mp4"))

faq = faq_html(3)

HEADER = tag_header("index.html")
html = f'''<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>KjG Mainz-Gonsenheim – Katholische junge Gemeinde</title>
  <meta name="description" content="KjG Mainz-Gonsenheim – Zeltlager, Gruppenstunden, Monsterwochenende und soziale Aktionen für Kinder und Jugendliche in Mainz-Gonsenheim.">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/fonts/inter-variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="assets/css/style.css">
  <script src="assets/js/bilder.js"></script>
  <script src="assets/js/module.js"></script>
  <script src="assets/js/main.js" defer></script>
</head>
<body>
{HEADER}

<main>
<section class="hero">
  <span class="ph-label">Video: bilder/startseite-video.mp4</span>
  <video autoplay muted loop playsinline preload="auto" aria-hidden="true">
    <source src="bilder/startseite-video.mp4" type="video/mp4">
  </video>
  <button class="video-toggle" type="button" aria-label="Video pausieren"><img src="icons/video-pause.svg" width="20" height="20" alt=""></button>
  <div class="hero-content">
    <h1>KjG-Gonsenheim</h1>
    <a class="hero-btn" href="https://docs.google.com/forms/d/e/1FAIpQLSejTLefFFM-BG9ZFrGpo5q8XqPuarYLBDbKB7oETzbo2v_AqQ/viewform" target="_blank" rel="noopener">Anmeldung Zela 2027</a>
  </div>
</section>

{jump}

{tag_kachel(f"<h2>Zela 2027</h2>\n<p>Auch in diesem Jahr veranstalten wir ein Zeltlager<br> bei dem jeder mitfahren kann!</p>", "tile", "zela-2027.html", bildname(1, "Bild Zeltlager 2027"), "Bild Zeltlager 2027", id="zela")}

<section class="cards-section events" id="events">
  <div class="wrap">
    <h2>Unser Angebot für euch!</h2>
    <div class="cards">
{cards(2, ["Gruppenstunde", "Monster Wochenende", "Trainee Wochenende"], ["gruppenstunde.html", "mowo.html", "trainee-wochenende.html"])}
    </div>
  </div>
</section>

<section class="about" id="ueber-uns">
  <div class="wrap">
    <h2>Über uns</h2>
    <p>Wer im Mainzer Stadtteil Gonsenheim lebt oder mit ihm verbunden ist, kennt<br> die legendären Sommerzeltlager. Jedes Jahr brechen wir zu einem<br> spannenden Abenteuer auf. Neben zahlreichen Gruppenkinderaktionen<br> findet zudem jährlich unser "Monsterwochenende" statt.<br> Doch das ist lange noch nicht alles! Neugierig?</p>
    <a class="more-link" href="ueber-uns.html">{RIGHT_W}<span>{LINK_MEHR}</span></a>
  </div>
</section>

{tag_kachel(f"<h2>Unser Team</h2>\n<p>Wer genau wir sind und welche Aufgaben jeder hat<br> kannst du hier erfahren</p>", "tile reverse", "team.html", bildname(5, "Bild Unser Team"), "Bild Unser Team", id="team")}

<section class="cards-section social" id="soziale-aktionen">
  <div class="wrap">
    <h2>Soziale Aktionen</h2>
    <div class="cards">
{cards(6, ["72 Stunden Aktion", "Hilfe im Stadtteil", "Klamottenspende"], ["72h-aktion.html", "aktion.html", "klamottenspende.html"])}
    </div>
  </div>
</section>

<section class="faq" id="faq">
  <div class="faq-wrap">
    <h2>Häufig gestellte Fragen</h2>
    <div class="faq-list">
{faq}
    </div>
    <a class="faq-more" href="faq.html">{RIGHT}<span>Weiterer Fragen</span></a>
  </div>
</section>
</main>

{TAG_FOOTER}
</body>
</html>
'''
open(os.path.join(root, "index.html"), "w").write(html)

lines = ["# Bilder-Ordner", "",
 "Hier alle Bilder und das Header-Video der Startseite ablegen. Jede Bildfläche lädt automatisch die Datei mit dem passenden Namen.", "",
 "## So geht's", "",
 "1. Bild genau so benennen wie in der Tabelle unten, z. B. `startseite-2.jpg`.",
 "2. Erlaubte Endungen: `.jpg`, `.jpeg`, `.png`, `.webp` (Kleinschreibung).",
 "3. Datei in diesen Ordner `bilder/` hochladen (auf GitHub: *Add file → Upload files*).",
 "4. Solange ein Bild fehlt, zeigt die Seite die graue Fläche aus dem Entwurf.", "",
 "**Tipp:** Bilder auf ca. 1600–2000 px Breite verkleinern (< 500 KB). Das Video als MP4 (H.264) ohne Ton, möglichst unter 10 MB (Cloudflare Pages erlaubt max. 25 MB pro Datei).", "",
 "## Startseite (index.html)", "", "| Datei | Wo auf der Seite |", "|---|---|"]
lines += [f"| `{n}` | {w} |" for n, w in REG]
os.makedirs(os.path.join(root, "bilder"), exist_ok=True)
open(os.path.join(root, "bilder", "README.md"), "w").write("\n".join(lines) + "\n")
print("ok", len(REG))
