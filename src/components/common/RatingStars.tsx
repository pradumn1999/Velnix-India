import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  reviewCount?: number;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'sm',
  showNumber = false,
  reviewCount,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of ${maxRating}`}>
        {Array.from({ length: maxRating }).map((_, idx) => {
          const fillPercentage = Math.max(0, Math.min(100, (rating - idx) * 100));
          return (
            <div key={idx} className="relative inline-block">
              <Star className={`${iconSizes[size]} text-neutral-200`} />
              {fillPercentage > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star className={`${iconSizes[size]} text-amber-500 fill-amber-500`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showNumber && (
        <span className={`font-semibold text-neutral-800 ${textSizes[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className={`text-neutral-500 ${textSizes[size]}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
