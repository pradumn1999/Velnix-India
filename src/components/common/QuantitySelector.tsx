import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  max?: number;
  min?: number;
  onChange: (qty: number) => void;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  max = 99,
  min = 1,
  onChange,
  size = 'md',
  disabled = false,
}) => {
  const isSmall = size === 'sm';

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  return (
    <div
      className={`inline-flex items-center border border-neutral-300 rounded-full bg-white overflow-hidden shadow-xs select-none ${
        isSmall ? 'h-8 text-xs' : 'h-11 text-sm'
      }`}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || quantity <= min}
        className={`flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer active:scale-95 ${
          isSmall ? 'w-8 h-full' : 'w-11 h-full'
        }`}
        aria-label="Decrease quantity"
      >
        <Minus className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </button>

      <span
        className={`flex items-center justify-center font-bold text-neutral-950 px-2 text-center ${
          isSmall ? 'min-w-[28px]' : 'min-w-[36px]'
        }`}
      >
        {quantity}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || quantity >= max}
        className={`flex items-center justify-center text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer active:scale-95 ${
          isSmall ? 'w-8 h-full' : 'w-11 h-full'
        }`}
        aria-label="Increase quantity"
      >
        <Plus className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </button>
    </div>
  );
};
