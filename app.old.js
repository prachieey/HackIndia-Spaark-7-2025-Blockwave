import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import userRoutes from './src/routes/userRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import ticketRoutes from './src/routes/ticketRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import healthRoutes from './src/routes/healthRoutes.js';

// Create Express app
const app = express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Temporarily disabled for development
  crossOriginEmbedderPolicy: false,
}));

// Trust proxy
app.set('trust proxy', 1);

// CORS configuration
const whitelist = ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('CORS blocked request from origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'X-Access-Token',
    'X-Forwarded-For',
    'X-Forwarded-Proto',
    'X-Forwarded-Port'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Authorization',
    'X-Total-Count',
    'X-Request-Id',
    'X-Response-Time'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS with the above configuration
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// API Root Endpoint
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Scantyx API',
    version: '1.0.0',
    endpoints: [
      '/api/v1/auth - Authentication endpoints',
      '/api/v1/users - User management',
      '/api/v1/events - Event management',
      '/api/v1/tickets - Ticket management',
      '/api/v1/payments - Payment processing',
      '/api/v1/reviews - Event reviews'
    ]
  });
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Configure static file serving with proper MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

// Serve static files from the dist directory with proper MIME types
const staticOptions = {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    } else {
      // Default to octet-stream if MIME type is not found
      res.setHeader('Content-Type', 'application/octet-stream');
    }
    // Enable CORS for all static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Cache static assets for 1 year
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
};

// Custom static file middleware with MIME type handling
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }

  // Skip non-GET requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }

  // Handle static files
  const filePath = path.join(__dirname, 'dist', req.path);
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return next();
    }

    // Set appropriate content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }
    
    // Set cache control headers
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Serve the file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', filePath, err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error serving file' });
        }
      }
    });
  });
});

// Serve index.html for all other routes to support client-side routing
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Set headers for HTML content
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).json({
        status: 'error',
        message: 'Error serving the application',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Error handling middleware for static files
app.use((err, req, res, next) => {
  if (err) {
    console.error('Error serving static file:', err);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Error serving static file',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  } else {
    next();
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  const response = {
    status: 'error',
    message: 'Internal Server Error'
  };
  
  if (process.env.NODE_ENV === 'development') {
    response.error = err.message;
    response.stack = err.stack;
  }
  
  res.status(500).json(response);
});

export default app;
