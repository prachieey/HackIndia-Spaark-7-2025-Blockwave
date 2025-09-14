import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import StarRating from './StarRating';
import { createReview, updateReview } from '../../services/reviewService';
import { Button } from '../ui/button';

const ReviewForm = ({ eventId, user, existingReview, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      review: existingReview?.review || ''
    }
  });
  
  const isEditing = !!existingReview;
  const reviewContent = watch('review', '');

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setValue('review', existingReview.review);
    }
  }, [existingReview, setValue]);

  const onSubmit = async (data) => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const reviewData = {
        ...data,
        rating,
        event: eventId,
        user: user._id
      };

      if (existingReview) {
        await updateReview(existingReview._id, reviewData);
        toast.success('Review updated successfully');
      } else {
        await createReview(reviewData);
        toast.success('Thank you for your review!');
      }
      
      reset();
      setRating(0);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {isEditing ? 'Update Your Review' : 'Write a Review'}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close form"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-3">Your Rating</label>
          <div className="flex items-center">
            <StarRating 
              rating={rating} 
              onRatingChange={setRating}
              readOnly={isSubmitting}
              size={28}
            />
            <span className="ml-3 text-gray-600 text-sm">
              {rating > 0 ? `${rating} out of 5` : 'Tap to rate'}
            </span>
          </div>
          {!rating && errors.rating && (
            <p className="mt-1 text-sm text-red-600">Please select a rating</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="review" className="block text-gray-700 font-medium mb-3">
            Your Review
          </label>
          <div className="relative">
            <textarea
              id="review"
              rows="5"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.review ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
              }`}
              placeholder="Share your experience at this event..."
              {...register('review', { 
                required: 'Review is required',
                minLength: { value: 10, message: 'Review must be at least 10 characters' },
                maxLength: { value: 2000, message: 'Review cannot exceed 2000 characters' }
              })}
              disabled={isSubmitting}
            />
            <div className="flex justify-between mt-1">
              {errors.review ? (
                <p className="text-sm text-red-600">{errors.review.message}</p>
              ) : (
                <div></div>
              )}
              <span className="text-xs text-gray-500">
                {reviewContent?.length || 0}/2000 characters
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className={`${isSubmitting || rating === 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Updating...' : 'Submitting...'}
              </>
            ) : isEditing ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </div>
  );
};

ReviewForm.propTypes = {
  eventId: PropTypes.string.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string
  }).isRequired,
  existingReview: PropTypes.shape({
    _id: PropTypes.string,
    rating: PropTypes.number,
    review: PropTypes.string
  }),
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func
};

export default ReviewForm;
