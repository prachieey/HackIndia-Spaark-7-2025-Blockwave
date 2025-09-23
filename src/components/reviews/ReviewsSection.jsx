import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ReviewSummary from './ReviewSummary';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { getUserReviewForEvent, getEventReviews, getEventReviewStats } from '../../services/reviewService';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import useWebSocket from '../../hooks/useWebSocket';
import { Loader2 } from 'lucide-react';

const ReviewsSection = ({ eventId }) => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [userReview, setUserReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  
  // Function to fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      const reviewsData = await getEventReviews(eventId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [eventId]);

  // State for review stats
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: {},
    message: 'No reviews yet'
  });

  // Fetch review stats when the component mounts or when eventId changes
  const fetchReviewStats = useCallback(async () => {
    if (!eventId) return;
    
    try {
      const stats = await getEventReviewStats(eventId);
      setReviewStats(stats);
    } catch (error) {
      console.error('Error fetching review stats:', error);
      toast.error('Failed to load review statistics');
    }
  }, [eventId]);

  // WebSocket for real-time updates
  const { sendMessage, isConnected } = useWebSocket(
    eventId ? `/api/v1/events/${eventId}/reviews/ws` : null,
    useCallback((message) => {
      // Handle incoming WebSocket messages
      if (message && message.type === 'NEW_REVIEW' && message.data && message.data.eventId === eventId) {
        console.log('New review received via WebSocket:', message);
        // Update reviews and stats when a new one is added
        fetchReviews();
        fetchReviewStats();
      }
    }, [eventId, fetchReviews, fetchReviewStats])
  );

  // Log WebSocket connection status
  useEffect(() => {
    const status = isConnected ? 'Connected' : 'Disconnected';
    console.log(`WebSocket connection status: ${status} for event ${eventId}`);
    
    // Show a toast notification when connection status changes
    if (isConnected) {
      toast.success('Live updates enabled', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
    } else if (!isConnected && eventId) {
      toast.warn('Live updates disconnected. Reconnecting...', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: true,
      });
    }
  }, [isConnected, eventId]);
  
  // Function to notify about new review
  const notifyNewReview = useCallback((review) => {
    if (!isConnected) {
      console.warn('Cannot send message: WebSocket is not connected');
      return;
    }
    
    try {
      const message = {
        type: 'NEW_REVIEW',
        data: {
          eventId,
          reviewId: review._id,
          userId: review.user?._id,
          timestamp: new Date().toISOString()
        }
      };
      
      console.log('Sending WebSocket message:', message);
      sendMessage(message);
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }, [eventId, sendMessage, isConnected]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch reviews and stats when the component mounts or when eventId changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user's review if authenticated
        if (isAuthenticated && currentUser?._id) {
          try {
            const review = await getUserReviewForEvent(eventId);
            setUserReview(review);
          } catch (error) {
            console.error('Error fetching user review:', error);
            // Don't show error to user if it's just that they haven't reviewed yet
            if (error.response?.status !== 404) {
              toast.error('Failed to load your review');
            }
          }
        }
        
        // Fetch all reviews for the event
        await fetchReviews();
        
        // Fetch review statistics
        await fetchReviewStats();
        
      } catch (error) {
        console.error('Error in fetchData:', error);
        toast.error('Failed to load review data');
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId, currentUser, isAuthenticated, fetchReviews, fetchReviewStats]);

  const handleReviewSubmit = async (reviewData) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setIsSubmitting(true);
    try {
      const [userReviewData, allReviews] = await Promise.all([
        getUserReviewForEvent(eventId),
        getEventReviews(eventId)
      ]);

      setUserReview(userReviewData);
      setReviews(allReviews);
      setShowReviewForm(false);
      
      // Notify about the new review via WebSocket
      if (userReviewData) {
        notifyNewReview(userReviewData);
      }

      toast.success('Your review has been submitted successfully!', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Error handling review submission:', error);
      toast.error('Failed to update reviews. Please try again.', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  const hasReviews = reviews.length > 0;

  return (
    <section className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Reviews</h2>
            {isAuthenticated && !userReview && !showReviewForm && (
              <Button 
                onClick={() => setShowReviewForm(true)}
                disabled={isLoading}
                className="flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Write a Review'
                )}
              </Button>
            )}
          </div>

          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ReviewForm
                  eventId={eventId}
                  onSuccess={(review) => {
                    setUserReview(review);
                    setShowReviewForm(false);
                    fetchReviews();
                    fetchReviewStats();
                    notifyNewReview(review);
                    toast.success('Your review has been submitted!');
                  }}
                  onCancel={() => setShowReviewForm(false)}
                  initialData={userReview}
                  isSubmitting={isSubmitting}
                  onSubmitStart={() => setIsSubmitting(true)}
                  onSubmitEnd={() => setIsSubmitting(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <ReviewSummary 
            averageRating={reviewStats.averageRating}
            totalReviews={reviewStats.totalReviews}
            ratingCounts={reviewStats.ratingCounts}
            message={reviewStats.message}
            className="mb-8"
          />

          {reviews.length > 0 ? (
            <ReviewList 
              reviews={reviews} 
              currentUserId={currentUser?._id}
              onDelete={fetchReviews}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              No reviews yet. Be the first to leave a review!
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
