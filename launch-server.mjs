import { createServer } from 'net';
import { readFile, writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const MIN_PORT = 30000;
const MAX_PORT = 50000;
const MAX_ATTEMPTS = 50;

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.unref();
    server.on('error', () => resolve(false));
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
  });
}

// Function to find an available port
async function findAvailablePort() {
  let attempts = 0;
  
  while (attempts < MAX_ATTEMPTS) {
    const port = Math.floor(Math.random() * (MAX_PORT - MIN_PORT + 1)) + MIN_PORT;
    
    if (await isPortAvailable(port)) {
      console.log(`✅ Found available port: ${port}`);
      return port;
    }
    
    attempts++;
    console.log(`Port ${port} is in use, trying another... (attempt ${attempts}/${MAX_ATTEMPTS})`);
  }
  
  throw new Error(`Could not find an available port after ${MAX_ATTEMPTS} attempts`);
}

// Function to update Vite config with the new port
async function updateViteConfig(port) {
  const viteConfigPath = join(__dirname, 'vite.config.ts');
  
  try {
    let content = await readFile(viteConfigPath, 'utf8');
    const updatedContent = content.replace(
      /target: 'http:\/\/localhost:\d+',/,
      `target: 'http://localhost:${port}',`
    );
    
    if (updatedContent !== content) {
      await writeFile(viteConfigPath, updatedContent, 'utf8');
      console.log(`✅ Updated Vite config to use port ${port}`);
    }
  } catch (error) {
    console.error('⚠️ Could not update Vite config:', error.message);
  }
}

// Function to start the server
async function startServer(port) {
  return new Promise((resolve, reject) => {
    let serverProcess;
    let wsServerProcess;
    let hasError = false;

    // Start the main server with the selected port
    serverProcess = exec(`cross-env PORT=${port} node server.js`, {
      env: { ...process.env, PORT: port.toString() }
    });

    // Handle main server output and errors
    serverProcess.stdout.on('data', (data) => {
      process.stdout.write(`[Server] ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
      process.stderr.write(`[Server Error] ${data}`);
      if (data.includes('EADDRINUSE')) {
        hasError = true;
        reject(new Error(`Port ${port} is already in use`));
      }
    });

    serverProcess.on('error', (error) => {
      if (!hasError) {
        hasError = true;
        console.error(`[Server Error] ${error.message}`);
        reject(error);
      }
    });

    // Start WebSocket server
    wsServerProcess = exec('node websocket-server.js', {
      env: { ...process.env, WS_PORT: '3003' }
    });

    // Handle WebSocket server output and errors
    wsServerProcess.stdout.on('data', (data) => {
      process.stdout.write(`[WebSocket] ${data}`);
    });

    wsServerProcess.stderr.on('data', (data) => {
      process.stderr.write(`[WebSocket Error] ${data}`);
      if (!hasError && data.includes('EADDRINUSE')) {
        hasError = true;
        reject(new Error('WebSocket port 3003 is already in use'));
      }
    });

    wsServerProcess.on('error', (error) => {
      if (!hasError) {
        hasError = true;
        console.error(`[WebSocket Error] ${error.message}`);
        reject(error);
      }
    });

    // Cleanup function
    const cleanup = () => {
      if (serverProcess) serverProcess.kill();
      if (wsServerProcess) wsServerProcess.kill();
    };

    // Handle process termination
    const handleExit = () => {
      console.log('\n🛑 Shutting down servers...');
      cleanup();
      process.exit(0);
    };

    // Set up signal handlers
    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);

    // Cleanup on unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      cleanup();
      process.exit(1);
    });

    // If we get here, both servers started successfully
    console.log('✅ Servers started successfully');
    resolve();
  });
}

// Main function
async function main() {
  try {
    // Find an available port
    const port = await findAvailablePort();
    
    // Update Vite config with the new port
    await updateViteConfig(port);
    
    // Start the server
    await startServer(port);
    
    console.log(`\n🎉 Server is running on http://localhost:${port}`);
    console.log(`🌐 API URL: http://localhost:${port}/api`);
    console.log('\nPress Ctrl+C to stop the server\n');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
main();
