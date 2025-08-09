import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;
}

export function RatingStars({ rating, onRate, size = 'medium', readonly = false }: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  const starSize = sizeClasses[size];

  const handleClick = (value: number) => {
    if (readonly || !onRate) return;
    onRate(value);
  };

  const handleMouseEnter = (value: number) => {
    if (readonly) return;
    setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = hoverRating ? value <= hoverRating : value <= rating;
        
        return (
          <button
            key={value}
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`transition-all duration-150 ${
              readonly 
                ? 'cursor-default' 
                : 'cursor-pointer hover:scale-110 active:scale-95'
            }`}
          >
            <Star
              className={`${starSize} transition-colors ${
                filled
                  ? 'fill-yellow-400 text-yellow-400'
                : 'fill-transparent text-[#B3B3B3]'
              } ${
                !readonly && 'hover:text-yellow-400'
              }`}
            />
          </button>
        );
      })}
      
      {rating > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-400">
          {rating}/5
        </span>
      )}
    </div>
  );
}