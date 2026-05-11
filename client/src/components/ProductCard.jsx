import { useState } from 'react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, cart, updateQuantity, removeItem } = useCart();
  const cartItem = cart.items?.find((i) => i.product?._id === product._id);
  const inCart = !!cartItem;
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (adding) return;
    setAdding(true);
    await addToCart(product._id, 1);
    setAdding(false);
  };

  const handleInc = () => {
    updateQuantity(product._id, (cartItem?.quantity || 0) + 1);
  };

  const handleDec = () => {
    const qty = cartItem?.quantity || 0;
    if (qty <= 1) removeItem(product._id);
    else updateQuantity(product._id, qty - 1);
  };

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" />
        {product.discount > 0 && (
          <span className="discount-badge">{product.discount}% OFF</span>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <span className="product-unit">{product.unit}</span>
        <div className="product-price-row">
          <span className="price">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="original-price">₹{product.originalPrice}</span>
          )}
        </div>
        {inCart ? (
          <div className="qty-controls">
            <button onClick={handleDec} className="qty-btn" aria-label="Decrease">
              −
            </button>
            <span className="qty-value">{cartItem.quantity}</span>
            <button onClick={handleInc} className="qty-btn" aria-label="Increase">
              +
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={adding}
            className="add-btn"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        )}
      </div>
    </div>
  );
}
