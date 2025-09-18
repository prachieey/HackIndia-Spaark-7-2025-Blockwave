import { toast } from 'react-hot-toast';

/**
 * Handles API errors consistently across the application
 * @param {Error} error - The error object
 * @param {string} [defaultMessage='An error occurred'] - Default error message
 * @returns {string} The error message to display
 */
export const getErrorMessage = (error, defaultMessage = 'An error occurred') => {
  if (!error) return defaultMessage;
  
  // Handle Axios error response
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { data, status } = error.response;
    
    if (data && data.message) {
      return data.message;
    }
    
    if (status === 401) {
      return 'You are not authorized to perform this action. Please log in.';
    }
    
    if (status === 403) {
      return 'You do not have permission to perform this action.';
    }
    
    if (status === 404) {
      return 'The requested resource was not found.';
    }
    
    if (status >= 500) {
      return 'A server error occurred. Please try again later.';
    }
  }
  
  // Handle network errors
  if (error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  // Handle request timeout
  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.';
  }
  
  // Handle other error messages
  if (error.message) {
    return error.message;
  }
  
  return defaultMessage;
};

/**
 * Shows an error toast notification
 * @param {string} message - The error message to display
 */
export const showErrorToast = (message) => {
  toast.error(message, {
    duration: 5000,
    position: 'top-center',
  });
};

/**
 * Shows a success toast notification
 * @param {string} message - The success message to display
 */
export const showSuccessToast = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-center',
  });
};

/**
 * Handles API errors and shows a toast notification
 * @param {Error} error - The error object
 * @param {string} [defaultMessage='An error occurred'] - Default error message
 * @returns {string} The error message that was displayed
 */
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  const errorMessage = getErrorMessage(error, defaultMessage);
  showErrorToast(errorMessage);
  return errorMessage;
};

/**
 * Creates a function that handles API errors with a specific default message
 * @param {string} defaultMessage - Default error message
 * @returns {Function} A function that handles errors with the specified default message
 */
export const createErrorHandler = (defaultMessage) => {
  return (error) => {
    return handleApiError(error, defaultMessage);
  };
};
