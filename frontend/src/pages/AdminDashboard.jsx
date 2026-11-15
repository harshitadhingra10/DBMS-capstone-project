import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Users, Calendar, DollarSign, Plus, Edit2,
  Trash2, CheckCircle2, AlertCircle, RefreshCw, Eye, X,
  FileText, Shield, ArrowUpRight, Search, Phone, Mail, MapPin
} from 'lucide-react';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, properties, users, appointments, transactions, messages

  // Dashboard Metrics & Data
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [clients, setClients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Modal states
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyFormData, setPropertyFormData] = useState({
    title: '',
    property_type: 'Apartment',
    location: 'Gurugram',
    address: '',
    description: '',
    price: '',
    bedrooms: '3',
    bathrooms: '2',
    area_sqft: '1500',
    listing_type: 'Sale',
    status: 'Available',
    agent_id: '1',
    image_url: ''
  });

  // Transaction Modal State
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txFormData, setTxFormData] = useState({
    property_id: '',
    client_id: '',
    agent_id: '1',
    transaction_type: 'Sale',
    amount: '',
    status: 'Pending'
  });

  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        statsData, propsData, usersData, agentsData,
        clientsData, apptsData, txsData, paysData, msgsData
      ] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getProperties(),
        api.getUsers().catch(() => []),
        api.getAgents().catch(() => []),
        api.getClients().catch(() => []),
        api.getAppointments().catch(() => []),
        api.getTransactions().catch(() => []),
        api.getPayments().catch(() => []),
        api.getContactMessages().catch(() => [])
      ]);

      setStats(statsData);
      setProperties(propsData);
      setUsers(usersData);
      setAgents(agentsData);
      setClients(clientsData);
      setAppointments(apptsData);
      setTransactions(txsData);
      setPayments(paysData);
      setMessages(msgsData);
    } catch (err) {
      console.error(err);
      showFeedback('error', 'Error refreshing dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // PROPERTY CRUD HANDLERS
  const openAddPropertyModal = () => {
    setEditingProperty(null);
    setPropertyFormData({
      title: '',
      property_type: 'Apartment',
      location: 'Gurugram',
      address: '',
      description: '',
      price: '',
      bedrooms: '3',
      bathrooms: '2',
      area_sqft: '1500',
      listing_type: 'Sale',
      status: 'Available',
      agent_id: agents.length > 0 ? agents[0].agent_id : '1',
      image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
    });
    setIsPropertyModalOpen(true);
  };

  const openEditPropertyModal = (prop) => {
    setEditingProperty(prop);
    setPropertyFormData({
      title: prop.title,
      property_type: prop.property_type,
      location: prop.location,
      address: prop.address || '',
      description: prop.description || '',
      price: prop.price,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      area_sqft: prop.area_sqft,
      listing_type: prop.listing_type,
      status: prop.status,
      agent_id: prop.agent_id || '1',
      image_url: prop.primary_image || ''
    });
    setIsPropertyModalOpen(true);
  };

  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProperty) {
        await api.updateProperty(editingProperty.property_id, propertyFormData);
        showFeedback('success', `Property "${propertyFormData.title}" updated successfully!`);
      } else {
        await api.createProperty(propertyFormData);
        showFeedback('success', `Property "${propertyFormData.title}" added to database!`);
      }
      setIsPropertyModalOpen(false);
      loadAllData();
    } catch (err) {
      showFeedback('error', err.message || 'Operation failed.');
    }
  };

  const handleDeleteProperty = async (propId, title) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      try {
        await api.deleteProperty(propId);
        showFeedback('success', `Property deleted successfully.`);
        loadAllData();
      } catch (err) {
        showFeedback('error', 'Failed to delete property.');
      }
    }
  };

  // APPOINTMENT HANDLERS
  const handleUpdateAppointmentStatus = async (apptId, newStatus) => {
    try {
      await api.updateAppointment(apptId, { status: newStatus });
      showFeedback('success', `Appointment status updated to ${newStatus}.`);
      loadAllData();
    } catch (err) {
      showFeedback('error', 'Failed to update appointment.');
    }
  };

  const handleDeleteAppointment = async (apptId) => {
    if (window.confirm('Delete this appointment record?')) {
      try {
        await api.deleteAppointment(apptId);
        showFeedback('success', 'Appointment deleted.');
        loadAllData();
      } catch (err) {
        showFeedback('error', 'Failed to delete appointment.');
      }
    }
  };

  // TRANSACTION HANDLERS
  const handleTxSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createTransaction(txFormData);
      showFeedback('success', 'Transaction recorded in database.');
      setIsTxModalOpen(false);
      loadAllData();
    } catch (err) {
      showFeedback('error', err.message || 'Failed to add transaction.');
    }
  };

  const handleUpdateTxStatus = async (txId, newStatus) => {
    try {
      await api.updateTransaction(txId, { status: newStatus });
      showFeedback('success', `Transaction updated to ${newStatus}.`);
      loadAllData();
    } catch (err) {
      showFeedback('error', 'Failed to update transaction.');
    }
  };

  // USER MANAGEMENT HANDLERS
  const handleDeleteUser = async (userId, name) => {
    if (window.confirm(`Delete user account for "${name}"?`)) {
      try {
        await api.deleteUser(userId);
        showFeedback('success', `User account deleted.`);
        loadAllData();
      } catch (err) {
        showFeedback('error', 'Failed to delete user.');
      }
    }
  };

  return (
    <div className="dashboard-root">
      {/* Top Banner */}
      <div className="dashboard-banner">
        <div className="container banner-inner">
          <div>
            <div className="admin-pill-tag">
              <Shield size={14} /> Executive Admin Console
            </div>
            <h1>EstateEase Management Center</h1>
            <p>Welcome back, <strong>{user?.name}</strong>. Real-time control of properties, clients, appointments, and financial records.</p>
          </div>
          <button onClick={loadAllData} className="btn btn-outline-white btn-sm" disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Sync Live DB</span>
          </button>
        </div>
      </div>

      <div className="container dashboard-main-area">
        {/* Feedback Alert */}
        {feedback.text && (
          <div className={`alert alert-${feedback.type}`}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="dashboard-nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview & Stats
          </button>
          <button
            className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            Properties ({properties.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users & Agents ({users.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments ({appointments.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions & Payments
          </button>
          <button
            className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Inquiries ({messages.length})
          </button>
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="tab-pane">
            {/* KPI Metric Cards */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Total Properties</span>
                  <div className="metric-icon"><Building2 size={20} /></div>
                </div>
                <div className="metric-val">{properties.length}</div>
                <span className="metric-sub">Active in MySQL catalog</span>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Registered Clients</span>
                  <div className="metric-icon"><Users size={20} /></div>
                </div>
                <div className="metric-val">{clients.length}</div>
                <span className="metric-sub">Prospective buyers & tenants</span>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Active Agents</span>
                  <div className="metric-icon"><Shield size={20} /></div>
                </div>
                <div className="metric-val">{agents.length}</div>
                <span className="metric-sub">Licensed advisors</span>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Total Transactions</span>
                  <div className="metric-icon"><DollarSign size={20} /></div>
                </div>
                <div className="metric-val">{transactions.length}</div>
                <span className="metric-sub">
                  Volume: ₹{transactions.reduce((acc, t) => acc + Number(t.amount || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Quick Actions & Recent Rows */}
            <div className="overview-two-col">
              {/* Recent Appointments */}
              <div className="dashboard-panel-card">
                <div className="panel-card-header">
                  <h3>Recent Viewing Appointments</h3>
                  <button onClick={() => setActiveTab('appointments')} className="text-link-btn">
                    View All →
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Property</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.slice(0, 5).map((a) => (
                        <tr key={a.appointment_id}>
                          <td>
                            <strong>{a.client_name || 'Client'}</strong>
                            <small className="cell-sub">{a.client_phone}</small>
                          </td>
                          <td>{a.property_title}</td>
                          <td>{new Date(a.appointment_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                          <td>
                            <span className={`badge ${a.status === 'Completed' ? 'badge-available' : a.status === 'Scheduled' ? 'badge-rent' : 'badge-sold'}`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="dashboard-panel-card">
                <div className="panel-card-header">
                  <h3>Recent Transactions</h3>
                  <button onClick={() => setActiveTab('transactions')} className="text-link-btn">
                    View All →
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map((t) => (
                        <tr key={t.transaction_id}>
                          <td>
                            <strong>{t.property_title || `Prop #${t.property_id}`}</strong>
                            <small className="cell-sub">{t.client_name}</small>
                          </td>
                          <td><span className="badge badge-sale">{t.transaction_type}</span></td>
                          <td><strong>₹{Number(t.amount).toLocaleString('en-IN')}</strong></td>
                          <td>
                            <span className={`badge ${t.status === 'Completed' ? 'badge-available' : 'badge-rent'}`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PROPERTIES MANAGEMENT ================= */}
        {activeTab === 'properties' && (
          <div className="tab-pane">
            <div className="pane-action-bar">
              <div>
                <h2>Manage Real Estate Listings</h2>
                <p>Add, update, or remove property records from MySQL database.</p>
              </div>
              <button onClick={openAddPropertyModal} className="btn btn-primary btn-sm">
                <Plus size={16} /> Add New Property
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
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
                          <div className="row-action-btns">
                            <button
                              onClick={() => openEditPropertyModal(p)}
                              className="btn-icon-table edit"
                              title="Edit Property"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteProperty(p.property_id, p.title)}
                              className="btn-icon-table delete"
                              title="Delete Property"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: USERS & AGENTS ================= */}
        {activeTab === 'users' && (
          <div className="tab-pane">
            <div className="pane-action-bar">
              <div>
                <h2>Users & Agent Directory</h2>
                <p>Review registered advisors and platform administrators.</p>
              </div>
            </div>

            <div className="dashboard-panel-card">
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Experience</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.user_id}>
                        <td>#{u.user_id}</td>
                        <td>
                          <strong>{u.name}</strong>
                          {u.user_id === user?.user_id && <span className="you-pill"> (You)</span>}
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'Admin' ? 'badge-admin' : 'badge-agent'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{u.phone || '—'}</td>
                        <td>{u.experience ? `${u.experience} yrs` : '—'}</td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          {u.user_id !== user?.user_id && (
                            <button
                              onClick={() => handleDeleteUser(u.user_id, u.name)}
                              className="btn-icon-table delete"
                              title="Delete User"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: APPOINTMENTS ================= */}
        {activeTab === 'appointments' && (
          <div className="tab-pane">
            <div className="pane-action-bar">
              <div>
                <h2>Viewing Appointments</h2>
                <p>Manage all scheduled inspections between clients, agents, and properties.</p>
              </div>
            </div>

            <div className="dashboard-panel-card">
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Client Name</th>
                      <th>Contact Info</th>
                      <th>Property Title</th>
                      <th>Assigned Agent</th>
                      <th>Appointment Date</th>
                      <th>Status</th>
                      <th>Change Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a) => (
                      <tr key={a.appointment_id}>
                        <td>#{a.appointment_id}</td>
                        <td><strong>{a.client_name || 'Client'}</strong></td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}><Phone size={12} /> {a.client_phone || 'N/A'}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}><Mail size={12} /> {a.client_email}</div>
                        </td>
                        <td>{a.property_title || `Prop #${a.property_id}`}</td>
                        <td>{a.agent_name || `Agent #${a.agent_id}`}</td>
                        <td>{new Date(a.appointment_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                        <td>
                          <span className={`badge ${a.status === 'Completed' ? 'badge-available' : a.status === 'Scheduled' ? 'badge-rent' : 'badge-sold'}`}>
                            {a.status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={a.status}
                            onChange={(e) => handleUpdateAppointmentStatus(a.appointment_id, e.target.value)}
                            className="table-select-status"
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteAppointment(a.appointment_id)}
                            className="btn-icon-table delete"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: TRANSACTIONS & PAYMENTS ================= */}
        {activeTab === 'transactions' && (
          <div className="tab-pane">
            <div className="pane-action-bar">
              <div>
                <h2>Transactions & Payment Ledgers</h2>
                <p>Track closed real estate deeds, lease agreements, and incoming payments.</p>
              </div>
              <button
                onClick={() => {
                  setTxFormData({
                    property_id: properties.length > 0 ? properties[0].property_id : '',
                    client_id: clients.length > 0 ? clients[0].client_id : '1',
                    agent_id: agents.length > 0 ? agents[0].agent_id : '1',
                    transaction_type: 'Sale',
                    amount: '',
                    status: 'Pending'
                  });
                  setIsTxModalOpen(true);
                }}
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} /> Record Transaction
              </button>
            </div>

            {/* Transactions Table */}
            <div className="dashboard-panel-card" style={{ marginBottom: '32px' }}>
              <div className="panel-card-header">
                <h3>Transactions Ledger</h3>
              </div>
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>TX ID</th>
                      <th>Property Title</th>
                      <th>Client</th>
                      <th>Agent</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.transaction_id}>
                        <td>#{t.transaction_id}</td>
                        <td><strong>{t.property_title || `Prop #${t.property_id}`}</strong></td>
                        <td>{t.client_name || `Client #${t.client_id}`}</td>
                        <td>{t.agent_name || `Agent #${t.agent_id}`}</td>
                        <td><span className="badge badge-sale">{t.transaction_type}</span></td>
                        <td><strong>₹{Number(t.amount).toLocaleString('en-IN')}</strong></td>
                        <td>{new Date(t.transaction_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${t.status === 'Completed' ? 'badge-available' : 'badge-rent'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={t.status}
                            onChange={(e) => handleUpdateTxStatus(t.transaction_id, e.target.value)}
                            className="table-select-status"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payments Table */}
            <div className="dashboard-panel-card">
              <div className="panel-card-header">
                <h3>Payments Log</h3>
              </div>
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Pay ID</th>
                      <th>Transaction ID</th>
                      <th>Property Title</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Date</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.payment_id}>
                        <td>#{p.payment_id}</td>
                        <td>TX #{p.transaction_id}</td>
                        <td>{p.property_title || 'N/A'}</td>
                        <td><strong>₹{Number(p.amount).toLocaleString('en-IN')}</strong></td>
                        <td>{p.payment_method}</td>
                        <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${p.payment_status === 'Completed' ? 'badge-available' : 'badge-rent'}`}>
                            {p.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: INQUIRIES / MESSAGES ================= */}
        {activeTab === 'messages' && (
          <div className="tab-pane">
            <div className="pane-action-bar">
              <div>
                <h2>Client Inquiries & Contact Forms</h2>
                <p>Correspondence submitted through the EstateEase contact portal.</p>
              </div>
            </div>

            <div className="dashboard-panel-card">
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Sender</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>
                          No messages received yet.
                        </td>
                      </tr>
                    ) : (
                      messages.map((m) => (
                        <tr key={m.message_id}>
                          <td>#{m.message_id}</td>
                          <td><strong>{m.name}</strong></td>
                          <td>{m.email}</td>
                          <td><span className="badge badge-rent">{m.subject}</span></td>
                          <td style={{ maxWidth: '300px' }}>{m.message}</td>
                          <td>{new Date(m.created_at).toLocaleString()}</td>
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

      {/* ================= MODAL: ADD / EDIT PROPERTY ================= */}
      {isPropertyModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPropertyModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>{editingProperty ? 'Edit Property Details' : 'Add New Luxury Property'}</h3>
              <button className="modal-close-btn" onClick={() => setIsPropertyModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePropertySubmit}>
              <div className="form-group">
                <label>Property Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Imperial Golf Links Penthouse"
                  value={propertyFormData.title}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    className="form-control"
                    value={propertyFormData.property_type}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, property_type: e.target.value })}
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="House">House</option>
                    <option value="Plot">Plot</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>City / Location *</label>
                  <select
                    className="form-control"
                    value={propertyFormData.location}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, location: e.target.value })}
                  >
                    <option value="Gurugram">Gurugram</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Noida">Noida</option>
                    <option value="Faridabad">Faridabad</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (₹ INR) *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 8500000"
                    value={propertyFormData.price}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Full Physical Address</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sector 65, Golf Course Extension Road, Gurugram"
                  value={propertyFormData.address}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div className="form-group">
                  <label>Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={propertyFormData.bedrooms}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, bedrooms: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Bathrooms</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={propertyFormData.bathrooms}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, bathrooms: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Area (Sq.Ft)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={propertyFormData.area_sqft}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, area_sqft: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Purpose</label>
                  <select
                    className="form-control"
                    value={propertyFormData.listing_type}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, listing_type: e.target.value })}
                  >
                    <option value="Sale">For Sale</option>
                    <option value="Rent">For Rent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={propertyFormData.status}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, status: e.target.value })}
                  >
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Rented">Rented</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Assigned Agent</label>
                  <select
                    className="form-control"
                    value={propertyFormData.agent_id}
                    onChange={(e) => setPropertyFormData({ ...propertyFormData, agent_id: e.target.value })}
                  >
                    {agents.map((ag) => (
                      <option key={ag.agent_id} value={ag.agent_id}>
                        {ag.name} (ID: #{ag.agent_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Primary Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={propertyFormData.image_url}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, image_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description & Architectural Highlights</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Describe unique architectural qualities, panoramic views, marble flooring..."
                  value={propertyFormData.description}
                  onChange={(e) => setPropertyFormData({ ...propertyFormData, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsPropertyModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingProperty ? 'Update Property' : 'Save & Publish Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD TRANSACTION ================= */}
      {isTxModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTxModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3>Record New Real Estate Transaction</h3>
              <button className="modal-close-btn" onClick={() => setIsTxModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleTxSubmit}>
              <div className="form-group">
                <label>Property</label>
                <select
                  className="form-control"
                  value={txFormData.property_id}
                  onChange={(e) => setTxFormData({ ...txFormData, property_id: e.target.value })}
                  required
                >
                  <option value="">Select Property</option>
                  {properties.map((p) => (
                    <option key={p.property_id} value={p.property_id}>
                      {p.title} (₹{Number(p.price).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Client</label>
                <select
                  className="form-control"
                  value={txFormData.client_id}
                  onChange={(e) => setTxFormData({ ...txFormData, client_id: e.target.value })}
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map((c) => (
                    <option key={c.client_id} value={c.client_id}>
                      {c.client_name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label>Transaction Type</label>
                  <select
                    className="form-control"
                    value={txFormData.transaction_type}
                    onChange={(e) => setTxFormData({ ...txFormData, transaction_type: e.target.value })}
                  >
                    <option value="Sale">Sale</option>
                    <option value="Rent">Rent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount (₹ INR) *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="e.g. 8500000"
                    value={txFormData.amount}
                    onChange={(e) => setTxFormData({ ...txFormData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-control"
                  value={txFormData.status}
                  onChange={(e) => setTxFormData({ ...txFormData, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsTxModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
