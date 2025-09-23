import { createServer } from 'http';
import { promisify } from 'util';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function getAvailablePort(startPort = 5000, endPort = 6000) {
  for (let port = startPort; port <= endPort; port++) {
    try {
      const server = createServer();
      await new Promise((resolve) => {
        server.once('error', () => resolve(false));
        server.once('listening', () => {
          server.close();
          resolve(true);
        });
        server.listen(port, '127.0.0.1');
      });
      return port;
    } catch (error) {
      console.log(`Port ${port} is in use, trying next port...`);
    }
  }
  throw new Error('No available ports found');
}

async function updateViteConfig(port) {
  const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
  try {
    let content = await fs.readFile(viteConfigPath, 'utf-8');
    const updatedContent = content.replace(
      /target: 'http:\/\/localhost:\d+',/,
      `target: 'http://localhost:${port}',`
    );
    if (updatedContent !== content) {
      await fs.writeFile(viteConfigPath, updatedContent, 'utf-8');
      console.log(`✅ Updated Vite config to use port ${port}`);
    }
  } catch (error) {
    console.error('⚠️ Could not update Vite config:', error.message);
  }
}

async function start() {
  try {
    const port = await getAvailablePort(5000, 6000);
    console.log(`Starting server on port ${port}...`);
    
    // Update Vite config with the new port
    await updateViteConfig(port);
    
    // Start the server with the selected port
    const { spawn } = await import('child_process');
    const server = spawn('node', ['server.js'], {
      env: { ...process.env, PORT: port.toString() },
      stdio: 'inherit',
      shell: true
    });

    server.on('error', (error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });

    process.on('SIGINT', () => {
      server.kill('SIGINT');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

start();
