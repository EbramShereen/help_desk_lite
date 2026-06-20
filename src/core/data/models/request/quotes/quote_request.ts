import { z } from 'zod';

export const quoteInputSchema = z.object({
  text: z.string().min(1, 'Quote text is required'),
  author: z.string().optional(),
});
export type QuoteInput = z.infer<typeof quoteInputSchema>;

export function quoteToDoc(input: QuoteInput): Record<string, unknown> {
  return {
    text: input.text,
    author: input.author?.trim() || 'Unknown',
    createdAt: Date.now(),
  };
}
