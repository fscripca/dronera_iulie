import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // ✅ default dev port
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('[proxy error]', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[proxy req]', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[proxy res]', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  define: {
    'process.env': process.env // ✅ allows using process.env for env variables (like in Supabase)
  }
});
