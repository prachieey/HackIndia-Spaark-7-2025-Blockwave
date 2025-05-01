import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Check, X, AlertCircle } from 'lucide-react';
import { useEvents } from '../contexts/EventsContext';
import { useAuth } from '../contexts/AuthContext';
import QRTicket from '../components/tickets/QRTicket';

const DemoPage = () => {
  const { userTickets, validateTicket, purchaseResaleTicket, formatPrice } = useEvents();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('myTickets'); // 'myTickets', 'validate', 'resale'
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [resaleTickets, setResaleTickets] = useState([
    {
      id: 'tkt_demo1',
      eventId: 'evt_1',
      eventTitle: 'TechFest 2025',
      purchaseDate: new Date().toISOString(),
      price: 1499,
      resalePrice: 1299,
      qrData: 'SCANTYX-evt_1-demo1',
      isUsed: false,
      isForSale: true
    },
    {
      id: 'tkt_demo2',
      eventId: 'evt_2',
      eventTitle: 'Music Fusion Festival',
      purchaseDate: new Date().toISOString(),
      price: 999,
      resalePrice: 899,
      qrData: 'SCANTYX-evt_2-demo2',
      isUsed: false,
      isForSale: true
    }
  ]);
  
  const handleScan = () => {
    if (!scanInput.trim()) {
      setScanResult({
        success: false,
        message: 'Please enter a QR code'
      });
      return;
    }
    
    // Check if it's a valid QR format
    if (!scanInput.startsWith('SCANTYX-')) {
      setScanResult({
        success: false,
        message: 'Invalid QR code format'
      });
      return;
    }
    
    // Try to validate from user tickets
    const result = validateTicket(scanInput);
    setScanResult(result);
  };
  
  const handlePurchaseResale = (ticketId) => {
    if (!isAuthenticated) {
      alert('Please sign in to purchase tickets');
      return;
    }
    
    // For demo tickets, just remove from resale list
    if (ticketId.startsWith('tkt_demo')) {
      setResaleTickets(prev => prev.filter(t => t.id !== ticketId));
      return;
    }
    
    // For user tickets, use the context function
    const result = purchaseResaleTicket(ticketId);
    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-holographic-white mb-4">Scantyx Demo</h1>
          <p className="tagline">No Scams, Just Scans</p>
        </motion.div>
        
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-space-black border border-deep-purple rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('myTickets')}
              className={`px-6 py-3 ${
                activeTab === 'myTickets'
                  ? 'bg-deep-purple text-holographic-white'
                  : 'text-holographic-white hover:bg-deep-purple/20'
              }`}
            >
              My Tickets
            </button>
            <button
              onClick={() => setActiveTab('validate')}
              className={`px-6 py-3 ${
                activeTab === 'validate'
                  ? 'bg-deep-purple text-holographic-white'
                  : 'text-holographic-white hover:bg-deep-purple/20'
              }`}
            >
              Validate QR
            </button>
            <button
              onClick={() => setActiveTab('resale')}
              className={`px-6 py-3 ${
                activeTab === 'resale'
                  ? 'bg-deep-purple text-holographic-white'
                  : 'text-holographic-white hover:bg-deep-purple/20'
              }`}
            >
              Resale Market
            </button>
          </div>
        </div>
        
        {/* My Tickets Tab */}
        {activeTab === 'myTickets' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-holographic-white mb-6">Your Tickets</h2>
            
            {userTickets.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {userTickets.map(ticket => (
                  <QRTicket key={ticket.id} ticket={ticket} />
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <div className="flex justify-center mb-6">
                  <QrCode className="h-16 w-16 text-deep-purple" />
                </div>
                <h3 className="text-xl font-bold text-holographic-white mb-2">No Tickets Yet</h3>
                <p className="text-holographic-white/70 mb-6">
                  You haven't purchased any tickets yet. Browse events to find something you like!
                </p>
                <a href="/explore" className="btn btn-primary">
                  Explore Events
                </a>
              </div>
            )}
          </div>
        )}
        
        {/* Validate QR Tab */}
        {activeTab === 'validate' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-holographic-white mb-6">Validate Ticket QR Code</h2>
            
            <div className="card p-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="qrInput" className="block text-sm font-medium text-holographic-white">
                  Enter QR Code Data
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    id="qrInput"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    className="input flex-1"
                    placeholder="e.g., SCANTYX-evt_1-abc123"
                  />
                  <button
                    onClick={handleScan}
                    className="btn btn-primary whitespace-nowrap"
                  >
                    Validate
                  </button>
                </div>
                <p className="text-xs text-holographic-white/50">
                  For demo: Try entering "SCANTYX-evt_1-demo1" or scan a QR code from your tickets
                </p>
              </div>
              
              {scanResult && (
                <div className={`p-4 rounded-lg ${
                  scanResult.success
                    ? 'bg-validation-green bg-opacity-20 border border-validation-green'
                    : 'bg-flame-red bg-opacity-20 border border-flame-red'
                }`}>
                  <div className="flex items-start">
                    {scanResult.success ? (
                      <Check className="h-6 w-6 text-validation-green mr-3 flex-shrink-0" />
                    ) : (
                      <X className="h-6 w-6 text-flame-red mr-3 flex-shrink-0" />
                    )}
                    <div>
                      <h3 className={`font-bold ${
                        scanResult.success ? 'text-validation-green' : 'text-flame-red'
                      }`}>
                        {scanResult.success ? 'Valid Ticket' : 'Invalid Ticket'}
                      </h3>
                      <p className="text-holographic-white">{scanResult.message}</p>
                      
                      {scanResult.success && scanResult.ticket && (
                        <div className="mt-2 text-holographic-white/70">
                          <p>Event: {scanResult.ticket.eventTitle}</p>
                          <p>Ticket ID: {scanResult.ticket.id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-tech-blue bg-opacity-10 p-4 rounded-lg">
                <h3 className="font-bold text-tech-blue mb-2">How Validation Works</h3>
                <p className="text-holographic-white/70 text-sm">
                  In a real implementation, the QR code would be scanned using a camera. The code contains encrypted data 
                  that is verified against the blockchain record to confirm authenticity and prevent duplicate use.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Resale Market Tab */}
        {activeTab === 'resale' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-holographic-white mb-6">Ticket Resale Marketplace</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User's tickets for resale */}
              {userTickets.filter(t => t.isForSale).map(ticket => (
                <div key={ticket.id} className="card overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-holographic-white">{ticket.eventTitle}</h3>
                        <p className="text-tech-blue">Ticket #{ticket.id.split('_')[1]}</p>
                      </div>
                      <div className="bg-tech-blue text-holographic-white px-3 py-1 rounded-lg">
                        {formatPrice(ticket.resalePrice)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-holographic-white/70">
                        <p>Original price: {formatPrice(ticket.price)}</p>
                        <p className="text-xs">Listed by you</p>
                      </div>
                      
                      <button
                        onClick={() => handlePurchaseResale(ticket.id)}
                        className="btn btn-secondary"
                        disabled
                      >
                        Your Listing
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Demo resale tickets */}
              {resaleTickets.map(ticket => (
                <div key={ticket.id} className="card overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-holographic-white">{ticket.eventTitle}</h3>
                        <p className="text-tech-blue">Ticket #{ticket.id.split('_')[1]}</p>
                      </div>
                      <div className="bg-tech-blue text-holographic-white px-3 py-1 rounded-lg">
                        {formatPrice(ticket.resalePrice)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-holographic-white/70">
                        <p>Original price: {formatPrice(ticket.price)}</p>
                        <p className="text-xs">Listed by another user</p>
                      </div>
                      
                      <button
                        onClick={() => handlePurchaseResale(ticket.id)}
                        className="btn btn-primary"
                      >
                        Purchase
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {userTickets.filter(t => t.isForSale).length === 0 && resaleTickets.length === 0 && (
                <div className="col-span-1 lg:col-span-2 card p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <AlertCircle className="h-16 w-16 text-tech-blue" />
                  </div>
                  <h3 className="text-xl font-bold text-holographic-white mb-2">No Tickets Available</h3>
                  <p className="text-holographic-white/70">
                    There are currently no tickets listed for resale. Check back later or list your own tickets.
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-tech-blue bg-opacity-10 p-4 rounded-lg max-w-3xl mx-auto">
              <h3 className="font-bold text-tech-blue mb-2">About Secure Reselling</h3>
              <p className="text-holographic-white/70 text-sm">
                Scantyx's secure resale marketplace prevents scalping by capping resale prices at 150% of the original price. 
                All transfers are recorded on the blockchain, ensuring transparency and preventing fraud. When a ticket is 
                resold, a new QR code is generated for the new owner.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoPage;