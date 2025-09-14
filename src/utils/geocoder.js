const NodeGeocoder = require('node-geocoder');
const AppError = require('./appError');

// Initialize geocoder with environment variables
const geocoder = NodeGeocoder({
  provider: process.env.GEOCODER_PROVIDER || 'google',
  apiKey: process.env.GOOGLE_MAPS_API_KEY, // For Google Maps
  httpAdapter: 'https',
  formatter: null,
  language: 'en',
  region: 'in',
  // Add other provider-specific options here
});

/**
 * Geocode an address to get coordinates
 * @param {string} address - Address to geocode
 * @returns {Promise<Object>} - Geocoding result with coordinates and formatted address
 */
const geocodeAddress = async (address) => {
  try {
    const results = await geocoder.geocode(address);
    
    if (!results || results.length === 0) {
      throw new AppError('Could not find location with the specified address', 404);
    }

    const { latitude, longitude, formattedAddress, country, city, state, zipcode } = results[0];
    
    return {
      coordinates: [longitude, latitude], // GeoJSON uses [lng, lat] format
      formattedAddress,
      location: {
        address: formattedAddress,
        city,
        state,
        zipcode,
        country,
      },
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new AppError('Error processing location. Please try again.', 500);
  }
};

/**
 * Reverse geocode coordinates to get address information
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} - Address information
 */
const reverseGeocode = async (lat, lng) => {
  try {
    const results = await geocoder.reverse({ lat, lon: lng });
    
    if (!results || results.length === 0) {
      throw new AppError('Could not find address for the specified coordinates', 404);
    }

    const { formattedAddress, country, city, state, zipcode } = results[0];
    
    return {
      formattedAddress,
      location: {
        address: formattedAddress,
        city,
        state,
        zipcode,
        country,
      },
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw new AppError('Error processing location. Please try again.', 500);
  }
};

/**
 * Calculate distance between two points using Haversine formula
 * @param {Object} point1 - First point with lat and lng
 * @param {Object} point2 - Second point with lat and lng
 * @param {string} [unit='km'] - Unit of distance ('km' or 'mi')
 * @returns {number} - Distance between the points in the specified unit
 */
const calculateDistance = (point1, point2, unit = 'km') => {
  const { lat: lat1, lng: lon1 } = point1;
  const { lat: lat2, lng: lon2 } = point2;

  const R = unit === 'km' ? 6371 : 3956; // Earth's radius in km or miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

/**
 * Convert degrees to radians
 * @private
 */
const toRad = (value) => {
  return (value * Math.PI) / 180;
};

/**
 * Find events within a radius of a point
 * @param {Object} point - Center point with lat and lng
 * @param {number} radius - Radius in the specified unit
 * @param {string} [unit='km'] - Unit of radius ('km' or 'mi')
 * @returns {Object} - MongoDB geospatial query
 */
const findWithinRadius = (point, radius, unit = 'km') => {
  const { lat, lng } = point;
  const earthRadius = unit === 'km' ? 6378.1 : 3963.2; // Earth's radius in km or miles
  
  return {
    'venue.coordinates': {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius / earthRadius],
      },
    },
  };
};

/**
 * Get bounding box coordinates for a point and radius
 * @param {Object} point - Center point with lat and lng
 * @param {number} radius - Radius in kilometers
 * @returns {Object} - Bounding box coordinates
 */
const getBoundingBox = (point, radius) => {
  const R = 6371; // Earth's radius in km
  const { lat, lng } = point;
  
  // Convert latitude and longitude to radians
  const latR = toRad(lat);
  const lngR = toRad(lng);
  
  // Calculate the angular radius in radians
  const angularRadius = radius / R;
  
  // Calculate min and max latitudes
  const minLat = latR - angularRadius;
  const maxLat = latR + angularRadius;
  
  // Calculate min and max longitudes
  const deltaLng = Math.asin(Math.sin(angularRadius) / Math.cos(latR));
  const minLng = lngR - deltaLng;
  const maxLng = lngR + deltaLng;
  
  // Convert back to degrees
  return {
    minLat: (minLat * 180) / Math.PI,
    maxLat: (maxLat * 180) / Math.PI,
    minLng: (minLng * 180) / Math.PI,
    maxLng: (maxLng * 180) / Math.PI,
  };
};

module.exports = {
  geocoder,
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
  findWithinRadius,
  getBoundingBox,
};
