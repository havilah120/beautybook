import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-monogram">BB</div>
          <div className="logo-text">
            <span class="logo-brand">
              Beauty<span class="logo-accent">Book</span>
            </span>
          </div>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/vendors" className={`nav-link ${isActive('/vendors') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Vendors</Link>
          <Link to="/my-appointments" className={`nav-link ${isActive('/my-appointments') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>My Appointments</Link>
          <Link to="/business/login" className={`nav-link ${isActive('/business/login') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Business Login</Link>
          <Link to="/vendors" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Book Now</Link>
        </div>
      </div>
    </nav>
  );
}
