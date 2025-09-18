import { useState, useCallback } from 'react';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';

const useApiErrorHandler = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiCall = useCallback(async (apiCall, successMessage = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (successMessage) {
        showSuccessToast(successMessage);
      }
      
      return response;
    } catch (err) {
      // Handle the error using our utility
      const errorMessage = handleApiError(err, 'An unexpected error occurred');
      setError(errorMessage);
      
      // Re-throw the error so the calling component can handle it if needed
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { handleApiCall, isLoading, error, clearError };
};

export default useApiErrorHandler;
