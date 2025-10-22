import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setupStatic = (app) => {
  // In production, serve static files from the React app
  if (process.env.NODE_ENV === 'production') {
    // Set static folder
    const buildPath = path.join(__dirname, 'dist');
    
    // Serve static files from the React app
    app.use(express.static(buildPath));

    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    // In development, redirect to the Vite dev server for client-side routing
    app.get('*', (req, res) => {
      res.redirect(`http://localhost:3000${req.path}`);
    });
  }
};

export default setupStatic;
