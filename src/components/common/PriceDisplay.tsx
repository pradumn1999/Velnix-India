import React from 'react';
import { formatINR } from '../../utils/formatters';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  discount?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscountBadge?: boolean;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  discount,
  size = 'md',
  showDiscountBadge = true,
  className = '',
}) => {
  const currentPriceClasses = {
    sm: 'text-sm font-extrabold text-neutral-950 tracking-tight',
    md: 'text-base font-extrabold text-neutral-950 tracking-tight',
    lg: 'text-xl font-extrabold text-neutral-950 tracking-tight',
    xl: 'text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight',
  };

  const originalPriceClasses = {
    sm: 'text-xs text-neutral-600 line-through font-medium',
    md: 'text-xs sm:text-sm text-neutral-600 line-through font-medium',
    lg: 'text-sm sm:text-base text-neutral-600 line-through font-medium',
    xl: 'text-base sm:text-lg text-neutral-600 line-through font-medium',
  };

  const hasDiscount = originalPrice && originalPrice > price;
  const calculatedDiscount =
    discount || (hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  return (
    <div className={`flex items-baseline flex-wrap gap-2 ${className}`}>
      <span className={currentPriceClasses[size]}>{formatINR(price)}</span>

      {hasDiscount && (
        <span className={originalPriceClasses[size]}>{formatINR(originalPrice)}</span>
      )}

      {hasDiscount && showDiscountBadge && calculatedDiscount > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
          {calculatedDiscount}% OFF
        </span>
      )}
    </div>
  );
};
