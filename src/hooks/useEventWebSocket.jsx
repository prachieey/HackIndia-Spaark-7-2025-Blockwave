import { useState, useEffect, useCallback } from 'react';

// Custom hook for WebSocket with fallback to polling
export const useEventWebSocket = (eventId) => {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 3;
  const [shouldReconnect, setShouldReconnect] = useState(true);
  const [lastMessage, setLastMessage] = useState(null);

  const connect = useCallback(() => {
    if (!eventId) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/v1/events/${eventId}/reviews/ws`;
      
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
        setError(null);
        setReconnectAttempts(0);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setError('Failed to connect to live updates');
        setIsConnected(false);
      };

      socket.onclose = (event) => {
        console.log('WebSocket Disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`Reconnecting in ${timeout}ms... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          
          setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, timeout);
        }
      };

      setWs(socket);

      return () => {
        if (socket) {
          socket.close();
        }
      };
    } catch (err) {
      console.error('WebSocket setup error:', err);
      setError('Failed to initialize WebSocket connection');
      setIsConnected(false);
    }
  }, [eventId, shouldReconnect, reconnectAttempts]);

  useEffect(() => {
    if (eventId) {
      connect();
    }

    return () => {
      setShouldReconnect(false);
      if (ws) {
        ws.close();
      }
    };
  }, [eventId, connect]);

  return { 
    isConnected, 
    error, 
    lastMessage,
    reconnectAttempts,
    maxReconnectAttempts
  };
};

// Polling fallback hook
export const usePolling = (url, interval = 10000, enabled = true) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Polling error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    if (!enabled) return;
    
    // Initial fetch
    fetchData();
    
    // Set up polling
    const intervalId = setInterval(fetchData, interval);
    
    return () => clearInterval(intervalId);
  }, [fetchData, interval, enabled]);

  return { data, error, isLoading };
};

// Connection status component
export const ConnectionStatus = ({ isConnected, error, className = '' }) => (
  <div className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg z-50 ${
    isConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  } ${className}`}>
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
      <span className="text-sm font-medium">
        {isConnected ? 'Live updates connected' : 'Using fallback updates'}
      </span>
    </div>
    {error && (
      <p className="text-xs mt-1">{error}</p>
    )}
  </div>
);
