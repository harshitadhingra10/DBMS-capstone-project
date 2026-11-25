import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Mail, Lock, Shield, User, Briefcase, Sparkles, Building2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      login(data.user);
      const targetRole = data.user.role;
      if (targetRole === 'Admin') navigate('/dashboard/admin');
      else if (targetRole === 'Agent') navigate('/dashboard/agent');
      else navigate('/dashboard/client');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="auth-page-root">
      <div className="auth-container">
        {/* Left Luxury Branding Panel */}
        <div className="auth-brand-panel">
          <Link to="/" className="auth-logo">
            <span className="logo-icon"><Building2 size={24} /></span>
            <span className="logo-text">Estate<span className="logo-accent">Ease.</span></span>
          </Link>

          <div className="auth-brand-content">
            <span className="auth-security-badge">
              <Sparkles size={14} /> PRIVATE CLIENT ACCESS
            </span>
            <h2>Welcome to Your Private Estate Portfolio.</h2>
            <p>
              North India's premier luxury real estate advisory. Access bespoke penthouses, villas, and commercial assets across Delhi NCR.
            </p>
            <div className="auth-perks-list">
              <div className="perk-item">✓ Book VIP viewings with licensed senior advisors</div>
              <div className="perk-item">✓ 100% RERA registered & verified title documentation</div>
              <div className="perk-item">✓ Dedicated buyer lounge & real-time deal ledgers</div>
            </div>
          </div>

          <div className="auth-footer-tag">
            <small>© 2026 EstateEase Realty Private Limited</small>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h3>Sign In to EstateEase</h3>
            <p>Enter your credentials or use the 1-click demo buttons below.</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Password</label>
                <button
                  type="button"
                  className="show-pass-text-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-auth-submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to EstateEase'}
            </button>
          </form>

          {/* Quick 1-Click Demo Credentials */}
          <div className="demo-credentials-box">
            <span className="demo-title">⚡ 1-Click Quick Demo Access</span>
            <div className="demo-buttons-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickDemo('nishtha.client@example.com', 'client123')}
              >
                <strong>👤 Client</strong>
                <small>Buyer Lounge</small>
              </button>

              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickDemo('harshita@estateease.com', 'agent123')}
              >
                <strong>💼 Agent</strong>
                <small>Harshita</small>
              </button>

              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickDemo('priyam@estateease.com', 'agent123')}
              >
                <strong>💼 Agent</strong>
                <small>Priyam</small>
              </button>

              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickDemo('sandeep@estateease.com', 'admin123')}
              >
                <strong>🛡️ Admin</strong>
                <small>Sandeep</small>
              </button>
            </div>
          </div>

          <div className="auth-footer-nav">
            <p>
              New to EstateEase?{' '}
              <Link to="/register" className="auth-link">
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}