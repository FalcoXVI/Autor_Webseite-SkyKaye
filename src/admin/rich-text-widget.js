/**
 * Decap widget "rich-text": a WYSIWYG editor (TipTap) for the `body` of updates
 * and Behind The Pages entries. It stores HTML restricted to the formats in
 * SkyRichText.formats; the website sanitizes it again when rendering.
 *
 * ES module — loaded by admin/index.html via import() after decap-cms.js and
 * assets/js/rich-text.js, and before CMS.init(). Uses the `createClass` and `h`
 * globals that decap-cms.js provides.
 */
import { Editor } from 'https://esm.sh/@tiptap/core@3.31.3';
import { buildExtensions } from './rich-text-extensions.js';
import { createToolbar } from './rich-text-toolbar.js';
import { normalizeWordLists } from './rich-text-paste.js';

const { CMS, createClass, h, SkyRichText } = window;

/** Same text size as the article page, so the preview matches the website. */
const PREVIEW_STYLE = { fontSize: '19px', lineHeight: 1.85 };

/**
 * The editor's HTML as stored in the JSON: empty for an empty editor, and
 * without the empty paragraphs the editor keeps at the end (e.g. after a rule).
 * @param {Editor} editor
 * @returns {string}
 */
function serialize(editor) {
  if (editor.isEmpty) return '';
  return editor.getHTML().replace(/(<p(?: class="[^"]*")?><\/p>)+$/, '');
}

const RichTextControl = createClass({
  componentDidMount() {
    this.lastValue = this.props.value || '';
    this.editor = new Editor({
      element: this.contentEl,
      extensions: buildExtensions(SkyRichText.formats, SkyRichText.firstLineClass),
      // Plain text typed into the JSON by hand becomes paragraphs, as on the website.
      content: SkyRichText.toHtml(this.lastValue),
      editorProps: {
        attributes: { class: 'rich-text sky-editor__content', 'aria-label': 'Text', 'aria-multiline': 'true' },
        transformPastedHTML: normalizeWordLists
      },
      onUpdate: ({ editor }) => {
        this.lastValue = serialize(editor);
        this.props.onChange(this.lastValue);
      },
      onFocus: () => this.props.setActiveStyle(),
      onBlur: () => this.props.setInactiveStyle()
    });
    this.toolbarEl.append(createToolbar(this.editor, SkyRichText.formats));
  },

  componentDidUpdate() {
    // Only outside changes (e.g. another entry loaded into this widget) reset the content.
    const value = this.props.value || '';
    if (value !== this.lastValue) {
      this.lastValue = value;
      this.editor.commands.setContent(SkyRichText.toHtml(value), { emitUpdate: false });
    }
  },

  componentWillUnmount() {
    this.editor.destroy();
  },

  render() {
    // React renders both containers empty and never touches their children again;
    // toolbar and editor fill them in componentDidMount.
    return h('div', { id: this.props.forID, className: this.props.classNameWrapper + ' sky-editor' },
      h('div', { ref: el => { this.toolbarEl = el; }, className: 'sky-editor__toolbar' }),
      h('div', { ref: el => { this.contentEl = el; } }));
  }
});

const RichTextPreview = createClass({
  render() {
    return h('div', {
      className: 'rich-text',
      style: PREVIEW_STYLE,
      dangerouslySetInnerHTML: { __html: SkyRichText.render(this.props.value) }
    });
  }
});

CMS.registerWidget('rich-text', RichTextControl, RichTextPreview);
// The preview frame gets the website's styles, so fonts, colours and sizes match.
['../assets/css/industry.css', '../assets/css/rich-text.css']
  .forEach(path => CMS.registerPreviewStyle(new URL(path, window.location.href).href));
