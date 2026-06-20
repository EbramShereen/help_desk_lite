export const LINK_TYPES = ['blocks', 'requires', 'relates'] as const;
export type LinkType = (typeof LINK_TYPES)[number];
