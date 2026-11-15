import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Users, Calendar, DollarSign, Plus, Edit2,
  Trash2, CheckCircle2, AlertCircle, RefreshCw, Eye, X,
  Phone, Mail, MapPin, Clock, Award, ShieldCheck
} from 'lucide-react';
import './Dashboard.css';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('properties'); // properties, appointments, clients, transactions

  const [agentData, setAgentData] = useState({
    properties: [],
    appointments: [],
    transactions: [],
    clients: []
  });

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Add Property Modal State
  const [isAddPropModalOpen, setIsAddPropModalOpen] = useState(false);
  const [newPropData, setNewPropData] = useState({
    title: '',
    property_type: 'Apartment',
    location: 'Gurugram',
    address: '',
    description: '',
    price: '',
    bedrooms: '3',
    bathrooms: '2',
    area_sqft: '1400',
    listing_type: 'Sale',
    status: 'Available',
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
  });

  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
  };

  const loadAgentDashboard = async () => {
    try {
      setLoading(true);
      // Use agent_id from user session, fallback to 1 if not present
      const agentId = user?.agent_id || 1;
      const data = await api.getAgentDashboardData(agentId);
      setAgentData(data);
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Unable to retrieve agent data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentDashboard();
  }, [user]);

  // Handle Quick Property Status Update
  const handlePropStatusUpdate = async (propId, newStatus) => {
    try {
      await api.updateProperty(propId, { status: newStatus });
      showFeedback('success', `Property marked as ${newStatus}.`);
      loadAgentDashboard();
    } catch (err) {
      showFeedback('error', 'Failed to update property status.');
    }
  };

  // Handle Appointment Status Update
  const handleApptStatusUpdate = async (apptId, newStatus) => {
    try {
      await api.updateAppointment(apptId, { status: newStatus });
      showFeedback('success', `Appointment status updated to ${newStatus}.`);
      loadAgentDashboard();
    } catch (err) {
      showFeedback('error', 'Failed to update appointment.');
    }
  };

  // Handle Add Property
  const handleCreateProperty = async (e) => {
    e.preventDefault();
    try {
      await api.createProperty({
        ...newPropData,
        agent_id: user?.agent_id || 1
      });
      showFeedback('success', `Property "${newPropData.title}" listed under your portfolio!`);
      setIsAddPropModalOpen(false);
      loadAgentDashboard();
    } catch (err) {
      showFeedback('error', err.message || 'Failed to add property.');
    }
  };

  const totalAssignedProps = agentData.properties.length;
  const totalAppointments = agentData.appointments.length;
  const totalTransactions = agentData.transactions.length;
  const totalVolume = agentData.transactions.reduce((acc, t) => acc + Number(t.amount || 0), 0);

  return (
    <div className="dashboard-root">
      {/* Banner */}
      <div className="dashboard-banner">
        <div className="container banner-inner">
          <div>
            <div className="admin-pill-tag" style={{ background: 'rgba(30, 126, 81, 0.2)', color: '#34D399', borderColor: '#1E7E51' }}>
              <ShieldCheck size={14} /> Licensed Agent Portal
            </div>
            <h1>Advisor Console — {user?.name}</h1>
            <p>
              Direct oversight of your assigned property listings, private client viewing appointments, and sales milestones.
            </p>
          </div>
          <button onClick={loadAgentDashboard} className="btn btn-outline-white btn-sm" disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Sync Live DB</span>
          </button>
        </div>
      </div>

      <div className="container dashboard-main-area">
        {feedback.text && (
          <div className={`alert alert-${feedback.type}`}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Agent Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Assigned Properties</span>
              <div className="metric-icon"><Building2 size={20} /></div>
            </div>
            <div className="metric-val">{totalAssignedProps}</div>
            <span className="metric-sub">Active in your mandate</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Client Appointments</span>
              <div className="metric-icon"><Calendar size={20} /></div>
            </div>
            <div className="metric-val">{totalAppointments}</div>
            <span className="metric-sub">Scheduled viewings</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Managed Clients</span>
              <div className="metric-icon"><Users size={20} /></div>
            </div>
            <div className="metric-val">{agentData.clients.length}</div>
            <span className="metric-sub">Direct buyers & tenants</span>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Closed Deal Volume</span>
              <div className="metric-icon"><DollarSign size={20} /></div>
            </div>
            <div className="metric-val">₹{totalVolume.toLocaleString('en-IN')}</div>
            <span className="metric-sub">{totalTransactions} transactions recorded</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            Assigned Properties ({totalAssignedProps})
          </button>
          <button
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            My Appointments ({totalAppointments})
          </button>
          <button
            className={`tab-btn ${activeTab === 'clients' ? 'active' : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            My Clients ({agentData.clients.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            My Transactions ({totalTransactions})
          </button>
        </div>

        {/* TAB 1: PROPERTIES */}
        {activeTab === 'properties' && (
          <div className="tab-pane">
            <div className="pane-action-bar">
              <div>
                <h2>Your Assigned Properties</h2>
                <p>Properties assigned to your agent profile in the MySQL database.</p>
              </div>
              <button onClick={() => setIsAddPropModalOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={16} /> Add Listing Under My Portfolio
              </button>
            </div>

            <div className="dashboard-panel-card">
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title & Location</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Specs</th>
                      <th>Purpose</th>
                      <th>Status</th>
                      <th>Quick Status Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentData.properties.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>
                          No properties assigned to your account yet. Click "Add Listing" above to publish one!
                        </td>
                      </tr>
                    ) : (
                      agentData.properties.map((p) => (
                        <tr key={p.property_id}>
                          <td style={{ width: '60px' }}>
                            <img
                              src={p.primary_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=100&q=80'}
                              alt={p.title}
                              className="table-prop-thumb"
                            />
                          </td>
                          <td>
                            <strong>{p.title}</strong>
                            <div className="cell-sub"><MapPin size={12} /> {p.location}</div>
                          </td>
                          <td>{p.property_type}</td>
                          <td><strong>₹{Number(p.price).toLocaleString('en-IN')}</strong></td>
                          <td>{p.bedrooms}B / {p.bathrooms}B • {Number(p.area_sqft).toLocaleString()} sqft</td>
                          <td>
                            <span className={`badge ${p.listing_type === 'Rent' ? 'badge-rent' : 'badge-sale'}`}>
                              {p.listing_type}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${p.status === 'Available' ? 'badge-available' : p.status === 'Sold' ? 'badge-sold' : 'badge-rented'}`}>
                              {p.status}
                            </span>
                          </td>
                          <td>
                            <select
                              value={p.status}
                              onChange={(e) => handlePropStatusUpdate(p.property_id, e.target.value)}
                              className="table-select-status"
                            >
                              <option value="Available">Available</option>
                              <option value="Sold">Sold</option>
                              <option value="Rented">Rented</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <div className="tab-pane">
            <div className="pane-action-bar">
              <div>
                <h2>Client Viewing Appointments</h2>
                <p>Private viewings scheduled for your portfolio listings.</p>
              </div>
            </div>

            <div className="dashboard-panel-card">
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Client</th>
                      <th>Direct Contact</th>
                      <th>Property Title</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentData.appointments.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                          No appointments booked for your properties currently.
                        </td>
                      </tr>
                    ) : (
                      agentData.appointments.map((a) => (
                        <tr key={a.appointment_id}>
                          <td>#{a.appointment_id}</td>
                          <td><strong>{a.client_name || 'Client'}</strong></td>
                          <td>
                            <div style={{ fontSize: '0.85rem' }}><Phone size={12} /> {a.client_phone || 'N/A'}</div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}><Mail size={12} /> {a.client_email}</div>
                          </td>
                          <td>{a.property_title}</td>
                          <td>{new Date(a.appointment_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                          <td>
                            <span className={`badge ${a.status === 'Completed' ? 'badge-available' : a.status === 'Scheduled' ? 'badge-rent' : 'badge-sold'}`}>
                              {a.status}
                            </span>
                          </td>
                          <td>
                            <select
                              value={a.status}
                              onChange={(e) => handleApptStatusUpdate(a.appointment_id, e.target.value)}
                              className="table-select-status"
                            >
                              <option value="Scheduled">Scheduled</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CLIENTS */}
        {activeTab === 'clients' && (
          <div className="tab-pane">
            <div className="pane-action-bar">
              <div>
                <h2>Your Client Contacts</h2>
                <p>Clients who have booked viewings or executed transactions with you.</p>
              </div>
            </div>

            <div className="dashboard-panel-card">
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Client ID</th>
                      <th>Client Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Declared Budget</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentData.clients.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                          No direct clients associated with this agent yet.
                        </td>
                      </tr>
                    ) : (
                      agentData.clients.map((c) => (
                        <tr key={c.client_id}>
                          <td>#{c.client_id}</td>
                          <td><strong>{c.client_name}</strong></td>
                          <td>{c.email}</td>
                          <td><Phone size={12} /> {c.phone || '—'}</td>
                          <td><strong>₹{Number(c.budget || 0).toLocaleString('en-IN')}</strong></td>
                          <td>{new Date(c.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="tab-pane">
            <div className="pane-action-bar">
              <div>
                <h2>My Transactions & Closures</h2>
                <p>Deals and leases finalized under your advisory mandate.</p>
              </div>
            </div>

            <div className="dashboard-panel-card">
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>TX ID</th>
                      <th>Property Title</th>
                      <th>Client Name</th>
                      <th>Type</th>
                      <th>Transaction Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentData.transactions.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>
                          No closed transactions recorded for your agent ID yet.
                        </td>
                      </tr>
                    ) : (
                      agentData.transactions.map((t) => (
                        <tr key={t.transaction_id}>
                          <td>#{t.transaction_id}</td>
                          <td><strong>{t.property_title || `Prop #${t.property_id}`}</strong></td>
                          <td>{t.client_name}</td>
                          <td><span className="badge badge-sale">{t.transaction_type}</span></td>
                          <td><strong>₹{Number(t.amount).toLocaleString('en-IN')}</strong></td>
                          <td>{new Date(t.transaction_date).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${t.status === 'Completed' ? 'badge-available' : 'badge-rent'}`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Property for Agent */}
      {isAddPropModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddPropModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>List New Property (Assigned to {user?.name})</h3>
              <button className="modal-close-btn" onClick={() => setIsAddPropModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProperty}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Modern High-Rise Apartment"
                  value={newPropData.title}
                  onChange={(e) => setNewPropData({ ...newPropData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    className="form-control"
                    value={newPropData.property_type}
                    onChange={(e) => setNewPropData({ ...newPropData, property_type: e.target.value })}
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="House">House</option>
                    <option value="Plot">Plot</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>City *</label>
                  <select
                    className="form-control"
                    value={newPropData.location}
                    onChange={(e) => setNewPropData({ ...newPropData, location: e.target.value })}
                  >
                    <option value="Gurugram">Gurugram</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Noida">Noida</option>
                    <option value="Faridabad">Faridabad</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 5500000"
                    value={newPropData.price}
                    onChange={(e) => setNewPropData({ ...newPropData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Full Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Expressway Sector 128, Noida"
                  value={newPropData.address}
                  onChange={(e) => setNewPropData({ ...newPropData, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label>Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={newPropData.bedrooms}
                    onChange={(e) => setNewPropData({ ...newPropData, bedrooms: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Bathrooms</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={newPropData.bathrooms}
                    onChange={(e) => setNewPropData({ ...newPropData, bathrooms: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Area (Sq.Ft)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={newPropData.area_sqft}
                    onChange={(e) => setNewPropData({ ...newPropData, area_sqft: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Purpose</label>
                  <select
                    className="form-control"
                    value={newPropData.listing_type}
                    onChange={(e) => setNewPropData({ ...newPropData, listing_type: e.target.value })}
                  >
                    <option value="Sale">For Sale</option>
                    <option value="Rent">For Rent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={newPropData.status}
                    onChange={(e) => setNewPropData({ ...newPropData, status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Rented">Rented</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={newPropData.image_url}
                  onChange={(e) => setNewPropData({ ...newPropData, image_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Key features and luxury details..."
                  value={newPropData.description}
                  onChange={(e) => setNewPropData({ ...newPropData, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsAddPropModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Add to My Listings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
