import { copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages serves the preview from /<repo>/, not the domain root. This points the image paths written in
 * components there, and adds the files Pages needs: 404.html sends deep links back to the app, and .nojekyll
 * stops Pages processing the build.
 */
function githubPages(base, outDir) {
  return {
    name: 'jayashri-github-pages',
    transform(code, id) {
      // .jsx only: api.js must keep checking the raw "/images/" prefix of paths that come from the data.
      if (!/[\\/]src[\\/].*\.jsx$/.test(id)) return null;
      return { code: code.replace(/(["'`])\/images\//g, `$1${base}images/`), map: null };
    },
    transformIndexHtml(html) {
      return html.replace(/(["'])\/images\//g, `$1${base}images/`);
    },
    closeBundle() {
      copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'));
      writeFileSync(join(outDir, '.nojekyll'), '');
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // In development the API runs separately; Vite forwards /api and /uploads to it so the browser sees one origin.
  const backend = env.VITE_DEV_BACKEND || 'http://localhost:8070';
  const proxy = { '/api': backend, '/uploads': backend };
  const isPages = mode === 'pages';
  const base = isPages ? env.VITE_PAGES_BASE || '/jayashree_construction_developers/' : '/';
  const outDir = isPages ? 'dist-pages' : 'dist';

  return {
    base,
    plugins: [react(), ...(isPages ? [githubPages(base, outDir)] : [])],
    server: { port: 5170, proxy },
    preview: { port: 5170, proxy },
    build: {
      outDir,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  };
});
