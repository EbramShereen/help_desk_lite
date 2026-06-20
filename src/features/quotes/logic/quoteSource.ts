import type { QuoteInput } from '../../../core/data/models/request/quotes/quote_request';

/** Bundled fallback used when the free quotes API is unreachable. */
export const QUOTE_SEED: QuoteInput[] = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'Simplicity is the soul of efficiency.', author: 'Austin Freeman' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
  { text: 'The best way to predict the future is to invent it.', author: 'Alan Kay' },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  {
    text: 'Great things are done by a series of small things brought together.',
    author: 'Vincent van Gogh',
  },
  { text: 'Your limitation—it is only your imagination.', author: 'Unknown' },
  { text: 'Push yourself, because no one else is going to do it for you.', author: 'Unknown' },
  { text: 'Success is not final, failure is not fatal.', author: 'Winston Churchill' },
  { text: 'Dream bigger. Do bigger.', author: 'Unknown' },
  { text: 'Little things make big days.', author: 'Unknown' },
  {
    text: 'Do something today that your future self will thank you for.',
    author: 'Sean Patrick Flanery',
  },
  {
    text: 'The harder you work for something, the greater you will feel when you achieve it.',
    author: 'Unknown',
  },
  { text: 'Discipline is the bridge between goals and accomplishment.', author: 'Jim Rohn' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'A goal without a plan is just a wish.', author: 'Antoine de Saint-Exupéry' },
  { text: 'What you do today can improve all your tomorrows.', author: 'Ralph Marston' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Believe you can and you are halfway there.', author: 'Theodore Roosevelt' },
  { text: 'Quality means doing it right when no one is looking.', author: 'Henry Ford' },
  { text: 'Either you run the day or the day runs you.', author: 'Jim Rohn' },
  { text: 'Opportunities do not happen. You create them.', author: 'Chris Grosser' },
  { text: 'Hard work beats talent when talent does not work hard.', author: 'Tim Notke' },
  { text: 'Progress, not perfection.', author: 'Unknown' },
];

/** Returns `count` random picks from the seed list (no duplicates when possible). */
function seedSample(count: number): QuoteInput[] {
  const pool = [...QUOTE_SEED];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

interface QuotableQuote {
  content: string;
  author: string;
}

/**
 * Fetches `count` quotes from the free, no-key quotable.io API. On any failure
 * (network, non-OK, bad shape) falls back to a random sample of the bundled seed
 * so the Generate button always produces quotes.
 */
export async function fetchRandomQuotes(count: number): Promise<QuoteInput[]> {
  const safeCount = Math.max(1, Math.min(count, QUOTE_SEED.length));
  try {
    const res = await fetch(`https://api.quotable.io/quotes/random?limit=${safeCount}`);
    if (!res.ok) throw new Error(`Quotes API returned ${res.status}`);
    const data: unknown = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Empty quotes response');
    return (data as QuotableQuote[])
      .filter((q) => typeof q?.content === 'string' && q.content.length > 0)
      .map((q) => ({ text: q.content, author: q.author || 'Unknown' }));
  } catch {
    return seedSample(safeCount);
  }
}
