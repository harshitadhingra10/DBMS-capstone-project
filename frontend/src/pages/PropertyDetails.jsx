import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import AppointmentModal from '../components/AppointmentModal';
import PropertyCard from '../components/PropertyCard';
import {
  MapPin, BedDouble, Bath, Maximize, Calendar, Phone, Mail,
  CheckCircle2, ShieldCheck, ArrowLeft, Share2, Heart, Award,
  Building2, Sparkles, Clock, Check
} from 'lucide-react';
import './PropertyDetails.css';

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.getPropertyById(id);
        setProperty(data);
        setActiveImageIndex(0);

        // Fetch related properties in same location
        if (data.location) {
          const all = await api.getProperties({ location: data.location });
          setSimilarProperties(all.filter(p => p.property_id !== Number(id)).slice(0, 3));
        }
      } catch (err) {
        setError('Property not found or failed to load.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
    window.scrollTo(0, 0);
  }, [id]);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px' }}>
        <div className="skeleton" style={{ height: '50px', width: '300px', marginBottom: '20px' }}></div>
        <div className="skeleton" style={{ height: '460px', borderRadius: '16px', marginBottom: '30px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          <div className="skeleton" style={{ height: '300px' }}></div>
          <div className="skeleton" style={{ height: '300px' }}></div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="alert alert-error" style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
          {error || 'Property not found.'}
        </div>
        <Link to="/properties" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to All Properties
        </Link>
      </div>
    );
  }

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];

  const formattedPrice = Number(property.price).toLocaleString('en-IN');
  const priceDisplay = property.listing_type === 'Rent'
    ? `₹${formattedPrice} / month`
    : `₹${formattedPrice}`;

  const amenities = [
    '24/7 Security & Video Surveillance',
    'Dedicated Covered Parking',
    'Modular Kitchen with German Fittings',
    '100% Power Backup with Stabilizers',
    'Private Balcony with Panoramic Greens',
    'Clubhouse & Heated Swimming Pool Access',
    'High Speed Private Elevators',
    'Smart Home Central Climate Control'
  ];

  return (
    <div className="property-details-root">
      {/* Breadcrumb & Navigation */}
      <div className="details-top-bar">
        <div className="container top-bar-content">
          <Link to="/properties" className="back-link">
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
          <div className="top-bar-actions">
            <button onClick={handleShare} className="icon-action-btn" title="Share Property">
              <Share2 size={16} />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container details-main-layout">
        {/* Header Section */}
        <div className="details-header-section">
          <div className="details-title-col">
            <div className="details-badges">
              <span className={`badge ${property.listing_type === 'Rent' ? 'badge-rent' : 'badge-sale'}`}>
                For {property.listing_type}
              </span>
              <span className={`badge ${property.status === 'Available' ? 'badge-available' : 'badge-sold'}`}>
                {property.status}
              </span>
              <span className="badge-type-outline">{property.property_type}</span>
            </div>
            <h1 className="details-main-title">{property.title}</h1>
            <p className="details-full-address">
              <MapPin size={18} className="pin-icon" />
              <span>{property.address || `${property.location}, India`}</span>
            </p>
          </div>

          <div className="details-price-col">
            <span className="price-label">Official Guide Price</span>
            <h2 className="details-price-val">{priceDisplay}</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary btn-book-appointment"
            >
              <Calendar size={18} />
              <span>Book Private Viewing</span>
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="details-gallery-section">
          {/* Main Hero Preview */}
          <div className="gallery-main-view">
            <img
              src={images[activeImageIndex]}
              alt={`${property.title} - Preview ${activeImageIndex + 1}`}
              className="gallery-active-img"
            />
            <div className="gallery-counter-pill">
              Photo {activeImageIndex + 1} of {images.length}
            </div>
          </div>

          {/* Thumbnails Strip */}
          {images.length > 1 && (
            <div className="gallery-thumbs-row">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  className={`gallery-thumb-btn ${idx === activeImageIndex ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content & Sidebar Grid */}
        <div className="details-body-grid">
          {/* Main Left Column */}
          <div className="details-body-left">
            {/* Key Specifications Grid */}
            <div className="specs-card">
              <h3 className="card-section-title">Property Highlights</h3>
              <div className="specs-items-grid">
                <div className="spec-tile">
                  <div className="spec-tile-icon"><Building2 size={22} /></div>
                  <div>
                    <span className="spec-tile-label">Property Type</span>
                    <strong className="spec-tile-val">{property.property_type}</strong>
                  </div>
                </div>

                <div className="spec-tile">
                  <div className="spec-tile-icon"><BedDouble size={22} /></div>
                  <div>
                    <span className="spec-tile-label">Bedrooms</span>
                    <strong className="spec-tile-val">{property.bedrooms} BHK</strong>
                  </div>
                </div>

                <div className="spec-tile">
                  <div className="spec-tile-icon"><Bath size={22} /></div>
                  <div>
                    <span className="spec-tile-label">Bathrooms</span>
                    <strong className="spec-tile-val">{property.bathrooms} Baths</strong>
                  </div>
                </div>

                <div className="spec-tile">
                  <div className="spec-tile-icon"><Maximize size={22} /></div>
                  <div>
                    <span className="spec-tile-label">Built-up Carpet Area</span>
                    <strong className="spec-tile-val">{Number(property.area_sqft).toLocaleString()} Sq.Ft</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="description-card">
              <h3 className="card-section-title">Architectural Overview & Description</h3>
              <p className="description-text">
                {property.description ||
                  `This bespoke ${property.property_type} represents a masterclass in luxury living in ${property.location}. Engineered with superior spatial design, abundant natural illumination, and premium European fixtures, it is crafted for discerning buyers seeking timeless elegance.`}
              </p>
            </div>

            {/* Amenities Checklist */}
            <div className="amenities-card">
              <h3 className="card-section-title">Luxury Features & Amenities</h3>
              <div className="amenities-grid">
                {amenities.map((item, i) => (
                  <div key={i} className="amenity-item">
                    <div className="amenity-check"><Check size={14} /></div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Agent Card & Consultation CTA */}
          <div className="details-body-right">
            {/* Agent Profile Card */}
            <div className="agent-profile-card">
              <div className="agent-card-header">
                <div className="agent-avatar-large">
                  {(property.agent_name || 'E').charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="agent-badge-verified">
                    <ShieldCheck size={14} /> Verified Senior Advisor
                  </span>
                  <h3 className="agent-name-title">{property.agent_name || 'Senior Private Advisor'}</h3>
                  <p className="agent-experience-text">
                    {property.agent_experience ? `${property.agent_experience}+ Years Experience` : 'Luxury Advisory Team'}
                  </p>
                </div>
              </div>

              <div className="agent-contact-details">
                {property.agent_phone && (
                  <a href={`tel:${property.agent_phone}`} className="agent-contact-row">
                    <div className="agent-icon-box"><Phone size={16} /></div>
                    <div>
                      <span className="contact-label">Direct Phone / WhatsApp</span>
                      <strong>+91 {property.agent_phone}</strong>
                    </div>
                  </a>
                )}

                {property.agent_email && (
                  <a href={`mailto:${property.agent_email}`} className="agent-contact-row">
                    <div className="agent-icon-box"><Mail size={16} /></div>
                    <div>
                      <span className="contact-label">Official Advisory Email</span>
                      <strong>{property.agent_email}</strong>
                    </div>
                  </a>
                )}
              </div>

              <div className="agent-actions">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn btn-primary w-full"
                >
                  <Calendar size={16} />
                  <span>Book Private Appointment</span>
                </button>
              </div>

              <div className="agent-trust-statement">
                <Award size={16} />
                <span>Zero brokerage on direct developer listings & full legal title support.</span>
              </div>
            </div>

            {/* Quick Inquire Assistance */}
            <div className="quick-help-card">
              <h4>Need Bespoke Assistance?</h4>
              <p>Our concierge team is available 7 days a week to answer title queries or customize viewing itineraries.</p>
              <Link to="/contact" className="btn btn-outline btn-sm w-full">
                Contact Concierge
              </Link>
            </div>
          </div>
        </div>

        {/* Similar Properties in Location */}
        {similarProperties.length > 0 && (
          <div className="similar-properties-section">
            <div className="section-title-row">
              <div>
                <span className="tagline">LOCATION PORTFOLIO</span>
                <h2>Similar Properties in {property.location}</h2>
              </div>
              <Link to={`/locations/${property.location.toLowerCase()}`} className="btn btn-outline btn-sm">
                View All in {property.location}
              </Link>
            </div>
            <div className="properties-grid">
              {similarProperties.map(p => (
                <PropertyCard key={p.property_id} property={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Appointment Modal Component */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        property={property}
      />
    </div>
  );
};

export default PropertyDetails;
