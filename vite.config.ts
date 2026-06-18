/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/help_desk_lite/',
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
