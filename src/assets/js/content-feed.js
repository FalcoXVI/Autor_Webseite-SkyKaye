/**
 * Loading, sorting and date formatting shared by every JSON-backed feed on the
 * site (updates/posts.json, behind-the-pages/articles.json).
 *
 * Exposes one global, `SkyFeed`. No dependencies.
 */
(function () {
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* Always Vienna local time (CET/CEST via the Intl time zone database),
     regardless of where the visitor happens to be. */
  var viennaParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Vienna', day: '2-digit', month: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false
  });

  /**
   * Formats an ISO timestamp as "04 Sep 2026, 14:30" in Vienna local time.
   * @param {string} iso Timestamp with offset, e.g. "2026-09-04T04:00:00+02:00".
   * @returns {string} The label, or the raw input if it is not a valid date.
   */
  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return String(iso || '');
    var p = viennaParts.formatToParts(d).reduce(function (acc, part) { acc[part.type] = part.value; return acc; }, {});
    return p.day + ' ' + MONTHS[parseInt(p.month, 10) - 1] + ' ' + p.year + ', ' + p.hour + ':' + p.minute;
  }

  function timeOf(item) {
    var t = new Date(item.date || 0).getTime();
    return isNaN(t) ? 0 : t;
  }

  /**
   * Fetches a feed file and returns its entries, newest first (by date and time).
   * Rejects when the file cannot be loaded, so callers can keep their pre-rendered fallback.
   * @param {string} url Feed file relative to the page, e.g. "updates/posts.json".
   * @param {string} key Name of the array inside the file, e.g. "posts".
   * @param {function(Object): boolean} isValid Keeps only entries worth showing.
   * @returns {Promise<Object[]>}
   */
  function load(url, key, isValid) {
    return fetch(url, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error(url + ': HTTP ' + r.status)); })
      .then(function (data) {
        var items = ((data && data[key]) || []).filter(function (item) { return item && isValid(item); });
        return items.sort(function (a, b) { return timeOf(b) - timeOf(a); });
      });
  }

  window.SkyFeed = { load: load, formatDate: formatDate };
})();
