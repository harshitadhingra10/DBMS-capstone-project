import { useEffect, useState } from 'react';
import './App.css';
import { Search, MapPin, BedDouble, Bath, Maximize, ArrowRight } from 'lucide-react';

function App() {
const [properties, setProperties] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
fetch('http://localhost:5000/api/properties')
.then((response) => {
if (!response.ok) {
throw new Error('Unable to fetch properties');
}
return response.json();
})
.then((data) => {
setProperties(data);
setLoading(false);
})
.catch((err) => {
setError('Could not connect to the server. Please check your backend.');
setLoading(false);
console.log(err);
});
}, []);

return ( <div className="app">

```
  <nav className="navbar">
    <div className="logo">Estate<span>Ease.</span></div>

    <div className="nav-links">
      <a href="#home">Home</a>
      <a href="#properties">Properties</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </div>

    <button className="nav-button">Get Started</button>
  </nav>

  <section className="hero" id="home">
    <div className="hero-content">
      <p className="tagline">FIND YOUR PERFECT PLACE</p>

      <h1>
        Discover a Place<br />
        You'll <span>Love to Live.</span>
      </h1>

      <p className="hero-description">
        Find your dream property with EstateEase.
        Explore beautiful homes and make your next move with confidence.
      </p>

      <div className="search-box">
        <div className="search-field">
          <MapPin size={20} />
          <input type="text" placeholder="Enter location" />
        </div>

        <select>
          <option>Property Type</option>
          <option>Apartment</option>
          <option>House</option>
          <option>Villa</option>
          <option>Plot</option>
          <option>Commercial</option>
        </select>

        <button>
          <Search size={18} /> Search
        </button>
      </div>
    </div>
  </section>

  <section className="properties-section" id="properties">

    <div className="section-heading">
      <div>
        <p className="tagline">EXPLORE PROPERTIES</p>
        <h2>Featured Properties</h2>
      </div>

      <a href="#properties" className="view-all">
        View All <ArrowRight size={18} />
      </a>
    </div>

    {loading && <p>Loading properties...</p>}

    {error && <p>{error}</p>}

    {!loading && !error && properties.length === 0 && (
      <p>No properties available currently.</p>
    )}

    <div className="property-grid">
      {properties.map((property) => (
        <div className="property-card" key={property.property_id}>

          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
            alt={property.title}
          />

          <div className="property-info">

            <h3>{property.title}</h3>

            <p className="property-location">
              <MapPin size={16} />
              {property.location}
            </p>

            <div className="property-features">
              <span>
                <BedDouble size={17} />
                {property.bedrooms} Beds
              </span>

              <span>
                <Bath size={17} />
                {property.bathrooms} Baths
              </span>

              <span>
                <Maximize size={17} />
                {property.area_sqft} sq.ft
              </span>
            </div>

            <div className="property-bottom">
              <h3>
                ₹{Number(property.price).toLocaleString('en-IN')}
              </h3>

              <button>View Details</button>
            </div>

          </div>
        </div>
      ))}
    </div>
  </section>

  <section className="about-section" id="about">
    <p className="tagline">ABOUT ESTATEEASE</p>

    <h2>Making Property Management Easier.</h2>

    <p>
      EstateEase brings property listings, clients, agents and
      transactions together in one simple platform.
    </p>
  </section>

  <footer id="contact">
    <div className="logo">Estate<span>Ease.</span></div>
    <p>Find your place. Begin your story.</p>
    <p>© 2026 EstateEase. All rights reserved.</p>
  </footer>

</div>


);
}

export default App;
