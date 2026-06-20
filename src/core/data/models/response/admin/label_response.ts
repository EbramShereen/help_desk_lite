import type { DocData } from '../../../firebase/FirestoreHandler';

/** Admin-managed global labels. Tickets reference these by id. */
export interface Label {
  id: string;
  name: string;
  color: string;
}

export function labelFromDoc(doc: DocData): Label {
  return {
    id: doc.id,
    name: String(doc.name ?? ''),
    color: String(doc.color ?? '#C9A86A'),
  };
}
