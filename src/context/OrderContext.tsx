import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order, CartItem, ShippingAddress, OrderStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  getOrderById: (orderId: string) => Order | undefined;
  createOrder: (orderData: {
    customerEmail: string;
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
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.getOrders({ email: user.email, role: user.role });
      if (res && res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.warn('Could not fetch orders from backend', err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const getOrderById = (orderId: string) => {
    return orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
  };

  const createOrder = async (orderData: {
    customerEmail: string;
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
      console.warn('Backend order placement failed', err);
    }

    throw new Error('Order could not be saved to the server. Please try again.');
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
    try {
      const res = await api.updateOrderStatus(orderId, status, user?.role || 'customer');
      if (res && res.success && res.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order! : o)));
        return true;
      }
    } catch (err) {
      console.warn('Backend status update failed', err);
    }

    return false;
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
