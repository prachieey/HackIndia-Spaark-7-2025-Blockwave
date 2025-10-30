import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Web3Provider } from './contexts/blockchain/Web3Context';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { EventsProvider } from './contexts/EventsContext';
import { AuthModalProvider } from './contexts/AuthModalContext';
import { TooltipProvider } from './components/ui/tooltip';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
                <TooltipProvider>
                  <App />
                  <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                  />
                </TooltipProvider>
              </AuthModalProvider>
            </EventsProvider>
          </ThemeProvider>
        </Web3Provider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);