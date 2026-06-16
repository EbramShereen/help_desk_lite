import { cn } from '../../lib/cn';

/**
 * Renders rich-text HTML produced by RichTextEditor. Content is app-authored
 * (ticket descriptions/comments), not arbitrary third-party input.
 */
export function RichTextViewer({ html, className }: { html: string; className?: string }) {
  if (!html) return null;
  return (
    <div
      className={cn('prose prose-sm max-w-none text-content', className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
