import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TicketList from '../components/tickets/TicketList';
import { Button } from '../components/ui/button';

const TicketsPage = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border text-center">
          <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your tickets</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your event tickets and manage your bookings.</p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/login?redirect=/tickets">Sign In</Link>
            </Button>
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-600">View and manage your event tickets</p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link to="/explore">
            <Plus className="h-4 w-4 mr-2" />
            Find Events
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <TicketList />
      </div>
    </div>
  );
};

export default TicketsPage;
