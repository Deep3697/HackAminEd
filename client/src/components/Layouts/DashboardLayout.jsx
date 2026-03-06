import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../Shared/topbar.jsx';

const DashboardLayout = () => {
  // Placeholder: Later, this will come from your backend/Redux store when a user logs in.
  const loggedInUser = {
    username: "Super Admin",
    role: "Admin" // Change this to "User" to test the dynamic menus!
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', width: '100vw', minHeight: '100vh', backgroundColor: '#e5e5e5', display: 'flex', flexDirection: 'column' }}>
      
      {/* The Universal Top Bar */}
      <TopBar user={loggedInUser} />

      {/* The specific page content (like AdminDashboard) will be injected right here */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet /> 
      </main>

    </div>
  );
};

export default DashboardLayout;