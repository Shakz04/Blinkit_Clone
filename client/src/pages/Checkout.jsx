import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import CouponBox from '../components/CouponBox';
import AddressFields from '../components/AddressFields';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder, saveAddress } from '../api';
import { currency, itemOption, itemKey } from '../lib/shop';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { cart, cartTotal, discountAmount, finalTotal, sessionId, clearCart, loading: cartLoading, appliedCoupon } = useCart();
  const defaultAddress = user?.addresses?.find(entry => entry.isDefault) || user?.addresses?.[0];
  const [address, setAddress] = useState(defaultAddress || { name: user?.name || '', phone: user?.phone || '', address: '', city: '', pincode: '' });
  const [selectedAddress, setSelectedAddress] = useState(defaultAddress?._id || '');
  const [saveToAccount, setSaveToAccount] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [checkoutKey] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const invalid = cart.items.some(item => !itemOption(item).available);
  const submit = async event => {
    event.preventDefault(); setError('');
    if (!cart.items.length || invalid) return setError('Update your cart before placing this order.');
    setBusy(true);
    try {
      if (saveToAccount && user) {
        setUser(await saveAddress({ ...address, label: addressLabel, isDefault: !user.addresses?.length }));
        setSaveToAccount(false);
      }
      const order = await placeOrder({
        sessionId, checkoutKey,
        items: cart.items.map(item => ({ product: item.product._id, variantId: item.variantId || '', quantity: item.quantity })),
        couponCode: appliedCoupon?.code || '', deliveryAddress: address,
      });
      await clearCart();
      navigate('/order-success', { replace: true, state: { amount: order.totalAmount, orderId: order._id, paymentMethod: 'Cash on Delivery (COD)' } });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <><Header /><main className="container commerce-main"><h1>Checkout</h1>
    {cartLoading ? <p role="status">Loading your cart...</p> : !cart.items.length && !busy ? <div className="panel empty"><h2>Your cart is empty</h2><Link className="button" to="/">Add items to checkout</Link></div> : <form className="checkout-layout" onSubmit={submit}>
      <section className="panel"><h2>Delivery address</h2>
        {!user && <p className="notice"><Link to="/login" state={{ from: '/checkout' }}>Sign in</Link> to use saved addresses and keep orders in your account, or continue as a guest.</p>}
        <fieldset className="checkout-fields" disabled={busy}>
          {user?.addresses?.length > 0 && <label className="saved-address-select">Use a saved address<select value={selectedAddress} onChange={event => { const selected = user.addresses.find(entry => entry._id === event.target.value); setSelectedAddress(event.target.value); setAddress(selected || { name: user.name, phone: user.phone || '', address: '', city: '', pincode: '' }); }}>{user.addresses.map(entry => <option key={entry._id} value={entry._id}>{entry.label} · {entry.address}, {entry.city}{entry.isDefault ? ' (Default)' : ''}</option>)}<option value="">Use another address</option></select></label>}
          <AddressFields value={address} onChange={value => { setAddress(value); setSelectedAddress(''); }} />
          {user && !selectedAddress && <><label className="checkbox-label"><input type="checkbox" checked={saveToAccount} onChange={event => setSaveToAccount(event.target.checked)} />Save this address for next time</label>{saveToAccount && <label className="saved-address-select">Address label<input required maxLength={30} value={addressLabel} onChange={event => setAddressLabel(event.target.value)} /></label>}</>}
        </fieldset>
      </section>
      <aside className="checkout-summary"><h2>Order summary</h2><div className="summary-items">{cart.items.map(item => <div className="summary-item" key={itemKey(item)}><span>{item.product?.name} · {itemOption(item).unit} × {item.quantity}</span><span>{currency(itemOption(item).price * item.quantity)}</span></div>)}</div><div className="summary-row"><span>Subtotal</span><span>{currency(cartTotal)}</span></div><CouponBox />{discountAmount > 0 && <div className="summary-row discount"><span>Discount</span><span>−{currency(discountAmount)}</span></div>}<div className="summary-row total"><span>Total</span><span>{currency(finalTotal)}</span></div><p className="muted">Cash on delivery · You can track each seller’s delivery after placing your order.</p>{error && <p className="notice error" role="alert">{error}</p>}{invalid && <p className="notice error">Some items are unavailable. <Link to="/cart">Update your cart</Link>.</p>}<button className="pay-btn" disabled={busy || invalid}>{busy ? 'Placing order...' : 'Place order · ' + currency(finalTotal)}</button><Link className="back-link" to="/cart">← Back to cart</Link></aside>
    </form>}
  </main></>;
}
