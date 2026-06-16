import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import { cn } from '../../lib/cn';

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

interface ToolButton {
  label: string;
  title: string;
  isActive: () => boolean;
  run: () => void;
}

/**
 * Tiptap-based rich text editor producing HTML. Controlled via `value`/`onChange`.
 * Toolbar: bold, italic, code, code block, link. Theme-token styled.
 */
export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[8rem] px-3 py-2 focus:outline-none text-content',
      },
    },
  });

  // Keep editor content in sync when the controlled value changes externally.
  useEffect(() => {
    if (editor && value !== editor.getHTML())
      editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt('Link URL');
    if (url === null) return;
    if (url === '') editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url }).run();
  };

  const buttons: ToolButton[] = [
    {
      label: 'B',
      title: 'Bold',
      isActive: () => editor.isActive('bold'),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: 'I',
      title: 'Italic',
      isActive: () => editor.isActive('italic'),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: '</>',
      title: 'Code',
      isActive: () => editor.isActive('code'),
      run: () => editor.chain().focus().toggleCode().run(),
    },
    {
      label: '{ }',
      title: 'Code block',
      isActive: () => editor.isActive('codeBlock'),
      run: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    { label: '🔗', title: 'Link', isActive: () => editor.isActive('link'), run: setLink },
  ];

  return (
    <div
      className={cn(
        'overflow-hidden rounded-control border border-surface-border bg-surface',
        className,
      )}
    >
      <div className="flex items-center gap-1 border-b border-surface-border bg-surface-muted px-2 py-1">
        {buttons.map((b) => (
          <button
            key={b.title}
            type="button"
            title={b.title}
            onClick={b.run}
            className={cn(
              'h-7 min-w-7 rounded px-1.5 text-xs font-semibold text-content-muted transition-colors',
              'hover:bg-surface focus-visible:shadow-focus focus-visible:outline-none',
              b.isActive() && 'bg-primary text-primary-foreground',
            )}
          >
            {b.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} data-placeholder={placeholder} />
    </div>
  );
}
