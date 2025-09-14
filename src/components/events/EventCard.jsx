import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, Share2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../../contexts/blockchain/Web3Context';
import { useAuth } from '../../contexts/AuthContext';
import { format, parseISO, isPast, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { ethers } from 'ethers';

// Default event image
const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1531058020387-3be344556be6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';

const EventCard = ({ 
  event, 
  onClick = () => {},
  isSelected = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { formatEther } = ethers.utils;
  const { chainId } = useWeb3();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Parse event data
  const eventData = useMemo(() => ({
    ...event,
    id: event._id || event.id || 'no-id',
    title: event.name || event.title || 'Untitled Event',
    description: event.description || 'No description available.',
    image: event.image || event.coverImage || DEFAULT_EVENT_IMAGE,
    date: event.date || event.startDate,
    location: event.location?.name || event.venue || 'Location not specified',
    price: event.price || event.ticketPrice || 0,
    category: event.category || 'Other',
    capacity: event.capacity || event.maxAttendees || 0,
    registered: event.attendees?.length || 0,
    isFree: !event.price && !event.ticketPrice,
    rating: event.rating || 0
  }), [event]);

  // Format date and time
  const formattedDate = useMemo(() => {
    if (!eventData.date) return { date: 'Date not specified', time: '', full: 'Date not specified' };
    
    const date = typeof eventData.date === 'string' ? parseISO(eventData.date) : new Date(eventData.date);
    if (isNaN(date.getTime())) return { date: 'Invalid date', time: '', full: 'Invalid date' };
    
    // Relative date (Today, Tomorrow, This Week, or specific date)
    let relativeDate = '';
    if (isToday(date)) {
      relativeDate = 'Today';
    } else if (isTomorrow(date)) {
      relativeDate = 'Tomorrow';
    } else if (isThisWeek(date)) {
      relativeDate = format(date, 'EEEE'); // Day of week
    } else {
      relativeDate = format(date, 'MMM d, yyyy');
    }
    
    // Time
    const time = format(date, 'h:mm a');
    
    return { 
      date: relativeDate, 
      time, 
      full: format(date, 'EEEE, MMMM d, yyyy • h:mm a') 
    };
  }, [eventData.date]);

  // Format price
  const formattedPrice = useMemo(() => {
    if (eventData.isFree) return { text: 'Free', value: 0 };
    
    try {
      // If price is in wei (from blockchain)
      if (typeof eventData.price === 'string' && eventData.price.startsWith('0x')) {
        const priceInEth = parseFloat(formatEther(eventData.price));
        return { 
          text: `${priceInEth.toFixed(4)} ETH`,
          value: priceInEth
        };
      }
      
      // If price is in fiat
      const price = parseFloat(eventData.price);
      if (isNaN(price)) return { text: 'Free', value: 0 };
      
      return { 
        text: `$${price.toFixed(2)}`,
        value: price
      };
    } catch (error) {
      console.error('Error formatting price:', error);
      return { text: 'Free', value: 0 };
    }
  }, [eventData.price, formatEther]);

  // Calculate event status
  const eventStatus = useMemo(() => {
    if (!eventData.date) return 'upcoming';
    
    const eventDate = typeof eventData.date === 'string' ? parseISO(eventData.date) : new Date(eventData.date);
    
    if (isPast(eventDate)) return 'past';
    if (isToday(eventDate)) return 'today';
    if (isTomorrow(eventDate)) return 'tomorrow';
    return 'upcoming';
  }, [eventData.date]);

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  // Toggle favorite status
  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality with backend
  };

  // Share event
  const shareEvent = (e) => {
    e.stopPropagation();
    const shareData = {
      title: eventData.title,
      text: `Check out this event: ${eventData.title}`,
      url: window.location.origin + `/events/${eventData.id}`,
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('Link copied to clipboard!');
      }).catch(console.error);
    }
  };

  // Handle card click
  const handleClick = (e) => {
    e.preventDefault();
    onClick(eventData);
    navigate(`/events/${eventData.id}`);
  };

  return (
    <motion.article
      onClick={handleClick}
      className={`relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer group ${className} ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:border-gray-300'
      }`}
      whileHover={{ y: -4 }}
      layout
    >
      {/* Image with hover overlay */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageError ? DEFAULT_EVENT_IMAGE : eventData.image}
          alt={eventData.title}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Image overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Price tag */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-900 font-medium px-2.5 py-1 rounded-full text-sm shadow-md">
          {formattedPrice.text}
        </div>
        
        {/* Favorite button */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
            isFavorite ? 'bg-red-100 text-red-500' : 'bg-white/80 text-gray-600 hover:bg-white/90'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        
        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {eventData.category}
          </span>
        </div>
        
        {/* Event status badge */}
        {eventStatus === 'today' && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Happening Today
            </span>
          </div>
        )}
        
        {/* Share button - shown on hover */}
        <motion.button
          onClick={shareEvent}
          className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Share event"
        >
          <Share2 className="h-4 w-4" />
        </motion.button>
      </div>
      
      {/* Event details */}
      <div className="p-4">
        {/* Title and date */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            {eventData.title}
          </h3>
          
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
            <span>{formattedDate.full}</span>
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0 text-gray-400" />
          <span className="line-clamp-1">{eventData.location}</span>
        </div>
        
        {/* Event stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-1.5" />
            <span>{eventData.registered} {eventData.capacity ? `of ${eventData.capacity}` : ''} going</span>
          </div>
          
          {eventData.rating > 0 && (
            <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              <Star className="h-3.5 w-3.5 mr-1 fill-current" />
              <span>{eventData.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick actions - shown on hover */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Sold out or registration closed overlay */}
      {eventData.capacity > 0 && eventData.registered >= eventData.capacity && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="bg-white text-red-600 font-medium px-3 py-1 rounded-full text-sm">
            Sold Out
          </span>
        </div>
      )}
      
      {eventStatus === 'past' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="bg-white/90 text-gray-800 font-medium px-3 py-1 rounded-full text-sm">
            Event Ended
          </span>
        </div>
      )}
    </motion.article>
  );
};

export default EventCard;