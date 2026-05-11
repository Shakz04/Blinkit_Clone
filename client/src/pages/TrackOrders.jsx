import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { getOrders } from '../api';
import { useCart } from '../context/CartContext';
import './TrackOrders.css';

const PARTNER_NAMES = [
  'Ravi Kumar',
  'Aman Singh',
  'Priya Nair',
  'Kunal Verma',
  'Neha Joshi',
  'Arjun Patel',
  'Sana Khan',
  'Vikas Mehta',
  'Ishita Roy',
  'Rahul Das',
];

function getHash(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getPartnerPhone(seed) {
  const hash = getHash(seed) % 1000000000;
  const suffix = String(hash).padStart(9, '0');
  return `9${suffix}`;
}

function buildPartnerAssignments(orderList) {
  const usedNames = new Set();

  return orderList.map((order) => {
    const idSeed = order._id || `${Date.now()}`;
    const hash = getHash(idSeed);
    const baseName = PARTNER_NAMES[hash % PARTNER_NAMES.length];

    let name = baseName;
    let bump = 2;
    while (usedNames.has(name)) {
      name = `${baseName} ${bump}`;
      bump += 1;
    }
    usedNames.add(name);

    return {
      order,
      partner: {
        name,
        contact: getPartnerPhone(idSeed),
      },
    };
  });
}

export default function TrackOrders() {
  const { sessionId } = useCart();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders(sessionId)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const selectedOrderId = location.state?.orderId;

  const filteredOrders = useMemo(() => {
    if (!selectedOrderId) return orders;
    return orders.filter((order) => order._id === selectedOrderId);
  }, [orders, selectedOrderId]);

  const trackedOrders = useMemo(() => buildPartnerAssignments(filteredOrders), [filteredOrders]);

  return (
    <div className="track-page">
      <Header />
      <main className="track-main">
        <div className="container">
          <div className="track-title-row">
            <h1 className="track-title">Track Orders</h1>
            <Link to="/orders" className="back-orders-btn">Back to Orders</Link>
          </div>

          {loading ? (
            <p className="track-loading">Loading tracking details...</p>
          ) : trackedOrders.length === 0 ? (
            <div className="track-empty">
              <p>No order found for tracking.</p>
              <Link to="/orders" className="shop-btn">Go to Orders</Link>
            </div>
          ) : (
            <div className="track-list">
              {trackedOrders.map(({ order, partner }) => (
                <div key={order._id} className="track-card">
                  <div className="track-header">
                    <h2>Order #{order._id?.slice(-6)?.toUpperCase()}</h2>
                    <span className="track-status">{order.status || 'Confirmed'}</span>
                  </div>
                  <p className="track-message">
                    {partner.name} is arriving in 10 mins
                  </p>
                  <div className="partner-box">
                    <p><strong>Delivery Partner:</strong> {partner.name}</p>
                    <p><strong>Contact:</strong> {partner.contact}</p>
                  </div>
                  <div className="track-total">
                    <span>Order Total</span>
                    <span>Rs.{order.totalAmount || 0}</span>
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
