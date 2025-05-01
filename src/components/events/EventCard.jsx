import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEvents } from '../../contexts/EventsContext';

const EventCard = ({ event }) => {
  const { formatPrice } = useEvents();
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <motion.div 
      className="card h-full"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-0 right-0 bg-deep-purple text-holographic-white px-3 py-1 m-2 rounded-lg">
          {formatPrice(event.price)}
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        <h3 className="text-xl font-bold text-holographic-white line-clamp-1">{event.title}</h3>
        
        <div className="space-y-2 text-holographic-white/70">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-tech-blue" />
            <span className="text-sm">{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-tech-blue" />
            <span className="text-sm line-clamp-1">{event.location}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-tech-blue" />
            <span className="text-sm">{event.availableTickets} tickets left</span>
          </div>
        </div>
        
        <p className="text-holographic-white/80 text-sm line-clamp-2">{event.description}</p>
        
        <Link 
          to={`/events/${event.id}`}
          className="btn btn-secondary w-full text-center block"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default EventCard;