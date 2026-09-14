import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X, Sparkles } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';
import { FilterState } from '../types';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { ProductGrid } from '../components/product/ProductGrid';
import { Pagination } from '../components/common/Pagination';
import { FilterSidebar } from '../components/filters/FilterSidebar';
import { MobileFilterDrawer } from '../components/filters/MobileFilterDrawer';

const ITEMS_PER_PAGE = 8;

export const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query params
  const categoryParam = searchParams.get('category') || 'all';
  const searchParam = searchParams.get('search') || '';
  const specialParam = searchParams.get('special') || '';

  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    category: categoryParam,
    priceRange: [0, 20000],
    minRating: 0,
    inStockOnly: false,
    sortBy: 'popularity',
    searchQuery: searchParam,
  });

  // Sync category or search query from URL params
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: categoryParam,
      searchQuery: searchParam,
    }));
    setCurrentPage(1);
  }, [categoryParam, searchParam]);

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...updated };
      if (updated.category !== undefined) {
        if (updated.category === 'all') {
          searchParams.delete('category');
        } else {
          searchParams.set('category', updated.category);
        }
        setSearchParams(searchParams, { replace: true });
      }
      return next;
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      priceRange: [0, 20000],
      minRating: 0,
      inStockOnly: false,
      sortBy: 'popularity',
      searchQuery: '',
    });
    setSearchParams({}, { replace: true });
    setCurrentPage(1);
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Search
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        const matchesTags = product.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesCategory && !matchesTags) return false;
      }

      // Special tags
      if (specialParam === 'trending' && !product.isTrending) return false;
      if (specialParam === 'bestsellers' && !product.isBestSeller) return false;
      if (specialParam === 'offers' && !product.isSpecialOffer && product.discount < 50)
        return false;

      // Category
      if (filters.category !== 'all' && product.category !== filters.category) {
        return false;
      }

      // Price Range
      if (
        product.price < filters.priceRange[0] ||
        product.price > filters.priceRange[1]
      ) {
        return false;
      }

      // Rating
      if (filters.minRating > 0 && product.rating < filters.minRating) {
        return false;
      }

      // Stock
      if (filters.inStockOnly && product.stock <= 0) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.id.localeCompare(a.id);
        case 'popularity':
        default:
          return b.reviewCount - a.reviewCount;
      }
    });
  }, [filters, specialParam]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const currentCategoryObj = CATEGORIES.find((c) => c.slug === filters.category);
  const pageTitle = searchParam
    ? `Search Results for "${searchParam}"`
    : specialParam === 'trending'
    ? 'Trending Drops in India'
    : specialParam === 'bestsellers'
    ? 'Best Selling Innovations'
    : specialParam === 'offers'
    ? 'Special Offers & Advantage Drops'
    : currentCategoryObj
    ? currentCategoryObj.name
    : 'All Products';

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.minRating > 0 ||
    filters.inStockOnly ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 20000 ||
    filters.searchQuery !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Shop', href: '/products' },
          ...(currentCategoryObj ? [{ label: currentCategoryObj.name }] : []),
          ...(searchParam ? [{ label: `"${searchParam}"` }] : []),
        ]}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-neutral-200/80">
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
            Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-950 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 font-normal">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} ready for express air dispatch across India
          </p>
        </div>

        {/* Controls: Mobile Filter Button & Sort Dropdown */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 rounded-full border border-neutral-300 text-xs font-bold text-neutral-900 bg-white hover:bg-neutral-50 flex items-center gap-2 shadow-xs cursor-pointer min-h-[40px]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-700" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 hidden sm:inline font-medium">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                handleFilterChange({
                  sortBy: e.target.value as FilterState['sortBy'],
                })
              }
              className="bg-white border border-neutral-300 text-neutral-950 rounded-full px-4 py-2 text-xs font-bold focus:border-neutral-950 focus:outline-none shadow-xs cursor-pointer min-h-[40px]"
            >
              <option value="popularity">Most Popular</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs -mt-3">
          <span className="text-neutral-400 font-semibold text-[11px] uppercase tracking-wider mr-1">
            Active:
          </span>
          {filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white font-semibold text-xs">
              <span>{currentCategoryObj?.name || filters.category}</span>
              <button
                onClick={() => handleFilterChange({ category: 'all' })}
                className="hover:text-neutral-300 cursor-pointer"
                aria-label="Remove category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.minRating > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white font-semibold text-xs">
              <span>{filters.minRating}★ & above</span>
              <button
                onClick={() => handleFilterChange({ minRating: 0 })}
                className="hover:text-neutral-300 cursor-pointer"
                aria-label="Remove rating filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white font-semibold text-xs">
              <span>In Stock Only</span>
              <button
                onClick={() => handleFilterChange({ inStockOnly: false })}
                className="hover:text-neutral-300 cursor-pointer"
                aria-label="Remove stock filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-neutral-600 hover:text-neutral-950 underline ml-2 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-3xl border border-neutral-200/80 sticky top-28 shadow-xs">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 flex flex-col gap-10">
          <ProductGrid
            products={paginatedProducts}
            onClearFilters={hasActiveFilters ? handleResetFilters : undefined}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 180, behavior: 'smooth' });
            }}
          />
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        resultCount={filteredProducts.length}
      />
    </div>
  );
};
