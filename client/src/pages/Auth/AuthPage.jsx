import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../../services/authService';
import { useAuth } from '../../store/AuthContext';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [focused, setFocused] = useState('');
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [submitted, setSubmitted] = useState(false);
  const [viewAnimKey, setViewAnimKey] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouse = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const validate = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!isLoginView) {
      if (!formData.fullName || formData.fullName.trim() === '') newErrors.fullName = 'Name is required';
      if (!formData.phone || formData.phone.length < 10) newErrors.phone = 'Enter a valid phone number (min 10 digits)';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (!formData.address) newErrors.address = 'Address is required for logistics setup';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });

    // Auto-fill WhatsApp if phone is entered and they want to use the same number
    if (name === 'phone' && value.length >= 10) {
      setFormData(prev => ({ ...prev, [name]: value, whatsapp: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitted(true);
    setServerError('');

    try {
      if (isLoginView) {
        // LOGIN
        const response = await loginUser({
          email: formData.email,
          password: formData.password
        });

        if (response.success) {
          login(response.user, response.token);
          
          // --- THE NEW TRAFFIC COP LOGIC ---
          const role = response.user.role;
          if (role === 'admin') {
            navigate('/admin');
          } else if (role === 'employee') {
            navigate('/employee'); 
          } else if (role === 'contractor') {
            navigate('/contractor'); // Sends raw material suppliers to their specific view
          } else {
            navigate('/dashboard'); // Default regular user view
          }
        }
      } else {
        // REGISTER
        // Map frontend fields to backend expected names:
        // phone -> contactNo, whatsapp -> whatsappNumber
        const response = await registerUser({
          fullName: formData.fullName,
          contactNo: formData.phone,
          whatsappNumber: formData.whatsapp,
          email: formData.email,
          address: formData.address,
          password: formData.password
        });

        if (response.success) {
          alert('Registration successful! Please log in.');
          setSubmitted(false);
          switchView(); // toggle to login view
        }
      }
    } catch (error) {
      setSubmitted(false);
      // Show error from backend or a generic fallback
      setServerError(error.response?.data?.message || 'An error occurred. Please try again.');
    }
  };

  const switchView = () => {
    setFormData({ fullName: '', phone: '', whatsapp: '', address: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setServerError('');
    setIsLoginView(!isLoginView);
    setViewAnimKey((prev) => prev + 1);
  };

  const loginFields = [
    { name: 'email', type: 'email', label: 'Work Email', placeholder: 'you@company.com' },
    { name: 'password', type: 'password', label: 'Password', placeholder: '********' },
  ];

  const registerFields = [
    { name: 'fullName', type: 'text', label: 'Full Name', placeholder: 'John Smith' },
    { name: 'phone', type: 'tel', label: 'Phone Number', placeholder: '98765 43210' },
    { name: 'whatsapp', type: 'tel', label: 'WhatsApp (For ERP Alerts)', placeholder: '98765 43210', hint: 'Auto-fills with phone number' },
    { name: 'email', type: 'email', label: 'Official Email', placeholder: 'you@company.com' },
    { name: 'address', type: 'text', label: 'Factory/Office Address', placeholder: 'Street, City, Pincode' },
    { name: 'password', type: 'password', label: 'Set Password', placeholder: '********' },
    { name: 'confirmPassword', type: 'password', label: 'Confirm Password', placeholder: '********' },
  ];

  const fields = isLoginView ? loginFields : registerFields;

  const completion = useMemo(() => {
    const filled = fields.filter((field) => String(formData[field.name] || '').trim().length > 0).length;
    return fields.length ? Math.round((filled / fields.length) * 100) : 0;
  }, [fields, formData]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        minHeight: '100vh',
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
        background: '#f8f6ff'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        /* Use default native scrollbars for the whole page */
        html, body { overflow-y: auto; overflow-x: hidden; }

        /* make sure glass-card scrollbar stays visible */
        .glass-card::-webkit-scrollbar { width: 6px; }
        .glass-card::-webkit-scrollbar-track { background: transparent; }
        .glass-card::-webkit-scrollbar-thumb { background: rgba(252, 163, 17, 0.6); border-radius: 4px; }
        .glass-card::-webkit-scrollbar-thumb:hover { background: rgba(252, 163, 17, 0.9); }

        .auth-root {
          font-family: 'Plus Jakarta Sans', sans-serif;
          animation: fadeIn 0.7s ease both;
        }

        .grid-bg {
          animation: gridPulse 7s ease-in-out infinite;
        }

        .ambient-orb {
          position: fixed;
          width: 38vw;
          height: 38vw;
          max-width: 460px;
          max-height: 460px;
          min-width: 220px;
          min-height: 220px;
          border-radius: 50%;
          filter: blur(48px);
          opacity: 0.26;
          pointer-events: none;
          z-index: 1;
          animation: floatOrb 14s ease-in-out infinite;
        }

        .ambient-orb.left {
          top: -10vh;
          left: -10vw;
          background: radial-gradient(circle, rgba(252,163,17,0.42) 0%, rgba(252,163,17,0.06) 65%, transparent 100%);
        }

        .ambient-orb.right {
          bottom: -15vh;
          right: -10vw;
          background: radial-gradient(circle, rgba(20,33,61,0.35) 0%, rgba(20,33,61,0.06) 65%, transparent 100%);
          animation-delay: -5s;
        }

        .hover-light {
          transition: background 0.24s ease;
        }

        .auth-nav {
          animation: slideDown 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .left-panel {
          animation: slideInLeft 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .headline {
          white-space: pre-line;
          animation: softRise 0.8s ease both;
        }

        .chip {
          background: #fff;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #fca311;
          border: 1px solid rgba(252,163,17,0.2);
          transform: translateY(8px);
          opacity: 0;
          animation: chipIn 0.5s ease forwards;
        }

        .glass-wrap {
          perspective: 1200px;
          overflow: hidden; /* clip any scrollbar spilling outside */
        }

        .glass-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,1);
          box-shadow: 0 20px 50px rgba(20,33,61,0.08);
          transform-style: preserve-3d;
          will-change: transform, box-shadow;
          animation: cardEntry 0.65s cubic-bezier(0.2, 0.8, 0.2, 1) both;
          transition: transform 0.28s ease, box-shadow 0.28s ease;
          box-sizing: border-box;
          padding: 20px 30px 40px;
          scrollbar-width: thin;
          scrollbar-color: rgba(252,163,17,0.6) transparent;
        }
        
        .glass-card::-webkit-scrollbar {
          width: 6px;
        }
        
        .glass-card::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .glass-card::-webkit-scrollbar-thumb {
          background: rgba(252, 163, 17, 0.3);
          border-radius: 3px;
        }
        
        .glass-card::-webkit-scrollbar-thumb:hover {
          background: rgba(252, 163, 17, 0.6);
        }

        .glass-card:hover {
          transform: translateY(-2px) rotateX(2deg) rotateY(-2deg);
          box-shadow: 0 28px 70px rgba(20,33,61,0.14);
        }

        .form-shell {
          animation: formSwap 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .field-wrap {
          opacity: 0;
          transform: translateY(12px) scale(0.99);
          animation: fieldIn 0.4s ease forwards;
        }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 6px;
          transition: color 0.18s ease, transform 0.18s ease;
        }

        .field-label.active {
          color: #fca311;
          transform: translateX(2px);
        }

        .field-label.idle {
          color: #666;
        }

        .telos-field {
          width: 100%;
          padding: 12px 16px;
          background: #fff;
          border: 1.5px solid rgba(20,33,61,0.1);
          border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s, background-color 0.2s;
        }

        .telos-field:hover {
          transform: translateY(-1px);
          border-color: rgba(20,33,61,0.22);
        }

        .telos-field:focus {
          border-color: #fca311;
          box-shadow: 0 0 0 3px rgba(252,163,17,0.12);
        }

        .error-text {
          color: #ff4d4f;
          font-size: 11px;
          margin-top: 4px;
          font-weight: 600;
          animation: shakeX 0.24s ease;
        }

        .progress-track {
          width: 100%;
          height: 7px;
          border-radius: 99px;
          background: rgba(20,33,61,0.08);
          overflow: hidden;
          margin: 0 0 18px;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #fca311 0%, #ffd18a 100%);
          transition: width 0.35s ease;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 10px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease;
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255,255,255,0.12), transparent 45%, rgba(255,255,255,0.08));
          transform: translateX(-120%);
          transition: transform 0.4s ease;
          z-index: 0;
        }

        .submit-btn span {
          position: relative;
          z-index: 1;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.03);
        }

        .submit-btn:hover::before {
          transform: translateX(0%);
        }

        .submit-btn:active {
          transform: translateY(0px) scale(0.995);
        }

        .submit-btn.processing {
          animation: pulseButton 1.3s ease infinite;
        }

        .nav-btn {
          padding: 8px 20px;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease;
        }

        .nav-btn:hover {
          transform: translateY(-1px);
        }

        .switch-btn {
          background: none;
          border: none;
          color: #fca311;
          font-weight: 700;
          margin-left: 5px;
          cursor: pointer;
          text-decoration: underline;
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .switch-btn:hover {
          transform: translateX(2px);
          color: #dd8e04;
        }

        .logo-t {
          animation: none;
          text-shadow: 0 0 10px #fca311, 0 0 20px #fca311, 0 0 30px #fca311, 0 0 40px #fca311;
          filter: brightness(1.2);
        }

        .logo-elos {
          animation: dynamicPulse 3s ease-in-out infinite;
        }

        .logo-tagline {
          animation: fadeInOut 4s ease-in-out infinite;
        }

        @keyframes dynamicPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-14px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes softRise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes chipIn {
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes cardEntry {
          from { opacity: 0; transform: translateY(18px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes formSwap {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fieldIn {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes shakeX {
          0% { transform: translateX(0); }
          33% { transform: translateX(-3px); }
          66% { transform: translateX(3px); }
          100% { transform: translateX(0); }
        }

        @keyframes pulseButton {
          0%, 100% { box-shadow: 0 8px 20px rgba(34,197,94,0.25); }
          50% { box-shadow: 0 12px 30px rgba(34,197,94,0.45); }
        }

        @keyframes gridPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.86; }
        }

        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(22px, -16px) scale(1.05); }
        }

        @media (max-width: 1024px) {
          .glass-card:hover {
            transform: translateY(-1px);
          }
        }

        @media (max-width: 900px) {
          .left-panel,
          .glass-wrap {
            min-width: 100% !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div className="auth-root">
        <div
          className="grid-bg"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            backgroundImage: 'radial-gradient(circle, rgba(20,33,61,0.05) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />
        <div className="ambient-orb left" />
        <div className="ambient-orb right" />
        <div
          className="hover-light"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(252,163,17,0.11) 0%, transparent 55%)`
          }}
        />

        <nav
          className="auth-nav"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 200,
            padding: '15px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(20,33,61,0.05)'
          }}
        >
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="logo-t" style={{ fontSize: '42px', fontWeight: '900', color: '#fca311', lineHeight: '0.9', letterSpacing: '-2px' }}>T</span>
              <span className="logo-elos" style={{ fontSize: '32px', fontWeight: '800', color: '#14213d', lineHeight: '0.9' }}>elos</span>
            </div>
            <span className="logo-tagline" style={{ fontSize: '10px', fontWeight: '700', color: '#fca311', letterSpacing: '0.5px', marginLeft: '2px' }}>Nurturing the heartbeat of your industry</span>
          </div>
          <div style={{ display: 'flex', background: 'rgba(20,33,61,0.05)', borderRadius: '100px', padding: '4px' }}>
            <button className="nav-btn" onClick={() => !isLoginView && switchView()} style={{ background: isLoginView ? '#fca311' : 'transparent', color: isLoginView ? '#14213d' : '#999' }}>Sign In</button>
            <button className="nav-btn" onClick={() => isLoginView && switchView()} style={{ background: !isLoginView ? '#fca311' : 'transparent', color: !isLoginView ? '#14213d' : '#999' }}>Register</button>
          </div>
        </nav>

        <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', position: 'relative', zIndex: 10, flexWrap: 'wrap' }}>
          <div className="left-panel" style={{ flex: '1', minWidth: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px 60px' }}>
            <h1 className="headline" style={{ fontSize: '42px', fontWeight: '800', color: '#14213d', lineHeight: '1.2' }}>
              {isLoginView ? 'Your Factory,\nDigitized.' : 'Join the Industrial\nRevolution.'}
            </h1>
            <p style={{ marginTop: '20px', color: 'rgba(20,33,61,0.6)', lineHeight: '1.6', maxWidth: '400px' }}>
              Access all 13 modules including <strong>Reverse Explosion Forecasting</strong> and <strong>Statutory GST Compliance</strong> from one dashboard.
            </p>
            <div style={{ marginTop: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {['Sales', 'HR', 'Logistics', 'Finance'].map((tag, index) => (
                <span key={tag} className="chip" style={{ animationDelay: `${0.1 * index + 0.2}s` }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-wrap" style={{ flex: '1', minWidth: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '480px',
                borderRadius: '24px',
                padding: '10px 30px',
                transform: `perspective(1200px) rotateX(${((mousePos.y - 50) / 50) * -1.5}deg) rotateY(${((mousePos.x - 50) / 50) * 1.5}deg)`
              }}
            >
              <div key={viewAnimKey} className="form-shell">
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#14213d', marginBottom: '8px' }}>
                  {isLoginView ? 'Sign In' : 'Register Business'}
                </h2>
                <p style={{ fontSize: '13px', color: '#999', marginBottom: '14px' }}>
                  {isLoginView ? 'Welcome back! Please enter your work email.' : 'Setup your enterprise profile to begin.'}
                </p>

                <div className="progress-track" aria-hidden="true">
                  <div className="progress-fill" style={{ width: `${completion}%` }} />
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: isLoginView ? '1fr' : '1fr 1fr', gap: '12px' }}>
                    {fields.map((field, index) => (
                      <div
                        key={field.name}
                        className="field-wrap"
                        style={{
                          animationDelay: `${0.05 * index}s`,
                          gridColumn: (field.name === 'address' || field.name === 'fullName' || isLoginView) ? 'span 2' : 'span 1'
                        }}
                      >
                        <label className={`field-label ${focused === field.name ? 'active' : 'idle'}`}>
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          onFocus={() => setFocused(field.name)}
                          onBlur={() => setFocused('')}
                          placeholder={field.placeholder}
                          className="telos-field"
                          style={{ borderColor: errors[field.name] ? '#ff4d4f' : 'rgba(20,33,61,0.1)' }}
                        />
                        {field.hint && <p style={{ fontSize: '11px', color: '#999', marginTop: '3px', fontStyle: 'italic' }}>💡 {field.hint}</p>}
                        {errors[field.name] && <p className="error-text">{errors[field.name]}</p>}
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className={`submit-btn ${submitted ? 'processing' : ''}`}
                    disabled={submitted}
                    style={{
                      marginTop: '25px',
                      background: submitted ? '#22c55e' : '#14213d',
                      color: '#fff',
                      opacity: submitted ? 0.8 : 1,
                      boxShadow: submitted ? '0 8px 20px rgba(34,197,94,0.25)' : '0 8px 20px rgba(20,33,61,0.2)'
                    }}
                  >
                    <span>{submitted ? 'Processing...' : isLoginView ? 'Access Dashboard ->' : 'Complete Registration'}</span>
                  </button>

                  {serverError && (
                    <div style={{
                      marginTop: '15px',
                      padding: '10px',
                      background: 'rgba(255, 77, 79, 0.1)',
                      color: '#ff4d4f',
                      borderRadius: '8px',
                      fontSize: '13px',
                      textAlign: 'center',
                      fontWeight: '600'
                    }}>
                      {serverError}
                    </div>
                  )}
                </form>

                <p style={{ textAlign: 'center', fontSize: '13px', marginTop: '20px', color: '#999' }}>
                  {isLoginView ? "Don't have an account?" : 'Already registered?'}
                  <button onClick={switchView} className="switch-btn">
                    {isLoginView ? 'Create one now' : 'Sign in instead'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
