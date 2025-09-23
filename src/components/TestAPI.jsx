import React, { useEffect, useState } from 'react';
import apiRequest from '../utils/api';

const TestAPI = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/events`;
        setApiUrl(url);
        console.log('Fetching events from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'omit',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        setEvents(Array.isArray(data) ? data : (data.events || []));
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading events from {apiUrl}...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <h3 className="font-bold">Error fetching events:</h3>
        <p>URL: {apiUrl}</p>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Events from {apiUrl}</h2>
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(event => (
            <div key={event._id} className="border p-4 rounded-lg shadow">
              <h3 className="font-bold">{event.name}</h3>
              <p>{event.description}</p>
              <p className="text-sm text-gray-600">Date: {new Date(event.date).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
          <p>No events found. The API returned an empty array.</p>
          <p className="mt-2 text-sm">Check if your backend server is running and the API endpoint is correct.</p>
        </div>
      )}
    </div>
  );
};

export default TestAPI;
