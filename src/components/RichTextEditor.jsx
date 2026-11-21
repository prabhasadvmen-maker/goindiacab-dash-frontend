import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useCallback } from 'react';
import clsx from 'clsx';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3, Link as LinkIcon, Minus,
  RotateCcw, RotateCw, Quote,
} from 'lucide-react';

const ToolbarBtn = ({ onClick, active, title, disabled, children }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    className={clsx(
      'w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors shrink-0',
      active
        ? 'bg-amber-500 text-white'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      disabled && 'opacity-40 cursor-not-allowed'
    )}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />;

export default function RichTextEditor({ value, onChange, placeholder = 'Write content here...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        underline: false,
        link: false,
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-amber-600 underline' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editable: true,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[220px] px-4 py-3 focus:outline-none text-gray-900 cursor-text',
      },
    },
  });

  // If user pastes raw HTML string (e.g. copied from a code editor), parse and insert as real HTML
  useEffect(() => {
    if (!editor) return;
    const handler = (e) => {
      const text = e.clipboardData?.getData('text/plain') || '';
      const html = e.clipboardData?.getData('text/html') || '';
      // Only intercept when clipboard has NO rich HTML but plain text looks like HTML markup
      if (!html && text.trim().startsWith('<') && /<\/?[a-z][\s\S]*>/i.test(text)) {
        e.preventDefault();
        e.stopPropagation();
        editor.commands.insertContent(text, {
          parseOptions: { preserveWhitespace: false },
        });
      }
    };
    const el = editor.view.dom;
    el.addEventListener('paste', handler, true);
    return () => el.removeEventListener('paste', handler, true);
  }, [editor]);

  // Sync external value changes (e.g. when editing an existing post)
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Enter URL', prev);
    if (url === null) return;
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-xl overflow-visible focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 transition bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {/* Headings */}
        <ToolbarBtn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Text formatting */}
        <ToolbarBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn title="Align Left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Align Center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Align Right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn title="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Numbered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Horizontal Rule" active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Link */}
        <ToolbarBtn title="Insert Link" active={editor.isActive('link')} onClick={setLink}>
          <LinkIcon className="w-4 h-4" />
        </ToolbarBtn>

        <Divider />

        {/* Undo / Redo */}
        <ToolbarBtn title="Undo" active={false} disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <RotateCcw className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn title="Redo" active={false} disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <RotateCw className="w-4 h-4" />
        </ToolbarBtn>
      </div>

      {/* Editor Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
