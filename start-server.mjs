import { createServer } from 'net';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);
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

async function findAvailablePort(startPort = 5000, endPort = 6000) {
  for (let port = startPort; port <= endPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
    console.log(`Port ${port} is in use, trying next port...`);
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

async function start() {
  try {
    // Try to find an available port between 5000 and 6000
    const port = await findAvailablePort(5000, 6000);
    console.log(`\n🎉 Found available port: ${port}`);
    
    // Update Vite config with the new port
    await updateViteConfig(port);
    
    console.log(`\n🚀 Starting server on port ${port}...\n`);
    
    // Start the server with the selected port
    const serverProcess = exec(`PORT=${port} node server.js`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
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
      process.stdout.write(`[Server] ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
      process.stderr.write(`[Server Error] ${data}`);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      serverProcess.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Start the server
start();
