import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  RotateCcw,
  Truck,
  CreditCard,
  Mail,
  ArrowRight,
  CheckCircle2,
  Phone,
  MapPin,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { VelnixLogo } from '../common/VelnixLogo';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    setIsSubscribed(true);
    showToast('Subscribed! Use coupon WELCOME10 for 10% off your first order.', 'success');
  };

  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-12 pb-8 border-t border-neutral-800">
      {/* Trust Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-neutral-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">100% Quality Checked</h4>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                Every unit inspected before Indian warehouse dispatch
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">7-Day Replacement</h4>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                Zero hassle exchange guarantee on defective products
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-blue-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Express Pan-India</h4>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                Fast air shipping via BlueDart, Delhivery & Shadowfax
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-purple-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Secure Payments</h4>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                Razorpay 256-Bit SSL Encrypted UPI, Cards & COD
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Bio */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="inline-block">
              <VelnixLogo variant="badge" size="sm" className="bg-[#381219] hover:opacity-95 transition-opacity" />
            </Link>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
              Velnix Fashion Apparel & Lifestyle is a modern Indian retailer bringing curated, trending
              lifestyle innovations directly to your doorstep. Powered by automated fulfillment with localized quality checks and express delivery.
            </p>

            <div className="flex flex-col gap-2 text-xs text-neutral-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>Sector 44, Gurugram, Haryana 122003, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>+91 11 4084 9200 (Mon–Sat, 10 AM – 7 PM IST)</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Shop Categories
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link to="/products?category=electronics" className="hover:text-white transition-colors">
                  Electronics & Audio
                </Link>
              </li>
              <li>
                <Link to="/products?category=home-kitchen" className="hover:text-white transition-colors">
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link to="/products?category=fitness" className="hover:text-white transition-colors">
                  Fitness & Wellness
                </Link>
              </li>
              <li>
                <Link to="/products?category=accessories" className="hover:text-white transition-colors">
                  Watches & Accessories
                </Link>
              </li>
              <li>
                <Link to="/products?category=beauty" className="hover:text-white transition-colors">
                  Beauty & Skincare
                </Link>
              </li>
              <li>
                <Link to="/products?category=lifestyle" className="hover:text-white transition-colors">
                  Modern Lifestyle
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Customer Support
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition-colors">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  Shipping & Delivery Timeline
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Account Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Special Offers & Drops
            </h4>
            <p className="text-xs text-neutral-400">
              Subscribe to get exclusive dropship launch discounts and early access.
            </p>

            {isSubscribed ? (
              <div className="p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Coupon code WELCOME10 saved to your account!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-3 pr-9 py-2 text-xs bg-neutral-800 text-white rounded-lg border border-neutral-700 focus:border-neutral-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[11px] text-neutral-500">
                  Instant ₹250 / 10% coupon on signup.
                </span>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Payment Partner Badges & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <div>
          © {new Date().getFullYear()} Velnix India Pvt Ltd. All rights reserved.
        </div>

        {/* Payment logos / badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
            UPI / QR
          </span>
          <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
            Razorpay
          </span>
          <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
            RuPay
          </span>
          <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
            Visa / Master
          </span>
          <span className="px-2 py-1 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
            NetBanking
          </span>
          <span className="px-2 py-1 rounded bg-neutral-800 text-emerald-400 border border-neutral-700">
            Cash on Delivery
          </span>
        </div>
      </div>
    </footer>
  );
};
