import React, { useState, useEffect, useCallback } from 'react';
import API from '../../utils/api';
import './CustomersPage.css';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [noteMsg, setNoteMsg] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/customers', { params: search ? { search } : {} });
      setCustomers(res.data.customers || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(), 350);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  const handleSelectCustomer = async (customer) => {
    setSelected(customer);
    setDetailLoading(true);
    try {
      const res = await API.get(`/customers/${customer.id}`);
      setSelectedData(res.data);
      setNotes(res.data.customer.notes || '');
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await API.patch(`/customers/${selected.id}/notes`, { notes });
      setNoteMsg('Notes saved!');
      setTimeout(() => setNoteMsg(''), 3000);
    } catch { setNoteMsg('Failed to save notes.'); }
    finally { setSavingNotes(false); }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${dh}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <p className="page-subtitle">{customers.length} total customer{customers.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="customers-layout">
        {/* List */}
        <div className="customers-list-panel card">
          <div className="clp-search">
            <input
              className="form-input"
              placeholder="🔍  Search by name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner"></div></div>
          ) : customers.length === 0 ? (
            <div className="empty-state" style={{padding:'32px 0'}}>
              <div className="empty-state-icon">👥</div>
              <h3>No customers found</h3>
            </div>
          ) : (
            <div className="customers-list">
              {customers.map(c => (
                <div
                  key={c.id}
                  className={`customer-row ${selected?.id === c.id ? 'active' : ''}`}
                  onClick={() => handleSelectCustomer(c)}
                >
                  <div className="cr-avatar">{c.full_name?.charAt(0).toUpperCase()}</div>
                  <div className="cr-info">
                    <div className="cr-name">{c.full_name}</div>
                    <div className="cr-phone">{c.phone}</div>
                  </div>
                  <div className="cr-meta">
                    <div className="cr-visits">{c.total_visits} visit{c.total_visits !== 1 ? 's' : ''}</div>
                    <div className="cr-last">{formatDate(c.last_appointment)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="customer-detail-panel card">
          {!selected ? (
            <div className="empty-state">
              <div className="empty-state-icon">👈</div>
              <h3>Select a customer</h3>
              <p>Click on a customer to view their profile and appointment history.</p>
            </div>
          ) : detailLoading ? (
            <div className="loading-center"><div className="spinner"></div></div>
          ) : selectedData ? (
            <div className="customer-detail">
              <div className="cd-header">
                <div className="cd-avatar">{selectedData.customer.full_name?.charAt(0).toUpperCase()}</div>
                <div className="cd-info">
                  <h2>{selectedData.customer.full_name}</h2>
                  <div className="cd-contact">
                    <span>📞 {selectedData.customer.phone}</span>
                    {selectedData.customer.email && <span>✉️ {selectedData.customer.email}</span>}
                  </div>
                  <div className="cd-stats">
                    <span className="cd-stat">
                      <strong>{selectedData.customer.total_visits}</strong> Total Visits
                    </span>
                    <span className="cd-stat">
                      <strong>{selectedData.appointments.filter(a => a.status === 'completed').length}</strong> Completed
                    </span>
                    <span className="cd-stat">
                      Member since {formatDate(selectedData.customer.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              {/* Appointment history */}
              <h3 className="cd-section-title">Appointment History</h3>
              {selectedData.appointments.length === 0 ? (
                <p style={{color:'var(--gray)',fontSize:'14px'}}>No appointments yet.</p>
              ) : (
                <div className="cd-appts">
                  {selectedData.appointments.map(appt => (
                    <div key={appt.id} className="cd-appt-row">
                      <div className="cd-appt-date">
                        <div className="cad-day">{new Date(appt.appointment_date + 'T00:00:00').getDate()}</div>
                        <div className="cad-month">{new Date(appt.appointment_date + 'T00:00:00').toLocaleString('en', { month: 'short' })}</div>
                      </div>
                      <div className="cd-appt-info">
                        <div className="cai-service">{appt.service_name}</div>
                        <div className="cai-time">{formatTime(appt.appointment_time)}</div>
                      </div>
                      <div className="cd-appt-right">
                        <div className="cai-price">₦{Number(appt.price).toLocaleString()}</div>
                        <span className={`badge badge-${appt.status}`}>{appt.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="divider"></div>

              {/* Notes */}
              <h3 className="cd-section-title">Notes & Preferences</h3>
              <textarea
                className="form-input form-textarea"
                placeholder="Add notes about this customer (preferences, measurements, allergies, etc.)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
              />
              {noteMsg && <p style={{fontSize:'13px',color:'var(--success)',marginTop:'6px'}}>✅ {noteMsg}</p>}
              <button className="btn btn-primary btn-sm" onClick={handleSaveNotes} disabled={savingNotes} style={{marginTop:'10px'}}>
                {savingNotes ? 'Saving...' : '💾 Save Notes'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
