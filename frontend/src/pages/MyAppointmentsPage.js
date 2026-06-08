import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API from '../utils/api';
import './MyAppointmentsPage.css';
import { Link } from 'react-router-dom';
import {Search, Calendar, Clock, MapPin, FileText, RefreshCw, XCircle, CheckCircle} from 'lucide-react';

export default function MyAppointmentsPage() {
  const [phone, setPhone] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone) { setError('Phone number is required'); return; }
    setLoading(true);
    setError('');
    setAppointments([]);
    setSearched(false);
    try {
      const params = { phone };
      if (bookingId) params.booking_id = bookingId;
      const res = await API.get('/appointments/client', { params });
      setAppointments(res.data.appointments || []);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally { setLoading(false); }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setActionLoading(true);
    try {
      await API.patch(`/appointments/client/${bookingId}`, { action: 'cancel', phone });
      setAppointments(prev => prev.map(a => a.booking_id === bookingId ? { ...a, status: 'cancelled' } : a));
      setActionMsg('Appointment cancelled successfully.');
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally { 
      setActionLoading(false);
      setTimeout(() => {
        setActionMsg('');
        handleClear();
      }, 3000);}
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) { return; }
    setActionLoading(true);
    try {
      await API.patch(`/appointments/client/${rescheduleModal.booking_id}`, {
        action: 'reschedule', phone,
        appointment_date: newDate,
        appointment_time: newTime,
      });
      setAppointments(prev => prev.map(a =>
        a.booking_id === rescheduleModal.booking_id
          ? { ...a, appointment_date: newDate, appointment_time: newTime, status: 'upcoming' }
          : a
      ));
      setRescheduleModal(null);
      setActionMsg('Appointment rescheduled successfully.');
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Failed to reschedule.');
    } finally { 
      setActionLoading(false);
      setTimeout(() => {
        setActionMsg('');
        handleClear();
      }, 3000);}
  };

  const handleClear = () => {
    setPhone('');
    setBookingId('');
    setAppointments([]);
    setError('');
    setSearched(false);
    setActionMsg('');
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date)) return '—';

    return date.toLocaleDateString('en-NG', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${dh}:${m} ${ampm}`;
  };

  const today = new Date().toISOString().split('T')[0];
  const TIME_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
  const filteredAppointments =
  statusFilter === 'all'
    ? appointments
    : appointments.filter(a => a.status === statusFilter);

  return (
    <div className="my-appts-page">
      <Navbar />
      <div className="my-appts-hero">
        <div className="container">
          <h1>My Appointments</h1>
          <p>Track and manage all your beauty & fashion bookings</p>
        </div>
      </div>

      <div className="container my-appts-body">
        <div className="search-card card">
          <h2>Find Your Appointments</h2>
          <p>Enter your phone number to retrieve all your bookings.</p>
          {error && <div className="alert alert-error">⚠️ {error}</div>}
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                className="form-input"
                placeholder="+234 800 000 0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Booking ID (optional)</label>
              <input
                className="form-input"
                placeholder="e.g. BB1A2B3C"
                value={bookingId}
                onChange={e => setBookingId(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Search size={16} style={{ marginRight: '6px' }} />
              {loading ? 'Searching...' : 'Find Appointments'}
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleClear}
            >
              Clear
            </button>
            </div>
          </form>
        </div>

        {actionMsg && (
          <div className="alert alert-success" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={16} /> {actionMsg}
          </div>
        )}

        {searched && (
          <div className="appts-results">
            <h2>
              {filteredAppointments.length} Appointment
              {filteredAppointments.length !== 1 ? 's' : ''} Found
            </h2>
            <div className="appts-filters">
              <button
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All
              </button>

              <button
                className={`filter-btn ${statusFilter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setStatusFilter('upcoming')}
              >
                Upcoming
              </button>

              <button
                className={`filter-btn ${statusFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('completed')}
              >
                Completed
              </button>

              <button
                className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setStatusFilter('cancelled')}
              >
                Cancelled
              </button>
            </div>
            {filteredAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FileText size={40} />
                </div>
                <h3>No appointments found</h3>
                <p>We couldn't find any bookings with that information.</p>
                <Link to="/vendors" className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Book an Appointment
                </Link>
              </div>
            ) : (
              <div className="appts-list">
                {filteredAppointments.map(appt => (
                  <div key={appt.id} className={`appt-card card appt-${appt.status}`}>
                    <div className="appt-card-header">
                      <div className="appt-vendor-info">
                        <h3>{appt.business_name}</h3>
                        <span className="appt-booking-id">#{appt.booking_id}</span>
                      </div>
                      <span className={`badge badge-${appt.status}`}>
                        {appt.status === 'upcoming' && <><Clock size={14}/> Upcoming</>}
                        {appt.status === 'completed' && <><CheckCircle size={14}/> Completed</>}
                        {appt.status === 'cancelled' && <><XCircle size={14}/> Cancelled</>}
                      </span>
                    </div>
                    <div className="appt-details-grid">
                      <div className="appt-detail">
                        <span className="ad-label">Service</span>
                        <span className="ad-value">{appt.service_name}</span>
                      </div>
                      <div className="appt-detail">
                        <span className="ad-label">Date</span>
                        <span className="ad-value"><Calendar size={14} /> {formatDate(appt.appointment_date)}</span>
                      </div>
                      <div className="appt-detail">
                        <span className="ad-label">Time</span>
                        <span className="ad-value"><Clock size={14} /> {formatTime(appt.appointment_time)}</span>
                      </div>
                      <div className="appt-detail">
                        <span className="ad-label">Price</span>
                        <span className="ad-value ad-price">₦{Number(appt.price).toLocaleString()}</span>
                      </div>
                      {appt.city && (
                        <div className="appt-detail">
                          <span className="ad-label">Location</span>
                          <span className="ad-value"><MapPin size={14} /> {appt.city}</span>
                        </div>
                      )}
                    </div>
                    {appt.notes && (
                      <div className="appt-notes">
                        <span><FileText size={14} /> {appt.notes}</span>
                      </div>
                    )}
                    {appt.status === 'upcoming' && (
                      <div className="appt-actions">
                        <button
                          className="btn btn-soft btn-sm"
                          onClick={() => { setRescheduleModal(appt); setNewDate(''); setNewTime(''); }}
                        >
                          <RefreshCw size={14} /> Reschedule
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(appt.booking_id)}
                          disabled={actionLoading}
                        >
                          <XCircle size={14} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="modal-overlay" onClick={() => setRescheduleModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Reschedule Appointment</h2>
              <button className="modal-close" onClick={() => setRescheduleModal(null)}>✕</button>
            </div>
            <p style={{marginBottom:'20px',color:'var(--gray)',fontSize:'14px'}}>
              Rescheduling: <strong>{rescheduleModal.service_name}</strong> at <strong>{rescheduleModal.business_name}</strong>
            </p>
            <form onSubmit={handleReschedule}>
              <div className="form-group">
                <label className="form-label">New Date *</label>
                <input type="date" className="form-input" min={today} value={newDate} onChange={e => setNewDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Time *</label>
                <select className="form-input form-select" value={newTime} onChange={e => setNewTime(e.target.value)} required>
                  <option value="">Select a time</option>
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
                <button type="submit" className="btn btn-primary" disabled={actionLoading} style={{flex:1,justifyContent:'center'}}>
                  {actionLoading ? 'Saving...' : '✓ Confirm Reschedule'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setRescheduleModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
