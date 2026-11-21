import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { diagnosticsPlugin } from './diagnostics/vite-plugin-diagnostics.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      base: '/game_modules/kred/',
      plugins: [react()],
      define: {
        'process.env.NODE_ENV': JSON.stringify('production')
      },
      build: {
        outDir: 'dist-client',
        emptyOutDir: true,
        copyPublicDir: false,
        cssCodeSplit: false,
        lib: {
          entry: path.resolve(__dirname, 'src/clientEntry.jsx'),
          name: 'KredModule',
          formats: ['iife'],
          fileName: () => 'client.js'
        },
        rollupOptions: {
          output: {
            assetFileNames: (assetInfo) =>
              assetInfo.name && assetInfo.name.endsWith('.css') ? 'style.css' : 'assets/[name][extname]'
          }
        }
      }
    };
  }

  return {
    base: './',
    plugins: [react(), diagnosticsPlugin()],
    server: {
      port: 3000,
      open: true
    }
  };
});
