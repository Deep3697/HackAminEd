import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from '../Shared/topbar.jsx';
import Chatbot from '../Shared/ChatAssistant.jsx';
import { useAuth } from '../../store/AuthContext';

const DashboardLayout = () => {
  const { user } = useAuth(); // Get actual user from context

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', width: '100vw', minHeight: '100vh', backgroundColor: '#e5e5e5', display: 'flex', flexDirection: 'column' }}>
      
      {/* The Universal Top Bar */}
      <TopBar />

      {/* The specific page content (like AdminDashboard) will be injected right here */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet /> 
      </main>

      <Chatbot userRole={user?.role} />
    </div>
  );
};

export default DashboardLayout;