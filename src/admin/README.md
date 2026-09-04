# Updates pflegen — Kurzanleitung

Der Update-Feed liegt **nicht im Seitenquelltext**, sondern in einer einzigen Datei:
`src/updates/posts.json`. Sowohl die Updates-Seite als auch die „Latest update"-Karte auf der
Homepage lesen daraus. Ein neuer Post erscheint also automatisch an beiden Stellen.

## Für den Autor

1. `deinedomain.at/admin` aufrufen
2. Mit **E-Mail und Passwort** einloggen (kein GitHub-Konto nötig)
3. **Updates → Update-Feed** öffnen — dort steht die Liste aller Posts
4. **Add Post** für einen neuen; auf einen bestehenden klicken zum Ändern;
   Mülleimer-Symbol zum Löschen
5. Datum & Uhrzeit, Badge (optional), Titel (optional) und Text eintippen — Leerzeile =
   neuer Absatz. Datum darf auch in der Vergangenheit oder Zukunft liegen — Posts reihen
   sich automatisch chronologisch ein (bis auf die Minute genau).
6. **Publish** drücken

Der Rest passiert unsichtbar: Netlify schreibt die Änderung ins Repository und baut die
Seite neu. Nach etwa einer Minute steht der Post online. Kein Server, keine Datenbank,
keine Entwicklerin nötig.

## Einmalige Einrichtung (durch dich)

1. **Repository:** Projekt auf GitHub legen.
2. **Netlify:** dort eine Site aus diesem Repository anlegen (Add new site → Import an
   existing project). Publish directory ist `src`; ein Build-Command braucht es nicht.
3. **Identity aktivieren:** Site configuration → Identity → *Enable Identity*.
   Registration auf **Invite only** stellen, damit sich niemand Fremdes anmelden kann.
4. **Git Gateway aktivieren:** Identity → Services → *Enable Git Gateway*.
   Das ist der Schritt, der den E-Mail-Login mit dem Repository verbindet.
5. **Autor einladen:** Identity → Invite users → seine E-Mail-Adresse. Er bekommt eine
   Mail, klickt den Link, vergibt ein Passwort — fertig.

`branch` steht in `admin/index.html` auf `main`; heißt der Branch `master`, dort ändern.

**Lokal testen ohne all das:** im Projektordner `npx decap-server` starten und `/admin/`
über `localhost` öffnen. `local_backend: true` ist bereits gesetzt.

## Struktur der Datei

```json
{
  "posts": [
    { "date": "2026-08-09T14:30:00+02:00", "tag": "Meilenstein", "title": "Out in the trenches", "body": "Erster Absatz.\n\nZweiter Absatz." }
  ]
}
```

Sortiert wird automatisch nach Datum **und Uhrzeit**, neuester Post zuerst — die
Reihenfolge in der Datei ist also egal, und ein Post kann bewusst mit einem Datum in
der Vergangenheit oder Zukunft angelegt werden, um ihn an der richtigen Stelle
einzureihen. Der neueste Post erscheint als große Karte, alle weiteren als Zeitleiste
darunter. Nur bei diesem neuesten Post ist das kleine Badge über der Überschrift
sichtbar (`tag`) — bleibt es leer, steht dort automatisch „Latest update". Bei allen
älteren Posts wird das Feld nicht angezeigt, auch wenn man es ausfüllt.

**Zeitzone:** `date` wird als vollständiger Zeitstempel mit Offset gespeichert (siehe
Beispiel oben). Beim Eintippen im Formular zeigt der Picker deine lokale Browser-Zeit —
solange dein Rechner auf Wiener Zeit eingestellt ist (Normalfall), musst du dir um
Sommer-/Winterzeit keine Gedanken machen. Auf der Website wird der Zeitstempel für
**jede Besucherin überall auf der Welt** immer als Wiener Ortszeit angezeigt (MEZ/MESZ
automatisch berücksichtigt) — nicht als lokale Zeit der Besucherin.

## Fallback

Lädt `src/updates/posts.json` nicht (z. B. beim Öffnen direkt vom Dateisystem) oder sind
noch keine Posts vorhanden, zeigen beide Seiten einen fest hinterlegten „No updates yet"-
Zustand, damit nie eine leere Fläche entsteht. Sobald echte Posts erreichbar sind, gewinnen
sie.
