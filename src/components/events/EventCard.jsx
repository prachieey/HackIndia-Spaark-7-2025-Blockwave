import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../../contexts/blockchain/Web3Context';
import { ethers } from 'ethers';

const EventCard = ({ event }) => {
  const { formatEther } = ethers.utils;
  const { chainId } = useWeb3();
  const [formattedDate, setFormattedDate] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  
  // Format price from wei to ETH
  const formatPrice = (priceInWei) => {
    if (!priceInWei) return 'Free';
    const priceInEth = formatEther(priceInWei);
    return `${parseFloat(priceInEth).toFixed(4)} ETH`;
  };

  // Format timestamp to readable date
  useEffect(() => {
    if (event.date) {
      // Check if date is a timestamp (number) or ISO string
      const timestamp = typeof event.date === 'number' ? event.date * 1000 : event.date;
      const date = new Date(timestamp);
      
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      
      setFormattedDate(date.toLocaleDateString('en-US', options));
    }
  }, [event.date]);

  // Get block explorer URL based on chain ID
  const getBlockExplorerUrl = () => {
    if (!event.id || !chainId) return '#';
    
    // This is a simplified version - you might want to support more networks
    switch (chainId) {
      case 1: // Ethereum Mainnet
        return `https://etherscan.io/`;
      case 5: // Goerli Testnet
        return `https://goerli.etherscan.io/`;
      case 11155111: // Sepolia Testnet
        return `https://sepolia.etherscan.io/`;
      case 80001: // Polygon Mumbai
        return `https://mumbai.polygonscan.com/`;
      default: // Localhost/other
        return '#';
    }
  };

  return (
    <motion.div 
      className="card h-full flex flex-col bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-deep-purple/20 transition-all duration-300"
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-48 overflow-hidden group">
        <img 
          src={event.image || `https://source.unsplash.com/random/600x400/?event,${event.id}`} 
          alt={event.title || 'Event'} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <a 
            href={getBlockExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-white bg-deep-purple/90 hover:bg-deep-purple px-3 py-1.5 rounded-full transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <span>View on Explorer</span>
            <ExternalLink className="ml-1 h-3.5 w-3.5" />
          </a>
        </div>
        <div className="absolute top-0 right-0 bg-deep-purple/90 text-white px-3 py-1.5 m-2 rounded-lg text-sm font-medium backdrop-blur-sm">
          {formatPrice(event.price)}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-holographic-white line-clamp-2 mb-2">
          {event.title || 'Untitled Event'}
        </h3>
        
        <div className="space-y-2 text-holographic-white/70 text-sm mt-auto">
          <div className="flex items-start space-x-2">
            <Calendar className="h-4 w-4 text-tech-blue flex-shrink-0 mt-0.5" />
            <span className="text-sm">{formattedDate || 'Date not specified'}</span>
          </div>
          
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-tech-blue flex-shrink-0 mt-0.5" />
            <span className="text-sm line-clamp-1">{event.location || 'Location not specified'}</span>
          </div>
        </div>
        
        {event.ticketsAvailable !== undefined && (
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-tech-blue flex-shrink-0" />
            <span className="text-sm">
              {event.ticketsAvailable} {event.ticketsAvailable === 1 ? 'ticket' : 'tickets'} available
            </span>
          </div>
        )}
        
        {event.organizer && (
          <div className="pt-2 mt-2 border-t border-gray-800">
            <p className="text-xs text-gray-400">Organized by</p>
            <div className="flex items-center mt-1">
              <div className="h-6 w-6 rounded-full bg-deep-purple/30 flex items-center justify-center mr-2">
                <User className="h-3 w-3 text-deep-purple" />
              </div>
              <span className="text-xs font-mono text-gray-300 truncate">
                {`${event.organizer.substring(0, 6)}...${event.organizer.substring(38)}`}
              </span>
            </div>
          </div>
        )}
        
        <div className="pt-4 mt-4 border-t border-gray-800">
          <Link 
            to={`/events/blockchain/${event.id}`} 
            className="btn btn-primary w-full text-center flex items-center justify-center space-x-2"
          >
            <span>View Details</span>
            {isHovered && <ArrowRight className="h-4 w-4" />}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;