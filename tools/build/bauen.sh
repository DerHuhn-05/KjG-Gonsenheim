#!/bin/sh
# Baut alle Seiten neu (deutsch + englisch). Aufruf aus dem Projektordner:  sh tools/build/bauen.sh
# Danach die Änderungen mit git committen und pushen.
set -e
cd "$(dirname "$0")/../.."
B=tools/build
rm -f "$B/pairs.json"
python3 "$B/genstart.py" .
python3 "$B/genzela.py" .
python3 "$B/gensub.py" .
python3 "$B/genen.py" .                     # englische Texte der Inhalte sammeln
python3 -I tools/i18n/i18n_build.py .       # englische Seiten erzeugen (bricht ab, wenn eine Übersetzung fehlt)
python3 "$B/cachebust.py" .                 # Versionsnummern an CSS/JS-Links, damit Browser Änderungen sofort laden
rm -rf tools/i18n/__pycache__ "$B/__pycache__"
