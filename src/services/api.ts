import { Product, Order, OrderStatus, ShippingAddress, CartItem } from '../types';

export const api = {
  // --- Products ---
  async getProducts(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStockOnly?: boolean;
    sortBy?: string;
  }): Promise<{ success: boolean; products: Product[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
    if (params?.minRating !== undefined) query.set('minRating', String(params.minRating));
    if (params?.inStockOnly) query.set('inStockOnly', 'true');
    if (params?.sortBy) query.set('sortBy', params.sortBy);

    const res = await fetch(`/api/products?${query.toString()}`);
    return res.json();
  },

  async getProductById(id: string): Promise<{ success: boolean; product?: Product }> {
    const res = await fetch(`/api/products/${id}`);
    return res.json();
  },

  async createProduct(data: Partial<Product>): Promise<{ success: boolean; product?: Product }> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; product?: Product }> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  // --- Orders ---
  async getOrders(user: { email: string; role: 'customer' | 'admin' }): Promise<{ success: boolean; orders: Order[] }> {
    const params = new URLSearchParams({
      role: user.role,
      ...(user.role === 'admin' ? {} : { email: user.email }),
    });
    const res = await fetch(`/api/orders?${params.toString()}`);
    return res.json();
  },

  async getOrderById(id: string, user: { email: string; role: 'customer' | 'admin' }): Promise<{ success: boolean; order?: Order }> {
    const params = new URLSearchParams({ role: user.role, ...(user.role === 'admin' ? {} : { email: user.email }) });
    const res = await fetch(`/api/orders/${id}?${params.toString()}`);
    return res.json();
  },

  async createOrder(data: {
    customerEmail: string;
    items: CartItem[];
    subtotal: number;
    shipping: number;
    discount: number;
    totalAmount: number;
    paymentMethod: 'Razorpay Online (UPI/Cards)' | 'Cash on Delivery (COD)';
    paymentStatus?: 'Paid' | 'Pending';
    shippingAddress: ShippingAddress;
  }): Promise<{ success: boolean; order: Order }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: OrderStatus, role: 'customer' | 'admin'): Promise<{ success: boolean; order?: Order }> {
    const res = await fetch(`/api/orders/${orderId}/status?role=${role}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  // --- Razorpay ---
  async getRazorpayConfig(): Promise<{ success: boolean; keyId: string; environment: string }> {
    const res = await fetch('/api/razorpay/config');
    return res.json();
  },

  async createRazorpayOrder(amount: number, receipt?: string): Promise<{
    success: boolean;
    order: { id: string; amount: number; currency: string };
    keyId: string;
  }> {
    const res = await fetch('/api/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, receipt }),
    });
    return res.json();
  },

  async verifyRazorpayPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ success: boolean; verified: boolean }> {
    const res = await fetch('/api/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // --- CJdropshipping ---
  async getCJStatus(): Promise<{ success: boolean; data: any }> {
    const res = await fetch('/api/cjdropshipping/status');
    return res.json();
  },

  async syncCJInventory(): Promise<{ success: boolean; message: string; result: any }> {
    const res = await fetch('/api/cjdropshipping/sync', { method: 'POST' });
    return res.json();
  },

  async importCJProduct(cjProductId: string, customPrice: number): Promise<{ success: boolean; product?: Product; message: string }> {
    const res = await fetch('/api/cjdropshipping/import-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cjProductId, customPrice }),
    });
    return res.json();
  },

  async calculateFreight(pincode: string, weightGrams?: number): Promise<{ success: boolean; data: any }> {
    const res = await fetch('/api/cjdropshipping/calculate-freight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pincode, weightGrams }),
    });
    return res.json();
  },

  // --- PIN Code ---
  async lookupPincode(pincode: string): Promise<any> {
    const res = await fetch(`/api/pincode/${pincode}`);
    return res.json();
  },

  // --- Stats ---
  async getStats(): Promise<{ success: boolean; stats: any }> {
    const res = await fetch('/api/stats');
    return res.json();
  },

  // --- MongoDB Authentication ---
  async getAuthStatus(): Promise<{
    success: boolean;
    status: string;
    connected: boolean;
    database?: string;
    message: string;
  }> {
    const res = await fetch('/api/auth/status');
    return res.json();
  },

  async registerUser(data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
  }): Promise<{
    success: boolean;
    message: string;
    user?: any;
    isMongo?: boolean;
  }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async loginUser(data: {
    email: string;
    password: string;
  }): Promise<{
    success: boolean;
    message: string;
    user?: any;
    isMongo?: boolean;
  }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateUserProfile(data: {
    email: string;
    name?: string;
    mobile?: string;
    avatarUrl?: string;
  }): Promise<{
    success: boolean;
    message: string;
    user?: any;
  }> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async saveUserAddress(data: {
    email: string;
    address: Omit<ShippingAddress, 'id'>;
  }): Promise<{
    success: boolean;
    message: string;
    user?: any;
  }> {
    const res = await fetch('/api/auth/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
