import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { WS_BASE_URL } from '../config';

// Helper function to build WebSocket URL
const buildWebSocketUrl = (baseUrl, endpoint) => {
  if (!endpoint) return null;
  
  try {
    // If endpoint is already a full URL, return it
    if (endpoint.startsWith('ws://') || endpoint.startsWith('wss://')) {
      return endpoint;
    }
    
    // If endpoint starts with http/https, convert to ws/wss
    if (endpoint.startsWith('http://')) {
      return 'ws' + endpoint.substring(4);
    }
    if (endpoint.startsWith('https://')) {
      return 'wss' + endpoint.substring(5);
    }
    
    // Handle relative URLs
    if (endpoint.startsWith('/')) {
      // If it's a relative URL, use window.location to construct the full URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}${endpoint}`;
    }
    
    // For relative URLs without leading slash
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${baseUrl ? `/${baseUrl}` : ''}/${endpoint}`;
  } catch (error) {
    console.error('Error building WebSocket URL:', error);
    return null;
  }
};

const useWebSocket = (endpoint = '', onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds
  
  // Build the full WebSocket URL using useMemo to prevent unnecessary recalculations
  const fullUrl = useMemo(() => {
    if (!endpoint) return null;
    const url = buildWebSocketUrl(WS_BASE_URL, endpoint);
    console.log('useWebSocket: Built URL:', url);
    return url;
  }, [endpoint]);
  
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messageHandlerRef = useRef(onMessage);

  // Update the message handler if it changes
  useEffect(() => {
    messageHandlerRef.current = onMessage;
  }, [onMessage]);

  // Function to send messages
  const sendMessage = useCallback((message) => {
    if (!ws.current) {
      console.warn('WebSocket is not initialized');
      return false;
    }
    
    if (ws.current.readyState === WebSocket.OPEN) {
      try {
        const messageString = JSON.stringify(message);
        console.log('Sending WebSocket message:', messageString);
        ws.current.send(messageString);
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('WebSocket is not connected. Current state:', ws.current.readyState);
      return false;
    }
  }, []);

  // Schedule a reconnection attempt
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.warn(`Max reconnection attempts (${maxReconnectAttempts}) reached`);
      return;
    }

    const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts), 30000); // Cap at 30s
    console.log(`Scheduling reconnection attempt ${reconnectAttempts + 1} in ${delay}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      setReconnectAttempts(prev => prev + 1);
      connect();
    }, delay);
  }, [reconnectAttempts, maxReconnectAttempts, reconnectDelay]);

  // Connect to the WebSocket
  const connect = useCallback(() => {
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection if it exists
    if (ws.current) {
      console.log('useWebSocket: Closing existing WebSocket connection');
      try {
        ws.current.onclose = null; // Remove the close handler to prevent reconnection
        ws.current.close();
      } catch (error) {
        console.error('Error closing existing WebSocket:', error);
      } finally {
        ws.current = null;
      }
    }

    if (!fullUrl) {
      console.error('useWebSocket: Cannot connect - no URL provided');
      return;
    }

    console.log(`useWebSocket: Attempting to connect to ${fullUrl}`);
    
    try {
      ws.current = new WebSocket(fullUrl);
      console.log('useWebSocket: WebSocket instance created');
    } catch (error) {
      console.error('useWebSocket: Error creating WebSocket:', error);
      scheduleReconnect();
      return;
    }

    // Connection opened
    ws.current.onopen = () => {
      console.log('WebSocket connected to:', fullUrl);
      setIsConnected(true);
      setReconnectAttempts(0); // Reset reconnect attempts on successful connection
    };

    // Listen for messages
    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        if (messageHandlerRef.current) {
          messageHandlerRef.current(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Handle errors
    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Schedule a reconnection attempt
    const scheduleReconnect = () => {
      if (reconnectAttempts < maxReconnectAttempts) {
        const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff with max 30s
        console.log(`Attempting to reconnect in ${delay/1000} seconds... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connect();
        }, delay);
      }
    };

    // Handle connection close
    ws.current.onclose = (event) => {
      console.log('WebSocket disconnected', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      
      setIsConnected(false);
      
      // Attempt to reconnect if not a normal closure and under max attempts
      if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
        scheduleReconnect();
      }
    };

    // Clean up on unmount
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [fullUrl, onMessage, reconnectAttempts]);

  // Initialize connection only if URL is provided
  useEffect(() => {
    console.log('useWebSocket: Initializing with URL:', fullUrl);
    
    if (!fullUrl) {
      console.warn('WebSocket URL is not provided');
      return;
    }
    
    connect();
    
    // Cleanup on unmount or URL change
    return () => {
      console.log('useWebSocket: Cleaning up WebSocket connection');
      
      // Clear any pending reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (ws.current) {
        try {
          // Remove all event listeners to prevent memory leaks
          ws.current.onopen = null;
          ws.current.onclose = null;
          ws.current.onerror = null;
          ws.current.onmessage = null;
          
          // Close the connection
          ws.current.close();
        } catch (error) {
          console.error('Error closing WebSocket:', error);
        } finally {
          ws.current = null;
        }
      }
    };
  }, [connect, fullUrl]);

  return { 
    sendMessage, 
    isConnected,
    reconnect: () => {
      setReconnectAttempts(0);
      connect();
    }
  };
};

export default useWebSocket;
