import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import './ServicesPage.css';

const EMPTY_FORM = { service_name: '', category: '', duration: '', price: '', description: '' };

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await API.get('/services');
      setServices(res.data.services || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setModal('add'); };
  const openEdit = (s) => {
    setForm({ service_name: s.service_name, category: s.category || '', duration: s.duration, price: s.price, description: s.description || '' });
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
        showMsg('success', 'Service added successfully.');
      } else {
        await API.put(`/services/${editTarget.id}`, form);
        showMsg('success', 'Service updated successfully.');
      }
      fetchServices();
      closeModal();
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to save service.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await API.delete(`/services/${id}`);
      showMsg('success', 'Service deleted.');
      fetchServices();
    } catch (err) {
      showMsg('error', 'Failed to delete service.');
    }
  };

  return (
    <div className="services-page">
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'16px'}}>
        <div>
          <h1 className="page-title">Services</h1>
          <p className="page-subtitle">Manage the services you offer to clients</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Add Service</button>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.type === 'success' ? '✅' : '⚠️'} {msg.text}</div>}

      {loading ? (
        <div className="loading-center"><div className="spinner"></div></div>
      ) : services.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">💼</div>
          <h3>No services yet</h3>
          <p>Add your first service to start accepting bookings.</p>
          <button className="btn btn-primary" style={{marginTop:'16px'}} onClick={openAdd}>Add Your First Service</button>
        </div>
      ) : (
        <div className="services-grid">
          {services.map(s => (
            <div key={s.id} className="service-item card">
              <div className="si-header">
                <div className="si-icon">💼</div>
                <div className="si-actions">
                  <button className="btn btn-soft btn-sm" onClick={() => openEdit(s)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>🗑</button>
                </div>
              </div>
              <h3 className="si-name">{s.service_name}</h3>
              {s.category && <span className="si-cat badge badge-beauty">{s.category}</span>}
              {s.description && <p className="si-desc">{s.description}</p>}
              <div className="si-footer">
                <div className="si-price">₦{Number(s.price).toLocaleString()}</div>
                <div className="si-duration">⏱ {s.duration} min</div>
              </div>
            </div>
          ))}
          {/* Add card */}
          <div className="service-item card add-card" onClick={openAdd}>
            <div className="add-card-inner">
              <div className="add-icon">➕</div>
              <p>Add New Service</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'add' ? 'Add New Service' : 'Edit Service'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Service Name *</label>
                <input className="form-input" placeholder="e.g. Bridal Makeup" value={form.service_name}
                  onChange={e => setForm({...form, service_name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" placeholder="e.g. Makeup, Hair, Nails..." value={form.category}
                  onChange={e => setForm({...form, category: e.target.value})} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Duration (minutes) *</label>
                  <input type="number" className="form-input" placeholder="60" min="15" value={form.duration}
                    onChange={e => setForm({...form, duration: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₦) *</label>
                  <input type="number" className="form-input" placeholder="15000" min="0" value={form.price}
                    onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input form-textarea" placeholder="Brief description of this service..." rows={3}
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div style={{display:'flex',gap:'12px'}}>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{flex:1,justifyContent:'center'}}>
                  {submitting ? 'Saving...' : modal === 'add' ? '➕ Add Service' : '✓ Save Changes'}
                </button>
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
