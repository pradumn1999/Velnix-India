// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  TrendingUp,
  Award,
  ChevronRight,
  Star,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryCard } from '../components/product/CategoryCard';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS, MOCK_REVIEWS } from '../data/products';
import { formatINR } from '../utils/formatters';
import { VelnixLogo } from '../components/common/VelnixLogo';

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [heroProductIndex, setHeroProductIndex] = useState(0);

  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller);
  const heroProducts = PRODUCTS.filter((p) => p.isTrending).slice(0, 5);
  const heroProduct = heroProducts[heroProductIndex] || PRODUCTS[0];

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setHeroProductIndex((current) => (current + 1) % heroProducts.length);
    }, 3800);

    return () => window.clearInterval(rotation);
  }, [heroProducts.length]);
  const filteredProducts =
    activeTab === 'all'
      ? PRODUCTS.slice(0, 8)
      : PRODUCTS.filter((p) => p.category === activeTab).slice(0, 8);

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 5000);
    }
  };

  return (
    <div className="flex flex-col gap-16 sm:gap-24 pb-20">
      {/* 1. Hero Section (Editorial, High-Impact Modern Aesthetics) */}
      <section className="relative bg-neutral-950 text-white overflow-hidden">
        {/* Subtle optical radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Bold Headline & Editorial Copy */}
            <div className="lg:col-span-7 flex flex-col items-start gap-6 sm:gap-7">
              {/* <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#381219]/90 border border-[#5a1e2a] text-[11px] font-bold text-[#f5efe6] tracking-wide shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Velnix Official Store • Express Pan-India Transit</span>
              </div> */}

              <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-black tracking-[-0.035em] leading-[1.08] text-white">
                Curated products <br className="hidden sm:inline" />
                for modern living.
              </h1>

              <p className="text-base sm:text-lg text-neutral-400 max-w-xl leading-relaxed font-normal">
                Carefully selected innovative audio, ergonomic tech, and thoughtful home lifestyle drops.
                Directly synchronized with automated fulfillment and delivered across India in 2–4 business days.
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2 w-full sm:w-auto">
                <Link to="/products" className="w-full sm:w-auto">
                  <Button
                    variant="white"
                    size="lg"
                    className="w-full sm:w-auto min-w-[160px] shadow-lg"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Shop Now
                  </Button>
                </Link>
                <Link to="/products?special=trending" className="w-full sm:w-auto">
                  <Button
                    variant="darkOutline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Explore Products
                  </Button>
                </Link>
              </div>

              {/* Key Trust Stats Lockup */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-neutral-900 w-full max-w-lg text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">50,000+</div>
                  <div className="text-xs text-neutral-500 mt-1 font-medium">Orders Delivered</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">4.8 / 5.0</div>
                  <div className="text-xs text-neutral-500 mt-1 font-medium">Customer Rating</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">24h Dispatch</div>
                  <div className="text-xs text-neutral-500 mt-1 font-medium">BlueDart & Delhivery</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-neutral-800/80 shadow-2xl bg-neutral-900 aspect-[4/5] sm:aspect-square lg:aspect-[4/5]">
                <img
                  key={heroProduct.id}
                  src={heroProduct.images[0]}
                  alt={heroProduct.name}
                  className="w-full h-full object-cover transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                {/* Floating Product Callout */}
                <div className="absolute bottom-5 left-5 right-5 p-5 rounded-2xl bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-0.5">
                      Featured Drop
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-white truncate max-w-[180px] sm:max-w-xs">
                      {heroProduct.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-extrabold text-white">{formatINR(heroProduct.price)}</span>
                      <span className="line-through text-neutral-500 text-xs font-medium">{formatINR(heroProduct.originalPrice)}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        {heroProduct.discount}% OFF
                      </span>
                    </div>
                  </div>
                  <Link to={`/product/${heroProduct.id}`}>
                    <Button
                      variant="white"
                      size="sm"
                      className="px-4"
                    >
                      View
                    </Button>
                  </Link>
                </div>

                <div className="absolute top-4 left-4 right-4 overflow-hidden rounded-xl border border-white/15 bg-black/20 backdrop-blur-sm">
                  <div className="flex w-max gap-2 p-2 animate-hero-marquee">
                    {[...heroProducts, ...heroProducts].map((product, index) => (
                      <button
                        key={`${product.id}-${index}`}
                        type="button"
                        onClick={() => setHeroProductIndex(index % heroProducts.length)}
                        aria-label={`Show ${product.name}`}
                        className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          product.id === heroProduct.id ? 'border-white scale-105' : 'border-white/20 opacity-65'
                        }`}
                      >
                        <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="absolute bottom-28 left-5 flex items-center gap-1.5" aria-label="Featured product slides">
                  {heroProducts.map((product, index) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setHeroProductIndex(index)}
                      aria-label={`Show slide ${index + 1}`}
                      className={`h-1.5 rounded-full transition-all ${index === heroProductIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Featured Collections (Editorial Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-neutral-200/80">
          <div>
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
              Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-neutral-950 hover:text-neutral-600 flex items-center gap-1 group transition-colors"
          >
            <span>View All Collections</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* 3. Trending Drops with Clean Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-neutral-200/80">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-neutral-900" />
              <span>Trending in India</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
              Popular Picks This Week
            </h2>
          </div>

          {/* Clean Tactile Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'bg-white border border-neutral-200/80 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
              }`}
            >
              All Items
            </button>
            {CATEGORIES.slice(0, 4).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.slug)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === cat.slug
                    ? 'bg-neutral-950 text-white shadow-xs'
                    : 'bg-white border border-neutral-200/80 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
                }`}
              >
                {cat.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Editorial Flash Sale Banner (Clean & High-Contrast) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-neutral-950 text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden border border-neutral-800">
          <div className="relative z-10 max-w-xl flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/10 text-white border border-white/20 w-max backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Seasonal Advantage Drop</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Up to 50% Off on Top Tech & Lifestyle
            </h2>

            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-normal">
              Apply code <code className="text-white font-bold bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">WELCOME10</code> at
              checkout for an extra 10% instant discount. Cash on Delivery and Pan-India express logistics guaranteed.
            </p>

            <div className="pt-3">
              <Link to="/products?special=offers">
                <Button
                  variant="white"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Grab Special Deals
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8 pb-4 border-b border-neutral-200/80">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
              Best Selling Innovations
            </h2>
          </div>
          <Link
            to="/products?special=bestsellers"
            className="text-xs sm:text-sm font-bold text-neutral-950 hover:text-neutral-600 flex items-center gap-1 group transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. Why Choose Velnix (Modern Unified Pillars) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center">
          <VelnixLogo variant="badge" size="sm" className="mb-4" />
          <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
            Why Choose Velnix India?
          </h2>
          <p className="text-sm text-neutral-600 mt-2.5 leading-relaxed">
            Direct global manufacturer dropshipping integrated with Indian domestic standards, localized support, and transparent logistics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 flex flex-col gap-3.5 hover:border-neutral-400 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-950">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-950">
              CJdropshipping Direct Sync
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Real-time inventory mapping and quality validation directly from accredited manufacturing facilities.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 flex flex-col gap-3.5 hover:border-neutral-400 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-950">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-950">
              Express Air Transit
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Air priority partnerships with BlueDart, Delhivery, and Shadowfax ensure 2–4 business days delivery.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 flex flex-col gap-3.5 hover:border-neutral-400 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-950">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-950">
              7-Day Doorstep Replacement
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Dispatched items backed by a hassle-free 7-day door-to-door replacement warranty.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 flex flex-col gap-3.5 hover:border-neutral-400 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-950">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-neutral-950">
              Razorpay & COD Security
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              100% encrypted checkout via UPI (GPay, PhonePe, Paytm), NetBanking, cards, or Cash on Delivery.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Believable Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-neutral-200/80">
          <div>
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
              Verified Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight mt-1">
              What Indian Shoppers Say
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
            <div className="flex items-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <span className="font-bold text-neutral-950">4.8 / 5.0</span>
            <span className="text-neutral-600">• Based on 1,800+ verified customer reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {MOCK_REVIEWS.map((review) => (
            <div
              key={review.id}
              className="p-6 rounded-2xl bg-white border border-neutral-200/80 flex flex-col justify-between gap-5 hover:border-neutral-300 transition-colors"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed font-medium">
                  "{review.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-neutral-950 block">{review.userName}</span>
                  <span className="text-[11px] text-neutral-600">{review.userCity}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Minimalist Newsletter Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl bg-neutral-100 p-8 sm:p-12 border border-neutral-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-md">
            <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest block mb-1">
              Exclusive Member Drops
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-950 tracking-tight">
              Get 10% off your next order
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
              Subscribe to receive private launch alerts, early access discounts, and weekly trending product roundups.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md w-full">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="px-4 py-2.5 rounded-full text-xs sm:text-sm bg-white border border-neutral-300 focus:border-neutral-950 focus:outline-none flex-1 text-neutral-950 placeholder:text-neutral-600"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="bg-neutral-950 text-white hover:bg-neutral-800 shrink-0 font-bold"
            >
              {newsletterSuccess ? 'Subscribed!' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};
