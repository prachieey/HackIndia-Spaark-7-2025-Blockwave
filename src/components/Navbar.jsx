import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  QrCode, 
  Menu, 
  X, 
  LogIn, 
  UserPlus, 
  User, 
  Shield, 
  LogOut, 
  ChevronDown, 
  Ticket,
  LayoutDashboard,
  Settings,
  Moon,
  Sun,
  MapPin,
  Search,
  Map
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/blockchain/Web3Context';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import WalletConnect from './wallet/WalletConnect';
import { cn } from '../lib/utils';

// NavLink component with active state
const NavLink = ({ to, children, className = '', ...props }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        'relative px-4 py-2 text-sm font-medium transition-colors duration-200',
        isActive 
          ? 'text-white' 
          : 'text-gray-300 hover:text-white',
        className
      )}
      {...props}
    >
      {children}
      {isActive && (
        <motion.span
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 w-full"
          layoutId="activeNavLink"
          initial={false}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />
      )}
    </Link>
  );
};

const Navbar = ({ openAuthModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { selectedCity, updateLocation } = useLocationContext();
  const isAdmin = user?.role === 'admin';
  const { isConnected } = useWeb3();
  const profileRef = useRef(null);
  const menuRef = useRef(null);

  // Toggle scroll effect and close dropdowns when clicking outside
  const handleClickOutside = useCallback((event) => {
    if (profileRef.current && !profileRef.current.contains(event.target) && !event.target.closest('.profile-menu-button')) {
      setIsProfileOpen(false);
    }
    if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-button')) {
      setIsMenuOpen(false);
    }
    // Only close location dropdown if clicking outside both the trigger and the dropdown itself
    if (isLocationOpen && 
        !event.target.closest('.location-selector-trigger') && 
        !event.target.closest('.location-dropdown') &&
        !event.target.closest('.location-search-input')) {
      setIsLocationOpen(false);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside, isMenuOpen, isProfileOpen]);

  // Navigation items
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Resell', path: '/events' },
    { name: 'About', path: '/tickets' },
  ];

  // Popular cities for location dropdown
  const popularCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
    'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara'
  ];
  
  // State for location search
  const [locationSearch, setLocationSearch] = useState('');
  
  // Filter cities based on search
  const filteredCities = React.useMemo(() => {
    if (!locationSearch.trim()) {
      return popularCities; // Return all cities when search is empty
    }
    return popularCities.filter(city =>
      city.toLowerCase().includes(locationSearch.trim().toLowerCase())
    ).sort((a, b) => {
      // Sort cities with exact matches first, then alphabetical
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const searchLower = locationSearch.trim().toLowerCase();
      
      if (aLower === searchLower) return -1;
      if (bLower === searchLower) return 1;
      if (aLower.startsWith(searchLower) && !bLower.startsWith(searchLower)) return -1;
      if (!aLower.startsWith(searchLower) && bLower.startsWith(searchLower)) return 1;
      return aLower.localeCompare(bLower);
    });
  }, [locationSearch]);
  
  // Handle location change
  const handleLocationChange = (city) => {
    if (city) {
      updateLocation(city);
      setIsLocationOpen(false);
      setLocationSearch(''); // Reset search
      toast.success(`Location set to ${city}`);
    }
  };
  
  // Handle search input key down
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && filteredCities.length > 0) {
      // Select the first city in the filtered list when pressing Enter
      handleLocationChange(filteredCities[0]);
    }
  };
  
  // Get city name from coordinates using OpenStreetMap Nominatim API
  const getCityFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();
      
      // Extract city/town/village name from the response
      const address = data.address;
      const city = address.city || address.town || address.village || address.county || '';
      
      if (!city) {
        throw new Error('Could not determine location name');
      }
      
      return city;
      
    } catch (error) {
      console.error('Error in getCityFromCoords:', error);
      // Fallback to a more generic approach if the API fails
      try {
        const response = await fetch(`https://geocode.xyz/${lat},${lng}?json=1`);
        if (response.ok) {
          const data = await response.json();
          return data.city || data.region || 'Unknown Location';
        }
      } catch (e) {
        console.error('Fallback geocoding failed:', e);
      }
      
      return null;
    }
  };

  // Handle current location detection
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    const locationToastId = 'locationToast';
    toast.loading('Detecting your location...', { id: locationToastId });

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000, // 10 seconds
            maximumAge: 0 // Force fresh location
          }
        );
      });

      const { latitude, longitude } = position.coords;
      toast.loading('Finding your city...', { id: toastId });
      
      // Get city name from coordinates
      const city = await getCityFromCoords(latitude, longitude);
      
      if (city) {
        handleLocationChange(city);
        toast.success(`Location set to ${city}`, { id: toastId });
      } else {
        toast.error('Could not determine your city. Please select it manually.', { id: toastId });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      let errorMessage = 'Could not get your location';
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access was denied. Please enable location services and try again.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable. Please check your internet connection.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.';
          break;
      }
      
      toast.error(errorMessage, { id: 'locationError' });
    }
    
    try {
      // First, check if we have a recent position in session storage
      const cachedLocation = sessionStorage.getItem('cachedLocation');
      const now = Date.now();
      
      if (cachedLocation) {
        const { city, timestamp } = JSON.parse(cachedLocation);
        // Use cached location if it's less than 5 minutes old
        if (now - timestamp < 5 * 60 * 1000) {
          handleLocationChange(city);
          toast.success(`Using your last known location: ${city}`, { id: toastId });
          return;
        }
      }
      
      // If no valid cache, get fresh location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,  // 10 seconds timeout
          maximumAge: 0    // Force fresh location
        });
      });
      
      toast.loading('Finding your city...', { id: toastId });
      
      // For demo purposes, we'll use a random city from our list
      // In a real app, you would use the actual coordinates
      const randomCity = popularCities[Math.floor(Math.random() * popularCities.length)];
      
      if (randomCity) {
        // Cache the location
        sessionStorage.setItem('cachedLocation', JSON.stringify({
          city: randomCity,
          timestamp: Date.now()
        }));
        
        handleLocationChange(randomCity);
        toast.success(`Location set to ${randomCity}`, { id: toastId });
      } else {
        throw new Error('Could not determine city from coordinates');
      }
      
    } catch (error) {
      console.error('Error detecting location:', error);
      let errorMessage = 'Could not detect your location';
      
      if (error.code === 1) { // PERMISSION_DENIED
        errorMessage = 'Location access was denied. Please enable location services in your browser settings.';
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        errorMessage = 'Location information is unavailable. Please check your connection and try again.';
      } else if (error.code === 3) { // TIMEOUT
        errorMessage = 'The request to get your location timed out. Please try again.';
      }
      
      toast.error(errorMessage, { id: toastId });
    }
  };

  // User menu items
  const userMenuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/user/dashboard',
    },
    {
      name: 'My Tickets',
      icon: Ticket,
      path: '/user/tickets',
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/user/settings',
    },
  ];

  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      console.log('[Navbar] Starting logout process...');
      
      // Close the profile dropdown
      setIsProfileOpen(false);
      setIsMenuOpen(false);
      
      // Call the logout function from AuthContext
      const result = await logout();
      
      if (result && result.success) {
        console.log('[Navbar] Logout successful, redirecting to home...');
        // Use window.location to force a full page reload and clear all states
        window.location.href = '/';
      } else {
        console.error('[Navbar] Logout failed:', result?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('[Navbar] Error during logout:', error);
      // Even if there was an error, we should still try to redirect
      window.location.href = '/';
    }
  };
  
  // Handle navigation to a specific route
  const navigateTo = useCallback((path) => {
    navigate(path);
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [navigate]);
  
  // Toggle mobile menu
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
    if (isProfileOpen) setIsProfileOpen(false);
  }, [isProfileOpen]);
  
  // Close mobile menu
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);
  
  // Connect wallet handler
  const handleConnectWallet = useCallback(async () => {
    try {
      // Import Web3Context to use its connectWallet function
      const { connectWallet } = await import('../contexts/blockchain/Web3Context');
      if (typeof connectWallet === 'function') {
        await connectWallet();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }, []);

  return (
    <>
      <motion.header
        className={cn(
          'fixed w-full z-50 transition-all duration-500',
          scrolled 
            ? 'bg-dark-900/95 shadow-2xl border-b border-dark-700/30 py-2' 
            : 'bg-gradient-to-b from-dark-900/95 to-transparent py-4',
          isMenuOpen ? 'bg-dark-900' : ''
        )}
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.6, 
          ease: [0.4, 0, 0.2, 1],
          opacity: { duration: 0.4 }
        }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center space-x-2 group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <motion.div
                  className="relative"
                  animate={{
                    rotate: isHovering ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: 'easeInOut',
                  }}
                >
                  <QrCode className="h-8 w-8 text-primary-500 transition-transform duration-300 group-hover:scale-110" />
                </motion.div>
                <motion.span 
                  className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Scantyx
                </motion.span>
                <motion.span 
                  className="ml-1 text-xs font-medium bg-gradient-to-r from-primary-400 to-primary-600 text-transparent bg-clip-text"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  PRO
                </motion.span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path}>
                  {item.name}
                </NavLink>
              ))}
              {/* Location Selector - Only show when user is logged in */}
              {user && (
                <div className="relative ml-4">
                  <button
                    onClick={() => {
                    setIsLocationOpen(!isLocationOpen);
                    if (!isLocationOpen) {
                      // Reset search when opening the dropdown
                      setLocationSearch('');
                    }
                  }}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 relative group location-selector-trigger"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 text-primary-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate max-w-[120px] font-medium">
                    {selectedCity || 'Select City'}
                  </span>
                  <ChevronDown 
                    className={`h-4 w-4 transition-transform duration-200 ${isLocationOpen ? 'transform rotate-180' : ''}`} 
                  />
                </button>
                
                {/* Location Dropdown */}
                <AnimatePresence>
                  {isLocationOpen && (
                    <motion.div 
                      className="absolute left-0 mt-2 w-72 bg-dark-800 rounded-lg shadow-xl border border-dark-700 overflow-hidden z-50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-3 border-b border-dark-700">
                        <div className="relative">
                            <div className="location-search-input" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={locationSearch}
                                onChange={(e) => {
                                  setLocationSearch(e.target.value);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && filteredCities.length > 0) {
                                    handleLocationChange(filteredCities[0]);
                                  } else if (e.key === 'Escape') {
                                    setIsLocationOpen(false);
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Search city..."
                                className="w-full bg-dark-900 text-white text-sm rounded-md px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                autoFocus
                                aria-label="Search for a city"
                                autoComplete="off"
                                spellCheck="false"
                              />
                            </div>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 text-gray-500 absolute left-3 top-2.5" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>
                      {/* City List */}
                      <div className="max-h-60 overflow-y-auto">
                        {filteredCities.length > 0 ? (
                          <div className="p-2">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                              {locationSearch ? `Found ${filteredCities.length} ${filteredCities.length === 1 ? 'city' : 'cities'}` : 'Popular Cities'}
                            </h4>
                            <div className="grid grid-cols-1 gap-1">
                              {filteredCities.map((city) => (
                                <button
                                  key={city}
                                  onClick={() => handleLocationChange(city)}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                                    selectedCity === city
                                      ? 'bg-primary-600 text-white'
                                      : 'text-gray-300 hover:bg-dark-700'
                                  }`}
                                >
                                  <div className="flex items-center">
                                    {selectedCity === city && (
                                      <svg 
                                        className="h-4 w-4 mr-2 text-white" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                    <span className={selectedCity === city ? 'font-medium' : ''}>
                                      {city}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 text-center text-gray-400 text-sm">
                            No cities found. Try a different search.
                          </div>
                        )}
                      </div>
                      
                      {/* Current Location Button */}
                      <div className="p-3 border-t border-dark-700 bg-dark-850">
                        <button
                          onClick={handleDetectLocation}
                          disabled={!navigator.geolocation}
                          className={`w-full flex items-center justify-center space-x-2 text-sm ${
                            navigator.geolocation 
                              ? 'text-primary-400 hover:text-primary-300' 
                              : 'text-gray-500 cursor-not-allowed'
                          } transition-colors duration-200 group`}
                          aria-label="Use my current location"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 group-hover:animate-pulse" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>Use my current location</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              )}
            </nav>

            {/* Auth & User Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle Removed */}

              {/* Wallet Connect */}
              {user && (
                <div className="hidden md:block">
                  <WalletConnect />
                </div>
              )}

              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      'flex items-center space-x-2 focus:outline-none group relative',
                      'p-1 rounded-full bg-gradient-to-br from-primary-900/30 to-primary-900/10',
                      'border border-dark-600/50 hover:border-primary-500/30 transition-all duration-300',
                      'shadow-lg hover:shadow-primary-500/20',
                      isProfileOpen ? 'ring-2 ring-primary-500/50' : ''
                    )}
                    aria-expanded={isProfileOpen}
                    aria-haspopup="true"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium text-lg shadow-inner border border-white/10">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-dark-900"></div>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{
                          type: 'spring',
                          damping: 25,
                          stiffness: 300,
                          bounce: 0.2,
                        }}
                        className="absolute right-0 mt-2 w-64 origin-top-right z-50"
                      >
                        <div className="rounded-xl bg-dark-800/95 backdrop-blur-xl shadow-2xl border border-dark-700/50 overflow-hidden">
                          {/* User Info */}
                          <div className="p-4 border-b border-dark-700/50 bg-gradient-to-r from-dark-800 to-dark-900">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xl font-semibold shadow-lg">
                                  {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-dark-900"></div>
                              </div>
                              <div>
                                <p className="font-medium text-white">{user?.name || 'User'}</p>
                                <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
                              </div>
                            </div>
                          </div>

                          {/* User Menu */}
                          <div className="p-2">
                            {userMenuItems.map((item, index) => (
                              <Link
                                key={index}
                                to={item.path}
                                className="flex items-center px-3 py-2.5 text-sm rounded-lg text-gray-300 hover:bg-dark-700/50 hover:text-white transition-colors group"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <item.icon className="w-4 h-4 mr-3 text-primary-400 group-hover:text-primary-300 transition-colors" />
                                {item.name}
                                <ChevronDown className="ml-auto w-4 h-4 text-gray-500 transform -rotate-90" />
                              </Link>
                            ))}

                            {isAdmin && (
                              <Link
                                to="/admin/dashboard"
                                className="flex items-center px-3 py-2.5 text-sm rounded-lg text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-colors group mt-1"
                                onClick={() => setIsProfileOpen(false)}
                              >
                                <Shield className="w-4 h-4 mr-3 text-amber-400 group-hover:text-amber-300 transition-colors" />
                                Admin Dashboard
                                <ChevronDown className="ml-auto w-4 h-4 text-amber-500 transform -rotate-90" />
                              </Link>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="p-3 border-t border-dark-700/50 bg-dark-900/30">
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              Sign out
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="px-4 py-2 text-sm font-medium text-gray-200 hover:text-white transition-colors hidden sm:inline-flex"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Sign up
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden ml-2">
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-expanded={isMenuOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  {isMenuOpen ? (
                    <X className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden fixed top-16 md:top-20 left-0 right-0 z-40"
            ref={menuRef}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-dark-800/95 backdrop-blur-lg border-t border-dark-700/50">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? 'text-white bg-dark-700/50'
                      : 'text-gray-300 hover:text-white hover:bg-dark-700/30'
                  }`}
                  onClick={() => {
                    closeMenu();
                    navigateTo(item.path);
                  }}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Location Selector */}
              {user && (
                <div className="mt-4 pt-4 border-t border-dark-700">
                  <div className="px-4 mb-3 text-sm font-medium text-gray-400">Your Location</div>
                  <div className="relative">
                    <div className="flex items-center justify-between px-4 py-3 bg-dark-800 rounded-md">
                      <div className="flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">{selectedCity || 'Select City'}</span>
                      </div>
                      <button 
                        onClick={() => setIsLocationOpen(!isLocationOpen)}
                        className="text-gray-400 hover:text-white"
                      >
                        <ChevronDown className={`h-5 w-5 transition-transform ${isLocationOpen ? 'transform rotate-180' : ''}`} />
                      </button>
                    </div>
                    
                    {/* Mobile Location Dropdown */}
                    {isLocationOpen && (
                      <div className="mt-2 bg-dark-800 rounded-lg overflow-hidden">
                        <div className="p-3 border-b border-dark-700">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search city..."
                              className="w-full bg-dark-900 text-white text-sm rounded-md px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          <div className="p-2">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Popular Cities</h4>
                            <div className="grid grid-cols-1 gap-1">
                              {popularCities.map((city) => (
                                <button
                                  key={city}
                                  onClick={() => {
                                    updateLocation(city);
                                    setIsLocationOpen(false);
                                  }}
                                  className={`text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                                    selectedCity === city
                                      ? 'bg-primary-600 text-white'
                                      : 'text-gray-300 hover:bg-dark-700'
                                  }`}
                                >
                                  {city}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="p-3 border-t border-dark-700 bg-dark-850">
                          <button
                            onClick={() => {
                              // Implement location detection logic here
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  // In a real app, you would reverse geocode these coordinates
                                  console.log('Detected location:', position);
                                  // For demo, just show a message
                                  toast.success('Location detected! Select your city from the list.');
                                },
                                (error) => {
                                  console.error('Error getting location:', error);
                                  toast.error('Could not detect your location. Please select manually.');
                                }
                              );
                            }}
                            className="w-full flex items-center justify-center space-x-2 text-sm text-primary-400 hover:text-primary-300 transition-colors duration-200 py-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Use my current location</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;