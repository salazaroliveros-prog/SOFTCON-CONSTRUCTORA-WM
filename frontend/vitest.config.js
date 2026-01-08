import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './setupTests.js',
    include: ['tests/unit/**/*.{js,jsx,ts,tsx}'],
    exclude: ['src/__tests__/**', 'tests/e2e/**', 'e2e/**'],
  },
});
