# Inhalte pflegen — Kurzanleitung

Im Admin gibt es unter **Contents** zwei Bereiche: **Updates** (der Update-Feed) und
**Behind The Pages** (Artikel und Leseproben mit eigener Seite). Beide bedienen sich gleich.

## Updates

Der Update-Feed liegt **nicht im Seitenquelltext**, sondern in einer einzigen Datei:
`src/updates/posts.json`. Sowohl die Updates-Seite als auch die „Latest update"-Karte auf der
Homepage lesen daraus. Ein neuer Post erscheint also automatisch an beiden Stellen.

## Für den Autor

1. `deinedomain.at/admin` aufrufen
2. Mit **E-Mail und Passwort** einloggen (kein GitHub-Konto nötig)
3. **Updates → Update-Feed** öffnen — dort steht die Liste aller Posts
4. **Add Post** für einen neuen; auf einen bestehenden klicken zum Ändern;
   Mülleimer-Symbol zum Löschen
5. Datum & Uhrzeit, Badge (optional), Titel (optional) und Text eintippen. Datum darf
   auch in der Vergangenheit oder Zukunft liegen — Posts reihen sich automatisch
   chronologisch ein (bis auf die Minute genau).
6. **Publish** drücken

### Text formatieren

Das Textfeld funktioniert wie Word: Was du dort siehst, erscheint genau so auf der
Website. Text markieren, dann oben in der Leiste die Formatierung wählen. Fährst du mit
der Maus über einen Knopf, erscheint ein kurzer Hinweis, was er macht.

| Knopf / Menü | Was es macht |
|---|---|
| ↶ ↷ | Rückgängig / Wiederholen (auch Strg+Z / Strg+Y) |
| **B**, *I*, ~~S~~ | fett (Strg+B), kursiv (Strg+I), durchgestrichen |
| „U – …" | unterstreichen: einfach, doppelt, gewellt oder gepunktet (Strg+U = einfach) |
| Größe | Klein, Normal, Groß, Sehr groß |
| Farbe | Standard, Blau, Dunkelblau, Grau, Rot |
| Schriftart | Barlow (Standard der Website), Barlow Condensed, Tinos (sieht aus wie Times New Roman) |
| Kette | Link setzen oder ändern — Adresse eintippen, z. B. `https://…`; durchgestrichene Kette entfernt ihn |
| **H** groß / **H** klein | zwei Überschriftsgrößen |
| Zitat, Trennlinie | eingerücktes, kursives Zitat; Trennlinie mit Raute (Szenenwechsel) |
| Aufzählung, Nummerierung | Listen mit Punkten oder Zahlen |
| Einzug ← / → | ganzen Absatz einrücken (bis zu drei Stufen); in einer Liste wird der Punkt eine Ebene tiefer gesetzt. Geht auch mit **Tab** / **Shift+Tab** |
| Erstzeileneinzug | nur die erste Zeile des Absatzes einrücken, wie im Buch |
| Links / Zentriert / Rechts | Ausrichtung des Absatzes |
| Radiergummi | entfernt alle Formatierungen des markierten Texts |

**Enter** beginnt einen neuen Absatz, **Shift+Enter** macht einen einfachen
Zeilenumbruch — wie bisher.

Größen, Farben und Schriftarten sind bewusst eine feste Auswahl: Sie passen zum Design
der Website, sind auf dem hellen Hintergrund gut lesbar und wirken auf dem Handy genauso
wie am Computer.

**Einfügen aus Word oder Google Docs:** geht ganz normal mit Strg+V. Fett, kursiv,
unterstrichen, Listen, Überschriften und Links bleiben erhalten; fremde Schriftarten,
Farben und Größen werden weggelassen, damit der Text zur Website passt. Danach kannst du
ihn mit der Leiste nachformatieren. Willst du gar keine Formatierung übernehmen:
Strg+Shift+V fügt nur den reinen Text ein.

Die Vorschau rechts im Admin zeigt den Text mit Schriften, Farben und Größen wie auf der
Artikelseite der Website.

Der Rest passiert unsichtbar: Netlify schreibt die Änderung ins Repository und baut die
Seite neu. Nach etwa einer Minute steht der Post online. Kein Server, keine Datenbank,
keine Entwicklerin nötig.

## Behind The Pages

1. **Behind The Pages** öffnen — dort steht die Liste aller Einträge
2. **Add Eintrag** für einen neuen; auf einen bestehenden klicken zum Ändern
3. Ausfüllen:
   - **Link-Kennung** — wird automatisch vergeben, nichts zu tun. Sie macht die Adresse
     der Seite unveränderlich, damit geteilte Links auch nach einer Titeländerung gehen.
   - **Datum & Uhrzeit** — wie bei den Updates
   - **Titel** — Pflicht
   - **Reading Time (Minuten)** — Pflicht, nur die Zahl; auf der Seite steht dann
     „Reading Time 5 minutes"
   - **Text** — mit derselben Formatierungsleiste wie bei den Updates
4. **Publish** drücken

Auf der Startseite erscheinen zwischen „The Last Druid" und „Updates" die **drei neuesten**
Einträge, der neueste hervorgehoben. Gibt es mehr als drei, erscheint „See all" mit der
Übersicht aller Einträge. Jeder Titel führt auf die eigene Seite des Eintrags — deren
Adresse kannst du einfach aus dem Browser kopieren und teilen. Wird ein Eintrag gelöscht,
zeigt sein alter Link eine „Page not found"-Seite mit Verweis auf die Übersicht.

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

## Struktur der Dateien

`src/updates/posts.json`:

```json
{
  "posts": [
    { "date": "2026-08-09T14:30:00+02:00", "tag": "Meilenstein", "title": "Out in the trenches", "body": "<p>Erster Absatz mit <strong>fett</strong>.</p><p>Zweiter Absatz.</p>" }
  ]
}
```

`src/behind-the-pages/articles.json`:

```json
{
  "articles": [
    { "id": "k3f9a2", "date": "2026-09-25T14:30:00+02:00", "title": "Why chapter nine hates me", "reading_time": 5, "body": "<p>Text …</p>" }
  ]
}
```

`body` ist HTML, wie es der Editor erzeugt. Erlaubt sind nur die Tags `p br strong em s u
span a blockquote ul ol li h3 h4 hr` und die Klassen aus `SkyRichText.formats`
(`assets/js/rich-text.js`) — alles andere entfernt die Website beim Anzeigen. Wer von Hand
einträgt, kann auch reinen Text ohne jedes Tag schreiben (Leerzeile = neuer Absatz,
einfacher Zeilenumbruch bleibt erhalten); Markdown wird **nicht** mehr umgewandelt. `id` vergibt der Admin; wer einen
Eintrag von Hand anlegt, trägt eine beliebige eindeutige Kennung aus Kleinbuchstaben und
Ziffern ein (ohne `-`). Fehlt sie, wird ersatzweise der Zeitstempel verwendet.

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
sie. Behind The Pages verhält sich genauso („Nothing here yet").
