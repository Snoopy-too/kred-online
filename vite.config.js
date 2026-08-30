import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { diagnosticsPlugin } from './diagnostics/vite-plugin-diagnostics.js';

export default defineConfig({
  base: './',
  plugins: [react(), diagnosticsPlugin()],
  server: {
    port: 3000,
    open: true
  }
});

