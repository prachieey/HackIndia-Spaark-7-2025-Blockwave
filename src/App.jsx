import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import CustomToast from './components/common/CustomToast';
import ErrorBoundary from './components/common/ErrorBoundary';
import RegionSelection from './components/auth/RegionSelection';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
// Login page has been removed - redirects to home
import NotFoundPage from './pages/NotFoundPage.jsx';
import TicketsPage from './pages/TicketsPage.jsx';
import TicketDetailPage from './pages/TicketDetailPage.jsx';

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

// Components
import AuthModal from './components/auth/AuthModal';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { AuthModalProvider, useAuthModal } from './contexts/AuthModalContext.jsx';
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

// Component to handle login redirect with modal
const LoginRedirect = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  
  useEffect(() => {
    const redirect = searchParams.get('redirect') || '/';
    openAuthModal('login');
    // Don't navigate immediately, let the modal handle the navigation after login
  }, [searchParams, openAuthModal]);
  
  return <Navigate to="/" replace />;
};

function AppContent() {
  const { isOpen, closeAuthModal, mode, openAuthModal } = useAuthModal();
  const { user, isAuthenticated } = useAuth();
  const { selectedCity, updateLocation } = useLocationContext();
  const location = useLocation();
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
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
  
  // This effect ensures the modal is properly initialized
  useEffect(() => {
    console.log('AuthModal state:', { isOpen, mode });
  }, [isOpen, mode]);

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
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'toast-notification',
          duration: 5000,
          style: {
            background: 'white',
            color: '#1F2937',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
      <CustomToast />
      <ScrollToTop />
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isOpen} 
        onClose={closeAuthModal} 
        authType={mode} 
        setAuthType={(type) => openAuthModal(type)} 
      />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="events" element={<DemoPage />} />
            <Route path="events/blockchain/:id" element={<BlockchainEventPage />} />
            <Route path="events/:eventId" element={<EventDetailsPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="tickets/:id" element={<TicketDetailPage />} />
            <Route path="/demo" element={<Navigate to="/events" replace />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
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

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AuthModalProvider>
            <Web3Provider>
              <EventsProvider>
                <LocationProvider>
                  <AppContent />
                </LocationProvider>
              </EventsProvider>
            </Web3Provider>
          </AuthModalProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;