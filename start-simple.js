import { createServer } from 'net';
import { readFile, writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function findAvailablePort(startPort = 3000, endPort = 40000) {
  for (let port = startPort; port <= endPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available ports between ${startPort} and ${endPort}`);
}

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

async function startServer(port) {
  console.log(`🚀 Starting server on port ${port}...\n`);
  
  return new Promise((resolve, reject) => {
    const serverProcess = exec(`PORT=${port} node server.js`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });

    // Forward server output
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(`[Server] ${output}`);
      
      // Check if server started successfully
      if (output.includes('Server running in')) {
        resolve(serverProcess);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      process.stderr.write(`[Server Error] ${error}`);
      
      // Check for port in use error
      if (error.includes('EADDRINUSE')) {
        reject(new Error('Port already in use'));
      }
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      serverProcess.kill();
      process.exit(0);
    });
  });
}

async function start() {
  try {
    // Find an available port
    const port = await findAvailablePort(40000, 50000);
    console.log(`Found available port: ${port}`);
    
    // Update Vite config
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
start();
