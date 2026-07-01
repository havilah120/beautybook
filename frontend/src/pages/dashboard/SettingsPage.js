import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import {
  Building2, Clock, CreditCard, ShieldCheck,
  CheckCircle, AlertCircle, X, Eye, EyeOff,
  Phone, Mail, MapPin,
} from 'lucide-react';
import './SettingsPage.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const [settings, setSettings] = useState({
    open_time:  '09:00',
    close_time: '18:00',
    working_days: 'Mon,Tue,Wed,Thu,Fri,Sat',
    bank_name: '',
    account_name: '',
    account_number: '',
  });
  const [vendor, setVendor] = useState({ business_name: '', address: '' });
  const [owner, setOwner]   = useState({ email: '', phone: '' });
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  const [toast, setToast] = useState({ visible: false, type: '', text: '' });

  useEffect(() => {
    API.get('/settings')
      .then(res => {
        const s = res.data.settings || {};
        const v = res.data.vendor   || {};
        const o = res.data.owner    || {};
        setSettings({
          open_time:     s.open_time?.substring(0, 5)  || '09:00',
          close_time:    s.close_time?.substring(0, 5) || '18:00',
          working_days:  s.working_days || 'Mon,Tue,Wed,Thu,Fri,Sat',
          bank_name:     s.bank_name      || '',
          account_name:  s.account_name   || '',
          account_number: s.account_number || '',
        });
        setVendor({
          business_name: v.business_name || o.business_name || '',
          address:       v.address || '',
        });
        setOwner({ email: o.email || '', phone: o.phone || '' });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (type, text) => {
    setToast({ visible: true, type, text });
    setTimeout(() => setToast({ visible: false, type: '', text: '' }), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/settings', { ...settings, ...vendor, ...owner });
      showToast('success', 'Settings saved successfully.');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save settings.');
    } finally { setSaving(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      showToast('error', 'New passwords do not match.'); return;
    }
    if (passwords.new_password.length < 6) {
      showToast('error', 'Password must be at least 6 characters.'); return;
    }
    setSavingPwd(true);
    try {
      await API.put('/auth/password', {
        current_password: passwords.current_password,
        new_password:     passwords.new_password,
      });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      showToast('success', 'Password updated successfully.');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update password.');
    } finally { setSavingPwd(false); }
  };

  const toggleDay = (day) => {
    const days = settings.working_days ? settings.working_days.split(',') : [];
    const updated = days.includes(day)
      ? days.filter(d => d !== day)
      : [...days, day];
    setSettings({ ...settings, working_days: updated.join(',') });
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

      <form onSubmit={handleSave} className="settings-layout">

        {/* ── Business Information ── */}
        <div className="settings-section">
          <div className="ss-header">
            <div className="ss-icon"><Building2 size={20} /></div>
            <div>
              <h2>Business Information</h2>
              <p>Update your public business details</p>
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">
                <Building2 size={13} className="fl-icon" /> Business Name
              </label>
              <input className="form-input"
                value={vendor.business_name}
                onChange={e => setVendor({ ...vendor, business_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">
                <Phone size={13} className="fl-icon" /> Phone Number
              </label>
              <input className="form-input"
                value={owner.phone}
                onChange={e => setOwner({ ...owner, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">
                <Mail size={13} className="fl-icon" /> Email Address
              </label>
              <input type="email" className="form-input"
                value={owner.email}
                onChange={e => setOwner({ ...owner, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">
                <MapPin size={13} className="fl-icon" /> Business Address
              </label>
              <input className="form-input" placeholder="Street address, City"
                value={vendor.address}
                onChange={e => setVendor({ ...vendor, address: e.target.value })} />
            </div>
          </div>
        </div>

        {/* ── Working Hours ── */}
        <div className="settings-section">
          <div className="ss-header">
            <div className="ss-icon"><Clock size={20} /></div>
            <div>
              <h2>Working Hours</h2>
              <p>Set when clients can book appointments</p>
            </div>
          </div>

          <div className="form-row-2" style={{ marginBottom: 22 }}>
            <div className="form-group">
              <label className="form-label">Opening Time</label>
              <input type="time" className="form-input"
                value={settings.open_time}
                onChange={e => setSettings({ ...settings, open_time: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Closing Time</label>
              <input type="time" className="form-input"
                value={settings.close_time}
                onChange={e => setSettings({ ...settings, close_time: e.target.value })} />
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

      </form>

      {/* ── Security (separate form, not inside main form) ── */}
      <form onSubmit={handlePasswordSave} className="settings-section">
        <div className="ss-header">
          <div className="ss-icon"><ShieldCheck size={20} /></div>
          <div>
            <h2>Security</h2>
            <p>Update your account password</p>
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label className="form-label">
              <ShieldCheck size={13} className="fl-icon" /> Current Password
            </label>
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
          </div>
          <div />
          <div className="form-group">
            <label className="form-label">New Password</label>
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
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
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
          </div>
        </div>

        <div className="section-footer">
          <button type="submit" className="btn btn-primary st-save-btn" disabled={savingPwd}>
            <ShieldCheck size={15} />
            {savingPwd ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </form>

    </div>
  );
}
