import { ShieldCheck, Award, TrendingUp, Gem, Landmark, Building2, CheckCircle2 } from 'lucide-react';
import './About.css';

export default function About() {
  const leadership = [
    {
      name: 'Harshita Dhingra',
      role: 'Principal Acquisitions Partner & Founder',
      monogram: 'HD',
      tag: 'Executive Council',
      bio: 'Leading strategic luxury real estate acquisitions, bespoke client representation, and high-value transactions across Delhi NCR.'
    },
    {
      name: 'Priyam Sharma',
      role: 'Head of Portfolio Advisory & Capital Markets',
      monogram: 'PS',
      tag: 'Executive Council',
      bio: 'Directing institutional investments, commercial portfolio expansions, and premium residential asset management with deep market insight.'
    },
    {
      name: 'Sandeep Dhingra',
      role: 'Managing Director & Strategic Founder',
      monogram: 'SD',
      tag: 'Advisory Council',
      bio: 'Overseeing corporate governance, architectural due diligence, and institutional real estate operations across North India.'
    }
  ];

  const highlights = [
    {
      icon: <ShieldCheck size={24} />,
      title: 'Institutional Title Scrutiny',
      desc: 'Every listed property undergoes strict multi-tier legal audits, municipal clearances, and RERA compliance verification.'
    },
    {
      icon: <Award size={24} />,
      title: 'Bespoke Private Advisory',
      desc: 'Discreet consultation tailored to high-net-worth individuals, diplomatic delegations, and private capital institutions.'
    },
    {
      icon: <Landmark size={24} />,
      title: 'Landmark Micro-Markets',
      desc: 'Exclusive access to off-market inventory in Golf Course Road, Lutyens Bungalow Zone, Jaypee Greens, and Surajkund.'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Capital Value Growth',
      desc: 'Market intelligence and valuation research that safeguard capital and maximize rental yields for long-term stewardship.'
    }
  ];

  return (
    <div className="about-page-root">
      {/* Hero Banner */}
      <section className="about-hero-banner">
        <div className="container">
          <span className="badge-luxury" style={{ marginBottom: '16px' }}>
            <Gem size={14} /> Institutional Excellence
          </span>
          <h1>Defining the Standard in High-Value Real Estate</h1>
          <p>
            EstateEase is North India’s premier luxury property advisory, stewarding landmark investments across Gurugram, New Delhi, Noida, and Faridabad.
          </p>
        </div>
      </section>

      {/* Story & Legacy Section */}
      <section className="about-story-section">
        <div className="container">
          <div className="story-text-container">
            <span className="badge-luxury" style={{ marginBottom: '14px' }}>Our Heritage & Distinction</span>
            <h2>Curating Private Estates for Discerning Patrons</h2>
            <p className="lead-paragraph">
              Founded with an uncompromising commitment to architectural integrity, transparency, and discretion, EstateEase has grown into Delhi NCR's most prestigious realty advisory.
            </p>
            <p className="story-paragraph">
              Whether acquiring a private penthouse on Golf Course Road, an expansive farm estate in Chanakyapuri, or prime commercial assets in Cyber Hub, our clients rely on our rigorous legal diligence and confidential market access.
            </p>

            {/* Stats Strip */}
            <div className="stats-strip">
              <div className="stat-col">
                <strong>₹850 Cr+</strong>
                <span>Portfolio Transacted</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-col">
                <strong>100%</strong>
                <span>Title Verified</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-col">
                <strong>15+ Yrs</strong>
                <span>Advisory Mastery</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-col">
                <strong>450+</strong>
                <span>VIP Patrons</span>
              </div>
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="about-highlights-grid">
            {highlights.map((h, i) => (
              <div key={i} className="about-highlight-box">
                <div className="highlight-icon-box">{h.icon}</div>
                <div>
                  <h4>{h.title}</h4>
                  <p>{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision-section">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mv-card">
              <div className="mv-icon-box">
                <Building2 size={28} />
              </div>
              <h3>Our Mission</h3>
              <p>
                To elevate luxury real estate transactions into transparent, secure, and dignified experiences, delivering verified properties and unparalleled advisory to every homeowner and institutional investor.
              </p>
            </div>

            <div className="mv-card">
              <div className="mv-icon-box">
                <Gem size={28} />
              </div>
              <h3>Our Vision</h3>
              <p>
                To be recognised globally as India's most trusted luxury property stewardship firm, pioneering sustainable architectural development, digital transparency, and institutional excellence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="why-choose-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="badge-luxury" style={{ marginBottom: '12px' }}>The EstateEase Edge</span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>Why Patrons Choose Us</h2>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-number">01</div>
              <h4>Direct Developer Linkages</h4>
              <p>Direct pre-launch access and pricing parity with India’s foremost luxury developers.</p>
            </div>
            <div className="why-card">
              <div className="why-number">02</div>
              <h4>Strict Due Diligence</h4>
              <p>Zero encumbrances. Complete RERA, fire, municipal, and title registry validation.</p>
            </div>
            <div className="why-card">
              <div className="why-number">03</div>
              <h4>Private VIP Viewings</h4>
              <p>Chauffeured, confidential property viewings scheduled on your personal timeline.</p>
            </div>
            <div className="why-card">
              <div className="why-number">04</div>
              <h4>Post-Purchase Concierge</h4>
              <p>Turnkey interior consultancy, property management, and tenant leasing services.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Council Section (No Photos, Pure Luxury Monograms) */}
      <section className="team-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="badge-luxury" style={{ marginBottom: '12px' }}>Corporate Governance</span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>Our Leadership Council</h2>
          </div>

          <div className="team-grid">
            {leadership.map((leader, i) => (
              <div key={i} className="team-card">
                <div className="team-card-top">
                  <div className="team-avatar-monogram">{leader.monogram}</div>
                  <span className="team-role-pill">{leader.tag}</span>
                </div>
                <div className="team-info">
                  <h3 className="team-member-name">{leader.name}</h3>
                  <span className="team-member-role">{leader.role}</span>
                  <p className="team-member-bio">{leader.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}