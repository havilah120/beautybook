import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="logo-monogram">BB</div>
            <span className="logo-brand">BeautyBook</span>
          </div>

          <p className="footer-tagline">
            Connecting beauty enthusiasts with talented professionals.
          </p>

          <div className="footer-socials">
          <p className="footer-coming">
             Socials launching soon ✨
          </p>
          </div>
        </div>

        {/* Links */}
        <div className="footer-links">
          <div className="footer-col">
            <h4>For Clients</h4>
            <Link to="/vendors">Browse Vendors</Link>
            <Link to="/my-appointments">My Appointments</Link>
            <Link to="/vendors">Book a Service</Link>
          </div>

          <div className="footer-col">
            <h4>For Business</h4>
            <Link to="/business/login">Business Login</Link>
            <Link to="/business/login">Get Started</Link>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <a href="mailto:hello@beautybook.com">hello@beautybook.com</a>
            <a href="tel:+2348000000000">+234 800 000 0000</a>
            <span>Lagos, Nigeria</span>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {new Date().getFullYear()} BeautyBook. All rights reserved.</p>

          <div className="footer-extra">
            <Link to="#">Privacy</Link>
            <Link to="#">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}