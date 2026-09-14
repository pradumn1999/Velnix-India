import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden animate-pulse flex flex-col">
      <div className="aspect-square bg-neutral-100 w-full" />
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div className="h-3 bg-neutral-200 rounded w-1/3" />
        <div className="h-4 bg-neutral-200 rounded w-4/5" />
        <div className="h-3 bg-neutral-100 rounded w-1/2" />
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="h-5 bg-neutral-200 rounded w-2/5" />
          <div className="h-8 bg-neutral-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
};

export const LoadingGrid: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
