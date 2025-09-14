import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

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
import LoginPage from './pages/LoginPage.jsx';
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

// Context Providers
import { AuthProvider } from './contexts/AuthContext.jsx';
import { EventsProvider } from './contexts/EventsContext.jsx';
import { Web3Provider } from './contexts/blockchain/Web3Context.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';

function App() {
  return (
    <ThemeProvider>
      <Web3Provider>
        <AuthProvider>
          <EventsProvider>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="explore" element={<ExplorePage />} />
                  <Route path="events/blockchain/:id" element={<BlockchainEventPage />} />
                  <Route path="events/:eventId" element={<EventDetailsPage />} />
                  <Route path="tickets" element={<TicketsPage />} />
                  <Route path="tickets/:id" element={<TicketDetailPage />} />
                  <Route path="demo" element={<DemoPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="testimonials" element={<TestimonialsPage />} />
                  <Route path="login" element={<LoginPage />} />
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
                <Route path="/user" element={<UserLayout />}>
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="profile" element={<UserProfilePage />} />
                  <Route path="tickets" element={<UserTicketsPage />} />
                  <Route path="create-event" element={<CreateEventPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AnimatePresence>
          </EventsProvider>
        </AuthProvider>
      </Web3Provider>
    </ThemeProvider>
  );
}

export default App;