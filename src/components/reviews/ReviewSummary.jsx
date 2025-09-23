import React, { useEffect, useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { getEventReviewStats } from '../../services/reviewService';

const ReviewSummary = ({ eventId, onReviewSubmit }) => {
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await getEventReviewStats(eventId);
        setStats({
          averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
          ratingCounts: data.ratingCounts || {}
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching review stats:', err);
        setError('Failed to load review statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [eventId, onReviewSubmit]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);
    }

    return stars;
  };

  const getPercentage = (count) => {
    return stats.totalReviews > 0 
      ? Math.round((count / stats.totalReviews) * 100) 
      : 0;
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-red-500 py-4">
          <p>{error}</p>
          <button 
            onClick={() => fetchStats()} 
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const hasReviews = stats.totalReviews > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
      
      <div className="md:flex items-center mb-6">
        <div className="text-center md:text-left md:mr-10 mb-4 md:mb-0">
          <div className="text-4xl font-bold text-gray-800">
            {hasReviews ? stats.averageRating.toFixed(1) : '0.0'}
          </div>
          <div className="flex justify-center md:justify-start my-2">
            {hasReviews ? (
              renderStars(stats.averageRating)
            ) : (
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaRegStar key={star} className="text-gray-300" />
                ))}
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {hasReviews 
              ? `Based on ${stats.totalReviews} review${stats.totalReviews !== 1 ? 's' : ''}`
              : 'No reviews yet'}
          </div>
        </div>
        
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center mb-2">
              <span className="w-8 text-sm font-medium text-gray-700">{star} star</span>
              <div className="flex-1 mx-2 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400"
                  style={{ 
                    width: `${getPercentage(stats.ratingCounts[star] || 0)}%` 
                  }}
                />
              </div>
              <span className="w-8 text-sm text-right text-gray-600">
                {stats.ratingCounts[star] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary;
