import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import StoreBadge from '../components/StoreBadge';
import ImagePicker from '../components/ImagePicker';
import { getProduct, getReviews, saveReview } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { currency, dateTime } from '../lib/shop';

function ReviewForm({ productId, review, onSaved }) {
  const [rating, setRating] = useState(review?.rating || 5);
  const [comment, setComment] = useState(review?.comment || '');
  const [photos, setPhotos] = useState(review?.photos || []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try { await saveReview(productId, { rating, comment, photos }); await onSaved(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <form className="stack-form review-form" onSubmit={submit}>
    <h3>{review ? 'Edit your review' : 'Share your experience'}</h3>
    <label>Your rating<select value={rating} onChange={event => setRating(Number(event.target.value))}>{[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{'★'.repeat(value)} · {value} {value === 1 ? 'star' : 'stars'}</option>)}</select></label>
    <label>Your review<textarea required maxLength={2000} rows={4} value={comment} onChange={event => setComment(event.target.value)} placeholder="What did you like? How was the quality?" /></label>
    <ImagePicker label="Review photos" max={3} value={photos} onChange={setPhotos} />
    {error && <p className="notice error" role="alert">{error}</p>}
    <button className="button" disabled={busy}>{busy ? 'Saving...' : review ? 'Update review' : 'Post review'}</button>
  </form>;
}
function Detail({ id }) {
  const { user } = useAuth();
  const { cart, addToCart, updateQuantity, removeItem, error: cartError, loading: cartLoading } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selected, setSelected] = useState('');
  const [hero, setHero] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([getProduct(id), getReviews(id)]).then(([data, entries]) => {
      if (!active) return;
      setProduct(data); setReviews(entries);
      setSelected(data.variants?.find(option => option.stock > 0)?._id || data.variants?.[0]?._id || '');
      setHero(data.images?.[0] || data.image);
    }).catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [id]);
  const variant = product?.variants?.find(option => option._id === selected);
  const stock = variant ? variant.stock : product?.stock;
  const available = product?.available && (stock == null || stock > 0);
  const item = cart.items.find(entry => entry.product?._id === id && (entry.variantId || '') === selected);
  const change = async delta => {
    setBusy(true); setMessage('');
    const ok = !item ? await addToCart(id, 1, selected) : item.quantity + delta <= 0 ? await removeItem(id, selected) : await updateQuantity(id, item.quantity + delta, selected);
    if (ok) setMessage(delta < 0 ? 'Cart updated.' : 'Added to your cart.');
    setBusy(false);
  };
  const refreshReviews = async () => {
    const [updated, entries] = await Promise.all([getProduct(id), getReviews(id)]);
    setProduct(updated); setReviews(entries); setMessage('Your review has been saved.');
  };
  return <><Header /><main className="container commerce-main">
    <Link className="back-link" to="/">← Back to products</Link>
    {error ? <p className="notice error" role="alert">{error}</p> : !product ? <p role="status">Loading product...</p> : <>
      <section className="detail-grid">
        <div className="panel gallery"><img className="gallery-main" src={hero} alt={product.name} /><div className="gallery-thumbs">{[...new Set([product.image, ...(product.images || [])].filter(Boolean))].map((src, index) => <button key={src} className={hero === src ? 'selected' : ''} aria-label={'View photo ' + (index + 1)} aria-pressed={hero === src} onClick={() => setHero(src)}><img src={src} alt="" /></button>)}</div></div>
        <div className="panel detail-copy"><p className="eyebrow">{product.category}{product.brand ? ' / ' + product.brand : ''}</p><h1>{product.name}</h1><StoreBadge seller={product.seller} />
          <a href="#reviews" className="detail-rating">{product.reviewCount ? '★ ' + product.ratingAverage.toFixed(1) + ' · ' + product.reviewCount + ' reviews' : 'Be the first to review'}</a>
          <p className="detail-price">{currency(variant?.price ?? product.price)}{!variant && product.originalPrice > product.price && <del>{currency(product.originalPrice)}</del>}</p>
          {product.variants?.length > 0 ? <fieldset className="variant-picker"><legend>Choose a pack size</legend>{product.variants.map(option => <button key={option._id} type="button" className={selected === option._id ? 'selected' : ''} aria-pressed={selected === option._id} onClick={() => { setSelected(option._id); setMessage(''); }}><strong>{option.label}</strong><span>{currency(option.price)}</span>{option.stock === 0 && <small>Sold out</small>}</button>)}</fieldset> : <p>{product.unit}</p>}
          <p className={available ? 'text-success' : 'text-error'}>{available ? stock == null ? 'In stock' : stock <= 5 ? 'Only ' + stock + ' left in stock' : 'In stock' : 'Currently out of stock'}</p>
          {item ? <div className="detail-cart-actions"><div className="qty-controls"><button className="qty-btn" aria-label="Decrease quantity" disabled={busy || cartLoading} onClick={() => change(-1)}>−</button><span className="qty-value">{item.quantity}</span><button className="qty-btn" aria-label="Increase quantity" disabled={busy || cartLoading || !available || (stock != null && item.quantity >= stock)} onClick={() => change(1)}>+</button></div><Link className="button secondary" to="/cart">View cart</Link></div> : <button className="button purchase-button" disabled={!available || busy || cartLoading} onClick={() => change(1)}>{busy ? 'Adding...' : available ? 'Add to cart' : 'Out of stock'}</button>}
          {cartError && <p className="notice error" role="alert">{cartError}</p>}{message && <p className="notice success" role="status">{message}</p>}
          <h2>About this product</h2><p className="preserve-lines">{product.description || 'The seller has not added a description yet.'}</p>
          {product.ingredients && <><h3>Ingredients</h3><p className="preserve-lines">{product.ingredients}</p></>}
          {product.nutrition && <><h3>Nutritional information</h3><p className="preserve-lines">{product.nutrition}</p></>}
        </div>
      </section>
      <section id="reviews" className="panel reviews-section"><div className="section-heading"><div><p className="eyebrow">CUSTOMER EXPERIENCES</p><h2>Ratings & reviews</h2><p>{product.reviewCount ? product.ratingAverage.toFixed(1) + ' out of 5 · ' + product.reviewCount + ' reviews' : 'No reviews yet.'}</p></div></div>
        <div className="reviews-layout"><div>{reviews.map(review => <article key={review._id} className="review-entry"><div className="review-header"><strong>{review.user?.name || 'Customer'}</strong><span className="rating-line" aria-label={review.rating + ' out of 5 stars'}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span></div><small>{dateTime(review.createdAt)} {review.verifiedPurchase && <span className="verified-badge">Verified purchase</span>}</small><p className="preserve-lines">{review.comment}</p><div className="review-photos">{review.photos.map((src, index) => <a key={index} href={src} target="_blank" rel="noreferrer"><img src={src} alt={'Customer photo ' + (index + 1)} loading="lazy" /></a>)}</div></article>)}{reviews.length === 0 && <p className="muted">Share the first review to help other shoppers.</p>}</div>
          {!user ? <p><Link to="/login" state={{ from: '/products/' + id }}>Sign in</Link> to write a review.</p> : product.seller?._id === user._id ? <p className="muted">Customer reviews for your product will appear here.</p> : <ReviewForm key={user._id + ':' + (reviews.find(review => review.user?._id === user._id)?._id || 'new')} productId={id} review={reviews.find(review => review.user?._id === user._id)} onSaved={refreshReviews} />}
        </div>
      </section>
    </>}
  </main></>;
}
export default function ProductDetails() {
  const { id } = useParams();
  return <Detail key={id} id={id} />;
}
