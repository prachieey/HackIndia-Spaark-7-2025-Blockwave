import http from './httpService';
import { getCurrentUser } from './authService';

const apiEndpoint = '/api/v1/reviews';

export const getEventReviews = async (eventId, params = {}) => {
  try {
    const response = await http.get(`${apiEndpoint}/event/${eventId}`, { params });
    // Handle different response formats
    if (response?.data?.data) {
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data];
    } else if (Array.isArray(response?.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    }
    return [];
  } catch (error) {
    console.error('Error fetching event reviews:', error);
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

export const getReviewStats = async (eventId) => {
  try {
    const response = await http.get(`${apiEndpoint}/stats/event/${eventId}`);
    return response?.data?.data || { averageRating: 0, totalReviews: 0, ratingCounts: {} };
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return { averageRating: 0, totalReviews: 0, ratingCounts: {} };
  }
};
