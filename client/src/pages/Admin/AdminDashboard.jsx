import React, { useState } from 'react';

const AdminDashboard = () => {
  // --- 1. STATES FOR DYNAMIC DATA ---
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  
  // KPI States
  const [kpis, setKpis] = useState({
    inquiries: 14,
    production: 8,
    receipts: 5,
    alerts: 2
  });

  // Table States
  const [salesOrders, setSalesOrders] = useState([
    { id: 'SO-1045', client: 'Alpha Industries Pvt Ltd', date: 'Oct 24, 2023', status: 'Processing', badgeClass: 'badge-processing' },
    { id: 'SO-1046', client: 'Beta Corp Technologies', date: 'Oct 23, 2023', status: 'Dispatched', badgeClass: 'badge-shipped' },
    { id: 'SO-1047', client: 'Omega Heavy Logistics', date: 'Oct 22, 2023', status: 'Processing', badgeClass: 'badge-processing' },
  ]);

  // --- 2. REFRESH HANDLER ---
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate a network request delay of 1 second
    setTimeout(() => {
      // Randomize KPIs slightly to show the data actually updated
      setKpis({
        inquiries: Math.floor(Math.random() * 5) + 12, 
        production: Math.floor(Math.random() * 3) + 7,
        receipts: Math.floor(Math.random() * 4) + 4,
        alerts: Math.floor(Math.random() * 3) + 1
      });
      
      setLastUpdated(new Date().toLocaleTimeString());
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div style={{ padding: '30px 50px', flex: 1 }}>
      
      <style>
        {`
          /* Upgraded Classic Card */
          .classic-card {
            background-color: #ffffff;
            border: 1px solid #dcdcdc;
            box-shadow: 0 2px 6px rgba(0,0,0,0.04);
            display: flex;
            flex-direction: column;
          }
          
          /* Top KPI Cards */
          .kpi-card {
            border-top: 4px solid #14213d;
            padding: 20px;
            transition: transform 0.2s;
          }
          .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.08); }
          .kpi-warning { border-top: 4px solid #fca311; }

          /* Premium Table Styles */
          .erp-table { width: 100%; border-collapse: collapse; font-size: 14px; }
          .erp-table th {
            background-color: #14213d; color: #ffffff;
            padding: 12px 15px; text-align: left; font-size: 13px; letter-spacing: 0.5px;
          }
          .erp-table td { padding: 12px 15px; border-bottom: 1px solid #e5e5e5; color: #14213d; }
          .erp-table tr:nth-child(even) { background-color: #f9f9f9; }
          .erp-table tr:hover { background-color: rgba(252, 163, 17, 0.08); }

          /* Status Badges */
          .status-badge { padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
          .badge-processing { background-color: #e5e5e5; color: #14213d; border: 1px solid #cccccc; }
          .badge-shipped { background-color: rgba(46, 204, 113, 0.15); color: #27ae60; border: 1px solid #2ecc71; }
          .badge-critical { background-color: rgba(231, 76, 60, 0.1); color: #c0392b; border: 1px solid #e74c3c; }
          .badge-warning { background-color: rgba(252, 163, 17, 0.15); color: #d35400; border: 1px solid #fca311; }

          /* Refresh Animation */
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .spin-icon { display: inline-block; animation: spin 1s linear infinite; }
        `}
      </style>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '25px', borderBottom: '2px solid #cccccc', paddingBottom: '10px' }}>
        <div>
          <h2 style={{ color: '#14213d', margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>System Command Center</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <p style={{ margin: 0, color: '#666666', fontSize: '14px' }}>Real-time overview of core operations and pending tasks.</p>
            <span style={{ fontSize: '11px', background: '#e5e5e5', padding: '2px 8px', borderRadius: '10px', color: '#666', fontWeight: 'bold' }}>
              Last Synced: {lastUpdated}
            </span>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{ 
            backgroundColor: '#14213d', color: '#ffffff', border: 'none', 
            padding: '10px 20px', fontWeight: 'bold', fontSize: '13px', 
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            opacity: isRefreshing ? 0.8 : 1,
            transition: '0.2s',
            display: 'flex', gap: '8px', alignItems: 'center'
          }}
        >
          <span className={isRefreshing ? 'spin-icon' : ''}>↻</span> 
          {isRefreshing ? 'SYNCING...' : 'REFRESH DATA'}
        </button>
      </div>

      {/* Top Metric Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="classic-card kpi-card">
          <div style={{ fontSize: '13px', color: '#666666', fontWeight: 'bold' }}>PENDING INQUIRIES</div>
          <div style={{ fontSize: '34px', color: '#14213d', fontWeight: '900', marginTop: '8px' }}>{kpis.inquiries}</div>
          <div style={{ fontSize: '12px', color: '#27ae60', marginTop: '5px', fontWeight: 'bold' }}>↑ 2 New Today</div>
        </div>
        <div className="classic-card kpi-card">
          <div style={{ fontSize: '13px', color: '#666666', fontWeight: 'bold' }}>ACTIVE PRODUCTION</div>
          <div style={{ fontSize: '34px', color: '#14213d', fontWeight: '900', marginTop: '8px' }}>{String(kpis.production).padStart(2, '0')}</div>
          <div style={{ fontSize: '12px', color: '#666666', marginTop: '5px' }}>Jobs on factory floor</div>
        </div>
        <div className="classic-card kpi-card">
          <div style={{ fontSize: '13px', color: '#666666', fontWeight: 'bold' }}>PENDING RECEIPTS</div>
          <div style={{ fontSize: '34px', color: '#14213d', fontWeight: '900', marginTop: '8px' }}>{String(kpis.receipts).padStart(2, '0')}</div>
          <div style={{ fontSize: '12px', color: '#666666', marginTop: '5px' }}>Awaiting QC check</div>
        </div>
        <div className="classic-card kpi-card kpi-warning">
          <div style={{ fontSize: '13px', color: '#666666', fontWeight: 'bold' }}>MAINTENANCE ALERTS</div>
          <div style={{ fontSize: '34px', color: '#fca311', fontWeight: '900', marginTop: '8px' }}>{String(kpis.alerts).padStart(2, '0')}</div>
          <div style={{ fontSize: '12px', color: '#c0392b', marginTop: '5px', fontWeight: 'bold' }}>Requires immediate action</div>
        </div>
      </div>

      {/* Data Tables Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
        
        {/* Recent Sales Orders Table */}
        <div className="classic-card">
          <div style={{ padding: '15px 20px', borderBottom: '1px solid #e5e5e5', backgroundColor: '#ffffff' }}>
            <h3 style={{ margin: 0, color: '#14213d', fontSize: '16px', fontWeight: 'bold' }}>Recent Sales Orders</h3>
          </div>
          <table className="erp-table">
            <thead>
              <tr>
                <th>ORDER #</th>
                <th>CLIENT</th>
                <th>DATE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {salesOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 'bold' }}>{order.id}</td>
                  <td>{order.client}</td>
                  <td>{order.date}</td>
                  <td><span className={`status-badge ${order.badgeClass}`}>{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Inventory Alerts Table */}
        <div className="classic-card">
          <div style={{ padding: '15px 20px', borderBottom: '1px solid #e5e5e5', backgroundColor: '#ffffff' }}>
            <h3 style={{ margin: 0, color: '#14213d', fontSize: '16px', fontWeight: 'bold' }}>Critical Inventory Alerts</h3>
          </div>
          <table className="erp-table">
            <thead>
              <tr>
                <th>ITEM CODE</th>
                <th>DESCRIPTION</th>
                <th>LEVEL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 'bold' }}>PT-402</td>
                <td>Industrial Primer</td>
                <td><span className="status-badge badge-critical">0 Units</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>RM-099</td>
                <td>Steel Sheet 5mm</td>
                <td><span className="status-badge badge-warning">12 Units</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>CH-110</td>
                <td>Binding Chemical</td>
                <td><span className="status-badge badge-warning">5 Ltrs</span></td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;