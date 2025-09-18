import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { X, Star, Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { createReview, updateReview } from '../../services/reviewService';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';

const ReviewForm = ({ eventId, user, existingReview, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  
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
  
  // Star rating component
  const StarRating = ({ rating, onRatingChange, readOnly = false, size = 24 }) => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = star <= (hoverRating || rating) ? 'fill-current text-yellow-400' : 'text-gray-400';
        return (
          <button
            key={star}
            type="button"
            className={`${!readOnly ? 'cursor-pointer' : 'cursor-default'} p-1`}
            onClick={() => !readOnly && onRatingChange(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            disabled={readOnly || isSubmitting}
          >
            <Star 
              className={`${fill} ${star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-400'}`} 
              size={size} 
            />
          </button>
        );
      })}
    </div>
  );

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
        user: user._id,
        userName: user.name,
        userEmail: user.email
      };

      if (existingReview) {
        await updateReview(existingReview._id, reviewData);
        toast.success('Review updated successfully!', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        await createReview(reviewData);
        toast.success('Thank you for your review!', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
      
      // Reset form
      reset();
      setRating(0);
      
      // Call the onSuccess callback to update parent component
      if (onSuccess) {
        await onSuccess(reviewData);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review. Please try again.', {
        position: "top-center",
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

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-holographic-white/80 text-sm font-medium mb-2">
            Your Rating <span className="text-flame-red">*</span>
          </label>
          <div className="flex items-center space-x-2">
            <StarRating 
              rating={rating} 
              onRatingChange={setRating}
              readOnly={isSubmitting}
              size={28}
            />
            <span className="text-holographic-white/60 text-sm">
              {rating > 0 ? `${rating} out of 5` : 'Tap to rate'}
            </span>
          </div>
          {!rating && (
            <p className="mt-1 text-sm text-flame-red">Please select a rating</p>
          )}
        </div>
        
        <div>
          <label htmlFor="review" className="block text-holographic-white/80 text-sm font-medium mb-2">
            Your Review <span className="text-flame-red">*</span>
          </label>
          <div className="relative">
            <textarea
              id="review"
              rows="4"
              className={`w-full px-4 py-3 bg-space-black/50 border ${
                errors.review ? 'border-flame-red' : 'border-deep-purple/30'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-tech-blue/50 focus:border-transparent text-holographic-white placeholder-holographic-white/40 transition-all duration-200`}
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
                <p className="text-sm text-flame-red">{errors.review.message}</p>
              ) : (
                <div></div>
              )}
              <span className={`text-xs ${reviewContent?.length > 2000 ? 'text-flame-red' : 'text-holographic-white/40'}`}>
                {reviewContent?.length || 0}/2000
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border-holographic-white/20 text-holographic-white hover:bg-holographic-white/5"
            >
              Cancel
            </Button>
          )}
          <motion.div
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || reviewContent?.length < 10}
              className={`px-6 py-2.5 font-medium ${
                isSubmitting || rating === 0 || reviewContent?.length < 10 
                  ? 'bg-deep-purple/30 text-holographic-white/50 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-tech-blue to-deep-purple hover:opacity-90 text-white'
              } transition-all duration-200`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Submitting...'}
                </>
              ) : isEditing ? 'Update Review' : 'Submit Review'}
            </Button>
          </motion.div>
        </div>
      </form>
      
      {/* Form submission status */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-space-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-center p-4">
            <Loader2 className="h-8 w-8 text-tech-blue animate-spin mx-auto mb-2" />
            <p className="text-holographic-white/80 text-sm">
              {isEditing ? 'Updating your review...' : 'Submitting your review...'}
            </p>
          </div>
        </div>
      )}
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
