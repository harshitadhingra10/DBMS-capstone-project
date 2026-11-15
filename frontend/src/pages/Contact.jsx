import { useState } from 'react';
import { api } from '../services/api';
import {
  MapPin, Phone, Mail, Clock, Send, CheckCircle2,
  AlertCircle, MessageSquare, ChevronDown, ChevronUp, ShieldCheck
} from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({ type: 'error', text: 'Please fill out all required fields.' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.submitContact(formData);
      setStatus({
        type: 'success',
        text: res.message || 'Thank you! Your message has been received by our advisory board.'
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({
        type: 'error',
        text: err.message || 'Unable to deliver message. Please try again or call our direct hotline.'
      });
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: 'How does EstateEase verify property ownership and legal titles?',
      a: 'All listings are subjected to rigorous scrutiny by our legal associates, verifying mutation records, clear titles, encumbrance certificates from local sub-registrar offices, and official RERA project registrations.'
    },
    {
      q: 'Can I schedule a private inspection outside regular business hours?',
      a: 'Yes, our senior advisors facilitate bespoke private viewings 7 days a week, including weekend twilight tours, with full security clearance.'
    },
    {
      q: 'Does EstateEase assist NRI clients with repatriations and home loans?',
      a: 'Absolutely. We provide dedicated NRI advisory covering FEMA compliance, NRE/NRO account procedures, digital power-of-attorney drafting, and preferential loan approvals.'
    },
    {
      q: 'What is the standard procedure for listing an estate on EstateEase?',
      a: 'Property owners can register as an Agent/Admin or reach out directly to our acquisitions team. We dispatch a certified surveyor for digital documentation before listing.'
    }
  ];

  return (
    <div className="contact-page-root">
      {/* Banner */}
      <section className="contact-hero-banner">
        <div className="container">
          <span className="tagline">CONCIERGE & ADVISORY</span>
          <h1>Connect with EstateEase</h1>
          <p>
            Whether acquiring an iconic residence, leasing prime commercial acreage, or inquiring about portfolio management, our senior team is at your disposal.
          </p>
        </div>
      </section>

      <div className="container contact-main-container">
        <div className="contact-grid">
          {/* Left Form Column */}
          <div className="contact-form-card">
            <div className="form-heading">
              <span className="tagline">TRANSMIT INQUIRY</span>
              <h2>Send an Official Message</h2>
              <p>Your correspondence is treated with strict confidentiality.</p>
            </div>

            {status.text && (
              <div className={`alert alert-${status.type}`}>
                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{status.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Legal Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Vikramaditya Singhania"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Official Email Address *</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Inquiry Subject</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Villa Acquisition / Private Viewing Inquiry"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Message / Specifications *</label>
                <textarea
                  rows="5"
                  className="form-control"
                  placeholder="Please state preferred location, budget expectations, or specific properties of interest..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Message to Advisory Team</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Information & Headquarters Column */}
          <div className="contact-info-col">
            {/* Headquarters Card */}
            <div className="info-card">
              <h3>Corporate Headquarters</h3>
              <p className="hq-tag">DLF Cyber City, North India’s Premier Corporate Enclave</p>

              <div className="info-items-list">
                <div className="info-item">
                  <div className="info-icon"><MapPin size={20} /></div>
                  <div>
                    <strong>Office Address</strong>
                    <span>Level 12, Tower B, Cyber City, DLF Phase 2, Gurugram, Haryana 122002</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon"><Phone size={20} /></div>
                  <div>
                    <strong>Direct Advisory Hotline</strong>
                    <span>+91 (0124) 489-3200 / +91 98765 43210</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon"><Mail size={20} /></div>
                  <div>
                    <strong>Concierge Email</strong>
                    <span>concierge@estateease.com / advisory@estateease.com</span>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon"><Clock size={20} /></div>
                  <div>
                    <strong>Advisory Hours</strong>
                    <span>Monday - Saturday: 09:30 AM – 07:30 PM (IST)</span>
                    <small style={{ color: 'var(--color-accent)', display: 'block', marginTop: '2px' }}>
                      Private viewing escorts available Sundays by appointment.
                    </small>
                  </div>
                </div>
              </div>

              <div className="info-card-badge">
                <ShieldCheck size={18} />
                <span>Govt RERA Registered Firm: HRERA-GGM-2026-0914</span>
              </div>
            </div>

            {/* Regional Support Desks */}
            <div className="regional-desks-card">
              <h4>Regional Client Desks</h4>
              <div className="desks-grid">
                <div className="desk-pill">
                  <strong>Delhi Central</strong>
                  <span>Connaught Place</span>
                </div>
                <div className="desk-pill">
                  <strong>Noida Corridor</strong>
                  <span>Sector 128 Expressway</span>
                </div>
                <div className="desk-pill">
                  <strong>Faridabad</strong>
                  <span>Surajkund Enclave</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="faq-section">
          <div className="section-header">
            <span className="tagline">FREQUENTLY ASKED QUESTIONS</span>
            <h2>Client Inquiries & Clarifications</h2>
            <p>Everything you need to know about navigating luxury property acquisitions with EstateEase.</p>
          </div>

          <div className="faq-accordion">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`faq-item ${activeFaq === i ? 'active' : ''}`}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="faq-question">
                  <h4>{faq.q}</h4>
                  <span className="faq-toggle-icon">
                    {activeFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </div>
                {activeFaq === i && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
