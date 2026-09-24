/**
 * Behind The Pages entries (behind-the-pages/articles.json): loading, stable
 * article URLs and the reading-time label shared by the homepage section, the
 * overview table and the article page.
 *
 * Requires `SkyFeed` (content-feed.js). Exposes one global, `SkyArticles`.
 */
(function () {
  var ARTICLE_PAGE = 'behind-the-pages-article.html';

  /**
   * Stable identifier of an entry. The admin assigns a random `id` once; entries
   * added by hand without one fall back to their timestamp.
   */
  function idOf(entry) {
    var id = String(entry.id || '').trim().toLowerCase();
    return id || String(entry.date || '').replace(/\D/g, '').slice(0, 12);
  }

  function slugify(text) {
    return String(text || '').normalize('NFKD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');
  }

  /**
   * Loads all entries that have a title, newest first.
   * @returns {Promise<Array<{id: string, date: string, title: string, readingTime: number, body: string}>>}
   */
  function load() {
    return window.SkyFeed.load('behind-the-pages/articles.json', 'articles', function (a) { return String(a.title || '').trim(); })
      .then(function (entries) {
        return entries.map(function (a) {
          return {
            id: idOf(a),
            date: a.date,
            title: String(a.title).trim(),
            readingTime: Math.max(1, Math.round(Number(a.reading_time) || 1)),
            body: a.body || ''
          };
        }).filter(function (a) { return a.id; });
      });
  }

  /**
   * Link to an entry's page. Only the part before the first "-" identifies the
   * entry; the title slug after it is cosmetic, so shared links survive a renamed title.
   * @param {{id: string, title: string}} entry
   * @returns {string}
   */
  function urlOf(entry) {
    var slug = slugify(entry.title);
    return ARTICLE_PAGE + '?id=' + encodeURIComponent(entry.id + (slug ? '-' + slug : ''));
  }

  /**
   * Finds the entry addressed by an `?id=` value as produced by `urlOf`.
   * @param {Array<{id: string}>} entries
   * @param {string|null} param
   * @returns {Object|null}
   */
  function find(entries, param) {
    var id = String(param || '').trim().toLowerCase().split('-')[0];
    if (!id) return null;
    for (var i = 0; i < entries.length; i++) if (entries[i].id === id) return entries[i];
    return null;
  }

  /** @returns {string} e.g. "5 minutes" / "1 minute" */
  function minutesLabel(n) { return n + (n === 1 ? ' minute' : ' minutes'); }

  window.SkyArticles = { load: load, urlOf: urlOf, find: find, minutesLabel: minutesLabel };
})();
