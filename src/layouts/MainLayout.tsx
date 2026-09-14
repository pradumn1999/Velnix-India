import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { QuickViewModal } from '../components/product/QuickViewModal';

export const MainLayout: React.FC = () => {
  const { pathname } = useLocation();

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/50 text-neutral-900 antialiased font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <QuickViewModal />
    </div>
  );
};
