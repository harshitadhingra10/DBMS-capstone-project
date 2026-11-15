import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { MapPin, Building2, TrendingUp, ShieldCheck, ArrowRight, Compass } from 'lucide-react';
import './Locations.css';

const Locations = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const data = await api.getProperties();
        setProperties(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProps();
  }, []);

  const locationData = [
    {
      id: 'gurugram',
      name: 'Gurugram',
      state: 'Haryana',
      subtitle: 'The Millennium City & Financial Nerve Center',
      description: 'Home to Fortune 500 headquarters, Cyber City, Rapid Metro, and iconic Golf Course Road. Gurugram offers the highest concentration of ultra-luxury gated condominiums and private villas in North India.',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      highlights: ['Golf Course Extension Road', 'Cyber Hub & DLF Phase 1-5', 'Ambience Island', 'Southern Peripheral Road'],
      priceRange: '₹85 Lakh - ₹15+ Crore',
      avgAppreciation: '+14.2% YoY'
    },
    {
      id: 'delhi',
      name: 'Delhi',
      state: 'NCT of Delhi',
      subtitle: 'The Capital of Heritage & Sovereign Prestige',
      description: 'The historic seat of government and culture. From tree-lined boulevards in South Delhi to modern luxury condominiums in Connaught Place, owning property in Delhi represents timeless sovereign status.',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
      highlights: ['Connaught Place & Barakhamba', 'Hauz Khas & Green Park', 'Vasant Vihar & Chanakyapuri', 'Greater Kailash'],
      priceRange: '₹18,000/mo - ₹12+ Crore',
      avgAppreciation: '+11.8% YoY'
    },
    {
      id: 'noida',
      name: 'Noida',
      state: 'Uttar Pradesh',
      subtitle: 'The Planned Green Expressway Corridor',
      description: 'Renowned for world-class infrastructure, planned grid sectors, green expressways, and upcoming Jewar International Airport. Noida presents superior lifestyle amenities alongside high capital appreciation.',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      highlights: ['Noida Expressway Sector 128', 'Jaypee Greens Golf Course', 'Sector 50 & 62 Corporate Hubs', 'Wave City Center'],
      priceRange: '₹25,000/mo - ₹6.5+ Crore',
      avgAppreciation: '+16.5% YoY'
    },
    {
      id: 'faridabad',
      name: 'Faridabad',
      state: 'Haryana',
      subtitle: 'The Aravalli Foothills & Peaceful Sanctuary',
      description: 'Positioned adjacent to South Delhi and protected Aravalli forest belts. Faridabad provides expansive residential plots, serene farmhouses, and rising industrial corridors with seamless Delhi Metro connectivity.',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      highlights: ['Surajkund & Green Meadows', 'Sector 14 & 15 Enclaves', 'Delhi-Mathura Highway', 'Neharpar Expressway'],
      priceRange: '₹32 Lakh - ₹3.5+ Crore',
      avgAppreciation: '+9.4% YoY'
    }
  ];

  return (
    <div className="locations-page-root">
      {/* Header */}
      <div className="locations-header-banner">
        <div className="container">
          <span className="tagline">REGIONAL EXCELLENCE</span>
          <h1>Explore Prime Locations</h1>
          <p>
            EstateEase curates landmark residential and commercial assets across the most prestigious micro-markets in Delhi NCR.
          </p>
        </div>
      </div>

      <div className="container locations-list-container">
        <div className="locations-cards-vertical">
          {locationData.map((loc) => {
            const count = properties.filter(p => p.location.toLowerCase().includes(loc.name.toLowerCase())).length;

            return (
              <div key={loc.id} className="location-feature-card">
                <div className="location-img-col">
                  <img src={loc.image} alt={loc.name} />
                  <span className="loc-badge-count">{count} Properties Available</span>
                </div>

                <div className="location-info-col">
                  <div className="location-top-meta">
                    <span className="loc-state-tag"><MapPin size={14} /> {loc.state}</span>
                    <span className="loc-appreciation"><TrendingUp size={14} /> {loc.avgAppreciation}</span>
                  </div>

                  <h2 className="loc-name">{loc.name}</h2>
                  <h4 className="loc-subtitle">{loc.subtitle}</h4>
                  <p className="loc-desc">{loc.description}</p>

                  <div className="loc-key-landmarks">
                    <strong>Key Neighborhoods:</strong>
                    <div className="landmark-tags">
                      {loc.highlights.map((h, i) => (
                        <span key={i} className="landmark-tag">{h}</span>
                      ))}
                    </div>
                  </div>

                  <div className="loc-card-footer">
                    <div className="price-indicator">
                      <span>Typical Investment:</span>
                      <strong>{loc.priceRange}</strong>
                    </div>

                    <Link to={`/locations/${loc.id}`} className="btn btn-primary">
                      <span>View Properties in {loc.name}</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Locations;
