import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X, CheckCircle2, ShieldCheck, CreditCard, Building,
  ArrowRight, IndianRupee, QrCode, Landmark, Sparkles, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './CheckoutModal.css';

export default function CheckoutModal({ isOpen, onClose, property, initialMode = 'buy', onSuccess }) {
  const { user, isAuthenticated } = useAuth();
  const [dealType, setDealType] = useState(initialMode); // 'buy' | 'rent'
  const [paymentMethod, setPaymentMethod] = useState('rtgs'); // 'rtgs' | 'upi' | 'card'
  const [paymentOption, setPaymentOption] = useState('full'); // 'full' | 'token'
  
  const [clientName, setClientName] = useState(user?.name || '');
  const [clientPhone, setClientPhone] = useState(user?.phone || '');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [utrNumber, setUtrNumber] = useState(`UTR${Date.now().toString().slice(-8)}`);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!isOpen || !property) return null;

  const basePrice = Number(property.price || 0);

  // Calculations
  let totalAmount = 0;
  if (dealType === 'buy') {
    if (paymentOption === 'token') {
      totalAmount = Math.round(basePrice * 0.10); // 10% token deposit
    } else {
      totalAmount = basePrice;
    }
  } else {
    // Rent calculation: 1 month rent + 2 months security deposit
    const monthlyRent = property.listing_type === 'Rent' ? basePrice : Math.round(basePrice * 0.003);
    totalAmount = monthlyRent * 3;
  }

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const clientId = user?.client_id || 1;
      const agentId = property.agent_id || 1;

      const payload = {
        property_id: property.property_id,
        client_id: clientId,
        agent_id: agentId,
        transaction_type: dealType === 'buy' ? 'Sale' : 'Rent',
        amount: totalAmount,
        status: 'Completed',
        transaction_date: new Date().toISOString().slice(0, 10)
      };

      const res = await api.createTransaction(payload);
      
      setSuccessData({
        transaction_id: res.transaction_id || `TX-${Date.now().toString().slice(-4)}`,
        property_title: property.title,
        amount: totalAmount,
        type: dealType === 'buy' ? 'Property Acquisition (Purchase)' : 'Residential Lease (Rent)',
        utr: utrNumber,
        method: paymentMethod.toUpperCase(),
        date: new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Transaction could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-modal-overlay" onClick={onClose}>
      <div className="checkout-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="checkout-close-btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        {!successData ? (
          <div>
            <div className="checkout-header">
              <span className="checkout-badge">
                <Sparkles size={14} /> SECURE ESCROW SETTLEMENT
              </span>
              <h2>Confirm Acquisition & Transfer</h2>
              <p>Execute real-time funds settlement with institutional RERA title registry.</p>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Deal Type Selector (Buy vs Rent) */}
            <div className="deal-type-selector">
              <button
                type="button"
                className={`deal-type-btn ${dealType === 'buy' ? 'active' : ''}`}
                onClick={() => setDealType('buy')}
              >
                <strong>🏛️ Buy Property</strong>
                <small>Full Title Ownership</small>
              </button>

              <button
                type="button"
                className={`deal-type-btn ${dealType === 'rent' ? 'active' : ''}`}
                onClick={() => setDealType('rent')}
              >
                <strong>🔑 Lease / Rent</strong>
                <small>Monthly Lease & Deposit</small>
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit}>
              {/* Property Summary Strip */}
              <div className="checkout-property-strip">
                <img
                  src={(property.images && property.images[0]) || property.primary_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=80'}
                  alt={property.title}
                  className="checkout-prop-thumb"
                />
                <div className="checkout-prop-info">
                  <h4>{property.title}</h4>
                  <p>{property.location} • {property.bedrooms} BHK • {Number(property.area_sqft).toLocaleString()} Sq.Ft</p>
                  <span className="checkout-base-price">
                    Asset Listed At: ₹{basePrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Option for Buy (Full vs 10% Token) */}
              {dealType === 'buy' && (
                <div className="payment-plan-box">
                  <label className="plan-label">Select Payment Structure:</label>
                  <div className="plan-options-grid">
                    <label className={`plan-radio-card ${paymentOption === 'full' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentOption"
                        value="full"
                        checked={paymentOption === 'full'}
                        onChange={() => setPaymentOption('full')}
                      />
                      <div>
                        <strong>Full Settlement (100%)</strong>
                        <span>Immediate title conveyance transfer</span>
                      </div>
                    </label>

                    <label className={`plan-radio-card ${paymentOption === 'token' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="paymentOption"
                        value="token"
                        checked={paymentOption === 'token'}
                        onChange={() => setPaymentOption('token')}
                      />
                      <div>
                        <strong>10% VIP Booking Token</strong>
                        <span>Lock asset with balance in 30 days</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Settlement Method Tabs */}
              <div className="transfer-method-section">
                <label className="plan-label">Payment & Transfer Method:</label>
                <div className="transfer-methods-tabs">
                  <button
                    type="button"
                    className={`method-tab-btn ${paymentMethod === 'rtgs' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('rtgs')}
                  >
                    <Landmark size={16} /> Bank Wire (RTGS / NEFT)
                  </button>

                  <button
                    type="button"
                    className={`method-tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <QrCode size={16} /> Instant UPI
                  </button>

                  <button
                    type="button"
                    className={`method-tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard size={16} /> Net Banking / Card
                  </button>
                </div>

                {/* Bank Wire Details */}
                {paymentMethod === 'rtgs' && (
                  <div className="escrow-bank-card">
                    <div className="escrow-bank-header">
                      <Building size={16} />
                      <strong>EstateEase Escrow Trust Account (HDFC Bank)</strong>
                    </div>
                    <div className="bank-meta-grid">
                      <div><span>Account No:</span> <strong>50200088991122</strong></div>
                      <div><span>IFSC Code:</span> <strong>HDFC0001234</strong></div>
                      <div><span>Branch:</span> <strong>DLF CyberCity Private Wealth</strong></div>
                      <div><span>UTR / Ref No:</span> <strong>{utrNumber}</strong></div>
                    </div>
                  </div>
                )}

                {/* UPI Details */}
                {paymentMethod === 'upi' && (
                  <div className="escrow-bank-card" style={{ textAlign: 'center', padding: '16px' }}>
                    <p style={{ margin: '0 0 6px', fontWeight: '600' }}>Official EstateEase UPI VPA:</p>
                    <code style={{ background: '#ECEFE6', padding: '4px 10px', borderRadius: '4px', fontSize: '0.95rem', color: '#173D32' }}>
                      estateease.luxury@hdfcbank
                    </code>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                      Instant settlement via Google Pay, PhonePe, Paytm, or BHIM.
                    </p>
                  </div>
                )}

                {/* Card / NetBanking */}
                {paymentMethod === 'card' && (
                  <div className="escrow-bank-card">
                    <p style={{ margin: '0', fontSize: '0.85rem' }}>
                      🛡️ Protected with 256-bit SSL Escrow Gateway. Supports HDFC, ICICI, SBI, Axis Private Wealth cards and net banking accounts.
                    </p>
                  </div>
                )}
              </div>

              {/* Client Payer Information */}
              <div className="payer-info-grid">
                <div className="form-group">
                  <label>Payer Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter full legal name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. 9811111111"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Financial Total Box */}
              <div className="checkout-total-box">
                <div className="total-row">
                  <span>Transfer Category:</span>
                  <strong>{dealType === 'buy' ? (paymentOption === 'token' ? '10% Booking Advance' : 'Full Purchase Value') : 'Lease Advance (Rent + Deposit)'}</strong>
                </div>
                <div className="total-row">
                  <span>Escrow & Legal Verification:</span>
                  <strong style={{ color: '#059669' }}>FREE (0% Commission)</strong>
                </div>
                <div className="total-divider"></div>
                <div className="total-row total-highlight">
                  <span>Total Amount Payable:</span>
                  <span className="total-currency">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="checkout-actions">
                <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-confirm-transfer" disabled={loading}>
                  {loading ? 'Processing Transfer...' : (dealType === 'buy' ? `Confirm & Pay ₹${totalAmount.toLocaleString('en-IN')}` : `Confirm Lease & Pay ₹${totalAmount.toLocaleString('en-IN')}`)}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Success Receipt Card */
          <div className="checkout-success-view">
            <div className="success-icon-badge">
              <CheckCircle2 size={42} />
            </div>
            <h2>Transaction Completed Successfully!</h2>
            <p className="success-subtitle">
              Your funds transfer has been authenticated and registered in the EstateEase ledger.
            </p>

            <div className="receipt-box">
              <div className="receipt-header">
                <span>OFFICIAL ESCROW RECEIPT</span>
                <strong>#{successData.transaction_id}</strong>
              </div>
              <div className="receipt-body">
                <div className="receipt-row">
                  <span>Property Title:</span>
                  <strong>{successData.property_title}</strong>
                </div>
                <div className="receipt-row">
                  <span>Transaction Type:</span>
                  <strong>{successData.type}</strong>
                </div>
                <div className="receipt-row">
                  <span>Settlement Mode:</span>
                  <strong>{successData.method}</strong>
                </div>
                <div className="receipt-row">
                  <span>Bank UTR Reference:</span>
                  <code>{successData.utr}</code>
                </div>
                <div className="receipt-row">
                  <span>Settlement Date:</span>
                  <strong>{successData.date}</strong>
                </div>
                <div className="receipt-divider"></div>
                <div className="receipt-row receipt-amount">
                  <span>Amount Transferred:</span>
                  <span className="receipt-price">₹{successData.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="success-next-steps">
              <p>
                ✓ Property status has been updated to <strong>{dealType === 'buy' ? 'Sold' : 'Rented'}</strong>.
              </p>
              <p>
                ✓ All legal documentation and agreements are accessible in your Client Lounge.
              </p>
            </div>

            <div className="success-cta-row">
              <Link to="/dashboard/client" className="btn btn-primary" onClick={onClose}>
                View in Client Lounge →
              </Link>
              <button type="button" className="btn btn-outline" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
