/**
 * Turns the author's Markdown (written in the Decap editor) into sanitized HTML.
 *
 * Plain-text posts from before the editor existed are valid input as well:
 * `breaks: true` keeps single line breaks, blank lines still start a new
 * paragraph, so they render exactly as they did with `white-space: pre-line`.
 *
 * Requires `marked` and `DOMPurify` (loaded from the CDN before this file).
 * Without them it falls back to the old plain-text rendering.
 * Exposes one global, `SkyRichText`. Pair the output with `.rich-text` (rich-text.css).
 */
(function () {
  var hasLibs = !!(window.marked && window.marked.Marked && window.DOMPurify);

  var ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'del', 'code', 'a', 'blockquote', 'ul', 'ol', 'li', 'h3', 'h4', 'h5', 'h6', 'hr'];

  var md = hasLibs ? new window.marked.Marked({
    gfm: true,
    breaks: true,
    walkTokens: function (token) {
      // The entry title is the page's h1/h2, so the author's headings start one level below it.
      if (token.type === 'heading') token.depth = Math.min(Math.max(token.depth, 2) + 1, 6);
    }
  }) : null;

  if (hasLibs) {
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
   * Renders Markdown to sanitized HTML block elements.
   * @param {string} markdown
   * @returns {string} Safe HTML; use inside an element with class `rich-text`.
   */
  function render(markdown) {
    var source = String(markdown || '').trim();
    if (!hasLibs) return '<p style="white-space:pre-line">' + escape(source) + '</p>';
    return window.DOMPurify.sanitize(md.parse(source), {
      ALLOWED_TAGS: ALLOWED_TAGS,
      ALLOWED_ATTR: ['href', 'title']
    });
  }

  /**
   * First line of the text without Markdown syntax — for teasers and meta descriptions.
   * @param {string} markdown
   * @returns {string}
   */
  function firstLine(markdown) {
    var line = String(markdown || '').trim().split('\n')[0] || '';
    // Drop block markers (heading, quote, list item) before rendering the inline rest.
    line = line.replace(/^\s*(#{1,6}\s+|>\s*|[-*+]\s+|\d+[.)]\s+)/, '');
    if (!hasLibs) return line;
    var d = document.createElement('div');
    d.innerHTML = window.DOMPurify.sanitize(md.parseInline(line), { ALLOWED_TAGS: [] });
    return d.textContent;
  }

  window.SkyRichText = { render: render, firstLine: firstLine, escape: escape };
})();
