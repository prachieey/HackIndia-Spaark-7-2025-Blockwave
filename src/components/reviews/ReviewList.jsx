import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import StarRating from './StarRating';
import { getEventReviews } from '../../services/reviewService';
import { format } from 'date-fns';

const ReviewList = ({ eventId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5;

  const fetchReviews = async (pageNum) => {
    try {
      setIsLoading(true);
      const data = await getEventReviews(eventId, { page: pageNum, limit });
      
      setReviews(prev => pageNum === 1 ? data.docs : [...prev, ...data.docs]);
      setHasMore(data.hasNextPage);
      setError(null);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
  }, [page]);

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
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isCurrentUserReview = currentUser && review.user._id === currentUser._id;

  const handleUpdateSuccess = (updatedReview) => {
    setIsEditing(false);
    if (onUpdate) onUpdate(updatedReview);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        setIsDeleting(true);
        // Call API to delete review
        // await deleteReview(review._id);
        if (onDelete) onDelete(review._id);
        toast.success('Review deleted successfully');
      } catch (error) {
        console.error('Error deleting review:', error);
        toast.error('Failed to delete review');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {review.user.photo ? (
              <img 
                src={review.user.photo} 
                alt={review.user.name} 
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle className="h-10 w-10 text-gray-400" />
            )}
          </div>
          <div>
            <h4 className="font-medium">{review.user.name}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <StarRating rating={review.rating} size={14} readOnly />
              <span>•</span>
              <time dateTime={review.createdAt}>
                {format(new Date(review.createdAt), 'MMM d, yyyy')}
              </time>
            </div>
          </div>
        </div>
        
        {isCurrentUserReview && !isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
              disabled={isDeleting}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-sm text-red-600 hover:text-red-800"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-3 pl-13">
        {isEditing ? (
          <ReviewForm
            eventId={review.event}
            user={currentUser}
            existingReview={review}
            onSuccess={handleUpdateSuccess}
          />
        ) : (
          <p className="text-gray-700 whitespace-pre-line">{review.review}</p>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
