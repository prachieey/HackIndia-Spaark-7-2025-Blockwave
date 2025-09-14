import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import PropTypes from 'prop-types';

const StarRating = ({ 
  rating = 0, 
  onRatingChange, 
  size = 20, 
  readOnly = false,
  count = 5 
}) => {
  const [hover, setHover] = useState(null);
  const [currentRating, setCurrentRating] = useState(rating);

  useEffect(() => {
    setCurrentRating(rating);
  }, [rating]);

  const handleClick = (ratingValue) => {
    if (!readOnly) {
      setCurrentRating(ratingValue);
      if (onRatingChange) onRatingChange(ratingValue);
    }
  };

  return (
    <div className="flex items-center">
      {[...Array(count)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <label key={index} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={ratingValue}
              onClick={() => handleClick(ratingValue)}
              className="hidden"
              disabled={readOnly}
            />
            <FaStar
              className="transition-colors duration-200"
              color={ratingValue <= (hover || currentRating) ? "#ffc107" : "#e4e5e9"}
              size={size}
              onMouseEnter={() => !readOnly && setHover(ratingValue)}
              onMouseLeave={() => !readOnly && setHover(null)}
            />
          </label>
        );
      })}
      <span className="ml-2 text-gray-600 text-sm">
        {currentRating ? `${currentRating} out of ${count}` : ''}
      </span>
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number,
  onRatingChange: PropTypes.func,
  size: PropTypes.number,
  readOnly: PropTypes.bool,
  count: PropTypes.number
};

export default StarRating;
