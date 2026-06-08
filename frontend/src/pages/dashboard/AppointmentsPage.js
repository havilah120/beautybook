import React, { useState, useEffect, useCallback } from 'react';
import API from '../../utils/api';
import './AppointmentsPage.css';

const TABS = ['all', 'upcoming', 'completed', 'cancelled'];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const res = await API.get('/appointments/vendor', { params });
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const handleStatusChange = async (id, status) => {
    if (!window.confirm(`Mark this appointment as ${status}?`)) return;
    setActionLoading(true);
    try {
      await API.patch(`/appointments/vendor/${id}`, { status });
      fetchAppointments();
      showMsg('success', `Appointment marked as ${status}.`);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to update appointment.');
    } finally { setActionLoading(false); }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) return;
    setActionLoading(true);
    try {
      await API.patch(`/appointments/vendor/${rescheduleModal.id}`, {
        status: 'upcoming',
        appointment_date: newDate,
        appointment_time: newTime,
      });
      setRescheduleModal(null);
      fetchAppointments();
      showMsg('success', 'Appointment rescheduled successfully.');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to reschedule.');
    } finally { setActionLoading(false); }
  };

  const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${dh}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const today = new Date().toISOString().split('T')[0];
  const TIME_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];

  return (
    <div className="appts-page">
      <div className="page-header">
        <h1 className="page-title">Appointments</h1>
        <p className="page-subtitle">Manage all your client appointments</p>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.type === 'success' ? '✅' : '⚠️'} {msg.text}</div>}

      <div className="tabs-bar">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && <span className="tab-count">{appointments.length}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner"></div><p>Loading appointments...</p></div>
      ) : appointments.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No {activeTab !== 'all' ? activeTab : ''} appointments</h3>
          <p>Appointments will appear here once clients make bookings.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => (
                <tr key={appt.id}>
                  <td>
                    <div className="appt-customer">
                      <div className="ac-avatar">{appt.full_name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="ac-name">{appt.full_name}</div>
                        <div className="ac-phone">{appt.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="appt-service">{appt.service_name}</div>
                    <div className="appt-price">₦{Number(appt.price).toLocaleString()}</div>
                  </td>
                  <td>
                    <div className="appt-date">{formatDate(appt.appointment_date)}</div>
                    <div className="appt-time">⏰ {formatTime(appt.appointment_time)}</div>
                  </td>
                  <td>
                    <span className={`badge badge-${appt.status}`}>
                      {appt.status === 'upcoming' ? '🔵' : appt.status === 'completed' ? '✅' : '❌'} {appt.status}
                    </span>
                  </td>
                  <td>
                    <div className="appt-notes-cell">{appt.notes || '—'}</div>
                  </td>
                  <td>
                    <div className="appt-action-btns">
                      {appt.status === 'upcoming' && (
                        <>
                          <button
                            className="btn btn-soft btn-sm"
                            onClick={() => { setRescheduleModal(appt); setNewDate(''); setNewTime(''); }}
                            title="Reschedule"
                          >📅</button>
                          <button
                            className="btn btn-sm"
                            style={{background:'#EDFAF3',color:'var(--success)'}}
                            onClick={() => handleStatusChange(appt.id, 'completed')}
                            disabled={actionLoading}
                            title="Mark completed"
                          >✓</button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleStatusChange(appt.id, 'cancelled')}
                            disabled={actionLoading}
                            title="Cancel"
                          >✕</button>
                        </>
                      )}
                      {appt.status === 'cancelled' && (
                        <button
                          className="btn btn-soft btn-sm"
                          onClick={() => handleStatusChange(appt.id, 'upcoming')}
                          disabled={actionLoading}
                        >Restore</button>
                      )}
                      {appt.status === 'completed' && (
                        <span style={{fontSize:'13px',color:'var(--gray)'}}>Done</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="modal-overlay" onClick={() => setRescheduleModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Reschedule Appointment</h2>
              <button className="modal-close" onClick={() => setRescheduleModal(null)}>✕</button>
            </div>
            <p style={{marginBottom:'8px',fontSize:'14px',color:'var(--gray)'}}>
              <strong>{rescheduleModal.full_name}</strong> — {rescheduleModal.service_name}
            </p>
            <p style={{marginBottom:'20px',fontSize:'13px',color:'var(--gray)'}}>
              Current: {formatDate(rescheduleModal.appointment_date)} at {formatTime(rescheduleModal.appointment_time)}
            </p>
            <form onSubmit={handleReschedule}>
              <div className="form-group">
                <label className="form-label">New Date *</label>
                <input type="date" className="form-input" min={today} value={newDate} onChange={e => setNewDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Time *</label>
                <select className="form-input form-select" value={newTime} onChange={e => setNewTime(e.target.value)} required>
                  <option value="">Select time</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{display:'flex',gap:'12px'}}>
                <button type="submit" className="btn btn-primary" disabled={actionLoading} style={{flex:1,justifyContent:'center'}}>
                  {actionLoading ? 'Saving...' : '✓ Confirm'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setRescheduleModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
