/** Breakpoint pixel values — must mirror Tailwind's default screens. */
export const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;

export type Breakpoint = keyof typeof breakpoints;
export const breakpointOrder: Breakpoint[] = ['sm', 'md', 'lg', 'xl', '2xl'];
