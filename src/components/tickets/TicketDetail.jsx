import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  User, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Clock,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getTicketById, cancelTicket } from '../../services/ticketService';
import { Button } from '../ui/button';
import TransferTicketModal from './TransferTicketModal';

const statusIcons = {
  active: <CheckCircle className="h-5 w-5 text-green-500" />,
  used: <XCircle className="h-5 w-5 text-red-500" />,
  transferred: <ArrowRight className="h-5 w-5 text-blue-500" />,
  refunded: <XCircle className="h-5 w-5 text-gray-500" />,
  cancelled: <XCircle className="h-5 w-5 text-red-500" />
};

const statusLabels = {
  active: 'Active',
  used: 'Used',
  transferred: 'Transferred',
  refunded: 'Refunded',
  cancelled: 'Cancelled'
};

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const data = await getTicketById(id);
        
        // Check if current user is the owner
        if (data.owner._id !== currentUser?._id) {
          navigate('/tickets');
          return;
        }
        
        setTicket(data);
      } catch (err) {
        console.error('Error fetching ticket:', err);
        setError('Failed to load ticket details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, currentUser, navigate]);

  const handleTransferSuccess = (updatedTicket) => {
    setTicket(updatedTicket);
    setShowTransferModal(false);
  };

  const handleCancelTicket = async () => {
    if (!window.confirm('Are you sure you want to cancel this ticket? This action cannot be undone.')) {
      return;
    }

    try {
      setCancelling(true);
      const updatedTicket = await cancelTicket(ticket._id);
      setTicket(updatedTicket);
      toast.success('Ticket has been cancelled.');
    } catch (err) {
      console.error('Error cancelling ticket:', err);
      setError(err.response?.data?.message || 'Failed to cancel ticket. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Ticket</h3>
        <p className="text-gray-600 mb-6">{error || 'Ticket not found or you do not have permission to view it.'}</p>
        <Button onClick={() => navigate('/tickets')}>
          Back to My Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/tickets')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Tickets
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.event?.title || 'Event Ticket'}</h1>
            <div className="flex items-center mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {ticket.ticketType?.name || 'General Admission'}
              </span>
              <span className="ml-2 inline-flex items-center text-sm text-gray-500">
                {statusIcons[ticket.status]}
                <span className="ml-1">{statusLabels[ticket.status]}</span>
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {ticket.status === 'active' && ticket.isTransferable && (
              <Button 
                variant="outline" 
                onClick={() => setShowTransferModal(true)}
                disabled={cancelling}
              >
                Transfer Ticket
              </Button>
            )}
            
            {ticket.status === 'active' && ticket.event?.refundPolicy?.allowsRefunds && (
              <Button 
                variant="outline" 
                onClick={handleCancelTicket}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Ticket'}
              </Button>
            )}
            
            <Button asChild>
              <a 
                href={`/api/tickets/${ticket._id}/download`} 
                target="_blank" 
                rel="noopener noreferrer"
                download
              >
                Download PDF
              </a>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Ticket Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Ticket Holder</h3>
                  <p className="text-sm text-gray-600">
                    {ticket.attendee?.name || currentUser?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {ticket.attendee?.email || currentUser?.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Date & Time</h3>
                  <p className="text-sm text-gray-600">
                    {ticket.event?.date 
                      ? format(new Date(ticket.event.date), 'EEEE, MMMM d, yyyy')
                      : 'Date not specified'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {ticket.event?.date 
                      ? format(new Date(ticket.event.date), 'h:mm a')
                      : 'Time not specified'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Location</h3>
                  <p className="text-sm text-gray-600">
                    {ticket.event?.location || 'Location not specified'}
                  </p>
                  {ticket.event?.address && (
                    <p className="text-sm text-gray-500">{ticket.event.address}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Ticket ID</h3>
                  <p className="text-sm font-mono text-gray-600 break-all">
                    {ticket.tokenId}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {ticket.transferHistory?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Transfer History</h2>
              <div className="flow-root">
                <ul className="-mb-8">
                  {ticket.transferHistory.map((transfer, idx) => (
                    <li key={idx}>
                      <div className="relative pb-8">
                        {idx !== ticket.transferHistory.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <ArrowRight className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-500">
                                Transferred from <span className="font-medium text-gray-900">{transfer.from}</span> to{' '}
                                <span className="font-medium text-gray-900">{transfer.to}</span>
                              </p>
                              <p className="text-xs text-gray-400">
                                {format(new Date(transfer.timestamp), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Event Details</h2>
            
            {ticket.event?.description ? (
              <p className="text-sm text-gray-600 mb-4">{ticket.event.description}</p>
            ) : (
              <p className="text-sm text-gray-500 italic mb-4">No description available</p>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Organizer</h3>
              <p className="text-sm text-gray-600">
                {ticket.event?.organizer?.name || 'Organizer not specified'}
              </p>
              
              {ticket.event?.organizer?.contactEmail && (
                <a 
                  href={`mailto:${ticket.event.organizer.contactEmail}`}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-1 block"
                >
                  {ticket.event.organizer.contactEmail}
                </a>
              )}
            </div>
            
            {ticket.event?.refundPolicy && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Refund Policy</h3>
                <p className="text-sm text-gray-600">
                  {ticket.event.refundPolicy.description || 'No refunds are available for this event.'}
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h2>
            <p className="text-sm text-gray-600 mb-4">
              If you have any questions about your ticket or the event, please contact the event organizer.
            </p>
            <Button variant="outline" className="w-full">
              Contact Organizer
            </Button>
          </div>
        </div>
      </div>
      
      {showTransferModal && (
        <TransferTicketModal
          ticket={ticket}
          onClose={() => setShowTransferModal(false)}
          onSuccess={handleTransferSuccess}
        />
      )}
    </div>
  );
};

export default TicketDetail;
