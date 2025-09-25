import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Check, Plus, Minus,
  Share2, Mail, Facebook, Twitter, Instagram, Calendar, Clock, MapPin,
  Globe, Phone, Ticket, Star, StarHalf, Heart, AlertCircle, Loader2
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import { useEvents } from '../contexts/EventsContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Progress } from '../components/ui/progress';

// Mock WebSocket and polling hooks (replace with actual implementations)
const ConnectionStatus = {
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED'
};

const useEventWebSocket = (eventId) => {
  const [isConnected, setIsConnected] = useState(ConnectionStatus.DISCONNECTED);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    setIsConnected(ConnectionStatus.CONNECTING);
    const ws = new WebSocket(`wss://api.example.com/events/${eventId}`);
    ws.onopen = () => setIsConnected(ConnectionStatus.CONNECTED);
    ws.onmessage = (event) => setLastMessage(JSON.parse(event.data));
    ws.onerror = (err) => {
      setError(err);
      setIsConnected(ConnectionStatus.DISCONNECTED);
    };
    ws.onclose = () => setIsConnected(ConnectionStatus.DISCONNECTED);
    return () => ws.close();
  }, [eventId]);

  return { isConnected, error, lastMessage };
};

const usePolling = (url, interval, enabled) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !url) return;
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Polling failed');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      }
    };
    fetchData();
    const id = setInterval(fetchData, interval);
    return () => clearInterval(id);
  }, [url, interval, enabled]);

  return { data, error };
};

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate.toDateString() === endDate.toDateString()) {
    return `${startDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })} • ${startDate.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })} - ${endDate.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}`;
  }
  return `${startDate.toLocaleDateString('en-IN', {
    month: 'long',
    day: 'numeric'
  })} - ${endDate.toLocaleDateString('en-IN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })}`;
};

const calculateTimeLeft = (date) => {
  const difference = new Date(date) - new Date();
  if (difference > 0) {
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    return `${days}d ${hours}h ${minutes}m`;
  }
  return 'Event has started';
};

const createGenericEvent = (eventId) => ({
  _id: eventId,
  title: `Event ${eventId}`,
  description: 'Placeholder event',
  image: 'https://source.unsplash.com/random/800x600/?event',
  startDate: new Date(Date.now() + 86400000).toISOString(),
  endDate: new Date(Date.now() + 172800000).toISOString(),
  location: 'Unknown',
  venue: { name: 'Unknown', address: 'Unknown', city: 'Unknown' },
  category: 'Other',
  minPrice: 0,
  maxPrice: 0,
  capacity: 100,
  registered: 0,
  isFree: true,
  rating: 0,
  reviewCount: 0,
  ticketTypes: [{ id: '1', name: 'General', price: 0, quantity: 100, available: 100 }],
  organizer: { name: 'Unknown', email: 'unknown@example.com' },
  performers: [],
  schedule: [],
  faqs: [],
  availableTickets: 100,
  soldTickets: 0,
  __isFallback: true
});

const sampleEvent = {
  _id: 'summer-fest-2026',
  title: 'Summer Music Festival 2026',
  description: 'Join us for the biggest music festival of the year featuring top artists from around the world. Experience an unforgettable weekend of music, food, and fun!',
  image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1740&q=80',
  startDate: '2026-07-15T18:00:00+05:30',
  endDate: '2026-07-17T23:00:00+05:30',
  location: 'Marine Drive, Mumbai',
  venue: {
    name: 'Marine Drive Promenade',
    address: 'Netaji Subhash Chandra Bose Road',
    city: 'Mumbai, MH 400001',
    capacity: 50000,
    mapImage: 'https://maps.googleapis.com/maps/api/staticmap?center=18.9330,72.8235&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C18.9330,72.8235&key=YOUR_API_KEY',
    parking: 'Limited street parking available. Recommend using public transport or ride-sharing.',
    accessibility: 'Wheelchair accessible areas available. Contact organizer for special arrangements.'
  },
  category: 'Music Festival',
  minPrice: 2500,
  maxPrice: 10000,
  hasMultiplePrices: true,
  capacity: 50000,
  registered: 15000,
  isFree: false,
  rating: 4.8,
  reviewCount: 1567,
  organizer: {
    id: 'festival-productions',
    name: 'Festival Productions India Pvt. Ltd.',
    email: 'info@festivalproductions.in',
    phone: '+91 22 1234 5678',
    website: 'https://festivalproductions.in',
    description: 'Leading event management company specializing in music festivals and concerts across India.',
    logo: 'https://source.unsplash.com/random/200x200/?company'
  },
  ticketTypes: [
    {
      id: 'general',
      name: 'General Admission',
      price: 2500,
      quantity: 30000,
      available: 15000,
      description: 'Access to all general areas',
      benefits: ['General entry', 'Access to food courts', 'Standard viewing areas']
    },
    {
      id: 'vip',
      name: 'VIP Pass',
      price: 5000,
      quantity: 5000,
      available: 2000,
      description: 'Premium access with VIP amenities',
      benefits: ['Fast track entry', 'VIP lounge', 'Premium viewing platform', 'Complimentary drinks']
    },
    {
      id: 'platinum',
      name: 'Platinum Experience',
      price: 10000,
      quantity: 500,
      available: 150,
      description: 'Ultimate festival experience',
      benefits: ['Backstage access', 'Meet & greet', 'All VIP benefits', 'Exclusive merchandise', 'Dedicated concierge']
    }
  ],
  performers: [
    {
      id: '1',
      name: 'Arijit Singh',
      role: 'Headliner',
      image: 'https://source.unsplash.com/random/300x300/?singer-indian',
      bio: 'Renowned Bollywood playback singer known for his soulful voice.'
    },
    {
      id: '2',
      name: 'Sunidhi Chauhan',
      role: 'Co-Headliner',
      image: 'https://source.unsplash.com/random/300x300/?singer-female',
      bio: 'Versatile singer with powerful vocals.'
    },
    {
      id: '3',
      name: 'Badshah',
      role: 'Special Guest',
      image: 'https://source.unsplash.com/random/300x300/?rapper-indian',
      bio: 'Popular rapper and music producer.'
    },
    {
      id: '4',
      name: 'Neha Kakkar',
      role: 'Performer',
      image: 'https://source.unsplash.com/random/300x300/?popstar-female',
      bio: 'Energetic singer famous for party songs.'
    }
  ],
  schedule: [
    {
      day: 'Day 1 - July 15',
      events: [
        { time: '4:00 PM', title: 'Gates Open', description: 'Welcome to the festival' },
        { time: '5:30 PM', title: 'Opening Act: Local Bands', description: 'Emerging talents from Mumbai' },
        { time: '7:00 PM', title: 'Main Show: Arijit Singh', description: 'Soulful performances' },
        { time: '9:00 PM', title: 'Fireworks Display', description: 'Spectacular light show' }
      ]
    },
    {
      day: 'Day 2 - July 16',
      events: [
        { time: '3:00 PM', title: 'Gates Open', description: '' },
        { time: '4:30 PM', title: 'Special Performances: Indie Artists', description: 'Independent music scene' },
        { time: '6:00 PM', title: 'Headline: Sunidhi Chauhan & Badshah', description: 'High-energy sets' },
        { time: '8:30 PM', title: 'DJ Night', description: 'Dance to the beats' }
      ]
    },
    {
      day: 'Day 3 - July 17',
      events: [
        { time: '2:00 PM', title: 'Gates Open', description: '' },
        { time: '3:30 PM', title: 'Final Performances: Emerging Stars', description: '' },
        { time: '5:00 PM', title: 'Grand Finale: All Artists', description: 'Collaborative performances' },
        { time: '10:00 PM', title: 'Closing Ceremony', description: 'Farewell with surprises' }
      ]
    }
  ],
  faqs: [
    {
      question: 'What are the age restrictions?',
      answer: 'This is an all-ages event. Children under 12 get in free with a paying adult.'
    },
    {
      question: 'What can I bring to the event?',
      answer: 'Small bags, empty water bottles, and personal cameras are allowed.'
    },
    {
      question: 'Is there parking available?',
      answer: 'Limited parking nearby. We recommend using metro, buses, or ride-sharing services.'
    },
    {
      question: 'What is the refund policy?',
      answer: 'Tickets are non-refundable unless the event is cancelled.'
    },
    {
      question: 'Are there COVID-19 protocols?',
      answer: 'Please check current guidelines. Masks may be required.'
    }
  ],
  policies: {
    refund: 'No refunds unless event is cancelled or rescheduled.',
    transfer: 'Tickets can be transferred via the app.',
    resale: 'Official resale through Ticketmaster only.',
    entry: 'Digital tickets only. Have your phone ready.'
  },
  availableTickets: 35000,
  soldTickets: 15000
};

const sampleReviews = [
  {
    id: 1,
    user: 'Raj Patel',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    date: '2025-08-15',
    comment: 'Amazing festival! Loved Arijit Singh\'s performance!',
    likes: 42,
    images: [
      'https://source.unsplash.com/random/300x200/?concert',
      'https://source.unsplash.com/random/300x200/?festival'
    ]
  },
  {
    id: 2,
    user: 'Priya Sharma',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    rating: 4,
    date: '2025-08-16',
    comment: 'Great event, but parking was a hassle.',
    likes: 18,
    images: []
  }
];

const EventDetailsPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getEventById, purchaseTicket, addReview } = useEvents();
  const { user, isAuthenticated } = useAuth();

  // Create a generic event object as fallback
  const createGenericEvent = (eventId) => ({
    _id: eventId,
    title: `Event ${eventId}`,
    description: 'Placeholder event',
    image: 'https://source.unsplash.com/random/800x600/?event',
    startDate: new Date(Date.now() + 86400000).toISOString(),
    endDate: new Date(Date.now() + 172800000).toISOString(),
    location: 'Unknown',
    venue: { 
      name: 'Unknown Venue', 
      address: 'Address not available', 
      city: 'Unknown',
      parking: 'No parking information available',
      accessibility: 'No accessibility information available',
      mapImage: 'https://maps.googleapis.com/maps/api/staticmap?center=0,0&zoom=2&size=600x300&maptype=roadmap'
    },
    category: 'Other',
    minPrice: 0,
    maxPrice: 0,
    capacity: 100,
    registered: 0,
    isFree: true,
    rating: 0,
    reviewCount: 0,
    ticketTypes: [{ 
      id: 'general', 
      name: 'General Admission', 
      price: 0, 
      quantity: 100, 
      available: 100,
      description: 'General admission ticket',
      benefits: ['General access to the event']
    }],
    organizer: { 
      name: 'Unknown Organizer', 
      email: 'contact@example.com',
      description: 'No description available',
      phone: 'Not available',
      website: '#'
    },
    performers: [],
    schedule: [],
    faqs: [],
    availableTickets: 100,
    soldTickets: 0,
    __isFallback: true
  });

  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState(sampleReviews);
  const [loading, setLoading] = useState(true);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [purchaseStatus, setPurchaseStatus] = useState({ type: '', message: '' });
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedSection, setSelectedSection] = useState('gold');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [ticketType, setTicketType] = useState('general');
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);

  // WebSocket and polling
  const { isConnected: isWsConnected, error: wsError, lastMessage } = useEventWebSocket(eventId);
  const pollingUrl = eventId ? `/api/v1/events/${eventId}/reviews` : '';
  const { data: polledReviews, error: pollError } = usePolling(
    pollingUrl,
    10000,
    !isWsConnected && !!eventId && !!pollingUrl
  );

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'NEW_REVIEW' && lastMessage.review) {
      setReviews(prev => [lastMessage.review, ...prev]);
    }
  }, [lastMessage]);

  // Update reviews from polling
  useEffect(() => {
    if (polledReviews && !isWsConnected) {
      setReviews(polledReviews);
    }
  }, [polledReviews, isWsConnected]);

  // Update countdown
  useEffect(() => {
    if (!event) return;
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(event.startDate));
    }, 60000);
    setTimeLeft(calculateTimeLeft(event.startDate));
    return () => clearInterval(timer);
  }, [event]);

  // Fetch event
  useEffect(() => {
    let isMounted = true;
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const eventData = await getEventById(eventId);
        if (isMounted) {
          const finalEvent = eventData || createGenericEvent(eventId);
          setEvent({
            ...finalEvent,
            availableTickets: finalEvent.availableTickets ?? finalEvent.capacity - (finalEvent.registered || 0),
            soldTickets: finalEvent.registered || 0
          });
          setTicketType(finalEvent.ticketTypes?.[0]?.id || 'general');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        if (isMounted) {
          setEvent(createGenericEvent(eventId));
          setPurchaseStatus({ type: 'error', message: 'Failed to load event details.' });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchEvent();
    return () => {
      isMounted = false;
    };
  }, [eventId, getEventById]);

  // Venue sections
  const venueSections = useMemo(() => ({
    gold: {
      name: 'Gold',
      price: event?.ticketTypes?.find(t => t.name.toLowerCase().includes('platinum'))?.price || 10000,
      available: 150,
      total: 500,
      rows: 5,
      seatsPerRow: 10,
      color: 'bg-amber-500',
      textColor: 'text-amber-500',
      borderColor: 'border-amber-500',
      selectedColor: 'bg-amber-600',
      hoverColor: 'hover:bg-amber-100'
    },
    silver: {
      name: 'Silver',
      price: event?.ticketTypes?.find(t => t.name.toLowerCase().includes('vip'))?.price || 5000,
      available: 2000,
      total: 5000,
      rows: 6,
      seatsPerRow: 15,
      color: 'bg-gray-400',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-400',
      selectedColor: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-100'
    },
    bronze: {
      name: 'Bronze',
      price: event?.ticketTypes?.find(t => t.name.toLowerCase().includes('general'))?.price || 2500,
      available: 15000,
      total: 30000,
      rows: 8,
      seatsPerRow: 20,
      color: 'bg-amber-800',
      textColor: 'text-amber-800',
      borderColor: 'border-amber-800',
      selectedColor: 'bg-amber-900',
      hoverColor: 'hover:bg-amber-50'
    }
  }), [event?.ticketTypes]);

  const currentSection = venueSections[selectedSection];

  // Calculate ticket pricing
  const { subtotal, tax, total } = useMemo(() => {
    if (!event) return { subtotal: 0, tax: 0, total: 0 };
    const selectedTicket = event.ticketTypes?.find(t => t.id === ticketType);
    if (!selectedTicket) return { subtotal: 0, tax: 0, total: 0 };
    const subtotal = selectedTicket.price * ticketQuantity;
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [event, ticketType, ticketQuantity]);

  // Render stars
  const renderStars = useCallback((rating, size = 'md') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-400 fill-current`} />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-yellow-400 fill-current`} />
      );
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-300 fill-current`} />
      );
    }
    return stars;
  }, []);

  // Render selected seats with comprehensive null checks
  const renderSelectedSeats = useCallback(() => {
    try {
      if (!Array.isArray(selectedSeats) || selectedSeats.length === 0) {
        return null;
      }
      
      return (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-lg mb-3">Selected Seats</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat, index) => {
              // Skip invalid seat entries
              if (!seat || typeof seat !== 'object') return null;
              
              const section = seat?.section || 'Section';
              const row = seat?.row || '';
              const number = seat?.number || '';
              
              return (
                <div 
                  key={`${section}-${row}-${number}-${index}`} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {section} - {row}{number}
                </div>
              );
            })}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering selected seats:', error);
      return null;
    }
  }, [selectedSeats]);

  // Render venue layout
  const renderVenueLayout = useCallback(() => (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Select Your Seats</h3>
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
          {Object.entries(venueSections).map(([key, section]) => (
            <button
              key={key}
              onClick={() => setSelectedSection(key)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                selectedSection === key
                  ? `${section.color} text-white`
                  : `border-2 ${section.borderColor} ${section.hoverColor}`
              )}
              aria-label={`Select ${section.name} section`}
            >
              {section.name} ({formatCurrency(section.price)})
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <div className="w-full bg-gray-800 text-white text-center py-3 mb-8 rounded-md">
          <h4 className="font-bold">STAGE</h4>
        </div>
        <div className="border-2 border-gray-200 rounded-lg p-4">
          <div className="flex flex-col items-center">
            {Array.from({ length: currentSection.rows }).map((_, row) => (
              <div key={row} className="flex justify-center mb-2">
                <div className="text-xs text-gray-500 w-6 flex items-center justify-end pr-2">
                  {String.fromCharCode(65 + row)}
                </div>
                <div className="flex space-x-1">
                  {Array.from({ length: currentSection.seatsPerRow }).map((_, seat) => {
                    const seatId = `${String.fromCharCode(65 + row)}${seat + 1}`;
                    const isSelected = selectedSeats.some(s => s.id === seatId);
                    const isAvailable = seat < currentSection.available;
                    return (
                      <TooltipProvider key={seat}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => isAvailable && toggleSeat(row, seat)}
                              disabled={!isAvailable}
                              className={cn(
                                'w-8 h-8 flex items-center justify-center rounded-sm text-xs font-medium transition-colors',
                                !isAvailable
                                  ? 'bg-gray-200 cursor-not-allowed'
                                  : isSelected
                                  ? `${currentSection.selectedColor} text-white`
                                  : `border ${currentSection.borderColor} ${currentSection.hoverColor}`
                              )}
                              aria-label={`Seat ${seatId} - ${isAvailable ? 'Available' : 'Sold Out'}`}
                            >
                              {seat + 1}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {seatId} - {isAvailable ? 'Available' : 'Sold Out'} - {formatCurrency(currentSection.price)}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-6 space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-200 rounded-sm mr-2"></div>
            <span>Sold Out</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 ${currentSection.selectedColor} rounded-sm mr-2`}></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
    </div>
  ), [currentSection, selectedSeats, selectedSection, venueSections]);

  // Toggle seat selection
  const toggleSeat = useCallback((row, seat) => {
    const seatId = `${String.fromCharCode(65 + row)}${seat + 1}`;
    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.id === seatId);
      if (isSelected) {
        return prev.filter(s => s.id !== seatId);
      } else if (prev.length < ticketQuantity) {
        return [...prev, {
          id: seatId,
          section: selectedSection,
          price: venueSections[selectedSection].price,
          row: String.fromCharCode(65 + row),
          number: seat + 1
        }];
      }
      return prev;
    });
  }, [selectedSection, ticketQuantity, venueSections]);

  // Handle purchase with comprehensive error handling
  const handlePurchase = useCallback(async () => {
    // Check authentication
    if (!isAuthenticated) {
      setPurchaseStatus({ type: 'error', message: 'Please sign in to purchase tickets.' });
      navigate('/login', { state: { from: `/events/${eventId}` } });
      return;
    }

    // Validate event data
    if (!event || typeof event !== 'object') {
      setPurchaseStatus({ type: 'error', message: 'Event information is not available.' });
      return;
    }

    // Validate ticket types
    if (!Array.isArray(event.ticketTypes) || event.ticketTypes.length === 0) {
      setPurchaseStatus({ type: 'error', message: 'No ticket types available for this event' });
      return;
    }

    // Find selected ticket with validation
    const selectedTicket = event.ticketTypes.find(t => t && t.id === ticketType);
    if (!selectedTicket) {
      console.error('Selected ticket not found:', { ticketType, availableTickets: event.ticketTypes });
      setPurchaseStatus({ 
        type: 'error', 
        message: 'Selected ticket type is no longer available. Please refresh the page and try again.' 
      });
      return;
    }

    // Validate ticket quantity
    const quantity = Number(ticketQuantity) || 1;
    if (quantity < 1) {
      setPurchaseStatus({ 
        type: 'error', 
        message: 'Please select at least one ticket.' 
      });
      return;
    }

    // Check ticket availability
    const availableTickets = Number(selectedTicket.available) || 0;
    if (quantity > availableTickets) {
      setPurchaseStatus({ 
        type: 'error', 
        message: `Only ${availableTickets} ticket${availableTickets !== 1 ? 's' : ''} available.` 
      });
      return;
    }

    if (selectedTicket.available < ticketQuantity) {
      setPurchaseStatus({ type: 'error', message: 'Not enough tickets available.' });
      return;
    }

    if (selectedSeats.length > 0 && selectedSeats.length !== ticketQuantity) {
      setPurchaseStatus({ type: 'error', message: 'Selected seats must match ticket quantity.' });
      return;
    }

    setIsPurchasing(true);
    
    try {
      const purchaseData = {
        eventId,
        ticketType,
        quantity: ticketQuantity,
      };
      
      const result = await purchaseTicket(purchaseData);
      if (result.success) {
        setPurchaseStatus({ type: 'success', message: `Successfully purchased ${ticketQuantity} ticket(s)!` });
        setShowPurchaseSuccess(true);
        try {
          const updatedEvent = await getEventById(eventId);
          setEvent({
            ...updatedEvent,
            availableTickets: updatedEvent.availableTickets ?? updatedEvent.capacity - (updatedEvent.registered || 0),
          });
        } catch (error) {
          console.error('Failed to update event data:', error);
        }
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      setPurchaseStatus({ 
        type: 'error', 
        message: error.message || 'Failed to process purchase. Please try again.' 
      });
    } finally {
      setIsPurchasing(false);
    }
  }, [isAuthenticated, navigate, event, ticketType, ticketQuantity, selectedSeats, eventId, purchaseTicket, getEventById]);
  // Handle review submission
  const handleSubmitReview = useCallback(async () => {
    if (!reviewText.trim()) {
      setPurchaseStatus({ type: 'error', message: 'Review cannot be empty.' });
      return;
    }
    const newReview = {
      id: reviews.length + 1,
      user: user?.name || 'Anonymous',
      avatar: user?.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg',
      rating: reviewRating,
      date: new Date().toLocaleDateString('en-IN'),
      comment: reviewText,
      likes: 0,
      images: []
    };
    try {
      await addReview(eventId, newReview);
      setReviews([newReview, ...reviews]);
      setShowReviewForm(false);
      setReviewText('');
      setReviewRating(5);
      setPurchaseStatus({ type: 'success', message: 'Review submitted successfully!' });
    } catch (error) {
      setPurchaseStatus({ type: 'error', message: 'Failed to submit review.' });
    }
  }, [eventId, user, reviewRating, reviewText, reviews, addReview]);

  // Handle social sharing
  const handleShare = useCallback((platform) => {
    const url = window.location.href;
    const text = `Check out ${event?.title} at ${event?.location}! ${formatDateRange(event?.startDate, event?.endDate)}`;
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      instagram: `https://www.instagram.com/`
    };
    window.open(shareUrls[platform], '_blank');
  }, [event]);

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    return Object.entries(distribution).map(([star, count]) => ({
      star: Number(star),
      value: reviews.length ? (count / reviews.length) * 100 : 0
    }));
  }, [reviews]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading event details...</h2>
          <p className="text-gray-500">Please wait while we load the event information</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Event Not Found</h2>
          <p className="text-gray-500">The event you're looking for does not exist.</p>
          <Button
            className="mt-4"
            onClick={() => navigate('/explore')}
            aria-label="Back to events"
          >
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error/Success Notification */}
      {purchaseStatus.message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            'p-3 rounded-lg mb-4 max-w-7xl mx-auto',
            purchaseStatus.type === 'error'
              ? 'bg-red-100 border border-red-300 text-red-600'
              : 'bg-green-100 border border-green-300 text-green-600'
          )}
        >
          <p className="text-sm flex items-start">
            {purchaseStatus.type === 'error' ? (
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : (
              <Check className="h-5 w-5 mr-2 flex-shrink-0" />
            )}
            {purchaseStatus.message}
          </p>
        </motion.div>
      )}

      {/* Hero Section */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img
          src={event.image || sampleEvent.image}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = sampleEvent.image)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-7xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              {event.category}
            </Badge>
            <h1 className="text-5xl font-bold mb-2">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-lg">
              <div className="flex items-center">
                <Calendar className="mr-2" size={20} />
                {formatDateRange(event.startDate, event.endDate)}
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2" size={20} />
                {event.location}
              </div>
              <div className="flex items-center">
                <Clock className="mr-2" size={20} />
                {timeLeft}
              </div>
              <div className="flex items-center">
                <Ticket className="mr-2" size={20} />
                {formatCurrency(event.minPrice)} - {formatCurrency(event.maxPrice)}
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <Button
                size="lg"
                onClick={handlePurchase}
                disabled={isPurchasing || event.availableTickets <= 0}
                aria-label={isPurchasing ? 'Processing purchase' : 'Buy tickets'}
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Ticket className="mr-2" size={20} />
                    Buy Tickets
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsFavorited(!isFavorited)}
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={cn('mr-2', isFavorited ? 'fill-red-500 text-red-500' : '')} size={20} />
                Favorite
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="lg" aria-label="Share event">
                      <Share2 size={20} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex gap-2">
                      <button onClick={() => handleShare('facebook')} aria-label="Share on Facebook">
                        <Facebook size={20} />
                      </button>
                      <button onClick={() => handleShare('twitter')} aria-label="Share on Twitter">
                        <Twitter size={20} />
                      </button>
                      <button onClick={() => handleShare('instagram')} aria-label="Share on Instagram">
                        <Instagram size={20} />
                      </button>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="lineup">Lineup</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="venue">Venue</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <h2 className="text-3xl font-bold mb-4">Event Details</h2>
                <p className="text-gray-600 mb-6">{event.description || 'No description available'}</p>
                <h3 className="text-2xl font-semibold mb-4">Organizer Information</h3>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={event.organizer?.logo || '/images/organizer-placeholder.jpg'}
                      alt={event.organizer?.name || 'Organizer'}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h4 className="font-bold text-xl">{event.organizer?.name || 'Unknown'}</h4>
                      <p className="text-gray-600">{event.organizer?.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <a href={`mailto:${event.organizer?.email || 'unknown@example.com'}`}>
                        {event.organizer?.email || 'unknown@example.com'}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      {event.organizer?.phone || 'Not available'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={16} />
                      <a
                        href={event.organizer?.website || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {event.organizer?.website || 'Not available'}
                      </a>
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mt-8 mb-4">Policies</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li><strong>Refund:</strong> {event.policies?.refund || 'Not specified'}</li>
                  <li><strong>Transfer:</strong> {event.policies?.transfer || 'Not specified'}</li>
                  <li><strong>Resale:</strong> {event.policies?.resale || 'Not specified'}</li>
                  <li><strong>Entry:</strong> {event.policies?.entry || 'Not specified'}</li>
                </ul>
              </TabsContent>

              <TabsContent value="lineup" className="mt-6">
                <h2 className="text-3xl font-bold mb-6">Lineup</h2>
                {!event.performers || event.performers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No lineup information available.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {event.performers.map(artist => (
                      <div key={artist.id} className="bg-white rounded-lg shadow overflow-hidden">
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => (e.target.src = '/images/artist-placeholder.jpg')}
                        />
                        <div className="p-4">
                          <h3 className="font-bold text-xl mb-1">{artist.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{artist.role}</p>
                          <p className="text-gray-600">{artist.bio}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schedule" className="mt-6">
                <h2 className="text-3xl font-bold mb-6">Schedule</h2>
                {!event.schedule || event.schedule.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No schedule available for this event.</p>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {event.schedule.map((day, index) => (
                      <AccordionItem key={index} value={`day-${index}`}>
                        <AccordionTrigger>{day.day}</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-4">
                            {day.events.map((evt, idx) => (
                              <li key={idx} className="flex gap-4">
                                <span className="font-medium min-w-[80px]">{evt.time}</span>
                                <div>
                                  <p className="font-semibold">{evt.title}</p>
                                  {evt.description && <p className="text-gray-600">{evt.description}</p>}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </TabsContent>

              <TabsContent value="venue" className="mt-6">
                <h2 className="text-3xl font-bold mb-6">Venue</h2>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-bold text-2xl mb-2">{event.venue?.name || 'Unknown'}</h3>
                  <p className="text-gray-600 mb-4">
                    {event.venue?.address || 'Unknown'}, {event.venue?.city || 'Unknown'}
                  </p>
                  <img
                    src={event.venue?.mapImage || '/images/map-placeholder.jpg'}
                    alt="Venue map"
                    className="w-full h-64 object-cover rounded mb-4"
                  />
                  <h4 className="font-semibold mb-2">Parking</h4>
                  <p className="text-gray-600 mb-4">{event.venue?.parking || 'Not specified'}</p>
                  <h4 className="font-semibold mb-2">Accessibility</h4>
                  <p className="text-gray-600">{event.venue?.accessibility || 'Not specified'}</p>
                </div>
                {showSeatMap && renderVenueLayout()}
                <Button
                  onClick={() => setShowSeatMap(!showSeatMap)}
                  className="mt-4"
                  aria-label={showSeatMap ? 'Hide seat map' : 'View seat map'}
                >
                  {showSeatMap ? 'Hide Seat Map' : 'View Seat Map'}
                </Button>
              </TabsContent>

              <TabsContent value="faq" className="mt-6">
                <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  {(event.faqs || []).map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <h2 className="text-3xl font-bold mb-6">Reviews</h2>
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl font-bold">{event.rating || 0}</div>
                    <div className="flex">{renderStars(event.rating || 0)}</div>
                    <div className="text-gray-600">({event.reviewCount || 0} reviews)</div>
                  </div>
                  {ratingDistribution.map(({ star, value }) => (
                    <div key={star} className="flex items-center gap-2 mb-2">
                      <span className="w-8">{star} stars</span>
                      <Progress value={value} className="flex-1" />
                    </div>
                  ))}
                </div>
                {reviews.map(review => (
                  <div key={review.id} className="bg-white rounded-lg shadow p-6 mb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <img src={review.avatar} alt={review.user} className="w-10 h-10 rounded-full" />
                      <div>
                        <h4 className="font-semibold">{review.user}</h4>
                        <div className="flex">{renderStars(review.rating, 'sm')}</div>
                      </div>
                      <span className="ml-auto text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-600 mb-4">{review.comment}</p>
                    {review.images.length > 0 && (
                      <div className="flex gap-2">
                        {review.images.map((img, idx) => (
                          <img key={idx} src={img} alt="Review image" className="w-24 h-24 object-cover rounded" />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-4 text-gray-500">
                      <Heart size={16} /> {review.likes}
                    </div>
                  </div>
                ))}
                {isAuthenticated && (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    className="mt-4"
                    aria-label="Write a review"
                  >
                    Write a Review
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Ticket Sidebar */}
          <div className="lg:sticky lg:top-4 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-2xl font-bold mb-4">Tickets</h3>
              {event.availableTickets <= 0 ? (
                <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-center">
                  <p className="text-red-600 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Sold Out
                  </p>
                </div>
              ) : (
                <>
                  <RadioGroup value={ticketType} onValueChange={setTicketType}>
                    {(event.ticketTypes || []).map(type => (
                      <div key={type.id} className="mb-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <RadioGroupItem value={type.id} id={type.id} />
                          <Label htmlFor={type.id} className="font-semibold flex-1 ml-2">
                            {type.name} - {formatCurrency(type.price)}
                          </Label>
                          <span className="text-sm text-gray-500">
                            {type.available} available
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                        <ul className="list-disc pl-4 text-sm text-gray-600">
                          {type.benefits.map((benefit, idx) => (
                            <li key={idx}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </RadioGroup>
                  <div className="mt-4">
                    <Label>Quantity</Label>
                    <div className="flex items-center mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setTicketQuantity(prev => Math.max(1, prev - 1))}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="mx-4">{ticketQuantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setTicketQuantity(prev => {
                          const selectedTicket = event.ticketTypes.find(t => t.id === ticketType);
                          return Math.min(prev + 1, selectedTicket?.available || 10);
                        })}
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>GST (18%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-6"
                    onClick={handlePurchase}
                    disabled={isPurchasing || event.availableTickets <= 0}
                    aria-label={isPurchasing ? 'Processing purchase' : 'Buy tickets'}
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Buy Now'
                    )}
                  </Button>
                </>
              )}
            </div>
            {renderSelectedSeats()}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showPurchaseSuccess} onOpenChange={setShowPurchaseSuccess}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-800 flex items-center">
              <Check className="h-6 w-6 text-green-500 mr-2" />
              Purchase Successful
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-gray-600 mb-6">
              Your {ticketQuantity} {ticketQuantity > 1 ? 'tickets' : 'ticket'} for{' '}
              <span className="font-semibold">{event.title}</span> have been added to your account.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate('/tickets')}
                className="bg-blue-600 hover:bg-blue-700"
                aria-label="View my tickets"
              >
                View My Tickets
              </Button>
              <Button
                onClick={() => setShowPurchaseSuccess(false)}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
                aria-label="Continue browsing"
              >
                Continue Browsing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  size={24}
                  className={cn(
                    'cursor-pointer',
                    star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  )}
                  onClick={() => setReviewRating(star)}
                  aria-label={`Rate ${star} stars`}
                />
              ))}
            </div>
            <textarea
              className="w-full h-32 p-2 border rounded"
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              placeholder="Share your experience..."
              aria-label="Review text"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmitReview}
              disabled={!reviewText.trim()}
              aria-label="Submit review"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetailsPage;