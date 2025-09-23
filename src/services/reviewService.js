import http from './httpService';
import { getCurrentUser } from './authService';
import { API_BASE_URL } from '../config';

const apiBase = '/api/v1';
const apiEndpoint = `${apiBase}/reviews`;

export const getEventReviews = async (eventId, params = {}) => {
  if (!eventId) {
    console.error('No eventId provided to getEventReviews');
    return [];
  }

  try {
    const response = await http.get(`${apiBase}/reviews/event/${eventId}`, { 
      params,
      validateStatus: status => status < 500 // Don't throw for 4xx errors
    });
    
    console.log('getEventReviews response:', { status: response.status, data: response.data });
    
    // Handle successful responses
    if (response.status === 200) {
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      }
      return [];
    }
    
    // If no reviews found (404), return empty array
    if (response.status === 404) {
      console.log(`No reviews found for event ${eventId}`);
      return [];
    }
    
    // For any other status codes, log and return empty array
    console.warn('Unexpected response when fetching reviews:', response.status, response.data);
    return [];
  } catch (error) {
    // Only log unexpected errors (not 404s which we handle above)
    if (!error.response || error.response.status !== 404) {
      console.error('Error fetching event reviews:', error);
    } else {
      console.log(`No reviews found for event ${eventId} (404)`);
    }
    return [];
  }
};

export const createReview = async (reviewData) => {
  const response = await http.post(apiEndpoint, reviewData);
  return response.data.data;
};

export const updateReview = async (reviewId, reviewData) => {
  const response = await http.patch(`${apiEndpoint}/${reviewId}`, reviewData);
  return response.data.data;
};

export const deleteReview = async (reviewId) => {
  const response = await http.delete(`${apiEndpoint}/${reviewId}`);
  return response.data.data;
};

export const getUserReviewForEvent = async (eventId) => {
  try {
    const user = getCurrentUser();
    if (!user) return null;
    
    const response = await http.get(`${apiEndpoint}/event/${eventId}/my-review`);
    return response.data.data;
  } catch (error) {
    // If 404, user hasn't reviewed this event yet
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const getEventReviewStats = async (eventId) => {
  if (!eventId) {
    console.error('No eventId provided to getEventReviewStats');
    return { 
      averageRating: 0, 
      totalReviews: 0, 
      ratingCounts: {},
      message: 'No reviews yet' 
    };
  }

  try {
    const response = await http.get(`${apiBase}/reviews/stats/event/${eventId}`, {
      validateStatus: status => status < 500 // Don't throw for 4xx errors
    });
    
    console.log('getEventReviewStats response:', { status: response.status, data: response.data });
    
    // Return the stats if successful
    if (response.status === 200) {
      return {
        averageRating: response.data?.averageRating || response.data?.data?.averageRating || 0,
        totalReviews: response.data?.totalReviews || response.data?.data?.totalReviews || 0,
        ratingCounts: response.data?.ratingCounts || response.data?.data?.ratingCounts || {},
        message: response.data?.message || response.data?.data?.message
      };
    }
    
    // If no stats found (404), return default values
    if (response.status === 404) {
      console.log(`No review stats found for event ${eventId}`);
      return { 
        averageRating: 0, 
        totalReviews: 0, 
        ratingCounts: {},
        message: 'No reviews yet' 
      };
    }
    
    // For any other status codes, log and return default values
    console.warn('Unexpected response when fetching review stats:', response.status, response.data);
    console.warn('Unexpected response when fetching review stats:', response.status, response.data);
    return { 
      averageRating: 0, 
      totalReviews: 0, 
      ratingCounts: {},
      message: 'Unable to load review statistics'
    };
  } catch (error) {
    // Only log unexpected errors (not 404s which we handle above)
    if (!error.response || error.response.status !== 404) {
      console.error('Error fetching review stats:', error);
    }
    return { 
      averageRating: 0, 
      totalReviews: 0, 
      ratingCounts: {},
      message: 'Error loading review statistics'
    };
  }
};
