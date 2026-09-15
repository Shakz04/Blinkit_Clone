import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import useOrders from '../hooks/useOrders';
import { currency, dateTime, statusLabels } from '../lib/shop';
import './Orders.css';

export default function Orders() {
  const { user } = useAuth();
  const { orders, loading, error, refresh } = useOrders();
  return <><Header /><main className="container commerce-main">
    <div className="section-heading"><div><p className="eyebrow">YOUR PURCHASES</p><h1>My orders</h1></div><button className="button secondary" onClick={refresh}>Refresh</button></div>
    {!user && <p className="notice"><Link to="/login" state={{ from: '/orders' }}>Sign in</Link> to save this browser’s orders to your account.</p>}
    {error && <p className="notice error" role="alert">{error}</p>}
    {loading ? <p role="status">Loading orders...</p> : !orders.length ? <div className="panel empty"><h2>No orders yet</h2><Link className="button" to="/">Start shopping</Link></div> : <div className="orders-list">{orders.map(order => <article key={order._id} className="order-card">
      <div className="order-header"><strong>Order #{order._id.slice(-6).toUpperCase()}</strong><span className="order-date">{dateTime(order.createdAt)}</span><span className="order-status">{statusLabels[order.fulfillmentStatus] || 'Awaiting an update'}</span></div>
      <div className="order-items">{order.items.map((item, index) => <div key={index} className="order-item"><span>{item.name}{item.unit ? ' · ' + item.unit : ''} × {item.quantity}</span><span>{currency(item.price * item.quantity)}</span></div>)}</div>
      {order.deliveryAddress?.address && <div className="order-address"><strong>Deliver to:</strong> {order.deliveryAddress.name}, {order.deliveryAddress.address}, {order.deliveryAddress.city} – {order.deliveryAddress.pincode}</div>}
      <div className="order-total"><span>Total{order.discountAmount > 0 && <small> · Saved {currency(order.discountAmount)}</small>}</span><strong>{currency(order.totalAmount)}</strong></div>
      <div className="order-actions"><span className="muted">{order.paymentMethod === 'cod' ? 'Cash on delivery' : order.status === 'paid' ? 'Paid online' : 'Payment pending'}</span><Link className="button secondary" to={'/track-orders?order=' + order._id}>Track this order</Link></div>
    </article>)}</div>}
  </main></>;
}
