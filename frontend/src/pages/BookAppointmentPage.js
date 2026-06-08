import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import './BookAppointmentPage.css';
import { Calendar, Clock, MapPin, Store, Banknote, Sparkles, Shirt, CheckCircle} from 'lucide-react';

export default function BookAppointmentPage() { 
  const { vendorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedService = searchParams.get('service');

  const [vendor, setVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    service_id: preselectedService || '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
    payment_method: 'pay_on_arrival',
  });

  const TIME_SLOTS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00',
  ];


  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await API.get(`/vendors/${vendorId}`);
        setVendor(res.data.vendor);
        setServices(res.data.services);
      } catch { setError('Vendor not found'); }
      finally { setLoading(false); }
    };
    fetchVendor();
  }, [vendorId]);

  useEffect(() => {
    if (form.appointment_date) {
      API.get('/appointments/availability', { params: { vendor_id: vendorId, date: form.appointment_date } })
        .then(res => setBookedTimes(res.data.booked_times || []))
        .catch(() => {});
    }
  }, [form.appointment_date, vendorId]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.full_name || !form.phone || !form.service_id || !form.appointment_date || !form.appointment_time) {
      const message = 'Please fill all required fields';
      setError(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);

    try {
      const res = await API.post('/appointments/book', { ...form, vendor_id: vendorId });

      navigate('/confirmation', { state: { appointment: res.data.appointment } });

    } catch (err) {
      const message = err.response?.data?.message || 'Booking failed. Please try again.';
      setError(message);
    } finally {
        setSubmitting(false);
      }
};

  const isFashion = vendor?.category === 'Fashion';
  const selectedService = services.find(s => s.id == form.service_id);
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  const formatTime = (t) => {
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  };

  if (loading) return (
    <div><Navbar />
      <div className="loading-center" style={{minHeight:'60vh'}}><div className="spinner"></div></div>
    </div>
  );

  return (
    <div className="book-page">
      <Navbar />
      <div className="book-hero">
        <div className="container">
          <Link to={`/vendors/${vendorId}`} className="back-link"><span>←</span> Back to {vendor?.business_name}</Link>
          <h1>Book an Appointment</h1>
          <p>with <strong>{vendor?.business_name}</strong></p>
        </div>
      </div>

      <div className="container book-body">
        <div className="book-layout">
          <form className="book-form card" onSubmit={handleSubmit}>
            <h2 className="form-section-title">Your Information</h2>

            {error && (
              <div className="alert alert-error">
                <span>{error}</span>
              </div>
            )}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input name="full_name" className="form-input" placeholder="Jane Doe" value={form.full_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                name="phone"
                className="form-input"
                placeholder="+234 800 000 0000"
                value={form.phone}
                onChange={e => {
                  const value = e.target.value.replace(/[^0-9+]/g, '');
                  setForm(prev => ({ ...prev, phone: value }));
                }}
                required
              />
            </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email (Optional)</label>
              <input name="email" type="email" className="form-input" placeholder="your@email.com" value={form.email} onChange={handleChange} />
            </div>

            <div className="divider"></div>
            <h2 className="form-section-title">Appointment Details</h2>

            <div className="form-group">
            <label className="form-label">Select Service *</label>

            <select
              name="service_id"
              className="form-input form-select"
              value={form.service_id}
              onChange={handleChange}
              required
            >
              <option value="">Choose a service...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.service_name} — ₦{Number(s.price).toLocaleString()} ({s.duration}min)
                </option>
              ))}
            </select>

            {selectedService && (
              <p style={{ fontSize: '13px', color: 'var(--brown)', marginTop: '6px' }}>
                Selected: {selectedService.service_name}
              </p>
            )}
          </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input name="appointment_date" type="date" className="form-input" min={today} value={form.appointment_date} onChange={handleChange} required />
              </div>
              <div className="form-group">
              <label className="form-label">Time *</label>

              {form.appointment_date ? (
                <>
                  <div className="time-slots">
                    {TIME_SLOTS.map(time => {
                      const selectedDate = new Date(form.appointment_date);
                      const isToday = selectedDate.toDateString() === now.toDateString();

                      const [hour, minute] = time.split(':');
                      const slotTime = new Date();
                      slotTime.setHours(hour, minute, 0);

                      const isPast = isToday && slotTime < now;

                      const isBooked =
                        bookedTimes.includes(time + ':00') ||
                        bookedTimes.includes(time) ||
                        isPast;
                      return (
                        <button
                          key={time}
                          type="button"
                          className={`time-slot ${form.appointment_time === time ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                          disabled={isBooked}
                          onClick={() =>
                            !isBooked &&
                            setForm(prev => ({ ...prev, appointment_time: time }))
                          }
                        >
                          {formatTime(time)}
                        </button>
                      );
                    })}
                  </div>

                  {form.appointment_time && (
                    <p className="selected-time">
                      <CheckCircle size={14} style={{ marginRight: '6px' }} />
                      {formatTime(form.appointment_time)} selected
                    </p>
                  )}

                  {form.appointment_date && TIME_SLOTS.every(time => {
                      const selectedDate = new Date(form.appointment_date);
                      const isToday = selectedDate.toDateString() === now.toDateString();

                      const [hour, minute] = time.split(':');
                      const slotTime = new Date();
                      slotTime.setHours(hour, minute, 0);

                      const isPast = isToday && slotTime < now;

                      return (
                        bookedTimes.includes(time + ':00') ||
                        bookedTimes.includes(time) ||
                        isPast
                      );
                    }) && (
                    <p className="select-date-first">
                      No available slots for this day
                    </p>
                  )}
                </>
              ) : (
                <p className="select-date-first">Please select a date first</p>
              )}
            </div>
      </div>

            <div className="form-group">
              <label className="form-label">
                {isFashion ? 'Style Notes & Measurements *' : 'Additional Notes'}
              </label>
              <textarea
                name="notes"
                className={`form-input form-textarea ${isFashion ? 'fashion-notes' : ''}`}
                placeholder={isFashion
                  ? 'Please include your measurements (bust, waist, hips), preferred styles, colors, and any special requests...'
                  : 'Any special requests or preferences...'
                }
                value={form.notes}
                onChange={handleChange}
                rows={isFashion ? 6 : 3}
              />
            </div>

            <div className="divider"></div>
            <h2 className="form-section-title">Payment Method</h2>

            <div className="payment-options">
              <label className={`payment-option ${form.payment_method === 'pay_on_arrival' ? 'selected' : ''}`}>
                <input type="radio" name="payment_method" value="pay_on_arrival" checked={form.payment_method === 'pay_on_arrival'} onChange={handleChange} />
                <Store size={20} />
                <div>
                  <div className="po-title">Pay on Arrival</div>
                  <div className="po-desc">Pay when you arrive at the appointment</div>
                </div>
              </label>
              <label className={`payment-option ${form.payment_method === 'bank_transfer' ? 'selected' : ''}`}>
                <input type="radio" name="payment_method" value="bank_transfer" checked={form.payment_method === 'bank_transfer'} onChange={handleChange} />
                <Banknote size={20} />
                <div>
                  <div className="po-title">Bank Transfer</div>
                  <div className="po-desc">Transfer to vendor's bank account</div>
                </div>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg" 
              style={{width:'100%',justifyContent:'center',marginTop:'24px'}} 
              disabled={
                submitting ||
                !form.full_name ||
                !form.phone ||
                !form.service_id ||
                !form.appointment_date ||
                !form.appointment_time
              }
            >
              {submitting ? 'Processing...' : (
                <>
                  <Calendar size={18} style={{ marginRight: '6px' }} />
                  Confirm Booking
                </>
              )}
            </button>
          </form>

          <div className="book-sidebar">
            <div className="card booking-summary">
              <h3>Booking Summary</h3>
              <div className="bs-vendor">
                <div className="bs-vendor-icon">
                  {vendor?.category === 'Beauty'
                    ? <Sparkles size={20}/>
                    : <Shirt size={20}/>}
                </div>
                <div>
                  <div className="bs-vendor-name">{vendor?.business_name}</div>
                  <span className={`badge badge-${vendor?.category?.toLowerCase()}`}>{vendor?.category}</span>
                </div>
              </div>
              {vendor?.city && (
                <div className="bs-item">
                  <span><MapPin size={14}/> Location</span>
                  <span>{vendor.city}</span>
                </div>
              )}
              {vendor?.open_time && (
                <div className="bs-item">
                  <span><Clock size={14}/> Hours</span>
                  <span>{vendor.open_time?.substring(0,5)} – {vendor.close_time?.substring(0,5)}</span>
                </div>
              )}
              {form.appointment_date && (
                <div className="bs-item">
                  <span><Calendar size={14}/> Date</span>
                  <span>{new Date(form.appointment_date + 'T00:00:00').toLocaleDateString('en-NG', {weekday:'short',day:'numeric',month:'long'})}</span>
                </div>
              )}
              {form.appointment_time && (
                <div className="bs-item">
                  <span><Clock size={14}/> Time</span>
                  <span>{formatTime(form.appointment_time)}</span>
                </div>
              )}
              {selectedService && (
                <div className="bs-item">
                  <span><Sparkles size={14}/> Service</span>
                  <span>{selectedService?.service_name}</span>
                </div>
              )}
              {selectedService && (
                <div className="bs-price">
                  <span>Total</span>
                  <span>₦{Number(selectedService?.price).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
