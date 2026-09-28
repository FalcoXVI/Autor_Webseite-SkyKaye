/**
 * Formatted text written by the author in the Decap editor (admin/rich-text-widget.js):
 * the list of allowed formats and the sanitizing renderer for the website.
 *
 * The editor stores HTML. Only the tags in ALLOWED_TAGS and the classes built
 * from FORMATS survive DOMPurify — no inline styles, no scripts, no event handlers.
 * Plain text without any tag (e.g. typed into the JSON by hand) is valid input as
 * well: a blank line starts a new paragraph, a single line break stays a line break.
 *
 * Requires `DOMPurify` (loaded from the CDN before this file). Without it the
 * text is shown unformatted but complete.
 * Exposes one global, `SkyRichText`. Pair the output with `.rich-text` (rich-text.css).
 */
(function () {
  var hasPurify = !!window.DOMPurify;

  /**
   * Curated formats. Each value becomes the CSS class `prefix + value`
   * (styled in rich-text.css); `null` stands for the site's default look and
   * produces no class. The admin toolbar builds its menus from this list.
   */
  var FORMATS = {
    fontSize: { prefix: 'fs-', label: 'Größe', options: [
      { value: 'small', label: 'Klein' }, { value: null, label: 'Normal' },
      { value: 'large', label: 'Groß' }, { value: 'xl', label: 'Sehr groß' }
    ] },
    textColor: { prefix: 'c-', label: 'Farbe', options: [
      { value: null, label: 'Standard' }, { value: 'blue', label: 'Blau' },
      { value: 'navy', label: 'Dunkelblau' }, { value: 'grey', label: 'Grau' }, { value: 'red', label: 'Rot' }
    ] },
    fontFamily: { prefix: 'ff-', label: 'Schriftart', options: [
      { value: null, label: 'Barlow (Standard)' }, { value: 'condensed', label: 'Barlow Condensed' },
      { value: 'serif', label: 'Tinos (wie Times)' }
    ] },
    underline: { prefix: 'u-', label: 'Unterstreichen', options: [
      { value: null, label: 'Einfach' }, { value: 'double', label: 'Doppelt' },
      { value: 'wavy', label: 'Gewellt' }, { value: 'dotted', label: 'Gepunktet' }
    ] },
    indent: { prefix: 'indent-', label: 'Einzug', options: [
      { value: null, label: 'Kein' }, { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }
    ] },
    align: { prefix: 'align-', label: 'Ausrichtung', options: [
      { value: null, label: 'Links' }, { value: 'center', label: 'Zentriert' }, { value: 'right', label: 'Rechts' }
    ] }
  };
  var FIRST_LINE_CLASS = 'first-line';

  var ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 's', 'u', 'span', 'a', 'blockquote', 'ul', 'ol', 'li', 'h3', 'h4', 'hr'];
  var ALLOWED_ATTR = ['href', 'class', 'start'];
  var BLOCK_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, li, blockquote';

  var ALLOWED_CLASSES = Object.keys(FORMATS).reduce(function (set, key) {
    FORMATS[key].options.forEach(function (o) { if (o.value) set[FORMATS[key].prefix + o.value] = true; });
    return set;
  }, (function () { var s = {}; s[FIRST_LINE_CLASS] = true; return s; })());

  if (hasPurify) {
    // Keep only whitelisted classes and a numeric list start — anything else is dropped.
    window.DOMPurify.addHook('uponSanitizeAttribute', function (node, data) {
      if (data.attrName === 'class') {
        data.attrValue = data.attrValue.split(/\s+/).filter(function (c) { return ALLOWED_CLASSES[c]; }).join(' ');
        if (!data.attrValue) data.keepAttr = false;
      } else if (data.attrName === 'start') {
        data.keepAttr = node.nodeName === 'OL' && /^\d{1,4}$/.test(data.attrValue);
      }
    });
    // External links open in a new tab, like every other outbound link on the site.
    window.DOMPurify.addHook('afterSanitizeAttributes', function (node) {
      if (node.tagName !== 'A' || !node.getAttribute('href')) return;
      var url;
      try { url = new URL(node.getAttribute('href'), window.location.href); } catch (e) { return; }
      if (url.origin !== window.location.origin) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener');
      }
    });
  }

  /**
   * Escapes text for use inside HTML markup.
   * @param {string} text
   * @returns {string}
   */
  function escape(text) {
    var d = document.createElement('div');
    d.textContent = text == null ? '' : String(text);
    return d.innerHTML;
  }

  /**
   * Returns the stored body as HTML. Plain text (no tag at all) becomes
   * paragraphs: blank line = new paragraph, single line break = `<br>`.
   * @param {string} body
   * @returns {string} Unsanitized HTML.
   */
  function toHtml(body) {
    var source = String(body || '').trim();
    if (!source || /<\/?[a-z][^>]*>/i.test(source)) return source;
    return source.split(/\n\s*\n/).map(function (para) {
      return '<p>' + escape(para.trim()).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  /**
   * Plain text of every innermost block (paragraph, heading, list item), line
   * breaks kept as "\n". DOMParser builds an inert document: nothing in it is
   * executed or loaded, so this is safe even for unsanitized input.
   * @param {string} html
   * @param {boolean} withMarkers Prefix list items with "•" / "1.".
   * @returns {string[]}
   */
  function textBlocks(html, withMarkers) {
    var body = new DOMParser().parseFromString(html, 'text/html').body;
    // Source formatting (indentation, newlines between tags) is not content.
    var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    for (var n = walker.nextNode(); n; n = walker.nextNode()) n.nodeValue = n.nodeValue.replace(/\s+/g, ' ');
    Array.prototype.forEach.call(body.querySelectorAll('br'), function (br) { br.replaceWith('\n'); });

    var blocks = Array.prototype.filter.call(body.querySelectorAll(BLOCK_SELECTOR), function (el) {
      return !el.querySelector(BLOCK_SELECTOR);
    });
    if (!blocks.length) blocks = [body];
    return blocks.map(function (el) {
      var text = el.textContent.split('\n').map(function (l) { return l.trim(); }).join('\n').trim();
      var li = el.closest('li');
      if (!withMarkers || !li || (li !== el && li.firstElementChild !== el)) return text;
      var list = li.parentElement;
      var nr = Array.prototype.indexOf.call(list.children, li) + (parseInt(list.getAttribute('start'), 10) || 1);
      return (list.tagName === 'OL' ? nr + '. ' : '• ') + text;
    }).filter(Boolean);
  }

  /**
   * Renders the stored body as sanitized HTML block elements.
   * @param {string} body HTML from the editor, or plain text.
   * @returns {string} Safe HTML; use inside an element with class `rich-text`.
   */
  function render(body) {
    var html = toHtml(body);
    if (hasPurify) return window.DOMPurify.sanitize(html, { ALLOWED_TAGS: ALLOWED_TAGS, ALLOWED_ATTR: ALLOWED_ATTR });
    return textBlocks(html, true).map(function (text) {
      return '<p>' + escape(text).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  /**
   * First line of the text without any markup — for teasers and meta descriptions.
   * @param {string} body
   * @returns {string}
   */
  function firstLine(body) {
    return (textBlocks(toHtml(body), false)[0] || '').split('\n')[0];
  }

  window.SkyRichText = {
    render: render, firstLine: firstLine, escape: escape, toHtml: toHtml,
    formats: FORMATS, firstLineClass: FIRST_LINE_CLASS
  };
})();
