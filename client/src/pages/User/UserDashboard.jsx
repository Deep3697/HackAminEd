import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Gets the logged-in customer's data

  // Quick Actions for a Customer
  const customerActions = [
    { name: 'Place New Order', path: '/sales', icon: '🛍️' },
    { name: 'My Invoices', path: '/finance', icon: '🧾' },
    { name: 'Support Tickets', path: '/reports', icon: '🎧' },
  ];

  // Dummy Data: Active Order Tracking
  const activeOrder = {
    id: 'ORD-9921',
    product: 'Industrial Steel Pipes (100 units)',
    placedOn: 'Oct 25, 2023',
    estDelivery: 'Nov 02, 2023',
    currentStep: 3, // 1: Placed, 2: Processing, 3: Manufacturing, 4: Shipped, 5: Delivered
  };

  // Dummy Data: Past Order History
  const orderHistory = [
    { id: 'ORD-8802', date: 'Sep 15, 2023', items: 'Binding Chemicals (500L)', total: '₹45,000', status: 'Delivered' },
    { id: 'ORD-8750', date: 'Aug 02, 2023', items: 'Aluminium Sheets (20 units)', total: '₹1,20,000', status: 'Delivered' },
    { id: 'ORD-8611', date: 'Jul 10, 2023', items: 'Industrial Steel Pipes (50 units)', total: '₹3,50,000', status: 'Refunded' },
  ];

  return (
    <div style={{ padding: '30px 50px', flex: 1 }}>
      <style>
        {`
          .client-card { background: #fff; border: 1px solid #dcdcdc; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); padding: 25px; }
          .action-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
          .action-btn:hover { background: #14213d; color: #fca311; transform: translateY(-3px); box-shadow: 0 6px 15px rgba(20,33,61,0.1); border-color: #14213d; }
          
          .history-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 15px; }
          .history-table th { background: #f8f9fa; color: #666; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #eee; }
          .history-table td { padding: 15px 12px; border-bottom: 1px solid #eee; color: #14213d; }
          .history-table tr:hover { background: #f8f9fa; }

          /* Tracking Stepper Styles */
          .stepper-container { display: flex; justify-content: space-between; position: relative; margin-top: 30px; margin-bottom: 20px; }
          .stepper-line { position: absolute; top: 15px; left: 0; right: 0; height: 3px; background: #eee; z-index: 1; }
          .stepper-line-fill { position: absolute; top: 15px; left: 0; height: 3px; background: #27ae60; z-index: 2; transition: width 0.5s ease; }
          .step-item { position: relative; z-index: 3; display: flex; flex-direction: column; align-items: center; width: 80px; }
          .step-circle { width: 32px; height: 32px; border-radius: 50%; background: #fff; border: 3px solid #eee; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; transition: all 0.3s; }
          .step-circle.completed { border-color: #27ae60; background: #27ae60; color: #fff; }
          .step-circle.active { border-color: #fca311; color: #14213d; box-shadow: 0 0 0 4px rgba(252,163,17,0.2); }
          .step-label { font-size: 11px; font-weight: bold; color: #666; margin-top: 8px; text-align: center; text-transform: uppercase; }
          
          .status-pill { padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
          .pill-success { background: rgba(39, 174, 96, 0.1); color: #27ae60; border: 1px solid #27ae60; }
          .pill-error { background: rgba(231, 76, 60, 0.1); color: #c0392b; border: 1px solid #c0392b; }
        `}
      </style>

      {/* Header Profile Section */}
      <div style={{ marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ color: '#14213d', margin: '0 0 5px 0', fontSize: '28px' }}>
            Client Portal
          </h2>
          <p style={{ color: '#666', margin: 0, fontSize: '15px' }}>
            Welcome back, <span style={{ fontWeight: 'bold', color: '#14213d' }}>{user?.fullName || 'Valued Customer'}</span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button style={{ padding: '10px 20px', background: '#fca311', border: 'none', color: '#14213d', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
            + Request Quote
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        
        {/* Left Column: Quick Actions & Support */}
        <div>
          <h3 style={{ color: '#14213d', marginBottom: '15px' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {customerActions.map((action, idx) => (
              <div key={idx} className="action-btn" onClick={() => navigate(action.path)}>
                <span style={{ fontSize: '24px', marginBottom: '8px' }}>{action.icon}</span>
                <span style={{ fontWeight: 'bold', fontSize: '11px', textAlign: 'center' }}>{action.name}</span>
              </div>
            ))}
          </div>

          <div className="client-card" style={{ marginTop: '20px', background: '#14213d', color: '#ffffff', border: 'none' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fca311' }}>Account Manager</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#fff', color: '#14213d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                N
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Neha Sales</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>neha.sales@telos.com</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>+91 98765 00002</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tracking & History */}
        <div>
          {/* Live Order Tracker */}
          <div className="client-card" style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#14213d' }}>Active Order: {activeOrder.id}</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{activeOrder.product}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>EST. DELIVERY</div>
                <div style={{ fontSize: '16px', color: '#27ae60', fontWeight: 'bold' }}>{activeOrder.estDelivery}</div>
              </div>
            </div>

            {/* Stepper Logic */}
            <div className="stepper-container">
              <div className="stepper-line"></div>
              {/* Calculate the green line fill width based on current step */}
              <div className="stepper-line-fill" style={{ width: `${(activeOrder.currentStep - 1) * 25}%` }}></div>
              
              {['Placed', 'Processing', 'Manufacturing', 'Shipped', 'Delivered'].map((step, index) => {
                const stepNum = index + 1;
                let circleClass = '';
                if (stepNum < activeOrder.currentStep) circleClass = 'completed';
                else if (stepNum === activeOrder.currentStep) circleClass = 'active';

                return (
                  <div key={index} className="step-item">
                    <div className={`step-circle ${circleClass}`}>
                      {stepNum < activeOrder.currentStep ? '✓' : stepNum}
                    </div>
                    <div className="step-label" style={{ color: stepNum <= activeOrder.currentStep ? '#14213d' : '#999' }}>
                      {step}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order History Table */}
          <div className="client-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#14213d' }}>Order History</h3>
              <button style={{ background: 'none', border: 'none', color: '#14213d', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                Download Statements
              </button>
            </div>
            
            <table className="history-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Products</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.map((order, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{order.id}</td>
                    <td>{order.date}</td>
                    <td>{order.items}</td>
                    <td style={{ fontWeight: 'bold' }}>{order.total}</td>
                    <td>
                      <span className={`status-pill ${order.status === 'Delivered' ? 'pill-success' : 'pill-error'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;