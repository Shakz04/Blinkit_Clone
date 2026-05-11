import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import { getOrders } from '../api';
import './Orders.css';

export default function Orders() {
  const { sessionId } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders(sessionId)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="orders-page">
      <Header />
      <main className="orders-main">
        <div className="container">
          <div className="orders-title-row">
            <h1 className="orders-title">My Orders</h1>
            <Link to="/track-orders" className="track-orders-btn">Track Orders</Link>
          </div>

          {loading ? (
            <p className="orders-loading">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="orders-empty">
              <p>No orders yet.</p>
              <Link to="/" className="shop-btn">Start Shopping</Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                    <span className="order-status">{order.status}</span>
                  </div>
                  <div className="order-items">
                    {order.items?.map((item, i) => (
                      <div key={i} className="order-item">
                        <span>{item.name} x {item.quantity}</span>
                        <span>Rs.{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  {order.deliveryAddress?.address && (
                    <div className="order-address">
                      <strong>Delivery:</strong> {order.deliveryAddress.name},{' '}
                      {order.deliveryAddress.address}, {order.deliveryAddress.city} -{' '}
                      {order.deliveryAddress.pincode}
                    </div>
                  )}
                  <div className="order-total">
                    <span>Total</span>
                    <span>Rs.{order.totalAmount}</span>
                  </div>
                  <div className="order-actions">
                    <Link to="/track-orders" state={{ orderId: order._id }} className="track-order-link">
                      Track this Order
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
