import './CategoryTabs.css';

export default function CategoryTabs({ categories, active, onSelect }) {
  const labels = ['all', ...categories];

  return (
    <div className="category-tabs">
      {labels.map((cat) => (
        <button
          key={cat}
          className={`category-tab ${active === cat ? 'active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          <span className="category-icon" aria-hidden="true">{cat === 'all' ? 'A' : cat.slice(0, 1)}</span>
          <span>{cat === 'all' ? 'All Products' : cat}</span>
        </button>
      ))}
    </div>
  );
}
