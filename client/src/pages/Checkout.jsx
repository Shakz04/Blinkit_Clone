import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import CouponBox from '../components/CouponBox';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../api';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, discountAmount, finalTotal, sessionId, clearCart } = useCart();
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = (cart.items || []).filter((item) => item?.product?._id);
  const subtotal = items.reduce((sum, { product, quantity }) => sum + (product?.price || 0) * quantity, 0);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    const { name, phone, address: addr, city, pincode } = address;
    if (!name.trim() || !phone.trim() || !addr.trim() || !city.trim() || !pincode.trim()) {
      setError('Please fill in all delivery details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderItems = items.map(({ product, quantity }) => ({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
      }));

      await placeOrder(sessionId, orderItems, finalTotal, address);
      await clearCart();
      navigate('/order-success', {
        state: {
          amount: finalTotal,
          paymentMethod: 'Cash on Delivery (COD)',
        },
      });
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <div className="checkout-page">
        <Header />
        <main className="checkout-main">
          <div className="container checkout-empty">
            <h2>Your cart is empty</h2>
            <Link to="/" className="shop-btn">Add items to checkout</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Header />
      <main className="checkout-main">
        <div className="container">
          <h1 className="checkout-title">Checkout</h1>
          <div className="checkout-layout">
            <div className="checkout-form">
              <section className="address-section">
                <h2>Delivery Address</h2>
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={address.name}
                    onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Address (House, Street)"
                    value={address.address}
                    onChange={(e) => setAddress({ ...address, address: e.target.value })}
                    className="full-width"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  />
                </div>
              </section>
            </div>
            <div className="checkout-summary">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {items.map(({ product, quantity }) => (
                  <div key={product._id} className="summary-item">
                    <span>{product.name} x {quantity}</span>
                    <span>Rs.{product.price * quantity}</span>
                  </div>
                ))}
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>Rs.{subtotal}</span>
              </div>
              <CouponBox />
              {discountAmount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span className="discount-amount">-Rs.{discountAmount}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>Rs.{finalTotal}</span>
              </div>
              {error && <p className="checkout-error">{error}</p>}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="pay-btn"
              >
                {loading ? 'Placing Order...' : `Place Order Rs.${finalTotal} (COD)`}
              </button>
              <Link to="/cart" className="back-link">{'<-'} Back to Cart</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
