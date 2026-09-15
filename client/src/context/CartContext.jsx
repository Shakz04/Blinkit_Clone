/* eslint-disable react-refresh/only-export-components -- This module exports its provider and shared context hook. */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as api from '../api';
import { useAuth } from './AuthContext';
import { itemOption } from '../lib/shop';

const CartContext = createContext();
const pending = new Map();
function guestSession() {
  let value = localStorage.getItem('blinkit_session');
  if (!value || !/^sess_[A-Za-z0-9_-]{8,100}$/.test(value)) {
    value = 'sess_' + crypto.randomUUID();
    localStorage.setItem('blinkit_session', value);
  }
  return value;
}
function CartState({ user, authLoading, children }) {
  const userId = user?._id;
  const [sessionId] = useState(guestSession);
  const couponKey = 'blinkit_coupon_' + (user?._id || sessionId);
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem(couponKey));
      return typeof value?.discountPercent === 'number' ? value : null;
    } catch { return null; }
  });
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    const key = (userId || 'guest') + ':' + sessionId;
    if (!pending.has(key)) {
      const promise = userId ? api.mergeCart(sessionId) : api.getCart(sessionId);
      pending.set(key, promise);
      promise.finally(() => pending.delete(key)).catch(() => {});
    }
    pending.get(key).then(data => {
      if (cancelled) return;
      setCart(data);
      if (userId) localStorage.setItem('blinkit_session', 'sess_' + crypto.randomUUID());
    }).catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authLoading, sessionId, userId]);
  useEffect(() => {
    if (appliedCoupon) localStorage.setItem(couponKey, JSON.stringify(appliedCoupon));
    else localStorage.removeItem(couponKey);
  }, [appliedCoupon, couponKey]);
  const refreshCart = useCallback(async () => {
    try { setCart(await api.getCart(sessionId)); setError(''); }
    catch (err) { setError(err.message); }
  }, [sessionId]);
  const mutate = useCallback(action => {
    const result = queue.current.then(async () => {
      try { setError(''); setCart(await action()); return true; }
      catch (err) { setError(err.message); return false; }
    });
    queue.current = result;
    return result;
  }, []);
  const addToCart = (id, quantity = 1, variantId = '') => mutate(() => api.addToCart(sessionId, id, quantity, variantId));
  const updateQuantity = (id, quantity, variantId = '') => mutate(() => api.updateCartItem(sessionId, id, quantity, variantId));
  const removeItem = (id, variantId = '') => mutate(() => api.removeFromCart(sessionId, id, variantId));
  const clearCart = async () => {
    const success = await mutate(() => api.clearCart(sessionId));
    if (success) setAppliedCoupon(null);
    return success;
  };
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = Math.round(cart.items.reduce((sum, item) => sum + itemOption(item).price * item.quantity, 0) * 100) / 100;
  const discountAmount = appliedCoupon ? Math.round(cartTotal * appliedCoupon.discountPercent / 100) : 0;
  const finalTotal = Math.max(0, Math.round((cartTotal - discountAmount) * 100) / 100);
  const applyCoupon = async code => {
    const data = await api.validateCoupon(code, cartTotal);
    setAppliedCoupon({ code: data.code, discountPercent: data.discountPercent });
  };
  return <CartContext.Provider value={{
    cart, cartCount, cartTotal, appliedCoupon, discountAmount, finalTotal, applyCoupon,
    removeCoupon: () => setAppliedCoupon(null), sessionId, loading, error,
    addToCart, updateQuantity, removeItem, clearCart, refreshCart,
  }}>{children}</CartContext.Provider>;
}
export function CartProvider({ children }) {
  const { user, loading } = useAuth();
  return <CartState key={user?._id || 'guest'} user={user} authLoading={loading}>{children}</CartState>;
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
