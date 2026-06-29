import React, { useState, useEffect, useCallback } from 'react';
import API from '../../utils/api';
import {
  Calendar, Clock, Phone, User, X, CheckCircle,
  CalendarClock, XCircle, FileText, AlertCircle, StickyNote,
} from 'lucide-react';
import './AppointmentsPage.css';

const TABS = ['all', 'upcoming', 'completed', 'cancelled'];

function formatDate(d) {
  if (!d) return 'Date unavailable';
  const dateStr = d.includes('T') ? d : d + 'T00:00:00';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function formatTime(t) {
  if (!t) return '';
  const parts = t.split(':');
  if (parts.length < 2) return '';
  const hour = parseInt(parts[0]);
  const min  = parts[1];
  if (isNaN(hour)) return '';
  const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${dh}:${min} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function getInitial(name) {
  if (!name || !name.trim()) return '?';
  return name.trim()[0].toUpperCase();
}

function normaliseNote(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'nil' || trimmed.toLowerCase() === 'null') return null;
  return trimmed;
}

const TODAY = new Date().toISOString().split('T')[0];

const TIME_SLOTS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30',
  '16:00','16:30','17:00','17:30','18:00',
];

export default function AppointmentsPage() {
  const [allAppointments, setAllAppointments] = useState([]);
  const [appointments, setAppointments]       = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [activeTab, setActiveTab]             = useState('all');

  const [detailModal, setDetailModal]         = useState(null);
  const [customerPrefs, setCustomerPrefs]     = useState(null);
  const [prefsLoading, setPrefsLoading]       = useState(false);
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [noteModal, setNoteModal]             = useState(null);
  const [confirmModal, setConfirmModal]       = useState(null);

  const [newDate, setNewDate]             = useState('');
  const [newTime, setNewTime]             = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg]                     = useState({ type: '', text: '' });

  const fetchAll = useCallback(async () => {
    try {
      const res = await API.get('/appointments/vendor', { params: {} });
      setAllAppointments(res.data.appointments || []);
    } catch (err) { console.error(err); }
  }, []);

  const fetchFiltered = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const res = await API.get('/appointments/vendor', { params });
      setAppointments(res.data.appointments || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { fetchFiltered(); }, [fetchFiltered]);

  const refetchBoth = () => { fetchAll(); fetchFiltered(); };

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const confirmThen = (message, onConfirm) => {
    setConfirmModal({ message, onConfirm });
  };

  const openDetail = async (appt) => {
    setDetailModal(appt);
    setCustomerPrefs(null);
    if (appt.customer_id) {
      setPrefsLoading(true);
      try {
        const res = await API.get(`/customers/${appt.customer_id}`);
        const raw = res.data?.customer?.notes;
        setCustomerPrefs(normaliseNote(raw));
      } catch {
        setCustomerPrefs(null);
      } finally { setPrefsLoading(false); }
    }
  };

  const handleStatusChange = async (id, status) => {
    setActionLoading(true);
    try {
      await API.patch(`/appointments/vendor/${id}`, { status });
      setDetailModal(null);
      setConfirmModal(null);
      refetchBoth();
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
      setDetailModal(null);
      refetchBoth();
      showMsg('success', 'Appointment rescheduled successfully.');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to reschedule.');
    } finally { setActionLoading(false); }
  };

  const counts = {
    all:       allAppointments.length,
    upcoming:  allAppointments.filter(a => a.status === 'upcoming').length,
    completed: allAppointments.filter(a => a.status === 'completed').length,
    cancelled: allAppointments.filter(a => a.status === 'cancelled').length,
  };

  const SUMMARY_CARDS = [
    { key: 'all',       label: 'All Appointments', color: 'brown',  icon: <Calendar size={20} /> },
    { key: 'upcoming',  label: 'Upcoming',          color: 'indigo', icon: <CalendarClock size={20} /> },
    { key: 'completed', label: 'Completed',          color: 'green',  icon: <CheckCircle size={20} /> },
    { key: 'cancelled', label: 'Cancelled',          color: 'red',    icon: <XCircle size={20} /> },
  ];

  return (
    <div className="appts-page">
      <div className="page-header">
        <h1 className="page-title">Appointments</h1>
        <p className="page-subtitle">Manage all your client appointments</p>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`}>
          {msg.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {msg.text}
        </div>
      )}

      <div className="summary-grid">
        {SUMMARY_CARDS.map(card => (
          <button
            key={card.key}
            className={`summary-card summary-${card.color} ${activeTab === card.key ? 'summary-active' : ''}`}
            onClick={() => setActiveTab(card.key)}
          >
            <div className={`summary-icon summary-icon-${card.color}`}>{card.icon}</div>
            <div className="summary-text">
              <span className="summary-count">{counts[card.key]}</span>
              <span className="summary-label">{card.label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="tabs-bar">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <span className="tab-count">{appointments.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
          <p>Loading appointments…</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Calendar size={28} strokeWidth={1.4} />
          </div>
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
                <th>Date &amp; Time</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => {
                const note = normaliseNote(appt.notes);
                return (
                  <tr
                    key={appt.id}
                    className="appt-row"
                    onClick={() => openDetail(appt)}
                  >
                    <td>
                      <div className="appt-customer">
                        <div className="ac-avatar">{getInitial(appt.full_name)}</div>
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
                      <div className="appt-date">
                        <Calendar size={11} className="appt-meta-icon" />
                        {formatDate(appt.appointment_date)}
                      </div>
                      <div className="appt-time">
                        <Clock size={11} className="appt-meta-icon" />
                        {formatTime(appt.appointment_time)}
                      </div>
                    </td>

                    <td>
                      <span className={`badge badge-${appt.status}`}>
                        <StatusDot status={appt.status} />
                        {appt.status}
                      </span>
                    </td>

                    <td onClick={e => e.stopPropagation()}>
                      {note ? (
                        <button
                          className="view-note-btn"
                          onClick={() => setNoteModal({ name: appt.full_name, note })}
                        >
                          <FileText size={13} />
                          View Note
                        </button>
                      ) : (
                        <span className="notes-empty">No notes</span>
                      )}
                    </td>

                    <td onClick={e => e.stopPropagation()}>
                      <div className="appt-action-btns">
                        {appt.status === 'upcoming' && (
                          <>
                            <button
                              className="action-btn action-reschedule"
                              title="Reschedule"
                              onClick={() => { setRescheduleModal(appt); setNewDate(''); setNewTime(''); }}
                            >
                              <CalendarClock size={14} />
                            </button>
                            <button
                              className="action-btn action-complete"
                              title="Mark as completed"
                              onClick={() => confirmThen(
                                'Are you sure you want to mark this appointment as completed?',
                                () => handleStatusChange(appt.id, 'completed')
                              )}
                              disabled={actionLoading}
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              className="action-btn action-cancel"
                              title="Cancel appointment"
                              onClick={() => confirmThen(
                                'Are you sure you want to cancel this appointment? This action cannot be undone.',
                                () => handleStatusChange(appt.id, 'cancelled')
                              )}
                              disabled={actionLoading}
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        {appt.status === 'cancelled' && (
                          <button
                            className="action-btn action-restore"
                            title="Restore to upcoming"
                            onClick={() => handleStatusChange(appt.id, 'upcoming')}
                            disabled={actionLoading}
                          >
                            Restore
                          </button>
                        )}
                        {appt.status === 'completed' && (
                          <span className="action-done">Done</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal modal-detail" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Appointment Details</h2>
              <button className="modal-close" onClick={() => setDetailModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="detail-customer-row">
              <div className="detail-avatar">{getInitial(detailModal.full_name)}</div>
              <div className="detail-customer-info">
                <div className="detail-name">{detailModal.full_name}</div>
                <div className="detail-phone">
                  <Phone size={12} />
                  {detailModal.phone}
                </div>
              </div>
              <span className={`badge badge-${detailModal.status} detail-badge`}>
                <StatusDot status={detailModal.status} />
                {detailModal.status}
              </span>
            </div>

            <div className="detail-grid">
              <DetailRow icon={<User size={14} />}     label="Service" value={detailModal.service_name} />
              <DetailRow icon={<Calendar size={14} />} label="Date"    value={formatDate(detailModal.appointment_date)} />
              <DetailRow icon={<Clock size={14} />}    label="Time"    value={formatTime(detailModal.appointment_time)} />
              <DetailRow
                icon={<FileText size={14} />}
                label="Appointment Note"
                value={normaliseNote(detailModal.notes) || 'No special requests provided.'}
                muted={!normaliseNote(detailModal.notes)}
              />
            </div>

            <div className="detail-prefs-section">
              <div className="detail-prefs-header">
                <StickyNote size={14} className="detail-prefs-icon" />
                <span className="detail-prefs-title">Customer Preferences</span>
              </div>
              {prefsLoading ? (
                <p className="detail-prefs-loading">Loading preferences…</p>
              ) : customerPrefs ? (
                <div className="detail-prefs-body">
                  <p className="detail-prefs-text">{customerPrefs}</p>
                </div>
              ) : (
                <p className="detail-prefs-empty">No saved preferences for this customer.</p>
              )}
            </div>

            {detailModal.status === 'upcoming' && (
              <div className="detail-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => confirmThen(
                    'Are you sure you want to mark this appointment as completed?',
                    () => handleStatusChange(detailModal.id, 'completed')
                  )}
                  disabled={actionLoading}
                >
                  <CheckCircle size={14} /> Mark Complete
                </button>
                <button
                  className="btn btn-soft"
                  onClick={() => {
                    setRescheduleModal(detailModal);
                    setDetailModal(null);
                    setNewDate('');
                    setNewTime('');
                  }}
                >
                  <CalendarClock size={14} /> Reschedule
                </button>
                <button
                  className="btn btn-danger-soft"
                  onClick={() => confirmThen(
                    'Are you sure you want to cancel this appointment? This action cannot be undone.',
                    () => handleStatusChange(detailModal.id, 'cancelled')
                  )}
                  disabled={actionLoading}
                >
                  <XCircle size={14} /> Cancel
                </button>
              </div>
            )}

            {detailModal.status === 'cancelled' && (
              <div className="detail-actions">
                <button
                  className="btn btn-soft"
                  onClick={() => handleStatusChange(detailModal.id, 'upcoming')}
                  disabled={actionLoading}
                >
                  Restore to Upcoming
                </button>
              </div>
            )}

            <button className="btn btn-outline detail-close-btn" onClick={() => setDetailModal(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {noteModal && (
        <div className="modal-overlay" onClick={() => setNoteModal(null)}>
          <div className="modal modal-note" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Customer Note</h2>
              <button className="modal-close" onClick={() => setNoteModal(null)}>
                <X size={16} />
              </button>
            </div>
            <p className="note-customer-name">{noteModal.name}</p>
            <div className="note-body">
              <FileText size={16} className="note-body-icon" />
              <p className="note-text">{noteModal.note}</p>
            </div>
            <button
              className="btn btn-outline"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setNoteModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {rescheduleModal && (
        <div className="modal-overlay" onClick={() => setRescheduleModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Reschedule Appointment</h2>
              <button className="modal-close" onClick={() => setRescheduleModal(null)}>
                <X size={16} />
              </button>
            </div>
            <p className="reschedule-customer">
              <strong>{rescheduleModal.full_name}</strong> — {rescheduleModal.service_name}
            </p>
            <p className="reschedule-current">
              Current: {formatDate(rescheduleModal.appointment_date)} at {formatTime(rescheduleModal.appointment_time)}
            </p>
            <form onSubmit={handleReschedule}>
              <div className="form-group">
                <label className="form-label">New Date *</label>
                <input
                  type="date"
                  className="form-input"
                  min={TODAY}
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New Time *</label>
                <select
                  className="form-input form-select"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  required
                >
                  <option value="">Select time</option>
                  {TIME_SLOTS.map(t => (
                    <option key={t} value={t}>{formatTime(t)}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer-btns">
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                  <CheckCircle size={14} />
                  {actionLoading ? 'Saving…' : 'Confirm'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setRescheduleModal(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="modal modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Action</h2>
              <button className="modal-close" onClick={() => setConfirmModal(null)}>
                <X size={16} />
              </button>
            </div>
            <p className="confirm-message">{confirmModal.message}</p>
            <div className="modal-footer-btns">
              <button
                className="btn btn-primary"
                disabled={actionLoading}
                onClick={confirmModal.onConfirm}
              >
                {actionLoading ? 'Processing…' : 'Yes, proceed'}
              </button>
              <button className="btn btn-outline" onClick={() => setConfirmModal(null)}>
                No, go back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }) {
  return <span className={`status-dot status-dot-${status}`} />;
}

function DetailRow({ icon, label, value, muted }) {
  return (
    <div className="detail-row">
      <div className="detail-row-icon">{icon}</div>
      <div className="detail-row-content">
        <span className="detail-row-label">{label}</span>
        <span className={`detail-row-value ${muted ? 'detail-row-muted' : ''}`}>{value}</span>
      </div>
    </div>
  );
}
