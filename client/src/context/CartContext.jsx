import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import * as api from '../api';

const CartContext = createContext();

const COUPON_STORAGE = 'blinkit_coupon';
const SESSION_STORAGE = 'blinkit_session';

function getSessionId() {
  try {
    let id = localStorage.getItem(SESSION_STORAGE);
    if (!id) {
      id = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      localStorage.setItem(SESSION_STORAGE, id);
    }
    return id;
  } catch {
    return 'sess_guest_' + Date.now();
  }
}

export function CartProvider({ children }) {
  const sessionId = useMemo(getSessionId, []);
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const stored = localStorage.getItem(COUPON_STORAGE);
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed && typeof parsed.discountPercent !== 'number') return null;
      return parsed;
    } catch {
      return null;
    }
  });

  const refreshCart = async () => {
    try {
      const data = await api.getCart(sessionId);
      setCart(data && typeof data === 'object' ? data : { items: [] });
    } catch (err) {
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [sessionId]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const data = await api.addToCart(sessionId, productId, quantity);
      setCart(data);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      const data = await api.updateCartItem(sessionId, productId, quantity);
      setCart(data);
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (productId) => {
    try {
      const data = await api.removeFromCart(sessionId, productId);
      setCart(data);
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart(sessionId);
      setCart({ items: [] });
    } catch (err) {
      console.error(err);
    }
  };

  const cartCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const cartTotal = cart.items?.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0) || 0;

  const discountAmount = appliedCoupon?.discountPercent != null
    ? Math.round((cartTotal * (appliedCoupon.discountPercent || 0)) / 100)
    : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const applyCoupon = async (code) => {
    const data = await api.validateCoupon(code, cartTotal);
    const coupon = {
      code: data.code,
      discountPercent: data.discountPercent,
      discountAmount: data.discountAmount,
    };
    setAppliedCoupon(coupon);
    localStorage.setItem(COUPON_STORAGE, JSON.stringify(coupon));
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem(COUPON_STORAGE);
  };

  // Clear coupon when cart is cleared
  useEffect(() => {
    if (cart.items?.length === 0) {
      setAppliedCoupon(null);
      localStorage.removeItem(COUPON_STORAGE);
    }
  }, [cart.items?.length]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        appliedCoupon,
        discountAmount,
        finalTotal,
        applyCoupon,
        removeCoupon,
        sessionId,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
