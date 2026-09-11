import { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../api';
import Header from '../components/Header';
import CategoryTabs from '../components/CategoryTabs';
import ProductCard from '../components/ProductCard';
import './Home.css';

const FEATURED_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Dairy',
  'Snacks',
  'Beverages',
  'Bakery',
  'Groceries',
  'Personal Care',
];

const categoryImages = {
  Vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=240&q=80',
  Fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=240&q=80',
  Dairy: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=240&q=80',
  Snacks: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=240&q=80',
  Beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=240&q=80',
  Bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&q=80',
  Groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=240&q=80',
  'Personal Care': 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=240&q=80',
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const prods = await getProducts(category === 'all' ? '' : category, search);
        setProducts(prods);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category, search]);

  return (
    <div className="home">
      <Header onSearch={setSearch} searchValue={search} />
      <main className="main">
        <div className="container">
          <div className="hero-banner">
            <div>
              <h1>Fresh groceries at your door</h1>
              <p>Shop daily essentials, produce, snacks, and pantry staples in minutes.</p>
              <button type="button" onClick={() => setCategory('all')}>Shop now</button>
            </div>
          </div>

          <section className="category-showcase" aria-labelledby="category-title">
            <div className="section-heading">
              <h2 id="category-title">Shop by Category</h2>
              <button type="button" onClick={() => setCategory('all')}>See all</button>
            </div>
            <div className="category-strip">
              {FEATURED_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`category-tile ${category === cat ? 'active' : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  <img src={categoryImages[cat]} alt="" />
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="catalog-layout">
            <aside className="catalog-sidebar">
              <h2>Categories</h2>
              <CategoryTabs categories={categories} active={category} onSelect={setCategory} />
            </aside>
            <div className="catalog-content">
              <div className="section-heading catalog-heading">
                <div>
                  <h2>{category === 'all' ? 'Trending Products' : category}</h2>
                  <p>{search ? `Showing results for "${search}"` : 'Fresh picks for quick checkout.'}</p>
                </div>
              </div>
              {loading ? (
                <div className="loading">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="empty">No products found. Try a different category or search.</div>
              ) : (
                <div className="product-grid">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
