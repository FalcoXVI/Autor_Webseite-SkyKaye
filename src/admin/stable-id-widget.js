/**
 * Decap widget "stable-id": assigns a short random identifier to a new entry
 * once and never changes it afterwards. The public article URL is built from
 * it, so links keep working when the author later edits the title or date.
 *
 * The author sees the value read-only and never has to type anything.
 * Uses the `createClass` and `h` globals that decap-cms.js provides; must be
 * loaded after decap-cms.js and before CMS.init().
 */
(function () {
  if (!window.CMS || !window.createClass || !window.h) return;

  /** Six lowercase base-36 characters, e.g. "k3f9a2" — no "-", which separates the id from the title slug in URLs. */
  function newId() {
    var bytes = new Uint8Array(6);
    window.crypto.getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (b) { return (b % 36).toString(36); }).join('');
  }

  var StableIdControl = window.createClass({
    componentDidMount: function () {
      if (!this.props.value) this.props.onChange(newId());
    },
    render: function () {
      return window.h('div', {
        id: this.props.forID,
        className: this.props.classNameWrapper,
        style: { fontFamily: 'ui-monospace, Menlo, monospace', opacity: 0.75 }
      }, this.props.value || '…');
    }
  });

  var StableIdPreview = window.createClass({
    render: function () { return window.h('code', {}, this.props.value || ''); }
  });

  window.CMS.registerWidget('stable-id', StableIdControl, StableIdPreview);
})();
