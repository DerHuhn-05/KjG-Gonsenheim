# Englische Version erzeugen

Die englischen Seiten in `en/` werden aus den deutschen Seiten erzeugt.

1. Deutschen Text in der jeweiligen `.html`-Datei ändern.
2. Die englische Übersetzung in `i18n_en.py` eintragen (Schlüssel = deutscher Text, Wert = englischer Text).
3. Im Hauptordner ausführen:

```bash
python3 tools/i18n/i18n_build.py .
```

Das Skript erzeugt alle Seiten in `en/` neu und setzt auf beiden Sprachversionen den DE | EN-Schalter.
Fehlt eine Übersetzung, bricht es ab und listet die fehlenden Texte auf – es wird also nichts
versehentlich unübersetzt veröffentlicht.
