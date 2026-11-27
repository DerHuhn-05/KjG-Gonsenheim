import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from inhalt import *
from bausteine import *
import sys, os, re
root = sys.argv[1]
REG = []

def bildname(n, where):
    name = f"zela-{n}"
    REG.append((name + ".jpg", where))
    return name

def img(n, where, cls="media", eager=False):
    return tag_bild(bildname(n, where), where, cls, eager)

DOWN = '<img class="down" src="icons/pfeil-unten.svg" width="14" height="16" alt="">'
RIGHT = '<img class="right" src="icons/pfeil-rechts.svg" width="22" height="12" alt="">'
RIGHT_W = '<img class="right" src="icons/pfeil-rechts-weiss.svg" width="22" height="12" alt="">'
SMALL_W = '<img class="pfeil" src="icons/pfeil-rechts-klein.svg" width="14" height="10" alt="">'
CHEV = '<img class="chev" src="icons/chevron-unten.svg" width="22" height="13" alt="">'
MENU = '<span class="bar1"></span><span class="bar2"></span>'   # wird per CSS zum X animiert

def lines(*ls):
    """Zeilenumbrüche exakt wie im Entwurf (auf dem Handy ausgeblendet)."""
    return "<br> ".join(ls)

def feature(id_, title, paras, n, reverse=False, cls=""):
    inhalt = f"<h2>{title}</h2>\n" + "\n".join(f"<p>{lines(*p)}</p>" for p in paras)
    alt = f"Bild {re.sub('<[^>]+>','',title)}"
    klasse = "z-feature" + (" reverse" if reverse else "") + (f" {cls}" if cls else "")
    if n is None:      # Abschnitt ohne Bild: Überschrift und Text stehen als Gruppe mittig (Überschrift linksbündig in der Gruppe)
        return tag_abschnitt(inhalt, klasse + " solo", id=id_)
    return tag_abschnitt(inhalt, klasse, bildname(n, alt), alt, id=id_)

def quote(side, n, q):
    d, nm, r = q[0], q[1], q[2]
    alt = "Foto " + nm.rstrip(",")
    return tag_zitat(f"<p>{quote_p(d)}</p>\n<strong>{nm}</strong><span>{r}</span>", side, bildname(n, alt), alt)

PROGRAMM = [["Außerdem wird es im Vorfeld des Zeltlagers ein", "Vortreffen geben. Hier haben die Kinder die Möglichkeit,",
             "ihre Gruppenleiter kennenzulernen und erste Kontakte", "zu knüpfen. Eine separate Einladung mit allen weiteren",
             "Informationen zum Vortreffen wird rechtzeitig folgen."],
            ["Wir freuen uns auf viele bekannte und neue Gesichter", "und auf ein unvergessliches Zeltlager 2027 mit jeder",
             "Menge guter Laune, tollen Aktionen und schönen", "gemeinsamen Erinnerungen!"]]
ZUSAMMEN = [["Freunde mitbringen das lohnt sich! Dieses Jahr gibt es", "eine besondere Aktion. Wer einen Freund oder eine",
             "Freundin mitbringt, der oder die bisher noch nie bei", "einem unserr Zeltlager dabei war, der kann sich sparrt",
             "sich 20&nbsp;€ auf den Teilnahmebeitrag!"],
            ["In der digitalen Anmeldung gibt es dafür ein", "entsprechendes Feld, in dem der Name des",
             "mitgebrachten Freundes bzw. der Freundin angegeben", "werden kann."]]
VIERZEHN = [["Alle Kinder, die zum Zeitpunkt des Zeltlagers bereits 14", "Jahre alt sind, haben die Möglichkeit, als sogenannte",
             "„Latees“ mitzufahren. Das bedeutet, dass sie", "gemeinsam mit dem Fahrrad zum Zeltplatz fahren und",
             "so auf eine etwas andere Art ins Zeltlager starten.", "Genauere Informationen und weitere Details dazu",
             "werden wir zu einem späteren Zeitpunkt bekannt", "geben."]]

JUMP = [("Alle Infos", "#termine"), ("Programm", "#programm"), ("Zusammen lohnt’s sich", "#zusammen"), ("Vortreffen", "#vortreffen"), ("Schon 14 Jahre alt?", "#vierzehn")]
jump = tag_sprung([(h, t) for t, h in JUMP], "zela")

# Zeitleiste: je Station ein rundes Foto (bilder/zela-zeit-N.jpg), das beim Scrollen mit der Station mitwandert
ZEIT_ALT = ["Foto Zeitraum", "Foto Zeltplatz", "Foto Alter", "Foto Geschwister", "Foto Anmeldung"]
ZEIT_EN = ["Photo: dates", "Photo: campsite", "Photo: age", "Photo: siblings", "Photo: registration"]
for _a, _e in zip(ZEIT_ALT, ZEIT_EN):
    reg(_a, _e)
ZB = [tag_bild(bildname(f"zeit-{k + 1}", alt), alt, "media") for k, alt in enumerate(ZEIT_ALT)]

hero_img = img(1, "Header-Bild Zeltlager", eager=True)

html = f'''<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Zela 2027 – KjG Mainz-Gonsenheim</title>
  <meta name="description" content="Zeltlager 2027 der KjG Mainz-Gonsenheim: 24. Juni bis 04. August 2027 in Faulbach-Breitenbrunn, für Kinder von 9 bis 14 Jahren. Anmeldeschluss 01.05.2027.">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/fonts/inter-variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="assets/css/style.css">
  <script src="assets/js/bilder.js"></script>
  <script src="assets/js/module.js"></script>
  <script src="assets/js/main.js" defer></script>
</head>
<body class="page-zela nav-alt">
{tag_header("zela-2027.html", "zela-2027.html")}

<main>
<section class="z-hero">
  <div class="left">
    {hero_img}
  </div>
  <div class="right">
    <h1>Zela 2027</h1>
    <p>{lines("Wir freuen uns schon jetzt auf coole", "Zela-Tage voller Spiel, Spaß und", "gemeinsamer Erlebnisse in der Natur", "und tollen Lagerfeuer-Abenden mit", "Gitarre!")}</p>
    <!-- Anmeldung Zela 2027: Google-Formular (gleicher Link wie auf der Startseite), öffnet in neuem Tab -->
    <a class="btn" id="anmeldung" href="https://docs.google.com/forms/d/e/1FAIpQLSejTLefFFM-BG9ZFrGpo5q8XqPuarYLBDbKB7oETzbo2v_AqQ/viewform" target="_blank" rel="noopener">Anmeldung</a>
  </div>
</section>

{jump}

<section class="z-termine zeitleiste" id="termine">
  <div class="zl-kopf"><div class="inner"><h2>Alle Infos auf einen Blick</h2></div></div>
  <div class="zl">
    <div class="zl-achse" aria-hidden="true"><i></i></div>
    <ol class="zl-liste">
      <li class="zl-eintrag" data-stichwort="2027"><span class="zl-punkt"></span><div class="zl-text"><img src="icons/zela-zeitraum.svg" width="56" height="56" alt=""><p><span class="sr-only">Zeitraum: </span>24. Juni bis<br>04. August 2027</p></div><div class="zl-bild">{ZB[0]}</div></li>
      <li class="zl-eintrag" data-stichwort="Faulbach"><span class="zl-punkt"></span><div class="zl-text"><img src="icons/zela-zeltplatz.svg" width="56" height="56" alt=""><p><span class="sr-only">Zeltplatz: </span>Faulbach-<br>Breitenbrunn</p></div><div class="zl-bild">{ZB[1]}</div></li>
      <li class="zl-eintrag" data-stichwort="9–14"><span class="zl-punkt"></span><div class="zl-text"><img src="icons/zela-alter.svg" width="56" height="56" alt=""><p><span class="sr-only">Alter: </span>Kinder<br>von 9 bis 14 Jahre</p></div><div class="zl-bild">{ZB[2]}</div></li>
      <li class="zl-eintrag" data-stichwort="ab 8"><span class="zl-punkt"></span><div class="zl-text"><img src="icons/zela-geschwister.svg" width="56" height="56" alt=""><p><span class="sr-only">Besonderheit: </span>ab 8 Jahren<br>mit älteren Geschwistern</p></div><div class="zl-bild">{ZB[3]}</div></li>
      <li class="zl-eintrag" data-stichwort="01.05."><span class="zl-punkt"></span><div class="zl-text"><img src="icons/zela-anmeldeschluss.svg" width="56" height="56" alt=""><p>Anmeldeschluss<br>01.05.2027</p></div><div class="zl-bild">{ZB[4]}</div></li>
    </ol>
  </div>
  <div class="zl-gross" aria-hidden="true"></div>
</section>

<div class="z-content">
{feature("programm", "Programm", PROGRAMM, 2, reverse=True, cls="tight h143")}

{quote("circle-right", 3, QUOTE_ZELA[0])}

{feature("zusammen", "Zusammen lohnt’s sich!", ZUSAMMEN, 4, reverse=True, cls="h128")}

{feature("vortreffen", "Vortreffen", PROGRAMM, None, reverse=True, cls="tight h143")}

{quote("circle-right", 6, QUOTE_ZELA[1])}

{feature("vierzehn", "Du bist schon 14 Jahre?", VIERZEHN, 7, reverse=True, cls="h157")}
</div>
</main>

{TAG_FOOTER}
</body>
</html>
'''
open(os.path.join(root, "zela-2027.html"), "w").write(html)

# Bilder-Liste ergänzen
p = os.path.join(root, "bilder", "README.md")
s = open(p).read()
vor, _, rest = s.partition("\n## Zela 2027")
danach = ("\n## " + rest.split("\n## ", 1)[1]) if "\n## " in rest else ""   # folgende Abschnitte behalten
s = vor.rstrip("\n") + "\n\n## Zela 2027 (zela-2027.html)\n\n| Datei | Wo auf der Seite |\n|---|---|\n" + "\n".join(f"| `{n}` | {w} |" for n, w in REG) + "\n" + danach
open(p, "w").write(s)
print("ok", len(REG))
