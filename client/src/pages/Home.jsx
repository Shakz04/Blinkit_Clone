import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getCategories, getProducts, getSeller } from '../api';
import CatalogFilters from '../components/CatalogFilters';
import CategoryTabs from '../components/CategoryTabs';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { sellerName } from '../lib/shop';
import './Home.css';

const categoryImages = {
  Bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=240&h=240&fit=crop',
  Beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=240&h=240&fit=crop',
  Dairy: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=240&h=240&fit=crop',
  Fruits: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=240&h=240&fit=crop',
  Groceries: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=240&h=240&fit=crop',
  'Personal Care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=240&h=240&fit=crop',
  Snacks: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=240&h=240&fit=crop',
  Vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=240&h=240&fit=crop',
};

const fallbackCategoryImage = 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=240&h=240&fit=crop';
const searchFilterKeys = ['brand', 'minPrice', 'maxPrice', 'availability', 'minRating', 'minDiscount', 'sort'];

function productQuery(query) {
  const next = new URLSearchParams(query);
  if (!next.get('search')?.trim()) searchFilterKeys.forEach(key => next.delete(key));
  return next.toString();
}

export default function Home() {
  const { sellerId } = useParams();
  const [params, setParams] = useSearchParams();
  const query = params.toString();
  const effectiveQuery = productQuery(query);
  const filters = Object.fromEntries(params);
  const searchTerm = filters.search?.trim() || '';
  const hasSearch = Boolean(searchTerm);
  const [result, setResult] = useState({ products: [], brands: [], total: 0, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [storeError, setStoreError] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!sellerId) return;
    let active = true;
    getSeller(sellerId)
      .then(data => {
        if (active) {
          setStore(data);
          setStoreError('');
        }
      })
      .catch(err => {
        if (active) setStoreError(err.message);
      });
    return () => { active = false; };
  }, [sellerId]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      getProducts({ ...Object.fromEntries(new URLSearchParams(effectiveQuery)), seller: sellerId }, controller.signal)
        .then(setResult)
        .catch(err => {
          if (err.name !== 'AbortError') setError(err.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [effectiveQuery, sellerId]);

  const update = values => {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    if (!Object.hasOwn(values, 'page')) next.delete('page');
    setParams(next);
  };

  const startSearch = value => {
    const next = new URLSearchParams();
    const search = value.trim();
    if (search) next.set('search', search);
    setParams(next);
  };

  const browseCategory = category => {
    const next = new URLSearchParams();
    if (category !== 'all') next.set('category', category);
    setParams(next);
    requestAnimationFrame(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' }));
  };

  const selectCategory = category => {
    if (hasSearch) update({ category: category === 'all' ? '' : category });
    else browseCategory(category);
  };

  const catalogTitle = hasSearch
    ? `Search results for “${searchTerm}”`
    : filters.category || (sellerId ? 'Products from this store' : 'Shop all products');

  return <div className="home">
    <Header onSearch={startSearch} searchValue={searchTerm} />
    <main className="main">
      <div className="container">
        {sellerId ? <section className="store-hero">
          {storeError ? <p className="notice error" role="alert">{storeError}</p> : store?._id === sellerId ? <>
            {store.sellerProfile?.logo ? <img className="store-logo large" src={store.sellerProfile.logo} alt={sellerName(store) + ' logo'} /> : <div className="store-avatar">{sellerName(store)[0]}</div>}
            <div><p className="eyebrow">SELLER STOREFRONT</p><h1>{sellerName(store)}</h1><p>{store.sellerProfile?.description || 'Explore everything this seller has to offer.'}</p><Link to="/">Browse all stores</Link></div>
          </> : <p>Loading store...</p>}
        </section> : <div className="hero-banner"><div><h1>Fresh groceries at your door</h1><p>Discover everyday essentials from our community of sellers.</p><a className="button" href="#catalog">Explore products</a></div></div>}

        {!sellerId && !hasSearch && <section className="category-showcase" aria-labelledby="shop-by-category-heading">
          <div className="section-heading">
            <h2 id="shop-by-category-heading">Shop by Category</h2>
            <button type="button" className="category-see-all" onClick={() => browseCategory('all')}>See all</button>
          </div>
          <div className="category-strip">
            {categories.map(category => <button
              type="button"
              className={`category-tile ${filters.category === category ? 'active' : ''}`}
              key={category}
              onClick={() => browseCategory(category)}
            >
              <img src={categoryImages[category] || fallbackCategoryImage} alt="" />
              <span>{category}</span>
            </button>)}
          </div>
        </section>}

        <section id="catalog" className="catalog-layout">
          <aside className="catalog-sidebar">
            <h2>Categories</h2>
            <CategoryTabs categories={categories} active={filters.category || 'all'} onSelect={selectCategory} />
          </aside>
          <div className="catalog-content">
            <div className="section-heading catalog-heading"><div>
              <h2>{catalogTitle}</h2>
              <p>{hasSearch ? 'Filter or sort these matches.' : 'Find your next favourite.'} · {result.total} products</p>
            </div></div>
            {hasSearch && <CatalogFilters filters={filters} brands={result.brands} onChange={update} />}
            {loading ? <div className="loading" role="status">Loading products...</div> : error ? <div className="notice error" role="alert">{error}</div> : result.products.length === 0 ? <div className="empty"><h3>No matching products</h3><p>Try a different search or clear your filters.</p><button className="button secondary" onClick={() => setParams({})}>Clear all filters</button></div> : <div className="product-grid">{result.products.map(product => <ProductCard key={product._id} product={product} />)}</div>}
            {!error && result.pages > 1 && <nav className="pagination" aria-label="Product pages"><button className="button secondary" disabled={loading || result.page <= 1} onClick={() => update({ page: String(result.page - 1) })}>Previous</button><span>Page {result.page} of {result.pages}</span><button className="button secondary" disabled={loading || result.page >= result.pages} onClick={() => update({ page: String(result.page + 1) })}>Next</button></nav>}
          </div>
        </section>
      </div>
    </main>
  </div>;
}
