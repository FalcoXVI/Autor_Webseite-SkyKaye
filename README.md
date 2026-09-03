# Sky Kaye — Website

Fertige Seite zum Hochladen. Es gibt keinen Build-Schritt, keine Datenbank und keine
Server-Software — ein Hoster muss nur den Inhalt von `src/` ausliefern.

## Ordnerstruktur

```
src/
  index.html              Startseite
  the-last-druid.html     The Last Druid — Serie, Bücher, Charaktere, Sekari
  reading-sample.html     Leseprobe „Unholy Heart"
  id-hate-to-love-you.html  I'd Hate To Love You
  know-my-name.html       Know My Name
  updates.html            Update-Feed
  legal-notice.html       Impressum
  privacy-policy.html     Datenschutzerklärung
  admin/                  Redaktionsoberfläche für die Updates
    index.html
    README.md             Anleitung: Updates pflegen
  updates/
    posts.json            die Updates selbst
  assets/
    css/industry.css      Stylesheet
    js/support.js         (aktuell ungenutzt — Rest eines Design-Tool-Exports, siehe unten)
    img/                  Logo & Cover
```

## Lokal ansehen

Ein Doppelklick auf `src/index.html` genügt für einen ersten Eindruck. Der Update-Feed
zeigt dabei den vorgerenderten Inhalt aus dem HTML (aktuell „No updates yet", da noch
keine Posts existieren) — Browser verbieten das Nachladen von Dateien direkt von der
Festplatte. Mit einem winzigen lokalen Server funktioniert auch das dynamische
Nachladen aus `src/updates/posts.json`:

```
cd src
python3 -m http.server 8000
```

Dann `http://localhost:8000` im Browser öffnen.

## Hochladen

Der Inhalt von `src/` kommt ins Web-Root. Bei Netlify, Cloudflare Pages, Vercel & Co.
reicht es, das Repository zu verbinden — Build-Command bleibt leer, **Publish directory
ist `src`**.

## Vor dem echten Livegang

- **Datenschutzerklärung:** in `src/privacy-policy.html` stehen noch drei Platzhalter —
  `[Name of hosting provider]`, `[Address / country]` und `[retention period]`.
  Die kannst du erst ausfüllen, wenn der Hoster feststeht.
- **Redaktionsoberfläche:** `/admin` zeigt eine Einrichtungsseite, solange die Site mit
  keinem GitHub-Repository verbunden ist oder Identity + Git Gateway noch fehlen — die
  Schritte stehen in `src/admin/README.md`. Bis dahin lassen sich Updates auch direkt in
  `src/updates/posts.json` eintragen: Datum, Titel, Text, neuester Post zuerst.

## Wie neue Updates auf die Seite kommen

Der Text des aktuellen Zustands („No updates yet") steht fertig im HTML von `index.html`
und `updates.html` — deshalb sieht Google ihn und die Seite funktioniert auch ohne
JavaScript. Zusätzlich holt ein kleines Script beim Öffnen `updates/posts.json` nach und
ersetzt den Feed, falls dort etwas steht.

Praktisch heißt das: Postet der Autor über `/admin`, erscheint sein Beitrag **sofort**
auf beiden Seiten, ohne dass jemand die Seiten neu bauen muss. Nur Suchmaschinen sehen
den neuen Text erst, wenn die Seiten das nächste Mal frisch erzeugt werden. Für
Sichtbarkeit reicht das; die tragenden Inhalte der Seite ändern sich ohnehin selten.

## Konten & Login (Netlify Identity)

Auf `index.html` sitzt ein kleines Redirect-Script: Netlify-Identity-Links für
Einladung, Passwort-Reset oder E-Mail-Bestätigung landen technisch bedingt auf der
Startseite (`#invite_token=…` usw. im URL-Hash) und werden von dort automatisch nach
`/admin/` weitergeleitet, wo das eigentliche Login-Fenster sitzt. Ohne dieses Script
würde ein Einladungslink auf der Startseite landen, ohne dass sich etwas tut.

## Bilder

Im Einsatz sind das Logo und die Cover von Buch 1 und 2 (`cover-the-last-druid.jpeg`,
`cover-rising-tide.png`). `cover-rising-tide.jpeg` liegt zusätzlich in `assets/img/`,
wird aber von keiner Seite referenziert. Für Buch 3, die beiden anderen Romane und die
Charakterportraits gibt es bewusst noch keine Bildflächen — die kommen dazu, sobald die
Illustrationen fertig sind.

## Hinweis: `assets/js/support.js`

Diese Datei wird von keiner HTML-Seite eingebunden. Laut Kopfzeile ist sie ein generiertes
Runtime-Bundle eines Design-Tools (`dc-runtime`) und kein Teil der eigentlichen Website.
Sie wurde beim Aufräumen mit umgezogen statt gelöscht, damit nichts verloren geht — kann
aber vermutlich gefahrlos entfernt werden, wenn niemand sie braucht.
