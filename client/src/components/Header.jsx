import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header({ onSearch, searchValue }) {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [localSearch, setLocalSearch] = useState(searchValue || '');
  const [showMenu, setShowMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(localSearch.trim());
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-text">blinkit</span>
        </Link>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for products..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </form>

        <div className="header-actions">
          {user ? (
            <div className="user-menu-wrap">
              <button
                className="user-btn"
                onClick={() => setShowMenu(!showMenu)}
                aria-expanded={showMenu}
              >
                {user.name}
                {user.role === 'seller' && <span className="role-tag">Seller</span>}
              </button>
              {showMenu && (
                <>
                  <div className="menu-backdrop" onClick={() => setShowMenu(false)} />
                  <div className="user-menu">
                    {user.role === 'seller' && (
                      <Link to="/seller" onClick={() => setShowMenu(false)}>Seller Dashboard</Link>
                    )}
                    <button onClick={() => { logout(); setShowMenu(false); }}>Logout</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="auth-link">Login</Link>
              <Link to="/register" className="auth-link register">Register</Link>
            </div>
          )}

          <Link to="/orders" className="header-link">Orders</Link>
          <Link to="/cart" className="cart-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="cart-count">{cartCount}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
