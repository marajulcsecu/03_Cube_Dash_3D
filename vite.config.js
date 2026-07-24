import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './', // CRITICAL for MegaGameBox relative paths
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 3000,
    open: false,
    host: true
  },
  test: {
    environment: 'happy-dom',
    globals: true
  }
});
