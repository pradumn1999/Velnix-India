import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types';
import { ArrowUpRight } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, className = '' }) => {
  return (
    <Link
      to={`/products?category=${category.slug}`}
      id={`category-card-${category.slug}`}
      className={`group relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200/80 hover:border-neutral-950 block aspect-[4/5] sm:aspect-[3/4] shadow-xs transition-all duration-300 hover:shadow-lg ${className}`}
    >
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-90"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      {/* Editorial Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/30 to-transparent" />

      {/* Floating Category Meta */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white flex flex-col justify-end">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">
              Collection
            </span>
            <h4 className="font-extrabold text-sm sm:text-base leading-tight tracking-tight text-white group-hover:text-neutral-100 transition-colors">
              {category.name}
            </h4>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 shrink-0">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <span className="text-[11px] text-neutral-300 font-medium mt-1">
          {category.itemCount} items
        </span>
      </div>
    </Link>
  );
};
