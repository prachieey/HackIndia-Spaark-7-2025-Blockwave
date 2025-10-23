import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Import database connection and models
import { connectDB } from './src/config/database-connection.js';
import './src/models/index.js'; // This will register all models with Mongoose

// Import routes
import eventRoutes from './src/routes/eventRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import emailRoutes from './src/routes/emailRoutes.js';
import newsletterRoutes from './src/routes/newsletterRoutes.js';
import setupStatic from './setupStatic.js';

// Import newsletter scheduler
import { initializeDefaultNewsletters } from './src/services/newsletterScheduler.js';

// API Routes
const API_PREFIX = '/api/v1';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5002; // Ensure this matches server.js

// ======================
// Configuration
// ======================
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:3003',
  'http://127.0.0.1:3003',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5002',
  'http://127.0.0.1:5002',
  'http://localhost:3004',
  'http://127.0.0.1:3004',
  'http://localhost:3005',
  'http://127.0.0.1:3005'
];

// ======================
// Middleware
// ======================

// Request logging
app.use(morgan(isDevelopment ? 'dev' : 'combined'));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests) in development
    if (process.env.NODE_ENV !== 'production' && !origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowedOrigins or if it's a local development server
    if (allowedOrigins.includes(origin) || 
        (process.env.NODE_ENV === 'development' && origin && 
         (origin.includes('localhost') || origin.includes('127.0.0.1')))) {
      return callback(null, true);
    }
    
    // Block the request if the origin is not allowed
    console.warn(`CORS blocked: ${origin} is not in the allowed origins list`);
    const errorMsg = `The CORS policy for this site does not allow access from ${origin}`;
    return callback(new Error(errorMsg), false);
  },
  credentials: true,
  exposedHeaders: ['Set-Cookie', 'set-cookie'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Accept',
    'Accept-Encoding',
    'Accept-Language',
    'Authorization',
    'Cache-Control',
    'Connection',
    'Content-Length',
    'Content-Type',
    'DNT',
    'Host',
    'If-Modified-Since',
    'If-None-Match',
    'Origin',
    'Pragma',
    'Range',
    'Referer',
    'User-Agent',
    'X-Requested-With',
    'X-CSRF-Token',
    'X-XSRF-Token',
    'X-Content-Type-Options',
    'X-Device-Name',
    'X-Device-OS',
    'X-Device-Model',
    'X-User-Id',
    'X-User-Name',
    'X-User-Email',
    'X-User-Role'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-Total-Count',
    'X-Total-Pages',
    'X-Page',
    'X-Per-Page',
    'X-Next-Page',
    'X-Prev-Page',
    'Content-Disposition',
    'Content-Length',
    'Content-Type',
    'ETag',
    'Last-Modified',
    'Date',
    'Cache-Control'
  ],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Enable CORS for all routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ======================
// Request Logging Middleware
// ======================
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  
  const originalSend = res.send;
  res.send = function(body) {
    console.log(`[${new Date().toISOString()}] Response for ${req.method} ${req.originalUrl}:`);
    console.log('Status:', res.statusCode);
    console.log('Headers:', JSON.stringify(res.getHeaders(), null, 2));
    
    // Don't log large responses in production
    if (isDevelopment || (typeof body === 'string' && body.length < 1000)) {
      console.log('Body:', typeof body === 'string' ? body : JSON.stringify(body, null, 2));
    } else {
      console.log('Body: [Response too large to log]');
    }
    
    return originalSend.call(this, body);
  };
  
  next();
});

// ======================
// Health Check Endpoint
// ======================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ======================
// Root Route
// ======================
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to the Scantyx Event Platform API',
    documentation: 'https://github.com/yourusername/scantyx-event-platform#api-documentation',
    endpoints: {
      events: '/api/v1/events',
      health: '/api/health'
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ======================
// API Routes
// ======================
console.log(`\n=== MOUNTING ROUTES ===`);

// Mount API routes with version prefix
console.log('Mounting API routes...');

// Mount all routes with their respective prefixes
app.use(`${API_PREFIX}/events`, eventRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);

// Mount email and newsletter routes (without version prefix for backward compatibility)
app.use('/api/email', emailRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Initialize newsletter scheduler
initializeDefaultNewsletters();

// Log all registered routes
console.log('\n=== REGISTERED ROUTES ===');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${handler.route.path}`);
      }
    });
  }
});
console.log('========================\n');

// ======================
// Static File Serving
// ======================
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app
  const buildPath = path.join(__dirname, 'dist');
  app.use(express.static(buildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // In development, redirect to the Vite dev server for client-side routing
  app.get('*', (req, res) => {
    res.redirect(`http://localhost:3000${req.path}`);
  });
}

// Debug endpoint to list all routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  
  const processRoutes = (stack, path = '') => {
    stack.forEach((layer) => {
      if (layer.route) {
        routes.push({
          path: path + layer.route.path,
          methods: Object.keys(layer.route.methods)
        });
      } else if (layer.name === 'router') {
        const routerPath = layer.regexp.toString()
          .replace('/^\\', '')
          .replace('(?:\\.(?!.*\\.)(?=.*$))?', '')
          .replace('\\/?', '')
          .replace('(?=\\/|$)', '')
          .replace(/\/$/, '')
          .replace(/\\([^\/])/g, '$1');
        
        processRoutes(layer.handle.stack, path + routerPath);
      }
    });
  };
  
  processRoutes(app._router.stack);
  res.json({ routes });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint to list all routes
app.get('/api/routes', (req, res) => {
  const routes = [];
  
  const processRoutes = (stack, path = '') => {
    stack.forEach((layer) => {
      if (layer.route) {
        routes.push({
          path: path + layer.route.path,
          methods: Object.keys(layer.route.methods)
        });
      } else if (layer.name === 'router') {
        const routerPath = layer.regexp.toString()
          .replace('/^', '')
          .replace('\\/?', '')
          .replace('(?=\\/|$)', '')
          .replace(/\/$/, '');
        
        processRoutes(layer.handle.stack, path + routerPath);
      }
    });
  };
  
  processRoutes(app._router.stack);
  res.json({ routes });
});

// Log all registered routes for debugging
const printRoutes = (routes, prefix = '') => {
  routes.forEach((layer) => {
    if (layer.route) {
      // Routes registered directly on the app
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      console.log(`${methods.padEnd(8)} ${prefix}${layer.route.path}`);
    } else if (layer.name === 'router') {
      // Router middleware
      const routerPrefix = layer.regexp.toString().replace(/^\/\^\\(.*\\)\/\?\$/, '$1');
      printRoutes(layer.handle.stack, prefix + routerPrefix);
    }
  });
};

console.log('\n=== ALL REGISTERED ROUTES ===');
printRoutes(app._router.stack);
console.log('===========================\n');

// ======================
// Error Handling
// ======================

// 404 handler
app.use((req, res, next) => {
  console.warn(`404 - ${req.method} ${req.originalUrl} - Route not found`);
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
    path: req.path,
    availableEndpoints: {
      root: '/',
      events: '/api/v1/events',
      reviews: '/api/v1/reviews',
      health: '/api/health'
    },
    documentation: 'https://github.com/yourusername/scantyx-event-platform#api-documentation'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Default to 500 if status code is not set or invalid
  const statusCode = typeof err.status === 'number' ? err.status : 500;
  
  // Handle CORS errors
  if (err.name === 'UnauthorizedError' || (err.message && err.message.includes('CORS'))) {
    return res.status(403).json({
      status: 'error',
      message: 'Not allowed by CORS',
      details: isDevelopment ? err.message : undefined
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: isDevelopment ? err.errors : undefined
    });
  }
  
  // Handle Mongoose cast errors (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid ID format',
      details: isDevelopment ? err.message : undefined
    });
  }
  
  // Handle other errors
  res.status(statusCode).json({
    status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
    message: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// ======================
// Server Startup
// ======================
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      
      // Log all registered routes
      console.log('\n=== REGISTERED ROUTES ===');
      app._router.stack.forEach((middleware) => {
        if (middleware.route) {
          console.log(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
        } else if (middleware.name === 'router') {
          middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
              console.log(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${handler.route.path}`);
            }
          });
        }
      });
      console.log('========================\n');
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') throw error;
      
      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
      
      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;
