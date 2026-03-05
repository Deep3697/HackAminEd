import React, { useState, useEffect } from 'react';

// 1. Image Imports
import slide1Image from '../../assets/slide-1.avif';
import slide2Image from '../../assets/slide-2.avif';
import slide3Image from '../../assets/slide-3.avif';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 2. Slide Data
  const slides = [
    {
      id: 1,
      image: slide1Image, 
      subtitle: "TELOS INDUSTRIAL ERP",
      title: "HANDLE WITH CARE, GROW WITH PURPOSE",
      description: "We connect every piece of your operation—from raw materials to final delivery. Telos empowers your workforce, so you can focus on what matters most: building your legacy."
    },
    {
      id: 2,
      image: slide2Image, 
      subtitle: "SMART INVENTORY",
      title: "PRECISION IN EVERY PROCESS",
      description: "Experience real-time stock tracking and automated forecasting. We don't just manage warehouses; we orchestrate them to beat with perfect efficiency."
    },
    {
      id: 3,
      image: slide3Image,
      subtitle: "HEART OF PRODUCTION",
      title: "WHERE IDEAS BECOME REALITY",
      description: "Your factory floor is the heartbeat of your business. Our intelligent routing and planning ensure your greatest concepts come to life without delay."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide(currentSlide === slides.length - 1 ? 0 : currentSlide + 1);
  const prevSlide = () => setCurrentSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);

  return (
    // Changed overflow to allow scrolling down
    <div style={{ fontFamily: 'Arial, sans-serif', width: '100vw', minHeight: '100vh', overflowX: 'hidden', overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      
      {/* CSS For Animations & Grid */}
      <style>
        {`
          @keyframes pulseT {
            0% { text-shadow: 0 0 5px #fca311; transform: scale(1); }
            50% { text-shadow: 0 0 20px #fca311, 0 0 30px #fca311; transform: scale(1.08); }
            100% { text-shadow: 0 0 5px #fca311; transform: scale(1); }
          }
          @keyframes slideInElos {
            0% { opacity: 0; transform: translateX(-30px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes fadeUpTagline {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .footer-link {
            color: #666666;
            text-decoration: none;
            transition: color 0.3s ease;
          }
          .footer-link:hover {
            color: #fca311;
          }
          .feature-card {
            padding: 40px 30px;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            background-color: #ffffff;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.08);
            border-color: #fca311;
          }
        `}
      </style>

      {/* TOP HEADER SECTION (Stays at the top) */}
      <header style={{ backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 50px', borderBottom: '2px solid #e5e5e5', zIndex: 20, position: 'sticky', top: 0 }}>
        
        {/* BIG ANIMATED LOGO AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', cursor: 'pointer' }}>
            <span style={{ fontSize: '55px', fontWeight: '900', color: '#fca311', animation: 'pulseT 2.5s infinite ease-in-out', lineHeight: '1' }}>T</span>
            <span style={{ fontSize: '45px', fontWeight: '800', color: '#14213d', animation: 'slideInElos 1.2s ease-out forwards', lineHeight: '1' }}>elos</span>
          </div>
          <span style={{ color: '#fca311', fontSize: '14px', fontWeight: 'bold', letterSpacing: '1.5px', marginTop: '5px', animation: 'fadeUpTagline 1.5s ease-out 0.5s forwards', opacity: 0 }}>
            Nurturing the heartbeat of your industry.
          </span>
        </div>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button style={{ padding: '12px 30px', backgroundColor: '#ffffff', color: '#14213d', border: '2px solid #14213d', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s' }}>
            Log in
          </button>
          <button style={{ padding: '12px 30px', backgroundColor: '#fca311', color: '#14213d', border: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s' }}>
            Sign up
          </button>
        </div>

      </header>

      {/* HERO SLIDER SECTION (Fixed to about 90% of screen height so user knows to scroll) */}
      <div style={{ height: '88vh', position: 'relative', overflow: 'hidden' }}>
        
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: index === currentSlide ? 1 : 0, transition: 'opacity 1s ease-in-out', zIndex: index === currentSlide ? 1 : 0 
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(20, 33, 61, 0.65)' }}></div>
          </div>
        ))}

        <div style={{ position: 'absolute', top: '50%', left: '10%', transform: 'translateY(-50%)', zIndex: 10, color: '#ffffff', maxWidth: '800px' }}>
          <p style={{ fontSize: '16px', letterSpacing: '2px', fontWeight: 'bold', borderBottom: '2px solid #fca311', display: 'inline-block', paddingBottom: '5px', marginBottom: '20px' }}>
            {slides[currentSlide].subtitle}
          </p>
          <h2 style={{ fontSize: '65px', fontWeight: 'bold', margin: '0 0 20px 0', lineHeight: '1.1' }}>
            {slides[currentSlide].title}
          </h2>
          <p style={{ fontSize: '20px', lineHeight: '1.6', marginBottom: '40px', color: '#e5e5e5' }}>
            {slides[currentSlide].description}
          </p>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <button style={{ padding: '15px 40px', backgroundColor: '#fca311', color: '#14213d', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', borderRadius: '4px' }}>
              ABOUT US
            </button>
            <button style={{ padding: '15px 40px', backgroundColor: 'transparent', color: '#ffffff', border: '2px solid #ffffff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', borderRadius: '4px' }}>
              FAQS
            </button>
          </div>
        </div>

        {/* Arrows and Dots */}
        <button onClick={prevSlide} style={{ position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)', zIndex: 10, backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '2px solid #fff', borderRadius: '50%', width: '55px', height: '55px', cursor: 'pointer', fontSize: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>&#10094;</button>
        <button onClick={nextSlide} style={{ position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)', zIndex: 10, backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', border: '2px solid #fff', borderRadius: '50%', width: '55px', height: '55px', cursor: 'pointer', fontSize: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>&#10095;</button>
        <div style={{ position: 'absolute', bottom: '40px', width: '100%', display: 'flex', justifyContent: 'center', gap: '15px', zIndex: 10 }}>
          {slides.map((_, index) => (
            <div key={index} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: index === currentSlide ? '#fca311' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => setCurrentSlide(index)}></div>
          ))}
        </div>
      </div>

      {/* NEW SCROLLABLE WHITE SECTION: Smart Features */}
      <div style={{ padding: '80px 10%', backgroundColor: '#ffffff' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h3 style={{ color: '#fca311', fontWeight: 'bold', letterSpacing: '2px', fontSize: '16px', margin: '0 0 10px 0' }}>BEYOND TRADITIONAL ERP</h3>
          <h2 style={{ color: '#14213d', fontSize: '40px', fontWeight: '900', margin: 0 }}>Smart Automations & Integrations</h2>
          <p style={{ color: '#666', fontSize: '18px', maxWidth: '700px', margin: '20px auto 0 auto', lineHeight: '1.6' }}>
            We are building cutting-edge tools to reduce manual entry and keep you instantly connected to your clients and factory floor.
          </p>
        </div>

        {/* CSS Grid for Classic Card Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          
          {/* Feature 1 */}
          <div className="feature-card">
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>💬</div>
            <h4 style={{ color: '#14213d', fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', marginTop: 0 }}>Two-Way WhatsApp Bot</h4>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '15px', margin: 0 }}>
              Send automated payment reminders and allow customers to instantly check their Sale Order status simply by messaging your business number.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>📸</div>
            <h4 style={{ color: '#14213d', fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', marginTop: 0 }}>Smart Receipt Scanner</h4>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '15px', margin: 0 }}>
              Avoid manual typing. Snap a picture of a vendor invoice and let our OCR text extraction instantly pull taxable values and GST for quick entry.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>⚙️</div>
            <h4 style={{ color: '#14213d', fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', marginTop: 0 }}>Predictive Maintenance</h4>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '15px', margin: 0 }}>
              Stop relying on fixed schedules. Our background logic calculates historical breakdown data to warn you before a machine fails.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="feature-card">
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>📈</div>
            <h4 style={{ color: '#14213d', fontSize: '22px', fontWeight: 'bold', marginBottom: '15px', marginTop: 0 }}>Reverse Explosion Math</h4>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '15px', margin: 0 }}>
              Input your target production goals and instantly generate exact raw material deficits, total man-hours required, and accurate cost estimates.
            </p>
          </div>

        </div>
      </div>

      {/* NEW WHITE FOOTER SECTION */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e5e5e5', padding: '30px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', zIndex: 20 }}>
        
        {/* Copyright */}
        <div style={{ color: '#666' }}>
          &copy; {new Date().getFullYear()} Telos Industrial ERP. All rights reserved.
        </div>

        {/* Made with Love by Code Killers */}
        <div style={{ fontWeight: 'bold', letterSpacing: '0.5px', color: '#14213d' }}>
          Made with <span style={{ color: '#fca311', fontSize: '16px' }}>❤️</span> by Code killers
        </div>

        {/* Legal Links */}
        <div style={{ display: 'flex', gap: '25px' }}>
          <a href="#" className="footer-link">Terms & Conditions</a>
          <a href="#" className="footer-link">Privacy Policy</a>
        </div>

      </footer>

    </div>
  );
};

export default HomePage;