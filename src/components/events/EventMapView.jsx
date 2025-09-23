import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, X, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icon
const createMarkerIcon = () => {
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Function to get coordinates from event location
const getEventCoordinates = (event) => {
  // If location is a string (city name), we'll need to geocode it
  if (typeof event.location === 'string') {
    // Default to New Delhi coordinates as fallback
    return [28.6139, 77.2090];
  }
  
  // If location has coordinates array
  if (event.location?.coordinates) {
    return [event.location.coordinates[1], event.location.coordinates[0]];
  }
  
  // If location has lat/lng properties
  if (event.location?.lat && event.location?.lng) {
    return [event.location.lat, event.location.lng];
  }
  
  // Default to New Delhi if no location data
  return [28.6139, 77.2090];
};

// Format event date for display
const formatEventDate = (dateString) => {
  if (!dateString) return 'Date not specified';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

// Component to handle map events and markers
const MapContent = ({ events, selectedEvent, onEventSelect, onMapClick }) => {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const markersRef = useRef({});
  const popupRef = useRef();
  const [geocodedEvents, setGeocodedEvents] = useState([]);

  // Process events to ensure they have valid coordinates
  useEffect(() => {
    const processedEvents = events.map(event => ({
      ...event,
      coordinates: getEventCoordinates(event),
      // Ensure we have a valid location string
      locationString: typeof event.location === 'string' 
        ? event.location 
        : event.venue?.name || event.location?.name || 'Location not specified'
    }));
    setGeocodedEvents(processedEvents);
  }, [events]);

  // Fit map to markers bounds when events change
  useEffect(() => {
    if (geocodedEvents.length > 0) {
      const bounds = L.latLngBounds(
        geocodedEvents.map(event => event.coordinates)
      );
      
      if (!bounds.isValid()) return;
      
      // Add padding to the bounds
      map.fitBounds(bounds.pad(0.1));
    } else {
      // Default to India view if no events
      map.setView([20.5937, 78.9629], 5);
    }
  }, [geocodedEvents, map]);

  // Handle marker click
  const handleMarkerClick = useCallback((e, eventData) => {
    if (onEventSelect) {
      onEventSelect(eventData);
    }
    
    // Small delay to ensure popup is open before scrolling
    setTimeout(() => {
      const popupElement = popupRef.current?.getElement();
      if (popupElement) {
        popupElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }, 100);
    
    // Center the map on the marker
    const [lat, lng] = eventData.coordinates || [];
    if (lat && lng) {
      map.flyTo([lat, lng], 15, {
        duration: 1,
        easeLinearity: 0.25,
      });
    }
  }, [onEventSelect, map]);

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    const elem = map.getContainer();
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [map]);

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <>
      {geocodedEvents.map((event) => {
        const position = event.coordinates;
        const isSelected = selectedEvent?._id === event._id || selectedEvent?.id === event.id;
        const eventImage = event.bannerImage || event.image || 'https://via.placeholder.com/300x150?text=Event+Image';
        
        return (
          <Marker
            key={event.id || event._id}
            position={position}
            icon={createMarkerIcon()}
            eventHandlers={{
              click: (e) => handleMarkerClick(e, event),
            }}
            ref={(ref) => {
              if (ref) {
                const eventId = event.id || event._id;
                markersRef.current[eventId] = ref;
              }
            }}
          >
            <Popup
              ref={isSelected ? popupRef : null}
              className="event-popup"
              closeButton={true}
              autoClose={false}
              closeOnEscapeKey={true}
              closeOnClick={false}
              maxWidth={300}
              minWidth={250}
            >
              <div className="w-full max-w-[280px] bg-white rounded-lg overflow-hidden shadow-lg">
                {/* Event Image */}
                <div className="h-32 bg-gray-100 overflow-hidden">
                  <img 
                    src={eventImage} 
                    alt={event.title || 'Event'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x150?text=Event+Image';
                    }}
                  />
                </div>
                
                {/* Event Details */}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-2">
                    {event.title || event.name || 'Untitled Event'}
                  </h3>
                  
                  {event.date && (
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-500" />
                      <span>{formatEventDate(event.date)}</span>
                    </div>
                  )}
                  
                  {event.locationString && (
                    <div className="flex items-start text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0 text-gray-500" />
                      <span className="line-clamp-2">{event.locationString}</span>
                    </div>
                  )}
                  
                  {event.price > 0 ? (
                    <div className="text-sm font-medium text-green-600 mb-2">
                      ₹{parseFloat(event.price).toFixed(2)}
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-green-600 mb-2">Free</div>
                  )}
                  
                  <button
                    onClick={() => onEventSelect && onEventSelect(event)}
                    className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-md text-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
      
      {/* Fullscreen Toggle Button */}
      <div className="leaflet-top leaflet-right">
        <div className="leaflet-control">
          <button
            onClick={toggleFullscreen}
            className="bg-white p-2 shadow-md rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4 text-gray-700" />
            ) : (
              <Maximize2 className="h-4 w-4 text-gray-700" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

// Main component
const EventMapView = ({ 
  events = [], 
  selectedEvent, 
  onEventSelect, 
  onClose,
  className = '' 
}) => {
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  
  // Default center (can be set to user's location or a default location)
  const defaultCenter = [20.5937, 78.9629]; // Center of India
  const defaultZoom = 5;
  
  // Get bounds for all events with locations
  const getMapBounds = useCallback(() => {
    const locations = events
      .filter(event => event.location?.coordinates)
      .map(event => [
        event.location.coordinates[1], // lat
        event.location.coordinates[0], // lng
      ]);
    
    if (locations.length === 0) return null;
    
    return L.latLngBounds(locations);
  }, [events]);
  
  // Fit map to bounds when events change
  useEffect(() => {
    if (mapRef.current && mapReady) {
      const bounds = getMapBounds();
      if (bounds) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [events, mapReady, getMapBounds]);
  
  // Handle map click
  const handleMapClick = () => {
    // You could add functionality when clicking on the map
  };
  
  return (
    <div className={`relative rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Close map"
        >
          <X className="h-4 w-4 text-gray-700" />
        </button>
      )}
      
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        whenCreated={(map) => {
          mapRef.current = map;
          setMapReady(true);
        }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {mapReady && (
          <MapContent
            events={events}
            selectedEvent={selectedEvent}
            onEventSelect={onEventSelect}
            onMapClick={handleMapClick}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default EventMapView;
