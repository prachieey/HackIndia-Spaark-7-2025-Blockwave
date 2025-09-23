import net from 'net';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => {
        server.close();
        resolve(true);
      })
      .listen(port);
  });
}

async function findAvailablePort(startPort, endPort) {
  for (let port = startPort; port <= endPort; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
    console.log(`Port ${port} is in use, trying next port...`);
  }
  throw new Error(`No available ports between ${startPort} and ${endPort}`);
}

async function startServer() {
  try {
    // Find an available port
    const port = await findAvailablePort(5000, 6000);
    console.log(`Starting server on port ${port}...`);

    // Start the server with the selected port
    const server = exec(`PORT=${port} node server.js`, (error, stdout, stderr) => {
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

    server.stdout.on('data', (data) => {
      console.log(`Server: ${data}`);
    });

    server.stderr.on('data', (data) => {
      console.error(`Server error: ${data}`);
    });

    process.on('SIGINT', () => {
      console.log('Shutting down server...');
      server.kill();
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
