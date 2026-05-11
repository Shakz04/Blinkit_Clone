import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { addProduct, getMyProducts, getCategories } from '../api';
import './SellerDashboard.css';

const DEFAULT_CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Groceries', 'Beverages', 'Snacks', 'Bakery'];

export default function SellerDashboard() {
  const { user, getToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    image: '',
    category: '',
    unit: '1 pc',
    discount: 0,
  });

  const token = getToken();

  useEffect(() => {
    const load = async () => {
      try {
        const [prods, cats] = await Promise.all([
          getMyProducts(token),
          getCategories().catch(() => DEFAULT_CATEGORIES),
        ]);
        setProducts(prods);
        if (cats?.length) setCategories([...new Set([...DEFAULT_CATEGORIES, ...cats])].sort());
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAdding(true);
    try {
      const product = await addProduct(token, {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        image: form.image.trim() || undefined,
        category: form.category || categories[0],
        unit: form.unit || '1 pc',
        discount: parseInt(form.discount) || 0,
      });
      setProducts([product, ...products]);
      setForm({ name: '', description: '', price: '', originalPrice: '', image: '', category: '', unit: '1 pc', discount: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="seller-page">
      <Header />
      <main className="seller-main">
        <div className="container">
          <h1 className="seller-title">Seller Dashboard</h1>
          <p className="seller-welcome">Welcome, {user?.name}</p>

          <section className="add-product-section">
            <h2>Add New Product</h2>
            <form onSubmit={handleSubmit} className="product-form">
              {error && <p className="form-error">{error}</p>}
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Product Name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Price (₹) *"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Image URL"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Unit (e.g. 1 kg, 500g)"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Original Price (₹)"
                  value={form.originalPrice}
                  onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                  min="0"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Discount %"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  min="0"
                  max="100"
                />
              </div>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
              <button type="submit" disabled={adding}>
                {adding ? 'Adding...' : 'Add Product'}
              </button>
            </form>
          </section>

          <section className="my-products-section">
            <h2>My Products ({products.length})</h2>
            {loading ? (
              <p>Loading...</p>
            ) : products.length === 0 ? (
              <p className="empty-msg">No products yet. Add your first product above.</p>
            ) : (
              <div className="seller-product-grid">
                {products.map((p) => (
                  <div key={p._id} className="seller-product-card">
                    <img src={p.image} alt={p.name} />
                    <div className="seller-product-info">
                      <h3>{p.name}</h3>
                      <p>₹{p.price} • {p.unit}</p>
                      <span className="category-badge">{p.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
