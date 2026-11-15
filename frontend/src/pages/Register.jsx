import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Building2, Eye, EyeOff, Lock, Mail, User, Phone, Briefcase, DollarSign, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Client', // Default role is Client
    phone: '',
    experience: '3',
    budget: '8000000'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Please provide all mandatory fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        phone: formData.phone.trim(),
        experience: Number(formData.experience) || 0,
        budget: Number(formData.budget) || 0
      });

      setSuccess(true);
      login(res.user);

      setTimeout(() => {
        if (res.user.role === 'Admin') {
          navigate('/dashboard/admin');
        } else if (res.user.role === 'Agent') {
          navigate('/dashboard/agent');
        } else {
          navigate('/dashboard/client');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      <div className="auth-container">
        {/* Left Branding Panel */}
        <div className="auth-brand-panel">
          <Link to="/" className="auth-logo">
            <span className="logo-icon"><Building2 size={24} /></span>
            <span className="logo-text">Estate<span className="logo-accent">Ease.</span></span>
          </Link>
          <div className="auth-brand-content">
            <span className="tagline">JOIN ESTATEEASE</span>
            <h2>Begin Your Real Estate Journey.</h2>
            <p>
              Create your account to schedule private property tours, save bespoke estates, or manage commercial portfolios across North India.
            </p>
            <div className="auth-perks-list">
              <div className="perk-item">✓ Book VIP viewings with licensed senior advisors</div>
              <div className="perk-item">✓ 100% Verified legal title inspection guarantees</div>
              <div className="perk-item">✓ Direct access to off-market luxury listings</div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-form-card">
          <div className="auth-form-header">
            <h3>Create an Account</h3>
            <p>Join EstateEase as a Client Homebuyer, Estate Agent, or Administrator.</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} />
              <span>Registration successful! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role Selection Tabs */}
            <div className="form-group">
              <label>Select Your Account Type *</label>
              <div className="role-selector-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <label className={`role-option ${formData.role === 'Client' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="Client"
                    checked={formData.role === 'Client'}
                    onChange={() => setFormData({ ...formData, role: 'Client' })}
                  />
                  <strong>👤 Client / Buyer</strong>
                  <small>Book viewings & explore</small>
                </label>

                <label className={`role-option ${formData.role === 'Agent' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="Agent"
                    checked={formData.role === 'Agent'}
                    onChange={() => setFormData({ ...formData, role: 'Agent' })}
                  />
                  <strong>🏢 Estate Agent</strong>
                  <small>Manage listings & deals</small>
                </label>

                <label className={`role-option ${formData.role === 'Admin' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="Admin"
                    checked={formData.role === 'Admin'}
                    onChange={() => setFormData({ ...formData, role: 'Admin' })}
                  />
                  <strong>👑 Administrator</strong>
                  <small>Full system control</small>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Full Legal Name *</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Nishtha Verma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Official Email Address *</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Role-Specific Fields */}
            {formData.role === 'Client' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="input-icon" />
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g. 9811122233"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Target Investment Budget (₹)</label>
                  <div className="input-with-icon">
                    <DollarSign size={18} className="input-icon" />
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 8500000"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.role === 'Agent' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <div className="input-with-icon">
                    <Phone size={18} className="input-icon" />
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Experience (Years)</label>
                  <div className="input-with-icon">
                    <Briefcase size={18} className="input-icon" />
                    <input
                      type="number"
                      min="0"
                      max="40"
                      className="form-control"
                      placeholder="e.g. 5"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label>Password *</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <button
                type="button"
                className="show-pass-text-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
              </button>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-auth-submit" disabled={loading}>
              {loading ? 'Creating Account...' : `Register as ${formData.role}`}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="auth-footer-nav">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
