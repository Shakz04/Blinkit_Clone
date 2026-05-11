import { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../api';
import Header from '../components/Header';
import CategoryTabs from '../components/CategoryTabs';
import ProductCard from '../components/ProductCard';
import './Home.css';

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
            <h1>Groceries delivered in minutes</h1>
            <p>30,000+ products at your doorstep</p>
          </div>
          <CategoryTabs categories={categories} active={category} onSelect={setCategory} />
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
      </main>
    </div>
  );
}
