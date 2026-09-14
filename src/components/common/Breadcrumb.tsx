import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs sm:text-sm text-neutral-500 overflow-x-auto whitespace-nowrap py-2 ${className}`}
    >
      <ol className="flex items-center gap-1.5">
        <li>
          <Link
            to="/"
            className="flex items-center text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <Home className="w-3.5 h-3.5 mr-1" />
            <span>Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              {isLast || !item.href ? (
                <span className="font-medium text-neutral-900 truncate max-w-[200px] sm:max-w-[300px]">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-neutral-500 hover:text-neutral-900 transition-colors truncate max-w-[150px] sm:max-w-[220px]"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
