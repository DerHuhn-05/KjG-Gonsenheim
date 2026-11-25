# Hängt an CSS/JS-Links ?v=<Inhalts-Hash>, damit Browser (v. a. Safari) nach Änderungen neu laden
import hashlib, pathlib, re, sys
root = pathlib.Path(sys.argv[1])
h = {p.relative_to(root).as_posix(): hashlib.md5(p.read_bytes()).hexdigest()[:8]
     for p in list(root.glob("assets/css/*.css")) + list(root.glob("assets/js/*.js"))}
rx = re.compile(r'((?:\.\./)?)(assets/(?:css|js)/[\w.-]+\.(?:css|js))(\?v=\w+)?"')
for f in list(root.glob("*.html")) + list(root.glob("en/*.html")):
    t = f.read_text()
    n = rx.sub(lambda m: f'{m[1]}{m[2]}?v={h[m[2]]}"' if m[2] in h else m[0], t)
    if n != t: f.write_text(n)
