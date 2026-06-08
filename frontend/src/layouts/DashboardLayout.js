import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊', end: true },
  { path: '/dashboard/appointments', label: 'Appointments', icon: '📅' },
  { path: '/dashboard/customers', label: 'Customers', icon: '👥' },
  { path: '/dashboard/services', label: 'Services', icon: '💼' },
  { path: '/dashboard/portfolio', label: 'Portfolio', icon: '📸' },
  { path: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <div className="logo-monogram">BB</div>
            <span className="logo-brand">BeautyBook</span>
          </Link>
        </div>

        <div className="sidebar-user">
          <div className="su-avatar">
            {user?.business_name?.charAt(0).toUpperCase()}
          </div>
          <div className="su-info">
            <div className="su-name">{user?.business_name}</div>
            <div className="su-type">{user?.business_type}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sl-icon">{item.icon}</span>
              <span className="sl-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link" target="_blank">
            <span className="sl-icon">🌐</span>
            <span className="sl-label">View Public Page</span>
          </Link>
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <span className="sl-icon">🚪</span>
            <span className="sl-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="dashboard-main">
        {/* Top bar */}
        <header className="dashboard-topbar">
          <button className="hamburger-dash" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span></span><span></span><span></span>
          </button>
          <div className="topbar-title">
            {NAV_ITEMS.find(n => window.location.pathname === n.path || (!n.end && window.location.pathname.startsWith(n.path)))?.label || 'Dashboard'}
          </div>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="tu-avatar">{user?.business_name?.charAt(0).toUpperCase()}</div>
              <div className="tu-info">
                <div className="tu-name">{user?.owner_name}</div>
                <div className="tu-email">{user?.email}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
