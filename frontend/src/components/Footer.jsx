import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="footer-root">
      <div className="container footer-container">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-logo">
            <span className="logo-icon"><Building2 size={22} /></span>
            <span className="logo-text">Estate<span className="logo-accent">Ease.</span></span>
          </Link>
          <p className="footer-description">
            EstateEase is North India’s premier luxury real estate advisory and management platform.
            Connecting discerning clients with iconic residences, commercial estates, and bespoke investments.
          </p>
          <div className="footer-trust-badge">
            <ShieldCheck size={18} />
            <span>RERA Registered & 100% Verified Titles</span>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/properties">All Properties</Link></li>
            <li><Link to="/locations">Popular Locations</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Advisory</Link></li>
            <li><Link to="/login">Agent / Admin Portal</Link></li>
          </ul>
        </div>

        {/* Locations Column */}
        <div className="footer-col">
          <h4 className="footer-heading">Prime Locations</h4>
          <ul className="footer-links">
            <li><Link to="/locations/gurugram">Gurugram (Cyber City & Golf Links)</Link></li>
            <li><Link to="/locations/delhi">Delhi (Connaught Place & South Delhi)</Link></li>
            <li><Link to="/locations/noida">Noida (Jaypee Greens & Expressway)</Link></li>
            <li><Link to="/locations/faridabad">Faridabad (Aravalli & Surajkund)</Link></li>
          </ul>
        </div>

        {/* Contact & Newsletter Column */}
        <div className="footer-col newsletter-col">
          <h4 className="footer-heading">Exclusive Newsletter</h4>
          <p className="newsletter-text">
            Subscribe for private off-market property alerts and prime market analytics.
          </p>

          {subscribed ? (
            <div className="newsletter-success">
              <CheckCircle2 size={18} /> Thank you! You are subscribed.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" aria-label="Subscribe">
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          <div className="footer-contact-snippet">
            <div className="contact-item">
              <MapPin size={16} /> <span>Cyber City, DLF Phase 2, Gurugram</span>
            </div>
            <div className="contact-item">
              <Phone size={16} /> <span>+91 (0124) 489-3200</span>
            </div>
            <div className="contact-item">
              <Mail size={16} /> <span>concierge@estateease.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <div className="container bottom-content">
          <p>© {new Date().getFullYear()} EstateEase Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="bottom-links">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>RERA Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
