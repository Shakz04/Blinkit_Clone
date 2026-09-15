import { Link, useSearchParams, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import OrderTimeline from '../components/OrderTimeline';
import useOrders from '../hooks/useOrders';
import { currency, dateTime, statusLabels } from '../lib/shop';
import './TrackOrders.css';

export default function TrackOrders() {
  const [params] = useSearchParams();
  const location = useLocation();
  const { orders, loading, error, refresh } = useOrders();
  const selected = params.get('order') || location.state?.orderId;
  const visible = selected ? orders.filter(order => order._id === selected) : orders;
  return <><Header /><main className="container commerce-main">
    <div className="section-heading"><div><p className="eyebrow">DELIVERY UPDATES</p><h1>Track your order</h1><p className="muted">Seller updates refresh automatically every 15 seconds.</p></div><button className="button secondary" onClick={refresh}>Refresh</button></div><Link className="back-link" to="/orders">← All orders</Link>
    {error && <p className="notice error" role="alert">{error}</p>}
    {loading ? <p role="status">Loading tracking details...</p> : !visible.length ? <div className="panel empty"><h2>No matching order</h2><Link to="/orders">Go to your orders</Link></div> : visible.map(order => <section className="panel tracking-order" key={order._id}><div className="section-heading"><h2>Order #{order._id.slice(-6).toUpperCase()}</h2><strong>{currency(order.totalAmount)}</strong></div>
      {!order.fulfillments?.length ? <p className="notice">Tracking updates are not available for this older order.</p> : order.fulfillments.map(group => <article className="fulfillment-card" key={group._id}><div className="section-heading"><h3>{group.seller ? <Link to={'/stores/' + group.seller}>{group.name}</Link> : group.name}</h3><span className="status-pill active">{statusLabels[group.status]}</span></div>
        <p className="muted">{order.items.filter(item => String(item.seller || '') === String(group.seller || '')).map(item => item.name + ' × ' + item.quantity).join(', ')}</p>
        <OrderTimeline fulfillment={group} />
        {group.status === 'delivered' ? <p className="text-success">Your items have been delivered.</p> : group.estimatedDeliveryAt ? <p><strong>Estimated delivery:</strong> {dateTime(group.estimatedDeliveryAt)}{new Date(group.estimatedDeliveryAt) < new Date() && <span className="muted"> · Awaiting a revised estimate</span>}</p> : <p className="muted">The seller has not provided a delivery estimate yet.</p>}
        {group.deliveryPartner?.name && <div className="partner-box"><p><strong>Delivery partner:</strong> {group.deliveryPartner.name}</p>{group.deliveryPartner.phone && <a href={'tel:' + group.deliveryPartner.phone}>{group.deliveryPartner.phone}</a>}</div>}
        {group.status === 'delivered' && <div className="button-row">{order.items.filter(item => String(item.seller || '') === String(group.seller || '')).map((item, index) => <Link className="text-button" key={index} to={'/products/' + item.product + '#reviews'}>Review {item.name}</Link>)}</div>}
      </article>)}
    </section>)}
  </main></>;
}
