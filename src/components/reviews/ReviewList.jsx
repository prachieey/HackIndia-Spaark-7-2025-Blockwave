import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaEdit, FaTrash } from 'react-icons/fa';
import StarRating from './StarRating';
import { getEventReviews, deleteReview } from '../../services/reviewService';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const ReviewList = ({ eventId, currentUser, onReviewUpdate, onReviewDelete }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5;

  const fetchReviews = async (pageNum) => {
    if (!eventId) return;
    
    try {
      setIsLoading(true);
      const response = await getEventReviews(eventId, { page: pageNum, limit });
      
      // The response is already the data we need (array of reviews)
      if (Array.isArray(response)) {
        setReviews(prev => pageNum === 1 ? response : [...prev, ...response]);
        // If we get fewer items than the limit, we've reached the end
        setHasMore(response.length === limit);
      } else {
        // Handle unexpected response format
        console.warn('Unexpected response format from getEventReviews:', response);
        setReviews([]);
        setHasMore(false);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
      setReviews([]);
      
      toast.error('Failed to load reviews. Please refresh the page.', {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

  const handleEdit = (review) => {
    if (onReviewUpdate) {
      onReviewUpdate(review);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(reviewId);
        
        // Update the UI by removing the deleted review
        setReviews(prev => prev.filter(r => r._id !== reviewId));
        
        // Notify parent component about the deletion
        if (onReviewDelete) {
          onReviewDelete(reviewId);
        }
        
        toast.success('Review deleted successfully!', {
          position: 'top-center',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error('Failed to delete review. Please try again.', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleReviewUpdate = (updatedReview) => {
    setReviews(prev => 
      prev.map(review => 
        review._id === updatedReview._id ? updatedReview : review
      )
    );
  };

  const handleReviewDelete = (deletedReviewId) => {
    setReviews(prev => prev.filter(review => review._id !== deletedReviewId));
  };

  if (isLoading && page === 1) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No reviews yet. Be the first to review this event!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewItem 
            key={review._id} 
            review={review} 
            currentUser={currentUser}
            onUpdate={handleReviewUpdate}
            onDelete={handleReviewDelete}
          />
        ))}
      </div>
      
      {isLoading && page > 1 && (
        <div className="text-center py-4">Loading more reviews...</div>
      )}
      
      {hasMore && !isLoading && (
        <div className="text-center mt-4">
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
            disabled={isLoading}
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
};

const ReviewItem = ({ review, currentUser, onUpdate, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isCurrentUserReview = currentUser && review.user?._id === currentUser._id;
  
  return (
    <motion.div 
      className="bg-space-black/30 backdrop-blur-sm border border-deep-purple/20 rounded-xl p-6 mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-deep-purple/20 flex items-center justify-center text-holographic-white/80">
              {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-holographic-white">
                {review.user?.name || 'Anonymous User'}
              </h4>
              {isCurrentUserReview && (
                <span className="text-xs bg-deep-purple/20 text-holographic-white/70 px-2 py-0.5 rounded-full">
                  You
                </span>
              )}
            </div>
            
            <div className="flex items-center mt-1">
              <StarRating rating={review.rating} size={16} readOnly />
              <span className="text-xs text-holographic-white/50 ml-2">
                {format(new Date(review.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
            
            <p className="mt-2 text-holographic-white/80 leading-relaxed whitespace-pre-line">
              {review.review}
            </p>
          </div>
        </div>
        
        {isCurrentUserReview && (
          <motion.div 
            className="flex space-x-2 opacity-0"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => onUpdate && onUpdate(review)}
              className="p-1.5 text-holographic-white/60 hover:text-tech-blue hover:bg-holographic-white/5 rounded-full transition-colors"
              title="Edit review"
            >
              <FaEdit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete && onDelete(review._id)}
              className="p-1.5 text-holographic-white/60 hover:text-flame-red hover:bg-holographic-white/5 rounded-full transition-colors"
              title="Delete review"
            >
              <FaTrash className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ReviewList;
