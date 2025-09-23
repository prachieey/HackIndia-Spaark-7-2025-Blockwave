import WebSocket from 'ws';
import http from 'http';
import { EventEmitter } from 'events';

// Create HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Event emitter for broadcasting messages
const eventEmitter = new EventEmitter();

// Store connected clients
const clients = new Set();

// WebSocket server configuration
const PORT = process.env.WS_PORT || 3003;

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  // Add new client to the set
  clients.add(ws);
  
  // Handle messages from client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
      
      // Broadcast to all clients except the sender
      broadcast(JSON.stringify(data), ws);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Function to broadcast to all connected clients
export function broadcast(message, sender) {
  for (const client of clients) {
    // Don't send back to the sender if it's a broadcast
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Start the server
server.listen(PORT, () => {
  console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});

// Export the WebSocket server and broadcast function
module.exports = { wss, broadcast };
