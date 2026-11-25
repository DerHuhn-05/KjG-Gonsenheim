"""Erzeugt die kurzen Modul-Tags (siehe assets/js/module.js) für die Seiten."""
from html import escape as _e

def esc(s):
    return _e(str(s), quote=True)

def tag_header(seite, aktiv=""):
    return f'<kjg-header seite="{seite}"' + (f' aktiv="{aktiv}"' if aktiv else "") + "></kjg-header>"

TAG_FOOTER = "<kjg-footer></kjg-footer>"

def tag_bild(name, alt, klasse=None, eager=False):
    k = f' klasse="{klasse}"' if klasse and klasse != "media" else ""
    return f'<kjg-bild name="{name}" alt="{esc(alt)}"{k}{" eager" if eager else ""}></kjg-bild>'

def tag_sprung(punkte, variante="unter", klasse=""):
    """punkte: (href, text) oder (href, text, x, zeile)"""
    inner = []
    for p in punkte:
        extra = f' x="{p[2]}" r="{p[3]}"' if len(p) > 2 else ""
        inner.append(f'  <a href="{p[0]}"{extra}>{p[1]}</a>')
    kl = f' klasse="{klasse}"' if klasse else ""
    return f'<kjg-sprung variante="{variante}"{kl}>\n' + "\n".join(inner) + "\n</kjg-sprung>"

def _opt(**kw):
    return "".join(f' {k.replace("_", "-")}="{esc(v)}"' for k, v in kw.items() if v not in (None, ""))

def tag_kachel(inhalt, klasse, href, bild, bild_alt, link="genauere infos", id=None):
    return f'<kjg-kachel{_opt(klasse=klasse, id=id, href=href, link=link, bild=bild, bild_alt=bild_alt)}>\n{inhalt}\n</kjg-kachel>'

def tag_eventkachel(inhalt, klasse, href, bild, bild_alt, link="genauere Infos", id=None):
    return f'<kjg-eventkachel{_opt(klasse=klasse, id=id, href=href, link=link, bild=bild, bild_alt=bild_alt)}>\n{inhalt}\n</kjg-eventkachel>'

def tag_karte(inhalt, href, bild, bild_alt, link="Weitere Informationen"):
    return f'<kjg-karte{_opt(href=href, link=link, bild=bild, bild_alt=bild_alt)}>\n{inhalt}\n</kjg-karte>'

def tag_abschnitt(inhalt, klasse, bild=None, bild_alt=None, id=None):
    return f'<kjg-abschnitt{_opt(klasse=klasse, id=id, bild=bild, bild_alt=bild_alt)}>\n{inhalt}\n</kjg-abschnitt>'

def tag_person(inhalt, klasse, bild=None, bild_alt=None):
    return f'<kjg-person{_opt(klasse=klasse, bild=bild, bild_alt=bild_alt)}>\n{inhalt}\n</kjg-person>'

def tag_zitat(inhalt, klasse, bild, bild_alt):
    return f'<kjg-zitat{_opt(klasse=klasse, bild=bild, bild_alt=bild_alt)}>\n{inhalt}\n</kjg-zitat>'

def tag_frage(frage, antwort):
    return f"<kjg-frage><span>{frage}</span><p>{antwort}</p></kjg-frage>"

def tag_hero(titel_html, klasse, bild, bild_alt):
    return f'<kjg-hero{_opt(klasse=klasse, bild=bild, bild_alt=bild_alt)}>\n{titel_html}\n</kjg-hero>'

def tag_hero_split(inhalt, klasse, bild, bild_alt):
    return f'<kjg-hero-split{_opt(klasse=klasse, bild=bild, bild_alt=bild_alt)}>\n{inhalt}\n</kjg-hero-split>'

# Kacheln und Karten zeigen das Header-Bild der Seite, auf die sie verlinken (ein Bild, an einer Stelle hochladen)
HERO_BILD = {
    "zela-2027.html": "zela-1", "team.html": "team-1", "ueber-uns.html": "ueber-uns-1", "events.html": "events-1",
    "soziale-aktionen.html": "soziale-aktionen-1", "gruppenstunde.html": "gruppenstunde-1", "mowo.html": "mowo-1",
    "trainee-wochenende.html": "trainee-wochenende-1", "72h-aktion.html": "72h-aktion-1", "aktion.html": "aktion-1",
    "klamottenspende.html": "klamottenspende-1",
}
