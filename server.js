import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';

// Import routes
import userRoutes from './src/routes/userRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import ticketRoutes from './src/routes/ticketRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI_DEV || 'mongodb://127.0.0.1:27017/scantyx-dev';

// Set security HTTP headers with CSP configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'"
        ],
        imgSrc: [
          "'self'",
          'data:',
          'https:'
        ],
        connectSrc: [
          "'self'",
          'http://localhost:*',
          'ws://localhost:*',
          'wss://*',
          'https://*'
        ],
        fontSrc: [
          "'self'",
          'data:',
          'https:'
        ],
        frameSrc: [
          "'self'",
          'https:'
        ],
        workerSrc: [
          "'self'",
          'blob:',
          'data:'
        ]
      }
    }
  })
);

// Enable CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      console.warn(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Simple request time middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// API root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Scantyx API',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      events: '/api/v1/events',
      tickets: '/api/v1/tickets',
      health: '/api/health'
    },
    documentation: 'Coming soon...'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debug middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes with logging
console.log('Mounting routes...');
console.log('  - /api/v1/users');
console.log('  - /api/v1/events');
console.log('  - /api/v1/tickets');
console.log('  - /api/v1/auth');

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/auth', authRoutes);

console.log('Routes mounted successfully');

// Serve static files from the dist directory
app.use(express.static('dist'));

// Handle client-side routing - return all requests to the app
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'dist' });
});

// Handle API 404 - Not Found
app.all('/api/*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err);
  
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.message || 'Something went wrong!';
  
  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status,
      message,
      error: err,
      stack: err.stack
    });
  } else {
    res.status(statusCode).json({
      status,
      message: statusCode === 500 ? 'Something went wrong!' : message
    });
  }
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ MongoDB connected successfully');
    
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.log('UNHANDLED REJECTION! 💥 Shutting down...');
      console.log(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      console.log(err.name, err.message);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
console.log('Starting server...');
startServer();

export default app;
