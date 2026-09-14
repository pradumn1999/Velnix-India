import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '../types';
import { AVAILABLE_COUPONS } from '../data/products';
import { useToast } from './ToastContext';
import { useWishlist } from './WishlistContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variants?: Record<string, string>) => void;
  updateQuantity: (productId: string, selectedVariants: Record<string, string>, newQty: number) => void;
  removeFromCart: (productId: string, selectedVariants: Record<string, string>) => void;
  moveToWishlist: (item: CartItem) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  cartCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('velnix_cart') || localStorage.getItem('novakart_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem('velnix_coupon') || localStorage.getItem('novakart_coupon');
    return saved ? JSON.parse(saved) : null;
  });

  const { showToast } = useToast();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    localStorage.setItem('velnix_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('velnix_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('velnix_coupon');
      localStorage.removeItem('novakart_coupon');
    }
  }, [appliedCoupon]);

  const areVariantsEqual = (a: Record<string, string>, b: Record<string, string>) => {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => a[k] === b[k]);
  };

  const addToCart = (
    product: Product,
    quantity: number = 1,
    variants?: Record<string, string>
  ) => {
    // Default variants if not passed
    const defaultVariants: Record<string, string> = {};
    if (variants) {
      Object.assign(defaultVariants, variants);
    } else {
      product.variants.forEach((v) => {
        if (v.options.length > 0) {
          defaultVariants[v.name] = v.options[0];
        }
      });
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          areVariantsEqual(item.selectedVariants, defaultVariants)
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, product.stock),
        };
        showToast(`Updated "${product.name.slice(0, 20)}..." quantity in Cart`, 'success');
        return updated;
      } else {
        showToast(`Added "${product.name.slice(0, 20)}..." to Cart`, 'success');
        return [...prevCart, { product, quantity, selectedVariants: defaultVariants }];
      }
    });
  };

  const updateQuantity = (
    productId: string,
    selectedVariants: Record<string, string>,
    newQty: number
  ) => {
    if (newQty <= 0) {
      removeFromCart(productId, selectedVariants);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (
          item.product.id === productId &&
          areVariantsEqual(item.selectedVariants, selectedVariants)
        ) {
          return { ...item, quantity: Math.min(newQty, item.product.stock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, selectedVariants: Record<string, string>) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(
            item.product.id === productId &&
            areVariantsEqual(item.selectedVariants, selectedVariants)
          )
      )
    );
    showToast('Removed item from cart', 'info');
  };

  const moveToWishlist = (item: CartItem) => {
    removeFromCart(item.product.id, item.selectedVariants);
    if (!isInWishlist(item.product.id)) {
      toggleWishlist(item.product.id as unknown as Product);
    }
    showToast(`Moved "${item.product.name.slice(0, 22)}..." to Wishlist`, 'success');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = AVAILABLE_COUPONS.find((c) => c.code === cleanCode);
    if (!coupon) {
      return { success: false, message: 'Invalid coupon code. Try WELCOME10 or FESTIVE250' };
    }

    if (subtotal < coupon.minOrder) {
      return {
        success: false,
        message: `Coupon valid on minimum order value of ₹${coupon.minOrder}`,
      };
    }

    setAppliedCoupon(coupon);
    showToast(`Coupon ${coupon.code} applied successfully!`, 'success');
    return { success: true, message: `Applied ${coupon.code} successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discount = appliedCoupon.value;
    }
  }

  // Free shipping on subtotal above 999 or empty cart
  const shipping = subtotal >= 999 || cart.length === 0 ? 0 : 99;
  const grandTotal = Math.max(0, subtotal - discount + shipping);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        moveToWishlist,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartCount,
        subtotal,
        discount,
        shipping,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
