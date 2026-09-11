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
  const [inventorySearch, setInventorySearch] = useState('');
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
      } catch {
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

  const filteredProducts = products.filter((product) => {
    const term = inventorySearch.trim().toLowerCase();
    if (!term) return true;
    return [product.name, product.category, product.unit]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term));
  });

  return (
    <div className="seller-page">
      <Header />
      <main className="seller-main">
        <div className="container">
          <div className="seller-heading">
            <h1 className="seller-title">Seller Portal</h1>
            <p className="seller-welcome">Manage your inventory and monitor fresh stock, {user?.name}.</p>
          </div>

          <div className="seller-grid">
            <section className="add-product-section">
              <div className="panel-title">
                <span className="panel-icon">+</span>
                <h2>Add New Product</h2>
              </div>
              <form onSubmit={handleSubmit} className="product-form">
                {error && <p className="form-error">{error}</p>}
                <label>
                  <span>Product Name</span>
                  <input
                    type="text"
                    placeholder="e.g. Fresh Organic Tomato"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  <span>Category</span>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <div className="form-row compact">
                  <label>
                    <span>Price (Rs.)</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      min="0"
                      step="0.01"
                      required
                    />
                  </label>
                  <label>
                    <span>Unit</span>
                    <input
                      type="text"
                      placeholder="1 kg"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    />
                  </label>
                </div>
                <div className="form-row compact">
                  <label>
                    <span>Original Price</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.originalPrice}
                      onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </label>
                  <label>
                    <span>Discount %</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.discount}
                      onChange={(e) => setForm({ ...form, discount: e.target.value })}
                      min="0"
                      max="100"
                    />
                  </label>
                </div>
                <label>
                  <span>Image URL</span>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                </label>
                <label>
                  <span>Description</span>
                  <textarea
                    placeholder="Fresh stock details"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </label>
                <button type="submit" disabled={adding}>
                  {adding ? 'Publishing...' : 'Publish Product'}
                </button>
              </form>
            </section>

            <section className="my-products-section">
              <div className="inventory-header">
                <div className="panel-title">
                  <span className="panel-icon muted">I</span>
                  <h2>Your Products</h2>
                </div>
                <input
                  type="search"
                  placeholder="Search inventory..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="inventory-search"
                />
              </div>
              {loading ? (
                <p className="inventory-state">Loading...</p>
              ) : products.length === 0 ? (
                <p className="inventory-state">No products yet. Add your first product.</p>
              ) : (
                <>
                  <div className="inventory-table-wrap">
                    <table className="inventory-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Product Details</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((p) => (
                          <tr key={p._id}>
                            <td>
                              <img src={p.image} alt={p.name} />
                            </td>
                            <td>
                              <strong>{p.name}</strong>
                              <span>{p.category} - {p.unit}</span>
                            </td>
                            <td className="inventory-price">Rs.{p.price}</td>
                            <td>
                              <span className={`stock-dot ${p.inStock === false ? 'out' : ''}`} />
                              {p.inStock === false ? '0' : 'Live'}
                            </td>
                            <td>
                              <span className={`status-pill ${p.inStock === false ? 'out' : 'active'}`}>
                                {p.inStock === false ? 'Out of Stock' : 'Active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="inventory-footer">
                    Showing {filteredProducts.length} of {products.length} products
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
