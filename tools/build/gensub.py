import sys, os, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from inhalt import *
from bausteine import *
root = sys.argv[1]
REG = {}   # seite -> [(datei, wo)]

def bildname(page, n, where):
    name = f"{page}-{n}"
    REG.setdefault(page, []).append((name + ".jpg", where))
    return name

def img(page, n, where, cls="media", eager=False):
    return tag_bild(bildname(page, n, where), where, cls, eager)

DOWN = '<img class="down" src="icons/pfeil-unten.svg" width="14" height="16" alt="">'
SMALL_W = '<img class="pfeil" src="icons/pfeil-rechts-klein-weiss.svg" width="14" height="10" alt="">'
CHEV = '<img class="chev" src="icons/chevron-unten.svg" width="22" height="13" alt="">'
MENU = '<span class="bar1"></span><span class="bar2"></span>'   # wird per CSS zum X animiert

NAV = [("zela-2027.html", "Zela 2027"), ("events.html", "Angebote"), ("team.html", "Team"), ("soziale-aktionen.html", "Soziales"), ("faq.html", "FAQ")]

def br(*lines):
    return "<br> ".join(lines)

FOOTER = TAG_FOOTER

def page(fname, title, active, main, desc="KjG Mainz-Gonsenheim – Katholische junge Gemeinde", extra_css="", extra_js=""):
    html = f'''<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title} – KjG Mainz-Gonsenheim</title>
  <meta name="description" content="{desc}">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/fonts/inter-variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="assets/css/style.css">
  <link rel="stylesheet" href="assets/css/unterseiten.css">
{extra_css}  <script src="assets/js/bilder.js"></script>
  <script src="assets/js/module.js"></script>
  <script src="assets/js/main.js" defer></script>
{extra_js}</head>
<body class="sub nav-alt">
{tag_header(fname, active)}

<main>
{main}
</main>

{FOOTER}
</body>
</html>
'''
    open(os.path.join(root, fname), "w").write(html)

def simple_hero(pg, title, inter=False, tight=False, short=False):
    cls = ' class="inter"' if inter else (' class="tight"' if tight else "")
    alt = f"Header-Bild {title}"
    return tag_hero(f"<h1{cls}>{title}</h1>", "hero-simple" + (" short" if short else ""), bildname(pg, 1, alt), alt)

def jump(items, extra):
    return tag_sprung([(f"#{i}", t) for i, t in items], "unter", extra)

JUMP_TVF = [("teaser", "Teaser"), ("vorbereitungen", "Vorbereitungen"), ("finanzen", "Finanzen")]

FREUNDE = [["Freunde mitbringen das lohnt sich! Dieses Jahr gibt es", "eine besondere Aktion. Wer einen Freund oder eine",
            "Freundin mitbringt, der oder die bisher noch nie bei", "einem unserr Zeltlager dabei war, der kann sich sparrt",
            "sich 20&nbsp;€ auf den Teilnahmebeitrag!"],
           ["In der digitalen Anmeldung gibt es dafür ein", "entsprechendes Feld, in dem der Name des",
            "mitgebrachten Freundes bzw. der Freundin angegeben", "werden kann."]]
PROGRAMM = [["Außerdem wird es im Vorfeld des Zeltlagers ein", "Vortreffen geben. Hier haben die Kinder die Möglichkeit,",
             "ihre Gruppenleiter kennenzulernen und erste Kontakte", "zu knüpfen. Eine separate Einladung mit allen weiteren",
             "Informationen zum Vortreffen wird rechtzeitig folgen."],
            ["Wir freuen uns auf viele bekannte und neue Gesichter", "und auf ein unvergessliches Zeltlager 2027 mit jeder",
             "Menge guter Laune, tollen Aktionen und schönen", "gemeinsamen Erinnerungen!"]]

def feature(pg, n, title, paras, reverse=False, id_=None, cls="", anchors=()):
    assert not anchors
    alt = f"Bild {re.sub('<[^>]+>', '', title)}"
    inhalt = f"<h2>{title}</h2>\n" + "\n".join(f"<p>{br(*p)}</p>" for p in paras)
    klasse = "feature" + (" reverse" if reverse else "") + (f" {cls}" if cls else "")
    return tag_abschnitt(inhalt, klasse, bildname(pg, n, alt), alt, id=id_)

# ===================== Detailseiten (MoWo, 72h, Aktion, Gruppenstunde, Trainee) =====================
KONTAKT = "<kjg-kontakt></kjg-kontakt>"
def detail(fname, h1, plain, wide=False, small=False, anmeldung=False, kontakt=False):
    pg = fname[:-5]
    D = DETAIL[pg]
    cls = ' class="wide"' if wide else ""
    ta, pa = D["a"]; tb, pb = D["b"]
    block1 = feature(pg, 2, ta, absaetze(pa), id_="teaser")
    block2 = feature(pg, 3, tb, absaetze(pb), reverse=True, id_="vorbereitungen")
    sub = w(D["hero"][0], D["hero"][1], 40)
    alt = f"Header-Bild {plain}"
    kommentar = f'<!-- ANMELDE-LINK {plain}: #ANMELDE-LINK-HIER-EINTRAGEN durch die Adresse der Anmeldung ersetzen -->\n<a class="btn" href="#ANMELDE-LINK-HIER-EINTRAGEN">Anmeldung</a>' if anmeldung else ""
    hero_inhalt = f"<h1{cls}>{h1}</h1>\n<p>{sub}</p>" + ("\n" + kommentar if kommentar else "")
    main = f'''{tag_hero_split(hero_inhalt, "hero-split" + (" small" if small else ""), bildname(pg, 1, alt), alt)}

{jump([("teaser", ta), ("vorbereitungen", tb)], "jump-detail")}

{zahlen_tag(pg)}

<div class="container features">
{block1}
</div>

{zitat_tag(pg)}

<div class="container features">
{block2}
</div>{chr(10) + chr(10) + KONTAKT if kontakt else ""}'''
    page(fname, plain, "", main)   # nur Seiten, die selbst im Header stehen, werden fett

detail("mowo.html", "MoWo", "MoWo – Monsterwochenende", wide=True, anmeldung=False)   # Anmeldung: derzeit keine – Knopf ausgeblendet
detail("72h-aktion.html", "72h<br>Aktion", "72h-Aktion", kontakt=True)
detail("aktion.html", "Hilfe im<br> Stadtteil", "Hilfe im Stadtteil", small=True, kontakt=True)
detail("klamottenspende.html", "Klamotten-<br>spende", "Klamottenspende", small=True, kontakt=True)
detail("gruppenstunde.html", "Gruppen-<br>stunde", "Gruppenstunde", anmeldung=False)
detail("trainee-wochenende.html", "Trainee-<br>Wochenende", "Trainee-Wochenende", small=True, anmeldung=False)   # Anmeldung: derzeit keine – Knopf ausgeblendet

# ===================== Kachel-Übersichten =====================
def tiles(pg, items, ids, start=0):   # start=1, wenn davor schon eine Kachel mit Bild rechts steht
    out = []
    for k, (href, plain, h, cls, txt, extra) in enumerate(items):
        rev = " reverse" if (k + start) % 2 else ""   # Desktop: Bild abwechselnd rechts / links
        alt = f"Kachel-Bild {plain}"
        out.append(tag_eventkachel(f"<h2{extra}>{h}</h2>\n<p>{txt}</p>", f"event-tile {cls}{rev}", href, HERO_BILD[href], alt, id=ids[k]))
    return "\n".join(out)

EV = [("gruppenstunde.html", "Gruppenstunde", "Gruppen-<br>stunde", "t1", ev("gruppenstunde"), ""),
      ("mowo.html", "MoWo", "MoWo", "t2", ev("mowo"), ""),
      ("trainee-wochenende.html", "Trainee-Wochenende", "Trainee-<br>Wochenende", "t3", ev("trainee"), "")]
page("events.html", "Unsere Angebote", "events.html", f'''{simple_hero("events", "Unsere Angebote")}

{jump(JUMP_EVENTS, "jump-events")}

{zahlen_tag("events")}

<div class="events-list">
{tag_kachel("<h2>Zela 2027</h2>\n<p>Auch in diesem Jahr veranstalten wir ein Zeltlager<br> bei dem jeder mitfahren kann!</p>", "tile", "zela-2027.html", HERO_BILD["zela-2027.html"], "Kachel-Bild Zela 2027", id="zela")}
{tiles("events", EV, ["teaser", "vorbereitungen", "finanzen"], start=1)}
</div>

{zitat_tag("events")}''')

SA = [("72h-aktion.html", "72h Aktion", "72h Aktion", "t2", ev("72h"), ' class="narrow h72"'),
      ("aktion.html", T_HILFE, "Hilfe im<br> Stadtteil", "t3", ev("hilfe"), ""),
      ("klamottenspende.html", T_KLAMOTTEN, "Klamotten-<br>spende", "t3", ev("klamotten"), "")]
page("soziale-aktionen.html", "Soziale Aktionen", "soziale-aktionen.html", f'''{simple_hero("soziale-aktionen", "Soziale Aktionen", tight=True)}

{jump(JUMP_SOZ, "jump-events")}

{zahlen_tag("soziale-aktionen")}

<div class="events-list">
{tiles("soziale-aktionen", SA, ["aktion-72h", "aktion-2", "aktion-3"])}
</div>

{zitat_tag("soziale-aktionen")}''')

# ===================== FAQ =====================
qs = faq_html(9)
page("faq.html", "FAQ", "faq.html", f'''{tag_hero_split("<h1>FAQ</h1>", "hero-split reverse", bildname("faq", 1, "Header-Bild FAQ"), "Header-Bild FAQ")}

<section class="faq">
  <div class="container">
    <h2>Häufig gestellte Fragen</h2>
    <div class="faq-list">
{qs}
    </div>
  </div>
</section>''')

# ===================== Über uns =====================
KARTE = f'''<section class="karte-sektion" id="karte" aria-labelledby="karte-h">
  <div class="karte-buehne">
    <svg class="karte" viewBox="0 0 2400 2607" role="img" aria-labelledby="karte-t" focusable="false">
      <title id="karte-t">{KARTE_ALT}</title>
{open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "karte", "karte_body.svgpart")).read()}
    </svg>
    <svg class="karte-linie" aria-hidden="true" focusable="false"><path class="karte-linie-halo" d=""/><path class="karte-linie-pfad" d=""/><circle class="karte-linie-halo-punkt" r="9" cx="0" cy="0"/><circle class="karte-linie-punkt" r="5.5" cx="0" cy="0"/></svg>
    <div class="karte-label">
      <h2 id="karte-h">{KARTE_TITEL}</h2>
      <p>{KARTE_ADRESSE[0]}<br>{KARTE_ADRESSE[1]}</p>
      <a class="karte-btn" href="{MAPS_URL}" target="_blank" rel="noopener">{MAPS_BTN}<span class="sr-only"> {MAPS_NEU}</span></a>
    </div>
    <p class="karte-quelle">{KARTE_QUELLE}</p>
    <kjg-scrollhinweis></kjg-scrollhinweis>
  </div>
</section>'''

page("ueber-uns.html", "Über uns", "", f'''{simple_hero("ueber-uns", "Über uns", inter=True)}

{jump(JUMP_WER, "jump-detail")}

{zahlen_tag("ueber-uns")}

<div class="wer-flow">
<div class="container">
{feature("ueber-uns", 2, WER_A[0], absaetze(WER_A[1]), reverse=True, id_="teaser")}
</div>

{KARTE}

{tag_kachel("<h2>Zela 2027</h2>\n<p>Auch in diesem Jahr veranstalten wir ein Zeltlager<br> bei dem jeder mitfahren kann!</p>", "tile", "zela-2027.html", HERO_BILD["zela-2027.html"], "Bild Zeltlager 2027", id="vorbereitungen")}

<div class="container">
{feature("ueber-uns", 4, WER_B[0], absaetze(WER_B[1]), reverse=True, id_="finanzen", cls="h143 tight")}
</div>

{tag_kachel("<h2>Unser Team</h2>\n<p>Wer genau wir sind und welche Aufgaben jeder hat<br> kannst du hier erfahren</p>", "tile reverse", "team.html", HERO_BILD["team.html"], "Bild Unser Team")}
</div>''')

# ===================== Unser Team =====================
# Zahlenband nach Entwurf „Frame 463“: (Icon, x, y des Icons, Zahl, Beschriftung, Spaltenmitte) – x/Mitte relativ zum Rasterrand (100 px)
STATS = [("gruppenleiter", 110, 37, "35", "Gruppenleiter", 134.5),
         ("zelte", 437, 39, "21", "Zelte", 457.5),
         ("dioezesanverbaende", 760, 32, "24", "Diözesanverbänden", 781.5),
         ("kjg-seit", 1083, 32, "1977", "KjG seit", 1105.5)]
ICON_W = {"gruppenleiter": (48, 36), "zelte": (42, 33), "dioezesanverbaende": (44, 44), "kjg-seit": (45, 44)}
stats = "\n".join(
    f'''    <li style="left:{c - 150:.1f}px"><img class="icon" src="icons/team-{k}.svg" width="{ICON_W[k][0]}" height="{ICON_W[k][1]}" alt="" style="left:{x - (c - 150):.2f}px;top:{y:.2f}px"><span class="num">{n}</span><span class="label">{l}</span></li>'''
    for k, x, y, n, l, c in STATS)

pcount = [0]
def person(side, abschnitt, i, circle=True):
    pcount[0] += 1
    name, rolle, _re, d1, _e1, d2, _e2 = TEAM[abschnitt][i]
    alt = "Foto " + name
    reg(alt, "Photo of " + name)
    inhalt = f'<h3>{name}</h3>\n<div class="rolle">{rolle}</div>\n<p>{person_text(d1)}</p>\n<p>{person_text(d2)}</p>'
    if circle:
        return tag_person(inhalt, f"person {side}", bildname("team", pcount[0] + 1, alt), alt)
    return tag_person(inhalt, f"person {side}")

_qd, _qn, _qr = QUOTE_TEAM[0], QUOTE_TEAM[1], QUOTE_TEAM[2]
QUOTE = tag_zitat(f"<p>{quote_p(_qd)}</p>\n<strong>{_qn}</strong><span>{_qr}</span>", "circle-left", bildname("team", 10, "Foto Lena"), "Foto Lena")

GRUPPEN = ["lagerleitung"] * 3 + ["planungsleitung"] * 3 + ["pfarrleitung"] * 2
GRUPPEN_NAME = dict(JUMP_TEAM)

def feuer_html():
    leute, infos = [], []
    k = 0
    for gruppe in ("lagerleitung", "planungsleitung", "pfarrleitung"):
        for (name, rolle, _re, d1, _e1, d2, _e2) in TEAM[gruppe]:
            chips_de, _chips_en, lied = FEUER_PERSON[k]
            alt = "Foto " + name
            reg(alt, "Photo of " + name)
            bild = img("team", k + 2, alt, "media")
            leute.append(f'<li class="feuer-p" data-gruppe="{gruppe}"><div class="feuer-foto">{bild}<span class="feuer-dunkel"></span></div><span class="feuer-name">{name}</span></li>')
            chips = "".join(f"<li>{c}</li>" for c in chips_de)
            infos.append(f'''<article class="feuer-it" data-gruppe="{gruppe}">
  <p class="feuer-lab">{GRUPPEN_NAME[gruppe]}</p>
  <h3>{name}</h3>
  <p class="feuer-rolle">{rolle}</p>
  <p class="feuer-text">{d1}</p>
  <blockquote><span class="feuer-vor">{FEUER_ERZAEHLT}</span>{d2}</blockquote>
  <ul class="feuer-chips">{chips}</ul>
  <p class="feuer-lied"><span>{FEUER_LIED}</span> {lied}</p>
</article>''')
            k += 1
    nl = "\n"
    return f'''<section class="feuer" id="lagerfeuer" aria-label="{t("Lagerfeuer", "Campfire")}">
  <span id="lagerleitung" class="feuer-anker"></span><span id="planungsleitung" class="feuer-anker"></span><span id="pfarrleitung" class="feuer-anker"></span>
  <div class="feuer-buehne">
    <div class="feuer-himmel"><svg class="feuer-sterne" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"></svg><div class="feuer-mond"></div><div class="feuer-schnuppe"></div></div>
    <svg class="feuer-tannen" viewBox="0 0 1600 130" preserveAspectRatio="none" aria-hidden="true"></svg>
    <div class="feuer-boden"></div>
    <div class="feuer-glut"></div>
    <div class="feuer-ring">
      <div class="feuer-stelle" aria-hidden="true">
        <svg viewBox="0 0 200 260">
          <ellipse cx="100" cy="170" rx="130" ry="110" fill="rgba(240,91,131,.25)"/>
          <path class="flamme f1" d="M100 18 C146 78 176 124 154 196 C142 232 58 232 46 196 C26 124 62 86 100 18Z" fill="#F05B83"/>
          <path class="flamme f2" d="M100 64 C132 106 150 140 136 196 C128 222 72 222 64 196 C52 142 76 112 100 64Z" fill="#FF9C8F"/>
          <path class="flamme f3" d="M100 118 C118 140 126 164 118 196 C112 210 88 210 82 196 C74 164 86 140 100 118Z" fill="#FFE6E0"/>
          <g transform="translate(0 6)"><rect x="34" y="214" width="132" height="22" rx="11" fill="#3a2420" transform="rotate(-8 100 225)"/><rect x="34" y="214" width="132" height="22" rx="11" fill="#5a3b34" transform="rotate(10 100 225)"/>
          <circle cx="40" cy="244" r="12" fill="#3f6264"/><circle cx="66" cy="250" r="11" fill="#4c7274"/><circle cx="134" cy="250" r="11" fill="#3f6264"/><circle cx="160" cy="244" r="12" fill="#4c7274"/></g>
        </svg>
      </div>
      <ul class="feuer-leute">
{nl.join(leute)}
      </ul>
    </div>
    <div class="feuer-info">
{nl.join(infos)}
    </div>
    <div class="feuer-dots" role="group" aria-label="{t("Person wählen", "Choose a person")}"></div>
    <kjg-scrollhinweis></kjg-scrollhinweis>
  </div>
</section>'''

page("team.html", "Unser Team", "team.html", f'''{simple_hero("team", "Unser Team", short=True)}

<section class="stats" aria-label="Zahlen">
  <ul>
{stats}
  </ul>
</section>

{jump(JUMP_TEAM, "jump-team")}

<section class="feuer-intro">
  <div class="container">
    <h2>{FEUER_INTRO[0]}</h2>
    <p>{FEUER_INTRO[1]}</p>
  </div>
</section>

{QUOTE}

{feuer_html()}

<section class="feuer-ende">
  <div class="container">
    <h2>{FEUER_ENDE[0]}</h2>
    <p>{FEUER_ENDE[1]}</p>
  </div>
</section>
''', extra_css='  <link rel="stylesheet" href="assets/css/lagerfeuer.css">\n', extra_js='  <script src="assets/js/lagerfeuer.js" defer></script>\n')

# ===================== Impressum & Datenschutz =====================
for f, t in [("impressum.html", "Impressum"), ("datenschutz.html", "Datenschutz")]:
    body = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), f[:-5] + ".main")).read().strip()
    body = body.removeprefix("<main>").removesuffix("</main>").strip()
    body = body.replace(f'<section class="hero-simple"><h1>{t}</h1></section>', simple_hero(f[:-5], t))
    page(f, t, "", body)

# ===================== bilder/README.md ergänzen =====================
titles = {"events": "Unsere Angebote (events.html)", "soziale-aktionen": "Soziale Aktionen (soziale-aktionen.html)",
          "mowo": "MoWo (mowo.html)", "72h-aktion": "72h-Aktion (72h-aktion.html)", "aktion": "Hilfe im Stadtteil (aktion.html)", "klamottenspende": "Klamottenspende (klamottenspende.html)",
          "gruppenstunde": "Gruppenstunde (gruppenstunde.html)", "trainee-wochenende": "Trainee-Wochenende (trainee-wochenende.html)",
          "faq": "FAQ (faq.html)", "impressum": "Impressum (impressum.html)", "datenschutz": "Datenschutz (datenschutz.html)", "ueber-uns": "Über uns (ueber-uns.html)", "team": "Unser Team (team.html)"}
p = os.path.join(root, "bilder", "README.md")
s = open(p).read().split("\n## Unterseiten")[0].rstrip("\n")
s += "\n\n## Unterseiten\n"
for pg in ["events", "soziale-aktionen", "mowo", "72h-aktion", "aktion", "klamottenspende", "gruppenstunde", "trainee-wochenende", "ueber-uns", "team", "faq", "impressum", "datenschutz"]:
    s += f"\n### {titles[pg]}\n\n| Datei | Wo auf der Seite |\n|---|---|\n" + "\n".join(f"| `{n}` | {w} |" for n, w in REG[pg]) + "\n"
open(p, "w").write(s)
print("ok", sum(len(v) for v in REG.values()), "Bildflächen")
