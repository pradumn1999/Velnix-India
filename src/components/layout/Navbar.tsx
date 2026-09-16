import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Truck,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../data/categories';
import { PRODUCTS } from '../../data/products';
import { formatINR } from '../../utils/formatters';
import { VelnixLogo } from '../common/VelnixLogo';

export const Navbar: React.FC = () => {
  const { cartCount, subtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close overlays on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* 1. Micro Editorial Announcement Bar */}
      <div className="bg-neutral-950 text-neutral-300 text-[11px] font-medium tracking-wide py-2 px-4 border-b border-neutral-900/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span className="text-neutral-200">
              Free Express Delivery across India on orders above ₹999
            </span>
            <span className="hidden md:inline text-neutral-500">•</span>
            <span className="hidden md:inline text-neutral-400">Cash on Delivery Available</span>
          </div>

          <div className="hidden sm:flex items-center gap-5 text-[11px] text-neutral-400">
            <Link
              to="/orders"
              className="hover:text-white transition-colors duration-150 flex items-center gap-1.5"
            >
              <Package className="w-3 h-3" />
              <span>Track Shipment</span>
            </Link>
            <span className="text-neutral-700">/</span>
            <span className="hover:text-neutral-200 transition-colors">Pan-India Support</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-neutral-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-17 sm:h-18 gap-4 sm:gap-8">
            
            {/* Left: Mobile Toggle & Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 -ml-2 text-neutral-800 hover:text-neutral-950 rounded-full hover:bg-neutral-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/" className="flex items-center gap-2 group">
                <VelnixLogo variant="full" theme="light" size="sm" />
              </Link>
            </div>

            {/* Center: Search Bar (Desktop) */}
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-md lg:max-w-lg relative">
              <form onSubmit={handleSearchSubmit} className="w-full relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search gadgets, home, lifestyle essentials..."
                  className="w-full pl-10 pr-10 py-2 text-[13px] bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white text-neutral-950 placeholder:text-neutral-600 rounded-full border border-transparent focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-950/10 transition-all"
                />
                <Search className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-950 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Autocomplete Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-neutral-200/80 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
                    Instant Suggestions
                  </div>
                  <div className="flex flex-col gap-1">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        to={`/product/${item.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors"
                      >
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-11 h-11 object-cover rounded-lg border border-neutral-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-neutral-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs font-bold text-neutral-950 mt-0.5">
                            {formatINR(item.price)}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      </Link>
                    ))}
                  </div>
                  <div className="pt-2 mt-1 border-t border-neutral-100">
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full text-center text-xs font-semibold text-neutral-900 hover:text-black py-1.5 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
                    >
                      View all matches for "{searchQuery}" →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Action Icons: Wishlist, Account, Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="relative p-2.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/80 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                aria-label="View Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-neutral-950 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account Menu */}
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100/80 rounded-full transition-colors text-xs font-medium min-w-[44px] min-h-[44px] cursor-pointer"
                  aria-label="User Account"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline font-semibold text-neutral-900">
                    {isAuthenticated ? user?.name.split(' ')[0] : 'Sign In'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-600 hidden md:inline" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-200/80 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {isAuthenticated ? (
                      <>
                        <div className="px-3 py-2 border-b border-neutral-100">
                          <p className="text-xs font-bold text-neutral-950 truncate">{user?.name}</p>
                          <p className="text-[11px] text-neutral-600 truncate">{user?.email}</p>
                        </div>
                        <div className="py-1 flex flex-col gap-0.5">
                          <Link
                            to="/profile"
                            className="px-3 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 rounded-xl transition-colors"
                          >
                            My Profile & Addresses
                          </Link>
                          <Link
                            to="/orders"
                            className="px-3 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 rounded-xl transition-colors"
                          >
                            Orders & Live Tracking
                          </Link>
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin"
                              className="px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors flex items-center justify-between"
                            >
                              <span>Fulfillment Admin</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-neutral-100 pt-1 mt-1">
                          <button
                            type="button"
                            onClick={logout}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 border-b border-neutral-100">
                          <Link
                            to="/login"
                            className="w-full py-2.5 px-3 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold block text-center shadow-xs transition-colors"
                          >
                            Sign In / Register
                          </Link>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/orders"
                            className="block px-3 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-950 hover:bg-neutral-50 rounded-xl transition-colors"
                          >
                            Track Order (Guest)
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart Button */}
              <Link
                to="/cart"
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-full transition-all text-xs font-bold shadow-xs active:scale-[0.98] min-h-[44px] cursor-pointer"
                aria-label="View Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-white text-neutral-950 text-[10px] font-black rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-semibold">
                  {cartCount > 0 ? formatINR(subtotal) : 'Cart'}
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile Search Input */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products across India..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-100 text-neutral-900 rounded-full border border-transparent focus:bg-white focus:border-neutral-900 focus:outline-none"
              />
              <Search className="w-4 h-4 text-neutral-600 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>

          {/* Category Navigation Strip (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 py-2.5 border-t border-neutral-100 text-xs font-medium tracking-tight text-neutral-600">
            <Link
              to="/products"
              className="text-neutral-950 font-bold hover:text-black transition-colors"
            >
              All Products
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="hover:text-neutral-950 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              to="/products?special=trending"
              className="ml-auto text-neutral-950 hover:text-amber-600 font-bold flex items-center gap-1.5 transition-colors"
            >
              {/* <Sparkles className="w-3.5 h-3.5 text-amber-500" /> */}
              <span>Trending Drops</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
              <VelnixLogo variant="full" theme="light" size="sm" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Links */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-6 text-sm">
              <div>
                <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block mb-2.5">
                  Browse Catalog
                </span>
                <div className="flex flex-col gap-1">
                  <Link
                    to="/products"
                    className="py-2.5 px-3 rounded-xl font-semibold text-neutral-900 hover:bg-neutral-100 transition-colors"
                  >
                    All Products
                  </Link>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      className="py-2.5 px-3 rounded-xl font-medium text-neutral-700 hover:bg-neutral-100 flex items-center justify-between transition-colors"
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-neutral-600 font-semibold">{cat.itemCount}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider block mb-2.5">
                  Account & Tracking
                </span>
                <div className="flex flex-col gap-1">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/profile"
                        className="py-2.5 px-3 rounded-xl text-neutral-800 font-medium hover:bg-neutral-100 transition-colors"
                      >
                        Profile & Addresses
                      </Link>
                      <Link
                        to="/orders"
                        className="py-2.5 px-3 rounded-xl text-neutral-800 font-medium hover:bg-neutral-100 transition-colors"
                      >
                        My Orders & Live Courier Tracking
                      </Link>
                      <Link
                        to="/wishlist"
                        className="py-2.5 px-3 rounded-xl text-neutral-800 font-medium hover:bg-neutral-100 transition-colors"
                      >
                        Wishlist ({wishlistCount})
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="py-2.5 px-3 rounded-xl text-emerald-800 font-semibold hover:bg-emerald-50 transition-colors"
                        >
                          Fulfillment Admin Portal
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="py-2.5 px-3 text-left rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors mt-1"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="py-2.5 px-3 rounded-xl font-bold text-white bg-neutral-950 text-center shadow-xs"
                      >
                        Sign In / Register
                      </Link>
                      <Link
                        to="/orders"
                        className="py-2.5 px-3 rounded-xl text-neutral-800 font-medium hover:bg-neutral-100 transition-colors"
                      >
                        Track Shipment (Guest)
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-neutral-100 text-xs text-neutral-600">
                <div className="flex items-center gap-1.5 text-neutral-900 font-semibold mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified CJdropshipping Fulfillment</span>
                </div>
                <p className="text-[11px] text-neutral-600">BlueDart Air & Delhivery Priority Dispatch.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
