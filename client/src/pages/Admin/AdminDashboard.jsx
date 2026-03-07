import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
  // --- 1. STATES FOR DYNAMIC DATA ---
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  // KPI States
  const [kpis, setKpis] = useState({
    inquiries: 0,
    production: 0,
    receipts: 0,
    alerts: 0
  });

  // Table States
  const [salesOrders, setSalesOrders] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);

  // --- 2. DATA FETCHING FUNCTION ---
  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.get('/admin/dashboard');
      if (response.data.success) {
        setKpis(response.data.kpis);
        setSalesOrders(response.data.salesOrders);
        setInventoryAlerts(response.data.inventoryAlerts);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // --- 3. LIFECYCLE HOOK ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --- 4. REFRESH HANDLER ---
  const handleRefresh = () => {
    fetchDashboardData();
  };

  return (
    <div style={{ padding: '30px 50px', flex: 1 }}>

      <style>
        {`
        /* Upgraded Classic Card */
        .classic-card {
          background - color: #ffffff;
        border: 1px solid #dcdcdc;
        box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        display: flex;
        flex-direction: column;
          }

        /* Top KPI Cards */
        .kpi-card {
          border - top: 4px solid #14213d;
        padding: 20px;
        transition: transform 0.2s;
          }
        .kpi-card:hover {transform: translateY(-3px); box-shadow: 0 6px 12px rgba(0,0,0,0.08); }
        .kpi-warning {border - top: 4px solid #fca311; }

        /* Premium Table Styles */
        .erp-table {width: 100%; border-collapse: collapse; font-size: 14px; }
        .erp-table th {
          background - color: #14213d; color: #ffffff;
        padding: 12px 15px; text-align: left; font-size: 13px; letter-spacing: 0.5px;
          }
        .erp-table td {padding: 12px 15px; border-bottom: 1px solid #e5e5e5; color: #14213d; }
        .erp-table tr:nth-child(even) {background - color: #f9f9f9; }
        .erp-table tr:hover {background - color: rgba(252, 163, 17, 0.08); }

        /* Status Badges */
        .status-badge {padding: 4px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .badge-processing {background - color: #e5e5e5; color: #14213d; border: 1px solid #cccccc; }
        .badge-shipped {background - color: rgba(46, 204, 113, 0.15); color: #27ae60; border: 1px solid #2ecc71; }
        .badge-critical {background - color: rgba(231, 76, 60, 0.1); color: #c0392b; border: 1px solid #e74c3c; }
        .badge-warning {background - color: rgba(252, 163, 17, 0.15); color: #d35400; border: 1px solid #fca311; }

        /* Refresh Animation */
        @keyframes spin {100 % { transform: rotate(360deg); }}
        .spin-icon {display: inline-block; animation: spin 1s linear infinite; }
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
          <div style={{ fontSize: '12px', color: '#27ae60', marginTop: '5px', fontWeight: 'bold' }}>From Quote Req</div>
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
              {salesOrders.length > 0 ? (
                salesOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 'bold' }}>{order.id}</td>
                    <td>{order.client}</td>
                    <td>{order.date}</td>
                    <td><span className={`status-badge ${order.badgeClass}`}>{order.status}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" style={{ textAlign: 'center', color: '#666' }}>No active sales orders found.</td></tr>
              )}
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
              {inventoryAlerts.length > 0 ? (
                inventoryAlerts.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 'bold' }}>{item.itemCode}</td>
                    <td>{item.description}</td>
                    <td><span className={`status-badge ${item.badgeClass}`}>{item.level}</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" style={{ textAlign: 'center', color: '#666' }}>Inventory levels optimal.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div >
    </div >
  );
};

export default AdminDashboard;