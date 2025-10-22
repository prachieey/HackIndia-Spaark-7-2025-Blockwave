import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import type { ProxyOptions } from 'vite';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Load environment variables
const backendPort = '5002';
const frontendPort = parseInt(process.env.FRONTEND_PORT || '3000', 10);

// Proxy configuration
const proxyConfig: Record<string, string | ProxyOptions> = {
  '^/api/.*': {
    target: `http://127.0.0.1:${backendPort}`,
    changeOrigin: true,
    secure: false,
    ws: true,
    configure: (proxy, _options) => {
      proxy.on('error', (err: Error) => {
        console.error('Proxy error:', err);
      });
      proxy.on('proxyReq', (proxyReq) => {
        console.log('Sending request to:', proxyReq.method, proxyReq.path);
        proxyReq.setHeader('Accept', 'application/json');
        proxyReq.setHeader('Origin', `http://localhost:${frontendPort}`);
        console.log('Request headers:', proxyReq.getHeaders());
      });
      proxy.on('proxyRes', (proxyRes, _req, res) => {
        console.log('Received response with status:', proxyRes.statusCode);
        res.setHeader('Access-Control-Allow-Origin', `http://localhost:${frontendPort}`);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
        console.log('Response headers:', proxyRes.headers);
      });
    }
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: frontendPort,
    strictPort: true,
    host: '0.0.0.0',
    open: true,
    fs: {
      strict: true,
    },
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
    },
    headers: {
      'Content-Security-Policy': [
        "default-src 'self';",
        // Allow media from Google domains
        "media-src 'self' blob: data: http: https: *.googleusercontent.com *.googlevideo.com *.googleapis.com *.gstatic.com;",
        // Other CSP directives...
        "img-src 'self' data: blob: https: https://*.google.com https://*.google-analytics.com https://*.firebase.com https://*.gstatic.com https://*.google.com/ads/ https://*.doubleclick.net https://www.googletagmanager.com;",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com https://www.google-analytics.com https://www.googletagmanager.com https://ssl.google-analytics.com https://tagmanager.google.com https://*.firebase.com https://*.firebaseio.com https://*.googleapis.com;",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://tagmanager.google.com https://www.gstatic.com;",
        "connect-src 'self' http: https: ws: wss: http://localhost:* ws://localhost:* wss://localhost:* http://127.0.0.1:* ws://127.0.0.1:* wss://127.0.0.1:* https://*.firebaseio.com wss://*.firebaseio.com https://*.googleapis.com https://*.firebase.com https://*.firebaseinstallations.googleapis.com https://*.firestore.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://firebase.googleapis.com https://*.firebaseio.com *.googleusercontent.com;",
        "font-src 'self' data: https: https://fonts.gstatic.com;",
        "frame-src 'self' https: https://www.google.com https://*.doubleclick.net https://*.google-analytics.com https://www.googletagmanager.com https://*.firebaseapp.com;",
        "object-src 'none';",
        "worker-src 'self' blob: https://*.firebaseio.com;",
        "form-action 'self' https:;",
        "base-uri 'self';",
        "frame-ancestors 'self' https:;",
        "upgrade-insecure-requests;"
      ].join(' ')
    },
    proxy: proxyConfig,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: frontendPort,
      overlay: true
    }
  },
  base: '/',
  publicDir: 'public',
  
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
  
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
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
          ethers: ['ethers'],
          web3: ['@web3-react/core', '@web3-react/injected-connector'],
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
      'ethers',
      '@web3-react/core',
      '@web3-react/injected-connector',
      '@emotion/react',
      '@emotion/styled',
    ],
    exclude: ['@nomicfoundation/hardhat-chai-matchers', 'js-big-decimal'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  
  define: {
    'import.meta.env.BACKEND_PORT': JSON.stringify(backendPort),
    'import.meta.env.WS_URL': JSON.stringify(`ws://localhost:${frontendPort}`)
  },
});
