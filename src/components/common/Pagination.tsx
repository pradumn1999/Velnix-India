import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className={`flex items-center justify-center gap-1.5 ${className}`}
      aria-label="Pagination Navigation"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page) => {
        const isCurrent = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={isCurrent ? 'page' : undefined}
            className={`flex items-center justify-center min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors ${
              isCurrent
                ? 'bg-neutral-900 text-white font-semibold'
                : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};
