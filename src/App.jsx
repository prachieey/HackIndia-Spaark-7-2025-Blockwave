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
import CreateEventPage from './pages/CreateEventPage.jsx';
import DemoPage from './pages/DemoPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Admin Pages
import AdminDashboardPage from './pages/admin/DashboardPage.jsx';
import AdminEventsPage from './pages/admin/EventsPage.jsx';
import AdminTicketsPage from './pages/admin/TicketsPage.jsx';
import AdminUsersPage from './pages/admin/UsersPage.jsx';

// User Pages
import UserDashboardPage from './pages/user/DashboardPage.jsx';
import UserTicketsPage from './pages/user/TicketsPage.jsx';
import UserProfilePage from './pages/user/ProfilePage.jsx';

// Context Providers
import { AuthProvider } from './contexts/AuthContext.jsx';
import { EventsProvider } from './contexts/EventsContext.jsx';

function App() {
  return (
    <AuthProvider>
      <EventsProvider>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="events/:eventId" element={<EventDetailsPage />} />
              <Route path="demo" element={<DemoPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="events" element={<AdminEventsPage />} />
              <Route path="tickets" element={<AdminTicketsPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>

            {/* User Routes */}
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserDashboardPage />} />
              <Route path="tickets" element={<UserTicketsPage />} />
              <Route path="profile" element={<UserProfilePage />} />
              <Route path="create-event" element={<CreateEventPage />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </EventsProvider>
    </AuthProvider>
  );
}

export default App;