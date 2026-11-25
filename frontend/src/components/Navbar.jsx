import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, User, LogOut, Shield, Briefcase, Calendar, Menu, X, PlusCircle } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout, isClient, isAgent, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (isAdmin) return '/dashboard/admin';
    if (isAgent) return '/dashboard/agent';
    return '/dashboard/client';
  };

  const isActive = (path) => location.pathname === path;

  // Clean user display name if it contains bracketed roles like "Nishtha (Client)"
  const cleanName = user?.name ? user.name.replace(/\s*\([^)]*\)/g, '').trim() : 'User';

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Left: Brand Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon"><Building2 size={22} /></span>
          <span className="logo-text">Estate<span className="logo-accent">Ease</span></span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/properties" className={`nav-link ${isActive('/properties') ? 'active' : ''}`}>Properties</Link>
          <Link to="/locations" className={`nav-link ${isActive('/locations') ? 'active' : ''}`}>Locations</Link>
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>About Us</Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>Contact</Link>
        </nav>

        {/* Right: Actions */}
        <div className="navbar-actions">
          <Link to="/list-property" className="btn-nav-list" title="List your property with EstateEase">
            <PlusCircle size={15} />
            <span>List Property</span>
          </Link>

          {isAuthenticated ? (
            <div className="user-profile-menu">
              <Link to={getDashboardPath()} className="btn-nav-dashboard" title="Open Your Dashboard">
                {isAdmin && <Shield size={14} />}
                {isAgent && <Briefcase size={14} />}
                {isClient && <Calendar size={14} />}
                <span>{isAdmin ? 'Admin Console' : (isAgent ? 'Agent Portal' : 'Client Lounge')}</span>
              </Link>

              <Link to={getDashboardPath()} className="user-badge-container" title={`${cleanName} (${user?.role})`}>
                <div className="user-avatar">{cleanName[0]?.toUpperCase() || 'U'}</div>
                <div className="user-info">
                  <span className="user-name">{cleanName}</span>
                  <span className={`badge-role ${user?.role?.toLowerCase()}`}>{user?.role}</span>
                </div>
              </Link>

              <button onClick={handleLogout} className="logout-btn" title="Sign Out">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="guest-actions">
              <Link to="/login" className="login-link">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-nav-reg">Register</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <Link to="/" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/properties" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Properties</Link>
          <Link to="/locations" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Locations</Link>
          <Link to="/about" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
          <Link to="/contact" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          <Link to="/list-property" className="mobile-link" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-accent-dark)', fontWeight: '700' }}>
            + List Your Property
          </Link>
          
          <div className="mobile-drawer-auth">
            {isAuthenticated ? (
              <>
                <div className="mobile-user-card">
                  <div className="user-avatar">{user?.name ? user.name[0].toUpperCase() : 'U'}</div>
                  <span className="mobile-user-name">{user?.name} ({user?.role})</span>
                </div>
                <Link to={getDashboardPath()} className="btn btn-primary w-full" onClick={() => setMobileMenuOpen(false)}>
                  My Dashboard
                </Link>
                <button onClick={handleLogout} className="btn btn-outline w-full">Sign Out</button>
              </>
            ) : (
              <div className="mobile-guest-buttons">
                <Link to="/login" className="btn btn-outline" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
