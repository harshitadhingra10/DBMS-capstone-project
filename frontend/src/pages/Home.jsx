import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Building, ShieldCheck, Award, Users, ChevronRight, ArrowRight, Sparkles, Gem, PlusCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import './Home.css';

export default function Home() {
  const [allProperties, setAllProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [recFilter, setRecFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchType, setSearchType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPropertiesData = async () => {
      try {
        const data = await api.getProperties({ status: 'Available' });
        setAllProperties(data);
        setFeaturedProperties(data.slice(0, 3));
        setRecommendedProperties(data);
      } catch (err) {
        console.error('Failed to load home properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPropertiesData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.append('city', searchCity);
    if (searchType) params.append('property_type', searchType);
    navigate(`/properties?${params.toString()}`);
  };

  const filteredRecommendations = recFilter === 'All'
    ? recommendedProperties.slice(0, 6)
    : recommendedProperties.filter(p => p.property_type === recFilter).slice(0, 6);

  const cities = [
    { name: 'Gurugram', desc: 'Golf Course Rd, Cyber Hub & Southern Periphery', count: '14+ Estates' },
    { name: 'New Delhi', desc: 'Lutyens Bungalow Zone, Chanakyapuri & Vasant Vihar', count: '9+ Estates' },
    { name: 'Noida', desc: 'Expressway Penthouses & Sector 128 Mansions', count: '11+ Estates' },
    { name: 'Faridabad', desc: 'Surajkund Luxury Villas & Neharpar Enclaves', count: '6+ Estates' },
  ];

  return (
    <div className="home-container">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="badge-luxury">
            <Sparkles size={14} /> North India's Ultra-Luxury Real Estate
          </span>
          <h1 className="hero-title">
            Acquire Landmark Residences in <span className="text-gold">Delhi NCR</span>
          </h1>
          <p className="hero-description">
            Private estates, high-floor penthouses, and bespoke architectural marvels curated for discerning patrons.
          </p>

          {/* LUXURY SEARCH BAR */}
          <form className="hero-search-card" onSubmit={handleSearch}>
            <div className="search-field">
              <label><MapPin size={16} /> Prime Location</label>
              <select value={searchCity} onChange={(e) => setSearchCity(e.target.value)}>
                <option value="">All North India Cities</option>
                <option value="Gurugram">Gurugram (Gurgaon)</option>
                <option value="New Delhi">New Delhi</option>
                <option value="Noida">Noida</option>
                <option value="Faridabad">Faridabad</option>
              </select>
            </div>

            <div className="search-divider"></div>

            <div className="search-field">
              <label><Building size={16} /> Estate Category</label>
              <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                <option value="">All Typologies</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Villa">Luxury Villa</option>
                <option value="Apartment">Designer Apartment</option>
                <option value="House">Bespoke House</option>
                <option value="Commercial">Commercial Asset</option>
              </select>
            </div>

            <button type="submit" className="hero-search-btn">
              <Search size={18} /> Search Estates
            </button>
          </form>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="stats-strip">
        <div className="container stats-grid">
          <div className="stat-card">
            <h3>₹850 Cr+</h3>
            <p>Portfolio Transacted</p>
          </div>
          <div className="stat-card">
            <h3>45+</h3>
            <p>Exclusive Estates Listed</p>
          </div>
          <div className="stat-card">
            <h3>100%</h3>
            <p>RERA & Legal Verified</p>
          </div>
          <div className="stat-card">
            <h3>24 / 7</h3>
            <p>Private Advisory Council</p>
          </div>
        </div>
      </section>

      {/* RECOMMENDED PROPERTIES (NEW DEDICATED SECTION) */}
      <section className="recommended-home-section">
        <div className="container">
          <div className="section-head text-center" style={{ marginBottom: '24px' }}>
            <span className="badge-luxury" style={{ color: 'var(--color-primary) !important', borderColor: 'var(--color-accent)' }}>
              <Gem size={14} /> Curated Exclusively For You
            </span>
            <h2 className="section-heading" style={{ fontSize: '2.6rem', marginTop: '12px' }}>
              Recommended Luxury Residences
            </h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem' }}>
              Handpicked estates evaluated for high capital appreciation, architectural mastery, and prime Delhi NCR connectivity.
            </p>
          </div>

          {/* Interactive Recommendation Filter Pills */}
          <div className="rec-pills-bar">
            {[
              { id: 'All', label: 'All Curated Picks' },
              { id: 'Villa', label: 'Luxury Villas' },
              { id: 'Apartment', label: 'Designer Apartments' },
              { id: 'House', label: 'Premium Houses' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`rec-pill-btn ${recFilter === tab.id ? 'active' : ''}`}
                onClick={() => setRecFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-state">Curating bespoke recommendations...</div>
          ) : filteredRecommendations.length === 0 ? (
            <div className="no-data-text">No residences available in this category currently.</div>
          ) : (
            <div className="properties-grid">
              {filteredRecommendations.map((prop) => (
                <PropertyCard key={prop.property_id} property={prop} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/properties" className="btn btn-primary" style={{ padding: '12px 32px' }}>
              <span>View All Verified Properties</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* LIST YOUR PROPERTY CTA BANNER (NEW PROMINENT OWNER / AGENT SECTION) */}
      <section className="list-property-cta-section">
        <div className="container">
          <div className="list-cta-box">
            <div className="list-cta-content">
              <span className="badge-luxury" style={{ color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}>
                <Sparkles size={14} /> Owner & Investor Advisory
              </span>
              <h2>Own a Landmark Residence in Delhi NCR?</h2>
              <p>
                Market your penthouse, villa, or commercial estate directly to our exclusive network of vetted ultra-high-net-worth patrons and institutional buyers.
              </p>
              <div className="list-cta-features">
                <span>✓ 100% Confidential Marketing</span>
                <span>✓ Verified Client Inquiries</span>
                <span>✓ Zero Upfront Listing Fees</span>
              </div>
            </div>
            <div className="list-cta-action">
              <Link to="/list-property" className="btn btn-accent btn-large-cta">
                <PlusCircle size={20} />
                <span>List Your Property Now</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES HIGHLIGHT */}
      <section className="featured-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-tag">Handpicked Selection</span>
              <h2 className="section-heading">Featured Landmark Residences</h2>
            </div>
            <Link to="/properties" className="view-all-link">
              Explore All Properties <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="loading-state">Curating residences...</div>
          ) : (
            <div className="properties-grid">
              {featuredProperties.map((prop) => (
                <PropertyCard key={prop.property_id} property={prop} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CITIES EXPLORER */}
      <section className="locations-showcase">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-tag">Strategic Regions</span>
            <h2 className="section-heading">Explore Prime Micro-Markets</h2>
          </div>
          <div className="cities-cards-grid">
            {cities.map((c, i) => (
              <div key={i} className="city-spotlight-card" onClick={() => navigate(`/locations/${c.name.toLowerCase().replace(' ', '-')}`)}>
                <div className="city-info">
                  <h3>{c.name}</h3>
                  <p>{c.desc}</p>
                  <span className="city-count">{c.count}</span>
                </div>
                <div className="city-arrow"><ChevronRight size={20} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
