/** @jsx React.createElement */
/** @jsxRuntime classic */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { OrderCard } from '../components/order/OrderCard';
import { EmptyState } from '../components/common/EmptyState';

type OrdersPageOrder = {
  id: string;
  orderStatus: string;
  trackingNumber?: string;
  items: Array<{ product: { name: string } }>;
};

export const OrdersPage: React.FC = () => {
  const { orders } = useOrders();
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order: OrdersPageOrder) => {
    // Status
    if (statusFilter === 'active') {
      if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
        return false;
      }
    } else if (statusFilter === 'delivered') {
      if (order.orderStatus !== 'Delivered') {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchTracking = order.trackingNumber?.toLowerCase().includes(q);
      const matchItems = order.items.some((i) =>
        i.product.name.toLowerCase().includes(q)
      );
      if (!matchId && !matchTracking && !matchItems) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col gap-8">
      <Breadcrumb items={[{ label: 'Account', href: '/profile' }, { label: 'My Orders' }]} />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            My Orders & Tracking
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-normal">
            Real-time status updates synced with BlueDart, Delhivery & CJdropshipping
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: `All Orders (${orders.length})` },
            {
              id: 'active',
              label: `Active / In Transit (${
                orders.filter(
                  (o: OrdersPageOrder) =>
                    o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
                ).length
              })`,
            },
            {
              id: 'delivered',
              label: `Delivered (${
                orders.filter((o: OrdersPageOrder) => o.orderStatus === 'Delivered').length
              })`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-neutral-950 text-white shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search within orders */}
      {orders.length > 0 && (
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            placeholder="Search by Order ID, Product, or Tracking Number..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-neutral-300 rounded-full focus:border-neutral-950 focus:outline-none shadow-xs"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
      )}

      {/* Order List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8 text-neutral-400" />}
          title={searchQuery ? 'No Orders Match Your Search' : 'No Orders Found'}
          description={
            searchQuery
              ? 'Try searching with a different order ID or keyword.'
              : "You haven't placed any orders yet. Check out our latest arrivals and place your first order!"
          }
          actionText={searchQuery ? 'Clear Search' : 'Start Shopping'}
          actionHref={searchQuery ? undefined : '/products'}
          onActionClick={searchQuery ? () => setSearchQuery('') : undefined}
          className="my-8"
        />
      ) : (
        <div className="flex flex-col gap-5">
          {filteredOrders.map((order: OrdersPageOrder) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};
