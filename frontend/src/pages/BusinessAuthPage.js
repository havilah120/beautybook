import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './BusinessAuthPage.css';
import {CalendarDays, Users, ImageIcon, BarChart3, Sparkles, Dress, Shirt} from 'lucide-react';
import { ArrowLeft } from 'lucide-react';


export default function BusinessAuthPage() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    business_name: '', owner_name: '', email: '', phone: '',
    password: '', confirm_password: '', business_type: 'Beauty',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (regForm.password !== regForm.confirm_password) {
      setError('Passwords do not match'); return;
    }
    if (regForm.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      await register(regForm);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const features = [
  {
    icon: <CalendarDays size={22} />,
    title: 'Smart Scheduling',
    desc: 'Manage bookings, availability, and appointment calendars effortlessly.'
  },
  {
    icon: <Users size={22} />,
    title: 'Customer Management',
    desc: 'Keep customer records, appointment history, and contact information organized.'
  },
  {
    icon: <ImageIcon size={22} />,
    title: 'Portfolio Showcase',
    desc: 'Display your best work and attract more clients through your business profile.'
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Business Insights',
    desc: 'Track appointments, services, and business performance over time.'
  }
];

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-back-home">
            <ArrowLeft size={16} />
            <span>Back to Homepage</span>
          </Link>
          <Link to="/" className="auth-logo">
            <div className="logo-monogram">BB</div>
            <span className="logo-brand">BeautyBook</span>
          </Link>
          <div className="auth-hero-text">
            <h1>Grow Your Beauty & Fashion Business</h1>
            <p>  
              Simplify appointment scheduling, manage customers,
              track bookings, and stay organized with a platform
              built for beauty and fashion entrepreneurs.
            </p>
          </div>
          <div className="auth-features">
            {features.map(f => (
              <div key={f.title} className="auth-feature-item">
                <div className="af-icon">
                  {f.icon}
                </div>
                <div>
                  <div className="af-title">{f.title}</div>
                  <div className="af-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-bg-blob"></div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>
              Sign In
            </button>
            <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setError(''); }}>
              Create Account
            </button>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-form-header">
                <h2>Welcome back</h2>
                <p>Sign in to your business dashboard</p>
              </div>
              <div className="form-group">
                <label className="form-label">Email or Phone Number</label>
                <input
                  className="form-input"
                  placeholder="your@email.com or phone number"
                  value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Your password"
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? 'Signing in...' : '→ Sign In'}
              </button>
              <p className="auth-switch">
                Don't have an account?{' '}
                <button type="button" className="link-btn" onClick={() => { setMode('register'); setError(''); }}>
                  Create one free
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <div className="auth-form-header">
                <h2>Create Your Business Account</h2>
                <p>Join BeautyBook and start accepting bookings online.</p>
                <div className="form-group">
                  <label className="form-label">Business Name *</label>
                  <input className="form-input" placeholder="Glam Studio" value={regForm.business_name}
                    onChange={e => setRegForm({ ...regForm, business_name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Owner Name *</label>
                  <input className="form-input" placeholder="Jane Doe" value={regForm.owner_name}
                    onChange={e => setRegForm({ ...regForm, owner_name: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input type="email" className="form-input" placeholder="your@email.com" value={regForm.email}
                  onChange={e => setRegForm({ ...regForm, email: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" placeholder="+234 800..." value={regForm.phone}
                    onChange={e => setRegForm({ ...regForm, phone: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Type *</label>

                  <div className="business-type-wrapper">
                    {regForm.business_type === 'Beauty' ? (
                      <Sparkles size={16} className="business-type-icon" />
                    ) : (
                      <Shirt size={16} className="business-type-icon" />
                    )}

                    <select
                      className="form-input form-select business-type-select"
                      value={regForm.business_type}
                      onChange={e =>
                        setRegForm({
                          ...regForm,
                          business_type: e.target.value
                        })
                      }
                    >
                      <option value="Beauty">Beauty</option>
                      <option value="Fashion">Fashion</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input type="password" className="form-input" placeholder="Min 6 characters" value={regForm.password}
                    onChange={e => setRegForm({ ...regForm, password: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input type="password" className="form-input" placeholder="Repeat password" value={regForm.confirm_password}
                    onChange={e => setRegForm({ ...regForm, confirm_password: e.target.value })} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
                {loading ? 'Creating account...' : '→ Create Account'}
              </button>
              <p className="auth-switch">
                Already have an account?{' '}
                <button type="button" className="link-btn" onClick={() => { setMode('login'); setError(''); }}>
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
