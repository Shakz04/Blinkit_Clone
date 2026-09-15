import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import ImagePicker from '../components/ImagePicker';
import { useAuth } from '../context/AuthContext';
import { addProduct, getMyProducts, getCategories, updateProduct, deleteProduct, updateStore, getSellerOrders, updateFulfillment } from '../api';
import { currency, dateTime, sellerName, statuses, statusLabels } from '../lib/shop';
import './SellerDashboard.css';

const emptyProduct = { name: '', category: 'Vegetables', brand: '', description: '', ingredients: '', nutrition: '', price: '', originalPrice: '', unit: '1 pc', stock: '', images: [], variants: [], inStock: true };
const defaults = ['Vegetables', 'Fruits', 'Dairy', 'Groceries', 'Beverages', 'Snacks', 'Bakery', 'Personal Care'];
function ProductEditor({ product, categories, onSave, onCancel }) {
  const [form, setForm] = useState(product ? { ...product, originalPrice: product.originalPrice || '', stock: product.stock ?? '', images: product.images?.length ? product.images : [product.image].filter(Boolean), variants: product.variants || [] } : emptyProduct);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const field = (key, label, options = {}) => <label key={key}>{label}<input value={form[key] ?? ''} onChange={event => setForm({ ...form, [key]: event.target.value })} {...options} /></label>;
  const updateOption = (index, key, value) => setForm({ ...form, variants: form.variants.map((option, i) => i === index ? { ...option, [key]: value } : option) });
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock), originalPrice: form.originalPrice === '' ? null : Number(form.originalPrice), variants: form.variants.map(option => ({ ...option, price: Number(option.price), stock: Number(option.stock) })) };
      await onSave(payload);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <form className="panel stack-form product-editor" onSubmit={submit}>
    <div className="section-heading"><h2>{product ? 'Edit product' : 'Add a product'}</h2>{product && <button className="text-button" type="button" onClick={onCancel}>Cancel</button>}</div>
    {field('name', 'Product name', { required: true, maxLength: 150, placeholder: 'Fresh organic tomatoes' })}
    <div className="two-fields"><label>Category<input required list="product-categories" value={form.category} maxLength={80} onChange={event => setForm({ ...form, category: event.target.value })} /><datalist id="product-categories">{categories.map(category => <option key={category} value={category} />)}</datalist></label>{field('brand', 'Brand', { maxLength: 80, placeholder: 'Optional' })}</div>
    <ImagePicker value={form.images} onChange={images => setForm({ ...form, images })} />
    {form.variants.length === 0 && <><div className="two-fields">{field('price', 'Price (₹)', { required: true, type: 'number', min: '0.01', step: '0.01' })}{field('originalPrice', 'Original price (₹)', { type: 'number', min: form.price || '0.01', step: '0.01' })}</div><div className="two-fields">{field('unit', 'Pack size / unit', { required: true, maxLength: 60 })}{field('stock', 'Stock quantity', { required: true, type: 'number', min: 0, step: 1 })}</div></>}
    <fieldset className="options-editor"><legend>Pack size options</legend><p className="muted">Give each size its own price and stock, for example 500 g and 1 kg.</p>
      {form.variants.map((option, index) => <div className="option-editor" key={option._id || index}><label>Option<input required maxLength={60} value={option.label} onChange={event => updateOption(index, 'label', event.target.value)} placeholder="500 g" /></label><label>Price (₹)<input required type="number" min="0.01" step="0.01" value={option.price} onChange={event => updateOption(index, 'price', event.target.value)} /></label><label>Stock<input required type="number" min="0" step="1" value={option.stock} onChange={event => updateOption(index, 'stock', event.target.value)} /></label><button className="text-button text-error" type="button" onClick={() => setForm({ ...form, variants: form.variants.filter((_, i) => i !== index), originalPrice: '' })}>Remove</button></div>)}
      <button type="button" className="button secondary" disabled={form.variants.length >= 12} onClick={() => setForm({ ...form, variants: [...form.variants, { label: '', price: '', stock: '' }], originalPrice: '' })}>+ Add pack size</button>
    </fieldset>
    {['description', 'ingredients', 'nutrition'].map(key => <label key={key}>{key === 'nutrition' ? 'Nutritional information' : key[0].toUpperCase() + key.slice(1)}<textarea rows={key === 'description' ? 3 : 2} maxLength={key === 'description' ? 4000 : 2000} value={form[key] || ''} onChange={event => setForm({ ...form, [key]: event.target.value })} /></label>)}
    <label className="checkbox-label"><input type="checkbox" checked={form.inStock} onChange={event => setForm({ ...form, inStock: event.target.checked })} />Available for sale</label>
    {error && <p className="notice error" role="alert">{error}</p>}
    <button className="button" disabled={busy}>{busy ? 'Saving...' : product ? 'Save product' : 'Publish product'}</button>
  </form>;
}
function StoreEditor() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.sellerProfile?.name || user.name);
  const [description, setDescription] = useState(user.sellerProfile?.description || '');
  const [logos, setLogos] = useState(user.sellerProfile?.logo ? [user.sellerProfile.logo] : []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const submit = async event => {
    event.preventDefault(); setBusy(true); setError(''); setSaved(false);
    try { setUser(await updateStore({ name, description, logo: logos[0] || '' })); setSaved(true); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <form className="panel stack-form store-editor" onSubmit={submit}><h2>Your seller name & logo</h2><p className="muted">Shown on every product you sell. Customers can click your name to visit your storefront.</p><label>Seller / store name<input required maxLength={100} value={name} onChange={event => { setName(event.target.value); setSaved(false); }} /></label><ImagePicker label="Store logo" value={logos} onChange={setLogos} max={1} /><label>About your store<textarea rows={4} maxLength={1000} value={description} onChange={event => setDescription(event.target.value)} /></label>{error && <p className="notice error" role="alert">{error}</p>}{saved && <p className="notice success" role="status">Your storefront has been updated.</p>}<div className="button-row"><button className="button" disabled={busy}>{busy ? 'Saving...' : 'Save storefront'}</button><Link className="button secondary" to={'/stores/' + user._id}>View storefront</Link></div></form>;
}
function SellerOrder({ order, onUpdate }) {
  const group = order.fulfillment;
  const [status, setStatus] = useState(group.status);
  const [partner, setPartner] = useState(group.deliveryPartner || { name: '', phone: '' });
  const [eta, setEta] = useState(() => {
    if (!group.estimatedDeliveryAt || new Date(group.estimatedDeliveryAt) < new Date()) return '';
    const date = new Date(group.estimatedDeliveryAt);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try { await updateFulfillment(order._id, { status, deliveryPartner: partner, estimatedDeliveryAt: eta ? new Date(eta).toISOString() : null }); await onUpdate(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  return <article className="panel seller-order"><div className="section-heading"><div><h3>Order #{order._id.slice(-6).toUpperCase()}</h3><small>{dateTime(order.createdAt)}</small></div><span className="status-pill active">{statusLabels[group.status]}</span></div>
    {order.items.map((item, index) => <p className="order-line" key={index}><span>{item.name} · {item.unit} × {item.quantity}</span><strong>{currency(item.price * item.quantity)}</strong></p>)}
    <p className="order-line"><span>Your order value after discount</span><strong>{currency(order.totalAmount)}</strong></p>
    <p>{order.deliveryAddress.name} · {order.deliveryAddress.phone}<br />{order.deliveryAddress.address}, {order.deliveryAddress.city} – {order.deliveryAddress.pincode}</p>
    {group.status !== 'delivered' && <form className="stack-form" onSubmit={save}><div className="two-fields"><label>Order progress<select value={status} onChange={event => setStatus(event.target.value)}>{statuses.slice(statuses.indexOf(group.status), statuses.indexOf(group.status) + 2).map(value => <option key={value} value={value}>{statusLabels[value]}</option>)}</select></label><label>Estimated delivery<input type="datetime-local" value={eta} onChange={event => setEta(event.target.value)} /></label></div><div className="two-fields"><label>Delivery partner name<input value={partner.name || ''} maxLength={100} onChange={event => setPartner({ ...partner, name: event.target.value })} placeholder="Optional" /></label><label>Delivery partner phone<input type="tel" value={partner.phone || ''} pattern="[6-9][0-9]{9}" maxLength={10} onChange={event => setPartner({ ...partner, phone: event.target.value })} /></label></div>{error && <p className="notice error" role="alert">{error}</p>}<button className="button" disabled={busy}>{busy ? 'Updating...' : 'Update order'}</button></form>}
  </article>;
}
export default function SellerDashboard() {
  const { user, getToken } = useAuth();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [editorKey, setEditorKey] = useState(0);
  const [removing, setRemoving] = useState('');
  const [busy, setBusy] = useState(false);
  const editor = useRef(null);
  const reload = async () => {
    const [items, entries] = await Promise.all([getMyProducts(getToken()), getSellerOrders()]);
    setProducts(items); setOrders(entries); setError('');
  };
  useEffect(() => {
    let active = true;
    Promise.all([getMyProducts(getToken()), getSellerOrders(), getCategories()]).then(([items, entries, cats]) => {
      if (active) { setProducts(items); setOrders(entries); setCategories([...new Set([...defaults, ...cats])].sort()); }
    }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [getToken]);
  useEffect(() => {
    if (tab !== 'orders') return;
    const timer = setInterval(() => { getSellerOrders().then(setOrders).catch(err => setError(err.message)); }, 20000);
    return () => clearInterval(timer);
  }, [tab]);
  const save = async body => {
    const updated = editing ? await updateProduct(editing._id, body) : await addProduct(getToken(), body);
    setProducts(previous => editing ? previous.map(item => item._id === updated._id ? updated : item) : [updated, ...previous]);
    setCategories(previous => [...new Set([...previous, updated.category])].sort());
    setMessage(editing ? 'Product updated.' : 'Product published.');
    setEditing(null); setEditorKey(key => key + 1);
  };
  const remove = async id => {
    setBusy(true); setError('');
    try { await deleteProduct(id); setProducts(items => items.filter(item => item._id !== id)); if (editing?._id === id) setEditing(null); setRemoving(''); setMessage('Product removed from your storefront. Existing orders are preserved.'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const filtered = products.filter(product => [product.name, product.brand, product.category].some(value => value?.toLowerCase().includes(search.toLowerCase())));
  return <><Header /><main className="container commerce-main">
    <div className="section-heading seller-heading"><div><p className="eyebrow">SELLER DASHBOARD</p><h1>{sellerName(user)}</h1><p className="muted">Manage your storefront, inventory and customer orders.</p></div><Link className="button secondary" to={'/stores/' + user._id}>View storefront ↗</Link></div>
    <div className="stats-grid"><div className="panel stat"><span>Products</span><strong>{products.length}</strong></div><div className="panel stat"><span>Active orders</span><strong>{orders.filter(order => order.fulfillment.status !== 'delivered').length}</strong></div><div className="panel stat"><span>Delivered order value</span><strong>{currency(orders.filter(order => order.fulfillment.status === 'delivered').reduce((sum, order) => sum + order.totalAmount, 0))}</strong></div><div className="panel stat"><span>Low stock products</span><strong>{products.filter(product => product.variants?.length ? product.variants.some(option => option.stock <= 5) : product.stock != null && product.stock <= 5).length}</strong></div></div>
    <nav className="dashboard-tabs" aria-label="Seller dashboard sections">{[['products', 'Products & inventory'], ['orders', 'Manage orders'], ['store', 'Seller name & logo']].map(([value, label]) => <button key={value} type="button" aria-current={tab === value ? 'page' : undefined} className={tab === value ? 'active' : ''} onClick={() => { setTab(value); setMessage(''); }}>{label}</button>)}</nav>
    {error && <p className="notice error" role="alert">{error} <button className="text-button" onClick={() => reload().catch(err => setError(err.message))}>Retry</button></p>}{message && <p className="notice success" role="status">{message}</p>}
    {tab === 'store' ? <StoreEditor /> : loading ? <p role="status">Loading your dashboard...</p> : tab === 'products' ? <div className="seller-grid"><div ref={editor}><ProductEditor key={(editing?._id || 'new') + ':' + editorKey} product={editing} categories={categories} onSave={save} onCancel={() => setEditing(null)} /></div><section className="panel inventory-panel"><div className="section-heading"><h2>Your products</h2><input className="inventory-search" type="search" aria-label="Search your inventory" placeholder="Search inventory..." value={search} onChange={event => setSearch(event.target.value)} /></div><div className="inventory-table-wrap"><table className="inventory-table"><thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>{filtered.map(product => <tr key={product._id}><td><div className="inventory-product"><img src={product.image} alt="" /><div><Link to={'/products/' + product._id}><strong>{product.name}</strong></Link><small>{product.category} · {product.unit}</small></div></div></td><td>{currency(product.price)}</td><td>{product.stock == null ? 'Set quantity' : product.stock}<small className={product.available ? 'text-success' : 'text-error'}>{product.available ? 'Available' : 'Unavailable'}</small></td><td><div className="inventory-actions"><button className="text-button" onClick={() => { setEditing(product); setEditorKey(key => key + 1); editor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Edit</button>{removing === product._id ? <><button className="text-button text-error" disabled={busy} onClick={() => remove(product._id)}>Confirm removal</button><button className="text-button" onClick={() => setRemoving('')}>Keep</button></> : <button className="text-button text-error" onClick={() => setRemoving(product._id)}>Remove</button>}</div></td></tr>)}</tbody></table></div>{!filtered.length && <p className="muted empty">No products found. Add a product to get started.</p>}</section></div> : <section className="seller-order-list">{orders.length ? orders.map(order => <SellerOrder key={order._id + ':' + order.fulfillment.status} order={order} onUpdate={reload} />) : <div className="panel empty"><h2>No customer orders yet</h2><p>Orders containing your products will appear here.</p></div>}</section>}
  </main></>;
}
