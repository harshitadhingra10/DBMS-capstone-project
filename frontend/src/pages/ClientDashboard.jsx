import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Calendar, IndianRupee, Clock, MapPin, Sparkles, Building, Phone, CheckCircle2, X, PlusCircle, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import './Dashboard.css';

export default function ClientDashboard() {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState({ appointments: [], transactions: [], recommended: [] });
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState(user?.phone || '');
  const [budget, setBudget] = useState(user?.budget || '');
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      const res = await api.getClientDashboardData(user?.client_id || user?.email);
      setData(res);
      if (res.client) {
        setPhone(res.client.phone || '');
        setBudget(res.client.budget || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (user?.client_id) {
        await api.updateClientProfile(user.client_id, { phone, budget });
        updateUser({ phone, budget });
        setMsg('Profile preferences updated successfully!');
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  const cancelAppointment = async (id) => {
    if (!window.confirm('Cancel this viewing appointment?')) return;
    try {
      await api.deleteAppointment(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return (
    <div className="dashboard-container" style={{ textAlign: 'center', padding: '80px 0' }}>
      <div className="loading-state">Loading your Private Client Lounge...</div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Header Banner */}
      <div className="client-header-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge-luxury"><Sparkles size={14} /> VIP Client Lounge</span>
            <h1>Welcome, {user?.name}</h1>
            <p>
              Manage your scheduled viewings, update your investment budget, and explore properties curated for you.
            </p>
          </div>
          <Link to="/list-property" className="btn btn-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
            <PlusCircle size={18} />
            <span>List Your Property</span>
          </Link>
        </div>
      </div>

      {msg && (
        <div className="alert alert-success" style={{ marginBottom: '24px' }}>
          <CheckCircle2 size={18} />
          <span>{msg}</span>
        </div>
      )}

      <div className="client-grid">
        {/* Scheduled Appointments */}
        <div className="dashboard-card">
          <h2><Calendar size={20} /> My Scheduled Viewings</h2>
          {data.appointments.length === 0 ? (
            <div className="empty-text">
              <p>No viewings scheduled yet.</p>
              <Link to="/properties" style={{ color: 'var(--color-primary)', fontWeight: '700', textDecoration: 'underline', marginTop: '8px', display: 'inline-block' }}>
                Browse properties to book a visit →
              </Link>
            </div>
          ) : (
            <div className="viewings-list">
              {data.appointments.map(a => (
                <div key={a.appointment_id} className="viewing-item">
                  <div className="viewing-info">
                    <h4>{a.property_title}</h4>
                    <p><MapPin size={14} /> {a.city} • ₹{Number(a.price).toLocaleString('en-IN')}</p>
                    <p><Clock size={14} /> {new Date(a.appointment_date).toLocaleDateString()} at {a.appointment_time}</p>
                    <p><Phone size={14} /> Agent: {a.agent_name || 'Assigned Agent'}</p>
                  </div>
                  <button className="btn-cancel" onClick={() => cancelAppointment(a.appointment_id)} title="Cancel Appointment">
                    <X size={16} /> Cancel
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile & Budget Preferences */}
        <div className="dashboard-card">
          <h2><IndianRupee size={20} /> Preferences & Budget</h2>
          <form onSubmit={handleUpdateProfile} className="preference-form">
            <div className="form-group">
              <label>Registered Phone Number</label>
              <input
                type="text"
                placeholder="e.g. 9811111111"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Target Investment Budget (₹ INR)</label>
              <input
                type="number"
                placeholder="e.g. 8000000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
              />
              <small style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                Current Budget: ₹{Number(budget || 0).toLocaleString('en-IN')}
              </small>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              Save Preferences
            </button>
          </form>
        </div>

        {/* My Acquisitions & Transactions */}
        <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0 }}>
              <CreditCard size={20} /> My Acquisitions, Leases & Payments
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Live RERA & Bank Escrow Settlement Ledger
            </span>
          </div>

          {(data.transactions || []).length === 0 ? (
            <div className="empty-text">
              <p>No transactions recorded yet.</p>
              <Link to="/properties" style={{ color: 'var(--color-primary)', fontWeight: '700', textDecoration: 'underline', marginTop: '8px', display: 'inline-block' }}>
                Explore luxury properties to buy or lease →
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Property Asset</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Transferred Amount</th>
                    <th>Date</th>
                    <th>Escrow Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((tx) => (
                    <tr key={tx.transaction_id}>
                      <td>
                        <strong>#TX-{tx.transaction_id}</strong>
                      </td>
                      <td>
                        <strong>{tx.property_title || `Property #${tx.property_id}`}</strong>
                      </td>
                      <td>{tx.city || 'Delhi NCR'}</td>
                      <td>
                        <span className={`badge ${tx.transaction_type === 'Rent' ? 'badge-rent' : 'badge-available'}`}>
                          {tx.transaction_type === 'Rent' ? '🔑 Lease (Rent)' : '🏛️ Ownership (Buy)'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                          ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td>{new Date(tx.transaction_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                      <td>
                        <span className="badge badge-luxury" style={{ color: '#059669', borderColor: '#059669', background: '#ECFDF5' }}>
                          ✓ {tx.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Curated Recommendations */}
      <div className="recommendations-section">
        <h2>
          <Building size={24} />
          <span>Recommended For Your Budget</span>
        </h2>
        {data.recommended.length === 0 ? (
          <p className="empty-text">No recommendations matching your current budget. Try updating your target budget above.</p>
        ) : (
          <div className="properties-grid">
            {data.recommended.map(prop => (
              <PropertyCard key={prop.property_id} property={prop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
