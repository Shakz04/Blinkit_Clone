import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function Search({ value, onSearch }) {
  const [search, setSearch] = useState(value);
  return <form className="search-bar" onSubmit={event => { event.preventDefault(); onSearch(search.trim()); }}><input type="search" aria-label="Search products" placeholder="Search products, brands..." value={search} onChange={event => setSearch(event.target.value)} className="search-input" /><button className="search-btn" type="submit">Search</button></form>;
}
export default function Header({ onSearch, searchValue }) {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const initialSearch = searchValue ?? new URLSearchParams(location.search).get('search') ?? '';
  const search = value => onSearch ? onSearch(value) : navigate('/?' + new URLSearchParams({ search: value }));
  return <header className="header"><div className="header-inner">
    <Link to="/" className="logo"><span className="logo-mark" aria-hidden="true">B</span><span className="logo-text">FreshDash</span></Link>
    <Search key={initialSearch + location.pathname} value={initialSearch} onSearch={search} />
    <div className="header-actions">
      {user ? <div className="user-menu-wrap"><button className="user-btn" aria-expanded={showMenu} onClick={() => setShowMenu(!showMenu)}><span className="user-avatar" aria-hidden="true">{user.name[0]}</span><span className="user-name">{user.name}</span>{user.role === 'seller' && <span className="role-tag">Seller</span>}</button>{showMenu && <><button className="menu-backdrop" aria-label="Close account menu" onClick={() => setShowMenu(false)} /><div className="user-menu"><Link to="/profile" onClick={() => setShowMenu(false)}>Profile & addresses</Link>{user.role === 'seller' && <Link to="/seller" onClick={() => setShowMenu(false)}>Seller dashboard</Link>}<button onClick={() => { logout(); setShowMenu(false); navigate('/'); }}>Logout</button></div></>}</div> : <div className="auth-links"><Link to="/login" className="auth-link">Login</Link><Link to="/register" className="auth-link register">Register</Link></div>}
      <Link to="/orders" className="header-link">Orders</Link><Link to="/cart" className="cart-btn"><span>Cart</span><span className="cart-count">{cartCount}</span></Link>
    </div>
  </div></header>;
}
