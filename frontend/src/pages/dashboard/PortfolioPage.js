import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../../utils/api';
import {
  Upload, Image as ImageIcon, Trash2, X, Eye, Pencil,
  ChevronLeft, ChevronRight, Calendar, CheckCircle,
  AlertCircle, ImagePlus, RefreshCw, Info, Camera,
} from 'lucide-react';
import './PortfolioPage.css';

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getLastUploadDate(portfolio) {
  if (!portfolio.length) return '—';
  const sorted = [...portfolio].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );
  return formatDate(sorted[0].created_at);
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [uploading, setUploading]           = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast]                   = useState({ visible: false, type: '', text: '' });

  const [detailModal, setDetailModal]       = useState(null);
  const [lightbox, setLightbox]             = useState(null);
  const [deleteTarget, setDeleteTarget]     = useState(null);
  const [replaceTarget, setReplaceTarget]   = useState(null);

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef    = useRef();
  const replaceInputRef = useRef();

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/portfolio');
      setPortfolio(res.data.portfolio || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPortfolio(); }, [fetchPortfolio]);

  const showToast = (type, text) => {
    setToast({ visible: true, type, text });
    setTimeout(() => setToast({ visible: false, type: '', text: '' }), 4000);
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));
    try {
      await API.post('/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      showToast('success', `${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully.`);
      fetchPortfolio();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleReplace = async (files) => {
    if (!files || files.length === 0 || !replaceTarget) return;
    const formData = new FormData();
    formData.append('image', files[0]);
    try {
      await API.put(`/portfolio/${replaceTarget.id}/replace`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('success', 'Image replaced successfully.');
      fetchPortfolio();
      setDetailModal(null);
      setReplaceTarget(null);
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Replace failed.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/portfolio/${deleteTarget.id}`);
      setPortfolio(prev => prev.filter(p => p.id !== deleteTarget.id));
      showToast('success', 'Image deleted.');
      setDeleteTarget(null);
      setDetailModal(null);
    } catch {
      showToast('error', 'Failed to delete image.');
    }
  };

  const navigateLightbox = (dir) => {
    const idx  = portfolio.findIndex(p => p.id === lightbox.id);
    const next = portfolio[(idx + dir + portfolio.length) % portfolio.length];
    setLightbox(next);
  };

  const stats = {
    total:      portfolio.length,
    lastUpload: getLastUploadDate(portfolio),
  };

  return (
    <div className="portfolio-page">

      {toast.visible && (
        <div className={`pf-toast pf-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="pf-header">
        <div>
          <h1 className="page-title">Portfolio</h1>
          <p className="page-subtitle">Showcase your best work to attract more customers.</p>
          <p className="pf-image-count">
            {portfolio.length} image{portfolio.length !== 1 ? 's' : ''} in your gallery
          </p>
        </div>
        <button
          className="btn btn-primary pf-upload-btn"
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
        >
          <Upload size={15} />
          {uploading ? 'Uploading…' : 'Upload Images'}
        </button>
        <input ref={fileInputRef} type="file" multiple accept="image/*"
          style={{ display: 'none' }} onChange={e => handleUpload(e.target.files)} />
        <input ref={replaceInputRef} type="file" accept="image/*"
          style={{ display: 'none' }} onChange={e => handleReplace(e.target.files)} />
      </div>

      {/* Stats — two data cards + one info card, filling the row evenly */}
      <div className="pf-stats-grid">
        <div className="pf-stat-card">
          <div className="pf-stat-icon pf-stat-icon-brown"><ImageIcon size={18} /></div>
          <div className="pf-stat-text">
            <span className="pf-stat-value">{stats.total}</span>
            <span className="pf-stat-label">Images Uploaded</span>
          </div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-icon pf-stat-icon-green"><Calendar size={18} /></div>
          <div className="pf-stat-text">
            <span className="pf-stat-value pf-stat-value-sm">{stats.lastUpload}</span>
            <span className="pf-stat-label">Last Upload</span>
          </div>
        </div>
        <div className="pf-info-card">
          <Info size={14} className="pf-info-icon" />
          <p>Images uploaded here appear on your public BeautyBook profile page.</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''} ${uploading ? 'dz-uploading' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        onClick={() => !uploading && fileInputRef.current.click()}
      >
        <div className="dz-icon-wrap"><Camera size={28} strokeWidth={1.4} /></div>
        <p className="dz-title">{uploading ? 'Uploading your images…' : 'Drag & drop images here'}</p>
        {uploading ? (
          <div className="dz-progress-wrap">
            <div className="dz-progress-bar">
              <div className="dz-progress-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
            <span className="dz-progress-label">{uploadProgress}%</span>
          </div>
        ) : (
          <>
            <p className="dz-sub">or click to browse your files</p>
            <div className="dz-formats">JPG · PNG · WEBP · up to 5MB each</div>
            <button className="btn btn-outline dz-choose-btn"
              onClick={e => { e.stopPropagation(); fileInputRef.current.click(); }}>
              <ImagePlus size={15} /> Choose Images
            </button>
          </>
        )}
      </div>

      {/* Gallery */}
      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : portfolio.length === 0 ? (
        <div className="pf-empty">
          <div className="pf-empty-icon"><ImageIcon size={32} strokeWidth={1.2} /></div>
          <h3>Your portfolio is empty</h3>
          <p>Upload your best work to showcase it on your public BeautyBook profile.</p>
          <button className="btn btn-primary" onClick={() => fileInputRef.current.click()}>
            <Upload size={15} /> Upload First Image
          </button>
        </div>
      ) : (
        <div className="portfolio-grid">
          {portfolio.map(item => (
            <div key={item.id} className="pf-card" onClick={() => setDetailModal(item)}>
              <div className="pf-card-img-wrap">
                <img src={`${API_URL}${item.image_url}`}
                  alt={item.caption || 'Portfolio'} loading="lazy" />
                <div className="pf-card-overlay">
                  <div className="pf-card-actions">
                    <button className="pf-ov-btn" title="View"
                      onClick={e => { e.stopPropagation(); setLightbox(item); setDetailModal(null); }}>
                      <Eye size={14} />
                    </button>
                    <button className="pf-ov-btn pf-ov-delete" title="Delete"
                      onClick={e => { e.stopPropagation(); setDeleteTarget(item); }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="pf-card-info">
                <div className="pf-card-meta">
                  <span className="pf-card-date">
                    <Calendar size={10} /> {formatDate(item.created_at)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Details modal */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal pf-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Image Details</h2>
              <button className="modal-close" onClick={() => setDetailModal(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="pf-detail-preview">
              <img src={`${API_URL}${detailModal.image_url}`} alt="Portfolio" />
            </div>
            <div className="pf-detail-meta">
              <div className="pf-detail-row">
                <span className="pf-detail-label">Uploaded</span>
                <span className="pf-detail-value">{formatDate(detailModal.created_at)}</span>
              </div>
              {detailModal.caption && (
                <div className="pf-detail-row">
                  <span className="pf-detail-label">Caption</span>
                  <span className="pf-detail-value">{detailModal.caption}</span>
                </div>
              )}
            </div>
            <div className="pf-detail-actions">
              <button className="btn btn-soft pf-detail-btn"
                onClick={() => { setLightbox(detailModal); setDetailModal(null); }}>
                <Eye size={14} /> View Full
              </button>
              <button className="btn btn-soft pf-detail-btn"
                onClick={() => { setReplaceTarget(detailModal); replaceInputRef.current.click(); }}>
                <RefreshCw size={14} /> Replace
              </button>
              <button className="btn btn-danger-soft pf-detail-btn"
                onClick={() => { setDeleteTarget(detailModal); }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
            <button className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              onClick={() => setDetailModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal pf-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Image</h2>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="pf-confirm-thumb">
              <img src={`${API_URL}${deleteTarget.image_url}`} alt="" />
            </div>
            <p className="pf-confirm-msg">
              Are you sure you want to delete this portfolio image? This action cannot be undone.
            </p>
            <div className="modal-footer-btns">
              <button className="btn btn-danger-soft"
                style={{ flex: 1, justifyContent: 'center' }} onClick={handleDelete}>
                <Trash2 size={14} /> Delete
              </button>
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>
              <X size={18} />
            </button>
            <button className="lightbox-nav lightbox-prev" onClick={() => navigateLightbox(-1)}>
              <ChevronLeft size={22} />
            </button>
            <img src={`${API_URL}${lightbox.image_url}`} alt="Portfolio"
              className="lightbox-img" />
            <button className="lightbox-nav lightbox-next" onClick={() => navigateLightbox(1)}>
              <ChevronRight size={22} />
            </button>
            {lightbox.caption && (
              <div className="lightbox-caption">
                <span className="lightbox-title">{lightbox.caption}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
