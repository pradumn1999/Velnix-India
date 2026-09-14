import React from 'react';
import { X } from 'lucide-react';
import { FilterState } from '../../types';
import { FilterSidebar } from './FilterSidebar';
import { Button } from '../common/Button';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (updated: Partial<FilterState>) => void;
  onResetFilters: () => void;
  resultCount: number;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  resultCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h3 className="font-bold text-neutral-900 text-base">Filter Products</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <FilterSidebar
            filters={filters}
            onFilterChange={onFilterChange}
            onResetFilters={onResetFilters}
          />
        </div>

        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onResetFilters}>
            Reset
          </Button>
          <Button variant="primary" className="flex-1" onClick={onClose}>
            Apply ({resultCount})
          </Button>
        </div>
      </div>
    </div>
  );
};
