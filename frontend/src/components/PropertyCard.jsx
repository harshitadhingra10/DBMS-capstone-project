import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize, ArrowRight, User } from 'lucide-react';
import './PropertyCard.css';

const PropertyCard = ({ property }) => {
  if (!property) return null;

  const defaultImage = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';
  const imageUrl = property.primary_image || (property.images && property.images[0]) || defaultImage;

  const formattedPrice = Number(property.price).toLocaleString('en-IN');
  const priceDisplay = property.listing_type === 'Rent'
    ? `₹${formattedPrice} / mo`
    : `₹${formattedPrice}`;

  const statusClass = property.status === 'Available'
    ? 'badge-available'
    : property.status === 'Sold'
    ? 'badge-sold'
    : 'badge-rented';

  return (
    <div className="property-card">
      {/* Image Container with Badges */}
      <div className="property-image-wrapper">
        <img
          src={imageUrl}
          alt={property.title}
          className="property-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImage;
          }}
          loading="lazy"
        />
        <div className="card-badge-top-left">
          <span className={`badge ${property.listing_type === 'Rent' ? 'badge-rent' : 'badge-sale'}`}>
            For {property.listing_type}
          </span>
          <span className={`badge ${statusClass}`}>
            {property.status}
          </span>
        </div>
        <div className="card-badge-top-right">
          <span className="property-type-tag">
            {property.property_type}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="property-body">
        {/* Price & Location */}
        <div className="property-price-row">
          <h3 className="property-price">{priceDisplay}</h3>
        </div>

        <h4 className="property-title" title={property.title}>
          <Link to={`/properties/${property.property_id}`}>{property.title}</Link>
        </h4>

        <p className="property-location">
          <MapPin size={15} className="location-pin" />
          <span>{property.location}</span>
        </p>

        {/* Feature Specs */}
        <div className="property-specs">
          {Number(property.bedrooms) > 0 && (
            <div className="spec-item" title="Bedrooms">
              <BedDouble size={16} />
              <span>{property.bedrooms} Beds</span>
            </div>
          )}
          {Number(property.bathrooms) > 0 && (
            <div className="spec-item" title="Bathrooms">
              <Bath size={16} />
              <span>{property.bathrooms} Baths</span>
            </div>
          )}
          {Number(property.area_sqft) > 0 && (
            <div className="spec-item" title="Built-up Area">
              <Maximize size={16} />
              <span>{Number(property.area_sqft).toLocaleString()} sq.ft</span>
            </div>
          )}
        </div>

        {/* Card Footer with Agent & CTA */}
        <div className="property-card-footer">
          {property.agent_name ? (
            <div className="card-agent-info" title={`Advisor: ${property.agent_name}`}>
              <div className="agent-tiny-avatar">
                <User size={13} />
              </div>
              <span className="agent-text">{property.agent_name}</span>
            </div>
          ) : (
            <span className="verified-text">EstateEase Verified</span>
          )}

          <Link to={`/properties/${property.property_id}`} className="view-details-btn">
            <span>View Details</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
