import React, { useEffect, useState, useCallback } from 'react';
import './utils/testFirebaseConfig'; // Test Firebase configuration
import { Routes, Route, useLocation, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/common/ErrorBoundary';
import RegionSelection from './components/auth/RegionSelection';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { handleRedirectResult, auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Layouts
import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import UserLayout from './layouts/UserLayout.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import EventDetailsPage from './pages/EventDetailsPage.jsx';
import BlockchainEventPage from './pages/BlockchainEventPage.jsx';
import CreateEventPage from './pages/CreateEventPage.jsx';
import DemoPage from './pages/DemoPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import TestimonialsPage from './pages/TestimonialsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ResellTicketsPage from './pages/ResellTicketsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import TicketDetailPage from './pages/TicketDetailPage.jsx';
import PaymentPage from './pages/PaymentPage.jsx';
import PaymentSuccessPage from './pages/PaymentSuccessPage.jsx';

// Admin Pages
import AdminDashboardPage from './pages/admin/DashboardPage.jsx';
import AdminEventsPage from './pages/admin/EventsPage.jsx';
import AdminTicketsPage from './pages/admin/TicketsPage.jsx';
import AdminUsersPage from './pages/admin/UsersPage.jsx';
import WalletTest from './pages/admin/WalletTest.jsx';

// User Pages
import UserDashboard from './pages/user/UserDashboard.jsx';
import UserTicketsPage from './pages/user/TicketsPage.jsx';
import UserProfilePage from './pages/user/ProfilePage.jsx';
import SettingsPage from './pages/user/SettingsPage.jsx';

// Auth Pages
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

// Components

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { EventsProvider } from './contexts/EventsContext.jsx';
import { Web3Provider } from './contexts/blockchain/Web3Context.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { LocationProvider, useLocation as useLocationContext } from './contexts/LocationContext.jsx';
import LocationSelector from './components/common/LocationSelector';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Component to handle login redirect
const LoginRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // If there's a redirect parameter, pass it to the LoginPage
  const redirect = searchParams.get('redirect') || '/';
  
  return <LoginPage redirect={redirect} />;
};

function AppContent() {
  const { user, isAuthenticated, login } = useAuth();
  const { selectedCity, updateLocation } = useLocationContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isHandlingRedirect, setIsHandlingRedirect] = useState(true);
  
  // Handle authentication state changes
  useEffect(() => {
    // Make sure auth is initialized
    if (!auth) {
      console.error('Firebase auth is not initialized');
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', { firebaseUser });
      
      if (firebaseUser) {
        try {
          // Format the Firebase user to match your backend's user structure
          const userData = {
            _id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            role: 'user', // Default role, adjust as needed
            // Add any additional user properties you need
            ...firebaseUser.providerData[0],
            emailVerified: firebaseUser.emailVerified,
            photoURL: firebaseUser.photoURL,
            providerId: firebaseUser.providerId,
            uid: firebaseUser.uid
          };
          
          // Log the formatted user data for debugging
          console.log('Formatted user data:', userData);
          
          // Call login with the formatted user data
          await login(userData);
          
        } catch (error) {
          console.error('Error handling Firebase auth state change:', error);
          // Handle the error appropriately, e.g., show a toast message
          toast.error('Failed to sign in with Google. Please try again.');
        }
      } else {
        // Handle case when user is signed out
        login(null);
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [login]);
  
  // Handle Google Sign-In redirect result
  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Check if we're coming back from a Google OAuth redirect
      const urlParams = new URLSearchParams(window.location.search);
      const isGoogleRedirect = urlParams.has('state') || urlParams.has('code') || urlParams.has('authuser');
      
      if (!isGoogleRedirect) {
        console.log('Not in Google OAuth redirect flow');
        setIsHandlingRedirect(false);
        return;
      }

      console.log('Processing Google OAuth redirect...');
      
      try {
        // Add a small delay to ensure all redirect state is processed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Checking for Google Sign-In redirect result...');
        const { user: authUser, error } = await handleRedirectResult();
        
        if (error) {
          console.error('Error handling redirect result:', error);
          
          // Clean up the URL even if there was an error
          if (window.history?.replaceState) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            console.log('Cleaned URL after error:', cleanUrl);
          }
          
          // Show a more specific error message based on the error type
          let errorMessage = error;
          if (error.includes('cancelled')) {
            errorMessage = 'Sign in was cancelled. Please try again.';
          } else if (error.includes('popup-blocked')) {
            errorMessage = 'Popup was blocked. Please allow popups for this site and try again.';
          } else if (error.includes('network-request-failed')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
          }
          
          toast.error(errorMessage, { autoClose: 5000 });
          setIsHandlingRedirect(false);
          return;
        }
        
        if (authUser) {
          console.log('Successfully handled Google Sign-In redirect:', authUser);
          
          // Format the Firebase user to match your backend's user structure
          const userData = {
            _id: authUser.uid,
            email: authUser.email,
            name: authUser.displayName || authUser.email.split('@')[0],
            role: 'user',
            emailVerified: authUser.emailVerified,
            photoURL: authUser.photoURL,
            providerId: authUser.providerData?.[0]?.providerId || 'google.com',
            uid: authUser.uid
          };
          
          console.log('Formatted user data for redirect:', userData);
          
          // Clean up the URL by removing OAuth parameters
          if (window.history?.replaceState) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            console.log('Cleaned URL after redirect:', cleanUrl);
          }
          
          try {
            // Update auth context with the logged-in user
            const loginResult = await login(userData);
            
            if (loginResult && loginResult.success) {
              // Get the redirect URL from session storage or use default
              const redirectUrl = sessionStorage.getItem('redirectAfterSignIn') || '/';
              sessionStorage.removeItem('redirectAfterSignIn');
              
              console.log('Redirecting after successful Google Sign-In to:', redirectUrl);
              navigate(redirectUrl, { replace: true });
            } else {
              throw new Error('Failed to update authentication state');
            }
          } catch (loginError) {
            console.error('Error during login after Google Sign-In:', loginError);
            toast.error('Failed to complete sign-in. Please try again.');
          }
        } else {
          console.log('No user found in redirect result - checking current auth state...');
          // Check if user is already authenticated
          if (auth.currentUser) {
            console.log('Found current user in auth state:', auth.currentUser);
            const userData = {
              _id: auth.currentUser.uid,
              email: auth.currentUser.email,
              name: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
              role: 'user',
              emailVerified: auth.currentUser.emailVerified,
              photoURL: auth.currentUser.photoURL,
              providerId: auth.currentUser.providerData?.[0]?.providerId || 'google.com',
              uid: auth.currentUser.uid
            };
            
            try {
              await login(userData);
              // Get the redirect URL from session storage or use default
              const redirectUrl = sessionStorage.getItem('redirectAfterSignIn') || '/';
              sessionStorage.removeItem('redirectAfterSignIn');
              
              console.log('Redirecting after successful auth state check to:', redirectUrl);
              navigate(redirectUrl, { replace: true });
            } catch (loginError) {
              console.error('Error during login after auth state check:', loginError);
              toast.error('Failed to complete sign-in. Please try again.');
            }
          } else {
            console.log('No authenticated user found after Google Sign-In');
            toast.error('Authentication failed. Please try signing in again.');
          }
        }
      } catch (error) {
        console.error('Unexpected error in handleAuthRedirect:', {
          code: error.code,
          message: error.message,
          fullError: error
        });
        
        // Clean up the URL on error
        if (window.history?.replaceState) {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          console.log('Cleaned URL after error:', cleanUrl);
        }
        
        toast.error('An unexpected error occurred during sign-in. Please try again.');
      } finally {
        setIsHandlingRedirect(false);
      }
    };

    // Only handle redirect if we're not already handling it and not authenticated
    if (!isHandlingRedirect && !isAuthenticated) {
      console.log('Starting auth redirect handling...');
      handleAuthRedirect();
    } else if (isAuthenticated) {
      console.log('Already authenticated, skipping redirect handling');
      setIsHandlingRedirect(false);
    }
    
    // Cleanup function
    return () => {
      console.log('Cleaning up auth redirect handler');
    };
  }, [isAuthenticated, login, navigate, isHandlingRedirect]);
  
  // Debug logs
  useEffect(() => {
    console.log('AppContent - User state:', { user, isAuthenticated });
    console.log('AppContent - Current location state:', { selectedCity });
  }, [user, isAuthenticated, selectedCity]);
  
  // Show location selector after successful login
  useEffect(() => {
    console.log('Checking if we should show location modal...', { 
      user, 
      isAuthenticated
    });
    
    if (user && isAuthenticated) {
      console.log('User is logged in, showing location modal');
      // Small delay to allow the UI to update after login
      const timer = setTimeout(() => {
        setShowLocationModal(true);
      }, 1000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [user, isAuthenticated]);
  
  const handleRegionSelectionClose = () => {
    console.log('Closing region selection');
    setShowRegionSelector(false);
  };
  
  const handleLocationSelect = (city) => {
    console.log('Location selected:', city);
    if (city) {
      updateLocation(city);
      setShowLocationModal(false);
      toast.success(`Location set to ${city}`);
    } else {
      console.error('No city provided to handleLocationSelect');
    }
  };
  
  const handleLocationModalClose = () => {
    console.log('Location modal closed');
    setShowLocationModal(false);
  };

  return (
    <>
      {showRegionSelector && (
        <RegionSelection onClose={handleRegionSelectionClose} />
      )}
      
      {/* Location Selector Modal */}
      <LocationSelector 
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelect={handleLocationSelect}
      />
      <ToastContainer 
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          background: '#363636',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      />
      <ScrollToTop />
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="resell" element={<ResellTicketsPage />} />
            <Route path="events/blockchain/:id" element={<BlockchainEventPage />} />
            <Route path="events/:eventId" element={<EventDetailsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="tickets/:id" element={<TicketDetailPage />} />
            <Route path="/demo" element={<Navigate to="/resell" replace />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* Redirect old routes to new ones */}
            <Route path="events" element={<Navigate to="/resell" replace />} />
            <Route path="tickets" element={<Navigate to="/about" replace />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Redirects for better UX */}
            <Route path="/my-tickets" element={<Navigate to="/user/tickets" replace />} />
            
            {/* Payment Routes */}
            <Route path="/payment" element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } />
            <Route path="/payment-success" element={
              <ProtectedRoute>
                <PaymentSuccessPage />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboardPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="tickets" element={<AdminTicketsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="wallet-test" element={<WalletTest />} />
          </Route>

          {/* User Routes */}
          <Route path="/user" element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="tickets" element={<UserTicketsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="create-event" element={<CreateEventPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

// Create a wrapper component to ensure AuthProvider is fully initialized
function AuthInitializer({ children }) {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // This effect will run once when the component mounts
    console.log('AuthInitializer mounted');
    
    // Set a small delay to ensure all providers are properly initialized
    const timer = setTimeout(() => {
      console.log('AuthInitializer: Providers ready');
      setIsAuthReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Show a loading state while auth initializes
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Web3Provider>
            <EventsProvider>
              <LocationProvider>
                <AuthInitializer>
                  <AppContent />
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
                </AuthInitializer>
              </LocationProvider>
            </EventsProvider>
          </Web3Provider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;