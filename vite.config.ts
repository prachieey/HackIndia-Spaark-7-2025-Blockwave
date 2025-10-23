import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import type { ProxyOptions } from 'vite';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Load environment variables
const backendPort = '5002';
// Use port 3001 to avoid conflicts
const frontendPort = 3001;

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
        "connect-src 'self' https://api.emailjs.com http://localhost:* https://localhost:* ws://localhost:* wss://localhost:* http://127.0.0.1:* ws://127.0.0.1:* wss://127.0.0.1:*;",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
        "style-src 'self' 'unsafe-inline';",
        "img-src 'self' data: blob: https:;",
        "font-src 'self' data:;",
        "frame-src 'self';",
        "object-src 'none';"
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
      '@tsparticles/engine',
      'three',
      'three/examples/jsm/loaders/GLTFLoader',
      'three/examples/jsm/controls/OrbitControls',
      '@emotion/react',
      '@emotion/styled',
      '@radix-ui/react-*',
      'framer-motion',
      'axios',
      'date-fns',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore'
    ],
    exclude: [
      '@nomicfoundation/hardhat-chai-matchers',
      'js-big-decimal'
    ],
    esbuildOptions: {
      target: 'es2020',
      define: {
        global: 'globalThis',
      },
    },
  },
  
  define: {
    'import.meta.env.BACKEND_PORT': JSON.stringify(backendPort),
    'import.meta.env.WS_URL': JSON.stringify(`ws://localhost:${frontendPort}`)
  },
});
