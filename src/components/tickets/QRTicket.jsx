import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Calendar, Tag, Check, X } from 'lucide-react';
import { useEvents } from '../../contexts/EventsContext';

const QRTicket = ({ ticket, onResell, showResellOption = false }) => {
  const { formatPrice, getEventById } = useEvents();
  const event = getEventById(ticket.eventId);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <motion.div 
      className="card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-holographic-white">{ticket.eventTitle}</h3>
            <p className="text-tech-blue">Ticket #{ticket.id.split('_')[1]}</p>
          </div>
          <div className="flex items-center space-x-1">
            {ticket.isUsed ? (
              <span className="flex items-center bg-flame-red bg-opacity-20 text-flame-red px-2 py-1 rounded-md text-xs">
                <X className="h-3 w-3 mr-1" /> Used
              </span>
            ) : (
              <span className="flex items-center bg-validation-green bg-opacity-20 text-validation-green px-2 py-1 rounded-md text-xs">
                <Check className="h-3 w-3 mr-1" /> Valid
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-tech-blue" />
              <span className="text-holographic-white/70">
                Purchased: {formatDate(ticket.purchaseDate)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-tech-blue" />
              <span className="text-holographic-white/70">
                Price: {formatPrice(ticket.price)}
              </span>
            </div>
            
            {ticket.isForSale && (
              <div className="bg-tech-blue bg-opacity-20 p-3 rounded-lg">
                <p className="text-tech-blue font-semibold">Listed for resale at {formatPrice(ticket.resalePrice)}</p>
              </div>
            )}
            
            {showResellOption && !ticket.isUsed && !ticket.isForSale && (
              <button 
                onClick={() => onResell(ticket.id)}
                className="btn btn-secondary w-full"
              >
                Resell Ticket
              </button>
            )}
          </div>
          
          <div className="flex justify-center items-center bg-white p-4 rounded-lg">
            <QRCodeSVG 
              value={ticket.qrData} 
              size={150}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/vite.svg",
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QRTicket;