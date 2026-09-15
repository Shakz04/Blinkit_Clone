import { useState } from 'react';
import { useCart } from '../context/CartContext';
import './CouponBox.css';

export default function CouponBox() {
  const { appliedCoupon, discountAmount, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async (e) => {
    e?.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    try {
      await applyCoupon(code.trim());
      setCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="coupon-box">
      {appliedCoupon ? (
        <div className="coupon-applied">
          <span className="coupon-code">🎟️ {appliedCoupon.code} — {appliedCoupon.discountPercent}% off</span>
          <span className="coupon-discount">−₹{discountAmount}</span>
          <button type="button" onClick={removeCoupon} className="coupon-remove">Remove</button>
        </div>
      ) : (
        <div className="coupon-form">
          <input
            type="text"
            aria-label="Coupon code"
            onKeyDown={(event) => { if (event.key === 'Enter') handleApply(event); }}
            placeholder="Enter coupon code"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
            className="coupon-input"
          />
          <button type="button" onClick={handleApply} disabled={loading || !code.trim()}>
            {loading ? 'Applying...' : 'Apply'}
          </button>
          {error && <p className="coupon-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
