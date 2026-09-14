export interface ProductVariant {
  id: string;
  name: string; // e.g., "Color", "Size", "Capacity"
  options: string[]; // e.g., ["Midnight Black", "Arctic Silver", "Rose Gold"]
}

export interface ProductReview {
  id: string;
  userName: string;
  userCity: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  subCategory?: string;
  price: number; // in INR
  originalPrice: number; // in INR
  discount: number; // in percentage e.g. 35
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  highlights: string[];
  specifications: ProductSpecification[];
  variants: ProductVariant[];
  stock: number;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isSpecialOffer?: boolean;
  tags: string[];
  shippingInfo: {
    estimatedDays: string; // e.g. "3-5 Business Days"
    freeShippingAbove: number; // e.g. 999
    dispatchTime: string; // e.g. "Dispatched in 24 hours"
    courierPartners: string[]; // e.g. ["BlueDart", "Delhivery", "Shadowfax"]
  };
  returnPolicy: string; // e.g. "7-day replacement guarantee"
  cjProductId?: string; // Prepared for CJdropshipping sync
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants: Record<string, string>; // e.g. { Color: "Midnight Black", Size: "M" }
}

export type OrderStatus =
  | 'Order Placed'
  | 'Payment Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface TrackingCheckpoint {
  status: OrderStatus;
  label: string;
  date: string;
  time: string;
  location: string;
  description: string;
  completed: boolean;
  current: boolean;
}

export interface ShippingAddress {
  id: string;
  fullName: string;
  mobile: string;
  alternateMobile?: string;
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  type: 'Home' | 'Work' | 'Other';
  isDefault?: boolean;
}

export interface Order {
  id: string; // e.g., "NK-847291"
  orderDate: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'Razorpay Online (UPI/Cards)' | 'Cash on Delivery (COD)';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  orderStatus: OrderStatus;
  shippingAddress: ShippingAddress;
  tracking: {
    trackingNumber: string; // Ready for CJ API / 3PL tracking number
    courierPartner: string; // e.g. "BlueDart Express"
    estimatedDeliveryDate: string;
    checkpoints: TrackingCheckpoint[];
  };
}

export interface UserProfile {
  name: string;
  email: string;
  mobile: string;
  avatarUrl?: string;
  addresses: ShippingAddress[];
}

export interface FilterState {
  category: string;
  priceRange: [number, number];
  minRating: number;
  inStockOnly: boolean;
  sortBy: 'popularity' | 'price-low-high' | 'price-high-low' | 'rating' | 'newest';
  searchQuery: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  description: string;
}
