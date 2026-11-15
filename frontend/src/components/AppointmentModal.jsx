import { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Calendar, Clock, User, Mail, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

const AppointmentModal = ({ isOpen, onClose, property, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    client_name: user?.name || '',
    client_email: user?.email || '',
    client_phone: '',
    appointment_date: '',
    appointment_time: '11:00',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !property) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.client_name || !formData.client_email || !formData.client_phone || !formData.appointment_date) {
      setError('Please fill in all contact and appointment details.');
      return;
    }

    // Combine date and time into SQL datetime format: YYYY-MM-DD HH:MM:SS
    const fullDateTime = `${formData.appointment_date} ${formData.appointment_time || '11:00'}:00`;

    try {
      setLoading(true);
      await api.createAppointment({
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_phone: formData.client_phone,
        property_id: property.property_id,
        agent_id: property.agent_id,
        appointment_date: fullDateTime,
        status: 'Scheduled',
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
    } catch (err) {
      setError(err.message || 'Unable to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date string for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="tagline">PRIVATE VIEWING</span>
            <h3>Book an Appointment</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Selected Property Preview */}
        <div style={{
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          padding: '12px',
          backgroundColor: 'var(--color-cream)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '20px',
          border: '1px solid var(--color-border)'
        }}>
          <img
            src={property.primary_image || (property.images && property.images[0]) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
            alt={property.title}
            style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <div>
            <h4 style={{ fontSize: '1rem', color: 'var(--color-primary)', marginBottom: '2px' }}>{property.title}</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              {property.location} • ₹{Number(property.price).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success ? (
          <div className="alert alert-success" style={{ padding: '24px', textAlign: 'center', flexDirection: 'column' }}>
            <CheckCircle2 size={42} style={{ color: '#137333', marginBottom: '8px' }} />
            <h4 style={{ fontSize: '1.2rem', color: '#137333', marginBottom: '4px' }}>Appointment Scheduled!</h4>
            <p style={{ fontSize: '0.9rem' }}>
              Our dedicated property specialist will contact you shortly to confirm your private viewing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="e.g. 9811122233"
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px' }}>
              <div className="form-group">
                <label>Preferred Date</label>
                <input
                  type="date"
                  min={minDate}
                  className="form-control"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Time Slot</label>
                <select
                  className="form-control"
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                >
                  <option value="10:00">10:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:30">03:30 PM</option>
                  <option value="17:00">05:00 PM</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                {loading ? 'Confirming...' : 'Confirm Viewing Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AppointmentModal;
