import { ShieldCheck, Award, TrendingUp, Gem, Landmark, Building2, CheckCircle2 } from 'lucide-react';
import './About.css';

export default function About() {
  const leadership = [
    { name: 'Nishtha Sharma', role: 'Managing Director & Founder', monogram: 'NS', focus: 'Prime Real Estate Portfolio & Client Advisory' },
    { name: 'Muskan Verma', role: 'Chief Executive Officer', monogram: 'MV', focus: 'Strategic Expansion & Commercial Investments' },
    { name: 'Harshita Gupta', role: 'Head of Architectural Advisory', monogram: 'HG', focus: 'Luxury Developments & Legal Compliance' }
  ];

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-tagline"><Gem size={14} /> Institutional Excellence</span>
          <h1>Defining the Standard in High-Value Real Estate</h1>
          <p>EstateEase is North India’s premier luxury property advisory, stewarding landmark investments across Gurugram, New Delhi, Noida, and Faridabad.</p>
        </div>
      </section>

      {/* Leadership Section without photos */}
      <section className="about-section bg-cream">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Corporate Governance</span>
            <h2>Our Leadership Council</h2>
            <div className="gold-divider"></div>
          </div>
          <div className="leadership-cards">
            {leadership.map((leader, i) => (
              <div key={i} className="leadership-card">
                <div className="leader-monogram">{leader.monogram}</div>
                <h3>{leader.name}</h3>
                <span className="leader-role">{leader.role}</span>
                <p className="leader-focus">{leader.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}