import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const generateAuditYears = (yearsCount = 5) => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: yearsCount }, (_, i) => {
    const startYear = currentYear - i;
    return `FY ${startYear}-${(startYear + 1).toString().slice(-2)}`;
  });
};

// ==============================================================================
// 1. ADMIN & MAINTENANCE MANAGER VIEW
// ==============================================================================
const AdminMaintenanceView = ({ user, token }) => {
  const [assets, setAssets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  const availableYears = generateAuditYears();
  const [auditYear, setAuditYear] = useState(availableYears[0]);

  const [registerForm, setRegisterForm] = useState({ name: '', value: '', nextService: '' });
  const [workOrderForm, setWorkOrderForm] = useState({ assetId: '', type: 'Preventive', date: '' });
  const [dispatchForm, setDispatchForm] = useState({ tech: '', assetId: '', priority: 'Standard' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const assetRes = await fetch(`${API_URL}/maintenance/assets`, { headers: { Authorization: `Bearer ${token}` } });
      const auditRes = await fetch(`${API_URL}/maintenance/audit`, { headers: { Authorization: `Bearer ${token}` } });

      if (assetRes.ok) {
        const assetData = await assetRes.json();
        setAssets(assetData.assets || []);
      }
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData.logs || []);
      }
    } catch (err) { console.error("Failed to fetch maintenance data:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

  const handleGenericSubmit = async (e, formType) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_URL}/maintenance/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ actionType: formType })
      });
      if (res.ok) {
        alert(`${formType} processed successfully.`);
        setActiveModal(null);
        fetchData(); // Refresh table
      }
    } catch (err) { alert("Server connection failed"); }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ color: '#14213d', margin: '0', fontSize: '28px', fontWeight: '900' }}>Asset Reliability Hub</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Predictive Maintenance Scheduling & Asset Valuation</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={() => setActiveModal('audit')}>ASSET AUDIT LOG</button>
          <button className="btn-primary" onClick={() => setActiveModal('register')}>+ REGISTER NEW ASSET</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="asset-card" style={{ padding: '20px', borderTop: '4px solid #14213d' }}>
          <div style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Book Value (Total)</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#14213d', marginTop: '5px' }}>$1.82M</div>
        </div>
        <div className="asset-card" style={{ padding: '20px', borderTop: '4px solid #27ae60' }}>
          <div style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Fleet Availability</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#27ae60', marginTop: '5px' }}>84.2%</div>
        </div>
        <div className="asset-card" style={{ padding: '20px', borderTop: '4px solid #fca311' }}>
          <div style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Upcoming Service</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#fca311', marginTop: '5px' }}>05 <small style={{ fontSize: '14px', color: '#666' }}>Jobs</small></div>
        </div>
        <div className="asset-card" style={{ padding: '20px', borderTop: '4px solid #c0392b' }}>
          <div style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Downtime Cost (MTD)</div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#c0392b', marginTop: '5px' }}>$4.5k</div>
        </div>
      </div>

      <div className="asset-card">
        <div className="hub-header">
          <span>ASSET MASTER & OPERATIONAL HEALTH</span>
          <button style={{ background: '#ffffff22', color: '#fff', border: 'none', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', borderRadius: '3px' }}>Export CSV</button>
        </div>
        {loading ? <div style={{ padding: '30px', textAlign: 'center' }}>Syncing sensors...</div> : (
          <table className="asset-table">
            <thead>
              <tr><th>ID</th><th>ASSET NAME</th><th>VALUATION</th><th>HEALTH MONITOR</th><th>STATUS</th><th style={{ textAlign: 'right' }}>MAINTENANCE DUE</th></tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.id}>
                  <td style={{ fontWeight: 'bold', color: '#14213d' }}>{asset.asset_code}</td>
                  <td style={{ fontWeight: 'bold' }}>{asset.asset_name}</td>
                  <td style={{ fontFamily: 'monospace' }}>${parseFloat(asset.capital_value).toLocaleString()}</td>
                  <td style={{ width: '180px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: asset.health_score < 50 ? '#c0392b' : '#14213d' }}>{asset.health_score}% Optimal</div>
                    <div className="health-bar-bg"><div className="health-bar-fill" style={{ width: `${asset.health_score}%`, background: asset.health_score > 80 ? '#27ae60' : asset.health_score > 50 ? '#fca311' : '#c0392b' }}></div></div>
                  </td>
                  <td><span className={`status-pill status-${asset.status.toLowerCase()}`}>{asset.status}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: !asset.next_service_date ? '#c0392b' : '#333' }}>
                    {asset.next_service_date ? new Date(asset.next_service_date).toLocaleDateString() : 'URGENT'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="asset-card" style={{ marginTop: '30px', borderLeft: '10px solid #fca311', padding: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <div style={{ width: '60px', height: '60px', background: '#14213d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fca311', fontSize: '28px' }}>🛠️</div>
            <div>
              <h3 style={{ margin: 0, color: '#14213d', fontSize: '20px' }}>Service Dispatch Engine</h3>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666', maxWidth: '550px' }}>Automate service tickets based on machine run-hours or date intervals.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button className="btn-secondary" onClick={() => setActiveModal('workOrder')}>GENERATE WORK ORDERS</button>
            <button className="btn-primary" onClick={() => setActiveModal('dispatch')}>TECH DISPATCH</button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {activeModal === 'audit' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: '#14213d' }}><h3>Asset Audit & Service Log</h3><button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button></div>
            <div className="form-body" style={{ padding: 0 }}>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="asset-table" style={{ margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#fff' }}>
                    <tr><th>COMPLETED</th><th>ASSET</th><th>TECHNICIAN</th><th>ACTION PERFORMED</th><th>COST</th></tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontWeight: 'bold', color: '#888' }}>{new Date(log.completed_date).toLocaleDateString()}</td>
                        <td><div style={{ fontWeight: 'bold', color: '#14213d' }}>{log.asset_code}</div><div style={{ fontSize: '11px' }}>{log.asset_name}</div></td>
                        <td>{log.technician_name || 'External Vendor'}</td>
                        <td>{log.action_performed}</td>
                        <td style={{ color: '#c0392b', fontWeight: 'bold' }}>${parseFloat(log.cost).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'register' && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ borderTop: '5px solid #14213d' }}>
            <div className="modal-header"><h3>Register Capital Asset</h3><button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button></div>
            <form className="form-body" onSubmit={(e) => handleGenericSubmit(e, 'Asset Registration')}>
              <div className="form-group"><label className="form-label">Asset Name / Model</label><input type="text" className="form-input" required /></div>
              <div className="form-group"><label className="form-label">Capital Valuation (USD)</label><input type="number" className="form-input" required /></div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}><button type="submit" className="btn-primary" style={{ flex: 1 }}>REGISTER ASSET</button><button type="button" onClick={() => setActiveModal(null)} className="btn-secondary">CANCEL</button></div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'workOrder' && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ borderTop: '5px solid #fca311' }}>
            <div className="modal-header" style={{ background: '#fca311', color: '#14213d' }}><h3>Generate Work Order</h3><button className="close-btn" style={{ color: '#14213d' }} onClick={() => setActiveModal(null)}>&times;</button></div>
            <form className="form-body" onSubmit={(e) => handleGenericSubmit(e, 'Work Order')}>
              <div className="form-group"><label className="form-label">Target Asset</label><select className="form-input" required><option value="">Select...</option>{assets.map(a => <option key={a.id} value={a.asset_code}>{a.asset_code} - {a.asset_name}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Scheduled Date</label><input type="date" className="form-input" required /></div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}><button type="submit" className="btn-primary" style={{ flex: 1 }}>ISSUE ORDER</button><button type="button" onClick={() => setActiveModal(null)} className="btn-secondary">CANCEL</button></div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'dispatch' && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ borderTop: '5px solid #27ae60' }}>
            <div className="modal-header" style={{ background: '#14213d' }}><h3>Maintenance Dispatch</h3><button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button></div>
            <form className="form-body" onSubmit={(e) => handleGenericSubmit(e, 'Tech Dispatch')}>
              <div className="form-group"><label className="form-label">Dispatch to Asset</label><select className="form-input" required><option value="">Select Asset...</option>{assets.map(a => <option key={a.id} value={a.asset_code}>{a.asset_code}</option>)}</select></div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}><button type="submit" className="btn-primary" style={{ flex: 1, background: '#27ae60' }}>DISPATCH TEAM</button><button type="button" onClick={() => setActiveModal(null)} className="btn-secondary">CANCEL</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// ==============================================================================
// 2. FLOOR STAFF / OPERATOR VIEW
// ==============================================================================
const StaffMaintenanceView = ({ user, token }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
        const res = await fetch(`${API_URL}/maintenance/assets`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setAssets(data.assets || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (token) fetchAssets();
  }, [token]);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      await fetch(`${API_URL}/maintenance/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ actionType: 'Breakdown Report' })
      });
      alert(`Breakdown ticket submitted successfully.`);
      setActiveModal(null);
    } catch (err) { alert("Server connection failed"); }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ color: '#14213d', margin: '0', fontSize: '28px', fontWeight: '900' }}>Factory Floor Assets</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Operator Portal: {user?.fullName}</p>
        </div>
        <button className="btn-primary" style={{ background: '#c0392b' }} onClick={() => setActiveModal('report')}>
          ⚠️ REPORT BREAKDOWN
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="asset-card" style={{ padding: '20px', borderTop: '4px solid #27ae60' }}><div style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>My Dept Assets</div><div style={{ fontSize: '26px', fontWeight: '900', color: '#14213d', marginTop: '5px' }}>{assets.length} Units</div></div>
        <div className="asset-card" style={{ padding: '20px', borderTop: '4px solid #fca311' }}><div style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Under Maintenance</div><div style={{ fontSize: '26px', fontWeight: '900', color: '#fca311', marginTop: '5px' }}>{assets.filter(a => a.status === 'Maintenance').length} Units</div></div>
        <div className="asset-card" style={{ padding: '20px', borderTop: '4px solid #c0392b' }}><div style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Critical Alerts</div><div style={{ fontSize: '26px', fontWeight: '900', color: '#c0392b', marginTop: '5px' }}>{assets.filter(a => a.status === 'Critical').length} Units</div></div>
      </div>

      <div className="asset-card">
        <div className="hub-header"><span>EQUIPMENT HEALTH STATUS</span></div>
        {loading ? <div style={{ padding: '30px', textAlign: 'center' }}>Syncing sensors...</div> : (
          <table className="asset-table">
            <thead>
              <tr><th>ID</th><th>ASSET NAME</th><th>HEALTH MONITOR</th><th>STATUS</th><th style={{ textAlign: 'right' }}>NEXT SERVICE</th></tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.id}>
                  <td style={{ fontWeight: 'bold', color: '#14213d' }}>{asset.asset_code}</td>
                  <td style={{ fontWeight: 'bold' }}>{asset.asset_name}</td>
                  <td style={{ width: '180px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: asset.health_score < 50 ? '#c0392b' : '#14213d' }}>{asset.health_score}% Optimal</div>
                    <div className="health-bar-bg"><div className="health-bar-fill" style={{ width: `${asset.health_score}%`, background: asset.health_score > 80 ? '#27ae60' : asset.health_score > 50 ? '#fca311' : '#c0392b' }}></div></div>
                  </td>
                  <td><span className={`status-pill status-${asset.status.toLowerCase()}`}>{asset.status}</span></td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: !asset.next_service_date ? '#c0392b' : '#333' }}>
                    {asset.next_service_date ? new Date(asset.next_service_date).toLocaleDateString() : 'URGENT'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {activeModal === 'report' && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ borderTop: '5px solid #c0392b' }}>
            <div className="modal-header" style={{ background: '#c0392b' }}><h3>⚠️ Report Equipment Fault</h3><button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button></div>
            <form className="form-body" onSubmit={handleReportSubmit}>
              <div className="form-group"><label className="form-label">Select Faulty Asset</label>
                <select className="form-input" required><option value="">Select Asset...</option>{assets.map(a => <option key={a.id} value={a.asset_code}>{a.asset_code} - {a.asset_name}</option>)}</select>
              </div>
              <div className="form-group"><label className="form-label">Issue Description</label><textarea className="form-input" rows="3" required placeholder="Describe the fault..."></textarea></div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}><button type="submit" className="btn-primary" style={{ flex: 1, background: '#c0392b' }}>SUBMIT TICKET</button><button type="button" onClick={() => setActiveModal(null)} className="btn-secondary">CANCEL</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// ==============================================================================
// 3. MASTER COMPONENT (Smart Router)
// ==============================================================================
const MaintenanceAssetsHub = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const role = user?.role?.toLowerCase();
  const isAdmin = role === 'admin';

  if (role === 'contractor' || role === 'user') {
    return (
      <div style={{ padding: '80px', textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", flex: 1, backgroundColor: '#f8f9fa' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>⛔</div>
        <h2 style={{ color: '#14213d', fontSize: '28px', fontWeight: '800' }}>Access Restricted</h2>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>Your current security clearance ({role}) does not allow access to Internal Asset Management.</p>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: '#14213d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px 40px', flex: 1, backgroundColor: '#e5e5e5', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
      <style>
        {`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .asset-card { background: #ffffff; border: 1px solid rgba(20, 33, 61, 0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); animation: fadeInUp 0.6s ease-out; }
          .hub-header { background: #14213d; color: #fff; padding: 16px 22px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
          .asset-table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .asset-table th { background: #f0f3f8; color: #14213d; padding: 14px 15px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid rgba(20,33,61,0.15); }
          .asset-table td { padding: 13px 15px; border-bottom: 1px solid rgba(0,0,0,0.05); color: #333; }
          .asset-table tr:hover { background: #f8f9fa; }
          
          .health-bar-bg { width: 100%; height: 7px; background: #eee; border-radius: 4px; margin-top: 6px; overflow: hidden; }
          .health-bar-fill { height: 100%; background: #27ae60; border-radius: 4px; }

          .status-pill { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; display: inline-block; color: #fff; }
          .status-running { background: #2e7d32; }
          .status-critical { background: #c62828; }
          .status-idle { background: #666; }
          .status-maintenance { background: #e65100; }

          .btn-primary { background: #14213d; color: #fff; border: none; padding: 12px 22px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 12px; transition: 0.3s; }
          .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(20, 33, 61, 0.3); }
          .btn-secondary { background: transparent; color: #14213d; border: 1px solid #14213d; padding: 12px 22px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 12px; transition: 0.3s; }
          .btn-secondary:hover { background: #14213d; color: #fff; }

          .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
          .modal-box { background: #fff; width: 500px; border-radius: 12px; overflow: hidden; animation: scaleIn 0.3s ease; }
          .modal-box-wide { width: 700px; }
          .modal-header { background: #14213d; color: #fff; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
          .close-btn { background: none; border: none; color: #fff; font-size: 24px; cursor: pointer; }
          .form-body { padding: 30px; }
          .form-group { margin-bottom: 20px; }
          .form-label { display: block; font-size: 12px; color: #666; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; }
          .form-input { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 6px; outline: none; }
        `}
      </style>

      {isAdmin ? <AdminMaintenanceView user={user} token={token} /> : <StaffMaintenanceView user={user} token={token} />}
    </div>
  );
};

export default MaintenanceAssetsHub;