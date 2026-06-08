import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './LandingPage.css';
import IconBox from "../components/IconBox";
import { Users, User, Search, Sparkles, Shirt, ShieldCheck, MapPin, Star, Zap, CalendarDays, Briefcase } from "lucide-react";
import { useEffect, useState } from 'react';
import api from '../utils/api';


const SAMPLE_VENDORS = [
  { id: 1, business_name: 'Glam Studio by Amara', category: 'Beauty', city: 'Lagos', description: 'Premium makeup artistry & bridal beauty services', profile_image: null },
  { id: 2, business_name: 'La Mode Atelier', category: 'Fashion', city: 'Abuja', description: 'Custom couture and ready-to-wear fashion design', profile_image: null },
  { id: 3, business_name: 'Lush Beauty Bar', category: 'Beauty', city: 'Port Harcourt', description: 'Full-service salon: hair, nails, skincare & more', profile_image: null },
];

export default function LandingPage() {
const [vendors, setVendors] = useState([]);

useEffect(() => {
  api.get('/vendors?featured=true')
    .then(res => setVendors(res.data))
    .catch(err => console.log(err));
}, []);

  return (
    <div className="landing">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob blob-1"></div>
          <div className="hero-blob blob-2"></div>
          <div className="hero-blob blob-3"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <span className="hero-badge"> Nigeria's Beauty & Fashion Platform</span>
            <h1 className="hero-headline">
              Your Beauty,<br />
              <em>Your Way</em>
            </h1>
            <p className="hero-sub">
              Discover talented beauty artists and fashion designers near you. Book appointments instantly, manage your style journey all in one place.
            </p>
            <div className="hero-actions">
              <Link to="/vendors" className="btn btn-primary btn-lg">Explore Vendors</Link>
              <Link to="/my-appointments" className="btn btn-outline btn-lg">My Appointments</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="stat-num">50+</span>
                <span className="stat-label">Vendors</span>
              </div>
              <div className="hero-stat">
                <span className="stat-num">100+</span>
                <span className="stat-label">Bookings</span>
              </div>
              <div className="hero-stat">
                <span className="stat-num">10+</span>
                <span className="stat-label">Cities</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card-main">
              <div className="hc-header">
                <div className="hc-avatar">👑</div>
                <div>
                  <div className="hc-name">Glam Studio</div>
                  <div className="hc-tag">Beauty · Lagos</div>
                </div>
              </div>
              <div className="hc-services">
                <div className="hc-service"> Bridal Makeup — ₦25,000</div>
                <div className="hc-service"> Nail Art — ₦8,000</div>
                <div className="hc-service"> Facial — ₦15,000</div>
              </div>
              <Link to="/vendors" className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>Book Now →</Link>
            </div>
            <div className="hero-card-float card-float-1">
              <span>✅</span> Booking Confirmed
            </div>
            <div className="hero-card-float card-float-2">
              <span>⭐</span> 4.9 Rating
            </div>
          </div>
        </div>
      </section>

{/* Trust / Social Proof */}
<section className="trust-section">
  <div className="container">
    <div className="trust-inner">

    <div className="trust-item">
      <div className="trust-avatars">
        {['A', 'F', 'C', 'T'].map((letter, i) => (
          <div key={i} className="trust-avatar" style={{zIndex: 4 - i}}>{letter}</div>
        ))}
      </div>
      <div className="trust-text">
        <strong>100+ happy clients</strong>
        <span>across Lagos & Abuja</span>
      </div>
    </div>

    <div className="trust-divider" />

    <div className="trust-item">
      <IconBox icon={Star} />
      <div className="trust-text">
        <strong>4.8 / 5 average rating</strong>
        <span>from verified bookings</span>
      </div>
    </div>

    <div className="trust-divider" />

    <div className="trust-item">
      <IconBox icon={ShieldCheck} />
      <div className="trust-text">
        <strong>Safe & Verified</strong>
        <span>All vendors are reviewed</span>
      </div>
    </div>

    <div className="trust-divider" />

    <div className="trust-item">
      <IconBox icon={Zap} />
      <div className="trust-text">
        <strong>Instant Confirmation</strong>
        <span>Book in under 2 minutes</span>
      </div>
    </div>

    </div>
</div>
</section>

{/* Why BeautyBook */}
<section className="why-section">
  <div className="container">
    <div className="why-header">
      <span className="why-label">WHY BEAUTYBOOK</span>
      <h2>Built with beauty <em>in mind</em></h2>
      <p className="section-sub">Everything you need to book, manage, and grow in one elegant place.</p>
    </div>
    <div className="why-grid">
      {[
  {
    icon: <Zap size={20} />,
    title: 'Instant Booking',
    desc: 'Clients can book appointments in seconds. No back-and-forth, no waiting just seamless scheduling.',
  },
  {
    icon: <CalendarDays size={20} />,
    title: 'Smart Scheduling',
    desc: 'Automatic availability checks prevent double bookings and keep your calendar perfectly organised.',
  },
  {
    icon: <Briefcase size={20} />,
    title: 'Business Tools',
    desc: 'Manage customers, services, and your portfolio all from one clean, intuitive dashboard.',
  },
  {
    icon: <ShieldCheck size={20} />,
    title: 'Safe & Secure',
    desc: 'Your data is protected with JWT authentication and encrypted passwords always.',
  },
      ].map((f) => (
        <div key={f.title} className="why-card">
          <div className="why-icon">{f.icon}</div>
          <h3>{f.title}</h3>
          <p>{f.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>

     {/* Vendor Preview */}
      <section className="vendors-preview">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Vendors</h2>
            <p className="section-sub">Top-rated beauty and fashion professionals</p>
          </div>
          <div className="vendors-grid">
            {(vendors.length ? vendors : SAMPLE_VENDORS).map((vendor) => (
              <div key={vendor.id} className="vendor-preview-card card">
                <div className="vpc-image">
                 {vendor.image_url ? (
                  <img src={vendor.image_url} alt={vendor.business_name} />
                ) : (
                   <div className="vpc-placeholder">
                    <Sparkles size={32} strokeWidth={1.5} />
                    <span>Beauty Service</span>
                  </div>
                )}
                  <span className={`badge badge-${vendor.category.toLowerCase()}`}>{vendor.category}</span>
                </div>
                <div className="vpc-body">
                  <h3>{vendor.business_name}</h3>
                  <p>{vendor.description}</p>
                  <div className="vpc-meta">
                    <div className="meta-left">
                      <MapPin size={14} />
                      <span>{vendor.location}</span>
                    </div>

                    <div className="meta-right">
                      <Star size={14} />
                      <span>{vendor.rating}</span>
                    </div>
                  
                  </div>
                  <div className="vpc-bottom">
                      <span className="price">₦{vendor.price || "15,000"}</span>
                      <span className="availability">Available today</span>
                    </div>
                  <Link to={`/vendors/${vendor.id}`} className="btn btn-outline btn-sm" style={{width:'100%',justifyContent:'center',marginTop:'12px'}}>View Profile</Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:'40px'}}>
            <Link to="/vendors" className="btn btn-primary btn-lg">Browse All Vendors</Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-label">HOW IT WORKS</span>

            <h2 className="section-title">
              Book your beauty <em>in 3 simple steps</em>
            </h2>

            <p className="section-sub">
              From discovery to glow, your entire experience made effortless.
            </p>
        </div>
          <div className="steps-grid">
            {[
              {
                number: "01",
                icon: <Search size={22} />,
                title: "Discover",
                desc: "Browse curated beauty artists and fashion designers near you.",
              },
              {
                number: "02",
                icon: <CalendarDays size={22} />,
                title: "Book",
                desc: "Choose your service, pick your preferred date and time.",
              },
              {
                number: "03",
                icon: <Sparkles size={22} />,
                title: "Glow",
                desc: "Show up and leave looking and feeling your absolute best.",
              },
            ].map((s) => (
              <div key={s.step} className="step-card">
                <div className="step-num">{s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    
        {/* CTA Section */}
        <section className="cta-section">
          <div className="container cta-grid">

            {/* Client CTA */}
            <div className="cta-card client-cta">
              <div className="cta-icon">
                <User size={26} />
              </div>

              <h2>Looking to Book a Service?</h2>
              <p>
                Browse hundreds of beauty and fashion professionals. Find the perfect match for your style needs and book instantly.
              </p>

              <Link to="/vendors" className="btn btn-primary">
                Book Appointment
              </Link>
            </div>

            {/* Business CTA */}
            <div className="cta-card business-cta">
              <div className="cta-icon">
                <Briefcase size={26} />
              </div>

              <h2>Are You a Business Owner?</h2>
              <p>
                Join BeautyBook to manage your appointments, showcase your portfolio, and grow your beauty or fashion business.
              </p>

              <Link to="/business/login" className="btn btn-outline">
                Get Started Free
              </Link>
            </div>

          </div>
        </section>

{/* Testimonials */}
<section className="testimonials-section">
  <div className="container">
    <div className="section-header">
      <span className="why-label">WHAT CLIENTS SAY</span>
      <h2 className="section-title">Real stories, real results</h2>
      <p className="section-sub">Thousands of women trust BeautyBook for their beauty and fashion needs.</p>
    </div>

    <div className="testimonials-grid">
      {[
        {
          quote: "I booked a bridal makeup artist two days before my wedding and everything was perfect. BeautyBook saved me!",
          name: "Adaeze Okonkwo",
          role: "Bride, Lagos",
          initial: "A",
          color: "#E8C7C8",
        },
        {
          quote: "As a fashion designer, having my own booking page has completely changed how I manage clients. So elegant and easy.",
          name: "Fatima Bello",
          role: "Fashion Designer, Abuja",
          initial: "F",
          color: "#F5EDE6",
        },
        {
          quote: "I love how I can track all my appointments in one place without creating an account. Just my phone number — genius!",
          name: "Chisom Eze",
          role: "Student, PAU",
          initial: "C",
          color: "#D4A8AB",
        },
      ].map((t, i) => (
        <div key={i} className="testimonial-card">
          <div className="tc-quote-mark">“</div>
          <p className="tc-quote">{t.quote}</p>
          <div className="tc-stars">
            ⭐⭐⭐⭐⭐
          </div>
          <div className="tc-author">
            <div className="tc-avatar" style={{background: t.color}}>{t.initial}</div>
            <div className="tc-info">
              <div className="tc-name">{t.name}</div>
              <div className="tc-role">{t.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      <Footer />
    </div>
  );
}
