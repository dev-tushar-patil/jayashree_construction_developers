import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // In development the API runs separately; Vite forwards /api and /uploads to it so the browser sees one origin.
  const backend = env.VITE_DEV_BACKEND || 'http://localhost:8070';
  const proxy = { '/api': backend, '/uploads': backend };

  return {
    plugins: [react()],
    server: { port: 5170, proxy },
    preview: { port: 5170, proxy },
    build: {
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
