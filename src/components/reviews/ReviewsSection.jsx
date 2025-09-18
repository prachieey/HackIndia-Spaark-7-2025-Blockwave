import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ReviewSummary from './ReviewSummary';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { getUserReviewForEvent, getEventReviews } from '../../services/reviewService';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewsSection = ({ eventId }) => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [userReview, setUserReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const reviewsData = await getEventReviews(eventId);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated && currentUser?._id) {
          const review = await getUserReviewForEvent(eventId);
          setUserReview(review);
        }
        await fetchReviews();
      } catch (error) {
        console.error('Error fetching review data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId, currentUser, isAuthenticated]);

  const handleReviewSubmit = async (reviewData) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Refresh both the user's review and all reviews
      const [userReviewData, allReviews] = await Promise.all([
        getUserReviewForEvent(eventId),
        getEventReviews(eventId)
      ]);
      
      setUserReview(userReviewData);
      setReviews(allReviews);
      setShowReviewForm(false);
      
      // Show success message
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
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <section className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-holographic-white">
          <i className="fas fa-star text-yellow-400 mr-2"></i>
          Reviews & Ratings
        </h2>
        
        {isAuthenticated && !userReview && !showReviewForm && (
          <Button 
            onClick={() => setShowReviewForm(true)}
            className="bg-gradient-to-r from-tech-blue to-deep-purple hover:opacity-90 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center"
            disabled={isSubmitting}
          >
            <i className="fas fa-pen mr-2"></i>
            {isSubmitting ? 'Submitting...' : 'Write a Review'}
          </Button>
        )}
      </div>
      
      <div className="space-y-8">
        <ReviewSummary eventId={eventId} reviews={reviews} />
        
        <AnimatePresence>
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-space-black/80 backdrop-blur-sm border border-deep-purple/20 rounded-xl p-6 shadow-lg mb-8"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-holographic-white">
                  Write a Review
                </h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-holographic-white/70 hover:text-holographic-white transition-colors"
                  disabled={isSubmitting}
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
              <ReviewForm 
                eventId={eventId}
                user={currentUser}
                existingReview={userReview}
                onSuccess={handleReviewSubmit}
                onCancel={() => setShowReviewForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isAuthenticated && (
          <div className="bg-space-black/50 backdrop-blur-sm border border-deep-purple/20 rounded-xl p-6 text-center">
            <p className="text-holographic-white/80 mb-4">
              Sign in to share your experience with this event
            </p>
            <Button
              onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
              className="bg-gradient-to-r from-tech-blue to-deep-purple hover:opacity-90 text-white"
            >
              Sign In to Review
            </Button>
          </div>
        )}
        
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-holographic-white mb-6">
            Customer Reviews {reviews.length > 0 && `(${reviews.length})`}
          </h3>
          
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-space-black/30 rounded-xl">
              <i className="fas fa-comment-alt text-4xl text-holographic-white/30 mb-4"></i>
              <p className="text-holographic-white/60">
                No reviews yet. Be the first to share your experience!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div 
                  key={review._id} 
                  className="bg-space-black/50 backdrop-blur-sm border border-deep-purple/20 rounded-xl p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-deep-purple/20 flex items-center justify-center text-holographic-white font-semibold mr-3">
                      {review.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-medium text-holographic-white">
                        {review.user?.name || 'Anonymous User'}
                      </h4>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i}
                            className={`fas fa-star ${i < review.rating ? 'text-yellow-400' : 'text-holographic-white/30'} text-sm`}
                          ></i>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-holographic-white/80 mt-2">
                    {review.review}
                  </p>
                  {review.createdAt && (
                    <p className="text-xs text-holographic-white/40 mt-3">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
