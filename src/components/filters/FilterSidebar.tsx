import React from 'react';
import { FilterState } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { Star, RotateCcw, Check } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  className?: string;
}

const PRICE_PRESETS: { label: string; range: [number, number] }[] = [
  { label: 'All Prices', range: [0, 20000] },
  { label: 'Under ₹1,000', range: [0, 1000] },
  { label: '₹1,000 – ₹2,500', range: [1000, 2500] },
  { label: '₹2,500 – ₹5,000', range: [2500, 5000] },
  { label: 'Above ₹5,000', range: [5000, 20000] },
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  className = '',
}) => {
  return (
    <aside className={`flex flex-col gap-6 text-sm text-neutral-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-neutral-200/80">
        <h3 className="font-extrabold text-neutral-950 text-base tracking-tight">Filters</h3>
        <button
          onClick={onResetFilters}
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-950 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-3">
        <h4 className="font-bold text-neutral-900 text-[11px] uppercase tracking-wider">
          Categories
        </h4>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onFilterChange({ category: 'all' })}
            className={`text-left py-2 px-3 rounded-xl transition-all text-xs font-semibold flex items-center justify-between cursor-pointer ${
              filters.category === 'all'
                ? 'bg-neutral-950 text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
            }`}
          >
            <span>All Categories</span>
          </button>
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onFilterChange({ category: cat.slug })}
                className={`text-left py-2 px-3 rounded-xl transition-all text-xs font-semibold flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-neutral-800 text-neutral-200'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {cat.itemCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="flex flex-col gap-3 pt-4 border-t border-neutral-200/80">
        <h4 className="font-bold text-neutral-900 text-[11px] uppercase tracking-wider">
          Price Range
        </h4>
        <div className="flex flex-col gap-1.5">
          {PRICE_PRESETS.map((preset, idx) => {
            const isSelected =
              filters.priceRange[0] === preset.range[0] &&
              filters.priceRange[1] === preset.range[1];
            return (
              <label
                key={idx}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-neutral-100 text-neutral-950 font-bold'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="pricePreset"
                    checked={isSelected}
                    onChange={() => onFilterChange({ priceRange: preset.range })}
                    className="w-3.5 h-3.5 text-neutral-950 focus:ring-neutral-950 border-neutral-300"
                  />
                  <span>{preset.label}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Customer Rating */}
      <div className="flex flex-col gap-3 pt-4 border-t border-neutral-200/80">
        <h4 className="font-bold text-neutral-900 text-[11px] uppercase tracking-wider">
          Customer Rating
        </h4>
        <div className="flex flex-col gap-1.5">
          {[4, 3, 2].map((rating) => {
            const isSelected = filters.minRating === rating;
            return (
              <button
                key={rating}
                type="button"
                onClick={() => onFilterChange({ minRating: isSelected ? 0 : rating })}
                className={`flex items-center justify-between py-2 px-3 rounded-xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-950 text-white font-bold shadow-xs'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
                }`}
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'fill-amber-400 text-amber-400' : 'fill-amber-500 text-amber-500'
                      }`}
                    />
                  ))}
                  <span className="text-xs ml-1">& above</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div className="flex flex-col gap-3 pt-4 border-t border-neutral-200/80">
        <h4 className="font-bold text-neutral-900 text-[11px] uppercase tracking-wider">
          Availability
        </h4>
        <label className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold text-neutral-800 hover:bg-neutral-50 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
            className="w-4 h-4 rounded text-neutral-950 focus:ring-neutral-950 border-neutral-300"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </aside>
  );
};
