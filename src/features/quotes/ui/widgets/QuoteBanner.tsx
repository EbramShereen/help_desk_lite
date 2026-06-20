import { useEffect, useRef, useState } from 'react';
import { useQuoteController, randomQuote } from '../../logic/useQuoteController';
import type { Quote } from '../../../../core/data/models/response/quotes/quote_response';

/** How long a chip stays on screen before auto-hiding. */
const VISIBLE_MS = 60_000;
/** Gap after a chip hides before the next random quote appears. */
const REAPPEAR_MS = 30_000;

/**
 * Floating notification chip shown on every authenticated page. Displays ONE
 * random workspace quote for one minute, then auto-hides; the user can also
 * dismiss it at any time. After it hides, a new random quote re-appears after a
 * short gap, so quotes keep rotating.
 */
export function QuoteBanner() {
  const { quotes } = useQuoteController();
  const [quote, setQuote] = useState<Quote | null>(null);
  const hasShownRef = useRef(false);

  // When nothing is showing and quotes exist, schedule the next appearance.
  // First appearance is immediate; later ones wait a gap. setState only runs
  // inside the timer callback (never synchronously in the effect body).
  useEffect(() => {
    if (quote || quotes.length === 0) return;
    const delay = hasShownRef.current ? REAPPEAR_MS : 0;
    const timer = setTimeout(() => {
      hasShownRef.current = true;
      setQuote(randomQuote(quotes));
    }, delay);
    return () => clearTimeout(timer);
  }, [quote, quotes]);

  // While a chip is visible, auto-hide it after a minute.
  useEffect(() => {
    if (!quote) return;
    const timer = setTimeout(() => setQuote(null), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [quote]);

  if (!quote) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="flex items-start gap-3 rounded-card border border-surface-border bg-primary-subtle px-4 py-3 shadow-card">
        <p className="text-sm font-medium text-primary">
          “{quote.text}”<span className="ml-2 text-content-muted">— {quote.author}</span>
        </p>
        <button
          type="button"
          onClick={() => setQuote(null)}
          aria-label="Dismiss"
          className="shrink-0 rounded-control px-1.5 text-content-muted transition-colors hover:bg-surface-muted hover:text-content"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
