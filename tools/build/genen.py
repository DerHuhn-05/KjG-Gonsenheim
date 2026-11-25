import json, os, sys
S = os.path.dirname(os.path.abspath(__file__))
pairs = json.load(open(os.path.join(S, "pairs.json")))
out = sys.argv[1]
with open(os.path.join(out, "tools/i18n/i18n_en_inhalt.py"), "w") as f:
    f.write('"""Englische Texte der redaktionellen Inhalte (Entwurf für Eltern). Wird in i18n_en.py eingemischt."""\nEN_INHALT = {\n')
    for k, v in sorted(pairs.items()):
        f.write(f"{json.dumps(k, ensure_ascii=False)}: {json.dumps(v, ensure_ascii=False)},\n")
    f.write("}\n")
print(len(pairs), "Einträge")
