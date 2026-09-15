export default function CatalogFilters({ filters, brands, onChange }) {
  return <div className="catalog-filters" aria-label="Filter products">
    <label>Brand<select value={filters.brand || ''} onChange={event => onChange({ brand: event.target.value })}><option value="">All brands</option>{[...new Set([...(brands || []), filters.brand].filter(Boolean))].map(brand => <option key={brand}>{brand}</option>)}</select></label>
    <label>Min price<input aria-label="Minimum price" type="number" min="0" value={filters.minPrice || ''} placeholder="₹0" onChange={event => onChange({ minPrice: event.target.value })} /></label>
    <label>Max price<input aria-label="Maximum price" type="number" min="0" value={filters.maxPrice || ''} placeholder="Any" onChange={event => onChange({ maxPrice: event.target.value })} /></label>
    <label>Availability<select value={filters.availability || 'all'} onChange={event => onChange({ availability: event.target.value })}><option value="all">All products</option><option value="in">In stock</option><option value="out">Out of stock</option></select></label>
    <label>Rating<select value={filters.minRating || ''} onChange={event => onChange({ minRating: event.target.value })}><option value="">Any rating</option><option value="4">4 stars & up</option><option value="3">3 stars & up</option></select></label>
    <label>Discount<select value={filters.minDiscount || ''} onChange={event => onChange({ minDiscount: event.target.value })}><option value="">Any discount</option><option value="10">10% & up</option><option value="25">25% & up</option><option value="50">50% & up</option></select></label>
    <label>Sort by<select value={filters.sort || 'newest'} onChange={event => onChange({ sort: event.target.value })}><option value="newest">Newest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option><option value="popular">Most popular</option><option value="rating">Highest rated</option><option value="discount">Biggest discount</option></select></label>
    <button type="button" className="button secondary" onClick={() => onChange({ brand: '', minPrice: '', maxPrice: '', availability: '', minRating: '', minDiscount: '', sort: '' })}>Reset filters</button>
  </div>;
}
