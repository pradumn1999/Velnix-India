import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { PriceDisplay } from '../components/common/PriceDisplay';
import { RatingStars } from '../components/common/RatingStars';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product: any) => {
    // default variants
    const initialVariants: Record<string, string> = {};
    product.variants?.forEach((v: any) => {
      if (v.options?.length > 0) {
        initialVariants[v.name] = v.options[0];
      }
    });
    addToCart(product, 1, initialVariants);
    removeFromWishlist(product.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
      <Breadcrumb items={[{ label: 'Account', href: '/profile' }, { label: 'My Wishlist' }]} />

      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
            My Wishlist ({wishlist.length} {wishlist.length === 1 ? 'item' : 'items'})
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Items saved for future orders with one-click cart transfer
          </p>
        </div>

        {wishlist.length > 0 && (
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-neutral-700 hover:text-neutral-900"
          >
            Add More Items
          </Link>
        )}
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8 text-neutral-400" />}
          title="Your Wishlist is Empty"
          description="Save items you like by tapping the heart icon on any product to easily buy them later."
          actionText="Discover Products"
          actionHref="/products"
          className="my-10"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs flex flex-col justify-between group hover:border-neutral-300 transition-all"
            >
              {/* Image & Quick Action */}
              <div className="relative aspect-square bg-neutral-100 overflow-hidden">
                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => removeFromWishlist(product.id)}
                  aria-label="Remove item"
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-500 hover:text-red-600 flex items-center justify-center shadow-xs transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                <div>
                  <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="sm" />
                  <Link
                    to={`/product/${product.id}`}
                    className="text-xs sm:text-sm font-bold text-neutral-900 hover:text-neutral-600 line-clamp-2 mt-1.5 leading-snug"
                  >
                    {product.name}
                  </Link>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                  <PriceDisplay
                    price={product.price}
                    originalPrice={product.originalPrice}
                    discount={product.discount}
                    size="sm"
                  />

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold"
                    leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                    onClick={() => handleMoveToCart(product)}
                  >
                    Move to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
