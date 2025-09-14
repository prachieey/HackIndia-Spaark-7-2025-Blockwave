import http from './httpService';
import { getCurrentUser } from './authService';

const apiEndpoint = '/api/v1/reviews';

export const getEventReviews = async (eventId, params = {}) => {
  const response = await http.get(`${apiEndpoint}/event/${eventId}`, { params });
  return response.data.data;
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
  const response = await http.get(`${apiEndpoint}/stats/event/${eventId}`);
  return response.data.data;
};
