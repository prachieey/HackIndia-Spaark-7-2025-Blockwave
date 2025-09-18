import { useCallback } from 'react';
import { showError, showSuccess } from '../components/common/CustomToast';
import { handleApiError, createErrorHandler } from '../utils/errorHandler';

/**
 * Custom hook for handling errors in a consistent way
 * @returns {Object} Object containing error handling functions
 */
const useErrorHandler = () => {
  /**
   * Handles an error and shows a toast notification
   * @param {Error|any} error - The error to handle
   * @param {string} [defaultMessage='An error occurred'] - Default error message
   * @returns {string} The error message that was displayed
   */
  const handleError = useCallback((error, defaultMessage = 'An error occurred') => {
    return handleApiError(error, defaultMessage, showError);
  }, []);

  /**
   * Creates a function that handles errors with a specific default message
   * @param {string} defaultMessage - Default error message
   * @returns {Function} A function that handles errors with the specified default message
   */
  const createHandler = useCallback((defaultMessage) => {
    return createErrorHandler(defaultMessage, showError);
  }, []);

  /**
   * Handles a successful operation and shows a success toast
   * @param {string} message - Success message to display
   */
  const handleSuccess = useCallback((message) => {
    showSuccess(message);
  }, []);

  return {
    handleError,
    createHandler,
    handleSuccess,
    showError,
    showSuccess,
  };
};

export default useErrorHandler;
