import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, Share2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWeb3 } from '../../contexts/blockchain/Web3Context';
import { useAuth } from '../../contexts/AuthContext';
import { format, parseISO, isPast, isToday, isTomorrow, isThisWeek } from 'date-fns';
// Using ethers v5
import { ethers } from 'ethers';
const formatEther = (value) => ethers.utils.formatEther(value);

// Format date to a readable format
const formatEventDate = (dateString) => {
  if (!dateString) return 'Date not set';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    // Check if the time is set to midnight (no specific time provided)
    const hasTime = !(date.getHours() === 0 && date.getMinutes() === 0);
    
    if (isToday(date)) {
      return hasTime ? `Today • ${format(date, 'h:mm a')}` : 'Today';
    } else if (isTomorrow(date)) {
      return hasTime ? `Tomorrow • ${format(date, 'h:mm a')}` : 'Tomorrow';
    } else if (isThisWeek(date)) {
      return hasTime 
        ? `${format(date, 'EEEE • h:mm a')}`
        : format(date, 'EEEE');
    } else {
      return hasTime
        ? format(date, 'MMM d, yyyy • h:mm a')
        : format(date, 'MMM d, yyyy');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

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
  const { chainId } = useWeb3();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Parse event data
  const eventData = useMemo(() => {
    // Helper function to safely get location string
    const getLocationString = (location) => {
      if (!location || (typeof location === 'object' && Object.keys(location).length === 0)) {
        return 'Venue details coming soon';
      }
      
      // If it's a string, return it directly if not empty
      if (typeof location === 'string' && location.trim() !== '') {
        return location;
      }
      
      // If it's an object, try to construct a meaningful string
      if (typeof location === 'object') {
        const parts = [];
        if (location.name) parts.push(location.name);
        if (location.address) parts.push(location.address);
        if (location.city) parts.push(location.city);
        
        if (parts.length > 0) {
          return parts.join(', ');
        }
        
        // If we have coordinates but no other info
        if (location.coordinates) return 'Venue location available';
      }
      
      return 'Venue details coming soon';
    };
    
    // Helper to get a valid date
    const getValidDate = (date) => {
      if (!date) return null;
      const parsedDate = typeof date === 'string' ? parseISO(date) : new Date(date);
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
    };
    
    const eventDate = getValidDate(event.startDate || event.date);
    
    // Calculate price from ticket types if available (all prices should be in INR)
    const ticketPrices = event.ticketTypes?.length > 0 
      ? event.ticketTypes.map(t => {
          // Ensure price is a number and not in wei (starts with 0x)
          if (t.price && typeof t.price === 'string' && t.price.startsWith('0x')) {
            const priceInEth = parseFloat(formatEther(t.price));
            return priceInEth * 200000; // Convert ETH to INR
          }
          return parseFloat(t.price) || 0;
        }).filter(p => p > 0)
      : [];
    
    const minPrice = ticketPrices.length > 0 ? Math.min(...ticketPrices) : 0;
    const maxPrice = ticketPrices.length > 0 ? Math.max(...ticketPrices) : 0;
    
    return {
      ...event,
      id: event._id || event.id || 'no-id',
      title: event.name || event.title || 'Untitled Event',
      description: event.description || 'No description available.',
      image: event.image || event.coverImage || DEFAULT_EVENT_IMAGE,
      date: eventDate,
      location: getLocationString(event.location || event.venue || {}),
      // Ensure price is in INR
      price: (() => {
        // If we have a direct price, use it (assuming it's in INR)
        if (event.price) {
          if (typeof event.price === 'string' && event.price.startsWith('0x')) {
            // Convert from wei to ETH to INR
            const priceInEth = parseFloat(formatEther(event.price));
            return priceInEth * 200000; // Convert to INR
          }
          return parseFloat(event.price) || 0;
        }
        // If no price but we have ticket prices, use the minimum
        if (ticketPrices.length > 0) return Math.min(...ticketPrices);
        // Fallback to ticketPrice or 0
        return parseFloat(event.ticketPrice) || 0;
      })(),
      minPrice,
      maxPrice,
      hasMultiplePrices: ticketPrices.length > 1,
      category: event.category || 'Other',
      capacity: event.capacity || event.maxAttendees || 0,
      registered: event.attendees?.length || 0,
      isFree: ticketPrices.length > 0 
        ? ticketPrices.every(price => price === 0) 
        : (event.price === 0 || event.ticketPrice === 0 || event.isFree === true),
      rating: event.rating || 0,
      ticketTypes: event.ticketTypes || []
    };
  }, [event]);

  // Format date and time
  const formattedDate = useMemo(() => {
    // Use startDate if available, otherwise fall back to date
    const dateValue = eventData.startDate || eventData.date;
    const endDateValue = eventData.endDate;
    
    if (!dateValue) {
      return { 
        date: 'Date not specified', 
        time: 'Time not specified', 
        full: 'Date and time not specified',
        hasDate: false,
        hasTime: false
      };
    }
    
    try {
      // Parse the date if it's a string
      let startDate = dateValue;
      let endDate = endDateValue;
      
      const parseDate = (date) => {
        if (!date) return null;
        if (date instanceof Date) return date;
        try {
          return parseISO(date);
        } catch (e) {
          return new Date(date);
        }
      };
      
      startDate = parseDate(startDate);
      endDate = endDate ? parseDate(endDate) : null;
      
      // Check if the date is valid
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid start date');
      }
      
      // Check if we have time information
      const hasTime = eventData.startTime || 
                     eventData.time ||
                     (startDate.getHours() !== 0 || startDate.getMinutes() !== 0);
      
      // Relative date (Today, Tomorrow, This Week, or specific date)
      let relativeDate = '';
      if (isToday(startDate)) {
        relativeDate = 'Today';
      } else if (isTomorrow(startDate)) {
        relativeDate = 'Tomorrow';
      } else if (isThisWeek(startDate, { weekStartsOn: 1 })) {
        relativeDate = format(startDate, 'EEEE'); // Day of week
      } else {
        relativeDate = format(startDate, 'MMM d, yyyy');
      }
      
      // Format time range if we have both start and end dates
      let timeString = 'Time not specified';
      let fullDateString = format(startDate, 'EEEE, MMMM d, yyyy');
      
      if (hasTime) {
        const startTime = format(startDate, 'h:mm a');
        
        if (endDate && !isNaN(endDate.getTime())) {
          const endTime = format(endDate, 'h:mm a');
          const sameDay = startDate.toDateString() === endDate.toDateString();
          
          if (sameDay) {
            timeString = `${startTime} - ${endTime}`;
            fullDateString = `${format(startDate, 'EEEE, MMMM d, yyyy')} • ${timeString}`;
          } else {
            timeString = `${format(startDate, 'MMM d, h:mm a')} - ${format(endDate, 'MMM d, h:mm a, yyyy')}`;
            fullDateString = timeString;
          }
        } else {
          timeString = startTime;
          fullDateString = `${fullDateString} • ${timeString}`;
        }
      } else {
        fullDateString = `${fullDateString} • Time not specified`;
      }
      
      return { 
        date: relativeDate, 
        time: timeString,
        full: fullDateString,
        hasDate: true,
        hasTime
      };
    } catch (error) {
      console.error('Error formatting date:', error);
      console.log('Input date was:', dateValue);
      console.log('Event data:', {
        id: eventData.id,
        title: eventData.title,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        date: eventData.date
      });
      
      // Try to get a basic date string as fallback
      let fallbackDate = 'Date not available';
      let fallbackTime = 'Time not available';
      
      if (dateValue) {
        try {
          const d = new Date(dateValue);
          if (!isNaN(d.getTime())) {
            fallbackDate = d.toLocaleDateString();
            fallbackTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        } catch (e) {
          console.error('Fallback date formatting failed:', e);
        }
      }
      
      return { 
        date: fallbackDate, 
        time: fallbackTime, 
        full: `${fallbackDate} • ${fallbackTime}`,
        hasDate: fallbackDate !== 'Date not available',
        hasTime: fallbackTime !== 'Time not available'
      };
    }
  }, [eventData.date]);

  // Format price - all values are in INR
  const formattedPrice = useMemo(() => {
    // Helper function to ensure we have a valid number
    const toNumber = (value) => {
      if (value === undefined || value === null) return 0;
      const num = typeof value === 'string' ? parseFloat(value) : Number(value);
      return isNaN(num) ? 0 : num;
    };
    
    // Format the price with INR symbol and add 'onwards' for minimum price
    const formatCurrency = (amount, showOnwards = true) => {
      const formatted = `₹${amount.toLocaleString('en-IN', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      })}`;
      
      return showOnwards ? `${formatted} onwards` : formatted;
    };
    
    // If marked as free, return free
    if (eventData.isFree) return { text: 'Free', value: 0 };
    
    try {
      // If price is in wei (from blockchain)
      if (typeof eventData.price === 'string' && eventData.price.startsWith('0x')) {
        const priceInEth = parseFloat(formatEther(eventData.price));
        const priceInInr = priceInEth * 200000; // Convert ETH to INR
        return { 
          text: formatCurrency(priceInInr),
          value: priceInInr
        };
      }
      
      // If there are multiple ticket prices, show a range
      if (eventData.hasMultiplePrices || (eventData.minPrice && eventData.maxPrice)) {
        const min = toNumber(eventData.minPrice);
        const max = toNumber(eventData.maxPrice);
        
        // If we have a valid range
        if (min > 0 && max > 0 && min !== max) {
          return {
            text: `${formatCurrency(min, false)} - ${formatCurrency(max)}`,
            value: min
          };
        }
        // If only min price is available or min equals max
        else if (min > 0) {
          return {
            text: formatCurrency(min),
            value: min
          };
        }
      }
      
      // Single price case
      const price = toNumber(eventData.price);
      if (price > 0) {
        return {
          text: formatCurrency(price),
          value: price
        };
      }
      
      // Default case - free
      return { text: 'Free', value: 0 };
      
    } catch (error) {
      console.error('Error formatting price:', error);
      return { text: 'Free', value: 0 };
    }
  }, [eventData.isFree, eventData.price, eventData.minPrice, eventData.maxPrice, eventData.hasMultiplePrices]);

  // Toggle favorite status
  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality with backend
  };

  // Share event with improved error handling and fallback
  const shareEvent = (e) => {
    e.stopPropagation();
    console.log('Share button clicked - Event ID:', eventData.id);

    // Ensure we have a valid URL
    const eventUrl = `${window.location.origin}/events/${eventData.id || ''}`;
    const shareData = {
      title: eventData.title || 'Check out this event',
      text: `Check out this event: ${eventData.title || ''}`,
      url: eventUrl,
    };

    console.log('Sharing data:', shareData);

    // Fallback function for copying to clipboard
    const fallbackCopy = () => {
      console.log('Using fallback copy method');
      const textArea = document.createElement('textarea');
      textArea.value = eventUrl;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        const msg = successful ? 'Link copied to clipboard!' : 'Failed to copy link';
        console.log(msg);
        showToast(msg, successful ? 'success' : 'error');
      } catch (err) {
        console.error('Could not copy text: ', err);
        showToast('Could not copy link. Please try again.', 'error');
      }

      document.body.removeChild(textArea);
    };

    // Show toast notification
    const showToast = (message, type = 'info') => {
      const toast = document.createElement('div');
      toast.textContent = message;
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.backgroundColor = type === 'success' ? '#10B981' : '#EF4444';
      toast.style.color = 'white';
      toast.style.padding = '10px 20px';
      toast.style.borderRadius = '20px';
      toast.style.zIndex = '1000';
      toast.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      document.body.appendChild(toast);

      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 3000);
    };

    // Try Web Share API first
    if (navigator.share) {
      console.log('Web Share API is available');
      navigator.share(shareData)
        .then(() => console.log('Shared successfully'))
        .catch((error) => {
          console.error('Share failed:', error);
          if (error.name === 'AbortError') {
            console.log('Share was cancelled');
          } else {
            fallbackCopy();
          }
        });
    } else {
      console.log('Web Share API not available, using fallback');
      fallbackCopy();
    }
  };
  
  // Fallback share method using clipboard API
  const fallbackShare = (shareData) => {
    // Create a temporary input element
    const input = document.createElement('input');
    input.value = shareData.url;
    document.body.appendChild(input);
    input.select();
    
    try {
      const successful = document.execCommand('copy');
      const msg = successful ? 'Link copied to clipboard!' : 'Failed to copy link';
      // Show a toast notification instead of alert
      const toast = document.createElement('div');
      toast.textContent = msg;
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      toast.style.color = 'white';
      toast.style.padding = '10px 20px';
      toast.style.borderRadius = '20px';
      toast.style.zIndex = '1000';
      document.body.appendChild(toast);
      
      // Remove the toast after 3 seconds
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 3000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      // Last resort - show the URL in an alert
      alert('Could not copy link. Please copy it manually: ' + shareData.url);
    }
    
    // Clean up
    document.body.removeChild(input);
  };

  // Handle card click
  const handleClick = (e) => {
    // Don't navigate if clicking on interactive elements
    if (e.target.tagName === 'BUTTON' || e.target.closest('button, a, [role="button"]')) {
      return;
    }
    
    // Stop propagation to prevent multiple event triggers
    e.stopPropagation();
    
    // Call the onClick prop if provided (from parent component)
    if (onClick) {
      onClick(eventData);
    } else {
      // If no onClick prop is provided, navigate to the event details page
      navigate(`/events/${eventData.id}`);
    }
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
          src={eventData.image || eventData.coverImage || eventData.thumbnail || DEFAULT_EVENT_IMAGE}
          alt={eventData.title || 'Event image'}
          onError={(e) => {
            if (e.target.src !== DEFAULT_EVENT_IMAGE) {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = DEFAULT_EVENT_IMAGE;
            }
          }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
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
        
        {/* Category badge moved to bottom right */}
        
        {/* Moved Happening Today badge to the date section */}
        
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
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
          {eventData.title}
        </h3>
        
        {/* Date and Time - More prominent */}
        <div className="bg-blue-50 rounded-lg p-3 mb-3 border border-blue-100">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                {formattedDate.hasDate && formattedDate.hasTime ? 'Date & Time' : 
                 formattedDate.hasDate ? 'Date' : 'Time'}
              </p>
              <div className="space-y-1">
                {formattedDate.hasDate && (
                  <p className="text-sm text-gray-900 font-medium">
                    {formattedDate.date}
                    {formattedDate.hasTime && ` • ${formattedDate.time}`}
                  </p>
                )}
                {!formattedDate.hasDate && formattedDate.hasTime && (
                  <p className="text-sm text-gray-900 font-medium">
                    {formattedDate.time}
                  </p>
                )}
                {!formattedDate.hasDate && !formattedDate.hasTime && (
                  <p className="text-sm text-gray-500 italic">
                    Date and time not specified
                  </p>
                )}
              </div>
              {eventStatus === 'today' && formattedDate.hasDate && (
                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Happening Today
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Location - More prominent */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
          <div className="flex items-start">
            <div className="bg-gray-100 p-2 rounded-lg mr-3">
              <MapPin className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Location</p>
              <p className="text-sm text-gray-900 font-medium">
                {eventData.location || 'Location not specified'}
              </p>
              {eventData.location && eventData.location.includes('India') && (
                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  🇮🇳 India
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Event stats - More compact */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
              <Users className="h-4 w-4 mr-1.5 text-gray-500" />
              <span className="font-medium">{eventData.registered}</span>
              {eventData.capacity > 0 && (
                <span className="text-gray-400 mx-1">/</span>
              )}
              {eventData.capacity > 0 && (
                <span className="text-gray-500">{eventData.capacity}</span>
              )}
              <span className="ml-1">going</span>
            </div>
            
            {eventData.rating > 0 && (
              <div className="flex items-center text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 mr-1.5 fill-current" />
                <span className="font-medium">{eventData.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {/* Category badge - Moved here */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {eventData.category}
          </span>
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