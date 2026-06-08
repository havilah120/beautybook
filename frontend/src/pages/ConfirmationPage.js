import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './ConfirmationPage.css';
import { CheckCircle, Calendar, Clock, MapPin, Phone, User, Briefcase, CreditCard, ClipboardList, ArrowLeft, AlertTriangle} from 'lucide-react';

export default function ConfirmationPage() {
  const { state } = useLocation();
  const appt = state?.appointment;

  if (!appt) {
    return (
      <div className="confirmation-page">
        <Navbar />

        <div className="container conf-body">
          <div className="conf-card card session-card">

            <div className="conf-success-icon">
              <AlertTriangle size={32} />
            </div>

            <h1>Session Expired</h1>
            <p className="conf-sub">
              Your booking session has expired. Please book again or check your existing appointments.
            </p>

            <div className="conf-actions">
              <Link to="/vendors" className="btn btn-primary btn-lg">
                Book Again
              </Link>

              <Link to="/my-appointments" className="btn btn-outline btn-lg">
                View My Appointments
              </Link>
            </div>

          </div>
        </div>
      </div>
    );
  }

  const formatDate = (d) => {
    if (!d) return '—';

    const date = new Date(d);
    if (isNaN(date)) return '—';

    return date.toLocaleDateString('en-NG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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

  return (
    <div className="confirmation-page">
      <Navbar />
      <div className="container conf-body">
        <div className="conf-card card">
          <div className="conf-top-actions">
            <Link to="/" className="btn btn-outline btn-sm">
              <ArrowLeft size={14} style={{ marginRight: '6px' }} />
              Back to Home
            </Link>
          </div>
          <div className="conf-success-icon">
            <CheckCircle size={32} />
          </div>
          <h1>Booking Confirmed!</h1>
          <p className="conf-sub">Your appointment has been successfully booked. See you soon!</p>

          <div className="booking-id-badge">
            Booking ID: <strong>{appt.booking_id}</strong>
          </div>

          <div className="conf-details">
            <h2>Appointment Details</h2>
            <div className="conf-grid">
              <div className="conf-item">
                <span className="ci-label">Business</span>
                <span className="ci-value">{appt.business_name}</span>
              </div>
              <div className="conf-item">
                <span className="ci-label">Client Name</span>
                <span className="ci-value">{appt.full_name}</span>
              </div>
              <div className="conf-item">
                <span className="ci-label">Phone</span>
                <span className="ci-value">{appt.phone}</span>
              </div>
              <div className="conf-item">
                <span className="ci-label">Service</span>
                <span className="ci-value">{appt.service_name}</span>
              </div>
              <div className="conf-item">
                <span className="ci-label">Date</span>
                <span className="ci-value">{formatDate(appt.appointment_date)}</span>
              </div>
              <div className="conf-item">
                <span className="ci-label">Time</span>
                <span className="ci-value">{formatTime(appt.appointment_time)}</span>
              </div>
              <div className="conf-item">
                <span className="ci-label">Duration</span>
                <span className="ci-value">{appt.duration} minutes</span>
              </div>
              <div className="conf-item">
                <span className="ci-label">Price</span>
                <span className="ci-value conf-price">₦{Number(appt.price).toLocaleString()}</span>
              </div>
              <div className="conf-item">
                <span className="ci-label">Payment</span>
                <span className="ci-value">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {appt.payment_method === 'pay_on_arrival' ? (
                    <>
                      <Briefcase size={14} /> Pay on Arrival
                    </>
                  ) : (
                    <>
                      <CreditCard size={14} /> Bank Transfer
                    </>
                  )}
                </span>
                </span>
              </div>
              {appt.address && (
                <div className="conf-item">
                  <span className="ci-label">Location</span>
                  <span className="ci-value">{appt.address}{appt.city ? `, ${appt.city}` : ''}</span>
                </div>
              )}
            </div>
          </div>

          {appt.payment_method === 'bank_transfer' && (appt.bank_name || appt.account_number) && (
            <div className="bank-details">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} /> Payment Details
              </h2>
              <p>Please transfer the exact amount to complete your booking:</p>
              <div className="bank-info">
                {appt.bank_name && (
                  <div className="bank-row">
                    <span>Bank Name</span>
                    <strong>{appt.bank_name}</strong>
                  </div>
                )}
                {appt.account_name && (
                  <div className="bank-row">
                    <span>Account Name</span>
                    <strong>{appt.account_name}</strong>
                  </div>
                )}
                {appt.account_number && (
                  <div className="bank-row">
                    <span>Account Number</span>
                    <strong className="account-num">{appt.account_number}</strong>
                  </div>
                )}
                <div className="bank-row">
                  <span>Amount</span>
                  <strong className="transfer-amount">₦{Number(appt.price).toLocaleString()}</strong>
                </div>
              </div>
              <p className="bank-note" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} />
                Use your booking ID <strong>{appt.booking_id}</strong> as payment description.
              </p>
            </div>
          )}

          {appt.notes && (
            <div className="conf-notes">
              <h3>Your Notes</h3>
              <p>{appt.notes}</p>
            </div>
          )}

          <div className="conf-actions">
            <Link to="/my-appointments" className="btn btn-primary btn-lg">
              <ClipboardList size={16} style={{ marginRight: '6px' }} />
              View My Appointments
            </Link>
          </div>

          <div className="conf-reminder">
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} />
              Save your Booking ID: <strong>{appt.booking_id}</strong> — you'll need it to manage your appointment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
