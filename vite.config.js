import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    // Disabled for production: source maps would publish the full readable
    // source on a public GitHub Pages site and add ~2.4 MB to the deploy.
    sourcemap: false
  }
});
