import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Heart,
  ArrowRight,
  ShieldCheck,
  Tag,
  Truck,
  ShoppingBag,
  X,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { QuantitySelector } from '../components/common/QuantitySelector';
import { PriceDisplay } from '../components/common/PriceDisplay';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { ProductCard } from '../components/product/ProductCard';
import { PRODUCTS, AVAILABLE_COUPONS } from '../data/products';
import { formatINR } from '../utils/formatters';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    moveToWishlist,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discount,
    shipping,
    grandTotal,
    cartCount,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code.trim()) return;

    setCouponError('');
    const res = applyCoupon(code);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const recommendedProducts = PRODUCTS.filter(
    (p) => !cart.some((item) => item.product.id === p.id)
  ).slice(0, 4);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Breadcrumb items={[{ label: 'Shopping Bag' }]} />
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-neutral-400" />}
          title="Your Shopping Bag is Empty"
          description="Explore our curated catalog of verified high-utility innovations with express Pan-India shipping."
          actionText="Explore Trending Products"
          actionHref="/products"
          className="my-10"
        />

        {recommendedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl font-extrabold text-neutral-950 mb-6 tracking-tight">
              Popular Trending Drops
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recommendedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const freeShippingProgress = Math.min(100, Math.round((subtotal / 999) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-8">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Shopping Bag' }]} />

      <div className="flex items-center justify-between pb-4 border-b border-neutral-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            Shopping Bag ({cartCount} {cartCount === 1 ? 'item' : 'items'})
          </h1>
        </div>
        <Link
          to="/products"
          className="text-xs sm:text-sm font-bold text-neutral-600 hover:text-neutral-950 transition-colors"
        >
          Continue Shopping &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Cart Items (8 cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Free Shipping Progress Notification */}
          <div className="p-4 rounded-3xl bg-neutral-950 text-white flex flex-col gap-2.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {subtotal >= 999 ? (
                    <span className="text-amber-400 font-bold">
                      Unlocked: Free Express Pan-India Air Shipping!
                    </span>
                  ) : (
                    <span>
                      Add <strong className="text-white font-bold">{formatINR(999 - subtotal)}</strong> more for Free Express Shipping
                    </span>
                  )}
                </span>
              </div>
              <span className="text-neutral-400 font-mono text-[11px]">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items Container */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 divide-y divide-neutral-100 overflow-hidden shadow-xs">
            {cart.map((item, idx) => (
              <div
                key={`${item.product.id}-${idx}`}
                className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:bg-neutral-50/40 transition-colors"
              >
                {/* Product Meta */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Link to={`/product/${item.product.id}`} className="shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-2xl border border-neutral-200/80 bg-neutral-100"
                      referrerPolicy="no-referrer"
                    />
                  </Link>

                  <div className="flex flex-col gap-1.5 min-w-0">
                    <Link
                      to={`/product/${item.product.id}`}
                      className="text-xs sm:text-sm font-bold text-neutral-950 hover:text-neutral-600 line-clamp-2 leading-snug tracking-tight"
                    >
                      {item.product.name}
                    </Link>

                    {/* Selected Variants */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
                      {Object.entries(item.selectedVariants).map(([key, val]) => (
                        <span
                          key={key}
                          className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 font-medium text-[11px]"
                        >
                          {key}: {val}
                        </span>
                      ))}
                    </div>

                    {/* Unit Price */}
                    <div>
                      <PriceDisplay
                        price={item.product.price}
                        originalPrice={item.product.originalPrice}
                        size="sm"
                        showDiscountBadge={false}
                      />
                    </div>
                  </div>
                </div>

                {/* Quantity Controls & Action Buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                  <div className="flex items-center gap-3">
                    <QuantitySelector
                      quantity={item.quantity}
                      max={item.product.stock}
                      onChange={(newQty) =>
                        updateQuantity(item.product.id, item.selectedVariants, newQty)
                      }
                      size="sm"
                    />

                    <div className="text-sm font-bold text-neutral-950 sm:hidden">
                      {formatINR(item.product.price * item.quantity)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <button
                      onClick={() => moveToWishlist(item)}
                      className="text-neutral-500 hover:text-neutral-950 flex items-center gap-1 transition-colors font-medium cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Save for Later</span>
                    </button>

                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedVariants)}
                      className="text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout (4 cols on desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-5 sticky top-28">
          {/* Coupon Code Section */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center gap-2 text-xs font-extrabold text-neutral-950 uppercase tracking-wider">
              <Tag className="w-4 h-4 text-neutral-600" />
              <span>Coupon Code</span>
            </div>

            {appliedCoupon ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900">
                    {appliedCoupon.code} Applied
                  </span>
                  <p className="text-[11px] text-emerald-700 font-medium">{appliedCoupon.description}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="p-1 text-emerald-800 hover:text-rose-600 cursor-pointer"
                  aria-label="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Enter code (e.g. VELNIX10)"
                    className="flex-1 px-3.5 py-2 text-xs font-mono uppercase border border-neutral-300 rounded-full focus:border-neutral-950 focus:outline-none"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-bold px-4"
                    onClick={() => handleApplyCoupon()}
                  >
                    Apply
                  </Button>
                </div>

                {couponError && (
                  <p className="text-xs text-rose-600 font-medium">{couponError}</p>
                )}

                {/* Available Coupon Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {AVAILABLE_COUPONS.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => handleApplyCoupon(c.code)}
                      className="px-2.5 py-1 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-mono font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col gap-5">
            <h3 className="text-xs font-extrabold text-neutral-950 uppercase tracking-wider pb-3 border-b border-neutral-100">
              Order Summary
            </h3>

            <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal ({cartCount} items)</span>
                <span className="font-bold text-neutral-950">{formatINR(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- {formatINR(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Express Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="font-bold text-emerald-700 uppercase">FREE</span>
                  ) : (
                    formatINR(shipping)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-200/80 flex justify-between items-baseline">
                <span className="text-sm sm:text-base font-extrabold text-neutral-950">
                  Total Amount
                </span>
                <span className="text-xl font-black text-neutral-950">
                  {formatINR(grandTotal)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-extrabold shadow-md min-h-[48px]"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 pt-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Secure 256-Bit SSL Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <section className="pt-10 border-t border-neutral-200/80">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-950 mb-6 tracking-tight">
            Frequently Bought Together
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recommendedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
