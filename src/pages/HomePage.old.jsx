import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { 
  QrCode, Shield, Repeat, CreditCard, ChevronRight, Star, X 
} from 'lucide-react';
import { useEvents } from '../contexts/EventsContext';
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import EventCard from '../components/events/EventCard';
import QRTicket from '../components/tickets/QRTicket';
import TestimonialsSection from '../components/testimonials/TestimonialsSection';
import FeaturesSection from '../components/features/FeaturesSection';
import HeroSection from '../components/HeroSection';
import useWebSocket from '../hooks/useWebSocket';
import { useContract } from '../hooks/useContract';

// Styled Components
const HeroContainer = styled.section`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const VideoBackground = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  
  /* Ensure video covers the entire container */
  min-width: 100%;
  min-height: 100%;
  
  /* Center the video */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  
  /* Fallback background */
  background: #000;
  
  /* iOS specific fixes */
  -webkit-transform: translate(-50%, -50%);
  -moz-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  -o-transform: translate(-50%, -50%);
  
  /* Prevent video from being too large on mobile */
  @media (max-width: 768px) {
    width: auto;
    height: 100%;
  }
`;

const HeroOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  width: 100%;
  padding: 0 20px;
  color: white;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  margin: 20px 0;
  line-height: 1.2;
  background: linear-gradient(45deg, #fff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  color: #e0e0e0;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const HeroDescription = styled.p`
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto 40px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CtaButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 40px;
  flex-wrap: wrap;
`;

const ButtonBase = styled.button`
  padding: 15px 35px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  border: none;
  outline: none;
`;

const PrimaryButton = styled(ButtonBase)`
  background: linear-gradient(45deg, #7c3aed, #8b5cf6);
  color: white;
  box-shadow: 0 4px 15px rgba(123, 97, 255, 0.3);
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(123, 97, 255, 0.4);
  }
`;

const SecondaryButton = styled(ButtonBase)`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  cursor: pointer;
  span {
    margin-bottom: 10px;
  }
`;

const Card = styled.div`
  background: #1a1a2e;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: transform 0.3s ease;
`;

const Section = styled.section`
  padding: 5rem 0;
  background: ${props => props.bg || '#1a1a2e'};
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #f0f0f0;
  margin-bottom: 1rem;
`;

const Tagline = styled.p`
  font-size: 1.2rem;
  color: #a0a0a0;
  margin-bottom: 1rem;
`;

const Button = styled(Link)`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  &.btn-primary {
    background: #7c3aed;
    color: white;
    &:hover {
      background: #6d28d9;
    }
  }
  &.btn-outline {
    border: 1px solid #7c3aed;
    color: #7c3aed;
    background: transparent;
    &:hover {
      background: rgba(124, 58, 237, 0.1);
    }
  }
`;

const Input = styled.input`
  padding: 0.5rem 1rem;
  border: 1px solid #333;
  border-radius: 0.5rem;
  background: #2a2a3a;
  color: #f0f0f0;
  width: 100%;
`;

const HomePage = () => {
  const { openAuthModal } = useAuthModal();
  const { events, loading: eventsLoading, error: eventsError } = useEvents();
  const { user, isAuthenticated, token } = useAuth();
  const [showResellModal, setShowResellModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [resalePrice, setResalePrice] = useState('');
  const [resaleMessage, setResaleMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();
  const { socket } = useWebSocket(token);
  const { buyTicket } = useContract();

  // Debug logging
  useEffect(() => {
    console.log('HomePage - Auth state changed:', { 
      isAuthenticated, 
      user: user ? { id: user.id, email: user.email } : null,
      timestamp: new Date().toISOString()
    });
    const storedUser = localStorage.getItem('scantyx_user');
    console.log('Stored user in localStorage:', storedUser ? JSON.parse(storedUser) : null);
  }, [isAuthenticated, user]);

  // Fetch user tickets
  const [userTickets, setUserTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState(null);

  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!isAuthenticated) {
        setUserTickets([]);
        return;
      }

      setTicketsLoading(true);
      setTicketsError(null);

      try {
        const response = await fetch('/api/tickets/my-tickets', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch tickets');
        const data = await response.json();
        setUserTickets(data.map(t => ({
          ...t,
          price: parseFloat(t.price),
        })));
      } catch (error) {
        console.error('Error fetching user tickets:', error);
        setTicketsError('Failed to load your tickets');
      } finally {
        setTicketsLoading(false);
      }
    };

    fetchUserTickets();
  }, [isAuthenticated, token]);

  const resellableTickets = userTickets?.filter(ticket => !ticket.isUsed && !ticket.isForSale) || [];

  const handleCreateEvent = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openAuthModal('signup');
    } else {
      navigate('/user/create-event');
    }
  };

  const handleExploreEvents = (e) => {
    e?.preventDefault();
    const eventsSection = document.getElementById('featured-events');
    if (eventsSection) {
      eventsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/explore');
    }
  };

  const handleExploreEvents = (e) => {
    e.preventDefault();
    navigate('/explore');
  };

  const handleResellClick = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowResellModal(true);
    setResaleMessage({ type: '', text: '' });
  };

  const listTicketForResale = async (ticketId, price) => {
    try {
      const response = await fetch('/api/tickets/resell', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId, price }),
      });
      const data = await response.json();
      if (response.ok) {
        socket.emit('ticketForSale', { ticketId, price }); // Notify WebSocket
        return { success: true, message: 'Ticket listed for resale!' };
      }
      return { success: false, message: data.message || 'Failed to list ticket' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const handleResellSubmit = async (e) => {
    e.preventDefault();
    const price = parseInt(resalePrice, 10);
    if (isNaN(price) || price <= 0) {
      setResaleMessage({ type: 'error', text: 'Please enter a valid price' });
      return;
    }

    const ticket = userTickets.find(t => t.id === selectedTicketId);
    if (price > ticket.price * 1.5) {
      setResaleMessage({ 
        type: 'error', 
        text: `Price cannot exceed 150% of original price (${(ticket.price * 1.5).toFixed(2)})` 
      });
      return;
    }

    const result = await listTicketForResale(selectedTicketId, price);
    setResaleMessage({ type: result.success ? 'success' : 'error', text: result.message });
    if (result.success) {
      setTimeout(() => {
        setShowResellModal(false);
        setSelectedTicketId(null);
        setResalePrice('');
        setUserTickets(userTickets.map(t => t.id === selectedTicketId ? { ...t, isForSale: true } : t));
      }, 2000);
    }
  };

  // Hero Section Component
  const HeroSection = () => {
    const videoRef = useRef(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [hasInteraction, setHasInteraction] = useState(false);

    const playVideo = useCallback(async () => {
      if (!videoRef.current) return;
      
      try {
        // Ensure video is in the DOM
        if (!document.body.contains(videoRef.current)) {
          console.warn('Video element not in DOM, cannot play');
          return;
        }
        
        // Set video attributes for autoplay
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        
        // Attempt to play
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          setIsVideoPlaying(true);
        }
      } catch (error) {
        console.warn('Video autoplay prevented:', error);
        // Don't show error to user, we'll handle it gracefully
      }
    }, []);

    // Handle user interaction
    const handleUserInteraction = useCallback(() => {
      if (!isVideoPlaying) {
        setHasInteraction(true);
        playVideo();
      }
    }, [isVideoPlaying, playVideo]);

    // Try to play on component mount
    useEffect(() => {
      if (!hasInteraction) {
        const timer = setTimeout(() => {
          playVideo();
        }, 1000); // Small delay to ensure DOM is ready
        
        return () => clearTimeout(timer);
      }
    }, [hasInteraction, playVideo]);
    
    // Set up interaction listeners
    useEffect(() => {
      const events = ['click', 'touchstart', 'keydown', 'scroll'];
      
      const handleInteraction = () => {
        if (!hasInteraction) {
          handleUserInteraction();
        }
      };
      
      // Add event listeners
      events.forEach(event => {
        window.addEventListener(event, handleInteraction, { once: true });
      });
      
      return () => {
        // Cleanup
        events.forEach(event => {
          window.removeEventListener(event, handleInteraction);
        });
      };
    }, [hasInteraction, handleUserInteraction]);

    return (
      <HeroContainer>
        <VideoBackground 
          autoPlay 
          loop 
          muted 
          playsInline 
          ref={videoRef}

return (
<div className="min-h-screen bg-gray-50">
<HeroSection />
<Section bg="#1a1a2e">
<div className="container mx-auto px-4 py-20">
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
<motion.div
initial={{ opacity: 0, x: -50 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.8 }}
className="space-y-6"
>
<h1 className="text-4xl md:text-6xl font-bold text-holographic-white leading-tight">
Secure Event Ticketing with <span className="text-tech-blue">Dynamic QR</span> Technology
</h1>
<Tagline>No Scams, Just Scans</Tagline>
<p className="text-holographic-white/80 text-lg">
Scantyx uses blockchain technology to create tamper-proof tickets with dynamic QR codes, 
eliminating fraud and making event attendance seamless.
</p>
<div className="flex flex-wrap gap-4">
{isAuthenticated ? (
<Button 
to="/user/create-event" 
className="btn btn-primary"
onClick={handleCreateEvent}
aria-label="Create a new event"
>
Host an Event
</Button>
) : (
<Button 
as="button"
onClick={(e) => {
e.preventDefault();
console.log('Get Started clicked');
openAuthModal('signup');
}} 
className="btn btn-primary"
aria-label="Sign up to get started"
>
Get Started
</Button>
)}
<Button 
to="/explore"
className="btn btn-outline"
aria-label="Explore all events"
>
Explore Events
</Button>
</div>
</motion.div>
<motion.div
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ duration: 0.8, delay: 0.2 }}
className="flex justify-center"
>
<Card className="relative w-full max-w-md p-6">
<div className="absolute -inset-0.5 bg-deep-purple rounded-2xl blur-lg opacity-75 animate-pulse-slow"></div>
<div className="relative bg-space-black border-2 border-deep-purple rounded-2xl p-6 shadow-xl">
<div className="flex justify-between items-center mb-6">
<div>
<h3 className="text-xl font-bold text-holographic-white">TechFest 2025</h3>
<p className="text-tech-blue">Bangalore, India</p>
</div>
<div className="bg-deep-purple text-holographic-white px-3 py-1 rounded-lg">
₹1,499
</div>
</div>
<div className="flex justify-center mb-6">
<QrCode className="h-48 w-48 text-deep-purple" />
</div>
<div className="mt-12 space-y-4">
<div className="flex items-center space-x-4 group cursor-pointer hover:bg-gray-800/50 p-3 rounded-lg transition-colors">
<div className="p-3 rounded-full bg-deep-purple/10 text-deep-purple group-hover:bg-deep-purple/20 transition-colors">
<Shield className="w-6 h-6" />
</div>
<p className="text-holographic-white/80 group-hover:text-white transition-colors">
Secure & Verifiable Tickets
</p>
</div>
<div className="flex items-center space-x-4 group cursor-pointer hover:bg-gray-800/50 p-3 rounded-lg transition-colors">
<div className="p-3 rounded-full bg-tech-blue/10 text-tech-blue group-hover:bg-tech-blue/20 transition-colors">
<QrCode className="w-6 h-6" />
</div>
<p className="text-holographic-white/80 group-hover:text-white transition-colors">
Dynamic QR Technology
</p>
</div>
<div 
className="flex items-center space-x-4 group cursor-pointer hover:bg-gray-800/50 p-3 rounded-lg transition-colors"
onClick={() => window.scrollTo({ top: document.getElementById('how-it-works').offsetTop - 100, behavior: 'smooth' })}
>
<div className="p-3 rounded-full bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
            >
              <Play size={18} />
              Watch Video
            </PrimaryButton>
            <SecondaryButton
              as={motion.button}
              whileHover={{ x: 5 }}
              onClick={handleExploreEvents}
              aria-label="Explore available events"
            >
              Explore Events
              <ArrowRight size={18} />
            </SecondaryButton>
          </CtaButtons>
          <ScrollIndicator
            aria-label="Scroll down to view more content"
          >
            <span>Scroll Down</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ArrowDown size={24} />
            </motion.div>
          </ScrollIndicator>
        </HeroContent>
        </HeroOverlay>
      </HeroContainer>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection onExploreEvents={handleExploreEvents} />
      <Section id="featured-events" bg="#1a1a2e">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-holographic-white leading-tight">
                Secure Event Ticketing with <span className="text-tech-blue">Dynamic QR</span> Technology
              </h1>
              <Tagline>No Scams, Just Scans</Tagline>
              <p className="text-holographic-white/80 text-lg">
                Scantyx uses blockchain technology to create tamper-proof tickets with dynamic QR codes, 
                eliminating fraud and making event attendance seamless.
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <Button 
                    to="/user/create-event" 
                    className="btn btn-primary"
                    onClick={handleCreateEvent}
                    aria-label="Create a new event"
                  >
                    Host an Event
                  </Button>
                ) : (
                  <Button 
                    as="button"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Get Started clicked');
                      openAuthModal('signup');
                    }} 
                    className="btn btn-primary"
                    aria-label="Sign up to get started"
                  >
                    Get Started
                  </Button>
                )}
                <Button 
                  to="/explore"
                  className="btn btn-outline"
                  aria-label="Explore all events"
                >
                  Explore Events
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center"
            >
              <Card className="relative w-full max-w-md p-6">
                <div className="absolute -inset-0.5 bg-deep-purple rounded-2xl blur-lg opacity-75 animate-pulse-slow"></div>
                <div className="relative bg-space-black border-2 border-deep-purple rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-holographic-white">TechFest 2025</h3>
                      <p className="text-tech-blue">Bangalore, India</p>
                    </div>
                    <div className="bg-deep-purple text-holographic-white px-3 py-1 rounded-lg">
                      ₹1,499
                    </div>
                  </div>
                  <div className="flex justify-center mb-6">
                    <QrCode className="h-48 w-48 text-deep-purple" />
                  </div>
                  <div className="mt-12 space-y-4">
                    <div className="flex items-center space-x-4 group cursor-pointer hover:bg-gray-800/50 p-3 rounded-lg transition-colors">
                      <div className="p-3 rounded-full bg-deep-purple/10 text-deep-purple group-hover:bg-deep-purple/20 transition-colors">
                        <Shield className="w-6 h-6" />
                      </div>
                      <p className="text-holographic-white/80 group-hover:text-white transition-colors">
                        Secure & Verifiable Tickets
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 group cursor-pointer hover:bg-gray-800/50 p-3 rounded-lg transition-colors">
                      <div className="p-3 rounded-full bg-tech-blue/10 text-tech-blue group-hover:bg-tech-blue/20 transition-colors">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <p className="text-holographic-white/80 group-hover:text-white transition-colors">
                        Dynamic QR Technology
                      </p>
                    </div>
                    <div 
                      className="flex items-center space-x-4 group cursor-pointer hover:bg-gray-800/50 p-3 rounded-lg transition-colors"
                      onClick={() => window.scrollTo({ top: document.getElementById('how-it-works').offsetTop - 100, behavior: 'smooth' })}
                    >
                      <div className="p-3 rounded-full bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </div>
                      <p className="text-holographic-white/80 group-hover:text-white transition-colors">
                        How It Works
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-holographic-white/70">Date:</span>
                      <span className="text-holographic-white">March 15, 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-holographic-white/70">Ticket ID:</span>
                      <span className="text-holographic-white">#SCX25789</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-holographic-white/70">Status:</span>
                      <span className="text-validation-green">Valid</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </Section>
      <Section id="how-it-works" bg="#1a1a2e">
        <FeaturesSection />
      </Section>
      <Section bg="#1a1a2e">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <SectionTitle>Featured Events</SectionTitle>
            <Link to="/explore" className="flex items-center text-tech-blue hover:text-deep-purple transition-colors">
              View All <ChevronRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventsLoading ? (
              <p>Loading events...</p>
            ) : eventsError ? (
              <p>Error loading events: {eventsError}</p>
            ) : featuredEvents.length > 0 ? (
              featuredEvents.map((event, index) => {
                const uniqueKey = event?.id ? `event-${event.id}` : `event-${index}`;
                return (
                  <EventCard key={uniqueKey} event={event} />
                );
              })
            ) : (
              <p>No featured events available.</p>
            )}
          </div>
        </div>
      </Section>
      <Section bg="#1a1a2e">
        <TestimonialsSection />
      </Section>
      {resellableTickets.length > 0 && (
        <Section bg="#1a1a2e">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <SectionTitle>Your Tickets</SectionTitle>
              <Tagline>Resell tickets you can't use</Tagline>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {ticketsLoading ? (
                <p>Loading tickets...</p>
              ) : ticketsError ? (
                <p>{ticketsError}</p>
              ) : resellableTickets.slice(0, 2).map(ticket => (
                <QRTicket key={ticket.id} ticket={ticket} onResell={handleResellClick} showResellOption={true} />
              ))}
            </div>
            {resellableTickets.length > 2 && (
              <div className="text-center mt-8">
                <Link 
                  to="/my-tickets" 
                  className="flex items-center text-tech-blue hover:text-deep-purple transition-colors"
                >
                  View All Tickets <ChevronRight className="h-5 w-5 ml-1" />
                </Link>
              </div>
            )}
          </div>
        </Section>
      )}
      <Section bg="rgba(124, 58, 237, 0.1)">
        <div className="container mx-auto px-4 text-center">
          <SectionTitle>Ready to Experience Secure Ticketing?</SectionTitle>
          <Tagline>No Scams, Just Scans</Tagline>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button to="/explore" className="btn btn-secondary">
              Browse Events
            </Button>
          </div>
        </div>
      </Section>
      <AnimatePresence>
        {showResellModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-black bg-opacity-80"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-space-black border border-deep-purple rounded-xl p-6 shadow-2xl"
            >
              <button
                onClick={() => setShowResellModal(false)}
                className="absolute top-4 right-4 text-holographic-white hover:text-tech-blue transition-colors"
                aria-label="Close resell modal"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-holographic-white">
                  Resell Your Ticket
                </h2>
                <p className="text-holographic-white/70 mt-2">
                  Set a fair price (max 150% of original price)
                </p>
              </div>
              {resaleMessage.text && (
                <div className={`mb-4 p-3 rounded-lg ${
                  resaleMessage.type === 'error' 
                    ? 'bg-red-500/20 border border-red-500' 
                    : 'bg-green-500/20 border border-green-500'
                }`}>
                  <p className="text-holographic-white">{resaleMessage.text}</p>
                </div>
              )}
              <form onSubmit={handleResellSubmit} className="space-y-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-holographic-white mb-1">
                    Resale Price (₹)
                  </label>
                  <Input
                    type="number"
                    id="price"
                    value={resalePrice}
                    onChange={(e) => setResalePrice(e.target.value)}
                    required
                    min="1"
                    placeholder="Enter price in INR"
                  />
                </div>
                <Button
                  as="button"
                  type="submit"
                  className="btn btn-primary w-full"
                  aria-label="Submit ticket for resale"
                >
                  List Ticket for Resale
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;