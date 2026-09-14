import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, CartItem, ShippingAddress, OrderStatus } from '../types';
import { INITIAL_ORDERS } from '../data/mockOrders';
import { api } from '../services/api';

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  getOrderById: (orderId: string) => Order | undefined;
  createOrder: (orderData: {
    items: CartItem[];
    subtotal: number;
    shipping: number;
    discount: number;
    totalAmount: number;
    paymentMethod: 'Razorpay Online (UPI/Cards)' | 'Cash on Delivery (COD)';
    paymentStatus?: 'Paid' | 'Pending';
    shippingAddress: ShippingAddress;
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('velnix_orders') || localStorage.getItem('novakart_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getOrders();
      if (res && res.success && res.orders) {
        setOrders(res.orders);
        localStorage.setItem('velnix_orders', JSON.stringify(res.orders));
      }
    } catch (err) {
      console.warn('Could not fetch orders from backend, using local orders cache', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  useEffect(() => {
    localStorage.setItem('velnix_orders', JSON.stringify(orders));
  }, [orders]);

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
  };

  const createOrder = async (orderData: {
    items: CartItem[];
    subtotal: number;
    shipping: number;
    discount: number;
    totalAmount: number;
    paymentMethod: 'Razorpay Online (UPI/Cards)' | 'Cash on Delivery (COD)';
    paymentStatus?: 'Paid' | 'Pending';
    shippingAddress: ShippingAddress;
  }): Promise<Order> => {
    try {
      const res = await api.createOrder(orderData);
      if (res && res.success && res.order) {
        setOrders((prev) => [res.order, ...prev.filter((o) => o.id !== res.order.id)]);
        return res.order;
      }
    } catch (err) {
      console.warn('Backend order placement failed, falling back to client order creation', err);
    }

    // Client fallback if backend is unreachable
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const newId = `NK-${randomNum}`;
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const isOnline = orderData.paymentMethod.includes('Razorpay');

    const fallbackOrder: Order = {
      id: newId,
      orderDate: today,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      discount: orderData.discount,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentStatus || (isOnline ? 'Paid' : 'Pending'),
      orderStatus: isOnline ? 'Payment Confirmed' : 'Order Placed',
      shippingAddress: orderData.shippingAddress,
      tracking: {
        trackingNumber: `CJ-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        courierPartner: 'BlueDart Express Priority',
        estimatedDeliveryDate: 'Within 3-4 Business Days',
        checkpoints: [
          {
            status: 'Order Placed',
            label: 'Order Placed',
            date: today,
            time: 'Just now',
            location: 'Customer Storefront',
            description: 'Order registered and queued for fulfillment.',
            completed: true,
            current: !isOnline,
          },
          {
            status: 'Payment Confirmed',
            label: 'Payment Verified',
            date: today,
            time: 'Just now',
            location: isOnline ? 'Razorpay Payment Gateway' : 'COD Verification',
            description: isOnline
              ? 'Authorized payment captured successfully.'
              : 'Pending delivery collection verification.',
            completed: isOnline,
            current: isOnline,
          },
          {
            status: 'Processing',
            label: 'Warehouse Packaging',
            date: 'Pending',
            time: 'Scheduled in 12h',
            location: 'Central Fulfillment Center, Gurugram',
            description: 'Item queue assigned for pick, pack, and barcode generation.',
            completed: false,
            current: false,
          },
          {
            status: 'Shipped',
            label: 'Handover to Courier Partner',
            date: 'Pending',
            time: 'Scheduled in 24h',
            location: 'Air Cargo Departure Bay',
            description: 'AWB generated for express air courier dispatch.',
            completed: false,
            current: false,
          },
          {
            status: 'In Transit',
            label: 'In Transit',
            date: 'Pending',
            time: 'Pending',
            location: `${orderData.shippingAddress.city} Central Hub`,
            description: 'Linehaul vehicle transit to destination city sorting facility.',
            completed: false,
            current: false,
          },
          {
            status: 'Out for Delivery',
            label: 'Out for Delivery',
            date: 'Pending',
            time: 'Pending',
            location: `${orderData.shippingAddress.city} Local Station`,
            description: 'Courier representative dispatched with parcel.',
            completed: false,
            current: false,
          },
          {
            status: 'Delivered',
            label: 'Delivered',
            date: 'Pending',
            time: 'Pending',
            location: orderData.shippingAddress.city,
            description: 'Package delivered with OTP confirmation.',
            completed: false,
            current: false,
          },
        ],
      },
    };

    setOrders((prev) => [fallbackOrder, ...prev]);
    return fallbackOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    try {
      const res = await api.updateOrderStatus(orderId, status);
      if (res && res.success && res.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order! : o)));
        return true;
      }
    } catch (err) {
      console.warn('Backend status update failed, applying locally', err);
    }

    // Local fallback
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          orderStatus: status,
          paymentStatus: status === 'Delivered' ? 'Paid' : o.paymentStatus,
        };
      })
    );
    return true;
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        getOrderById,
        createOrder,
        updateOrderStatus,
        refreshOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
