import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('pixi.js') || id.includes('@pixi')) {
              return 'pixi';
            }
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'vendor';
            }
            if (
              id.includes('@reduxjs') ||
              id.includes('@tanstack/react-query')
            ) {
              return 'state';
            }
            if (id.includes('i18next')) {
              return 'i18n';
            }
            if (
              id.includes('react-markdown') ||
              id.includes('socket.io-client')
            ) {
              return 'utils';
            }
            return 'libs';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
