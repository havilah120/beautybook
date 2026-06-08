import React, { useState, useEffect, useRef } from 'react';
import API from '../../utils/api';
import './PortfolioPage.css';

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await API.get('/portfolio');
      setPortfolio(res.data.portfolio || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('images', f));
    try {
      await API.post('/portfolio', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      showMsg('success', `${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully.`);
      fetchPortfolio();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Upload failed.');
    } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this portfolio image?')) return;
    try {
      await API.delete(`/portfolio/${id}`);
      setPortfolio(prev => prev.filter(p => p.id !== id));
      showMsg('success', 'Image deleted.');
    } catch { showMsg('error', 'Failed to delete image.'); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleUpload(files);
  };

  return (
    <div className="portfolio-page">
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'16px'}}>
        <div>
          <h1 className="page-title">Portfolio</h1>
          <p className="page-subtitle">{portfolio.length} image{portfolio.length !== 1 ? 's' : ''} in your gallery</p>
        </div>
        <button className="btn btn-primary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
          {uploading ? '⏳ Uploading...' : '📸 Upload Images'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          style={{display:'none'}}
          onChange={e => handleUpload(e.target.files)}
        />
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.type === 'success' ? '✅' : '⚠️'} {msg.text}</div>}

      {/* Drop zone */}
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <div className="dz-icon">📸</div>
        <p className="dz-title">Drag & drop images here</p>
        <p className="dz-sub">or click to browse — JPG, PNG, WEBP up to 5MB each</p>
        {uploading && <div className="spinner" style={{marginTop:'12px'}}></div>}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : portfolio.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🖼</div>
          <h3>No portfolio images yet</h3>
          <p>Upload your best work to showcase it on your public profile.</p>
        </div>
      ) : (
        <div className="portfolio-grid-dash">
          {portfolio.map(item => (
            <div key={item.id} className="portfolio-item-dash">
              <img src={`${API_URL}${item.image_url}`} alt={item.caption || 'Portfolio'} />
              <div className="pi-overlay">
                {item.caption && <p className="pi-caption">{item.caption}</p>}
                <button
                  className="pi-delete-btn"
                  onClick={() => handleDelete(item.id)}
                  title="Delete image"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
