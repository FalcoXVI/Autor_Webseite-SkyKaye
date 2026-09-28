/**
 * Word-like toolbar for the author's editor, built as plain DOM (no React) so it
 * can live inside the Decap widget without a build step. Menus for size, colour,
 * font and underline style come from SkyRichText.formats, so the toolbar can only
 * offer what the website knows how to render.
 */

const SVG = body => `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">${body}</svg>`;

const ICONS = {
  undo: SVG('<path d="M5 3 2 6l3 3"/><path d="M2 6h8a4 4 0 0 1 0 8H7"/>'),
  redo: SVG('<path d="m11 3 3 3-3 3"/><path d="M14 6H6a4 4 0 0 0 0 8h3"/>'),
  link: SVG('<path d="M6.5 9.5a3 3 0 0 0 4.2 0l2.1-2.1a3 3 0 0 0-4.2-4.2l-.7.7"/><path d="M9.5 6.5a3 3 0 0 0-4.2 0L3.2 8.6a3 3 0 0 0 4.2 4.2l.7-.7"/>'),
  unlink: SVG('<path d="M6.5 9.5a3 3 0 0 0 4.2 0l2.1-2.1a3 3 0 0 0-4.2-4.2"/><path d="M9.5 6.5a3 3 0 0 0-4.2 0L3.2 8.6a3 3 0 0 0 4.2 4.2"/><path d="m2 2 12 12"/>'),
  quote: SVG('<path d="M3 3v10M6 5h7M6 8h7M6 11h5"/>'),
  rule: SVG('<path d="M2 8h12"/><path d="m8 6 2 2-2 2-2-2z" fill="currentColor"/>'),
  bullets: SVG('<circle cx="3" cy="4" r=".8" fill="currentColor"/><circle cx="3" cy="8" r=".8" fill="currentColor"/><circle cx="3" cy="12" r=".8" fill="currentColor"/><path d="M6 4h8M6 8h8M6 12h8"/>'),
  numbers: SVG('<path d="M2.5 2.5h1v3M2 10.5a1 1 0 0 1 2 .3L2 13.5h2M6 4h8M6 8h8M6 12h8"/>'),
  outdent: SVG('<path d="M7 3h7M7 8h7M7 13h7M4.5 5.5 2 8l2.5 2.5"/>'),
  indent: SVG('<path d="M7 3h7M7 8h7M7 13h7M2 5.5 4.5 8 2 10.5"/>'),
  firstLine: SVG('<path d="M6 3h8M2 8h12M2 13h12M2 1.5v3"/>'),
  alignLeft: SVG('<path d="M2 3h12M2 6.3h8M2 9.7h12M2 13h8"/>'),
  alignCenter: SVG('<path d="M2 3h12M4 6.3h8M2 9.7h12M4 13h8"/>'),
  alignRight: SVG('<path d="M2 3h12M6 6.3h8M2 9.7h12M6 13h8"/>'),
  clear: SVG('<path d="M4 3h8M8 3l-2 10M3 13h5M10 9l4 4M14 9l-4 4"/>')
};

/**
 * Asks for a link address and applies it to the selection (or inserts it as text).
 * An empty answer removes the link.
 * @param {import('@tiptap/core').Editor} editor
 */
function editLink(editor) {
  const current = editor.getAttributes('link').href || '';
  const href = window.prompt('Link-Adresse, z. B. https://example.com', current || 'https://');
  if (href === null) return;
  const chain = editor.chain().focus().extendMarkRange('link');
  if (!href.trim() || href.trim() === 'https://') { chain.unsetLink().run(); return; }
  if (editor.state.selection.empty && !current) {
    chain.insertContent({ type: 'text', text: href.trim(), marks: [{ type: 'link', attrs: { href: href.trim() } }] }).run();
  } else {
    chain.setLink({ href: href.trim() }).run();
  }
}

/**
 * Toolbar definition. Buttons: `run` and optional `active`; menus: `options`,
 * `run(value)` and `current()` returning the selected option value ('' = default).
 * @param {import('@tiptap/core').Editor} editor
 * @param {Object} formats SkyRichText.formats
 */
function toolbarGroups(editor, formats) {
  const chain = () => editor.chain().focus();
  const inList = () => editor.isActive('listItem');
  const presetMenu = (format, markName, command) => ({
    title: format.label,
    options: format.options.map(o => ({ value: o.value || '', label: o.label, className: o.value ? format.prefix + o.value : '' })),
    run: value => chain()[command](value || null).run(),
    current: () => editor.getAttributes(markName).value || ''
  });
  const alignButton = (value, icon, title) => ({
    icon, title,
    run: () => chain().setAlign(value).run(),
    active: () => (editor.getAttributes('paragraph').align || editor.getAttributes('heading').align || null) === value
  });

  return [
    [
      { icon: ICONS.undo, title: 'Rückgängig (Strg+Z)', run: () => chain().undo().run() },
      { icon: ICONS.redo, title: 'Wiederholen (Strg+Y)', run: () => chain().redo().run() }
    ],
    [
      { text: 'B', className: 'is-bold', title: 'Fett (Strg+B)', run: () => chain().toggleBold().run(), active: () => editor.isActive('bold') },
      { text: 'I', className: 'is-italic', title: 'Kursiv (Strg+I)', run: () => chain().toggleItalic().run(), active: () => editor.isActive('italic') },
      { text: 'S', className: 'is-strike', title: 'Durchgestrichen', run: () => chain().toggleStrike().run(), active: () => editor.isActive('strike') },
      {
        title: formats.underline.label + ' (Strg+U)',
        options: [{ value: 'none', label: 'U – nicht unterstrichen' }].concat(formats.underline.options.map(o => ({ value: o.value || 'single', label: 'U – ' + o.label }))),
        run: value => chain().setUnderlineVariant(value === 'none' ? false : (value === 'single' ? null : value)).run(),
        current: () => (editor.isActive('underline') ? editor.getAttributes('underline').variant || 'single' : 'none')
      }
    ],
    [
      presetMenu(formats.fontSize, 'fontSize', 'setFontSize'),
      presetMenu(formats.textColor, 'textColor', 'setTextColor'),
      presetMenu(formats.fontFamily, 'fontFamily', 'setFontFamily')
    ],
    [
      { icon: ICONS.link, title: 'Link einfügen oder ändern', run: () => editLink(editor), active: () => editor.isActive('link') },
      { icon: ICONS.unlink, title: 'Link entfernen', run: () => chain().extendMarkRange('link').unsetLink().run() }
    ],
    [
      { text: 'H', className: 'is-h3', title: 'Überschrift groß', run: () => chain().toggleHeading({ level: 3 }).run(), active: () => editor.isActive('heading', { level: 3 }) },
      { text: 'H', className: 'is-h4', title: 'Überschrift klein', run: () => chain().toggleHeading({ level: 4 }).run(), active: () => editor.isActive('heading', { level: 4 }) },
      { icon: ICONS.quote, title: 'Zitat', run: () => chain().toggleBlockquote().run(), active: () => editor.isActive('blockquote') },
      { icon: ICONS.rule, title: 'Trennlinie (Szenenwechsel)', run: () => chain().setHorizontalRule().run() }
    ],
    [
      { icon: ICONS.bullets, title: 'Aufzählung', run: () => chain().toggleBulletList().run(), active: () => editor.isActive('bulletList') },
      { icon: ICONS.numbers, title: 'Nummerierung', run: () => chain().toggleOrderedList().run(), active: () => editor.isActive('orderedList') }
    ],
    [
      { icon: ICONS.outdent, title: 'Einzug verkleinern (Shift+Tab)', run: () => (inList() ? chain().liftListItem('listItem').run() : chain().changeIndent(-1).run()) },
      { icon: ICONS.indent, title: 'Einzug vergrößern (Tab)', run: () => (inList() ? chain().sinkListItem('listItem').run() : chain().changeIndent(1).run()) },
      {
        icon: ICONS.firstLine, title: 'Erste Zeile einrücken (wie im Buch)', run: () => chain().toggleFirstLine().run(),
        active: () => editor.isActive('paragraph', { firstLine: true }) || editor.isActive('heading', { firstLine: true })
      }
    ],
    [
      alignButton(null, ICONS.alignLeft, 'Linksbündig'),
      alignButton('center', ICONS.alignCenter, 'Zentriert'),
      alignButton('right', ICONS.alignRight, 'Rechtsbündig')
    ],
    [
      { icon: ICONS.clear, title: 'Formatierung entfernen', run: () => chain().unsetAllMarks().clearBlockFormats().run() }
    ]
  ];
}

/**
 * Builds a button element.
 * @param {Object} def Button definition from toolbarGroups.
 * @returns {{el: HTMLElement, update: function(): void}}
 */
function button(def) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'sky-toolbar__button ' + (def.className || '');
  el.title = def.title;
  el.setAttribute('aria-label', def.title);
  if (def.icon) el.innerHTML = def.icon; else el.textContent = def.text;
  // Keep the text selection in the editor while clicking.
  el.addEventListener('mousedown', e => e.preventDefault());
  el.addEventListener('click', () => def.run());
  return {
    el,
    update: () => {
      if (!def.active) return;
      const on = def.active();
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-pressed', String(on));
    }
  };
}

/**
 * Builds a menu element.
 * @param {Object} def Menu definition from toolbarGroups.
 * @returns {{el: HTMLElement, update: function(): void}}
 */
function menu(def) {
  const el = document.createElement('select');
  el.className = 'sky-toolbar__select';
  el.title = def.title;
  el.setAttribute('aria-label', def.title);
  def.options.forEach(o => {
    const option = new Option(o.label, o.value);
    // Show each preset in its own look (colour, font, size) inside the rich-text scope.
    if (o.className) option.className = o.className;
    el.add(option);
  });
  el.addEventListener('change', () => def.run(el.value));
  return { el, update: () => { el.value = def.current(); } };
}

/**
 * Creates the toolbar and keeps its buttons in sync with the selection.
 * @param {import('@tiptap/core').Editor} editor
 * @param {Object} formats SkyRichText.formats
 * @returns {HTMLElement}
 */
export function createToolbar(editor, formats) {
  const root = document.createElement('div');
  root.className = 'sky-toolbar rich-text';
  root.setAttribute('role', 'toolbar');
  root.setAttribute('aria-label', 'Formatierung');

  const controls = [];
  toolbarGroups(editor, formats).forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.className = 'sky-toolbar__group';
    group.forEach(def => {
      const control = def.options ? menu(def) : button(def);
      controls.push(control);
      groupEl.append(control.el);
    });
    root.append(groupEl);
  });

  const update = () => controls.forEach(c => c.update());
  editor.on('transaction', update);
  update();
  return root;
}
