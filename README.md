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
  behind-the-pages.html   Behind The Pages — Übersichtstabelle aller Einträge
  behind-the-pages-article.html  Behind The Pages — Seite eines Eintrags (?id=…)
  legal-notice.html       Impressum
  privacy-policy.html     Datenschutzerklärung
  admin/                  Redaktionsoberfläche (Updates, Behind The Pages)
    index.html            Decap-Konfiguration
    stable-id-widget.js   Widget, das jedem Behind-The-Pages-Eintrag eine feste Link-Kennung gibt
    rich-text-widget.js   Widget „rich-text": WYSIWYG-Editor (TipTap) für den Text, speichert HTML
    rich-text-extensions.js  TipTap-Erweiterungen: Größe, Farbe, Schriftart, Unterstreichungsarten, Einzug, Ausrichtung
    rich-text-toolbar.js  Formatierungsleiste des Editors
    rich-text-paste.js    Aufräumen beim Einfügen aus Word (Listen)
    rich-text-widget.css  Aussehen von Leiste und Textfeld
    README.md             Anleitung: Inhalte pflegen
  updates/
    posts.json            die Updates selbst
  behind-the-pages/
    articles.json         die Behind-The-Pages-Einträge
  _headers                 Cache-Control für Netlify (siehe unten)
  assets/
    css/industry.css      Stylesheet (Design-Tokens, Komponenten)
    css/responsive.css    Mobile-Anpassungen
    css/rich-text.css     Darstellung des formatierten Texts aus dem Editor
    css/behind-the-pages.css  Liste auf der Startseite, Übersichtstabelle
    js/content-feed.js    gemeinsam: JSON laden, nach Datum sortieren, Datum in Wiener Zeit
    js/rich-text.js       gemeinsam: erlaubte Formate + HTML aus dem Editor → sicheres HTML (DOMPurify)
    js/behind-the-pages.js  Behind The Pages: Laden, feste URLs, Reading Time
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
  `src/updates/posts.json` eintragen: Datum, Titel, Text (reiner Text oder HTML, siehe
  „Formatierter Text"), die Reihenfolge ist egal.

## Wie neue Updates auf die Seite kommen

Der Text des aktuellen Zustands („No updates yet") steht fertig im HTML von `index.html`
und `updates.html` — deshalb sieht Google ihn und die Seite funktioniert auch ohne
JavaScript. Zusätzlich holt ein kleines Script beim Öffnen `updates/posts.json` nach und
ersetzt den Feed, falls dort etwas steht.

Dasselbe Prinzip gilt für **Behind The Pages** (`behind-the-pages/articles.json`): Die
Startseite zeigt die drei neuesten Einträge (bei mehr als drei mit „See all“), die
Übersicht alle, und jeder Eintrag hat eine eigene, teilbare Seite
`behind-the-pages-article.html?id=<kennung>-<titel>`. Nur die Kennung vor dem ersten `-`
zählt; der Titel dahinter ist Kosmetik, damit Links auch nach einer Titeländerung
funktionieren.

Praktisch heißt das: Postet der Autor über `/admin`, erscheint sein Beitrag **sofort**
auf beiden Seiten, ohne dass jemand die Seiten neu bauen muss. Nur Suchmaschinen sehen
den neuen Text erst, wenn die Seiten das nächste Mal frisch erzeugt werden. Für
Sichtbarkeit reicht das; die tragenden Inhalte der Seite ändern sich ohnehin selten.

## Formatierter Text

Der Autor schreibt im Admin mit einem WYSIWYG-Editor wie in Word: fett, kursiv,
durchgestrichen, vier Unterstreichungsarten, Größe, Farbe, Schriftart, Link, zwei
Überschriften, Zitat, Trennlinie, Listen, Einzug, Erstzeileneinzug und Ausrichtung.
Gespeichert wird **HTML** im Feld `body`.

- **Editor:** eigenes Decap-Widget `rich-text` (`admin/rich-text-widget.js`) auf Basis von
  [TipTap 3](https://tiptap.dev) (ProseMirror, MIT). TipTap kommt als ES-Modul versioniert
  von esm.sh und wird nur im Admin geladen; `admin/index.html` ruft `CMS.init` erst auf,
  wenn das Modul registriert ist. TipTap statt Quill, weil Shift+Enter (`<br>`) eingebaut
  ist, jedes Format eigenes HTML (Klassen) rendert und beim Einfügen nur übrig bleibt, was
  im Schema steht.
- **Formate als Klassen, nicht als Inline-Styles:** Größen, Farben, Schriftarten,
  Unterstreichungsarten, Einzug und Ausrichtung sind feste Presets in
  `SkyRichText.formats` (`assets/js/rich-text.js`), z. B. `<span class="fs-large c-blue">`
  oder `<p class="indent-1 align-center">`. Die Werkzeugleiste baut ihre Menüs daraus,
  `assets/css/rich-text.css` gibt jeder Klasse ihr Aussehen. Größen sind relativ (`em`),
  passen also in die Update-Karte (17px), den Artikel (19px) und mobil. Die Serifenschrift
  ist Tinos (Google Fonts, metrisch gleich wie Times New Roman) mit Times New Roman,
  Georgia und serif als Ersatz. Ein neues Preset = Eintrag in `formats` + CSS-Regel.
- **Sicherheit:** `assets/js/rich-text.js` reinigt das HTML vor dem `innerHTML` mit
  DOMPurify: nur die Tags `p br strong em s u span a blockquote ul ol li h3 h4 hr`, die
  Attribute `href`, `class` (nur Klassen aus `formats`) und `start` (nur Zahlen, nur an
  `ol`). `style`, `<script>`, Event-Handler und `javascript:`-Links überleben nicht.
- **Teaser/Meta-Description:** `SkyRichText.firstLine()` liefert die erste Zeile als reinen
  Text (per `DOMParser`, der nichts ausführt oder lädt).
- **Fallback:** Fällt das CDN mit DOMPurify aus, zerlegt `rich-text.js` das HTML in reinen
  Text und zeigt es unformatiert, aber vollständig. Kann der Admin den Editor nicht laden,
  zeigt `/admin` eine Fehlermeldung statt eines halb funktionierenden Formulars.
- **Einfügen aus Word/Google Docs:** Der Editor übernimmt nur Formate aus seinem Schema
  (fett, kursiv, unterstrichen, durchgestrichen, Links, Listen, Überschriften, Ausrichtung).
  Fremde Schriften, Farben und Größen fallen weg. Word-Listen (in Wahrheit Absätze mit
  `mso-list`) wandelt `admin/rich-text-paste.js` in echte Listen um.

Die Einträge von vor dem Editor waren Markdown und wurden einmalig mit der bisherigen
marked-Konfiguration nach HTML migriert (sie sehen pixelgleich aus wie vorher). Einen
Renderer für beide Formate gibt es bewusst nicht. Reiner Text ohne jedes Tag wird
weiterhin verstanden (Leerzeile = neuer Absatz), Markdown nicht mehr.

## Konten & Login (Netlify Identity)

Auf `index.html` sitzt ein kleines Redirect-Script: Netlify-Identity-Links für
Einladung, Passwort-Reset oder E-Mail-Bestätigung landen technisch bedingt auf der
Startseite (`#invite_token=…` usw. im URL-Hash) und werden von dort automatisch nach
`/admin/` weitergeleitet, wo das eigentliche Login-Fenster sitzt. Ohne dieses Script
würde ein Einladungslink auf der Startseite landen, ohne dass sich etwas tut.

## Caching (`_headers`)

Netlify cached HTML/CSS/JS teils so aggressiv, dass ein normales Neuladen der Seite
alte Inhalte zeigte und nur ein neuer Tab wirklich frische Inhalte brachte.
`src/_headers` schickt jetzt `Cache-Control: no-cache` für alle Dateien mit — der
Browser fragt dadurch bei jedem Laden beim Server nach, ob sich etwas geändert hat,
statt blind eine alte Kopie zu verwenden. Auf Ladezeit hat das praktisch keinen
Einfluss, da unveränderte Dateien weiterhin effizient per 304-Antwort bestätigt werden.

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
