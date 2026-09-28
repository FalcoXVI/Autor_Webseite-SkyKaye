/**
 * Clean-up of HTML pasted from Microsoft Word before the editor parses it.
 *
 * Word does not paste real lists: every item is a `<p>` with an `mso-list`
 * style and the bullet or number as literal text in an `mso-list:Ignore` span.
 * These paragraphs are turned into nested `<ul>`/`<ol>` here. Everything else
 * (fonts, colours, sizes) is dropped later by the editor's schema.
 */

const LIST_STYLE = /mso-list:\s*l\d+/i;
const MARKER_STYLE = /mso-list:\s*ignore/i;
const ORDERED_MARKER = /^\(?([0-9]+|[a-z]|[ivxlcdm]+)[.)]/i;

/**
 * Nesting level of a Word list paragraph ("mso-list:l0 level2 lfo1" → 2).
 * @param {HTMLElement} p
 * @returns {number}
 */
function levelOf(p) {
  const match = /level(\d+)/i.exec(p.getAttribute('style') || '');
  return match ? Number(match[1]) : 1;
}

/**
 * Removes the literal bullet/number of a Word list paragraph.
 * @param {HTMLElement} p
 * @returns {boolean} Whether the marker was a number or letter.
 */
function takeMarker(p) {
  const marker = [...p.querySelectorAll('span')].find(s => MARKER_STYLE.test(s.getAttribute('style') || ''));
  if (!marker) return false;
  const ordered = ORDERED_MARKER.test(marker.textContent.replace(/\s+/g, ''));
  marker.remove();
  return ordered;
}

/**
 * Converts Word's pseudo lists into real, nested HTML lists.
 * @param {string} html Clipboard HTML.
 * @returns {string} HTML with real lists; unchanged if it contains no Word lists.
 */
export function normalizeWordLists(html) {
  if (!LIST_STYLE.test(html)) return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let stack = []; // open lists of the current run: [{ list, level }]

  for (const p of doc.querySelectorAll('p')) {
    if (!LIST_STYLE.test(p.getAttribute('style') || '')) continue;
    const level = levelOf(p);
    const ordered = takeMarker(p);
    const item = doc.createElement('li');
    item.append(...p.childNodes);

    // A run continues only while the list paragraphs follow each other directly.
    if (!stack.length || p.previousElementSibling !== stack[0].list) {
      stack = [{ list: doc.createElement(ordered ? 'ol' : 'ul'), level }];
      p.before(stack[0].list);
    }
    while (stack.length > 1 && stack[stack.length - 1].level > level) stack.pop();
    let top = stack[stack.length - 1];
    if (level > top.level && top.list.lastElementChild) {
      const nested = doc.createElement(ordered ? 'ol' : 'ul');
      top.list.lastElementChild.append(nested);
      top = { list: nested, level };
      stack.push(top);
    }
    top.list.append(item);
    p.remove();
  }
  return doc.body.innerHTML;
}
