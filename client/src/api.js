const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path, { method = 'GET', body, token = localStorage.getItem('blinkit_token'), signal } = {}) {
  const response = await fetch(API_BASE + path, {
    method, signal,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Unable to complete this request. Please try again.');
  return data;
}
const query = values => new URLSearchParams(Object.entries(values).filter(([, value]) => value !== '' && value != null)).toString();
export const register = (name, email, password, role = 'user') => request('/auth/register', { method: 'POST', body: { name, email, password, role } });
export const login = (email, password) => request('/auth/login', { method: 'POST', body: { email, password } });
export const getMe = token => request('/auth/me', { token });
export const updateProfile = body => request('/auth/me', { method: 'PUT', body });
export const saveAddress = (body, id) => request('/auth/addresses' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body });
export const deleteAddress = id => request('/auth/addresses/' + id, { method: 'DELETE' });
export const getProducts = (filters = {}, signal) => request('/products?' + query(filters), { signal });
export const getProduct = id => request('/products/' + id);
export const getCategories = () => request('/products/categories');
export const getSeller = id => request('/sellers/' + id);
export const updateStore = body => request('/sellers/me', { method: 'PUT', body });
export const addProduct = (token, body) => request('/products', { method: 'POST', body, token });
export const updateProduct = (id, body) => request('/products/' + id, { method: 'PUT', body });
export const deleteProduct = id => request('/products/' + id, { method: 'DELETE' });
export const getMyProducts = token => request('/products/seller/mine', { token });
export const getReviews = id => request('/products/' + id + '/reviews');
export const saveReview = (id, body) => request('/products/' + id + '/reviews', { method: 'POST', body });
export const validateCoupon = (code, amount) => request('/coupons/validate', { method: 'POST', body: { code, amount } });
export const getCart = sessionId => request('/cart/' + sessionId);
export const mergeCart = sessionId => request('/cart/merge', { method: 'POST', body: { sessionId } });
export const addToCart = (sessionId, productId, quantity, variantId = '') => request('/cart/' + sessionId + '/items', { method: 'POST', body: { productId, quantity, variantId } });
export const updateCartItem = (sessionId, productId, quantity, variantId = '') => request('/cart/' + sessionId + '/items/' + productId, { method: 'PUT', body: { quantity, variantId } });
export const removeFromCart = (sessionId, productId, variantId = '') => request('/cart/' + sessionId + '/items/' + productId + '?' + query({ variantId }), { method: 'DELETE' });
export const clearCart = sessionId => request('/cart/' + sessionId, { method: 'DELETE' });
export const placeOrder = body => request('/orders', { method: 'POST', body });
export const getOrders = sessionId => request('/orders/' + sessionId);
export const getSellerOrders = () => request('/orders/seller/mine');
export const updateFulfillment = (id, body) => request('/orders/' + id + '/fulfillment', { method: 'PUT', body });
export const createPaymentOrder = (sessionId, amount, items, deliveryAddress) => request('/payment/create-order', { method: 'POST', body: { sessionId, amount, items, deliveryAddress } });
export const verifyPayment = body => request('/payment/verify', { method: 'POST', body });
