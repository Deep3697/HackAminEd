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

const CommandCenter = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastSynced, setLastSynced] = useState('');

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

  if (!isAdmin) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', fontFamily: "Arial, sans-serif", flex: 1, backgroundColor: '#f8f9fa' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>⛔</div>
        <h2 style={{ color: '#14213d', fontSize: '28px', fontWeight: '800' }}>Access Restricted</h2>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>
          Your account role ({safeRole || 'Guest'}) does not have authorization for the System Command Center.
        </p>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: '#14213d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px 40px', flex: 1, backgroundColor: '#e5e5e5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      <style>
        {`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
          @keyframes spin { 100% { transform: rotate(360deg); } }

          .cc-card {
            background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
            border: 1px solid rgba(20, 33, 61, 0.08);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.6);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(8px);
            animation: fadeInUp 0.6s ease-out;
          }
          .cc-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.8);
            border-color: rgba(252, 163, 17, 0.15);
          }

          .cc-hub-header {
            background: linear-gradient(135deg, #14213d 0%, #1a2f4a 100%);
            color: #fff;
            padding: 16px 22px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            overflow: hidden;
          }
          .cc-hub-header::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(252, 163, 17, 0.1) 50%, transparent);
            animation: shimmer 3s infinite;
          }
          .cc-hub-header span { position: relative; z-index: 1; }

          .cc-kpi-card {
            background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
            border: 1px solid rgba(20, 33, 61, 0.08);
            border-radius: 12px;
            padding: 22px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            animation: fadeInUp 0.6s ease-out;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            border-top: 5px solid #14213d;
          }
          .cc-kpi-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
          }
          .cc-kpi-warning { border-top: 5px solid #fca311; }

          .cc-data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          .cc-data-table th {
            background: linear-gradient(135deg, #f0f3f8 0%, #e8ecf2 100%);
            color: #14213d;
            padding: 14px 15px;
            text-align: left;
            border-bottom: 2px solid rgba(20, 33, 61, 0.15);
            font-weight: 800;
            font-size: 11px;
            text-transform: uppercase;
          }
          .cc-data-table td {
            padding: 13px 15px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            color: #333;
            transition: all 0.3s ease;
          }
          .cc-data-table tr:hover {
            background: linear-gradient(90deg, rgba(20, 33, 61, 0.06) 0%, rgba(252, 163, 17, 0.04) 100%);
            transform: scaleX(1.005);
            box-shadow: inset 4px 0 0 rgba(252, 163, 17, 0.4);
          }

          .cc-status-badge {
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .cc-badge-warn { background: rgba(252, 163, 17, 0.15); color: #d35400; border: 1px solid rgba(252, 163, 17, 0.4); }
          .cc-badge-ok { background: rgba(39, 174, 96, 0.15); color: #27ae60; border: 1px solid rgba(39, 174, 96, 0.4); }
          .cc-badge-info { background: rgba(20, 33, 61, 0.08); color: #14213d; border: 1px solid rgba(20, 33, 61, 0.2); }
          .cc-badge-critical { background: rgba(231, 76, 60, 0.1); color: #c0392b; border: 1px solid rgba(231, 76, 60, 0.3); }

          .cc-btn-classic {
            background: linear-gradient(135deg, #14213d 0%, #1a2f4a 100%);
            color: #fff;
            border: none;
            padding: 12px 22px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(20, 33, 61, 0.3);
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .cc-btn-classic:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(20, 33, 61, 0.4); }
          .cc-btn-classic:disabled { opacity: 0.7; cursor: not-allowed; }

          .spin-icon { display: inline-block; animation: spin 1s linear infinite; }
        `}
      </style>

      {/* --- TOP HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ color: '#14213d', margin: '0', fontSize: '28px', fontWeight: '900' }}>System Command Center</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '5px' }}>
            <p style={{ margin: 0, color: '#fca311', fontSize: '14px', fontWeight: 'bold' }}>Real-time overview of core operations and pending tasks</p>
            {lastSynced && (
              <span style={{ fontSize: '11px', background: 'rgba(20,33,61,0.08)', padding: '3px 10px', borderRadius: '10px', color: '#666', fontWeight: 'bold' }}>
                Last Synced: {lastSynced}
              </span>
            )}
          </div>
        </div>
        <button className="cc-btn-classic" onClick={() => fetchDashboard(true)} disabled={refreshing || loading}>
          <span className={refreshing ? 'spin-icon' : ''}>↻</span>
          {refreshing ? 'SYNCING...' : 'REFRESH DATA'}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fff3e0', padding: '12px 18px', borderRadius: '8px', border: '1px solid #fca311', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold', color: '#d35400' }}>
          ⚠️ {error}
        </div>
      )}

      {/* --- KPI GRID --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="cc-kpi-card">
          <div style={{ fontSize: '12px', color: '#888', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PENDING INQUIRIES</div>
          <div style={{ fontSize: '36px', color: '#14213d', fontWeight: '900', marginTop: '8px' }}>{dashboard.kpis.inquiries}</div>
          <div style={{ fontSize: '12px', color: '#27ae60', marginTop: '5px', fontWeight: 'bold' }}>From Quote Requests</div>
        </div>
        <div className="cc-kpi-card">
          <div style={{ fontSize: '12px', color: '#888', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ACTIVE PRODUCTION</div>
          <div style={{ fontSize: '36px', color: '#14213d', fontWeight: '900', marginTop: '8px' }}>{String(dashboard.kpis.production).padStart(2, '0')}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Jobs on factory floor</div>
        </div>
        <div className="cc-kpi-card">
          <div style={{ fontSize: '12px', color: '#888', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PENDING RECEIPTS</div>
          <div style={{ fontSize: '36px', color: '#14213d', fontWeight: '900', marginTop: '8px' }}>{String(dashboard.kpis.receipts).padStart(2, '0')}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>Awaiting QC check</div>
        </div>
        <div className="cc-kpi-card cc-kpi-warning">
          <div style={{ fontSize: '12px', color: '#888', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MAINTENANCE ALERTS</div>
          <div style={{ fontSize: '36px', color: '#fca311', fontWeight: '900', marginTop: '8px' }}>{String(dashboard.kpis.alerts).padStart(2, '0')}</div>
          <div style={{ fontSize: '12px', color: '#c0392b', marginTop: '5px', fontWeight: 'bold' }}>Requires immediate action</div>
        </div>
      </div>

      {/* --- DATA TABLES GRID --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>

        {/* Recent Sales Orders */}
        <div className="cc-card">
          <div className="cc-hub-header">
            <span>RECENT SALES ORDERS</span>
            <span style={{ fontSize: '12px', fontWeight: 'normal' }}>LIVE TRACKING</span>
          </div>
          <table className="cc-data-table">
            <thead>
              <tr>
                <th>ORDER #</th>
                <th>CLIENT</th>
                <th>DATE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading && !refreshing ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#888', fontWeight: 'bold' }}>⏳ Syncing ledger data...</td></tr>
              ) : dashboard.salesOrders.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#888', fontWeight: 'bold' }}>📭 No active sales orders found.</td></tr>
              ) : (
                dashboard.salesOrders.map((order, idx) => {
                  const status = (order.status || '').toLowerCase();
                  let badgeClass = 'cc-badge-info';
                  if (status.includes('shipped') || status.includes('delivered') || status.includes('dispatch')) badgeClass = 'cc-badge-ok';
                  if (status.includes('pending') || status.includes('quote') || status.includes('awaiting')) badgeClass = 'cc-badge-warn';

                  return (
                    <tr key={order.id || idx}>
                      <td style={{ fontWeight: 'bold', color: '#14213d' }}>{order.id || '-'}</td>
                      <td>{order.client || '-'}</td>
                      <td style={{ color: '#888', fontSize: '12px' }}>{order.date || '-'}</td>
                      <td><span className={`cc-status-badge ${badgeClass}`}>{order.status || 'Unknown'}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Critical Inventory Alerts */}
        <div className="cc-card" style={{ borderTop: '5px solid #c0392b' }}>
          <div className="cc-hub-header" style={{ background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)' }}>
            <span>CRITICAL INVENTORY ALERTS</span>
            <span style={{ fontSize: '18px' }}>🔴</span>
          </div>
          <table className="cc-data-table">
            <thead>
              <tr>
                <th>ITEM CODE</th>
                <th>DESCRIPTION</th>
                <th>LEVEL</th>
              </tr>
            </thead>
            <tbody>
              {loading && !refreshing ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#888', fontWeight: 'bold' }}>⏳ Scanning warehouse sensors...</td></tr>
              ) : dashboard.inventoryAlerts.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#27ae60', fontWeight: 'bold' }}>✅ All inventory levels are healthy.</td></tr>
              ) : (
                dashboard.inventoryAlerts.map((item, idx) => (
                  <tr key={item.itemCode || idx}>
                    <td style={{ fontWeight: 'bold', color: '#14213d' }}>{item.itemCode || '-'}</td>
                    <td>{item.description || '-'}</td>
                    <td><span className={`cc-status-badge ${item.level && parseInt(item.level) === 0 ? 'cc-badge-critical' : 'cc-badge-warn'}`}>{item.level || '-'}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;