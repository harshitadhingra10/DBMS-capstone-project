import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Calendar, IndianRupee, Clock, MapPin, Sparkles, Building, Phone, CheckCircle2, X } from 'lucide-react';
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
        setMsg('Profile preferences updated!');
        setTimeout(() => setMsg(''), 3000);
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

  if (loading) return <div className="loading-state">Loading your Client Lounge...</div>;

  return (
    <div className="dashboard-container">
      <div className="client-header-hero">
        <span className="badge-luxury"><Sparkles size={14} /> VIP Client Lounge</span>
        <h1>Welcome, {user?.name}</h1>
        <p>Manage your booked viewings, review portfolio transactions, and view properties tailored to your budget.</p>
      </div>

      {msg && <div className="alert-success">{msg}</div>}

      <div className="client-grid">
        {/* Scheduled Appointments */}
        <div className="dashboard-card">
          <h2><Calendar size={20} /> My Scheduled Viewings</h2>
          {data.appointments.length === 0 ? (
            <p className="empty-text">No viewings scheduled yet.</p>
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
                  <button className="btn-cancel" onClick={() => cancelAppointment(a.appointment_id)}>
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
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Target Investment Budget (₹ INR)</label>
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary">Save Preferences</button>
          </form>
        </div>
      </div>

      {/* Curated Recommendations */}
      <div className="recommendations-section">
        <h2><Building size={22} /> Recommended For Your Budget</h2>
        <div className="properties-grid">
          {data.recommended.map(prop => (
            <PropertyCard key={prop.property_id} property={prop} />
          ))}
        </div>
      </div>
    </div>
  );
}