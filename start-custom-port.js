import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use a custom high port that's very unlikely to be in use
const CUSTOM_PORT = 40000 + Math.floor(Math.random() * 10000);

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

function startServer(port) {
  console.log(`🚀 Starting server on port ${port}...\n`);
  
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
    const output = data.toString();
    process.stdout.write(`[Server] ${output}`);
  });

  serverProcess.stderr.on('data', (data) => {
    const error = data.toString();
    process.stderr.write(`[Server Error] ${error}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill();
    process.exit(0);
  });

  return serverProcess;
}

async function start() {
  try {
    // Update Vite config with the custom port
    await updateViteConfig(CUSTOM_PORT);
    
    // Start the server
    startServer(CUSTOM_PORT);
    
    console.log(`\n🎉 Server should be running on http://localhost:${CUSTOM_PORT}`);
    console.log(`🌐 API URL: http://localhost:${CUSTOM_PORT}/api`);
    console.log('\nIf you see any errors above, please check the output for more details.');
    console.log('Press Ctrl+C to stop the server\n');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
start();
