import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const LocationContext = createContext();

// List of popular Indian cities for the location selector
export const POPULAR_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara'
];

export const LocationProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(() => {
    // Try to get the city from localStorage, or default to empty string
    if (typeof window !== 'undefined') {
      const savedCity = localStorage.getItem('selectedCity');
      console.log('Initializing location context with city:', savedCity);
      return savedCity || '';
    }
    return '';
  });

  // Save to localStorage whenever selectedCity changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Saving location to localStorage:', selectedCity);
      if (selectedCity) {
        localStorage.setItem('selectedCity', selectedCity);
      } else {
        localStorage.removeItem('selectedCity');
      }
    }
  }, [selectedCity]);

  const updateLocation = (city) => {
    console.log('Updating location to:', city);
    if (city && typeof city === 'string') {
      setSelectedCity(city.trim());
      toast.success(`Location set to ${city}`);
    } else {
      console.error('Invalid city provided to updateLocation:', city);
    }
  };

  return (
    <LocationContext.Provider value={{ selectedCity, updateLocation, POPULAR_CITIES }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    console.error('useLocation must be used within a LocationProvider');
    // Return a mock implementation to prevent crashes
    return {
      selectedCity: '',
      updateLocation: () => {
        console.warn('updateLocation called outside of LocationProvider');
      },
      POPULAR_CITIES: []
    };
  }
  return context;
};
