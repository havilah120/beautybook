import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../utils/api';
import './VendorDetailPage.css';
import {
  MapPin,
  Clock3,
  CalendarDays,
  Briefcase,
  Images,
  Info,
  Calendar,
  Sparkles,
  Shirt,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
} from 'lucide-react';

const API_URL =
  process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function VendorDetailPage() {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/vendors/${id}`);
        setVendor(res.data.vendor);
        setServices(res.data.services);
        setPortfolio(res.data.portfolio);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="vdp-loading">
        <Navbar />
        <div className="vdp-loading-inner">
          <div className="spinner" />
          <p>Loading profile…</p>
        </div>
      </div>
    );

  if (!vendor)
    return (
      <div>
        <Navbar />
        <div className="container vdp-not-found">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Info size={32} />
            </div>
            <h3>Vendor not found</h3>
            <Link
              to="/vendors"
              className="btn btn-primary"
              style={{ marginTop: '20px' }}
            >
              Browse Vendors
            </Link>
          </div>
        </div>
      </div>
    );

  const TABS = [
    {
      key: 'services',
      label: 'Services',
      icon: <Briefcase size={15} />,
      count: services.length,
    },
    {
      key: 'portfolio',
      label: 'Portfolio',
      icon: <Images size={15} />,
      count: portfolio.length,
    },
    { key: 'info', label: 'Info', icon: <Info size={15} />, count: null },
  ];

  return (
    <div className="vendor-detail-page">
      <Navbar />

      {/* ── Banner ── */}
      <div className="vd-banner-wrap">
        {vendor.banner_image ? (
          <img
            className="vd-banner-img"
            src={`${API_URL}${vendor.banner_image}`}
            alt="Cover"
          />
        ) : (
          <div className="vd-banner-placeholder">
            <div className="vd-banner-pattern" />
          </div>
        )}
        <div className="vd-banner-scrim" />
        <div className="container vd-banner-bar">
          <Link to="/vendors" className="vd-back-btn">
            <ArrowLeft size={15} />
            Back to Vendors
          </Link>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="vd-header-wrap">
        <div className="container vd-header">
          <div className="vd-profile-img">
            {vendor.profile_image ? (
              <img
                src={`${API_URL}${vendor.profile_image}`}
                alt={vendor.business_name}
              />
            ) : (
              <div className="vd-profile-placeholder">
                {vendor.category === 'Beauty' ? (
                  <Sparkles size={28} strokeWidth={1.4} />
                ) : (
                  <Shirt size={28} strokeWidth={1.4} />
                )}
              </div>
            )}
          </div>

          <div className="vd-header-info">
            <div className="vd-header-row">
              <div className="vd-title-block">
                <span
                  className={`vd-cat-badge vd-cat-${vendor.category.toLowerCase()}`}
                >
                  {vendor.category}
                </span>
                <h1 className="vd-name">{vendor.business_name}</h1>
                {vendor.description && (
                  <p className="vd-desc">{vendor.description}</p>
                )}
              </div>

              <Link
                to={`/book/${vendor.id}`}
                className="btn btn-primary vd-book-btn"
              >
                <Calendar size={16} />
                Book Appointment
              </Link>
            </div>

            {(vendor.city || vendor.open_time || vendor.working_days) && (
              <div className="vd-meta-row">
                {vendor.city && (
                  <span className="vd-meta-chip">
                    <MapPin size={13} />
                    {vendor.city}
                    {vendor.state ? `, ${vendor.state}` : ''}
                  </span>
                )}
                {vendor.open_time && (
                  <span className="vd-meta-chip">
                    <Clock3 size={13} />
                    {vendor.open_time?.substring(0, 5)} –{' '}
                    {vendor.close_time?.substring(0, 5)}
                  </span>
                )}
                {vendor.working_days && (
                  <span className="vd-meta-chip">
                    <CalendarDays size={13} />
                    {vendor.working_days}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="vd-tabs-bar">
        <div className="container">
          <div className="vd-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`vd-tab ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                {tab.label}
                {tab.count > 0 && (
                  <span className="vd-tab-pill">{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="vd-content">
        <div className="container">

          {/* Services */}
          {activeTab === 'services' && (
            <div className="vd-tab-panel">
              {services.length === 0 ? (
                <EmptyState icon={<Briefcase size={28} strokeWidth={1.4} />} title="No services listed yet" sub="This vendor hasn't added any services yet." />
              ) : (
                <div className="vd-services-grid">
                  {services.map((service) => (
                    <div key={service.id} className="vd-service-card">
                      <div className="vsc-head">
                        <h3 className="vsc-name">{service.service_name}</h3>
                        {service.category && (
                          <span className="vsc-cat">{service.category}</span>
                        )}
                      </div>
                      {service.description && (
                        <p className="vsc-desc">{service.description}</p>
                      )}
                      <div className="vsc-foot">
                        <div className="vsc-pricing">
                          <span className="vsc-price">
                            ₦{Number(service.price).toLocaleString()}
                          </span>
                          <span className="vsc-dur">
                            <Clock3 size={12} />
                            {service.duration} min
                          </span>
                        </div>
                        <Link
                          to={`/book/${vendor.id}?service=${service.id}`}
                          className="vsc-btn"
                        >
                          Book
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Portfolio */}
          {activeTab === 'portfolio' && (
            <div className="vd-tab-panel">
              {portfolio.length === 0 ? (
                <EmptyState icon={<Images size={28} strokeWidth={1.4} />} title="No portfolio images yet" sub="This vendor hasn't uploaded any work yet." />
              ) : (
                <div className="vd-portfolio-grid">
                  {portfolio.map((item, index) => (
                    <div
                      key={item.id}
                      className="vd-port-item"
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={`${API_URL}${item.image_url}`}
                        alt={item.caption || 'Portfolio'}
                      />
                      <div className="vd-port-hover">
                        <Images size={18} />
                      </div>
                      {item.caption && (
                        <div className="vd-port-caption">{item.caption}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedImage !== null && (
                <div
                  className="vd-lightbox"
                  onClick={() => setSelectedImage(null)}
                >
                  <div
                    className="vd-lb-shell"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="vd-lb-nav"
                      onClick={() =>
                        setSelectedImage(
                          selectedImage === 0
                            ? portfolio.length - 1
                            : selectedImage - 1
                        )
                      }
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <img
                      className="vd-lb-img"
                      src={`${API_URL}${portfolio[selectedImage].image_url}`}
                      alt="Portfolio"
                    />

                    <button
                      className="vd-lb-nav"
                      onClick={() =>
                        setSelectedImage(
                          selectedImage === portfolio.length - 1
                            ? 0
                            : selectedImage + 1
                        )
                      }
                    >
                      <ChevronRight size={20} />
                    </button>

                    <button
                      className="vd-lb-close"
                      onClick={() => setSelectedImage(null)}
                    >
                      <X size={16} />
                    </button>

                    <div className="vd-lb-counter">
                      {selectedImage + 1} / {portfolio.length}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          {activeTab === 'info' && (
            <div className="vd-tab-panel">
              <div className="vd-info-grid">
                <InfoCard icon={<MapPin size={17} />} label="Location">
                  {[vendor.address, vendor.city, vendor.state]
                    .filter(Boolean)
                    .join(', ') || 'Not specified'}
                </InfoCard>

                <InfoCard icon={<Clock3 size={17} />} label="Working Hours">
                  {vendor.open_time
                    ? `${vendor.open_time?.substring(0, 5)} – ${vendor.close_time?.substring(0, 5)}`
                    : 'Not specified'}
                  {vendor.working_days && (
                    <span className="ic-sub">{vendor.working_days}</span>
                  )}
                </InfoCard>

                <InfoCard icon={<Briefcase size={17} />} label="Category">
                  {vendor.category}
                </InfoCard>

                <InfoCard
                  icon={<CalendarDays size={17} />}
                  label="Services Available"
                >
                  {services.length > 0
                    ? `${services.length} service${services.length !== 1 ? 's' : ''}`
                    : 'None listed yet'}
                </InfoCard>
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="vd-bottom-cta">
            <div className="vd-cta-copy">
              <h3>Ready to book with {vendor.business_name}?</h3>
              <p>Choose a service and pick your preferred time.</p>
            </div>
            <Link to={`/book/${vendor.id}`} className="btn btn-primary btn-lg">
              <Calendar size={16} />
              Book an Appointment
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ── Small reusable sub-components ── */
function EmptyState({ icon, title, sub }) {
  return (
    <div className="vd-empty">
      <div className="vd-empty-icon">{icon}</div>
      <h3>{title}</h3>
      {sub && <p>{sub}</p>}
    </div>
  );
}

function InfoCard({ icon, label, children }) {
  return (
    <div className="vd-info-card">
      <div className="ic-icon">{icon}</div>
      <div className="ic-body">
        <span className="ic-label">{label}</span>
        <div className="ic-value">{children}</div>
      </div>
    </div>
  );
}