/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// HashRouter evita la necesidad de redirecciones de servidor en GitHub Pages.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/DIRI-ProyectoFinal-LaParada/' : '/',
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], css: false }
}));
