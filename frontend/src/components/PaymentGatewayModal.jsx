import { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  X, ShieldCheck, CreditCard, QrCode, Landmark, CheckCircle2,
  Lock, ArrowRight, RefreshCw, Printer, AlertCircle, Building2,
  Smartphone, Eye, EyeOff, Sparkles, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './PaymentGatewayModal.css';

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  property,
  amount,
  dealType = 'Sale',
  clientDetails,
  onPaymentSuccess
}) {
  // Navigation Tabs: 'card' | 'upi' | 'netbanking' | 'bank_transfer'
  const [activeMethod, setActiveMethod] = useState('card');
  
  // Stages: 'payment_input' -> 'otp_verification' -> 'processing' -> 'success_invoice'
  const [stage, setStage] = useState('payment_input');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('4532 8920 1144 8891');
  const [cardHolder, setCardHolder] = useState(clientDetails?.name || 'VIP Buyer');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('882');

  // UPI Form State
  const [upiId, setUpiId] = useState('buyer@okaxis');
  const [upiTimer, setUpiTimer] = useState(300); // 5 mins countdown

  // NetBanking State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Processing state
  const [processingMsg, setProcessingMsg] = useState('Connecting to banking network...');
  const [error, setError] = useState('');
  const [finalReceipt, setFinalReceipt] = useState(null);

  // Timer for UPI
  useEffect(() => {
    let interval;
    if (stage === 'payment_input' && activeMethod === 'upi') {
      interval = setInterval(() => {
        setUpiTimer((prev) => (prev > 0 ? prev - 1 : 300));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, activeMethod]);

  if (!isOpen || !property) return null;

  const totalAmount = Number(amount || property.price || 0);
  const formattedAmount = totalAmount.toLocaleString('en-IN');

  const popularBanks = [
    { name: 'HDFC Bank', code: 'HDFC', badge: 'Fastest' },
    { name: 'State Bank of India', code: 'SBI', badge: 'Popular' },
    { name: 'ICICI Bank', code: 'ICICI', badge: 'Instant' },
    { name: 'Axis Bank', code: 'AXIS', badge: 'Verified' },
    { name: 'Kotak Mahindra', code: 'KOTAK', badge: 'Escrow' }
  ];

  // Initiate Payment -> Move to Bank 3D Secure OTP
  const handleInitiatePayment = (e) => {
    e.preventDefault();
    setError('');

    if (activeMethod === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        setError('Please fill in complete card information.');
        return;
      }
    } else if (activeMethod === 'upi') {
      if (!upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g. name@okhdfcbank).');
        return;
      }
    }

    // Advance to 3D Secure Verification
    setOtp('');
    setOtpError('');
    setStage('otp_verification');
  };

  // Submit Bank OTP & Call API
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');

    // Accept demo OTP '123456' or any 4-6 digit numeric OTP for ease in viva
    if (!otp || otp.length < 4) {
      setOtpError('Please enter valid 6-digit Bank OTP. (Demo test OTP: 123456)');
      return;
    }

    setStage('processing');
    setProcessingMsg('Authenticating 3D-Secure with Reserve Bank network...');

    try {
      await new Promise(r => setTimeout(r, 1200));
      setProcessingMsg('Executing escrow settlement with EstateEase Treasury...');
      await new Promise(r => setTimeout(r, 1000));

      const paymentMethodMapped =
        activeMethod === 'upi' ? 'UPI' :
        activeMethod === 'card' ? 'Card' : 'Bank Transfer';

      const res = await api.processPayment({
        property_id: property.property_id,
        client_id: clientDetails?.client_id || 1,
        agent_id: property.agent_id || 1,
        transaction_type: dealType,
        amount: totalAmount,
        payment_method: paymentMethodMapped,
        payer_name: clientName(clientDetails),
        payer_phone: clientDetails?.phone || '9811111111',
        payer_email: clientDetails?.email || 'client@estateease.com'
      });

      if (res.success && res.receipt) {
        setFinalReceipt({
          ...res.receipt,
          property_title: property.title,
          location: property.location,
          invoice_no: `INV-2026-${Math.floor(Math.random() * 89999 + 10000)}`,
          bank_name: activeMethod === 'netbanking' ? selectedBank : 'HDFC Private Banking Ltd',
          deal_type_label: dealType === 'Rent' ? 'Residential Lease Agreement' : 'Outright Property Acquisition'
        });
        setStage('success_invoice');
        if (onPaymentSuccess) onPaymentSuccess();
      } else {
        throw new Error(res.message || 'Payment could not be settled.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Payment processing failed. Please retry.');
      setStage('payment_input');
    }
  };

  function clientName(c) {
    if (c?.name) return c.name;
    if (cardHolder) return cardHolder;
    return 'VIP Client';
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="gateway-modal-overlay">
      <div className={`gateway-container ${stage === 'success_invoice' ? 'invoice-mode' : ''}`}>
        
        {/* Header Bar */}
        <div className="gateway-header">
          <div className="gateway-brand">
            <div className="gateway-logo-icon">
              <Building2 size={20} />
            </div>
            <div>
              <h3>EstateEase Gateway</h3>
              <span className="gateway-sub">Secured by 256-Bit Escrow Protocol</span>
            </div>
          </div>

          <div className="gateway-header-right">
            <div className="gateway-amount-pill">
              <small>TOTAL PAYABLE</small>
              <strong>₹{formattedAmount}</strong>
            </div>
            {stage !== 'processing' && (
              <button className="gateway-close-icon" onClick={onClose} aria-label="Close Gateway">
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* STAGE 1: PAYMENT METHOD SELECTION */}
        {stage === 'payment_input' && (
          <div className="gateway-body">
            {error && (
              <div className="alert alert-error" style={{ margin: '14px 20px 0' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="gateway-layout">
              {/* Left Sidebar Methods */}
              <div className="gateway-sidebar">
                <span className="sidebar-heading">SELECT PAYMENT METHOD</span>

                <button
                  type="button"
                  className={`method-nav-item ${activeMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setActiveMethod('card')}
                >
                  <CreditCard size={18} />
                  <div>
                    <strong>Cards (Credit / Debit)</strong>
                    <small>Visa, Mastercard, RuPay</small>
                  </div>
                </button>

                <button
                  type="button"
                  className={`method-nav-item ${activeMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setActiveMethod('upi')}
                >
                  <QrCode size={18} />
                  <div>
                    <strong>UPI & QR Code</strong>
                    <small>Google Pay, PhonePe, Paytm</small>
                  </div>
                </button>

                <button
                  type="button"
                  className={`method-nav-item ${activeMethod === 'netbanking' ? 'active' : ''}`}
                  onClick={() => setActiveMethod('netbanking')}
                >
                  <Landmark size={18} />
                  <div>
                    <strong>NetBanking</strong>
                    <small>All Indian Banks</small>
                  </div>
                </button>

                <button
                  type="button"
                  className={`method-nav-item ${activeMethod === 'bank_transfer' ? 'active' : ''}`}
                  onClick={() => setActiveMethod('bank_transfer')}
                >
                  <Smartphone size={18} />
                  <div>
                    <strong>RTGS / NEFT Escrow</strong>
                    <small>Direct Corporate Wire</small>
                  </div>
                </button>

                <div className="gateway-guarantee-note">
                  <ShieldCheck size={16} />
                  <span>RERA Title Insured & Escrow Protected</span>
                </div>
              </div>

              {/* Right Method Active Content */}
              <div className="gateway-content-pane">
                {/* 1. CARD FORM */}
                {activeMethod === 'card' && (
                  <form onSubmit={handleInitiatePayment} className="gateway-form">
                    <div className="pane-title-row">
                      <h4>Card Details (Domestic & International)</h4>
                      <div className="card-logos-row">
                        <span className="card-badge visa">VISA</span>
                        <span className="card-badge mc">Mastercard</span>
                        <span className="card-badge rupay">RuPay</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Card Number</label>
                      <div className="input-with-icon">
                        <CreditCard size={18} className="input-icon" />
                        <input
                          type="text"
                          className="form-control"
                          placeholder="4532 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          maxLength={19}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Cardholder Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="NAME AS SHOWN ON CARD"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group">
                        <label>Expiry Date (MM/YY)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          maxLength={5}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>CVV / Security Code</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>

                    <div className="quick-fill-row">
                      <button
                        type="button"
                        className="btn-quick-fill"
                        onClick={() => {
                          setCardNumber('4532 8844 9912 3381');
                          setCardHolder('HARSHITA DHINGRA');
                          setCardExpiry('12/28');
                          setCardCvv('789');
                        }}
                      >
                        ⚡ Use Demo HDFC Black Luxury Card
                      </button>
                    </div>

                    <button type="submit" className="btn btn-primary btn-pay-now">
                      <Lock size={16} />
                      <span>Proceed to 3D Secure OTP (Pay ₹{formattedAmount})</span>
                    </button>
                  </form>
                )}

                {/* 2. UPI & QR CODE */}
                {activeMethod === 'upi' && (
                  <form onSubmit={handleInitiatePayment} className="gateway-form">
                    <div className="pane-title-row">
                      <h4>Pay via UPI or Instant QR Code</h4>
                      <span className="upi-timer-badge">⏳ Expires in {formatTimer(upiTimer)}</span>
                    </div>

                    <div className="upi-qr-display-box">
                      <div className="qr-box-frame">
                        <svg viewBox="0 0 100 100" width="130" height="130">
                          {/* Simulated SVG QR Matrix */}
                          <rect width="100" height="100" fill="#FFFFFF" />
                          <rect x="10" y="10" width="26" height="26" fill="#173D32" />
                          <rect x="14" y="14" width="18" height="18" fill="#FFFFFF" />
                          <rect x="18" y="18" width="10" height="10" fill="#173D32" />
                          
                          <rect x="64" y="10" width="26" height="26" fill="#173D32" />
                          <rect x="68" y="14" width="18" height="18" fill="#FFFFFF" />
                          <rect x="72" y="18" width="10" height="10" fill="#173D32" />
                          
                          <rect x="10" y="64" width="26" height="26" fill="#173D32" />
                          <rect x="14" y="68" width="18" height="18" fill="#FFFFFF" />
                          <rect x="18" y="72" width="10" height="10" fill="#173D32" />

                          <circle cx="50" cy="50" r="10" fill="#C9B58B" />
                          <rect x="42" y="18" width="8" height="8" fill="#173D32" />
                          <rect x="52" y="24" width="6" height="6" fill="#173D32" />
                          <rect x="42" y="70" width="12" height="10" fill="#173D32" />
                          <rect x="65" y="55" width="8" height="14" fill="#173D32" />
                          <rect x="75" y="75" width="14" height="14" fill="#173D32" />
                        </svg>
                      </div>
                      <div className="qr-instructions">
                        <strong>Scan with any UPI App</strong>
                        <p>Google Pay • PhonePe • Paytm • BHIM • CRED</p>
                        <span className="qr-vpa-pill">UPI ID: estateease.luxury@hdfcbank</span>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '16px' }}>
                      <label>Or enter your UPI ID</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="yourname@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary btn-pay-now">
                      <Lock size={16} />
                      <span>Verify & Approve UPI Payment (₹{formattedAmount})</span>
                    </button>
                  </form>
                )}

                {/* 3. NETBANKING */}
                {activeMethod === 'netbanking' && (
                  <form onSubmit={handleInitiatePayment} className="gateway-form">
                    <div className="pane-title-row">
                      <h4>Select Your Financial Institution</h4>
                      <small style={{ color: '#059669', fontWeight: '600' }}>Direct Bank Integration</small>
                    </div>

                    <div className="popular-banks-grid">
                      {popularBanks.map((b) => (
                        <button
                          key={b.code}
                          type="button"
                          className={`bank-card-select ${selectedBank === b.name ? 'active' : ''}`}
                          onClick={() => setSelectedBank(b.name)}
                        >
                          <strong>{b.code}</strong>
                          <span>{b.name}</span>
                          <small className="bank-tag">{b.badge}</small>
                        </button>
                      ))}
                    </div>

                    <div className="form-group" style={{ marginTop: '14px' }}>
                      <label>All Other Indian Banks</label>
                      <select
                        className="form-control"
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                      >
                        <option value="HDFC Bank">HDFC Bank (Private Wealth)</option>
                        <option value="State Bank of India">State Bank of India</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
                        <option value="Punjab National Bank">Punjab National Bank</option>
                        <option value="Bank of Baroda">Bank of Baroda</option>
                        <option value="IndusInd Bank">IndusInd Bank</option>
                        <option value="Standard Chartered">Standard Chartered India</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary btn-pay-now">
                      <Lock size={16} />
                      <span>Authenticate via {selectedBank} (Pay ₹{formattedAmount})</span>
                    </button>
                  </form>
                )}

                {/* 4. BANK TRANSFER ESCROW */}
                {activeMethod === 'bank_transfer' && (
                  <form onSubmit={handleInitiatePayment} className="gateway-form">
                    <div className="pane-title-row">
                      <h4>EstateEase Official Institutional Escrow Account</h4>
                    </div>

                    <div className="bank-wire-full-card">
                      <div className="wire-meta-row">
                        <span>Beneficiary Name:</span>
                        <strong>EstateEase Realty Escrow Account Pvt Ltd</strong>
                      </div>
                      <div className="wire-meta-row">
                        <span>Escrow Bank:</span>
                        <strong>HDFC Bank Ltd (Corporate Banking Division)</strong>
                      </div>
                      <div className="wire-meta-row">
                        <span>Account Number:</span>
                        <code>50200088991122</code>
                      </div>
                      <div className="wire-meta-row">
                        <span>IFSC Code:</span>
                        <code>HDFC0001234</code>
                      </div>
                      <div className="wire-meta-row">
                        <span>Account Type:</span>
                        <strong>Escrow Current Account</strong>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '14px 0 16px' }}>
                      Click below to simulate real-time RTGS authorization with the central clearing house.
                    </p>

                    <button type="submit" className="btn btn-primary btn-pay-now">
                      <Lock size={16} />
                      <span>Confirm RTGS Wire Transfer (₹{formattedAmount})</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: 3D SECURE BANK OTP VERIFICATION */}
        {stage === 'otp_verification' && (
          <div className="gateway-otp-screen">
            <div className="bank-auth-header">
              <div className="bank-auth-brand">
                <ShieldCheck size={26} color="#059669" />
                <div>
                  <h4>Bank 3D-Secure 2.0 Identity Verification</h4>
                  <span>HDFC / RBI Central Payment Gateway Authorization</span>
                </div>
              </div>
              <div className="bank-auth-badge">Verified by VISA / RuPay</div>
            </div>

            <div className="bank-auth-card">
              <div className="auth-row">
                <span>Merchant:</span>
                <strong>EstateEase Luxury Escrow Ltd</strong>
              </div>
              <div className="auth-row">
                <span>Transaction Value:</span>
                <strong style={{ color: '#059669', fontSize: '1.1rem' }}>₹{formattedAmount}</strong>
              </div>
              <div className="auth-row">
                <span>Paying via:</span>
                <strong>{activeMethod.toUpperCase()} Settlement</strong>
              </div>
              <div className="auth-row">
                <span>Security Token:</span>
                <span className="demo-otp-helper">⚡ Demo OTP: <strong>123456</strong></span>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="otp-form">
              <p className="otp-instruction">
                An authentication OTP has been sent to the registered mobile number linked with this account.
              </p>

              {otpError && (
                <div className="alert alert-error" style={{ marginBottom: '14px' }}>
                  <AlertCircle size={16} />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="otp-input-wrapper">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="otp-field"
                  autoFocus
                  required
                />
              </div>

              <div className="otp-quick-fill-btn-row">
                <button
                  type="button"
                  className="btn-use-otp"
                  onClick={() => setOtp('123456')}
                >
                  Click to Auto-fill OTP (123456)
                </button>
              </div>

              <div className="otp-actions-row">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStage('payment_input')}
                >
                  Back
                </button>
                <button type="submit" className="btn btn-primary btn-submit-otp">
                  <CheckCircle2 size={16} />
                  <span>Approve & Authorize Payment</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STAGE 3: LIVE PROCESSING STATE */}
        {stage === 'processing' && (
          <div className="gateway-processing-view">
            <div className="processing-spinner">
              <RefreshCw size={48} className="spin" />
            </div>
            <h3>Processing Real-Time Settlement</h3>
            <p className="processing-status-text">{processingMsg}</p>
            <span className="processing-sub">Please do not refresh or close this window. Your connection is encrypted.</span>
          </div>
        )}

        {/* STAGE 4: PRINTABLE / DOWNLOADABLE TAX INVOICE RECEIPT */}
        {stage === 'success_invoice' && finalReceipt && (
          <div className="gateway-invoice-view">
            {/* Action Bar (Print / Done) */}
            <div className="invoice-action-bar no-print">
              <div className="invoice-success-pill">
                <CheckCircle2 size={16} /> Payment Confirmed in MySQL Database
              </div>
              <div className="invoice-buttons">
                <button type="button" className="btn btn-outline btn-sm" onClick={handlePrint}>
                  <Printer size={15} /> Print / Save Invoice PDF
                </button>
                <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>

            {/* Official Tax Invoice Container */}
            <div className="tax-invoice-sheet" id="estate-tax-invoice">
              {/* Header */}
              <div className="invoice-header">
                <div className="invoice-brand">
                  <span className="logo-text">Estate<span style={{ color: '#C9B58B' }}>Ease.</span></span>
                  <p>EstateEase Luxury Real Estate & Escrow Pvt Ltd</p>
                  <small>RERA Reg: HRERA-GGM-2024-892 | GSTIN: 07AAACE0192Q1ZS</small>
                  <small>Level 14, Two Horizon Center, Golf Course Road, Gurugram, HR</small>
                </div>

                <div className="invoice-meta-col">
                  <h2>TAX INVOICE / RECEIPT</h2>
                  <div className="invoice-id-box">
                    <div><span>Invoice No:</span> <strong>{finalReceipt.invoice_no}</strong></div>
                    <div><span>Transaction Ref:</span> <strong>#TX-{finalReceipt.transaction_id}</strong></div>
                    <div><span>Date & Time:</span> <strong>{new Date().toLocaleString('en-IN')}</strong></div>
                    <div><span>Payment Gateway Ref:</span> <code>{finalReceipt.payment_gateway_ref}</code></div>
                  </div>
                </div>
              </div>

              <div className="invoice-divider"></div>

              {/* Billed To & Property Info */}
              <div className="invoice-parties-grid">
                <div>
                  <span className="party-title">BILLED TO (CLIENT / PURCHASER)</span>
                  <h4 className="party-name">{finalReceipt.payer_name}</h4>
                  <p>Mobile: +91 {finalReceipt.payer_phone}</p>
                  <p>Email: {finalReceipt.payer_email}</p>
                  <p>Client ID: #{clientDetails?.client_id || 1}</p>
                </div>

                <div>
                  <span className="party-title">PROPERTY ASSET DETAILS</span>
                  <h4 className="party-name">{finalReceipt.property_title}</h4>
                  <p>Location: {finalReceipt.location}</p>
                  <p>Transaction Class: {finalReceipt.deal_type_label}</p>
                  <p>Asset ID: Prop #{finalReceipt.property_id}</p>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Category</th>
                    <th>Payment Method</th>
                    <th style={{ textAlign: 'right' }}>Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>{finalReceipt.property_title}</strong>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                        {dealType === 'Rent' ? 'Rental Advance & Security Escrow' : 'Full / Token Property Acquisition Settlement'}
                      </div>
                    </td>
                    <td>{finalReceipt.transaction_type}</td>
                    <td>{finalReceipt.payment_method}</td>
                    <td style={{ textAlign: 'right' }}><strong>₹{Number(finalReceipt.amount).toLocaleString('en-IN')}</strong></td>
                  </tr>
                  <tr>
                    <td>RERA Legal Verification & Title Guarantee</td>
                    <td>Advisory</td>
                    <td>Included</td>
                    <td style={{ textAlign: 'right', color: '#059669' }}>₹0.00 (Complimentary)</td>
                  </tr>
                  <tr>
                    <td>Escrow Account Security Fee</td>
                    <td>Financial</td>
                    <td>Included</td>
                    <td style={{ textAlign: 'right', color: '#059669' }}>₹0.00 (0% Commission)</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'right', fontWeight: '700' }}>TOTAL PAID & SETTLED:</td>
                    <td style={{ textAlign: 'right', fontWeight: '800', fontSize: '1.25rem', color: '#173D32' }}>
                      ₹{Number(finalReceipt.amount).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Stamp & Footer */}
              <div className="invoice-footer-row">
                <div className="invoice-stamp-box">
                  <div className="official-stamp">
                    <span>ESTATEEASE ESCROW</span>
                    <strong>PAID & VERIFIED</strong>
                    <small>{new Date().toISOString().slice(0, 10)}</small>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '4px 0 0' }}>
                    Digitally signed & reconciled with MySQL ledger.
                  </p>
                </div>

                <div className="invoice-signature">
                  <div className="signature-line"></div>
                  <strong>Authorized Escrow Officer</strong>
                  <small>EstateEase Private Banking Treasury</small>
                </div>
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="invoice-bottom-nav no-print">
              <Link to="/dashboard/client" className="btn btn-primary" onClick={onClose}>
                Go to My Client Lounge & Ledger →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
