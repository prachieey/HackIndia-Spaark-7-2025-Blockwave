import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use a high port that's less likely to be in use
const HIGH_PORT = 30000 + Math.floor(Math.random() * 10000);

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
  return new Promise((resolve, reject) => {
    console.log(`🚀 Starting server on port ${port}...\n`);
    
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
    // Update Vite config with the high port
    await updateViteConfig(HIGH_PORT);
    
    // Start the server
    await startServer(HIGH_PORT);
    
    console.log(`\n🎉 Server is running on http://localhost:${HIGH_PORT}`);
    console.log(`🌐 API URL: http://localhost:${HIGH_PORT}/api`);
    console.log('\nPress Ctrl+C to stop the server\n');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.log('\nTrying a different port...\n');
    
    // Try one more time with a different port
    try {
      const anotherPort = HIGH_PORT + 1;
      await updateViteConfig(anotherPort);
      await startServer(anotherPort);
      
      console.log(`\n🎉 Server is running on http://localhost:${anotherPort}`);
      console.log(`🌐 API URL: http://localhost:${anotherPort}/api`);
      console.log('\nPress Ctrl+C to stop the server\n');
      
    } catch (secondError) {
      console.error('❌ Failed to start server after retry:', secondError.message);
      console.log('\nPlease check your system for any running Node.js processes and try again.');
      process.exit(1);
    }
  }
}

// Start the server
start();
