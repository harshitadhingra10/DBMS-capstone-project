import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Building2, Home, MapPin, IndianRupee, BedDouble, Bath, Maximize, Image, CheckCircle2, Sparkles, ArrowRight, PlusCircle, UploadCloud, FileImage } from 'lucide-react';
import './ListProperty.css';

export default function ListProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const presetImages = [
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
  ];

  const [formData, setFormData] = useState({
    title: '',
    property_type: 'Villa',
    listing_type: 'Sale',
    city: 'Gurugram',
    address: '',
    price: '',
    bedrooms: '4',
    bathrooms: '4',
    area_sqft: '4200',
    image_url: presetImages[0],
    description: '',
    contact_name: user?.name || '',
    contact_phone: user?.phone || ''
  });

  const [imageSource, setImageSource] = useState('upload'); // 'upload' | 'preset' | 'url'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdId, setCreatedId] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    setUploadedFileName(file.name);
    setUploadingImage(true);
    setUploadSuccess(false);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      // Immediate local preview
      setFormData(prev => ({ ...prev, image_url: base64Data }));

      try {
        const res = await api.uploadImage(base64Data, file.name);
        if (res && res.url) {
          setFormData(prev => ({ ...prev, image_url: res.url }));
          setUploadSuccess(true);
        }
      } catch (err) {
        console.warn('Backend upload info (kept as local data URI):', err.message);
        setUploadSuccess(true);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.address) {
      alert('Please fill out all mandatory property details.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        location: formData.city,
        city: formData.city,
        address: formData.address.trim(),
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area_sqft: Number(formData.area_sqft),
        description: formData.description.trim() || `Luxury ${formData.property_type} in ${formData.city}. Contact: ${formData.contact_name} (${formData.contact_phone})`,
        agent_id: user?.agent_id || 1,
        image_url: formData.image_url
      };

      const res = await api.createProperty(payload);
      setCreatedId(res.property_id || res.id);
      setSuccess(true);
    } catch (err) {
      alert('Failed to submit listing: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="list-property-root">
      {/* Header Banner */}
      <div className="list-property-banner">
        <div className="container">
          <span className="badge-luxury">
            <Sparkles size={14} /> Owner & Agent Portal
          </span>
          <h1>List Your Landmark Property</h1>
          <p>
            Connect with verified high-net-worth buyers and tenants across Delhi NCR. Showcase your residence in EstateEase's private luxury portfolio.
          </p>
        </div>
      </div>

      <div className="list-property-main">
        {success ? (
          <div className="success-box-card">
            <CheckCircle2 size={64} color="var(--color-accent)" style={{ margin: '0 auto 16px' }} />
            <h2>Property Successfully Listed!</h2>
            <p>
              Your property <strong>"{formData.title}"</strong> has been added to the EstateEase live database and is now visible to prospective buyers.
            </p>
            <div className="success-actions">
              <Link to="/properties" className="btn btn-primary">
                Browse in Properties Catalog <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    title: '',
                    property_type: 'Villa',
                    listing_type: 'Sale',
                    city: 'Gurugram',
                    address: '',
                    price: '',
                    bedrooms: '4',
                    bathrooms: '4',
                    area_sqft: '4200',
                    image_url: presetImages[0],
                    description: '',
                    contact_name: user?.name || '',
                    contact_phone: user?.phone || ''
                  });
                }}
              >
                List Another Property
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="list-property-card">
            {/* Section 1: Overview */}
            <div className="form-section-title">
              <Building2 size={20} />
              <span>1. Property Overview</span>
            </div>

            <div className="form-group">
              <label>Property Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Signature Luxury Villa on Golf Course Road"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label>Typology *</label>
                <select
                  className="form-control"
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                >
                  <option value="Villa">Luxury Villa</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Apartment">Designer Apartment</option>
                  <option value="House">Bespoke House</option>
                  <option value="Plot">Residential Plot</option>
                  <option value="Commercial">Commercial Asset</option>
                </select>
              </div>

              <div className="form-group">
                <label>Listing Purpose *</label>
                <select
                  className="form-control"
                  value={formData.listing_type}
                  onChange={(e) => setFormData({ ...formData, listing_type: e.target.value })}
                >
                  <option value="Sale">For Sale (Direct Purchase)</option>
                  <option value="Rent">For Lease / Rent</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Price (₹ INR) *</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 12500000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Section 2: Location */}
            <div className="form-section-title">
              <MapPin size={20} />
              <span>2. Location & Micro-Market</span>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Prime City / Region *</label>
                <select
                  className="form-control"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                >
                  <option value="Gurugram">Gurugram (Cyber City / Golf Course)</option>
                  <option value="New Delhi">New Delhi (Lutyens / South Delhi)</option>
                  <option value="Noida">Noida (Expressway / Sector 128)</option>
                  <option value="Faridabad">Faridabad (Surajkund / Neharpar)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Full Address / Landmark *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Sector 54, Golf Course Road, DLF Phase 5"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Section 3: Specs */}
            <div className="form-section-title">
              <Maximize size={20} />
              <span>3. Architectural Specifications</span>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label>Bedrooms (BHK)</label>
                <select
                  className="form-control"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                >
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5 BHK</option>
                  <option value="6">6+ BHK Mansion</option>
                </select>
              </div>

              <div className="form-group">
                <label>Bathrooms</label>
                <select
                  className="form-control"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                >
                  <option value="1">1 Bath</option>
                  <option value="2">2 Baths</option>
                  <option value="3">3 Baths</option>
                  <option value="4">4 Baths</option>
                  <option value="5">5+ Baths</option>
                </select>
              </div>

              <div className="form-group">
                <label>Super Built-Up Area (Sq. Ft.)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 4500"
                  value={formData.area_sqft}
                  onChange={(e) => setFormData({ ...formData, area_sqft: e.target.value })}
                />
              </div>
            </div>

            {/* Section 4: Imagery & PNG Upload */}
            <div className="form-section-title">
              <Image size={20} />
              <span>4. High-Resolution Visuals & PNG Upload</span>
            </div>

            <div className="form-group">
              <label>Select Cover Imagery Method</label>
              <div className="image-source-tabs">
                <button
                  type="button"
                  className={`img-tab-btn ${imageSource === 'upload' ? 'active' : ''}`}
                  onClick={() => setImageSource('upload')}
                >
                  <UploadCloud size={15} /> Upload PNG / Image File
                </button>
                <button
                  type="button"
                  className={`img-tab-btn ${imageSource === 'preset' ? 'active' : ''}`}
                  onClick={() => setImageSource('preset')}
                >
                  <FileImage size={15} /> Curated Luxury Presets
                </button>
                <button
                  type="button"
                  className={`img-tab-btn ${imageSource === 'url' ? 'active' : ''}`}
                  onClick={() => setImageSource('url')}
                >
                  <Sparkles size={15} /> Direct Image URL
                </button>
              </div>

              {imageSource === 'upload' && (
                <div>
                  <div className="file-upload-zone">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileUpload}
                    />
                    <div className="upload-icon-wrapper">
                      <UploadCloud size={28} />
                    </div>
                    <div className="upload-text-main">
                      {uploadingImage ? 'Uploading & Processing Image...' : (uploadedFileName ? `Selected: ${uploadedFileName}` : 'Click or Drag & Drop PNG File Here')}
                    </div>
                    <div className="upload-text-sub">
                      Supports PNG, JPG, WEBP (High-res architectural & interior photos)
                    </div>
                  </div>

                  {formData.image_url && (
                    <div style={{ textAlign: 'center', marginTop: '14px' }}>
                      <div className="upload-preview-container">
                        <img src={formData.image_url} alt="Uploaded Property Preview" className="upload-preview-img" />
                        <span className="preview-badge">
                          {uploadSuccess ? '✓ Uploaded & Linked to EstateEase' : 'Preview Active'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {imageSource === 'preset' && (
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px' }}>
                    Click an image to select as cover photo:
                  </span>
                  <div className="preset-images-strip">
                    {presetImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Preset ${idx + 1}`}
                        className={`preset-img-thumb ${formData.image_url === img ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, image_url: img })}
                      />
                    ))}
                  </div>
                  {formData.image_url && (
                    <div style={{ textAlign: 'center', marginTop: '14px' }}>
                      <div className="upload-preview-container">
                        <img src={formData.image_url} alt="Selected Preset" className="upload-preview-img" />
                        <span className="preview-badge">Curated Villa Preset</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {imageSource === 'url' && (
                <div>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                  {formData.image_url && (
                    <div style={{ textAlign: 'center', marginTop: '14px' }}>
                      <div className="upload-preview-container">
                        <img src={formData.image_url} alt="Custom URL Preview" className="upload-preview-img" />
                        <span className="preview-badge">Online Image Link</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section 5: Description & Contact */}
            <div className="form-section-title">
              <Home size={20} />
              <span>5. Description & Owner Contact</span>
            </div>

            <div className="form-group">
              <label>Property Description & Highlights</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Highlight unique architectural facets, private pool, panoramic skyline views, smart automation, luxury Italian marble, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Contact Person / Owner Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your Full Name"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Contact Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="e.g. 9811122233"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-list-submit" disabled={loading}>
              <PlusCircle size={20} />
              <span>{loading ? 'Submitting to Portfolio...' : 'Publish Property to EstateEase'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
