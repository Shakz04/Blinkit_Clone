import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import StoreBadge from './StoreBadge';
import { currency } from '../lib/shop';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, cart, updateQuantity, removeItem, loading } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const item = cart.items.find(entry => entry.product?._id === product._id && !entry.variantId);
  const options = product.variants?.length > 0;
  const action = async callback => {
    setBusy(true); setError('');
    const ok = await callback();
    if (!ok) setError('Could not update the cart. Check stock and try again.');
    setBusy(false);
  };
  return <article className="product-card">
    <Link to={'/products/' + product._id} className="product-image-wrap" aria-label={'View ' + product.name}>
      <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
      {product.discount > 0 && <span className="discount-badge">{product.discount}% OFF</span>}
    </Link>
    <div className="product-info">
      <StoreBadge seller={product.seller} />
      <Link to={'/products/' + product._id} className="product-title-link"><h3 className="product-name">{product.name}</h3></Link>
      <span className="product-unit">{product.brand ? product.brand + ' · ' : ''}{options ? product.variants.length + ' options' : product.unit}</span>
      <span className="rating-line">{product.reviewCount ? '★ ' + product.ratingAverage.toFixed(1) + ' (' + product.reviewCount + ')' : 'No reviews yet'}</span>
      <div className="product-price-row"><span className="price">{options ? 'From ' : ''}{currency(product.price)}</span>{product.originalPrice > product.price && <span className="original-price">{currency(product.originalPrice)}</span>}</div>
      {!product.available ? <span className="stock-unavailable">Out of stock</span> : options ? <Link className="add-btn choose-options" to={'/products/' + product._id}>Choose option</Link> : item ? <div className="qty-controls">
        <button className="qty-btn" aria-label={'Decrease ' + product.name} disabled={busy || loading} onClick={() => action(() => item.quantity === 1 ? removeItem(product._id) : updateQuantity(product._id, item.quantity - 1))}>−</button>
        <span className="qty-value">{item.quantity}</span>
        <button className="qty-btn" aria-label={'Increase ' + product.name} disabled={busy || loading || (product.stock != null && item.quantity >= product.stock)} onClick={() => action(() => updateQuantity(product._id, item.quantity + 1))}>+</button>
      </div> : <button className="add-btn" disabled={busy || loading} onClick={() => action(() => addToCart(product._id))}>{busy ? 'Adding...' : 'ADD'}</button>}
      {error && <small role="alert" className="text-error">{error}</small>}
    </div>
  </article>;
}
