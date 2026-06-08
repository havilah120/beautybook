import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import './SettingsPage.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    open_time: '09:00', close_time: '18:00', working_days: 'Mon,Tue,Wed,Thu,Fri,Sat',
    bank_name: '', account_name: '', account_number: '',
    email_notifications: true, appointment_reminders: true,
  });
  const [vendor, setVendor] = useState({ business_name: '', address: '' });
  const [owner, setOwner] = useState({ email: '', phone: '' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    API.get('/settings')
      .then(res => {
        const s = res.data.settings || {};
        setSettings({
          open_time: s.open_time?.substring(0, 5) || '09:00',
          close_time: s.close_time?.substring(0, 5) || '18:00',
          working_days: s.working_days || 'Mon,Tue,Wed,Thu,Fri,Sat',
          bank_name: s.bank_name || '',
          account_name: s.account_name || '',
          account_number: s.account_number || '',
          email_notifications: !!s.email_notifications,
          appointment_reminders: !!s.appointment_reminders,
        });
        setVendor({ business_name: res.data.vendor?.business_name || '', address: res.data.vendor?.address || '' });
        setOwner({ email: res.data.owner?.email || '', phone: res.data.owner?.phone || '' });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showMsg = (type, text, setter) => {
    setter({ type, text });
    setTimeout(() => setter({ type: '', text: '' }), 4000);
  };

  const toggleDay = (day) => {
    const days = settings.working_days ? settings.working_days.split(',') : [];
    const updated = days.includes(day) ? days.filter(d => d !== day) : [...days, day];
    setSettings({ ...settings, working_days: updated.join(',') });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/settings', { ...settings, ...vendor, ...owner });
      showMsg('success', 'Settings saved successfully!', setMsg);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to save settings.', setMsg);
    } finally { setSaving(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      showMsg('error', 'New passwords do not match.', setPwdMsg);
      return;
    }
    if (passwords.new_password.length < 6) {
      showMsg('error', 'Password must be at least 6 characters.', setPwdMsg);
      return;
    }
    setSavingPwd(true);
    try {
      await API.put('/auth/password', { current_password: passwords.current_password, new_password: passwords.new_password });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      showMsg('success', 'Password updated successfully!', setPwdMsg);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Failed to update password.', setPwdMsg);
    } finally { setSavingPwd(false); }
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your business profile and preferences</p>
      </div>

      <form onSubmit={handleSave} className="settings-layout">
        {msg.text && <div className={`alert alert-${msg.type}`}>{msg.type === 'success' ? '✅' : '⚠️'} {msg.text}</div>}

        {/* Business Info */}
        <div className="settings-section card">
          <div className="ss-header">
            <span className="ss-icon">🏪</span>
            <div>
              <h2>Business Information</h2>
              <p>Update your public business details</p>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input className="form-input" value={vendor.business_name}
                onChange={e => setVendor({...vendor, business_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={owner.phone}
                onChange={e => setOwner({...owner, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={owner.email}
                onChange={e => setOwner({...owner, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" placeholder="Street address, City" value={vendor.address}
                onChange={e => setVendor({...vendor, address: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="settings-section card">
          <div className="ss-header">
            <span className="ss-icon">🕐</span>
            <div>
              <h2>Working Hours</h2>
              <p>Set when clients can book appointments</p>
            </div>
          </div>
          <div className="grid-2" style={{marginBottom:'20px'}}>
            <div className="form-group">
              <label className="form-label">Opening Time</label>
              <input type="time" className="form-input" value={settings.open_time}
                onChange={e => setSettings({...settings, open_time: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Closing Time</label>
              <input type="time" className="form-input" value={settings.close_time}
                onChange={e => setSettings({...settings, close_time: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Working Days</label>
            <div className="days-selector">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  className={`day-btn ${settings.working_days?.includes(day) ? 'active' : ''}`}
                  onClick={() => toggleDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment details */}
        <div className="settings-section card">
          <div className="ss-header">
            <span className="ss-icon">🏦</span>
            <div>
              <h2>Payment Details</h2>
              <p>Bank account for client transfers (shown after booking)</p>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input className="form-input" placeholder="e.g. GTBank" value={settings.bank_name}
                onChange={e => setSettings({...settings, bank_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Account Name</label>
              <input className="form-input" placeholder="Account holder name" value={settings.account_name}
                onChange={e => setSettings({...settings, account_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Account Number</label>
              <input className="form-input" placeholder="10-digit account number" value={settings.account_number}
                onChange={e => setSettings({...settings, account_number: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section card">
          <div className="ss-header">
            <span className="ss-icon">🔔</span>
            <div>
              <h2>Notification Settings</h2>
              <p>Control how you receive notifications</p>
            </div>
          </div>
          <div className="toggles-list">
            <ToggleRow
              label="Email Notifications"
              desc="Receive email alerts for new bookings"
              checked={settings.email_notifications}
              onChange={() => setSettings({...settings, email_notifications: !settings.email_notifications})}
            />
            <ToggleRow
              label="Appointment Reminders"
              desc="Send reminder emails before appointments"
              checked={settings.appointment_reminders}
              onChange={() => setSettings({...settings, appointment_reminders: !settings.appointment_reminders})}
            />
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'flex-end'}}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'Saving...' : '💾 Save All Settings'}
          </button>
        </div>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePasswordSave} className="settings-section card" style={{marginTop:'24px'}}>
        <div className="ss-header">
          <span className="ss-icon">🔒</span>
          <div>
            <h2>Security</h2>
            <p>Update your account password</p>
          </div>
        </div>
        {pwdMsg.text && <div className={`alert alert-${pwdMsg.type}`}>{pwdMsg.type === 'success' ? '✅' : '⚠️'} {pwdMsg.text}</div>}
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" value={passwords.current_password}
              onChange={e => setPasswords({...passwords, current_password: e.target.value})} required />
          </div>
          <div></div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" placeholder="Min 6 characters" value={passwords.new_password}
              onChange={e => setPasswords({...passwords, new_password: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="form-input" value={passwords.confirm_password}
              onChange={e => setPasswords({...passwords, confirm_password: e.target.value})} required />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={savingPwd}>
          {savingPwd ? 'Updating...' : '🔒 Update Password'}
        </button>
      </form>
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
      <button type="button" className={`toggle ${checked ? 'on' : ''}`} onClick={onChange} aria-label={label}>
        <span className="toggle-thumb"></span>
      </button>
    </div>
  );
}
