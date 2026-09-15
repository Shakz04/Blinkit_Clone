import { Link } from 'react-router-dom';
import Header from '../components/Header';
import CouponBox from '../components/CouponBox';
import StoreBadge from '../components/StoreBadge';
import { useCart } from '../context/CartContext';
import { currency, itemOption, itemKey } from '../lib/shop';
import './Cart.css';

export default function Cart() {
  const { cart, cartCount, cartTotal, discountAmount, finalTotal, updateQuantity, removeItem, loading, error, refreshCart } = useCart();
  const invalid = cart.items.some(item => !itemOption(item).available);
  return <><Header /><main className="container commerce-main">
    <h1>Your cart <span className="muted">({cartCount} items)</span></h1>
    {error && <p className="notice error" role="alert">{error} <button className="text-button" onClick={refreshCart}>Refresh cart</button></p>}
    {loading ? <p role="status">Loading cart...</p> : !cart.items.length ? <div className="panel empty"><h2>Your cart is empty</h2><p>Explore our sellers and add your everyday essentials.</p><Link to="/" className="button">Continue shopping</Link></div> : <div className="cart-layout">
      <div className="cart-items">{cart.items.map(item => {
        const { product, quantity, variantId } = item;
        const option = itemOption(item);
        return <article key={itemKey(item)} className="cart-item">
          {product && <Link to={'/products/' + product._id}><img src={product.image} alt={product.name} className="cart-item-img" /></Link>}
          <div className="cart-item-details"><h3>{product ? <Link to={'/products/' + product._id}>{product.name}</Link> : 'Unavailable product'}</h3><StoreBadge seller={product?.seller} /><span className="cart-item-unit">{option.unit}</span><div className="cart-item-price">{currency(option.price)}</div>
            {!option.available && <p className="text-error">This item or quantity is no longer available. Update or remove it to continue.</p>}
            {product && <div className="cart-item-actions"><div className="qty-controls"><button aria-label={'Decrease ' + product.name} onClick={() => quantity > 1 ? updateQuantity(product._id, quantity - 1, variantId) : removeItem(product._id, variantId)} className="qty-btn">−</button><span className="qty-value">{quantity}</span><button aria-label={'Increase ' + product.name} disabled={!option.available || (option.stock != null && quantity >= option.stock)} onClick={() => updateQuantity(product._id, quantity + 1, variantId)} className="qty-btn">+</button></div><button onClick={() => removeItem(product._id, variantId)} className="remove-btn">Remove</button></div>}
          </div><strong>{currency(option.price * quantity)}</strong>
        </article>;
      })}</div>
      <aside className="cart-summary"><h2>Order summary</h2><div className="summary-row"><span>Subtotal</span><span>{currency(cartTotal)}</span></div><CouponBox />{discountAmount > 0 && <div className="summary-row discount"><span>Discount</span><span>−{currency(discountAmount)}</span></div>}<div className="summary-row total"><span>Total</span><span>{currency(finalTotal)}</span></div>{invalid ? <p className="notice error">Update unavailable items before checkout.</p> : <Link className="checkout-btn" to="/checkout">Proceed to checkout</Link>}<Link to="/" className="continue-link">Continue shopping</Link></aside>
    </div>}
  </main></>;
}
