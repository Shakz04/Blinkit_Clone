import { Link } from 'react-router-dom';
import Header from '../components/Header';
import CouponBox from '../components/CouponBox';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cart, cartCount, cartTotal, discountAmount, finalTotal, updateQuantity, removeItem, loading } = useCart();
  const items = (cart.items || []).filter((i) => i.product);

  if (loading) {
    return (
      <div className="cart-page">
        <Header />
        <main className="cart-main">
          <div className="container">Loading cart...</div>
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <Header />
        <main className="cart-main">
          <div className="container cart-empty">
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link to="/" className="shop-btn">Continue Shopping</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <Header />
      <main className="cart-main">
        <div className="container">
          <h1 className="cart-title">Your Cart ({cartCount} items)</h1>
          <div className="cart-layout">
            <div className="cart-items">
              {items.map(({ product, quantity }) => (
                <div key={product._id} className="cart-item">
                  <img src={product.image} alt={product.name} className="cart-item-img" />
                  <div className="cart-item-details">
                    <h3>{product.name}</h3>
                    <span className="cart-item-unit">{product.unit}</span>
                    <div className="cart-item-price">₹{product.price}</div>
                    <div className="cart-item-actions">
                      <div className="qty-controls">
                        <button onClick={() => quantity > 1 ? updateQuantity(product._id, quantity - 1) : removeItem(product._id)} className="qty-btn">−</button>
                        <span className="qty-value">{quantity}</span>
                        <button onClick={() => updateQuantity(product._id, quantity + 1)} className="qty-btn">+</button>
                      </div>
                      <button onClick={() => removeItem(product._id)} className="remove-btn">Remove</button>
                    </div>
                  </div>
                  <div className="cart-item-total">₹{product.price * quantity}</div>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <CouponBox />
              {discountAmount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span className="discount-amount">−₹{discountAmount}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
              <Link to="/checkout" className="checkout-btn">Proceed to Checkout</Link>
              <Link to="/" className="continue-link">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
