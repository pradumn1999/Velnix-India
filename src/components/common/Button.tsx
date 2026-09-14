import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'white' | 'darkOutline' | 'brand';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:opacity-45 disabled:pointer-events-none select-none whitespace-nowrap active:scale-[0.98] cursor-pointer tracking-tight';

  // Strict 2:1 horizontal to vertical padding ratio
  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.75 gap-1.5 min-h-[34px]',
    md: 'text-sm px-5 py-2.5 gap-2 min-h-[42px]',
    lg: 'text-base px-6 py-3 gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary:
      'bg-neutral-950 text-white hover:bg-neutral-800 active:bg-black shadow-[0_1px_2px_rgba(0,0,0,0.06)] border border-neutral-950/10',
    secondary:
      'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200/60',
    outline:
      'border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50 hover:border-neutral-400 active:bg-neutral-100',
    white:
      'bg-white text-neutral-950 hover:bg-neutral-100 active:bg-neutral-200 shadow-md border-0 font-bold',
    darkOutline:
      'border border-neutral-700 bg-neutral-900/90 text-white hover:bg-neutral-800 hover:border-neutral-600 active:bg-neutral-950 font-semibold',
    brand:
      'bg-[#381219] text-[#f5efe6] hover:bg-[#280d12] active:bg-[#1a080b] shadow-xs border border-[#521a24] font-bold',
    ghost:
      'bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 active:bg-neutral-200',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-xs border border-rose-700/20',
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
