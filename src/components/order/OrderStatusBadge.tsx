import React from 'react';
import { OrderStatus } from '../../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '' }) => {
  const getStyles = (): string => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Transit':
      case 'Out for Delivery':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Shipped':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Processing':
      case 'Payment Confirmed':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Order Placed':
        return 'bg-neutral-100 text-neutral-800 border-neutral-300';
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStyles()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0 opacity-80" />
      {status}
    </span>
  );
};
