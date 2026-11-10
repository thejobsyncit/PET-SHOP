import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const RatingStars = ({ rating = 5, size = 16, className = '' }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<Star key={i} size={size} className="fill-amber-400 text-amber-400" />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <span key={i} className="relative inline-flex items-center justify-center">
          <Star size={size} className="text-white fill-white" />
          <span className="absolute inset-0 text-amber-400 pointer-events-none">
            <StarHalf size={size} fill="currentColor" />
          </span>
        </span>
      );
    } else {
      stars.push(<Star key={i} size={size} className="text-gray-300" />);
    }
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {stars}
    </div>
  );
};

export default RatingStars;
