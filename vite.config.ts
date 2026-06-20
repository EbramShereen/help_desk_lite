/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  // App is served at the domain root on Vercel (was '/help_desk_lite/' for GitHub Pages).
  base: '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    // Unit tests live under src/. The Firestore rules test (scripts/) runs in the
    // Firebase emulator via `npm run test:rules`, not in jsdom.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
