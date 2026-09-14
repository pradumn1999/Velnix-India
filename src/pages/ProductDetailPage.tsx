import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Share2,
  MapPin,
  Clock,
  Star,
  Package,
  Check,
} from 'lucide-react';
import { PRODUCTS, MOCK_REVIEWS } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { RatingStars } from '../components/common/RatingStars';
import { PriceDisplay } from '../components/common/PriceDisplay';
import { QuantitySelector } from '../components/common/QuantitySelector';
import { Button } from '../components/common/Button';
import { ProductCard } from '../components/product/ProductCard';
import { getEstimatedDeliveryString, formatINR } from '../utils/formatters';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping' | 'reviews'>('desc');

  // Pincode Delivery Estimator
  const [pincode, setPincode] = useState('560103');
  const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(
    `Delivery by ${getEstimatedDeliveryString(3)} | Express Delivery Available`
  );

  // Initialize selected variants on product load
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImage(0);
    setQuantity(1);
    const initialVariants: Record<string, string> = {};
    product.variants.forEach((v) => {
      if (v.options.length > 0) {
        initialVariants[v.name] = v.options[0];
      }
    });
    setSelectedVariants(initialVariants);
  }, [product.id]);

  const isWishlisted = isInWishlist(product.id);

  const handleVariantSelect = (name: string, option: string) => {
    setSelectedVariants((prev) => ({ ...prev, [name]: option }));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariants);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariants);
    navigate('/checkout');
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      showToast('Please enter a valid 6-digit Indian PIN Code', 'error');
      setDeliveryEstimate(null);
      return;
    }
    const days = pincode.startsWith('1') || pincode.startsWith('5') ? 2 : 4;
    setDeliveryEstimate(
      `Delivery by ${getEstimatedDeliveryString(days)} | Cash on Delivery Available | Express Dispatch`
    );
    showToast(`Serviceable to PIN code ${pincode}`, 'success');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'info');
    }
  };

  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-12 pb-28 sm:pb-16">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Shop', href: '/products' },
          {
            label: product.category.replace('-', ' '),
            href: `/products?category=${product.category}`,
          },
          { label: product.name },
        ]}
      />

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left Column: Image Gallery (6 Cols on Desktop) */}
        <div className="lg:col-span-6 flex flex-col gap-4 sticky top-28">
          {/* Main Large Image */}
          <div className="aspect-[4/5] bg-neutral-100 rounded-3xl overflow-hidden border border-neutral-200/80 relative group shadow-xs">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
              referrerPolicy="no-referrer"
            />

            {/* Editorial Floating Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start pointer-events-none">
              {product.isBestSeller && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-950/90 text-white backdrop-blur-md shadow-xs">
                  Best Seller
                </span>
              )}
              {product.discount > 0 && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Wishlist & Share Floating Glass Actions */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => toggleWishlist(product)}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xs backdrop-blur-md cursor-pointer active:scale-90 ${
                  isWishlisted
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-white/90 text-neutral-700 hover:text-rose-600 hover:bg-white border border-neutral-200/60'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 stroke-rose-600' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                aria-label="Share product"
                className="w-10 h-10 rounded-full bg-white/90 text-neutral-700 hover:text-neutral-950 hover:bg-white flex items-center justify-center transition-all shadow-xs border border-neutral-200/60 cursor-pointer active:scale-90"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedImage === idx
                      ? 'border-neutral-950 shadow-sm scale-102'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Conversion Actions (6 Cols on Desktop) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Header & Title */}
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1.5">
              <span>SKU: {product.sku}</span>
              <span>•</span>
              <span className="text-neutral-900 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>CJdropshipping Verified</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-950 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Stock Status */}
            <div className="flex items-center gap-3 mt-3">
              <RatingStars
                rating={product.rating}
                reviewCount={product.reviewCount}
                showNumber
                size="md"
              />
              <span className="text-neutral-300">•</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                In Stock ({product.stock} units ready)
              </span>
            </div>
          </div>

          {/* Price Card */}
          <div className="p-5 sm:p-6 bg-white rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col gap-2">
            <PriceDisplay
              price={product.price}
              originalPrice={product.originalPrice}
              discount={product.discount}
              size="xl"
            />
            <p className="text-xs text-neutral-500 font-normal leading-relaxed">
              Inclusive of all GST & taxes. Free Express Pan-India Delivery on orders above ₹999.
            </p>
          </div>

          {/* Variant Selectors */}
          {product.variants.map((variant) => (
            <div key={variant.id} className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
                  Select {variant.name}:
                </span>
                <span className="font-bold text-neutral-950">
                  {selectedVariants[variant.name]}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {variant.options.map((opt) => {
                  const isSelected = selectedVariants[variant.name] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleVariantSelect(variant.name, opt)}
                      className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                          : 'border-neutral-300 text-neutral-800 hover:border-neutral-950 bg-white'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity & CTA Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider mb-1">
                  Quantity
                </span>
                <QuantitySelector
                  quantity={quantity}
                  max={product.stock}
                  onChange={setQuantity}
                />
              </div>

              <div className="flex-1 pt-5">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold min-h-[48px]"
                  leftIcon={<ShoppingBag className="w-4 h-4" />}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* Buy Now Button */}
            <Button
              variant="secondary"
              size="lg"
              className="w-full bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold border-0 shadow-md min-h-[48px]"
              leftIcon={<Zap className="w-4 h-4 text-neutral-950 fill-neutral-950" />}
              onClick={handleBuyNow}
            >
              Buy Now (Instant Checkout)
            </Button>
          </div>

          {/* Pincode Delivery Estimator */}
          <div className="p-5 rounded-3xl border border-neutral-200/80 bg-white flex flex-col gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-950">
              <MapPin className="w-4 h-4 text-neutral-500" />
              <span>Check Delivery & Cash on Delivery Availability</span>
            </div>

            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit Indian PIN Code"
                className="flex-1 px-4 py-2 text-xs border border-neutral-300 rounded-full focus:border-neutral-950 focus:outline-none"
              />
              <Button type="submit" variant="outline" size="sm" className="font-bold px-4">
                Check
              </Button>
            </form>

            {deliveryEstimate && (
              <div className="flex items-start gap-2.5 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-2xl border border-emerald-200/80 font-medium">
                <Truck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{deliveryEstimate}</span>
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-1 text-xs text-neutral-700">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-neutral-200/80 font-semibold">
              <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
              <span>{product.shippingInfo.dispatchTime}</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-neutral-200/80 font-semibold">
              <RotateCcw className="w-4 h-4 text-neutral-500 shrink-0" />
              <span>{product.returnPolicy}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description, Specifications, Shipping, Reviews */}
      <div className="mt-8 border-t border-neutral-200/80 pt-10">
        <div className="flex items-center gap-8 border-b border-neutral-200/80 overflow-x-auto scrollbar-none">
          {[
            { id: 'desc', label: 'Product Description' },
            { id: 'specs', label: 'Specifications' },
            { id: 'shipping', label: 'Shipping & Returns' },
            { id: 'reviews', label: `Verified Reviews (${product.reviewCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px cursor-pointer ${
                activeTab === tab.id
                  ? 'border-neutral-950 text-neutral-950'
                  : 'border-transparent text-neutral-400 hover:text-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {/* Tab 1: Description */}
          {activeTab === 'desc' && (
            <div className="flex flex-col gap-6 max-w-3xl">
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-normal">
                {product.description}
              </p>
              <div className="pt-2">
                <h4 className="text-xs font-extrabold text-neutral-950 uppercase tracking-wider mb-3">
                  Key Product Highlights
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-neutral-700">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-neutral-50 border border-neutral-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="font-medium">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === 'specs' && (
            <div className="max-w-2xl border border-neutral-200/80 rounded-2xl overflow-hidden divide-y divide-neutral-200/80 text-xs sm:text-sm bg-white shadow-xs">
              {product.specifications.map((spec, idx) => (
                <div key={idx} className="flex py-3.5 px-5 bg-white even:bg-neutral-50/60">
                  <span className="w-1/3 font-semibold text-neutral-500">{spec.label}</span>
                  <span className="w-2/3 text-neutral-950 font-bold">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Shipping & Returns */}
          {activeTab === 'shipping' && (
            <div className="max-w-3xl flex flex-col gap-4 text-xs sm:text-sm text-neutral-700 leading-relaxed">
              <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 flex flex-col gap-2 shadow-xs">
                <h4 className="font-bold text-neutral-950 text-sm">Pan-India Express Logistics</h4>
                <p className="text-neutral-600">
                  Orders are dispatched via our domestic express logistics partners:{' '}
                  <strong className="text-neutral-950">{product.shippingInfo.courierPartners.join(', ')}</strong>. Real-time
                  tracking links with live milestone updates are provided immediately upon courier manifest generation.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 flex flex-col gap-2 shadow-xs">
                <h4 className="font-bold text-neutral-950 text-sm">7-Day Doorstep Replacement</h4>
                <p className="text-neutral-600">
                  If you receive an item that is damaged during transit, defective, or incorrect,
                  you can initiate a replacement request within 7 days of delivery.
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: Customer Reviews */}
          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-6 max-w-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-neutral-950">Customer Ratings</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingStars rating={product.rating} size="md" />
                    <span className="text-sm font-bold text-neutral-950">
                      {product.rating} out of 5
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    showToast('Review submission form will be linked to your account.', 'info')
                  }
                  className="font-bold"
                >
                  Write a Review
                </Button>
              </div>

              <div className="divide-y divide-neutral-200/80">
                {MOCK_REVIEWS.map((rev) => (
                  <div key={rev.id} className="py-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-950">{rev.userName}</span>
                        <span className="text-neutral-400">• {rev.userCity}</span>
                      </div>
                      <span className="text-neutral-400 font-medium">{rev.date}</span>
                    </div>
                    <RatingStars rating={rev.rating} size="sm" />
                    <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-neutral-200/80">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-950 mb-6 tracking-tight">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Buy Action Bar (Instant Ergonomic Conversion on Phones) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 z-40 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-col pl-1">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">Total</span>
          <span className="text-base font-black text-neutral-950 leading-none">
            {formatINR(product.price * quantity)}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 font-bold py-2.5"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 bg-amber-400 text-neutral-950 hover:bg-amber-300 font-extrabold border-0 py-2.5 shadow-xs"
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};
