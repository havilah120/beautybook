import React, { useState, useEffect, useCallback } from 'react';
import API from '../../utils/api';
import {
  Phone, Mail, Calendar, Clock, User,
  Users, CheckCircle, Save, StickyNote, NotebookPen,
  Search, Pencil, Clock3,
} from 'lucide-react';
import './CustomersPage.css';

function safeDate(d) {
  if (!d) return null;
  const s = String(d).trim();
  if (!s || s === 'null' || s === 'undefined') return null;
  const ds = s.includes('T') ? s : s + 'T00:00:00';
  const dt = new Date(ds);
  return isNaN(dt.getTime()) ? null : dt;
}

function formatDate(d) {
  const dt = safeDate(d);
  if (!dt) return 'Date unavailable';
  return dt.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateShort(d) {
  const dt = safeDate(d);
  if (!dt) return '—';
  return dt.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(d) {
  const dt = safeDate(d);
  if (!dt) return null;
  return dt.toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getDay(d) {
  const dt = safeDate(d);
  return dt ? dt.getDate() : '—';
}

function getMonth(d) {
  const dt = safeDate(d);
  return dt ? dt.toLocaleString('en', { month: 'short' }) : '—';
}

function formatTime(t) {
  if (!t) return '';
  const parts = String(t).split(':');
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

function hasNote(raw) {
  if (!raw) return false;
  const s = String(raw).trim().toLowerCase();
  return s !== '' && s !== 'nil' && s !== 'null';
}

function cleanNote(raw) {
  if (!raw) return '';
  const s = String(raw).trim();
  if (s.toLowerCase() === 'nil' || s.toLowerCase() === 'null') return '';
  return s;
}

export default function CustomersPage() {
  const [customers, setCustomers]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [selected, setSelected]           = useState(null);
  const [selectedData, setSelectedData]   = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [notes, setNotes]                 = useState('');
  const [savedNotes, setSavedNotes]       = useState('');
  const [notesUpdatedAt, setNotesUpdatedAt] = useState(null);
  const [savingNotes, setSavingNotes]     = useState(false);
  const [toast, setToast]                 = useState({ visible: false, msg: '' });

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
    setSelectedData(null);
    setNotes('');
    setSavedNotes('');
    setNotesUpdatedAt(null);
    setDetailLoading(true);
    try {
      const res = await API.get(`/customers/${customer.id}`);
      setSelectedData(res.data);
      const existingNote = cleanNote(res.data.customer.notes);
      setNotes(existingNote);
      setSavedNotes(existingNote);
      setNotesUpdatedAt(res.data.customer.notes_updated_at || res.data.customer.updated_at || null);
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await API.patch(`/customers/${selected.id}/notes`, { notes });
      setSavedNotes(notes);
      setNotesUpdatedAt(new Date().toISOString());
      setCustomers(prev =>
        prev.map(c => c.id === selected.id ? { ...c, notes } : c)
      );
      showToast('Notes updated successfully');
    } catch {
      showToast('Failed to save notes.');
    } finally { setSavingNotes(false); }
  };

  const showToast = (msg) => {
    setToast({ visible: true, msg });
    setTimeout(() => setToast({ visible: false, msg: '' }), 3500);
  };

  const customer     = selectedData?.customer;
  const appointments = selectedData?.appointments || [];
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  const lastVisit = customer?.last_appointment
    ? formatDateShort(customer.last_appointment)
    : appointments.length > 0
      ? formatDateShort(appointments[0]?.appointment_date)
      : null;

  const isDirty = notes !== savedNotes;

  return (
    <div className="customers-page">

      {toast.visible && (
        <div className="customers-toast">
          <CheckCircle size={14} />
          {toast.msg}
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <p className="page-subtitle">
          {customers.length} total customer{customers.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="customers-layout">

        <div className="customers-list-panel">
          <div className="clp-search">
            <div className="search-field">
              <Search size={14} className="search-field-icon" />
              <input
                type="text"
                className="search-field-input"
                placeholder="Search by name or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : customers.length === 0 ? (
            <div className="cl-empty">
              <div className="cl-empty-icon"><Users size={22} strokeWidth={1.4} /></div>
              <p>No customers found</p>
            </div>
          ) : (
            <div className="customers-list">
              {customers.map(c => (
                <div
                  key={c.id}
                  className={`customer-row ${selected?.id === c.id ? 'active' : ''}`}
                  onClick={() => handleSelectCustomer(c)}
                >
                  <div className="cr-avatar">{getInitial(c.full_name)}</div>
                  <div className="cr-info">
                    <div className="cr-name-row">
                      <span className="cr-name">{c.full_name}</span>
                      {hasNote(c.notes) && (
                        <span className="cr-note-indicator" title="Has saved notes">
                          <NotebookPen size={11} />
                        </span>
                      )}
                    </div>
                    <div className="cr-phone">{c.phone}</div>
                  </div>
                  <div className="cr-meta">
                    <div className="cr-visits">
                      {c.total_visits} visit{c.total_visits !== 1 ? 's' : ''}
                    </div>
                    <div className="cr-last">{formatDateShort(c.last_appointment)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="customer-detail-panel">
          {!selected ? (
            <div className="cd-placeholder">
              <div className="cd-placeholder-icon"><User size={24} strokeWidth={1.4} /></div>
              <h3>Select a customer</h3>
              <p>Click on a customer to view their profile and appointment history.</p>
            </div>
          ) : detailLoading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : selectedData ? (
            <div className="customer-detail">

              <div className="cd-header">
                <div className="cd-avatar">{getInitial(customer.full_name)}</div>
                <div className="cd-info">
                  <h2>{customer.full_name}</h2>
                  <div className="cd-contact">
                    <span className="cd-contact-item">
                      <Phone size={12} />
                      {customer.phone}
                    </span>
                    {customer.email && (
                      <span className="cd-contact-item">
                        <Mail size={12} />
                        {customer.email}
                      </span>
                    )}
                  </div>
                  <div className="cd-stats">
                    <div className="cd-stat">
                      <strong>{customer.total_visits ?? appointments.length}</strong>
                      <span>Total Visits</span>
                    </div>
                    <div className="cd-stat">
                      <strong>{completedCount}</strong>
                      <span>Completed</span>
                    </div>
                    {lastVisit && (
                      <div className="cd-stat">
                        <strong>{lastVisit}</strong>
                        <span>Last Visit</span>
                      </div>
                    )}
                    <div className="cd-stat">
                      <strong>{formatDate(customer.created_at)}</strong>
                      <span>Member Since</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="divider" />

              <h3 className="cd-section-title">
                <Calendar size={15} className="cd-section-icon" />
                Appointment History
              </h3>

              {appointments.length === 0 ? (
                <p className="cd-no-appts">No appointments yet.</p>
              ) : (
                <div className="cd-appts">
                  {appointments.map(appt => (
                    <div key={appt.id} className="cd-appt-row">
                      <div className="cd-appt-date">
                        <div className="cad-day">{getDay(appt.appointment_date)}</div>
                        <div className="cad-month">{getMonth(appt.appointment_date)}</div>
                      </div>
                      <div className="cd-appt-info">
                        <div className="cai-service">{appt.service_name}</div>
                        <div className="cai-time">
                          <Clock size={10} />
                          {formatTime(appt.appointment_time)}
                        </div>
                      </div>
                      <div className="cd-appt-right">
                        <div className="cai-price">₦{Number(appt.price).toLocaleString()}</div>
                        <span className={`badge badge-${appt.status}`}>
                          <span className={`status-dot status-dot-${appt.status}`} />
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="divider" />

              <div className="notes-section-header">
                <h3 className="cd-section-title" style={{ margin: 0 }}>
                  <StickyNote size={15} className="cd-section-icon" />
                  Notes &amp; Preferences
                </h3>
                <span className="notes-visibility-badge">
                  Visible to you only
                </span>
              </div>

              {savedNotes ? (
                <div className="notes-saved-card">
                  <div className="notes-saved-body">
                    <p className="notes-saved-text">{savedNotes}</p>
                  </div>
                  {notesUpdatedAt && (
                    <div className="notes-saved-meta">
                      <Clock3 size={11} />
                      Last updated {formatDateTime(notesUpdatedAt)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="notes-empty-state">
                  <StickyNote size={16} className="notes-empty-icon" />
                  <p>No notes saved yet for this customer.</p>
                </div>
              )}

              <div className="notes-edit-block">
                <div className="notes-edit-label">
                  <Pencil size={12} />
                  {savedNotes ? 'Edit notes' : 'Add notes'}
                </div>
                <textarea
                  className="cd-textarea"
                  placeholder="Add notes about this customer (preferences, allergies, measurements, etc.)"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                />
                <div className="cd-notes-footer">
                  <button
                    className={`btn btn-primary btn-save-notes ${isDirty ? 'btn-dirty' : ''}`}
                    onClick={handleSaveNotes}
                    disabled={savingNotes || !isDirty}
                  >
                    <Save size={14} />
                    {savingNotes ? 'Saving…' : 'Save Changes'}
                  </button>
                  {isDirty && (
                    <span className="notes-unsaved-hint">Unsaved changes</span>
                  )}
                </div>
              </div>

            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
}
