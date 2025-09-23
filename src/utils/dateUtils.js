import { format, parseISO, isValid, formatDistanceToNow } from 'date-fns';
import { enIN } from 'date-fns/locale';

/**
 * Safely format a date string using date-fns with fallback
 * @param {string|Date} date - Date string or Date object
 * @param {string} formatStr - Format string (default: 'PPP' - e.g. "April 29th, 2021")
 * @returns {string} Formatted date string or error message
 */
export const formatDate = (date, formatStr = 'PPP') => {
  if (!date) return 'Date not specified';
  
  let dateObj = date;
  
  // If it's a string, try to parse it
  if (typeof date === 'string') {
    // First try ISO format
    dateObj = parseISO(date);
    
    // If that fails, try the Date constructor
    if (!isValid(dateObj)) {
      dateObj = new Date(date);
    }
  }
  
  // If we still don't have a valid date, return an error message
  if (!isValid(dateObj)) {
    console.warn('Invalid date provided:', date);
    return 'Invalid date';
  }
  
  try {
    return format(dateObj, formatStr, { locale: enIN });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date format';
  }
};

/**
 * Format a date string into a human-readable format (legacy function)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatEventDate = (dateString) => {
  return formatDate(dateString, 'MMMM d, yyyy h:mm a');
};

/**
 * Format a date string into a time-only format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted time string
 */
export const formatEventTime = (dateString) => {
  if (!dateString) return 'Time not specified';
  
  try {
    const options = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateString).toLocaleTimeString('en-US', options);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
};

/**
 * Format a date range (start and end dates)
 * @param {string} startDate - ISO start date string
 * @param {string} endDate - ISO end date string
 * @returns {string} Formatted date range string
 */
export const formatEventDateRange = (startDate, endDate) => {
  if (!startDate) return 'Date not specified';
  
  try {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    const options = { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    
    const startStr = start.toLocaleDateString('en-US', options);
    
    if (!end || start.toDateString() === end.toDateString()) {
      // Same day event
      const timeOptions = { hour: '2-digit', minute: '2-digit' };
      const startTime = start.toLocaleTimeString('en-US', timeOptions);
      const endTime = end ? end.toLocaleTimeString('en-US', timeOptions) : null;
      
      return endTime 
        ? `${startStr} • ${startTime} - ${endTime}`
        : `${startStr} • ${startTime}`;
    } else {
      // Multi-day event
      const endStr = end.toLocaleDateString('en-US', options);
      return `${startStr} - ${endStr}`;
    }
  } catch (error) {
    console.error('Error formatting date range:', error);
    return 'Invalid date range';
  }
};
