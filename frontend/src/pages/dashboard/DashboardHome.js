import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import {
  CalendarDays, Users, Briefcase, TrendingUp,
  Plus, Images, Settings, ArrowRight, Clock, Phone, User,
} from 'lucide-react';
import './DashboardHome.css';

/* ── Date helpers ── */
function safeFormatDate(d) {
  if (!d) return null;
  const dateStr = d.includes('T') ? d : d + 'T00:00:00';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const input = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs   = today - input;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function safeFormatTime(t) {
  if (!t) return '';
  const parts = t.split(':');
  if (parts.length < 2) return '';
  const hour = parseInt(parts[0]);
  const min  = parts[1];
  if (isNaN(hour)) return '';
  const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${dh}:${min} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function GreetingIcon() {
  const h = new Date().getHours();
  if (h < 12) return <span role="img" aria-label="morning">🌤</span>;
  if (h < 17) return <span role="img" aria-label="afternoon">☀️</span>;
  return <span role="img" aria-label="evening">🌙</span>;
}

/*
 * Fix #1: Single initial only — first character of the first word, uppercased.
 * Returns null for empty/falsy names so callers render a fallback icon instead.
 */
function getInitial(fullName) {
  if (!fullName || !fullName.trim()) return null;
  return fullName.trim()[0].toUpperCase();
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/appointments/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-center">
      <div className="spinner" />
      <p>Loading dashboard…</p>
    </div>
  );

  const stats           = data?.stats               || {};
  const recentCustomers = data?.recent_customers     || [];
  const upcomingList    = data?.upcoming_appointments || [];

  const STATS = [
    {
      label: "Today's Appointments",
      value: stats.today_appointments    ?? 0,
      sub:   stats.today_appointments === 0 ? 'No appointments today' : 'Scheduled today',
      icon:  <CalendarDays size={20} />,
      color: 'pink',
      link:  '/dashboard/appointments',
    },
    {
      label: 'Total Customers',
      value: stats.total_customers       ?? 0,
      sub:   'All time',
      icon:  <Users size={20} />,
      color: 'brown',
      link:  '/dashboard/customers',
    },
    {
      label: 'Active Services',
      value: stats.total_services        ?? 0,
      sub:   'Published services',
      icon:  <Briefcase size={20} />,
      color: 'purple',
      link:  '/dashboard/services',
    },
    {
      label: 'Upcoming Bookings',
      value: stats.upcoming_appointments ?? 0,
      sub:   stats.upcoming_appointments === 0 ? 'No upcoming bookings' : 'Scheduled ahead',
      icon:  <TrendingUp size={20} />,
      color: 'green',
      link:  '/dashboard/appointments',
    },
  ];

  const QUICK_ACTIONS = [
    { to: '/dashboard/services',  icon: <Plus     size={18} />, label: 'Add Service',      sub: 'List a new service',  color: 'pink'   },
    { to: '/dashboard/portfolio', icon: <Images   size={18} />, label: 'Upload Portfolio', sub: 'Showcase your work',  color: 'purple' },
    { to: '/dashboard/settings',  icon: <Settings size={18} />, label: 'Edit Settings',    sub: 'Update your profile', color: 'beige'  },
    { to: '/dashboard/customers', icon: <Users    size={18} />, label: 'View Customers',   sub: 'Manage your clients', color: 'brown'  },
  ];

  return (
    <div className="dash-home">

      {/* Welcome */}
      <div className="dash-welcome">
        <div className="dw-left">
          <div className="dw-sun"><GreetingIcon /></div>
          <div className="dw-text">
            <h1>Good {getGreeting()}, {user?.owner_name?.split(' ')[0]}</h1>
            <p>Manage your appointments, customers, services and portfolio from one place.</p>
          </div>
        </div>
        <Link to="/dashboard/appointments" className="btn btn-primary dw-cta">
          <CalendarDays size={15} />
          View Appointments
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {STATS.map(s => (
          <Link key={s.label} to={s.link} className={`stat-card stat-${s.color}`}>
            <div className="sc-head">
              <div className={`sc-icon sc-icon-${s.color}`}>{s.icon}</div>
              <span className="sc-label">{s.label}</span>
            </div>
            <div className="sc-value">{s.value}</div>
            <div className={`sc-sub sc-sub-${s.color}`}>{s.sub}</div>
            <div className={`sc-watermark sc-wm-${s.color}`} aria-hidden="true">
              {s.icon}
            </div>
          </Link>
        ))}
      </div>

      <div className="dash-grid-2">

        {/* Upcoming appointments */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Upcoming Appointments</h2>
            <Link to="/dashboard/appointments" className="view-all-link">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {upcomingList.length === 0 ? (
            <DashEmpty
              icon={<CalendarDays size={26} strokeWidth={1.3} />}
              title="No upcoming appointments"
              sub="New bookings will appear here once clients book with you."
            />
          ) : (
            <div className="upcoming-list">
              {upcomingList.map(appt => {
                const initial = getInitial(appt.full_name);

                return (
                  <div key={appt.id} className="upcoming-item">

                    <div className="ui-avatar">
                      {initial
                        ? <span className="ui-initials">{initial}</span>
                        : <User size={15} />
                      }
                    </div>

                    <div className="ui-info">
                      <div className="ui-name-row">
                        <span className="ui-name">{appt.full_name}</span>
                        <span className="ui-service-badge">{appt.service_name}</span>
                      </div>
                      <div className="ui-meta-row">
                        <span className="ui-phone">
                          <Phone size={10} />
                          {appt.phone}
                        </span>
                        <span className="ui-time">
                          <Clock size={10} />
                          {safeFormatTime(appt.appointment_time)}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent customers */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Recent Customers</h2>
            <Link to="/dashboard/customers" className="view-all-link">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {recentCustomers.length === 0 ? (
            <DashEmpty
              icon={<Users size={26} strokeWidth={1.3} />}
              title="No customers yet"
              sub="Customers will appear here after their first booking."
            />
          ) : (
            <div className="rc-list">
              {recentCustomers.map((c, i) => {
                const lastVisit = safeFormatDate(c.last_visit);
                const initial   = getInitial(c.full_name);

                return (
                  <div key={i} className="rc-item">
                    <div className="rc-avatar">
                      {initial ?? '?'}
                    </div>
                    <div className="rc-info">
                      <div className="rc-name">{c.full_name}</div>
                      <div className="rc-phone">{c.phone}</div>
                    </div>
                    <div className="rc-last">
                      <span className="rc-last-label">Last Visit</span>
                      <span className={`rc-last-date ${!lastVisit ? 'rc-never' : ''}`}>
                        {lastVisit ?? 'No visits yet'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Quick actions */}
      <div className="dash-qa-wrap">
        <h2 className="dash-qa-title">Quick Actions</h2>
        <div className="qa-grid">
          {QUICK_ACTIONS.map(qa => (
            <Link key={qa.to} to={qa.to} className={`qa-card qa-${qa.color}`}>
              <div className={`qa-icon qa-icon-${qa.color}`}>{qa.icon}</div>
              <div className="qa-text">
                <div className="qa-label">{qa.label}</div>
                <div className="qa-sub">{qa.sub}</div>
              </div>
              <div className="qa-arrow-wrap">
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

function DashEmpty({ icon, title, sub }) {
  return (
    <div className="dash-empty">
      <div className="dash-empty-icon">{icon}</div>
      <p className="dash-empty-title">{title}</p>
      <p className="dash-empty-sub">{sub}</p>
    </div>
  );
}
