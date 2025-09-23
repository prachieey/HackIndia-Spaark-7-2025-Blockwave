import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocation as useLocationContext, POPULAR_CITIES } from '../../contexts/LocationContext';
import { FiMapPin, FiChevronDown, FiX, FiSearch, FiNavigation } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import './LocationSelector.css';

const LocationSelector = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const { updateLocation } = useLocationContext();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);

  // Filter cities based on search query
  const filteredCities = searchQuery
    ? POPULAR_CITIES.filter(city =>
        city.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : [...POPULAR_CITIES]; // Return all cities if no search query

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle city selection
  const handleCitySelect = useCallback((city) => {
    console.log('City selected:', city);
    if (!city) {
      console.error('No city provided to handleCitySelect');
      toast.error('Please select a valid city');
      return;
    }
    
    try {
      // Update the location in the context
      updateLocation(city);
      
      // Call the onSelect callback if provided
      if (typeof onSelect === 'function') {
        onSelect(city);
      }
      
      // Close the modal
      onClose();
      
      // If user was redirected to login, take them back to their original destination
      const from = location.state?.from?.pathname || '/';
      if (from !== '/') {
        console.log('Redirecting to original destination:', from);
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Error handling city selection:', error);
      toast.error('Failed to update location. Please try again.');
    }
  }, [updateLocation, onSelect, onClose, location.state, navigate]);

  // Mock function - replace with actual geocoding service
  const getCityFromCoords = useCallback(async (lat, lng) => {
    console.log('Getting city for coordinates:', { lat, lng });
    
    // In a real app, you would call a geocoding API here
    // For demo purposes, return a mock city based on coordinates
    const mockCities = {
      '19.08,72.88': 'Mumbai',
      '28.61,77.21': 'Delhi',
      '12.97,77.59': 'Bangalore',
      '17.39,78.49': 'Hyderabad',
      '13.08,80.27': 'Chennai'
    };
    
    // Round coordinates to 2 decimal places for matching
    const roundedLat = lat.toFixed(2);
    const roundedLng = lng.toFixed(2);
    const key = `${roundedLat},${roundedLng}`;
    
    // Return a mock city or default to Mumbai
    return mockCities[key] || 'Mumbai';
  }, []);

  // Handle location detection
  const detectLocation = useCallback(async () => {
    console.log('Attempting to detect location...');
    setIsDetecting(true);
    
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      toast.error('Geolocation is not supported by your browser');
      setIsDetecting(false);
      return;
    }

    const geolocationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, geolocationOptions);
      });

      console.log('Got geolocation position:', position);
      const { latitude, longitude } = position.coords;
      
      // Get city from coordinates
      const city = await getCityFromCoords(latitude, longitude);
      
      if (city) {
        console.log('Detected city:', city);
        handleCitySelect(city);
      } else {
        throw new Error('Could not determine city from coordinates');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      let errorMessage = 'Could not detect your location. Please select a city manually.';
      
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Location access was denied. Please enable location services or select a city manually.';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = 'Location information is unavailable. Please select a city manually.';
      } else if (error.code === error.TIMEOUT) {
        errorMessage = 'The request to get your location timed out. Please try again or select a city manually.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsDetecting(false);
    }
  }, [getCityFromCoords, handleCitySelect]);


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="location-selector-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="location-selector"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="location-header">
            <h3>Select Your City</h3>
            <button className="close-btn" onClick={onClose}>
              <FiX size={24} />
            </button>
          </div>
          
          <div className="search-container">
            <div className="search-input">
              <FiSearch className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for your city"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchQuery('')}
                >
                  <FiX />
                </button>
              )}
            </div>
            
            <button 
              className="detect-location"
              onClick={detectLocation}
              disabled={isDetecting}
            >
              <FiMapPin className="location-icon" />
              {isDetecting ? 'Detecting...' : 'Detect My Location'}
            </button>
          </div>
          
          <div className="popular-cities">
            <h4>Popular Cities</h4>
            <div className="city-grid">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  className="city-button"
                  onClick={() => handleCitySelect(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
          
          {searchQuery && filteredCities.length === 0 && (
            <div className="no-results">
              <p>No cities found for "{searchQuery}"</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LocationSelector;
