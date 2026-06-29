import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, CalendarDays, Users, Briefcase,
  Images, Settings, Globe, LogOut, Menu, X, ExternalLink, AlertCircle,
} from 'lucide-react';
import './DashboardLayout.css';

const NAV_ITEMS = [
  { path: '/dashboard',              label: 'Dashboard',    icon: <LayoutDashboard size={16} />, end: true },
  { path: '/dashboard/appointments', label: 'Appointments', icon: <CalendarDays    size={16} /> },
  { path: '/dashboard/customers',    label: 'Customers',    icon: <Users           size={16} /> },
  { path: '/dashboard/services',     label: 'Services',     icon: <Briefcase       size={16} /> },
  { path: '/dashboard/portfolio',    label: 'Portfolio',    icon: <Images          size={16} /> },
  { path: '/dashboard/settings',     label: 'Settings',     icon: <Settings        size={16} /> },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogoutConfirm = () => {
    setLogoutModalOpen(false);
    logout();
    navigate('/');
  };

  const currentPage = NAV_ITEMS.find(n =>
    window.location.pathname === n.path ||
    (!n.end && window.location.pathname.startsWith(n.path))
  )?.label || 'Dashboard';

  return (
    <div className="dashboard-layout">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Logout confirmation modal */}
      {logoutModalOpen && (
        <div className="logout-modal-overlay" onClick={() => setLogoutModalOpen(false)}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <div className="lm-icon">
              <AlertCircle size={28} strokeWidth={1.5} />
            </div>
            <h3 className="lm-title">Log out of BeautyBook?</h3>
            <p className="lm-sub">Are you sure you want to log out of your vendor account?</p>
            <div className="lm-actions">
              <button
                className="btn btn-outline lm-cancel"
                onClick={() => setLogoutModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger lm-confirm"
                onClick={handleLogoutConfirm}
              >
                <LogOut size={15} />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>

        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <div className="logo-monogram">BB</div>
            <span className="logo-brand">BeautyBook</span>
          </Link>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={15} />
          </button>
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
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-public-btn"
          >
            <Globe size={15} />
            <span>View Public Page</span>
            <ExternalLink size={12} className="pub-ext" />
          </Link>
          <button
            className="sidebar-link logout-btn"
            onClick={() => setLogoutModalOpen(true)}
          >
            <span className="sl-icon"><LogOut size={16} /></span>
            <span className="sl-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            className="hamburger-dash"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={20} />
          </button>
          <div className="topbar-title">{currentPage}</div>
          <div className="topbar-right">
            <div className="topbar-user">
              <div className="tu-avatar">
                {user?.business_name?.charAt(0).toUpperCase()}
              </div>
              <div className="tu-info">
                <div className="tu-name">{user?.owner_name}</div>
                <div className="tu-role">Vendor Account</div>
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