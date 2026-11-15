import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import './Properties.css';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [type, setType] = useState(searchParams.get('property_type') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [sortBy, setSortBy] = useState('price-desc');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await api.getProperties({
        search,
        city,
        property_type: type,
        min_price: minPrice,
        max_price: maxPrice,
        bedrooms
      });

      let sorted = [...data];
      if (sortBy === 'price-asc') sorted.sort((a, b) => Number(a.price) - Number(b.price));
      if (sortBy === 'price-desc') sorted.sort((a, b) => Number(b.price) - Number(a.price));
      setProperties(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [city, type, minPrice, maxPrice, bedrooms, sortBy]);

  const handleReset = () => {
    setSearch('');
    setCity('');
    setType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setSortBy('price-desc');
    setSearchParams({});
  };

  return (
    <div className="properties-page">
      <div className="properties-header">
        <div className="container">
          <span className="page-tag">Private Portfolio</span>
          <h1>Luxury Properties Across North India</h1>
          <p>Browse verified high-value penthouses, villas, and boutique luxury residences.</p>
        </div>
      </div>

      <div className="container properties-body">
        {/* FILTERS SIDEBAR */}
        <aside className="filters-sidebar">
          <div className="filters-head">
            <h3><SlidersHorizontal size={18} /> Refine Portfolio</h3>
            <button className="btn-reset" onClick={handleReset}><RefreshCw size={14} /> Reset</button>
          </div>

          <div className="filter-group">
            <label>Location / City</label>
            <select value={city} onChange={e => setCity(e.target.value)}>
              <option value="">All Locations</option>
              <option value="Gurugram">Gurugram</option>
              <option value="New Delhi">New Delhi</option>
              <option value="Noida">Noida</option>
              <option value="Faridabad">Faridabad</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Property Type</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="">All Typologies</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Villa">Luxury Villa</option>
              <option value="Apartment">Designer Apartment</option>
              <option value="Independent Floor">Builder Floor</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Bedrooms</label>
            <div className="bedroom-pills">
              {['Any', '3', '4', '5+'].map((b) => (
                <button
                  key={b}
                  className={`pill ${bedrooms === (b === 'Any' ? '' : b.replace('+', '')) ? 'active' : ''}`}
                  onClick={() => setBedrooms(b === 'Any' ? '' : b.replace('+', ''))}
                >
                  {b} {b !== 'Any' && 'BHK'}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Price Range (₹ INR)</label>
            <div className="price-inputs">
              <input type="number" placeholder="Min (₹)" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              <span>to</span>
              <input type="number" placeholder="Max (₹)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            </div>
          </div>
        </aside>

        {/* RESULTS GRID */}
        <main className="properties-results">
          <div className="results-toolbar">
            <p className="results-count">Showing <strong>{properties.length}</strong> landmark estates</p>
            <div className="sort-dropdown">
              <label>Sort By:</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading portfolio...</div>
          ) : properties.length === 0 ? (
            <div className="empty-results">No residences match your criteria. Try adjusting filters.</div>
          ) : (
            <div className="properties-grid">
              {properties.map(p => (
                <PropertyCard key={p.property_id} property={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}