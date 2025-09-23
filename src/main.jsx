import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Web3Provider } from './contexts/blockchain/Web3Context';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { EventsProvider } from './contexts/EventsContext';
import { AuthModalProvider } from './contexts/AuthModalContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Web3Provider>
          <ThemeProvider>
            <EventsProvider>
              <AuthModalProvider>
                <App />
              </AuthModalProvider>
            </EventsProvider>
          </ThemeProvider>
        </Web3Provider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);