import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import { MapPin, ArrowLeft, Building2, TrendingUp, Filter } from 'lucide-react';

const cityMeta = {
  gurugram: {
    name: 'Gurugram',
    state: 'Haryana',
    title: 'The Millennium City',
    description: 'Explore premier villas, penthouses, and grade-A commercial assets across Golf Course Road, Cyber City, and Sector 65.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80',
  },
  delhi: {
    name: 'Delhi',
    state: 'NCT of Delhi',
    title: 'The Sovereign Capital',
    description: 'Explore bespoke central apartments and upscale heritage residences in Connaught Place, Hauz Khas, and South Delhi.',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=80',
  },
  noida: {
    name: 'Noida',
    state: 'Uttar Pradesh',
    title: 'The Green Expressway',
    description: 'Explore prime residences next to championship golf courses, Jaypee Greens, and expressway corporate hubs.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80',
  },
  faridabad: {
    name: 'Faridabad',
    state: 'Haryana',
    title: 'The Aravalli Gateway',
    description: 'Discover peaceful freehold residential plots and expansive gated homes amidst the tranquil Aravalli foothills.',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80',
  }
};

const LocationDetail = () => {
  const { cityName } = useParams();
  const normalizedCity = (cityName || '').toLowerCase();
  const city = cityMeta[normalizedCity] || {
    name: cityName,
    state: 'NCR, India',
    title: 'Featured Region',
    description: `Browse luxury properties available in ${cityName}.`,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'
  };

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [listingTypeFilter, setListingTypeFilter] = useState('All');

  useEffect(() => {
    const fetchCityProperties = async () => {
      try {
        setLoading(true);
        const data = await api.getProperties({ location: city.name });
        setProperties(data);
      } catch (err) {
        setError('Failed to fetch properties for this location.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCityProperties();
  }, [city.name]);

  const filteredProperties = properties.filter(p => {
    if (typeFilter !== 'All' && p.property_type !== typeFilter) return false;
    if (listingTypeFilter !== 'All' && p.listing_type !== listingTypeFilter) return false;
    return true;
  });

  return (
    <div className="location-detail-page" style={{ paddingBottom: '90px' }}>
      {/* Hero Banner */}
      <div style={{
        position: 'relative',
        minHeight: '380px',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `url(${city.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'var(--color-white)',
        padding: '60px 0',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(15, 43, 35, 0.9) 0%, rgba(23, 61, 50, 0.75) 100%)',
          zIndex: 1
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <Link to="/locations" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-accent)',
            fontSize: '0.9rem',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            <ArrowLeft size={16} /> Back to All Locations
          </Link>
          <span className="tagline" style={{ display: 'block' }}>{city.state}</span>
          <h1 style={{ color: 'var(--color-white)', fontSize: '3rem', marginBottom: '8px' }}>
            Properties in {city.name}
          </h1>
          <p style={{ color: '#E2E8F0', fontSize: '1.1rem', maxWidth: '700px' }}>
            {city.description}
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '40px' }}>
        {/* Sub filter bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '18px 24px',
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          marginBottom: '32px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>
              Available in {city.name} ({filteredProperties.length})
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-cream)' }}
              >
                <option value="All">All Types</option>
                <option value="Villa">Villa</option>
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Commercial">Commercial</option>
                <option value="Plot">Plot</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>Listing:</label>
              <select
                value={listingTypeFilter}
                onChange={(e) => setListingTypeFilter(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-cream)' }}
              >
                <option value="All">Buy & Rent</option>
                <option value="Sale">For Sale</option>
                <option value="Rent">For Rent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="properties-grid">
            {[1, 2, 3].map(n => (
              <div key={n} className="skeleton" style={{ height: '380px' }}></div>
            ))}
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : filteredProperties.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--color-border)'
          }}>
            <Building2 size={44} style={{ color: 'var(--color-accent)', marginBottom: '12px' }} />
            <h3>No Properties Currently Listed in {city.name}</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '18px' }}>
              Try removing property type filters or explore our other premier locations.
            </p>
            <Link to="/properties" className="btn btn-primary btn-sm">
              View All Properties
            </Link>
          </div>
        ) : (
          <div className="properties-grid">
            {filteredProperties.map(p => (
              <PropertyCard key={p.property_id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDetail;
