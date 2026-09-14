import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { LoadingGrid } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onClearFilters?: () => void;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your search criteria or resetting filters to discover more items.',
  onClearFilters,
  className = '',
}) => {
  if (isLoading) {
    return <LoadingGrid count={8} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText={onClearFilters ? 'Reset Filters' : 'Explore All Products'}
        actionHref={!onClearFilters ? '/products' : undefined}
        onActionClick={onClearFilters}
        className="my-6"
      />
    );
  }

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 ${className}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
