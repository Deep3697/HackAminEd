import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Ref for the "Click Anywhere to Close" logic
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/auth'); 
  };

  // Close dropdown if user clicks anywhere else on the screen
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const adminMenus = [
    { name: 'Command Center', path: '/admin' },
    { name: 'Users', path: '/admin/users' },
    { name: 'Sales & Purchase', path: '/sales' },
    { name: 'Production & QC', path: '/production' },
    { name: 'Inventory & Logistics', path: '/inventory' },
    { name: 'Finance & Statutory', path: '/finance' },
    { name: 'HR & Payroll', path: '/hr-payroll' },
    { name: 'Maintenance & Assets', path: '/maintenance' },
    { name: 'Simulation Tool', path: '/simulation' }
  ];

  const employeeMenus = [
    { name: 'My Workspace', path: '/employee' },
    { name: 'Sales & Purchase', path: '/sales' },
    { name: 'Production & QC', path: '/production' },
    { name: 'Inventory & Logistics', path: '/inventory' }
  ];

  const contractorMenus = [
    { name: 'Vendor Portal', path: '/contractor' },
    { name: 'Purchase Orders', path: '/purchase' },
    { name: 'Quality Specs', path: '/quality' }
  ];

  const userMenus = [
    { name: 'Client Portal', path: '/dashboard' },
    { name: 'New Orders', path: '/sales' },
    { name: 'Invoices', path: '/finance' }
  ];

  let currentMenus = [];
  if (user?.role === 'admin') currentMenus = adminMenus;
  else if (user?.role === 'employee') currentMenus = employeeMenus;
  else if (user?.role === 'contractor') currentMenus = contractorMenus;
  else currentMenus = userMenus;

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

          .topbar-wrapper {
            font-family: 'Plus Jakarta Sans', sans-serif;
          }

          @keyframes dropDownIn {
            from { opacity: 0; transform: translateY(-10px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          .classic-nav {
            background-color: #fca311;
            display: flex;
            padding: 0 24px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow-x: auto;
            scrollbar-width: none;
            width: 100%;
            box-sizing: border-box;
          }
          .classic-nav::-webkit-scrollbar { display: none; }

          .nav-item {
            padding: 15px 20px;
            color: #14213d;
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            cursor: pointer;
            border-right: 1px solid rgba(20, 33, 61, 0.1);
            transition: all 0.2s ease;
            white-space: nowrap;
          }
          .nav-item:hover { background-color: #14213d; color: #ffffff; }
          .nav-item.active { background-color: #14213d; color: #ffffff; box-shadow: inset 0 -3px 0 #ffffff; }

          /* --- REFINED DROPDOWN STYLES --- */
          .profile-trigger {
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            padding: 6px 12px;
            border-radius: 12px;
            transition: background 0.2s;
          }
          .profile-trigger:hover { background: #f8f9ff; }
          
          .dropdown-container {
            position: absolute;
            top: 75px;
            right: 50px;
            background: #ffffff;
            border: 1px solid rgba(20,33,61,0.08);
            border-radius: 14px;
            box-shadow: 0 15px 40px rgba(20,33,61,0.12);
            width: 230px;
            z-index: 9999;
            animation: dropDownIn 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            padding: 8px;
          }
          
          .dropdown-btn {
            padding: 12px 16px;
            font-size: 14px;
            color: #14213d;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            border-radius: 8px;
            transition: all 0.2s;
          }
          .dropdown-btn:hover { background: rgba(252, 163, 17, 0.1); color: #fca311; }
          
          .dropdown-btn.logout { color: #e74c3c; margin-top: 4px; }
          .dropdown-btn.logout:hover { background: #fee2e2; color: #b91c1c; }

          .icon-box {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            color: #14213d;
          }
          .dropdown-btn:hover .icon-box { color: #fca311; }
          .dropdown-btn.logout:hover .icon-box { color: #b91c1c; }
        `}
      </style>

      <div className="topbar-wrapper">
        <header style={{ 
          backgroundColor: '#ffffff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '12px 24px', 
          position: 'relative',
          borderBottom: '1px solid #f0f0f0',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          
          {/* Logo Section */}
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'baseline', cursor: 'pointer' }}>
            <span style={{ fontSize: '45px', fontWeight: '900', color: '#fca311', lineHeight: '1' }}>T</span>
            <span style={{ fontSize: '35px', fontWeight: '800', color: '#14213d', lineHeight: '1' }}>elos</span>
          </div>

          {/* Profile Area */}
          <div className="profile-trigger" ref={dropdownRef} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '700', color: '#14213d', fontSize: '15px' }}>{user?.fullName || "Admin User"}</div>
              <div style={{ color: '#fca311', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role || "Administrator"}</div>
            </div>
            
            <div style={{ 
              width: '42px', height: '42px', 
              backgroundColor: '#14213d', color: '#fca311', 
              borderRadius: '50%', border: '2px solid #fca311',
              display: 'flex', justifyContent: 'center', alignItems: 'center', 
              fontWeight: '800', fontSize: '18px' 
            }}>
              {user?.fullName ? user.fullName.charAt(0) : "T"}
            </div>

            <span style={{ fontSize: '10px', color: '#999', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>▼</span>

            {/* THE DROPDOWN */}
            {isDropdownOpen && (
              <div className="dropdown-container">
                <div className="dropdown-btn" onClick={() => navigate('/admin/users')}>
                  <div className="icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                  Account Settings
                </div>
                <div style={{ height: '1px', background: '#f0f0f0', margin: '4px 8px' }} />
                <div className="dropdown-btn logout" onClick={handleLogout}>
                  <div className="icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  </div>
                  Sign Out
                </div>
              </div>
            )}
          </div>
        </header>

        <nav className="classic-nav">
          {currentMenus.map((menu, index) => {
            const isActive = location.pathname === menu.path;
            return (
              <div 
                key={index} 
                className={`nav-item ${isActive ? 'active' : ''}`} 
                onClick={() => navigate(menu.path)}
              >
                {menu.name}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default TopBar;