import React, { useState, useEffect, useRef } from 'react';
import API from '../../utils/api';
import {
  Building2, Clock, CreditCard, Bell, ShieldCheck,
  CheckCircle, AlertCircle, X, Eye, EyeOff,
  Camera, Globe, Lock, User, Phone, Mail, MapPin,
  AtSign, FileText, Calendar, Timer, AlarmClock,
  ChevronDown,
} from 'lucide-react';
import './SettingsPage.css';

const FULL_DAYS = [
  { key: 'Mon', label: 'Monday' },
  { key: 'Tue', label: 'Tuesday' },
  { key: 'Wed', label: 'Wednesday' },
  { key: 'Thu', label: 'Thursday' },
  { key: 'Fri', label: 'Friday' },
  { key: 'Sat', label: 'Saturday' },
  { key: 'Sun', label: 'Sunday' },
];

const TIME_SLOTS = [
  '06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30',
  '10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
  '18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00',
];

function formatTimeLabel(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${dh}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function buildDaySchedule(workingDays, openTime, closeTime) {
  const active = (workingDays || '').split(',').filter(Boolean);
  return FULL_DAYS.reduce((acc, { key }) => {
    acc[key] = {
      open: active.includes(key),
      open_time:  openTime  || '09:00',
      close_time: closeTime || '18:00',
    };
    return acc;
  }, {});
}

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  const [vendor, setVendor]   = useState({ business_name: '', address: '', instagram: '', bio: '' });
  const [owner, setOwner]     = useState({ email: '', phone: '' });
  const [profile, setProfile] = useState({ profile_visible: true });

  const [daySchedule, setDaySchedule] = useState({});
  const [buffer, setBuffer]           = useState('0');
  const [maxPerDay, setMaxPerDay]     = useState('');
  const [advanceWindow, setAdvanceWindow] = useState('30');
  const [minNotice, setMinNotice]     = useState('0');

  const [payment, setPayment] = useState({ bank_name: '', account_name: '', account_number: '' });
  const [notifications, setNotifications] = useState({ email_notifications: true, appointment_reminders: true });

  const [passwords, setPasswords]     = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showPwd, setShowPwd]         = useState({ current: false, new: false, confirm: false });

  const [toast, setToast] = useState({ visible: false, type: '', text: '' });
  const [saving, setSaving] = useState({
    profile: false, info: false, hours: false, payment: false, notifications: false, password: false,
  });

  const profileImgRef = useRef();
  const coverImgRef   = useRef();

  useEffect(() => {
    API.get('/settings')
      .then(res => {
        const s = res.data.settings || {};
        const v = res.data.vendor   || {};
        const o = res.data.owner    || {};

        setVendor({
          business_name: v.business_name || o.business_name || '',
          address:   v.address   || '',
          instagram: v.instagram || '',
          bio:       v.bio       || '',
        });
        setOwner({ email: o.email || '', phone: o.phone || '' });
        setProfile({ profile_visible: s.profile_visible !== false });

        setDaySchedule(buildDaySchedule(
          s.working_days || 'Mon,Tue,Wed,Thu,Fri',
          s.open_time?.substring(0, 5) || '09:00',
          s.close_time?.substring(0, 5) || '18:00',
        ));
        setBuffer(String(s.appointment_buffer ?? '0'));
        setMaxPerDay(String(s.max_per_day ?? ''));
        setAdvanceWindow(String(s.advance_window ?? '30'));
        setMinNotice(String(s.min_notice ?? '0'));

        setPayment({
          bank_name:      s.bank_name      || '',
          account_name:   s.account_name   || '',
          account_number: s.account_number || '',
        });
        setNotifications({
          email_notifications:   !!s.email_notifications,
          appointment_reminders: !!s.appointment_reminders,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (type, text) => {
    setToast({ visible: true, type, text });
    setTimeout(() => setToast({ visible: false, type: '', text: '' }), 4000);
  };

  const setSavingKey = (key, val) => setSaving(s => ({ ...s, [key]: val }));

  const saveSection = async (key, payload) => {
    setSavingKey(key, true);
    try {
      await API.put('/settings', payload);
      showToast('success', 'Changes saved successfully.');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save changes.');
    } finally { setSavingKey(key, false); }
  };

  const handleSaveInfo = () => saveSection('info', { ...vendor, ...owner });

  const handleSaveProfile = () => saveSection('profile', {
    profile_visible: profile.profile_visible,
  });

  const handleSaveHours = () => {
    const activeDays = Object.entries(daySchedule)
      .filter(([, v]) => v.open)
      .map(([k]) => k)
      .join(',');
    const firstOpen  = Object.values(daySchedule).find(d => d.open);
    saveSection('hours', {
      working_days:      activeDays,
      open_time:         firstOpen?.open_time  || '09:00',
      close_time:        firstOpen?.close_time || '18:00',
      appointment_buffer: Number(buffer),
      max_per_day:       maxPerDay ? Number(maxPerDay) : null,
      advance_window:    Number(advanceWindow),
      min_notice:        Number(minNotice),
      day_schedule:      JSON.stringify(daySchedule),
    });
  };

  const handleSavePayment = () => saveSection('payment', payment);

  const handleSaveNotifications = () => saveSection('notifications', notifications);

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      showToast('error', 'New passwords do not match.'); return;
    }
    if (passwords.new_password.length < 6) {
      showToast('error', 'Password must be at least 6 characters.'); return;
    }
    setSavingKey('password', true);
    try {
      await API.put('/auth/password', {
        current_password: passwords.current_password,
        new_password:     passwords.new_password,
      });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      showToast('success', 'Password updated successfully.');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update password.');
    } finally { setSavingKey('password', false); }
  };

  const toggleDay = (key) => {
    setDaySchedule(prev => ({
      ...prev,
      [key]: { ...prev[key], open: !prev[key].open },
    }));
  };

  const updateDayTime = (key, field, val) => {
    setDaySchedule(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: val },
    }));
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="settings-page">
      {toast.visible && (
        <div className={`st-toast st-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.text}
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your business profile and preferences</p>
      </div>

      <div className="settings-layout">

        {/* ── Business Profile ── */}
        <div className="settings-section">
          <SectionHeader icon={<Globe size={20} />} title="Business Profile"
            desc="Control how your business appears to clients" />

          <div className="profile-visibility-row">
            <div className="pv-info">
              <div className="pv-label">Public Profile</div>
              <div className="pv-desc">
                {profile.profile_visible
                  ? 'Your business is visible on BeautyBook and can receive bookings.'
                  : 'Your profile is hidden. Clients cannot find or book you.'}
              </div>
            </div>
            <button
              type="button"
              className={`st-toggle ${profile.profile_visible ? 'on' : ''}`}
              onClick={() => setProfile(p => ({ ...p, profile_visible: !p.profile_visible }))}
              aria-label="Toggle profile visibility"
            >
              <span className="st-toggle-thumb" />
            </button>
          </div>

          <div className="profile-photos-row">
            <div className="photo-block">
              <div className="photo-block-label">Profile Photo</div>
              <div className="profile-photo-preview">
                <div className="pp-circle">
                  <User size={28} strokeWidth={1.3} />
                </div>
              </div>
              <div className="photo-block-actions">
                <button type="button" className="btn btn-soft btn-sm st-photo-btn"
                  onClick={() => profileImgRef.current?.click()}>
                  <Camera size={13} /> Upload
                </button>
                <input ref={profileImgRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { /* handled by backend integration */ }} />
              </div>
            </div>

            <div className="photo-block photo-block-cover">
              <div className="photo-block-label">
                Cover Photo
                <span className="photo-size-hint">Recommended: 1600 × 500 px</span>
              </div>
              <div className="cover-photo-preview">
                <div className="cover-placeholder">
                  <Camera size={22} strokeWidth={1.3} />
                  <span>No cover photo</span>
                </div>
              </div>
              <div className="photo-block-actions">
                <button type="button" className="btn btn-soft btn-sm st-photo-btn"
                  onClick={() => coverImgRef.current?.click()}>
                  <Camera size={13} /> Upload
                </button>
                <input ref={coverImgRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { /* handled by backend integration */ }} />
              </div>
            </div>
          </div>

          <div className="public-preview-card">
            <div className="ppc-cover" />
            <div className="ppc-body">
              <div className="ppc-avatar"><User size={18} strokeWidth={1.4} /></div>
              <div className="ppc-info">
                <div className="ppc-name">{vendor.business_name || 'Your Business Name'}</div>
                <div className="ppc-sub">Beauty &amp; Makeup Artist</div>
                <div className="ppc-stars">★★★★★</div>
              </div>
            </div>
            <div className="ppc-label">Public preview</div>
          </div>

          <SectionFooter onSave={handleSaveProfile} saving={saving.profile} />
        </div>

        {/* ── Business Information ── */}
        <div className="settings-section">
          <SectionHeader icon={<Building2 size={20} />} title="Business Information"
            desc="Update your public business details" />

          <div className="form-row-2">
            <FormField label="Business Name" icon={<Building2 size={14} />}>
              <input className="form-input" value={vendor.business_name}
                onChange={e => setVendor({ ...vendor, business_name: e.target.value })} />
            </FormField>
            <FormField label="Phone Number" icon={<Phone size={14} />}>
              <input className="form-input" value={owner.phone}
                onChange={e => setOwner({ ...owner, phone: e.target.value })} />
            </FormField>
            <FormField label="Email Address" icon={<Mail size={14} />}>
              <input type="email" className="form-input" value={owner.email}
                onChange={e => setOwner({ ...owner, email: e.target.value })} />
            </FormField>
            <FormField label="Business Address" icon={<MapPin size={14} />}>
              <input className="form-input" placeholder="Street address, City"
                value={vendor.address}
                onChange={e => setVendor({ ...vendor, address: e.target.value })} />
            </FormField>
            <FormField label="Instagram Username (optional)" icon={<AtSign size={14} />}>
              <div className="input-prefix-wrap">
                <span className="input-prefix">@</span>
                <input className="form-input input-with-prefix" placeholder="yourbusiness"
                  value={vendor.instagram}
                  onChange={e => setVendor({ ...vendor, instagram: e.target.value })} />
              </div>
            </FormField>
          </div>

          <FormField label="Business Bio" icon={<FileText size={14} />}>
            <textarea className="form-input form-textarea"
              placeholder="Tell clients about your business, specialties and experience…"
              rows={4}
              maxLength={250}
              value={vendor.bio}
              onChange={e => setVendor({ ...vendor, bio: e.target.value })} />
            <div className="char-count">{vendor.bio.length} / 250</div>
          </FormField>

          <SectionFooter onSave={handleSaveInfo} saving={saving.info} />
        </div>

        {/* ── Working Hours ── */}
        <div className="settings-section">
          <SectionHeader icon={<Clock size={20} />} title="Working Hours"
            desc="Set when clients can book appointments" />

          <div className="day-schedule-list">
            {FULL_DAYS.map(({ key, label }) => (
              <div key={key} className={`day-row ${!daySchedule[key]?.open ? 'day-row-closed' : ''}`}>
                <div className="day-row-left">
                  <button
                    type="button"
                    className={`st-toggle st-toggle-sm ${daySchedule[key]?.open ? 'on' : ''}`}
                    onClick={() => toggleDay(key)}
                    aria-label={`Toggle ${label}`}
                  >
                    <span className="st-toggle-thumb" />
                  </button>
                  <div className="day-label-group">
                    <span className="day-name">{label}</span>
                    <span className={`day-status ${daySchedule[key]?.open ? 'day-open' : 'day-closed'}`}>
                      {daySchedule[key]?.open ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
                {daySchedule[key]?.open && (
                  <div className="day-times">
                    <select className="form-input time-select"
                      value={daySchedule[key]?.open_time || '09:00'}
                      onChange={e => updateDayTime(key, 'open_time', e.target.value)}>
                      {TIME_SLOTS.map(t => (
                        <option key={t} value={t}>{formatTimeLabel(t)}</option>
                      ))}
                    </select>
                    <span className="time-dash">—</span>
                    <select className="form-input time-select"
                      value={daySchedule[key]?.close_time || '18:00'}
                      onChange={e => updateDayTime(key, 'close_time', e.target.value)}>
                      {TIME_SLOTS.map(t => (
                        <option key={t} value={t}>{formatTimeLabel(t)}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hours-extra-grid">
            <FormField label="Appointment Buffer" icon={<Timer size={14} />}
              hint="Gap between consecutive appointments">
              <div className="select-wrap">
                <select className="form-input" value={buffer}
                  onChange={e => setBuffer(e.target.value)}>
                  <option value="0">No buffer</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
                <ChevronDown size={14} className="select-chevron" />
              </div>
            </FormField>

            <FormField label="Max Appointments Per Day" icon={<Calendar size={14} />}
              hint="Leave empty for no limit">
              <input type="number" className="form-input" min="1" max="50"
                placeholder="e.g. 8" value={maxPerDay}
                onChange={e => setMaxPerDay(e.target.value)} />
            </FormField>

            <FormField label="Advance Booking Window" icon={<Calendar size={14} />}
              hint="How far ahead clients can book">
              <div className="select-wrap">
                <select className="form-input" value={advanceWindow}
                  onChange={e => setAdvanceWindow(e.target.value)}>
                  <option value="0">Same day only</option>
                  <option value="7">7 days ahead</option>
                  <option value="14">14 days ahead</option>
                  <option value="30">30 days ahead</option>
                  <option value="60">60 days ahead</option>
                  <option value="90">90 days ahead</option>
                </select>
                <ChevronDown size={14} className="select-chevron" />
              </div>
            </FormField>

            <FormField label="Minimum Booking Notice" icon={<AlarmClock size={14} />}
              hint="Minimum time before an appointment">
              <div className="select-wrap">
                <select className="form-input" value={minNotice}
                  onChange={e => setMinNotice(e.target.value)}>
                  <option value="0">Immediately</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="360">6 hours</option>
                  <option value="720">12 hours</option>
                  <option value="1440">24 hours</option>
                </select>
                <ChevronDown size={14} className="select-chevron" />
              </div>
            </FormField>
          </div>

          <SectionFooter onSave={handleSaveHours} saving={saving.hours} />
        </div>

        {/* ── Payment Details ── */}
        <div className="settings-section">
          <SectionHeader icon={<CreditCard size={20} />} title="Payment Details"
            desc="Bank account for client transfers" />

          <div className="form-row-2">
            <FormField label="Bank Name" icon={<CreditCard size={14} />}>
              <input className="form-input" placeholder="e.g. GTBank, Access Bank"
                value={payment.bank_name}
                onChange={e => setPayment({ ...payment, bank_name: e.target.value })} />
            </FormField>
            <FormField label="Account Name" icon={<User size={14} />}>
              <input className="form-input" placeholder="Account holder name"
                value={payment.account_name}
                onChange={e => setPayment({ ...payment, account_name: e.target.value })} />
            </FormField>
            <FormField label="Account Number" icon={<CreditCard size={14} />}
              hint="This information is shown to clients after a booking is confirmed.">
              <input className="form-input" placeholder="10-digit account number"
                value={payment.account_number}
                onChange={e => setPayment({ ...payment, account_number: e.target.value })} />
            </FormField>
          </div>

          <SectionFooter onSave={handleSavePayment} saving={saving.payment} />
        </div>

        {/* ── Notifications ── */}
        <div className="settings-section">
          <SectionHeader icon={<Bell size={20} />} title="Notification Settings"
            desc="Control how you receive notifications" />

          <div className="toggles-list">
            <ToggleRow
              label="Email Notifications"
              desc="Receive email alerts for new bookings"
              checked={notifications.email_notifications}
              onChange={() => setNotifications(n => ({ ...n, email_notifications: !n.email_notifications }))}
            />
            <ToggleRow
              label="Appointment Reminders"
              desc="Send reminder emails before appointments"
              checked={notifications.appointment_reminders}
              onChange={() => setNotifications(n => ({ ...n, appointment_reminders: !n.appointment_reminders }))}
            />
          </div>

          <SectionFooter onSave={handleSaveNotifications} saving={saving.notifications} />
        </div>

        {/* ── Security ── */}
        <div className="settings-section">
          <SectionHeader icon={<ShieldCheck size={20} />} title="Security"
            desc="Update your account password" />

          <form onSubmit={handlePasswordSave}>
            <div className="form-row-2">
              <FormField label="Current Password" icon={<Lock size={14} />}>
                <div className="pwd-wrap">
                  <input
                    type={showPwd.current ? 'text' : 'password'}
                    className="form-input"
                    value={passwords.current_password}
                    onChange={e => setPasswords({ ...passwords, current_password: e.target.value })}
                    required
                  />
                  <button type="button" className="pwd-eye"
                    onClick={() => setShowPwd(s => ({ ...s, current: !s.current }))}>
                    {showPwd.current ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </FormField>
              <div />
              <FormField label="New Password" icon={<Lock size={14} />}>
                <div className="pwd-wrap">
                  <input
                    type={showPwd.new ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={passwords.new_password}
                    onChange={e => setPasswords({ ...passwords, new_password: e.target.value })}
                    required
                  />
                  <button type="button" className="pwd-eye"
                    onClick={() => setShowPwd(s => ({ ...s, new: !s.new }))}>
                    {showPwd.new ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </FormField>
              <FormField label="Confirm New Password" icon={<Lock size={14} />}>
                <div className="pwd-wrap">
                  <input
                    type={showPwd.confirm ? 'text' : 'password'}
                    className="form-input"
                    value={passwords.confirm_password}
                    onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })}
                    required
                  />
                  <button type="button" className="pwd-eye"
                    onClick={() => setShowPwd(s => ({ ...s, confirm: !s.confirm }))}>
                    {showPwd.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </FormField>
            </div>
            <div className="section-footer">
              <button type="submit" className="btn btn-primary st-save-btn"
                disabled={saving.password}>
                <ShieldCheck size={14} />
                {saving.password ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

function SectionHeader({ icon, title, desc }) {
  return (
    <div className="ss-header">
      <div className="ss-icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{desc}</p>
      </div>
    </div>
  );
}

function SectionFooter({ onSave, saving }) {
  return (
    <div className="section-footer">
      <button type="button" className="btn btn-primary st-save-btn"
        onClick={onSave} disabled={saving}>
        <CheckCircle size={14} />
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );
}

function FormField({ label, icon, hint, children }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {icon && <span className="form-label-icon">{icon}</span>}
        {label}
      </label>
      {children}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="toggle-row">
      <div className="tr-info">
        <div className="tr-label">{label}</div>
        <div className="tr-desc">{desc}</div>
      </div>
      <button type="button"
        className={`st-toggle ${checked ? 'on' : ''}`}
        onClick={onChange}
        aria-label={label}>
        <span className="st-toggle-thumb" />
      </button>
    </div>
  );
}
