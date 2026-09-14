import React from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../../types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatINR } from '../../utils/formatters';
import { Button } from '../common/Button';
import { Truck, Eye } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  className?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, className = '' }) => {
  return (
    <div
      id={`order-card-${order.id}`}
      className={`bg-white rounded-3xl border border-neutral-200/80 overflow-hidden shadow-xs hover:border-neutral-300 transition-all ${className}`}
    >
      {/* Header bar */}
      <div className="p-5 sm:p-6 bg-neutral-50/70 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
              Order ID
            </span>
            <span className="font-extrabold text-neutral-950 font-mono text-xs sm:text-sm">
              {order.id}
            </span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
              Date Placed
            </span>
            <span className="font-semibold text-neutral-800">{order.orderDate}</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider">
              Total Amount
            </span>
            <span className="font-extrabold text-neutral-950">{formatINR(order.totalAmount)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.orderStatus} />
        </div>
      </div>

      {/* Items list */}
      <div className="p-5 sm:p-6 flex flex-col divide-y divide-neutral-100">
        {order.items.map((item, idx) => (
          <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-14 h-16 sm:w-16 sm:h-20 object-cover rounded-2xl border border-neutral-200/80 shrink-0 bg-neutral-100"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <Link
                  to={`/product/${item.product.id}`}
                  className="text-xs sm:text-sm font-bold text-neutral-950 hover:text-neutral-600 line-clamp-1"
                >
                  {item.product.name}
                </Link>
                <div className="text-xs text-neutral-500 mt-1">
                  Qty: <span className="font-bold text-neutral-800">{item.quantity}</span>
                  {Object.entries(item.selectedVariants).map(([k, v]) => (
                    <span key={k} className="ml-2 font-medium">
                      • {k}: {v}
                    </span>
                  ))}
                </div>
                <div className="text-xs font-black text-neutral-950 mt-1.5">
                  {formatINR(item.product.price * item.quantity)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="p-5 sm:p-6 bg-neutral-50/40 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-neutral-500 font-medium">
          Paid via <span className="font-bold text-neutral-800">{order.paymentMethod}</span> ({order.paymentStatus})
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/order-details/${order.id}`}>
            <Button variant="outline" size="sm" className="font-bold rounded-full" leftIcon={<Eye className="w-3.5 h-3.5" />}>
              View Details
            </Button>
          </Link>
          <Link to={`/track-order/${order.id}`}>
            <Button variant="primary" size="sm" className="font-bold rounded-full bg-neutral-950 hover:bg-neutral-800" leftIcon={<Truck className="w-3.5 h-3.5" />}>
              Track Order
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
