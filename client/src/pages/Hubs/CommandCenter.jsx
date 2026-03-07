import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const EMPTY_DASHBOARD = {
  kpis: { inquiries: 0, production: 0, receipts: 0, alerts: 0 },
  salesOrders: [],
  inventoryAlerts: []
};

const normalizeDashboard = (payload) => {
  const source = payload?.success === true ? payload : payload || {};
  return {
    kpis: {
      inquiries: Number(source?.kpis?.inquiries || 0),
      production: Number(source?.kpis?.production || 0),
      receipts: Number(source?.kpis?.receipts || 0),
      alerts: Number(source?.kpis?.alerts || 0)
    },
    salesOrders: Array.isArray(source?.salesOrders) ? source.salesOrders : [],
    inventoryAlerts: Array.isArray(source?.inventoryAlerts) ? source.inventoryAlerts : []
  };
};

const getStatusClassName = (status = '') => {
  const value = status.toLowerCase();
  if (value.includes('shipped') || value.includes('delivered') || value.includes('dispatch') || value.includes('passed')) return 'status-ok';
  if (value.includes('pending') || value.includes('quote') || value.includes('awaiting')) return 'status-warn';
  if (value.includes('processing')) return 'status-info';
  return 'status-info';
};

const CommandCenter = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastSynced, setLastSynced] = useState('');

  // --- RBAC: SECURITY CHECK ---
  const safeRole = user?.role?.toLowerCase() || '';
  const isAdmin = safeRole === 'admin';

  const fetchDashboard = async (isManualRefresh = false) => {
    if (!token) return;
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      if (!res.ok || result?.success === false) {
        throw new Error(result?.message || 'Failed to load dashboard data.');
      }
      
      setTimeout(() => {
        setDashboard(normalizeDashboard(result));
        setError('');
        setLastSynced(new Date().toLocaleTimeString());
        setLoading(false);
        setRefreshing(false);
      }, 500);

    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
      setDashboard(EMPTY_DASHBOARD);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDashboard();
    }
  }, [token, isAdmin]);

  // --- RESTRICT UNAUTHORIZED ACCESS ---
  if (!isAdmin) {
    return (
      <div className="access-restricted">
        <div className="access-icon">⛔</div>
        <h2>Access Restricted</h2>
        <p>Your account role ({safeRole || 'Guest'}) does not have authorization for the System Command Center.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    /* The main background is a distinct light grey so the pure white cards pop out */
    <div className="page-container">
      <style>
        {`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
          
          /* Single unified KPI Bar */
          .kpi-bar {
            display: flex;
            background-color: #ffffff !important; /* STRICT PURE WHITE */
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            margin-bottom: 30px;
            overflow: hidden;
            animation: fadeInUp 0.4s ease-out backwards;
          }
          .kpi-block {
            flex: 1;
            padding: 25px 20px;
            text-align: center;
            border-right: 1px solid #eef0f4;
          }
          .kpi-block:last-child {
            border-right: none;
          }
          .kpi-title {
            font-size: 11px;
            font-weight: 800;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
          }
          .kpi-value {
            font-size: 32px;
            font-weight: 900;
            color: #14213d;
          }
          .kpi-subtext {
            font-size: 11px;
            font-weight: 700;
            margin-top: 8px;
            color: #999;
          }

          /* Premium Table Cards */
          .cc-grid-main { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; animation: fadeInUp 0.5s ease-out backwards; animation-delay: 0.1s; }
          .table-card {
            background-color: #ffffff !important; /* STRICT PURE WHITE */
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          }
          
          /* EXACT HEADERS FROM COMMERCIAL HUB SCREENSHOT */
          .card-header-blue { 
            background-color: #14213d; 
            color: #ffffff; 
            padding: 18px 20px; 
            font-size: 14px; 
            font-weight: 800; 
            text-transform: uppercase; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            border-top: 4px solid #27ae60; /* The green accent line */
          }
          
          .card-header-red { 
            background-color: #c0392b; 
            color: #ffffff; 
            padding: 18px 20px; 
            font-size: 14px; 
            font-weight: 800; 
            text-transform: uppercase; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
          }
          
          .data-table { width: 100%; border-collapse: collapse; background-color: #ffffff !important; }
          .data-table th { background-color: #f8f9fa; color: #14213d; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 14px 20px; text-align: left; border-bottom: 2px solid #eef0f4; letter-spacing: 0.5px; }
          .data-table td { padding: 16px 20px; font-size: 13px; font-weight: 600; color: #333; border-bottom: 1px solid #eef0f4; background-color: #ffffff !important; }
          .data-table tr:last-child td { border-bottom: none; }
          .data-table tr:hover td { background-color: #f4f6f8 !important; }

          /* Status Ghost Badges */
          .status-pill { padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 800; text-transform: uppercase; display: inline-block; letter-spacing: 0.5px; }
          .status-warn { background: rgba(243, 149, 23, 0.1); color: #d35400; border: 1px solid rgba(243, 149, 23, 0.3); }
          .status-ok { background: rgba(39, 174, 96, 0.1); color: #27ae60; border: 1px solid rgba(39, 174, 96, 0.3); }
          .status-info { background: rgba(20, 33, 61, 0.08); color: #14213d; border: 1px solid rgba(20, 33, 61, 0.2); }
          
          .btn-primary { background: #14213d; color: #fff; border: none; padding: 10px 20px; font-weight: 800; border-radius: 6px; cursor: pointer; font-size: 12px; transition: 0.2s; }
          .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
          .btn-primary:hover:not(:disabled) { background: #0a1122; transform: translateY(-1px); }

          .card-footer-link {
            display: block;
            padding: 15px;
            text-align: center;
            background-color: #f8f9fa;
            color: #14213d;
            font-size: 11px;
            font-weight: 800;
            text-decoration: none;
            letter-spacing: 0.5px;
            border-top: 1px solid #eef0f4;
            transition: background 0.2s;
          }
          .card-footer-link:hover {
            background-color: #eef0f4;
          }

          @keyframes spin { 100% { transform: rotate(360deg); } }
          .spin-icon { display: inline-block; animation: spin 1s linear infinite; }

          @media (max-width: 1100px) {
            .cc-grid-main { grid-template-columns: 1fr; }
            .kpi-bar { flex-direction: column; }
            .kpi-block { border-right: none; border-bottom: 1px solid #eef0f4; }
            .kpi-block:last-child { border-bottom: none; }
          }

          /* Layout helpers */
          .page-container {
            padding: 30px 40px;
            flex: 1;
            background-color: #f0f2f5;
            min-height: 100vh;
            font-family: 'Plus Jakarta Sans', Arial, sans-serif;
          }
          .access-restricted {
            padding: 80px;
            text-align: center;
            flex: 1;
            background-color: #f0f2f5;
            font-family: 'Plus Jakarta Sans', Arial, sans-serif;
          }
          .access-icon {
            font-size: 60px;
            margin-bottom: 20px;
          }
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
          }
          .header-info h2 {
            color: #14213d;
            margin: 0;
            font-size: 28px;
            font-weight: 900;
          }
          .header-meta {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-top: 6px;
          }
          .header-info p {
            margin: 0;
            color: #666;
            font-size: 13px;
            font-weight: 500;
          }
          .last-synced {
            font-size: 12px;
            color: #888;
            font-weight: bold;
          }
          .error-message {
            background: #fff;
            padding: 15px 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            border: 1px solid #ffccc7;
            border-left: 5px solid #c0392b;
            color: #c0392b;
            font-weight: bold;
            font-size: 14px;
          }
        `}
      </style>

      {/* --- PAGE HEADER --- */}
      <div className="page-header">
        <div className="header-info">
          <h2>System Command Center</h2>
          <div className="header-meta">
            <p>Global Enterprise Overview</p>
          </div>
        </div>
        <div className="header-meta">
          {lastSynced && (
            <span className="last-synced">
              Last Synced: {lastSynced}
            </span>
          )}
          <button className="btn-primary" onClick={() => fetchDashboard(true)} disabled={refreshing || loading}>
            {refreshing ? <><span className="spin-icon">↻</span> SYNCING...</> : 'REFRESH DATA'}
          </button>
        </div>
      </div>

      {/* --- ERROR MESSAGE --- */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* --- UNIFIED KPI BAR (Matches Commercial Hub exactly) --- */}
      <div className="kpi-bar">
        <div className="kpi-block">
          <div className="kpi-title">PENDING INQUIRIES</div>
          <div className="kpi-value" style={{ color: '#27ae60' }}>{dashboard.kpis.inquiries}</div>
          <div className="kpi-subtext" style={{ color: '#27ae60' }}>From Quote Requests</div>
        </div>
        <div className="kpi-block">
          <div className="kpi-title">ACTIVE PRODUCTION</div>
          <div className="kpi-value" style={{ color: '#c0392b' }}>{String(dashboard.kpis.production).padStart(2, '0')}</div>
          <div className="kpi-subtext">Jobs on factory floor</div>
        </div>
        <div className="kpi-block">
          <div className="kpi-title">PENDING RECEIPTS</div>
          <div className="kpi-value" style={{ color: '#14213d' }}>{String(dashboard.kpis.receipts).padStart(2, '0')}</div>
          <div className="kpi-subtext">Awaiting QC check</div>
        </div>
        <div className="kpi-block">
          <div className="kpi-title">MAINTENANCE ALERTS</div>
          <div className="kpi-value" style={{ color: '#fca311' }}>{String(dashboard.kpis.alerts).padStart(2, '0')}</div>
          <div className="kpi-subtext" style={{ color: '#fca311' }}>Requires immediate action</div>
        </div>
      </div>

      {/* --- MAIN TABLES (Matches Commercial Hub exactly) --- */}
      <div className="cc-grid-main">
        
        {/* Sales Orders Table */}
        <div className="table-card">
          <div className="card-header-blue">
            <span>SALES & CUSTOMER ORDERS</span>
            <span style={{ opacity: 0.8 }}>📈</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Client</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && !refreshing ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Syncing Ledger Data...</td></tr>
              ) : dashboard.salesOrders.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No sales orders found.</td></tr>
              ) : (
                dashboard.salesOrders.map((order, idx) => (
                  <tr key={order.id || idx}>
                    <td style={{ fontWeight: 800, color: '#14213d' }}>{order.id || '-'}</td>
                    <td>{order.client || '-'}</td>
                    <td style={{ color: '#888', fontSize: '12px' }}>{order.date || '-'}</td>
                    <td><span className={`status-pill ${getStatusClassName(order.status)}`}>{order.status || 'Unknown'}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <a href="#" className="card-footer-link">VIEW DETAILED SALES PIPELINE →</a>
        </div>

        {/* Critical Inventory Table */}
        <div className="table-card">
          <div className="card-header-red">
            <span>CRITICAL INVENTORY ALERTS</span>
            <span style={{ opacity: 0.8 }}>⚠️</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Level</th>
              </tr>
            </thead>
            <tbody>
              {loading && !refreshing ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Scanning Warehouse Sensors...</td></tr>
              ) : dashboard.inventoryAlerts.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#27ae60', fontWeight: 'bold' }}>✅ All inventory levels are healthy.</td></tr>
              ) : (
                dashboard.inventoryAlerts.map((item, idx) => (
                  <tr key={item.itemCode || idx}>
                    <td style={{ fontWeight: 800, color: '#14213d' }}>{item.itemCode || '-'}</td>
                    <td>{item.description || '-'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="status-pill status-warn" style={{ color: '#c0392b', background: 'rgba(192, 57, 43, 0.1)', border: '1px solid rgba(192, 57, 43, 0.3)' }}>
                        {item.level || '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <a href="#" className="card-footer-link">VIEW FULL PROCUREMENT LOGS →</a>
        </div>
        
      </div>
    </div>
  );
};

export default CommandCenter;