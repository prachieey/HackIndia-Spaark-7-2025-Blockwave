import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import TicketDetail from '../components/tickets/TicketDetail';
import { Button } from '../components/ui/button';

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // In a real app, you would fetch the ticket here
        // const data = await getTicketById(id);
        // setTicket(data);
        
        // Simulating API call
        setTimeout(() => {
          setTicket({
            _id: id,
            tokenId: '0x1234...5678',
            event: {
              _id: 'event123',
              title: 'Sample Event',
              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              location: 'Virtual Event',
              description: 'This is a sample event description.',
              organizer: {
                name: 'Event Organizer',
                contactEmail: 'organizer@example.com'
              },
              refundPolicy: {
                allowsRefunds: true,
                description: 'Full refund available up to 7 days before the event.'
              }
            },
            ticketType: {
              name: 'General Admission',
              price: 29.99,
              currency: 'USD'
            },
            status: 'active',
            isTransferable: true,
            owner: {
              _id: currentUser._id,
              name: currentUser.name,
              email: currentUser.email
            },
            attendee: {
              name: currentUser.name,
              email: currentUser.email
            },
            transferHistory: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Failed to load ticket. Please try again.');
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm border text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view ticket</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your event ticket.</p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to={`/login?redirect=/tickets/${id}`}>Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Ticket</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/tickets')}>
              Back to My Tickets
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ticket Not Found</h2>
          <p className="text-gray-600 mb-6">The requested ticket could not be found or you don't have permission to view it.</p>
          <Button onClick={() => navigate('/tickets')}>
            Back to My Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/tickets')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to My Tickets
      </Button>
      
      <TicketDetail />
    </div>
  );
};

export default TicketDetailPage;
