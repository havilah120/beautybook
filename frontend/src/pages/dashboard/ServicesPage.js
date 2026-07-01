import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import {
  Briefcase, Plus, Pencil, Trash2, Clock, CheckCircle,
  AlertCircle, X, TrendingUp, Timer,
} from 'lucide-react';
import './ServicesPage.css';

const EMPTY_FORM = {
  service_name: '',
  category: '',
  duration: '',
  price: '',
  description: '',
};

export default function ServicesPage() {
  const [services, setServices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState({ visible: false, type: '', text: '' });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await API.get('/services');
      setServices(res.data.services || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, []);

  const showToast = (type, text) => {
    setToast({ visible: true, type, text });
    setTimeout(() => setToast({ visible: false, type: '', text: '' }), 4000);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setModal('add');
  };

  const openEdit = (s) => {
    setForm({
      service_name: s.service_name,
      category:     s.category || '',
      duration:     s.duration,
      price:        s.price,
      description:  s.description || '',
    });
    setEditTarget(s);
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditTarget(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modal === 'add') {
        await API.post('/services', form);
        showToast('success', 'Service added successfully.');
      } else {
        await API.put(`/services/${editTarget.id}`, form);
        showToast('success', 'Service updated successfully.');
      }
      fetchServices();
      closeModal();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save service.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await API.delete(`/services/${deleteTarget.id}`);
      showToast('success', 'Service deleted.');
      setDeleteTarget(null);
      fetchServices();
    } catch {
      showToast('error', 'Failed to delete service.');
    }
  };

  const stats = {
    total:    services.length,
    minPrice: services.length
      ? Math.min(...services.map(s => Number(s.price)))
      : null,
    avgDuration: services.length
      ? Math.round(services.reduce((sum, s) => sum + Number(s.duration), 0) / services.length)
      : null,
  };

  return (
    <div className="services-page">

      {toast.visible && (
        <div className={`sv-toast sv-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.text}
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Services</h1>
        <p className="page-subtitle">Manage the services you offer to clients</p>
      </div>

      <div className="sv-stats-grid">
        <div className="sv-stat-card">
          <div className="sv-stat-icon sv-stat-icon-brown"><Briefcase size={18} /></div>
          <div className="sv-stat-text">
            <span className="sv-stat-value">{stats.total}</span>
            <span className="sv-stat-label">Total Services</span>
          </div>
        </div>
        <div className="sv-stat-card">
          <div className="sv-stat-icon sv-stat-icon-green"><TrendingUp size={18} /></div>
          <div className="sv-stat-text">
            <span className="sv-stat-value sv-stat-value-sm">
              {stats.minPrice !== null ? `₦${Number(stats.minPrice).toLocaleString()}` : '—'}
            </span>
            <span className="sv-stat-label">Starting Price</span>
          </div>
        </div>
        <div className="sv-stat-card">
          <div className="sv-stat-icon sv-stat-icon-purple"><Timer size={18} /></div>
          <div className="sv-stat-text">
            <span className="sv-stat-value sv-stat-value-sm">
              {stats.avgDuration !== null ? `${stats.avgDuration} min` : '—'}
            </span>
            <span className="sv-stat-label">Avg. Duration</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : services.length === 0 ? (
        <div className="sv-empty">
          <div className="sv-empty-icon"><Briefcase size={30} strokeWidth={1.3} /></div>
          <h3>No services yet</h3>
          <p>Add your first service to start accepting bookings from clients.</p>
          <button className="btn btn-primary sv-empty-btn" onClick={openAdd}>
            <Plus size={15} /> Add Your First Service
          </button>
        </div>
      ) : (
        <div className="services-grid">
          {services.map(s => (
            <div key={s.id} className="service-card">
              <div className="sc-top">
                <div className="sc-icon-wrap">
                  <Briefcase size={20} />
                </div>
                <span className="sc-available">Available</span>
              </div>

              <h3 className="sc-name">{s.service_name}</h3>

              {s.category && (
                <span className="sc-category">{s.category}</span>
              )}

              {s.description && (
                <p className="sc-desc">{s.description}</p>
              )}

              <div className="sc-footer">
                <div className="sc-price">₦{Number(s.price).toLocaleString()}</div>
                <div className="sc-duration">
                  <Clock size={12} />
                  {s.duration} min
                </div>
              </div>

              <div className="sc-actions">
                <button className="btn btn-soft sc-action-btn" onClick={() => openEdit(s)}>
                  <Pencil size={13} /> Edit
                </button>
                <button className="btn btn-danger-soft sc-action-btn"
                  onClick={() => setDeleteTarget(s)}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}

          <div className="service-card add-card" onClick={openAdd}>
            <div className="add-card-inner">
              <div className="add-card-icon"><Plus size={22} /></div>
              <p className="add-card-title">Add New Service</p>
              <p className="add-card-sub">Add pricing, duration and description.</p>
            </div>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modal === 'add' ? 'Add New Service' : 'Edit Service'}
              </h2>
              <button className="modal-close" onClick={closeModal}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Service Name *</label>
                <input className="form-input" placeholder="e.g. Bridal Makeup"
                  value={form.service_name}
                  onChange={e => setForm({ ...form, service_name: e.target.value })}
                  required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" placeholder="e.g. Makeup, Hair, Nails…"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Duration (minutes) *</label>
                  <input type="number" className="form-input" placeholder="60" min="15"
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: e.target.value })}
                    required />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₦) *</label>
                  <input type="number" className="form-input" placeholder="15000" min="0"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input form-textarea"
                  placeholder="Brief description of this service…" rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="modal-footer-btns">
                <button type="submit" className="btn btn-primary"
                  disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
                  <CheckCircle size={14} />
                  {submitting ? 'Saving…' : modal === 'add' ? 'Add Service' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal sv-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Delete Service</h2>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>
                <X size={16} />
              </button>
            </div>
            <p className="sv-confirm-name">{deleteTarget.service_name}</p>
            <p className="sv-confirm-msg">
              Are you sure you want to delete this service? Existing appointments that
              reference this service will not be affected.
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
    </div>
  );
}
