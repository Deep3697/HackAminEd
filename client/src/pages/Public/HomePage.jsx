import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Image Imports
import slide1Image from '../../assets/slide-1.avif';
import slide2Image from '../../assets/slide-2.avif';
import slide3Image from '../../assets/slide-3.avif';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // State variables to control when the pop-ups show
  const [showAbout, setShowAbout] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

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
    <div style={{ fontFamily: "'Inter', sans-serif", width: '100vw', minHeight: '100vh', overflowX: 'hidden', overflowY: 'auto', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', position: 'relative' }}>

      {/* CSS For Animations & Grid */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
          
          @keyframes glowT {
            0% { text-shadow: 0 0 0px #fca311; }
            50% { text-shadow: 0 0 20px #fca311, 0 0 30px #fca311; }
            100% { text-shadow: 0 0 10px #fca311; }
          }
          @keyframes pulseT {
            0% { text-shadow: 0 0 10px #fca311; transform: scale(1); }
            50% { text-shadow: 0 0 25px #fca311; transform: scale(1.05); }
            100% { text-shadow: 0 0 10px #fca311; transform: scale(1); }
          }
          @keyframes slideOutElos {
            0% { transform: translateX(-100%); opacity: 0; }
            70% { transform: translateX(5%); opacity: 1; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes modalFadeIn {
            0% { opacity: 0; transform: translateY(-20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .footer-link {
            color: #888;
            text-decoration: none;
            transition: color 0.3s ease;
          }
          .footer-link:hover {
            color: #fca311;
          }
          .feature-card {
            padding: 35px 30px;
            border: 1px solid rgba(0,0,0,0.05);
            border-radius: 16px;
            background-color: #ffffff;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 10px 40px rgba(0,0,0,0.04);
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          .feature-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 50px rgba(0,0,0,0.08);
          }
          .faq-question {
            font-weight: 800;
            color: #14213d;
            margin-top: 20px;
            margin-bottom: 5px;
            font-size: 16px;
          }
          .faq-answer {
            color: #666;
            line-height: 1.6;
            font-size: 15px;
            margin-bottom: 20px;
            border-bottom: 1px solid #e5e5e5;
            padding-bottom: 15px;
          }
          
          .glass-panel {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 50px;
            max-width: 650px;
          }
        `}
      </style>

      {/* TOP HEADER SECTION */}
      <header style={{ backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 50px', zIndex: 20, position: 'sticky', top: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', cursor: 'pointer', overflow: 'hidden', padding: '10px 15px', margin: '-10px -15px' }}>
            <span style={{ fontSize: '42px', fontWeight: '900', color: '#fca311', animation: 'glowT 1.5s ease-out forwards, pulseT 3s infinite ease-in-out 1.5s', lineHeight: '1', zIndex: 2, position: 'relative' }}>T</span>
            <div style={{ overflow: 'hidden', display: 'inline-block', paddingRight: '10px' }}>
              <span style={{ fontSize: '36px', fontWeight: '900', color: '#14213d', lineHeight: '1', letterSpacing: '-1px', display: 'inline-block', animation: 'slideOutElos 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}>elos</span>
            </div>
          </div>
          <span style={{ color: '#fca311', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', marginTop: '4px' }}>
            Nurturing the heartbeat of your industry.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => navigate('/auth')} style={{ padding: '10px 28px', backgroundColor: '#ffffff', color: '#14213d', border: '2px solid #14213d', borderRadius: '30px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s' }}>
            Log in
          </button>
          <button onClick={() => navigate('/auth')} style={{ padding: '10px 28px', backgroundColor: '#fca311', color: '#14213d', border: 'none', borderRadius: '30px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s' }}>
            Sign up
          </button>
        </div>
      </header>

      {/* HERO SLIDER SECTION */}
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
            {/* Darker overlay to make glassmorphism pop */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(20, 33, 61, 0.75)' }}></div>
          </div>
        ))}

        <div style={{ position: 'absolute', top: '50%', left: '8%', transform: 'translateY(-50%)', zIndex: 10, color: '#ffffff' }}>
          <div className="glass-panel">
            <p style={{ fontSize: '14px', letterSpacing: '2px', fontWeight: '800', color: '#fff', borderBottom: '2px solid #fca311', display: 'inline-block', paddingBottom: '4px', marginBottom: '20px', textTransform: 'uppercase' }}>
              {slides[currentSlide].subtitle}
            </p>
            <h1 style={{ fontSize: '56px', fontWeight: '900', margin: '0 0 20px 0', lineHeight: '1.1', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
              {slides[currentSlide].title}
            </h1>
            <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '40px', color: 'rgba(255,255,255,0.9)', fontWeight: '400' }}>
              {slides[currentSlide].description}
            </p>

            <div style={{ display: 'flex', gap: '20px' }}>
              <button onClick={() => setShowAbout(true)} style={{ padding: '14px 35px', backgroundColor: '#fca311', color: '#14213d', border: 'none', fontWeight: '800', fontSize: '14px', cursor: 'pointer', borderRadius: '8px', boxShadow: '0 4px 15px rgba(252, 163, 17, 0.4)', transition: 'transform 0.2s' }}>
                ABOUT US
              </button>
              <button onClick={() => setShowFAQ(true)} style={{ padding: '14px 35px', backgroundColor: 'transparent', color: '#ffffff', border: '2px solid #ffffff', fontWeight: '800', fontSize: '14px', cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s' }}>
                FAQS
              </button>
            </div>
          </div>
        </div>

        {/* Arrows and Dots */}
        <button onClick={prevSlide} style={{ position: 'absolute', top: '50%', left: '25px', transform: 'translateY(-50%)', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', fontSize: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>&#10094;</button>
        <button onClick={nextSlide} style={{ position: 'absolute', top: '50%', right: '25px', transform: 'translateY(-50%)', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', fontSize: '18px', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>&#10095;</button>

        <div style={{ position: 'absolute', bottom: '30px', width: '100%', display: 'flex', justifyContent: 'center', gap: '12px', zIndex: 10 }}>
          {slides.map((_, index) => (
            <div key={index} style={{ width: '35px', height: '6px', borderRadius: '3px', backgroundColor: index === currentSlide ? '#fca311' : 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => setCurrentSlide(index)}></div>
          ))}
        </div>
      </div>

      {/* SCROLLABLE WARM GRADIENT SECTION: Smart Features */}
      <div style={{ padding: '100px 10%', background: 'linear-gradient(180deg, #fdfdfd 0%, #fffcf5 100%)' }}>
        <div style={{ textAlign: 'center', marginBottom: '70px' }}>
          <h3 style={{ color: '#fca311', fontWeight: '800', letterSpacing: '2px', fontSize: '14px', margin: '0 0 15px 0', textTransform: 'uppercase' }}>BEYOND TRADITIONAL ERP</h3>
          <h2 style={{ color: '#14213d', fontSize: '46px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>Smart Automations & Integrations</h2>
          <p style={{ color: '#666', fontSize: '18px', maxWidth: '600px', margin: '20px auto 0 auto', lineHeight: '1.6' }}>
            We are building cutting-edge tools to reduce manual entry and keep you instantly connected to your clients and factory floor.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px' }}>
          <div className="feature-card">
            <div style={{ width: '50px', height: '50px', backgroundColor: '#fff4eb', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>💬</div>
            <h4 style={{ color: '#14213d', fontSize: '24px', fontWeight: '900', margin: 0, lineHeight: '1.2' }}>Two-Way <br />WhatsApp Bot</h4>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '14px', margin: 0 }}>Send automated payment reminders and allow customers to instantly check their Sale Order status simply by messaging your business number.</p>
          </div>
          <div className="feature-card">
            <div style={{ width: '50px', height: '50px', backgroundColor: '#fff4eb', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>📸</div>
            <h4 style={{ color: '#14213d', fontSize: '24px', fontWeight: '900', margin: 0, lineHeight: '1.2' }}>Smart Receipt Scanner</h4>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '14px', margin: 0 }}>Avoid manual typing. Snap a picture of a vendor invoice and let our OCR text extraction instantly pull taxable values and GST for quick entry.</p>
          </div>
          <div className="feature-card">
            <div style={{ width: '50px', height: '50px', backgroundColor: '#fff4eb', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>⚙️</div>
            <h4 style={{ color: '#14213d', fontSize: '24px', fontWeight: '900', margin: 0, lineHeight: '1.2' }}>Predictive Maintenance</h4>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '14px', margin: 0 }}>Stop relying on fixed schedules. Our background logic calculates historical breakdown data to warn you before a machine fails.</p>
          </div>
          <div className="feature-card">
            <div style={{ width: '50px', height: '50px', backgroundColor: '#fff4eb', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>📈</div>
            <h4 style={{ color: '#14213d', fontSize: '24px', fontWeight: '900', margin: 0, lineHeight: '1.2' }}>Reverse <br />Explosion Math</h4>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '14px', margin: 0 }}>Input your target production goals and instantly generate exact raw material deficits, total man-hours required, and accurate cost estimates.</p>
          </div>
        </div>
      </div>

      {/* WHITE FOOTER SECTION */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e5e5e5', padding: '30px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', zIndex: 20 }}>
        <div style={{ color: '#888' }}>&copy; {new Date().getFullYear()} Telos Industrial ERP. All rights reserved.</div>
        <div style={{ fontWeight: '800', letterSpacing: '0.5px', color: '#14213d', display: 'flex', alignItems: 'center', gap: '5px' }}>
          Made with <svg width="16" height="16" viewBox="0 0 24 24" fill="#fca311" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> by Code killers
        </div>
        <div style={{ display: 'flex', gap: '30px' }}>
          <a href="#" className="footer-link">Terms & Conditions</a>
          <a href="#" className="footer-link">Privacy Policy</a>
        </div>
      </footer>

      {/* --- MODALS (POP-UPS) --- */}

      {/* ABOUT US MODAL */}
      {showAbout && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(20, 33, 61, 0.85)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '50px', borderRadius: '16px', maxWidth: '600px', width: '90%', animation: 'modalFadeIn 0.3s ease-out', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            {/* Close Button */}
            <button onClick={() => setShowAbout(false)} style={{ position: 'absolute', top: '20px', right: '25px', background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#888' }}>&times;</button>

            <h2 style={{ color: '#14213d', borderBottom: '3px solid #fca311', display: 'inline-block', paddingBottom: '8px', marginTop: 0, fontWeight: '900' }}>About Telos</h2>
            <p style={{ color: '#555', lineHeight: '1.8', fontSize: '16px', marginTop: '25px' }}>
              Telos is the central nervous system for modern manufacturing. Built as a comprehensive 13-module powerhouse, we bridge the gap between your busy factory floor and your final financial statements.
            </p>
            <p style={{ color: '#555', lineHeight: '1.8', fontSize: '16px' }}>
              We don't just record data; we actively work for you. From our AI-driven OCR receipt scanning to our predictive "Reverse Explosion" mathematics, we eliminate the guesswork from your supply chain, allowing you to build your legacy with precision and speed.
            </p>
          </div>
        </div>
      )}

      {/* FAQS MODAL */}
      {showFAQ && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(20, 33, 61, 0.85)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(5px)' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '50px', borderRadius: '16px', maxWidth: '650px', width: '90%', maxHeight: '80vh', overflowY: 'auto', animation: 'modalFadeIn 0.3s ease-out', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

            {/* Close Button */}
            <button onClick={() => setShowFAQ(false)} style={{ position: 'absolute', top: '20px', right: '25px', background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#888' }}>&times;</button>

            <h2 style={{ color: '#14213d', borderBottom: '3px solid #fca311', display: 'inline-block', paddingBottom: '8px', marginTop: 0, fontWeight: '900' }}>Frequently Asked Questions</h2>

            <div className="faq-question">What is the "Reverse Explosion" feature?</div>
            <div className="faq-answer">It is our predictive simulation engine. You input a target goal (e.g., "Build 50 units"), and the system instantly calculates the exact raw materials required, total man-hours needed, and cost estimates by checking your current Bill of Materials against live inventory.</div>

            <div className="faq-question">Does Telos handle external contract labor?</div>
            <div className="faq-answer">Yes! We have a dedicated Contractor Management module that keeps external labor entirely separate from your on-roll employees, automatically calculating payouts based on daily rates and overtime.</div>

            <div className="faq-question">How does the system help with Quality Control (QC)?</div>
            <div className="faq-answer">We enforce standard checks at every critical stage: Incoming goods (IQC), during live production (PQC), and a final audit before dispatch (PDI), ensuring nothing leaves the floor without approval.</div>

            <div className="faq-question">Can it send automated reminders to clients?</div>
            <div className="faq-answer">Absolutely. Our Sales Hub integrates directly with a Two-Way WhatsApp bot and email triggers to automatically chase down pending payments and update clients on their dispatch status.</div>
          </div>
        </div>
      )}

    </div>
  );
};

export default HomePage;