import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../utils/api';
import './VendorsPage.css';
import {
  Search,
  Sparkles,
  Shirt,
  MapPin,
  Clock3,
  CheckCircle,
  SlidersHorizontal,
} from 'lucide-react';

const CATEGORIES = ['All', 'Beauty', 'Fashion'];

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      const res = await API.get('/vendors', { params });
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error(err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVendors();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchVendors]);

  return (
    <div className="vendors-page">
      <Navbar />

      {/* Hero */}
      <section className="vendors-hero">
        <div className="vh-bg">
          <div className="vh-blob vh-blob-1" />
          <div className="vh-blob vh-blob-2" />
        </div>
        <div className="container vh-content">
          <span className="vendors-badge">
            <Sparkles size={13} />
            Beauty &amp; Fashion Professionals
          </span>
          <h1>
            Find Your <em>Perfect Match</em>
          </h1>
          <p>
            Discover talented beauty artists and fashion designers near you.
            Browse, compare, and book in minutes.
          </p>

          <div className="search-bar-wrap">
            <span className="search-icon">
              <Search size={18} />
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, city or service..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="category-filters">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat === 'All' && <SlidersHorizontal size={15} />}
                {cat === 'Beauty' && <Sparkles size={15} />}
                {cat === 'Fashion' && <Shirt size={15} />}
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="vendors-body">
        <div className="container">

          <div className="vendors-section-header">
            <h2>Featured Professionals</h2>
            <p>Browse trusted beauty and fashion experts.</p>
          </div>
          {loading ? (
            <LoadingState />
          ) : vendors.length === 0 ? (
            <EmptyState search={search} category={category} />
          ) : (
            <>
              <div className="results-bar">
                <p className="results-count">
                  <strong>{vendors.length}</strong>{' '}
                  {vendors.length === 1 ? 'professional' : 'professionals'} found
                  {category !== 'All' && ` in ${category}`}
                  {search && ` for "${search}"`}
                </p>
              </div>
              <div className="vendors-grid">
                {vendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function VendorCard({ vendor }) {
  const API_URL =
    process.env.REACT_APP_API_URL?.replace('/api', '') ||
    'http://localhost:5000';

  return (
    <div className="vendor-card">
      <div className="vc-image">
        {vendor.profile_image ? (
          <img
            src={`${API_URL}${vendor.profile_image}`}
            alt={vendor.business_name}
          />
        ) : (
          <div className="vc-placeholder">
            {vendor.category === 'Beauty' ? (
              <Sparkles size={36} strokeWidth={1.2} />
            ) : (
              <Shirt size={36} strokeWidth={1.2} />
            )}
            <span>{vendor.category}</span>
          </div>
        )}
        <span className={`vc-badge vc-badge-${vendor.category.toLowerCase()}`}>
          {vendor.category}
        </span>
      </div>

      <div className="vc-body">
        <h3 className="vc-name">{vendor.business_name}</h3>

        {vendor.description && (
          <p className="vc-desc">{vendor.description}</p>
        )}

        <div className="vc-meta">
          {vendor.city && (
            <div className="vc-meta-item">
              <MapPin size={13} />
              <span>{vendor.city}{vendor.state ? `, ${vendor.state}` : ''}</span>
            </div>
          )}
          {vendor.open_time && (
            <div className="vc-meta-item">
              <Clock3 size={13} />
              <span>
                {vendor.open_time?.substring(0, 5)} –{' '}
                {vendor.close_time?.substring(0, 5)}
              </span>
            </div>
          )}
          {vendor.city && (
            <div className="vc-meta-item">
              <MapPin size={13} />
              <span>
                {vendor.city}
                {vendor.state ? `, ${vendor.state}` : ''}
              </span>
            </div>
          )}
        </div>

        <Link
          to={`/vendors/${vendor.id}`}
          className="vc-cta-btn"
        >
          View &amp; Book
        </Link>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="vendors-loading">
      {[1, 2, 3, 4, 5, 6].map(n => (
        <div key={n} className="skeleton-card">
          <div className="skeleton-image" />
          <div className="skeleton-body">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-text" />
            <div className="skeleton-line skeleton-text short" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ search, category }) {
  return (
    <div className="vendors-empty">
      <div className="ve-icon">
        <Sparkles size={32} strokeWidth={1.2} />
      </div>
      <h3>No professionals found</h3>
      <p>
        {search
          ? `No results for "${search}"${category !== 'All' ? ` in ${category}` : ''}.`
          : `No ${category !== 'All' ? category.toLowerCase() : ''} professionals listed yet.`}
        <br />
        Try adjusting your search or category filter.
      </p>
    </div>
  );
}