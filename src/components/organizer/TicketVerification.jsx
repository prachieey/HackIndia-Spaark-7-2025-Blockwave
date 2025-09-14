import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Check, X, Loader2, AlertCircle, Search } from 'lucide-react';
import { verifyTicket, getTicketById } from '../../services/ticketService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';

const TicketVerification = ({ eventId }) => {
  const { currentUser } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState('idle'); // 'idle', 'scanning', 'verifying', 'verified', 'error'
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isManualSearch, setIsManualSearch] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const codeReaderRef = useRef(null);

  // Initialize QR code scanner
  useEffect(() => {
    if (typeof window !== 'undefined' && !codeReaderRef.current) {
      import('@zxing/library').then(({ BrowserQRCodeReader }) => {
        codeReaderRef.current = new BrowserQRCodeReader();
      });
    }

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setVerificationStatus('scanning');
      setError('');
      setTicket(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        streamRef.current = stream;
      }
      
      // Start QR code scanning
      if (codeReaderRef.current) {
        const result = await codeReaderRef.current.decodeFromVideoDevice(
          undefined,
          'video-preview',
          (result, error) => {
            if (result) {
              handleTicketLookup(result.getText());
            }
            
            if (error && !(error instanceof ZXing.NotFoundException)) {
              console.error('QR code scan error:', error);
              setError('Error scanning QR code. Please try again.');
              setVerificationStatus('error');
            }
          }
        );
        
        return () => {
          if (result) {
            codeReaderRef.current.reset();
          }
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
      setVerificationStatus('error');
    }
  };

  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleTicketLookup = async (ticketId) => {
    if (!ticketId) return;
    
    try {
      setVerificationStatus('verifying');
      setError('');
      
      // Stop the scanner when we find a ticket
      stopScanner();
      
      // Look up the ticket
      const ticketData = await getTicketById(ticketId);
      
      // Verify if the ticket belongs to the current event
      if (ticketData.event._id !== eventId) {
        throw new Error('This ticket is not valid for this event.');
      }
      
      setTicket(ticketData);
      setVerificationStatus('verifying');
    } catch (err) {
      console.error('Error looking up ticket:', err);
      setError(err.response?.data?.message || err.message || 'Invalid ticket. Please try again.');
      setVerificationStatus('error');
      
      // Restart the scanner after a delay
      setTimeout(() => {
        setVerificationStatus('idle');
      }, 3000);
    }
  };

  const handleVerifyTicket = async (status) => {
    if (!ticket) return;
    
    try {
      setVerificationStatus('verifying');
      
      const verifiedTicket = await verifyTicket(ticket._id, { 
        status,
        notes: `Verified by ${currentUser.name} (${currentUser.email})` 
      });
      
      setTicket(verifiedTicket);
      setVerificationStatus('verified');
      
      toast.success(`Ticket marked as ${status === 'used' ? 'used' : 'invalid'}`);
      
      // Reset after a delay
      setTimeout(() => {
        setVerificationStatus('idle');
        setTicket(null);
      }, 3000);
    } catch (err) {
      console.error('Error verifying ticket:', err);
      setError(err.response?.data?.message || 'Failed to verify ticket. Please try again.');
      setVerificationStatus('error');
    }
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setVerificationStatus('verifying');
      const ticketData = await getTicketById(searchQuery.trim());
      
      if (ticketData.event._id !== eventId) {
        throw new Error('This ticket is not valid for this event.');
      }
      
      setTicket(ticketData);
      setVerificationStatus('verifying');
    } catch (err) {
      console.error('Error looking up ticket:', err);
      setError(err.response?.data?.message || err.message || 'Invalid ticket ID. Please try again.');
      setVerificationStatus('error');
      
      setTimeout(() => {
        setVerificationStatus('idle');
      }, 3000);
    }
  };

  const resetVerification = () => {
    setVerificationStatus('idle');
    setTicket(null);
    setError('');
    setSearchQuery('');
    stopScanner();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Ticket Verification</h2>
        {verificationStatus !== 'idle' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetVerification}
            disabled={verificationStatus === 'verifying'}
          >
            New Scan
          </Button>
        )}
      </div>
      
      {verificationStatus === 'idle' && !isManualSearch && (
        <div className="space-y-4">
          <Button 
            onClick={startScanner}
            className="w-full py-8 flex flex-col items-center justify-center space-y-2"
            size="lg"
          >
            <QrCode className="h-10 w-10" />
            <span>Scan Ticket QR Code</span>
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsManualSearch(true)}
          >
            Enter Ticket ID Manually
          </Button>
        </div>
      )}
      
      {verificationStatus === 'idle' && isManualSearch && (
        <form onSubmit={handleManualSearch} className="space-y-4">
          <div>
            <label htmlFor="ticketId" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Ticket ID
            </label>
            <input
              type="text"
              id="ticketId"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
              autoFocus
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setIsManualSearch(false);
                setSearchQuery('');
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!searchQuery.trim()}
            >
              Lookup Ticket
            </Button>
          </div>
        </form>
      )}
      
      {verificationStatus === 'scanning' && (
        <div className="space-y-4">
          <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
            <video 
              id="video-preview" 
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
            />
            <div className="absolute inset-0 border-4 border-blue-500 rounded-lg m-2 pointer-events-none"></div>
          </div>
          <p className="text-center text-gray-600">
            Position the QR code within the frame to scan
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              stopScanner();
              setVerificationStatus('idle');
            }}
          >
            Cancel
          </Button>
        </div>
      )}
      
      {(verificationStatus === 'verifying' || verificationStatus === 'verified') && ticket && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  {verificationStatus === 'verified' ? 'Ticket Verified' : 'Ticket Found'}
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    {ticket.attendee?.name || 'Guest'}
                    {ticket.attendee?.email && ` • ${ticket.attendee.email}`}
                  </p>
                  <p className="mt-1">
                    {ticket.ticketType?.name || 'General Admission'} • #{ticket.tokenId.substring(0, 8)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {verificationStatus === 'verifying' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Is this ticket valid for entry?
              </p>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleVerifyTicket('used')}
                  disabled={verificationStatus === 'verifying'}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleVerifyTicket('invalid')}
                  disabled={verificationStatus === 'verifying'}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
          
          {verificationStatus === 'verified' && (
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Check className="h-4 w-4 mr-2" />
                Ticket marked as {ticket.status === 'used' ? 'used' : 'invalid'}
              </div>
            </div>
          )}
        </div>
      )}
      
      {verificationStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error || 'An error occurred'}
              </h3>
              <p className="mt-2 text-sm text-red-700">
                Please try again or contact support if the problem persists.
              </p>
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resetVerification}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketVerification;
