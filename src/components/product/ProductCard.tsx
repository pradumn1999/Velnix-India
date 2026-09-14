import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '../../types';
import { PriceDisplay } from '../common/PriceDisplay';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useQuickView } from '../../context/QuickViewContext';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openQuickView } = useQuickView();

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className={`group bg-white rounded-2xl border border-neutral-200/80 hover:border-neutral-400/80 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden relative ${className}`}
    >
      {/* 1. Product Image & Floating Controls */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500 ease-out"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </Link>

        {/* Minimalist Editorial Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start pointer-events-none z-10">
          {product.isBestSeller && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-neutral-950/90 text-white backdrop-blur-md shadow-xs">
              Best Seller
            </span>
          )}
          {product.isTrending && !product.isBestSeller && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/95 text-neutral-900 border border-neutral-200/60 backdrop-blur-md shadow-xs">
              Trending
            </span>
          )}
          {product.discount >= 40 && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-600 text-white shadow-xs">
              {product.discount}% Off
            </span>
          )}
        </div>

        {/* Tactile Glass Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs backdrop-blur-md cursor-pointer active:scale-90 z-10 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/85 text-neutral-700 hover:text-rose-600 hover:bg-white border border-neutral-200/50'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 stroke-rose-600' : ''}`} />
        </button>

        {/* Floating Quick View Bar (Desktop Reveal) */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0 hidden sm:flex gap-2 z-10">
          <button
            onClick={handleQuickView}
            className="w-full py-2.5 px-3 bg-white/95 hover:bg-white text-neutral-950 text-xs font-bold rounded-xl shadow-md backdrop-blur-md flex items-center justify-center gap-1.5 transition-all border border-neutral-200/60 cursor-pointer active:scale-[0.98]"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-600" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* 2. Product Meta & Pricing */}
      <div className="p-4 sm:p-4.5 flex flex-col flex-1">
        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider truncate">
            {product.subCategory || product.category.replace('-', ' ')}
          </span>
          {product.rating && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-900 shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <Link
          to={`/product/${product.id}`}
          className="text-[13px] sm:text-sm font-bold text-neutral-950 hover:text-neutral-700 transition-colors line-clamp-2 min-h-[38px] mb-3 leading-snug tracking-tight"
        >
          {product.name}
        </Link>

        {/* Price & Add to Bag */}
        <div className="mt-auto pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
          <PriceDisplay
            price={product.price}
            originalPrice={product.originalPrice}
            size="sm"
            showDiscountBadge={false}
          />

          <button
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className="shrink-0 p-2 sm:px-3 sm:py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
