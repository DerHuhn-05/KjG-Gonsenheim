"""Erzeugt en/*.html aus den deutschen Seiten und setzt den DE|EN-Schalter auf beiden Sprachversionen."""
import sys, os, glob, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from i18n_tok import *
from i18n_en import EN

EXTRA = {"1.500": "1,500"}   # Zahlenformat
root = sys.argv[1]
os.makedirs(os.path.join(root, "en"), exist_ok=True)
missing = {}

LANG_RE = re.compile(r'<div class="lang">.*?</div>', re.S)
def lang_switch(fname, en):
    if en:
        return (f'<div class="lang"><a href="../{fname}" class="de" lang="de" hreflang="de">DE</a>'
                f'<span class="sep"></span><a href="{fname}" class="en active" lang="en" hreflang="en" aria-current="true">EN</a></div>')
    return (f'<div class="lang"><a href="{fname}" class="de active" lang="de" hreflang="de" aria-current="true">DE</a>'
            f'<span class="sep"></span><a href="en/{fname}" class="en" lang="en" hreflang="en">EN</a></div>')

def alternates(fname, en):
    pre = "../" if en else ""
    return (f'  <link rel="alternate" hreflang="de" href="{pre}{fname}">\n'
            f'  <link rel="alternate" hreflang="en" href="{"" if en else "en/"}{fname}">\n')

def fix_head(html, fname, en):
    html = re.sub(r'  <link rel="alternate" hreflang="[a-z]+" href="[^"]*">\n', '', html)
    html = html.replace('  <link rel="stylesheet"', alternates(fname, en) + '  <link rel="stylesheet"', 1)
    return LANG_RE.sub(lang_switch(fname, en), html, count=1)

def lookup(text, fname):
    k = key(text)
    if k in EXTRA: return EXTRA[k]
    if k.startswith('Lorem ipsum'): return k   # Platzhaltertext bleibt
    if k in EN: return k if EN[k] == "=" else EN[k]
    if not translatable(text): return None
    missing.setdefault(k, set()).add(fname)
    return None

PATH_ATTR = re.compile(r'\b(src|href|data-base|poster)="([^"]*)"')
def fix_paths(tag):
    def rep(m):
        a, v = m.group(1), m.group(2)
        if re.match(r'^(https?:|mailto:|tel:|#|data:|/)', v) or v.split('#')[0].endswith('.html'):
            return m.group(0)
        return f'{a}="../{v}"'
    return PATH_ATTR.sub(rep, tag)

def fix_attrs(tag, fname):
    def rep(m):
        a, v = m.group(1), m.group(2)
        if a == 'content' and 'width=' in v: return m.group(0)
        t = lookup(v, fname)
        return f'{a}="{t}"' if t is not None else m.group(0)
    return ATTRS.sub(rep, tag)

for path in sorted(glob.glob(os.path.join(root, "*.html"))):
    fname = os.path.basename(path)
    de = open(path).read()
    de = fix_head(de, fname, False)
    open(path, "w").write(de)

    out = []; inscript = False
    for t in tokens(de):
        if t.startswith('<'):
            if t.startswith('<script') or t.startswith('<style'): inscript = True
            if t.startswith('</script') or t.startswith('</style'): inscript = False
            if t.startswith('<html'): t = t.replace('lang="de"', 'lang="en"')
            if not t.startswith('<!--'):
                t = fix_attrs(fix_paths(t), fname)
            out.append(t); continue
        if inscript or not t.strip():
            out.append(t.replace(LS, '<br> ')); continue
        tr = lookup(t, fname)
        if tr is None:
            out.append(t.replace(LS, '<br> ')); continue
        lead = re.match(r'^\s*', t).group(0); trail = re.search(r'\s*$', t).group(0)
        if tr[:1] in '.,;:)': lead = ''
        out.append(lead.replace(LS, '') + tr + trail.replace(LS, ''))
    en = ''.join(out)
    en = fix_head(en, fname, True)
    # Rechtstexte: Hinweis auf die verbindliche deutsche Fassung
    en = en.replace('<div class="container prose">',
                    '<div class="container prose">\n  <p class="lang-note"><em>This is a courtesy translation. Only the '
                    f'<a href="../{fname}">German version</a> is legally binding.</em></p>', 1)
    open(os.path.join(root, "en", fname), "w").write(en)

if missing:
    print("FEHLENDE ÜBERSETZUNGEN:")
    for k, v in sorted(missing.items()): print(" ", repr(k), sorted(v))
    sys.exit(1)
print("ok:", len(glob.glob(os.path.join(root, "en", "*.html"))), "englische Seiten")
