import dotenv from 'dotenv';
import http from 'http';
import { WebSocketServer } from 'ws';
import app from './app.js';
import { connectDB } from './src/config/database-connection.js';

// Load environment variables
dotenv.config();

// Set default port
const PORT = process.env.PORT || 5001;

// WebSocket server setup
const server = http.createServer(app);
const wss = new WebSocketServer({ 
  server,
  // Handle protocol upgrade manually to properly parse the URL
  verifyClient: (info, done) => {
    // Extract the URL path from the request
    const fullUrl = new URL(`ws://${info.req.headers.host}${info.req.url}`);
    info.req.url = fullUrl.pathname; // Store the path for later use
    return done(true);
  }
});

// Store connected clients
const clients = new Map(); // Using Map to store clients by path

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  
  // Get the path from the request URL
  const path = req.url || '/';
  console.log(`WebSocket connected to path: ${path}`);
  
  console.log('WebSocket connected to path:', path);
  
  // Store the path with the WebSocket connection
  ws.path = path;
  
  // Add new client
  clients.add(ws);
  
  // Handle messages from client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received on ${path}:`, data);
      
      // Broadcast to all clients on the same path except the sender
      broadcast(JSON.stringify(data), ws, path);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected from path:', path);
    clients.delete(ws);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Function to broadcast to clients on the same path
function broadcast(message, sender, path) {
  let clientsToNotify = clients;
  
  // If path is provided, only send to clients on the same path
  if (path) {
    clientsToNotify = Array.from(clients).filter(client => client.path === path);
  }
  
  for (const client of clientsToNotify) {
    // Don't send back to the sender if it's a broadcast
    if (client !== sender && client.readyState === 1) { // 1 = OPEN
      client.send(message);
    }
  }
}

// Load environment variables
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

console.log('Starting server with port:', PORT);
console.log('WebSocket server will run on port:', PORT);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  // Close server & exit process
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start the HTTP and WebSocket server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`API URL: http://localhost:${PORT}`);
      console.log(`WebSocket server running on ws://localhost:${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.log('UNHANDLED REJECTION! Shutting down...');
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
