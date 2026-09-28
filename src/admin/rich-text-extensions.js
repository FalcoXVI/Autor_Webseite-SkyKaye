/**
 * TipTap extensions for the author's editor. Every format is rendered as a
 * whitelisted CSS class (see SkyRichText.formats in assets/js/rich-text.js),
 * never as an inline style — and parsed back only from those classes, so
 * foreign fonts, colours and sizes pasted from Word or Google Docs are dropped.
 */
import { Extension, Mark } from 'https://esm.sh/@tiptap/core@3.31.3';
import StarterKit from 'https://esm.sh/@tiptap/starter-kit@3.31.3';
import { Heading } from 'https://esm.sh/@tiptap/extension-heading@3.31.3';
import { Underline } from 'https://esm.sh/@tiptap/extension-underline@3.31.3';

const BLOCK_TYPES = ['paragraph', 'heading'];
const MAX_INDENT = 3;

/**
 * Finds the whitelisted value of a format on an element, e.g. "large" for class "fs-large".
 * @param {HTMLElement} el
 * @param {{prefix: string, options: Array<{value: ?string}>}} format
 * @returns {?string}
 */
function classValue(el, format) {
  const option = format.options.find(o => o.value && el.classList.contains(format.prefix + o.value));
  return option ? option.value : null;
}

/**
 * A mark carrying one preset value, rendered as `<span class="prefix-value">`.
 * Adds the command `set<Name>(value)`; a null value removes the mark.
 * @param {string} name Mark name, e.g. "fontSize".
 * @param {{prefix: string, options: Array<{value: ?string}>}} format
 */
function classMark(name, format) {
  const command = 'set' + name[0].toUpperCase() + name.slice(1);
  return Mark.create({
    name,
    addAttributes() {
      return {
        value: {
          default: null,
          parseHTML: el => classValue(el, format),
          renderHTML: attrs => (attrs.value ? { class: format.prefix + attrs.value } : {})
        }
      };
    },
    parseHTML() {
      // Not consuming: one span may carry several of these classes.
      return [{ tag: 'span', consuming: false, getAttrs: el => (classValue(el, format) ? null : false) }];
    },
    renderHTML({ HTMLAttributes }) {
      return ['span', HTMLAttributes, 0];
    },
    addCommands() {
      return {
        [command]: value => ({ commands }) => (value ? commands.setMark(name, { value }) : commands.unsetMark(name))
      };
    }
  });
}

/**
 * Underline with a style variant: plain `<u>` or `<u class="u-double|u-wavy|u-dotted">`.
 * @param {Object} format SkyRichText.formats.underline
 */
function styledUnderline(format) {
  return Underline.extend({
    addAttributes() {
      return {
        variant: {
          default: null,
          parseHTML: el => classValue(el, format),
          renderHTML: attrs => (attrs.variant ? { class: format.prefix + attrs.variant } : {})
        }
      };
    },
    addCommands() {
      return {
        ...this.parent(),
        /** @param {?string|false} variant null = plain underline, false = no underline */
        setUnderlineVariant: variant => ({ commands }) =>
          (variant === false ? commands.unsetMark(this.name) : commands.setMark(this.name, { variant }))
      };
    }
  });
}

/**
 * The author gets two heading sizes (h3, h4 — the page title is h1/h2).
 * Pasted h1/h2 become the large, h5/h6 the small heading instead of plain text.
 */
const AuthorHeading = Heading.extend({
  parseHTML() {
    return [['h1', 3], ['h2', 3], ['h3', 3], ['h4', 4], ['h5', 4], ['h6', 4]]
      .map(([tag, level]) => ({ tag, attrs: { level } }));
  }
}).configure({ levels: [3, 4] });

/**
 * Paragraph-level formats on paragraphs and headings: indent (1–3), first-line
 * indent and alignment. Tab / Shift+Tab indent outside lists; inside a list the
 * list item extension nests the item instead.
 * @param {Object} formats SkyRichText.formats
 * @param {string} firstLineClass
 */
function blockFormats(formats, firstLineClass) {
  /** Applies `change(attrs)` to every paragraph/heading touched by the selection. */
  const updateBlocks = change => ({ tr, state, dispatch }) => {
    const { from, to } = state.selection;
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (BLOCK_TYPES.includes(node.type.name)) tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...change(node.attrs) });
    });
    if (dispatch) dispatch(tr);
    return true;
  };

  return Extension.create({
    name: 'blockFormats',
    addGlobalAttributes() {
      return [{
        types: BLOCK_TYPES,
        attributes: {
          indent: {
            default: 0,
            parseHTML: el => Number(classValue(el, formats.indent)) || 0,
            renderHTML: attrs => (attrs.indent ? { class: formats.indent.prefix + attrs.indent } : {})
          },
          firstLine: {
            default: false,
            parseHTML: el => el.classList.contains(firstLineClass),
            renderHTML: attrs => (attrs.firstLine ? { class: firstLineClass } : {})
          },
          align: {
            default: null,
            // Alignment from Word/Google Docs is kept when it matches a preset.
            parseHTML: el => classValue(el, formats.align) ||
              (formats.align.options.some(o => o.value && o.value === el.style.textAlign) ? el.style.textAlign : null),
            renderHTML: attrs => (attrs.align ? { class: formats.align.prefix + attrs.align } : {})
          }
        }
      }];
    },
    addCommands() {
      return {
        changeIndent: delta => updateBlocks(a => ({ indent: Math.min(MAX_INDENT, Math.max(0, a.indent + delta)) })),
        toggleFirstLine: () => ({ editor, commands }) => {
          const on = !BLOCK_TYPES.some(type => editor.isActive(type, { firstLine: true }));
          return commands.command(updateBlocks(() => ({ firstLine: on })));
        },
        setAlign: align => updateBlocks(() => ({ align })),
        clearBlockFormats: () => updateBlocks(() => ({ indent: 0, firstLine: false, align: null }))
      };
    },
    addKeyboardShortcuts() {
      // In a list the list item's own Tab handling runs first; if it cannot
      // nest any further, swallow the key instead of indenting the paragraph inside.
      const indent = delta => () => this.editor.isActive('listItem') || this.editor.commands.changeIndent(delta);
      return { Tab: indent(1), 'Shift-Tab': indent(-1) };
    }
  });
}

/**
 * All extensions of the author's editor.
 * @param {Object} formats SkyRichText.formats
 * @param {string} firstLineClass SkyRichText.firstLineClass
 * @returns {Array}
 */
export function buildExtensions(formats, firstLineClass) {
  return [
    StarterKit.configure({
      code: false,
      codeBlock: false,
      heading: false,
      underline: false,
      link: {
        openOnClick: false,
        defaultProtocol: 'https',
        // Clean markup: the website decides about target/rel when rendering.
        HTMLAttributes: { target: null, rel: null, class: null }
      }
    }),
    AuthorHeading,
    styledUnderline(formats.underline),
    classMark('fontSize', formats.fontSize),
    classMark('textColor', formats.textColor),
    classMark('fontFamily', formats.fontFamily),
    blockFormats(formats, firstLineClass)
  ];
}
