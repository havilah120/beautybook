import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import './DashboardHome.css';

export default function DashboardHome() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/appointments/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${dh}:${m} ${ampm}`;
  };

  if (loading) return (
    <div className="loading-center"><div className="spinner"></div><p>Loading dashboard...</p></div>
  );

  const stats = data?.stats || {};
  const recentCustomers = data?.recent_customers || [];
  const upcomingList = data?.upcoming_appointments || [];

  return (
    <div className="dash-home">
      <div className="dash-welcome">
        <div>
          <h1>Good {getGreeting()}, {user?.owner_name?.split(' ')[0]}</h1>
          <p>Here's what's happening with your business today.</p>
        </div>
        <Link to="/dashboard/appointments" className="btn btn-primary">
          📅 View All Appointments
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard icon="📅" label="Today's Appointments" value={stats.today_appointments ?? 0} color="pink" link="/dashboard/appointments" />
        <StatCard icon="👥" label="Total Customers" value={stats.total_customers ?? 0} color="brown" link="/dashboard/customers" />
        <StatCard icon="💼" label="Active Services" value={stats.total_services ?? 0} color="beige" link="/dashboard/services" />
        <StatCard icon="🔵" label="Upcoming Bookings" value={stats.upcoming_appointments ?? 0} color="info" link="/dashboard/appointments" />
      </div>

      <div className="dash-grid-2">
        {/* Upcoming Appointments */}
        <div className="card dash-card">
          <div className="dash-card-header">
            <h2>Upcoming Appointments</h2>
            <Link to="/dashboard/appointments" className="view-all-link">View all →</Link>
          </div>
          {upcomingList.length === 0 ? (
            <div className="empty-state" style={{padding:'32px 0'}}>
              <div className="empty-state-icon">📅</div>
              <h3>No upcoming appointments</h3>
              <p>New bookings will appear here</p>
            </div>
          ) : (
            <div className="upcoming-list">
              {upcomingList.map(appt => {
                const appointmentDate = new Date(appt.appointment_date);

                return (
                  <div key={appt.id} className="upcoming-item">
                    <div className="ui-date-block">
                      <span className="ui-day">
                        {appointmentDate.getDate()}
                      </span>

                      <span className="ui-month">
                        {appointmentDate.toLocaleString('en', {
                          month: 'short'
                        })}
                      </span>
                    </div>

                    <div className="ui-info">
                      <div className="ui-name">{appt.full_name}</div>
                      <div className="ui-service">{appt.service_name}</div>
                      <div className="ui-time">
                        ⏰ {formatTime(appt.appointment_time)}
                      </div>
                    </div>

                    <div className="ui-phone">
                      📞 {appt.phone}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div className="card dash-card">
          <div className="dash-card-header">
            <h2>Recent Customers</h2>
            <Link to="/dashboard/customers" className="view-all-link">View all →</Link>
          </div>
          {recentCustomers.length === 0 ? (
            <div className="empty-state" style={{padding:'32px 0'}}>
              <div className="empty-state-icon">👥</div>
              <h3>No customers yet</h3>
              <p>Customers appear after their first booking</p>
            </div>
          ) : (
            <div className="recent-customers-list">
              {recentCustomers.map((c, i) => (
                <div key={i} className="rc-item">
                  <div className="rc-avatar">{c.full_name?.charAt(0).toUpperCase()}</div>
                  <div className="rc-info">
                    <div className="rc-name">{c.full_name}</div>
                    <div className="rc-phone">{c.phone}</div>
                  </div>
                  <div className="rc-last">
                    <div className="rc-last-label">Last visit</div>
                    <div className="rc-last-date">{formatDate(c.last_visit)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card quick-actions">
        <h2>Quick Actions</h2>
        <div className="qa-grid">
          {[
            { to: '/dashboard/services', icon: '➕', label: 'Add Service' },
            { to: '/dashboard/portfolio', icon: '📸', label: 'Upload Portfolio' },
            { to: '/dashboard/settings', icon: '⚙️', label: 'Edit Settings' },
            { to: '/dashboard/customers', icon: '👥', label: 'View Customers' },
          ].map(qa => (
            <Link key={qa.to} to={qa.to} className="qa-item">
              <span className="qa-icon">{qa.icon}</span>
              <span>{qa.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, link }) {
  return (
    <Link to={link} className={`stat-card card stat-${color}`}>
      <div className="sc-icon-wrap">{icon}</div>
      <div className="sc-value">{value}</div>
      <div className="sc-label">{label}</div>
    </Link>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
