/**
 * Paged list payload returned by repo list operations. Wraps the page `items`
 * alongside lightweight pagination metadata so callers can read `result.items`
 * today and gain `total`/`hasMore` without a signature change.
 *
 * Usage: `Result<AppError, MultipleResult<Ticket>>`. Construct with the
 * `toMultipleResult` helper rather than building the object by hand.
 */
export interface MultipleResult<T> {
  /** The items on this page (already truncated to `pageSize` when provided). */
  readonly items: T[];
  /** Total number of items before any `pageSize` truncation. */
  readonly total: number;
  /** Page size applied, or undefined when the full set was returned. */
  readonly pageSize?: number;
  /** True when `pageSize` truncated the set (more items exist). */
  readonly hasMore: boolean;
}

/**
 * Build a `MultipleResult` from a full item list. When `pageSize` is given the
 * list is truncated to that many items and `hasMore`/`total` reflect the
 * untruncated count; otherwise the whole list is returned.
 */
export function toMultipleResult<T>(items: T[], pageSize?: number): MultipleResult<T> {
  const total = items.length;
  const paged = pageSize !== undefined ? items.slice(0, pageSize) : items;
  return {
    items: paged,
    total,
    pageSize,
    hasMore: pageSize !== undefined && total > pageSize,
  };
}
