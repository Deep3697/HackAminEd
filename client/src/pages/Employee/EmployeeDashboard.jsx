import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Gets the logged-in employee

  // Fallback if employeeType isn't set
  const department = user?.employeeType && user.employeeType !== '-' 
    ? user.employeeType 
    : 'General Operations';

  // --- DYNAMIC CONFIGURATION DICTIONARY ---
  // This changes the hubs and tasks based exactly on what type of employee logged in
  const dashboardConfig = {
    'Sales & Purchase': {
      hubs: [
        { name: 'Sales Hub', path: '/sales', icon: '📈' },
        { name: 'Purchase Hub', path: '/purchase', icon: '🛒' },
        { name: 'Reports', path: '/reports', icon: '📊' }
      ],
      tasks: [
        { id: 'PO-992', title: 'Approve Vendor Purchase Order', status: 'Urgent' },
        { id: 'QT-104', title: 'Send Quote to Alpha Industries', status: 'Normal' }
      ]
    },
    'HR & Payroll': {
      hubs: [
        { name: 'HR & Payroll', path: '/hr-payroll', icon: '👥' },
        { name: 'Statutory Hub', path: '/statutory', icon: '⚖️' },
        { name: 'Reports', path: '/reports', icon: '📊' }
      ],
      tasks: [
        { id: 'HR-11', title: 'Process October Salary Run', status: 'Urgent' },
        { id: 'HR-12', title: 'Review Leave Applications (3)', status: 'Normal' }
      ]
    },
    'Transport & Logistics': {
      hubs: [
        { name: 'Inventory Hub', path: '/inventory', icon: '📦' },
        { name: 'Logistics Hub', path: '/logistics', icon: '🚛' },
        { name: 'Assets Hub', path: '/assets', icon: '🏗️' }
      ],
      tasks: [
        { id: 'TR-402', title: 'Dispatch Fleet to Gujarat Plant', status: 'Urgent' },
        { id: 'IN-909', title: 'Restock Aluminium Coils', status: 'Normal' }
      ]
    },
    'Production & Quality': {
      hubs: [
        { name: 'Production Hub', path: '/production', icon: '⚙️' },
        { name: 'Quality Hub', path: '/quality', icon: '🔬' },
        { name: 'Maintenance', path: '/maintenance', icon: '🔧' }
      ],
      tasks: [
        { id: 'PR-882', title: 'Review Job Card #882', status: 'Normal' },
        { id: 'QC-101', title: 'Perform QC on Batch B-44', status: 'Urgent' }
      ]
    },
    'General Operations': {
      hubs: [
        { name: 'My Dashboard', path: '/employee', icon: '🏠' }
      ],
      tasks: [
        { id: 'GEN-1', title: 'Complete System Onboarding', status: 'Normal' }
      ]
    }
  };

  // Grab the specific data for the logged-in user, or default to General
  const currentView = dashboardConfig[department] || dashboardConfig['General Operations'];

  return (
    <div style={{ padding: '40px 60px', flex: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>
        {`
          .dashboard-card { background: #fff; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); padding: 30px; }
          
          .dynamic-hub-btn { 
            display: flex; flex-direction: column; align-items: center; justify-content: center; 
            padding: 25px 15px; background: #ffffff; border: 2px solid #f0f0f0; border-radius: 12px; 
            cursor: pointer; transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1); 
          }
          .dynamic-hub-btn:hover { 
            background: #14213d; color: #fca311; transform: translateY(-5px); 
            box-shadow: 0 10px 20px rgba(20,33,61,0.1); border-color: #14213d; 
          }
          
          .task-row { padding: 15px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; }
          .task-row:last-child { border-bottom: none; }
          .task-row:hover { background: #f8f9fa; padding-left: 10px; border-radius: 6px; }
          
          .priority-tag { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
          .tag-urgent { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
          .tag-normal { background: #d1fae5; color: #047857; border: 1px solid #6ee7b7; }
        `}
      </style>

      {/* Header Section */}
      <div style={{ marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <h2 style={{ color: '#14213d', margin: '0 0 5px 0', fontSize: '32px', fontWeight: '800' }}>
          Welcome back, {user?.fullName?.split(' ')[0] || 'Employee'}
        </h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
          <span style={{ background: '#14213d', color: '#fca311', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
            {department}
          </span>
          <span style={{ color: '#666', fontSize: '14px', fontWeight: '600' }}>
            Department Workspace
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        
        {/* Left Column: Dynamic Modules */}
        <div>
          <h3 style={{ color: '#14213d', marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>Your Core Modules</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
            {currentView.hubs.map((hub, idx) => (
              <div key={idx} className="dynamic-hub-btn" onClick={() => navigate(hub.path)}>
                <span style={{ fontSize: '36px', marginBottom: '12px' }}>{hub.icon}</span>
                <span style={{ fontWeight: '800', fontSize: '13px', textAlign: 'center', color: 'inherit' }}>{hub.name}</span>
              </div>
            ))}
          </div>

          <div className="dashboard-card" style={{ background: '#f8f9ff', border: '1px solid #e0e7ff' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#14213d', fontSize: '16px', fontWeight: '800' }}>📢 Department Announcements</h3>
            <p style={{ color: '#4f46e5', fontSize: '14px', lineHeight: '1.6', fontWeight: '600', margin: 0 }}>
              {department === 'HR & Payroll' ? "Reminder: End-of-month appraisals are due this Friday." :
               department === 'Transport & Logistics' ? "Weather alert: Expect delays on northern delivery routes tomorrow." :
               department === 'Production & Quality' ? "Machine #4 is scheduled for preventive maintenance at 14:00." :
               "Quarterly review meeting is scheduled for next week. Please prepare your departmental reports."}
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Active Tasks */}
        <div className="dashboard-card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#14213d', fontSize: '16px', fontWeight: '800' }}>My Pending Tasks</h3>
            <span style={{ background: '#fca311', color: '#14213d', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' }}>
              {currentView.tasks.length} New
            </span>
          </div>
          
          {currentView.tasks.map((task, idx) => (
            <div key={idx} className="task-row">
              <div>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#14213d' }}>{task.title}</div>
                <div style={{ fontSize: '12px', color: '#888', fontWeight: '600', marginTop: '4px' }}>Ref: {task.id}</div>
              </div>
              <span className={`priority-tag ${task.status === 'Urgent' ? 'tag-urgent' : 'tag-normal'}`}>
                {task.status}
              </span>
            </div>
          ))}

          <button style={{ width: '100%', marginTop: '25px', padding: '12px', background: 'transparent', border: '2px solid #14213d', color: '#14213d', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', transition: '0.2s' }}
            onMouseOver={(e) => { e.target.style.background = '#14213d'; e.target.style.color = '#fff'; }}
            onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#14213d'; }}
          >
            Open Task Manager →
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmployeeDashboard;   