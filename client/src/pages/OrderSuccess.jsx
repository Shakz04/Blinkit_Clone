import { Link, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import './OrderSuccess.css';

export default function OrderSuccess() {
  const location = useLocation();
  const amount = location.state?.amount || 0;
  const paymentMethod = location.state?.paymentMethod || 'Cash on Delivery (COD)';

  return (
    <div className="success-page">
      <Header />
      <main className="success-main">
        <div className="success-card">
          <div className="success-icon">OK</div>
          <h1>Order Placed</h1>
          <p>Your order has been placed successfully and will be delivered soon.</p>
          {amount > 0 && <p className="amount">Amount to pay on delivery: Rs.{amount}</p>}
          <p className="payment-method">Payment method: {paymentMethod}</p>
          <div className="success-actions">
            <Link to="/orders" className="shop-btn">View Orders</Link>
            <Link to="/" className="shop-btn outline">Continue Shopping</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
