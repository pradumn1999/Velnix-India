import { Product, Order, OrderStatus, TrackingCheckpoint, CartItem, ShippingAddress } from '../../src/types';
import { PRODUCTS } from '../../src/data/products';
import { INITIAL_ORDERS } from '../../src/data/mockOrders';

// In-Memory Database Store for NovaKart
class DataStore {
  private products: Product[];
  private orders: Order[];
  private cjConfig: {
    apiKey: string;
    email: string;
    isConnected: boolean;
    lastSyncTime: string;
    warehouseBalanceINR: number;
  };
  private pincodeData: Record<string, { city: string; state: string; days: number; codAvailable: boolean }>;

  constructor() {
    this.products = JSON.parse(JSON.stringify(PRODUCTS));
    this.orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
    this.cjConfig = {
      apiKey: process.env.CJ_API_KEY || 'sandbox_cj_live_secret_key_849201',
      email: process.env.CJ_API_EMAIL || 'pradumn@novakart.in',
      isConnected: true,
      lastSyncTime: new Date().toISOString(),
      warehouseBalanceINR: 48500,
    };

    // Indian PIN codes lookup map
    this.pincodeData = {
      '560001': { city: 'Bengaluru', state: 'Karnataka', days: 2, codAvailable: true },
      '560103': { city: 'Bengaluru', state: 'Karnataka', days: 2, codAvailable: true },
      '110001': { city: 'New Delhi', state: 'Delhi', days: 2, codAvailable: true },
      '110020': { city: 'New Delhi', state: 'Delhi', days: 2, codAvailable: true },
      '400001': { city: 'Mumbai', state: 'Maharashtra', days: 3, codAvailable: true },
      '400050': { city: 'Mumbai', state: 'Maharashtra', days: 3, codAvailable: true },
      '600001': { city: 'Chennai', state: 'Tamil Nadu', days: 3, codAvailable: true },
      '700001': { city: 'Kolkata', state: 'West Bengal', days: 4, codAvailable: true },
      '500001': { city: 'Hyderabad', state: 'Telangana', days: 3, codAvailable: true },
      '411001': { city: 'Pune', state: 'Maharashtra', days: 3, codAvailable: true },
      '380001': { city: 'Ahmedabad', state: 'Gujarat', days: 3, codAvailable: true },
      '302001': { city: 'Jaipur', state: 'Rajasthan', days: 3, codAvailable: true },
      '226001': { city: 'Lucknow', state: 'Uttar Pradesh', days: 4, codAvailable: true },
      '122001': { city: 'Gurugram', state: 'Haryana', days: 2, codAvailable: true },
      '201301': { city: 'Noida', state: 'Uttar Pradesh', days: 2, codAvailable: true },
    };
  }

  // --- Products ---
  public getProducts(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStockOnly?: boolean;
    sortBy?: string;
  }): Product[] {
    let result = [...this.products];

    if (params?.category && params.category !== 'all') {
      result = result.filter(
        (p) => p.category.toLowerCase() === params.category!.toLowerCase()
      );
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params?.minPrice !== undefined) {
      result = result.filter((p) => p.price >= params.minPrice!);
    }
    if (params?.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= params.maxPrice!);
    }

    if (params?.minRating !== undefined && params.minRating > 0) {
      result = result.filter((p) => p.rating >= params.minRating!);
    }

    if (params?.inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    if (params?.sortBy) {
      switch (params.sortBy) {
        case 'price-low-high':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-high-low':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          result.reverse();
          break;
        case 'popularity':
        default:
          result.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
      }
    }

    return result;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find(
      (p) => p.id.toLowerCase() === id.toLowerCase() || p.sku.toLowerCase() === id.toLowerCase()
    );
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.products[idx] = { ...this.products[idx], ...updates };
    return this.products[idx];
  }

  public addProduct(product: Product): Product {
    this.products.unshift(product);
    return product;
  }

  // --- CJdropshipping Catalog Sync ---
  public syncCJInventory(): { syncedCount: number; timestamp: string } {
    // Simulate real-time stock sync with CJdropshipping servers
    this.products = this.products.map((p) => {
      // randomly fluctuate stock slightly to emulate live inventory feed
      const variance = Math.floor(Math.random() * 5) - 2;
      const updatedStock = Math.max(5, p.stock + variance);
      return {
        ...p,
        stock: updatedStock,
      };
    });
    this.cjConfig.lastSyncTime = new Date().toISOString();
    return {
      syncedCount: this.products.length,
      timestamp: this.cjConfig.lastSyncTime,
    };
  }

  public getCJConfig() {
    return {
      ...this.cjConfig,
      totalCatalogItems: this.products.length,
    };
  }

  // --- Orders ---
  public getOrders(customerEmail?: string): Order[] {
    if (!customerEmail) return this.orders;
    const normalizedEmail = customerEmail.trim().toLowerCase();
    return this.orders.filter((order) => order.customerEmail?.toLowerCase() === normalizedEmail);
  }

  public getOrderById(orderId: string): Order | undefined {
    return this.orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
  }

  public createOrder(orderData: {
    customerEmail: string;
    items: CartItem[];
    subtotal: number;
    shipping: number;
    discount: number;
    totalAmount: number;
    paymentMethod: 'Razorpay Online (UPI/Cards)' | 'Cash on Delivery (COD)';
    paymentStatus?: 'Paid' | 'Pending';
    shippingAddress: ShippingAddress;
  }): Order {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const newId = `NK-${randomNum}`;
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const isOnline = orderData.paymentMethod.includes('Razorpay');
    const paymentStatus = orderData.paymentStatus || (isOnline ? 'Paid' : 'Pending');
    const orderStatus: OrderStatus = isOnline ? 'Payment Confirmed' : 'Order Placed';

    // Deduct stock for ordered items
    orderData.items.forEach((item) => {
      const prod = this.products.find((p) => p.id === item.product.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    const trackingNumber = `CJ-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const courier = 'BlueDart Express Priority';

    // Build checkpoints
    const checkpoints: TrackingCheckpoint[] = [
      {
        status: 'Order Placed',
        label: 'Order Placed',
        date: today,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        location: 'Customer Storefront',
        description: 'Order registered and sent to NovaKart cloud order queue.',
        completed: true,
        current: !isOnline,
      },
      {
        status: 'Payment Confirmed',
        label: 'Payment Verified',
        date: today,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        location: isOnline ? 'Razorpay Payment Gateway' : 'COD Automated Check',
        description: isOnline
          ? 'Authorized digital payment captured via UPI / Card.'
          : 'Pending cash payment collection upon parcel handover.',
        completed: isOnline,
        current: isOnline,
      },
      {
        status: 'Processing',
        label: 'CJdropshipping Sourcing & Warehouse Prep',
        date: 'Scheduled in 12h',
        time: 'Pending',
        location: 'CJdropshipping Fulfillment Bay, Gurugram',
        description: 'Auto-manifest created and forwarded to warehouse queue.',
        completed: false,
        current: false,
      },
      {
        status: 'Shipped',
        label: 'Dispatched to Air Cargo Logistics',
        date: 'Scheduled in 24h',
        time: 'Pending',
        location: 'Delhi NCR Cargo Terminal',
        description: `AWB ${trackingNumber} assigned for express delivery via ${courier}.`,
        completed: false,
        current: false,
      },
      {
        status: 'In Transit',
        label: 'In Transit between Regional Hubs',
        date: 'Pending',
        time: 'Pending',
        location: `${orderData.shippingAddress.city} Central Sorting Hub`,
        description: 'Consignment en route to local delivery facility.',
        completed: false,
        current: false,
      },
      {
        status: 'Out for Delivery',
        label: 'Out for Delivery',
        date: 'Pending',
        time: 'Pending',
        location: `${orderData.shippingAddress.city} Hub`,
        description: 'Courier agent will contact recipient for doorstep delivery.',
        completed: false,
        current: false,
      },
      {
        status: 'Delivered',
        label: 'Order Delivered',
        date: 'Pending',
        time: 'Pending',
        location: orderData.shippingAddress.city,
        description: 'Delivered to recipient with digital signature / OTP.',
        completed: false,
        current: false,
      },
    ];

    const newOrder: Order = {
      id: newId,
      customerEmail: orderData.customerEmail.trim().toLowerCase(),
      orderDate: today,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      discount: orderData.discount,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      paymentStatus,
      orderStatus,
      shippingAddress: orderData.shippingAddress,
      tracking: {
        trackingNumber,
        courierPartner: courier,
        estimatedDeliveryDate: 'Within 3-4 Business Days',
        checkpoints,
      },
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  public updateOrderStatus(orderId: string, nextStatus: OrderStatus): Order | null {
    const order = this.orders.find((o) => o.id.toLowerCase() === orderId.toLowerCase());
    if (!order) return null;

    order.orderStatus = nextStatus;

    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const nowTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Update checkpoints completion and current pointers
    let reached = false;
    order.tracking.checkpoints.forEach((cp) => {
      if (cp.status === nextStatus) {
        cp.completed = true;
        cp.current = true;
        cp.date = today;
        cp.time = nowTime;
        reached = true;
      } else if (!reached) {
        cp.completed = true;
        cp.current = false;
      } else {
        cp.completed = false;
        cp.current = false;
      }
    });

    if (nextStatus === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    return order;
  }

  // --- PIN Codes ---
  public lookupPincode(pincode: string) {
    const trimmed = pincode.trim();
    if (this.pincodeData[trimmed]) {
      return {
        found: true,
        pincode: trimmed,
        ...this.pincodeData[trimmed],
        standardDeliveryFee: 0,
      };
    }

    // Default fallback calculation for valid 6-digit PIN code
    if (/^\d{6}$/.test(trimmed)) {
      return {
        found: true,
        pincode: trimmed,
        city: 'Verified Zone',
        state: 'India',
        days: 3,
        codAvailable: true,
        standardDeliveryFee: 0,
      };
    }

    return {
      found: false,
      pincode: trimmed,
      message: 'Invalid or unserviceable PIN code',
    };
  }

  // --- Admin Stats ---
  public getStats() {
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const paidOrders = this.orders.filter((o) => o.paymentStatus === 'Paid').length;
    const activeOrders = this.orders.filter(
      (o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
    ).length;
    const deliveredOrders = this.orders.filter((o) => o.orderStatus === 'Delivered').length;
    const lowStockCount = this.products.filter((p) => p.stock < 10).length;

    return {
      totalOrders,
      totalRevenue,
      paidOrders,
      activeOrders,
      deliveredOrders,
      totalProducts: this.products.length,
      lowStockCount,
      cjSyncStatus: this.cjConfig.isConnected ? 'Active' : 'Offline',
      lastSyncTime: this.cjConfig.lastSyncTime,
    };
  }
}

export const store = new DataStore();
