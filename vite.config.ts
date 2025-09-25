import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import type { ProxyOptions } from 'vite';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Load environment variables
const backendPort = process.env.BACKEND_PORT || '5001';
const apiVersion = process.env.API_VERSION || 'v1';
const frontendPort = parseInt(process.env.FRONTEND_PORT || '3000', 10);

// Proxy configuration
const proxyConfig: Record<string, string | ProxyOptions> = {
  '^/api/.*': {
    target: `http://localhost:${backendPort}`,
    changeOrigin: true,
    secure: false,
    ws: true,
    configure: (proxy) => {
      proxy.on('error', (err: Error) => {
        console.log('Proxy error:', err);
      });
      proxy.on('proxyReq', (proxyReq) => {
        console.log('Sending request to:', proxyReq.method, proxyReq.path);
      });
      proxy.on('proxyRes', (proxyRes) => {
        console.log('Received response with status:', proxyRes.statusCode);
      });
    }
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  publicDir: 'public',
  
  // CSS configuration
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  
  // Make environment variables available to the client
  define: {
    'import.meta.env.BACKEND_PORT': JSON.stringify(backendPort),
    'import.meta.env.API_VERSION': JSON.stringify(apiVersion),
    'import.meta.env.WS_URL': JSON.stringify(`ws://localhost:${frontendPort}`)
  },
  
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin']
      },
      jsxRuntime: 'automatic',
      include: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js']
    })
  ],
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  
  server: {
    port: frontendPort,
    strictPort: true,
    host: '0.0.0.0',
    open: true,
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
    },
    headers: {
      'Content-Security-Policy': `
        default-src 'self';
        connect-src 'self' 
          http://localhost:* 
          ws://localhost:* 
          wss://localhost:* 
          http://127.0.0.1:* 
          ws://127.0.0.1:* 
          wss://127.0.0.1:*
          https://*.firebaseio.com 
          wss://*.firebaseio.com 
          https://*.googleapis.com 
          https://*.firebase.com 
          https://*.firebaseinstallations.googleapis.com 
          https://*.firestore.googleapis.com 
          https://www.google-analytics.com 
          https://*.google-analytics.com 
          https://*.analytics.google.com 
          https://*.googletagmanager.com;
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com/ https://www.google.com https://www.google-analytics.com https://www.googletagmanager.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://tagmanager.google.com;
        img-src 'self' data: blob: https: https://*.google.com https://*.google-analytics.com https://*.firebase.com https://*.gstatic.com https://*.google.com/ads/ https://*.doubleclick.net/;
        font-src 'self' https://fonts.gstatic.com;
        frame-src 'self' https://www.google.com https://*.doubleclick.net/ https://*.google-analytics.com/;
      `.replace(/\s+/g, ' ').trim()
    },
    proxy: proxyConfig,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: frontendPort
    }
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['axios', 'date-fns'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
        },
      },
    },
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@emotion/react',
      '@emotion/styled',
    ],
    exclude: ['js-big-decimal'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
});
