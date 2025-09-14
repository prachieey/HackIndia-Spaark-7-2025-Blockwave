import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Ticket, ArrowRight, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getTicketsByUser } from '../../services/ticketService';
import { Button } from '../ui/button';
import TransferTicketModal from './TransferTicketModal';

const statusIcons = {
  active: <CheckCircle className="h-4 w-4 text-green-500" />,
  used: <XCircle className="h-4 w-4 text-red-500" />,
  transferred: <ArrowRight className="h-4 w-4 text-blue-500" />,
  refunded: <XCircle className="h-4 w-4 text-gray-500" />,
  cancelled: <XCircle className="h-4 w-4 text-red-500" />
};

const statusLabels = {
  active: 'Active',
  used: 'Used',
  transferred: 'Transferred',
  refunded: 'Refunded',
  cancelled: 'Cancelled'
};

const TicketList = () => {
  const { currentUser } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const data = await getTicketsByUser(currentUser._id);
        setTickets(data);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [currentUser]);

  const handleTransferClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowTransferModal(true);
  };

  const handleTransferSuccess = (updatedTicket) => {
    setTickets(tickets.map(t => 
      t._id === updatedTicket._id ? updatedTicket : t
    ));
    setShowTransferModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
        <p className="text-gray-500 mb-6">You haven't purchased any tickets yet.</p>
        <Button asChild>
          <Link to="/explore">Browse Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => (
          <div key={ticket._id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{ticket.event?.title || 'Event'}</h3>
                  <p className="text-sm text-gray-500">{ticket.ticketType?.name || 'General Admission'}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {statusIcons[ticket.status]}
                  <span className="text-xs font-medium">{statusLabels[ticket.status]}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span>
                    {ticket.event?.date 
                      ? format(new Date(ticket.event.date), 'MMM d, yyyy h:mm a') 
                      : 'Date not specified'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="truncate">
                    {ticket.event?.location || 'Location not specified'}
                  </span>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {ticket.attendee?.name || currentUser?.name || 'Ticket Holder'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {ticket.attendee?.email || currentUser?.email || ''}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  asChild
                >
                  <Link to={`/tickets/${ticket._id}`}>View Details</Link>
                </Button>
                
                {ticket.status === 'active' && ticket.isTransferable && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleTransferClick(ticket)}
                  >
                    Transfer
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showTransferModal && selectedTicket && (
        <TransferTicketModal
          ticket={selectedTicket}
          onClose={() => setShowTransferModal(false)}
          onSuccess={handleTransferSuccess}
        />
      )}
    </div>
  );
};

export default TicketList;
