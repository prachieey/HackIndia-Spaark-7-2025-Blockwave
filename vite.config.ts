import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    headers: command === 'serve' ? {
      'Content-Security-Policy': `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https:;
        style-src 'self' 'unsafe-inline' https:;
        img-src 'self' data: https:;
        font-src 'self' https: data:;
        connect-src 'self' https: wss: ws: http://localhost:*;
        frame-src 'self' https:;
        worker-src 'self' blob: data:;
      `.replace(/\s+/g, ' ').trim()
    } : {}
  }
}));
