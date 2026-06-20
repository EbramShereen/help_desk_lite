import type { DocData } from '../../../firebase/FirestoreHandler';

/** A workspace quote, published by an owner and shown to all workspace users. */
export interface Quote {
  id: string;
  text: string;
  author: string;
  createdAt: number;
}

export function quoteFromDoc(doc: DocData): Quote {
  return {
    id: doc.id,
    text: String(doc.text ?? ''),
    author: String(doc.author ?? 'Unknown'),
    createdAt: Number(doc.createdAt ?? 0),
  };
}
