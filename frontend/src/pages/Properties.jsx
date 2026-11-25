import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, RefreshCw, Building2 } from 'lucide-react';
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
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [sortBy, setSortBy] = useState('price-desc');

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await api.getProperties({
        search,
        city,
        property_type: type,
        bedrooms,
        status: status || undefined
      });

      let sorted = [...data];
      if (sortBy === 'price-asc') sorted.sort((a, b) => Number(a.price) - Number(b.price));
      else if (sortBy === 'price-desc') sorted.sort((a, b) => Number(b.price) - Number(a.price));
      else if (sortBy === 'newest') sorted.sort((a, b) => (b.property_id || 0) - (a.property_id || 0));
      setProperties(sorted);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [city, type, bedrooms, status, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const handleReset = () => {
    setSearch('');
    setCity('');
    setType('');
    setBedrooms('');
    setStatus('');
    setSortBy('price-desc');
    setSearchParams({});
  };

  return (
    <div className="properties-page-root">
      {/* Header Banner */}
      <div className="properties-header-banner">
        <div className="container">
          <span className="badge-luxury" style={{ marginBottom: '14px' }}>Private Portfolio</span>
          <h1>Luxury Properties Across North India</h1>
          <p>
            Browse verified high-value penthouses, bespoke villas, and boutique luxury residences curated for discerning buyers.
          </p>
        </div>
      </div>

      {/* Main Filter & Results Container */}
      <div className="container properties-main-container">
        {/* Filter Panel Card */}
        <div className="filter-panel-card">
          {/* Top Row: Search input & Sorting */}
          <div className="filter-top-row">
            <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search by title, address, description, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" className="clear-search-btn" onClick={() => { setSearch(''); fetchProperties(); }}>
                  ×
                </button>
              )}
            </form>

            <div className="sort-wrapper">
              <label>Sort By:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="newest">Newest Listed</option>
              </select>
            </div>
          </div>

          {/* Filters Grid */}
          <div className="filters-grid">
            <div className="filter-select-group">
              <label>Location / City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">All Locations</option>
                <option value="Gurugram">Gurugram</option>
                <option value="New Delhi">New Delhi</option>
                <option value="Noida">Noida</option>
                <option value="Faridabad">Faridabad</option>
              </select>
            </div>

            <div className="filter-select-group">
              <label>Estate Typology</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">All Typologies</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Villa">Luxury Villa</option>
                <option value="Apartment">Designer Apartment</option>
                <option value="Independent Floor">Bespoke Floor</option>
              </select>
            </div>

            <div className="filter-select-group">
              <label>Bedrooms</label>
              <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                <option value="">Any Bedrooms</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>

            <div className="filter-select-group">
              <label>Listing Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Under Offer">Under Offer</option>
                <option value="Sold">Sold</option>
              </select>
            </div>

            <div className="filter-action-group">
              <button type="button" className="btn-reset-filters" onClick={handleReset}>
                <RefreshCw size={14} /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Results Info Bar */}
        <div className="results-info-bar">
          <p className="results-count">
            Showing <strong>{properties.length}</strong> landmark estates
          </p>
          {(city || type || bedrooms || status) && (
            <div className="active-filters-badges">
              {city && <span className="active-pill">City: {city}</span>}
              {type && <span className="active-pill">Type: {type}</span>}
              {bedrooms && <span className="active-pill">{bedrooms} BHK</span>}
              {status && <span className="active-pill">Status: {status}</span>}
            </div>
          )}
        </div>

        {/* Results Content */}
        {loading ? (
          <div className="loading-state" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-primary)', fontWeight: '600' }}>
            Curating luxury residences...
          </div>
        ) : properties.length === 0 ? (
          <div className="empty-state-box">
            <Building2 size={48} className="empty-icon" />
            <h3>No Residences Found</h3>
            <p>No luxury residences match your current search criteria. Try adjusting or clearing filters.</p>
            <button className="btn btn-primary" onClick={handleReset}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="properties-grid">
            {properties.map((prop) => (
              <PropertyCard key={prop.property_id} property={prop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}