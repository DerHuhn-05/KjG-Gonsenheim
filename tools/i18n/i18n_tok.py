"""Hilfsfunktionen: HTML in Tags und Text zerlegen; Zeilenumbrüche (<br> mit Leerzeichen) im Fließtext werden zu  ."""
import re
LS = ' '
TAG = re.compile(r'(<!--.*?-->|<[^>]+>)', re.S)
SKIP_RE = re.compile(r'^[\s\d.,:;!?–—\-/→()&;+@"„“”\']*$')
def normalize(html):
    # <br> mit folgendem Leerzeichen = gestalterischer Zeilenumbruch im Fließtext
    return re.sub(r'<br> (?=\S)', LS, html)
def tokens(html):
    return TAG.split(normalize(html))
def key(text):
    return re.sub(r'\s+', ' ', text.replace(LS, ' ')).strip()
def translatable(text):
    k = key(text)
    if not k or SKIP_RE.match(k): return False
    if k.startswith('bilder/') or k.startswith('Video: bilder/') or '@' in k and ' ' not in k: return False
    if k.startswith('&') and k.endswith(';'): return False
    return True
ATTRS = re.compile(r'\b(alt|aria-label|content|link)="([^"]*)"')
