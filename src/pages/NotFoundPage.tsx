import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-900 font-black text-2xl">
          404
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2 leading-relaxed">
            The page you are looking for might have been moved, renamed, or is temporarily
            unavailable in our catalog.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/">
            <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" leftIcon={<ShoppingBag className="w-4 h-4" />}>
              Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
