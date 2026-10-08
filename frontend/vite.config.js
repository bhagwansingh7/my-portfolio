import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the API runs on :5000; proxying keeps cookies same-origin (no CORS headaches).
const target = process.env.VITE_PROXY_TARGET || 'https://my-portfolio-1c1k.onrender.com';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: { '/api': target, '/uploads': target, '/sitemap.xml': target },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], motion: ['framer-motion'] },
      },
    },
  },
});
