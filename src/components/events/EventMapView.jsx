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

// Component to handle map events and markers
const MapContent = ({ events, selectedEvent, onEventSelect, onMapClick }) => {
  const map = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const markersRef = useRef({});
  const popupRef = useRef();

  // Fit map to markers bounds when events change
  useEffect(() => {
    if (events.length > 0) {
      const bounds = L.latLngBounds(
        events
          .filter(event => event.location?.coordinates)
          .map(event => [
            event.location.coordinates[1], // lat
            event.location.coordinates[0]  // lng
          ])
      );
      
      if (!bounds.isValid()) return;
      
      // Add padding to the bounds
      map.fitBounds(bounds.pad(0.1));
    }
  }, [events, map]);

  // Handle marker click
  const handleMarkerClick = useCallback((e, eventData) => {
    onEventSelect(eventData);
    
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
  }, [onEventSelect]);

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
      {events.map((event) => {
        if (!event.location?.coordinates) return null;
        
        const position = [
          event.location.coordinates[1], // latitude
          event.location.coordinates[0], // longitude
        ];
        
        const isSelected = selectedEvent?._id === event._id;
        
        return (
          <Marker
            key={event._id}
            position={position}
            icon={createMarkerIcon()}
            eventHandlers={{
              click: (e) => handleMarkerClick(e, event),
            }}
            ref={(ref) => {
              if (ref) {
                markersRef.current[event._id] = ref;
              } else {
                delete markersRef.current[event._id];
              }
            }}
          >
            <Popup
              ref={isSelected ? popupRef : null}
              className="event-popup"
              closeButton={false}
              autoClose={false}
              closeOnEscapeKey={false}
              closeOnClick={false}
            >
              <div className="w-48">
                <h3 className="font-medium text-gray-900 text-sm truncate">{event.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {event.date && new Date(event.date).toLocaleDateString()}
                </p>
                <button
                  onClick={() => onEventSelect(event)}
                  className="mt-2 w-full text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
      
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
