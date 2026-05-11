const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Auth
export async function register(name, email, password, role = 'user') {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Registration failed');
  }
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function getMe(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

// Products
export async function getProducts(category = '', search = '') {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  const res = await fetch(`${API_BASE}/products?${params}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API_BASE}/products/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function addProduct(token, product) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to add product');
  }
  return res.json();
}

export async function getMyProducts(token) {
  const res = await fetch(`${API_BASE}/products/seller/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

// Coupons
export async function validateCoupon(code, amount) {
  const res = await fetch(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, amount }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Invalid coupon');
  }
  return res.json();
}

export async function getCart(sessionId) {
  const res = await fetch(`${API_BASE}/cart/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch cart');
  return res.json();
}

export async function addToCart(sessionId, productId, quantity = 1) {
  const res = await fetch(`${API_BASE}/cart/${sessionId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error('Failed to add to cart');
  return res.json();
}

export async function updateCartItem(sessionId, productId, quantity) {
  const res = await fetch(`${API_BASE}/cart/${sessionId}/items/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error('Failed to update cart');
  return res.json();
}

export async function removeFromCart(sessionId, productId) {
  const res = await fetch(`${API_BASE}/cart/${sessionId}/items/${productId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove from cart');
  return res.json();
}

export async function clearCart(sessionId) {
  const res = await fetch(`${API_BASE}/cart/${sessionId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear cart');
  return res.json();
}

// Orders
export async function placeOrder(sessionId, items, totalAmount, deliveryAddress) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, items, totalAmount, deliveryAddress }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to place order');
  }
  return res.json();
}

export async function getOrders(sessionId) {
  const res = await fetch(`${API_BASE}/orders/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

// Payment
export async function createPaymentOrder(sessionId, amount, items, deliveryAddress) {
  const res = await fetch(`${API_BASE}/payment/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, amount, items, deliveryAddress }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create order');
  }
  return res.json();
}

export async function verifyPayment(paymentDetails) {
  const res = await fetch(`${API_BASE}/payment/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentDetails),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Verification failed');
  }
  return res.json();
}
