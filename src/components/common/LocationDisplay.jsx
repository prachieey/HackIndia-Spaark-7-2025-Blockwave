import React, { useState } from 'react';
import { FiMapPin, FiChevronDown } from 'react-icons/fi';
import LocationSelector from './LocationSelector';

const LocationDisplay = () => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { selectedCity, updateLocation } = useLocationContext();

  // If no city is selected, don't show anything
  if (!selectedCity) return null;

  return (
    <>
      <div 
        className="location-display"
        onClick={() => setIsLocationModalOpen(true)}
      >
        <FiMapPin className="location-icon" />
        <span className="location-text">{selectedCity}</span>
        <FiChevronDown className="chevron-icon" />
      </div>

      <LocationSelector 
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelect={(city) => {
          updateLocation(city);
          setIsLocationModalOpen(false);
        }}
      />
    </>
  );
};

export default LocationDisplay;
