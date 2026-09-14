import React from 'react';

interface VelnixLogoProps {
  variant?: 'full' | 'compact' | 'mark' | 'badge';
  theme?: 'burgundy' | 'light' | 'dark' | 'monochrome';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

/**
 * High-precision vector component for the Velnix Fashion Apparel brand logo.
 * Exact replication of the brand emblem:
 * - Nested geometric double-V monogram with the signature negative space horizontal slice on the upper-left arm
 * - High-contrast luxury typography: "VELNIX" with tracking and "FASHION APPAREL" sub-label
 * - Deep wine/burgundy brand palette (#381219) paired with warm ivory (#F5EFE6)
 */
export const VelnixLogo: React.FC<VelnixLogoProps> = ({
  variant = 'full',
  theme = 'dark',
  size = 'md',
  className = '',
  showSubtitle = true,
}) => {
  // Height configurations
  const heightMap = {
    sm: 32,
    md: 40,
    lg: 52,
    xl: 64,
  };

  const h = heightMap[size] || 40;

  // Colors based on theme
  const isBurgundy = theme === 'burgundy';
  const isDark = theme === 'dark'; // on dark backgrounds
  const isLight = theme === 'light'; // on light backgrounds

  const bgColor = isBurgundy ? '#381219' : 'transparent';
  const markColor = isLight ? '#22080D' : '#F5EFE6';
  const textColor = isLight ? '#171717' : '#F5EFE6';
  const subtitleColor = isLight ? '#525252' : '#E6DDD0';

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl p-2.5 sm:p-3 shadow-md border border-[#521c27]/60 ${className}`}
        style={{ backgroundColor: '#381219' }}
      >
        <svg
          viewBox="0 0 340 85"
          height={h}
          className="w-auto max-w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Emblem */}
          <g fill="#F5EFE6">
            {/* Top-left slice cap */}
            <polygon points="12,12 38,12 32,23 6,23" />
            
            {/* Outer Left Diagonal (below the slice gap) */}
            <polygon points="18,33 40,33 52,70 38,70" />
            
            {/* Inner V - Left arm */}
            <polygon points="36,12 49,12 52,61 43,61" />
            
            {/* Inner V - Right arm */}
            <polygon points="43,61 52,61 74,12 61,12" />
            
            {/* Outer Right Diagonal */}
            <polygon points="52,70 66,70 88,12 74,12" />
          </g>

          {/* VELNIX */}
          <text
            x="118"
            y="48"
            fill="#F5EFE6"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontSize="37"
            fontWeight="900"
            letterSpacing="5"
          >
            VELNIX
          </text>

          {/* FASHION APPAREL */}
          {showSubtitle && (
            <text
              x="120"
              y="69"
              fill="#E6DDD0"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="10.5"
              fontWeight="600"
              letterSpacing="4.5"
            >
              FASHION APPAREL
            </text>
          )}
        </svg>
      </div>
    );
  }

  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 100 85"
        height={h}
        width={h * 1.15}
        className={`shrink-0 ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill={markColor}>
          {/* Top-left slice cap */}
          <polygon points="12,12 38,12 32,23 6,23" />
          
          {/* Outer Left Diagonal (below the slice gap) */}
          <polygon points="18,33 40,33 52,70 38,70" />
          
          {/* Inner V - Left arm */}
          <polygon points="36,12 49,12 52,61 43,61" />
          
          {/* Inner V - Right arm */}
          <polygon points="43,61 52,61 74,12 61,12" />
          
          {/* Outer Right Diagonal */}
          <polygon points="52,70 66,70 88,12 74,12" />
        </g>
      </svg>
    );
  }

  // Full / Compact variant
  return (
    <div className={`inline-flex items-center gap-2 sm:gap-3 ${className}`}>
      {/* Icon Mark */}
      <div
        className={`flex items-center justify-center rounded-xl p-1.5 shrink-0 transition-transform ${
          isLight ? 'bg-[#381219] shadow-xs text-white' : 'bg-transparent'
        }`}
        style={isLight ? { backgroundColor: '#381219' } : undefined}
      >
        <svg
          viewBox="0 0 100 85"
          height={Math.max(26, h * 0.82)}
          width={Math.max(30, h * 0.95)}
          className="shrink-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill={isLight ? '#F5EFE6' : markColor}>
            {/* Top-left slice cap */}
            <polygon points="12,12 38,12 32,23 6,23" />
            
            {/* Outer Left Diagonal */}
            <polygon points="18,33 40,33 52,70 38,70" />
            
            {/* Inner V - Left arm */}
            <polygon points="36,12 49,12 52,61 43,61" />
            
            {/* Inner V - Right arm */}
            <polygon points="43,61 52,61 74,12 61,12" />
            
            {/* Outer Right Diagonal */}
            <polygon points="52,70 66,70 88,12 74,12" />
          </g>
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center leading-none">
        <span
          className={`font-black tracking-[0.14em] uppercase ${
            size === 'sm'
              ? 'text-sm sm:text-base'
              : size === 'lg'
              ? 'text-xl sm:text-2xl'
              : size === 'xl'
              ? 'text-2xl sm:text-3xl'
              : 'text-base sm:text-lg'
          }`}
          style={{ color: textColor }}
        >
          VELNIX
        </span>
        {showSubtitle && variant !== 'compact' && (
          <span
            className={`font-bold tracking-[0.24em] uppercase text-neutral-500 mt-0.5 ${
              size === 'sm' ? 'text-[8px]' : 'text-[9px] sm:text-[10px]'
            }`}
            style={{ color: subtitleColor }}
          >
            FASHION APPAREL
          </span>
        )}
      </div>
    </div>
  );
};
