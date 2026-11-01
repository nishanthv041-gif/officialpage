import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function spaStaticFallbackPlugin(): Plugin {
  return {
    name: 'spa-static-fallback',
    closeBundle() {
      const distDir = path.resolve(import.meta.dirname, 'dist');
      const indexHtml = path.join(distDir, 'index.html');
      if (!fs.existsSync(indexHtml)) return;

      // Copy index.html to 404.html for hosts that use 404.html as SPA fallback
      fs.copyFileSync(indexHtml, path.join(distDir, '404.html'));

      // Pre-create route directories with index.html so /admin and all routes never 404 on static hosts
      const routes = [
        'admin',
        'about',
        'academics',
        'galleries',
        'events',
        'sports',
        'achievements',
        'admissions',
        'contact',
        'location',
      ];
      for (const route of routes) {
        const routeDir = path.join(distDir, route);
        fs.mkdirSync(routeDir, {recursive: true});
        fs.copyFileSync(indexHtml, path.join(routeDir, 'index.html'));
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), spaStaticFallbackPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 2500,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

