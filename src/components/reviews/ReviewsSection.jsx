import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ReviewSummary from './ReviewSummary';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { getUserReviewForEvent } from '../../services/reviewService';
import { Button } from '../ui/button';

const ReviewsSection = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userReview, setUserReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchUserReview = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        const review = await getUserReviewForEvent(eventId);
        setUserReview(review);
      } catch (error) {
        console.error('Error fetching user review:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserReview();
  }, [eventId, currentUser, refreshKey]);

  const handleReviewSubmit = () => {
    // Trigger a refetch of the user's review
    setRefreshKey(prev => prev + 1);
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
      <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>
      
      <div className="space-y-8">
        <ReviewSummary eventId={eventId} onReviewSubmit={handleReviewSubmit} />
        
        {currentUser ? (
          <>
            {!showReviewForm && !userReview && (
              <div className="text-center py-6">
                <Button 
                  onClick={() => setShowReviewForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Write a Review
                </Button>
              </div>
            )}
            
            {(showReviewForm || userReview) && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">
                  {userReview ? 'Your Review' : 'Write a Review'}
                </h3>
                <ReviewForm 
                  eventId={eventId} 
                  user={currentUser}
                  existingReview={userReview}
                  onSuccess={() => {
                    setRefreshKey(prev => prev + 1);
                    setShowReviewForm(false);
                  }}
                  onCancel={() => setShowReviewForm(false)}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">
              Please sign in to leave a review
            </p>
            <Button
              onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sign In
            </Button>
          </div>
        )}
        
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
          <ReviewList 
            eventId={eventId} 
            currentUser={currentUser}
            key={refreshKey}
          />
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
