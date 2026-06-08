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
  BriefcaseBusiness,
  Images,
  Info,
  Calendar,
  Sparkles,
  Shirt
} from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

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

  if (loading) return (
    <div className="page-loading">
      <Navbar />
      <div className="loading-center" style={{minHeight:'60vh'}}>
        <div className="spinner"></div>
        <p>Loading vendor profile...</p>
      </div>
    </div>
  );

  if (!vendor) return (
    <div>
      <Navbar />
      <div className="container" style={{padding:'120px 24px'}}>
        <div className="empty-state">
          <div className="empty-state-icon">
            <Info size={36} />
          </div>
          <Link to="/vendors" className="btn btn-primary" style={{marginTop:'16px'}}>Browse Vendors</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="vendor-detail-page">
      <Navbar />

      <div className="vd-hero">
        <div className="vd-banner">
          {vendor.banner_image ? (
            <img src={`${API_URL}${vendor.banner_image}`} alt="banner" />
          ) : (
            <div className="vd-banner-placeholder"></div>
          )}
        </div>
        <div className="container vd-hero-content">
          <div className="vd-profile-img">
            {vendor.profile_image ? (
              <img src={`${API_URL}${vendor.profile_image}`} alt={vendor.business_name} />
            ) : (
              <div className="vd-profile-placeholder">
                {vendor.category === 'Beauty' ? (
                  <Sparkles size={48} />
                ) : (
                  <Shirt size={48} />
                )}
              </div>
            )}
          </div>
          <div className="vd-info">
            <div className="vd-info-top">
              <div>
                <h1>{vendor.business_name}</h1>
                <span className={`badge badge-${vendor.category.toLowerCase()}`}>{vendor.category}</span>
              </div>
              <Link to={`/book/${vendor.id}`} className="btn btn-primary btn-lg">
                <>
                  <Calendar size={18} />
                  Book Appointment
                </>
              </Link>
            </div>
            {vendor.description && <p className="vd-desc">{vendor.description}</p>}
            <div className="vd-meta-row">
              {vendor.city && (
                <span>
                  <MapPin size={14} />
                  {vendor.city}{vendor.state ? `, ${vendor.state}` : ''}
                </span>
              )}
              {vendor.open_time && (
                <span>
                  <Clock3 size={14} />
                  {vendor.open_time?.substring(0,5)} – {vendor.close_time?.substring(0,5)}
                </span>
              )}
              {vendor.working_days && (
                <span>
                  <CalendarDays size={14} />
                  {vendor.working_days}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container vd-body">
        <div className="vd-tabs">
          {['services', 'portfolio', 'info'].map(tab => (
            <button
              key={tab}
              className={`vd-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'services' ? <>
                  <BriefcaseBusiness size={16} />
                  Services
                </> : tab === 'portfolio' ? <>
                    <Images size={16} />
                    Portfolio
                  </> : <>
                          <Info size={16} />
                          Info
                        </>}
            </button>
          ))}
        </div>

        {activeTab === 'services' && (
          <div className="vd-services">
            {services.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <BriefcaseBusiness size={36} />
                </div>
                <h3>No services listed yet</h3>
              </div>
            ) : (
              <div className="services-grid">
                {services.map(service => (
                  <div key={service.id} className="service-card card">
                    <div className="sc-header">
                      <h3>{service.service_name}</h3>
                      {service.category && <span className="sc-cat">{service.category}</span>}
                    </div>
                    {service.description && <p>{service.description}</p>}
                    <div className="sc-footer">
                      <span className="sc-price">₦{Number(service.price).toLocaleString()}</span>
                      <span className="sc-duration">
                        <Clock3 size={13} />
                        {service.duration} min
                      </span>
                    </div>
                    <Link to={`/book/${vendor.id}?service=${service.id}`} className="btn btn-soft btn-sm" style={{marginTop:'12px',width:'100%',justifyContent:'center'}}>
                      Book This Service
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="vd-portfolio">
            {portfolio.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Images size={36} />
                </div>
                <h3>No portfolio images yet</h3>
              </div>
            ) : (
              <>
                <div className="portfolio-grid">
                  {portfolio.map((item, index) => (
                    <div
                      key={item.id}
                      className="portfolio-item"
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={`${API_URL}${item.image_url}`}
                        alt={item.caption || 'Portfolio'}
                      />

                      {item.caption && (
                        <div className="portfolio-caption">
                          {item.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedImage !== null && (
                  <div className="lightbox">
                    <button
                      className="lightbox-nav"
                      onClick={() =>
                        setSelectedImage(
                          selectedImage === 0
                            ? portfolio.length - 1
                            : selectedImage - 1
                        )
                      }
                    >
                      ←
                    </button>

                    <img
                      className="lightbox-image"
                      src={`${API_URL}${portfolio[selectedImage].image_url}`}
                      alt="Portfolio"
                    />

                    <button
                      className="lightbox-nav"
                      onClick={() =>
                        setSelectedImage(
                          selectedImage === portfolio.length - 1
                            ? 0
                            : selectedImage + 1
                        )
                      }
                    >
                      →
                    </button>

                    <button
                      className="close-btn"
                      onClick={() => setSelectedImage(null)}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="vd-info-tab">
            <div className="info-grid">
              <div className="info-card card">
                <h3>
                  <MapPin size={18} />
                  Location
                </h3>
                <p>{[vendor.address, vendor.city, vendor.state].filter(Boolean).join(', ') || 'Not specified'}</p>
              </div>
              <div className="info-card card">
                <h3>
                  <Clock3 size={18} />
                  Working Hours
                </h3>
                <p>{vendor.open_time ? `${vendor.open_time?.substring(0,5)} – ${vendor.close_time?.substring(0,5)}` : 'Not specified'}</p>
                {vendor.working_days && <p style={{fontSize:'13px',color:'var(--gray)',marginTop:'8px'}}>{vendor.working_days}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
