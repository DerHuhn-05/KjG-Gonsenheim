"""Bereitet die Mainz-Karte (OpenStreetMap, aus dem Artefakt) für die Website auf:
- Geometrie vereinfachen (Douglas-Peucker), auf 1 Nachkommastelle runden
- je Linienstärke EIN Pfad statt Tausender <polyline>
- Hauptstraßen (Übersicht) und Nebenstraßen (nur im Bereich um Gonsenheim, werden erst beim Heranzoomen eingeblendet)
Ausgabe: karte_body.svgpart (Inhalt für das inline-<svg>), assets/img/karte-mainz.svg (eigenständige Datei)
Kartendaten: © OpenStreetMap-Mitwirkende, ODbL"""
import re, sys, os, math
HIER = os.path.dirname(os.path.abspath(__file__))
SRC = open(os.path.join(HIER, "quelle.html")).read().split("\n")
OUT_ROOT = sys.argv[1]

def rdp(pts, eps):
    if len(pts) < 3: return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    e2 = eps * eps
    while stack:
        a, b = stack.pop()
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        l2 = dx * dx + dy * dy
        best, bi = -1.0, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            if l2 == 0: d = (px - ax) ** 2 + (py - ay) ** 2
            else:
                t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / l2))
                d = (px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2
            if d > best: best, bi = d, i
        if best > e2:
            keep[bi] = True; stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]

def fmt(v):
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s

def pfad(listen, schliessen=False):
    teile = []
    for pts in listen:
        if len(pts) < 2: continue
        teile.append("M" + " ".join(f"{fmt(x)},{fmt(y)}" for x, y in pts) + ("Z" if schliessen else ""))
    return "".join(teile)

def punkte(s):
    return [tuple(map(float, p.split(","))) for p in s.split()]

# ---------- Stadtgrenze (clipPath) ----------
grenze = re.search(r'<clipPath id="stadt"><path d="([^"]*)"', "\n".join(SRC[:40]))[1]
grenze_pts = [tuple(map(float, m)) for m in re.findall(r"[ML]([\d.\-]+),([\d.\-]+)", grenze)]
grenze_d = pfad([rdp(grenze_pts, 0.6)], True)

# ---------- Wasserflächen (Zeilen 38..313) ----------
flaechen = []
for l in SRC[37:313]:
    m = re.match(r'<path d="([^"]*)"/>', l)
    if not m: continue
    for sub in re.findall(r"M[^M]*", m[1]):
        pts = [tuple(map(float, q)) for q in re.findall(r"([\d.\-]+),([\d.\-]+)", sub)]
        # Teile weit außerhalb der Stadt (clipPath schneidet sie ohnehin ab) überspringen
        if not any(-60 <= x <= 2460 and -60 <= y <= 2670 for x, y in pts): continue
        flaechen.append(rdp(pts, 0.9))
wasser_flaechen = pfad([p for p in flaechen if len(p) >= 4], True)

# ---------- Wasserlinien (Zeilen 316..367) ----------
linien = {}
for l in SRC[315:367]:
    m = re.match(r'<polyline stroke-width="([\d.]+)" points="([^"]*)"/>', l)
    if not m: continue
    pts = punkte(m[2])
    if not any(-60 <= x <= 2460 and -60 <= y <= 2670 for x, y in pts): continue
    linien.setdefault(float(m[1]), []).append(rdp(pts, 0.9))
wasser_linien = "".join(f'<path stroke-width="{fmt(w)}" d="{pfad(v)}"/>' for w, v in sorted(linien.items(), reverse=True))

# ---------- Straßen ----------
GON = (-60, 1650, 100, 1230)   # Bereich um Gonsenheim: dort gibt es auch die Nebenstraßen
gross, detail = {}, {}
for l in SRC[369:22287]:
    m = re.match(r'<polyline stroke-width="([\d.]+)" points="([^"]*)"/>', l)
    if not m: continue
    w = float(m[1]); pts = punkte(m[2])
    if w >= 1.4:
        gross.setdefault(w, []).append(rdp(pts, 0.8))
    else:
        if any(GON[0] <= x <= GON[1] and GON[2] <= y <= GON[3] for x, y in pts):
            w2 = {0.6: 0.6, 0.8: 0.9, 0.9: 0.9, 1.0: 1.1, 1.1: 1.1}.get(w, w)
            detail.setdefault(w2, []).append(rdp(pts, 0.45))
def gruppe(d, klasse=None):
    # k-neben: feinere Straßen der Übersicht – werden während des Zooms ausgeblendet (flüssige Animation)
    return "".join(f'<path{(" class=%s" % chr(34) + klasse(w) + chr(34)) if klasse else ""} stroke-width="{fmt(w)}" d="{pfad(v)}"/>' for w, v in sorted(d.items(), reverse=True))
strassen_gross = gruppe(gross, lambda w: "k-haupt" if w >= 2.4 else "k-neben"); strassen_detail = gruppe(detail)

# ---------- Pin mit KjG-Logo (in Pixel-Einheiten, Spitze bei 0,0; die Seite skaliert ihn gegen den Zoom) ----------
logo = re.search(r' d="([^"]*)"', open(os.path.join(OUT_ROOT, "assets/img/logo-icon.svg")).read())[1]
PIN = (
    '<g class="k-pin" transform="translate(794 666) scale(2.6)"><g class="k-pin-i">'
    '<ellipse class="k-pin-schatten" cx="0" cy="0" rx="16" ry="5"/>'
    '<path class="k-pin-form" d="M0 0C-5-9-30-26-30-47A30 30 0 0 1 30-47C30-26 5-9 0 0Z"/>'
    '<path class="k-pin-logo" transform="translate(-19.5 -66.5) scale(.2031)" d="' + logo + '"/>'
    '</g></g>'
)

KOERPER = (
    '<defs><clipPath id="k-stadt"><path d="' + grenze_d + '"/></clipPath></defs>'
    '<g clip-path="url(#k-stadt)">'
    '<path class="k-wasser" d="' + wasser_flaechen + '"/>'
    '<g class="k-wasser-linie">' + wasser_linien + '</g>'
    '<g class="k-strassen">' + strassen_gross + '</g>'
    '<g class="k-detail">' + strassen_detail + '</g>'
    '</g>'
    + PIN
)
open(os.path.join(HIER, "karte_body.svgpart"), "w").write(KOERPER)

# eigenständige SVG-Datei (Farben fest eingebaut)
STIL = (
    "<style>.k-bg{fill:#007576}.k-wasser{fill:#F05B83}.k-wasser-linie{fill:none;stroke:#F05B83;stroke-linecap:round;stroke-linejoin:round}"
    ".k-strassen,.k-detail{fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round}"
    ".k-pin-form{fill:#F05B83}.k-pin-logo{fill:#007576}.k-pin-schatten{fill:#000;fill-opacity:.25}</style>"
)
svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 2607" role="img" aria-label="Karte von Mainz mit Gonsenheim">'
       "<title>Mainz – Straßen und Gewässer (© OpenStreetMap-Mitwirkende, ODbL)</title>" + STIL +
       '<rect class="k-bg" x="-100" y="-100" width="2600" height="2807"/>' + KOERPER.replace("scale(2.6)", "scale(1.6)", 1) + "</svg>")
open(os.path.join(OUT_ROOT, "assets/img/karte-mainz.svg"), "w").write(svg)
print("Größen (KB): Grenze", len(grenze_d) // 1024, "| Wasserflächen", len(wasser_flaechen) // 1024, "| Wasserlinien", len(wasser_linien) // 1024,
      "| Straßen groß", len(strassen_gross) // 1024, "| Detail", len(strassen_detail) // 1024, "| gesamt", len(KOERPER) // 1024)
print("Straßenlinien: groß", sum(len(v) for v in gross.values()), "Detail", sum(len(v) for v in detail.values()))
