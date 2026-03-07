import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

// ==============================================================================
// 1. ADMIN & PRODUCTION LEAD VIEW (Full Control + History + Indents)
// ==============================================================================
const AdminSimulationView = ({ user, token }) => {
  const [targetItemId, setTargetItemId] = useState(1);
  const [targetQuantity, setTargetQuantity] = useState(10);
  const [results, setResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);

  const fetchHistory = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_URL}/simulation/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setHistoryLogs(data.history || []);
    } catch (err) {
      console.error("Failed to fetch history");
    }
  };

  useEffect(() => { if (token) fetchHistory(); }, [token]);

  let feasibility = 100;
  let procurementGap = 0;
  let deficitItems = [];

  if (results) {
    let totalReq = 0;
    let totalShort = 0;
    results.materialsNeeded.forEach(item => {
      totalReq += item.requiredQty;
      totalShort += item.shortfall;
      if (item.shortfall > 0) {
        const gapCostForThisItem = item.shortfall * 45;
        procurementGap += gapCostForThisItem;
        deficitItems.push({ ...item, estCost: gapCostForThisItem });
      }
    });
    if (totalReq > 0) feasibility = Math.max(0, Math.round(((totalReq - totalShort) / totalReq) * 100));
  }

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!targetQuantity || targetQuantity <= 0) return alert("Please enter a valid quantity.");

    setIsSimulating(true);
    setError(null);

    try {
      // FIXED PORT TO 5000
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_URL}/simulation/explode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetItemId: Number(targetItemId), targetQuantity: Number(targetQuantity) }),
      });

      if (!response.ok) throw new Error('Simulation failed. Ensure dummy data is in the database.');

      const data = await response.json();

      setTimeout(() => {
        setResults(data);
        setIsSimulating(false);
        fetchHistory(); // Refresh logs
      }, 600);
    } catch (err) {
      setError(err.message);
      setIsSimulating(false);
    }
  };

  const handleIndentSubmit = async (e) => {
    e.preventDefault();
    alert(`Purchase Indent for ₹${procurementGap.toLocaleString()} has been routed to the Commercial Hub.`);
    setActiveModal(null);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ color: '#14213d', margin: '0', fontSize: '28px', fontWeight: '900' }}>Simulation Hub</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Predictive Resource Planning & Deficit Analytics (Admin View)</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setActiveModal('history')} style={{ background: '#fff', color: '#14213d', border: '2px solid #14213d', padding: '10px 20px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>VIEW LOG HISTORY</button>
          <button onClick={() => alert('Exporting PDF...')} style={{ background: '#14213d', color: '#fff', border: 'none', padding: '10px 20px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>EXPORT PDF</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: '30px' }}>
        {/* SIMULATION CONTROLLER */}
        <div className="sim-card" style={{ padding: '30px', borderTop: '6px solid #fca311' }}>
          <h3 style={{ color: '#14213d', marginTop: 0, marginBottom: '25px', fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Scenario Parameters</h3>
          <form onSubmit={handleSimulate}>
            <div className="sim-input-group">
              <label className="sim-label">Target Finished Good</label>
              <select className="sim-field" value={targetItemId} onChange={(e) => setTargetItemId(e.target.value)}>
                <option value="1">Swift Car (Industrial Model)</option>
                <option value="2">Standard Turbine Assembly</option>
              </select>
            </div>
            <div className="sim-input-group">
              <label className="sim-label">Simulated Batch Quantity</label>
              <input type="number" className="sim-field" value={targetQuantity} onChange={(e) => setTargetQuantity(e.target.value)} min="1" />
            </div>

            {results && (
              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '4px', marginBottom: '25px', border: '1px solid #ddd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#14213d' }}>Inventory Feasibility:</span>
                  <span style={{ fontWeight: '900', fontSize: '18px', color: feasibility === 100 ? '#27ae60' : feasibility > 50 ? '#fca311' : '#c0392b' }}>{feasibility}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#eee', borderRadius: '10px' }}>
                  <div style={{ width: `${feasibility}%`, height: '100%', borderRadius: '10px', background: feasibility === 100 ? '#27ae60' : feasibility > 50 ? '#fca311' : '#c0392b', transition: '1s' }}></div>
                </div>
              </div>
            )}
            <button type="submit" className="btn-run" disabled={isSimulating}>{isSimulating ? 'EXPLODING BOM...' : 'RUN REVERSE EXPLOSION'}</button>
            {error && <p style={{ color: '#c0392b', marginTop: '15px', fontSize: '13px', fontWeight: 'bold' }}>⚠️ {error}</p>}
          </form>
        </div>

        {/* EXPLOSION LEDGER */}
        <div className="sim-card">
          <div className="hub-header">
            <span>MATERIAL DEFICIT LEDGER</span>
            {results && <div style={{ background: '#fca311', color: '#14213d', padding: '4px 10px', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold' }}>Total Labor: {results.totalManHours} Hrs</div>}
          </div>

          <div style={{ minHeight: '400px', overflowY: 'auto' }}>
            {results ? (
              <table className="req-table">
                <thead><tr><th>MATERIAL</th><th>REQUIRED</th><th>AVAILABLE</th><th>SHORTFALL</th><th>STATUS</th></tr></thead>
                <tbody>
                  {results.materialsNeeded.map((item, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 'bold', color: '#14213d' }}>{item.materialName}</td>
                      <td style={{ fontWeight: '900' }}>{item.requiredQty} {item.unit}</td>
                      <td style={{ color: '#666' }}>{item.currentStock} {item.unit}</td>
                      <td style={{ color: '#c0392b', fontWeight: 'bold' }}>{item.shortfall > 0 ? item.shortfall : '0'} {item.unit}</td>
                      <td><span className={item.status === 'Shortfall' ? 'badge-deficit' : 'badge-ok'}>{item.status.toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div style={{ padding: '60px', textAlign: 'center', color: '#888', fontWeight: 'bold' }}>Run the simulation to generate the ledger.</div>}
          </div>

          {results && (
            <div style={{ padding: '25px', background: '#14213d', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fca311', textTransform: 'uppercase' }}>Est. Procurement Gap</div>
                <div style={{ fontSize: '24px', fontWeight: '900', marginTop: '5px' }}>₹{procurementGap.toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => setActiveModal('bom')} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', padding: '12px 20px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>VIEW RECIPE</button>
                <button onClick={() => setActiveModal('indent')} style={{ background: '#fca311', color: '#14213d', border: 'none', padding: '12px 20px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', opacity: procurementGap === 0 ? 0.5 : 1 }} disabled={procurementGap === 0}>CREATE PURCHASE INDENT</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADMIN MODALS */}
      {activeModal === 'indent' && (
        <div className="modal-overlay">
          <div className="modal-box modal-box-wide" style={{ borderTop: '5px solid #fca311' }}>
            <div className="modal-header" style={{ background: '#fca311', color: '#14213d' }}>
              <h3 style={{ color: '#14213d', fontWeight: 'bold' }}>Generate Procurement Request</h3>
              <button className="close-btn" style={{ color: '#14213d' }} onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <form className="form-body" onSubmit={handleIndentSubmit}>
              <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '4px', border: '1px solid #fca311', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#e65100', fontSize: '14px' }}>Auto-Generated Gap Analysis</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Requesting purchase for <b>{deficitItems.length}</b> missing materials.</p>
              </div>
              <table className="req-table" style={{ marginBottom: '20px', border: '1px solid #eee' }}>
                <thead><tr><th>DEFICIT MATERIAL</th><th>QTY TO ORDER</th><th>EST. COST</th></tr></thead>
                <tbody>
                  {deficitItems.map((item, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 'bold', color: '#14213d' }}>{item.materialName}</td>
                      <td style={{ color: '#c0392b', fontWeight: 'bold' }}>{item.shortfall} {item.unit}</td>
                      <td>₹{item.estCost.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#14213d', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>SEND TO PURCHASE HUB</button>
                <button type="button" onClick={() => setActiveModal(null)} style={{ padding: '12px 20px', background: '#e5e5e5', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'history' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: '#14213d' }}><h3>Simulation Audit Log</h3><button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button></div>
            <div className="form-body" style={{ padding: 0, maxHeight: '400px', overflowY: 'auto' }}>
              {historyLogs.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No simulation history recorded yet.</div>
              ) : (
                <table className="req-table" style={{ margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#fff' }}>
                    <tr><th>DATE</th><th>TARGET ITEM</th><th>SIMULATED QTY</th><th>DEFICIT COST</th><th>PERFORMED BY</th></tr>
                  </thead>
                  <tbody>
                    {historyLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '12px', color: '#666' }}>{new Date(log.simulated_at).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 'bold', color: '#14213d' }}>{log.item_name}</td>
                        <td>{log.target_qty} Units</td>
                        <td style={{ color: log.procurement_gap > 0 ? '#c0392b' : '#27ae60', fontWeight: 'bold' }}>
                          ₹{parseFloat(log.procurement_gap).toLocaleString()}
                        </td>
                        <td>{log.user_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOM Modal */}
      {activeModal === 'bom' && results && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: '#27ae60' }}><h3>Simulation Recipe Requirements</h3><button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button></div>
            <div className="form-body" style={{ padding: 0 }}>
              <table className="req-table" style={{ margin: 0 }}>
                <thead><tr><th>MATERIAL</th><th>TOTAL REQUIRED FOR BUILD</th></tr></thead>
                <tbody>
                  {results.materialsNeeded.map((item, index) => (
                    <tr key={index}><td style={{ fontWeight: 'bold', color: '#14213d' }}>{item.materialName}</td><td>{item.requiredQty} {item.unit}</td></tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '15px', background: '#f8f9fa', textAlign: 'right' }}>
                <button onClick={() => setActiveModal(null)} style={{ background: '#14213d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>CLOSE</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


// ==============================================================================
// 2. GENERAL STAFF VIEW (No Purchase Indent Rights, No History logs)
// ==============================================================================
const StaffSimulationView = ({ user, token }) => {
  const [targetItemId, setTargetItemId] = useState(1);
  const [targetQuantity, setTargetQuantity] = useState(10);
  const [results, setResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);

  let feasibility = 100;
  if (results) {
    let totalReq = 0, totalShort = 0;
    results.materialsNeeded.forEach(item => {
      totalReq += item.requiredQty;
      totalShort += item.shortfall;
    });
    if (totalReq > 0) feasibility = Math.max(0, Math.round(((totalReq - totalShort) / totalReq) * 100));
  }

  const handleSimulate = async (e) => {
    e.preventDefault();
    setIsSimulating(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_URL}/simulation/explode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetItemId: Number(targetItemId), targetQuantity: Number(targetQuantity) }),
      });
      if (!response.ok) throw new Error('Simulation failed.');
      const data = await response.json();
      setTimeout(() => { setResults(data); setIsSimulating(false); }, 600);
    } catch (err) { setError(err.message); setIsSimulating(false); }
  };

  return (
    <>
      <div style={{ marginBottom: '25px' }}>
        <h2 style={{ color: '#14213d', margin: '0', fontSize: '28px', fontWeight: '900' }}>Simulation Hub</h2>
        <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Staff View: Material Deficit Checking</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: '30px' }}>
        <div className="sim-card" style={{ padding: '30px', borderTop: '6px solid #27ae60' }}>
          <form onSubmit={handleSimulate}>
            <div className="sim-input-group">
              <label className="sim-label">Target Finished Good</label>
              <select className="sim-field" value={targetItemId} onChange={(e) => setTargetItemId(e.target.value)}>
                <option value="1">Swift Car (Industrial Model)</option>
                <option value="2">Standard Turbine Assembly</option>
              </select>
            </div>
            <div className="sim-input-group">
              <label className="sim-label">Batch Quantity</label>
              <input type="number" className="sim-field" value={targetQuantity} onChange={(e) => setTargetQuantity(e.target.value)} min="1" />
            </div>
            <button type="submit" className="btn-run" disabled={isSimulating}>{isSimulating ? 'CALCULATING...' : 'CHECK FEASIBILITY'}</button>
            {error && <p style={{ color: '#c0392b', marginTop: '15px', fontSize: '13px', fontWeight: 'bold' }}>⚠️ {error}</p>}
          </form>
        </div>

        <div className="sim-card">
          <div className="hub-header"><span>MATERIAL REQUIREMENTS</span></div>
          <div style={{ minHeight: '400px', overflowY: 'auto' }}>
            {results ? (
              <table className="req-table">
                <thead><tr><th>MATERIAL</th><th>REQUIRED</th><th>AVAILABLE</th><th>SHORTFALL</th><th>STATUS</th></tr></thead>
                <tbody>
                  {results.materialsNeeded.map((item, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 'bold' }}>{item.materialName}</td>
                      <td>{item.requiredQty} {item.unit}</td>
                      <td>{item.currentStock} {item.unit}</td>
                      <td style={{ color: '#c0392b', fontWeight: 'bold' }}>{item.shortfall > 0 ? item.shortfall : '0'} {item.unit}</td>
                      <td><span className={item.status === 'Shortfall' ? 'badge-deficit' : 'badge-ok'}>{item.status.toUpperCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontWeight: 'bold' }}>Run to check stock limits.</div>}
          </div>
          {results && (
            <div style={{ padding: '20px', background: '#f8f9fa', borderTop: '1px solid #eee', textAlign: 'center' }}>
              <span style={{ color: '#c0392b', fontWeight: 'bold', fontSize: '12px' }}>*Only Admins can submit automatic purchase indents.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};


// ==============================================================================
// MASTER ROUTER COMPONENT
// ==============================================================================
const SimulationHub = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const safeRole = user?.role?.toLowerCase() || '';
  const isAdmin = safeRole === 'admin';
  const isProdLead = user?.employeeType === 'Production & Quality Lead';

  if (safeRole === 'contractor' || safeRole === 'user') {
    return (
      <div style={{ padding: '80px', textAlign: 'center', flex: 1, backgroundColor: '#f8f9fa' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>⛔</div>
        <h2 style={{ color: '#14213d', fontSize: '28px', fontWeight: '800' }}>Access Restricted</h2>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: '#14213d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px 40px', flex: 1, backgroundColor: '#e5e5e5', minHeight: '100vh', fontFamily: "Arial, sans-serif" }}>
      <style>
        {`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .sim-card { background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%); border: 1px solid rgba(20, 33, 61, 0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); animation: fadeInUp 0.6s ease-out; }
          .hub-header { background: #14213d; color: #fff; padding: 16px 22px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
          .sim-input-group { margin-bottom: 22px; }
          .sim-label { font-size: 11px; color: #999; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; }
          .sim-field { width: 100%; padding: 12px 14px; border: 1.5px solid rgba(20, 33, 61, 0.15); border-radius: 8px; font-size: 14px; outline: none; background: #fafbfc; }
          .sim-field:focus { border-color: #fca311; background: #ffffff; }
          .req-table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .req-table th { background: #f0f3f8; color: #14213d; padding: 14px 15px; text-align: left; font-size: 11px; text-transform: uppercase; position: sticky; top: 0; }
          .req-table td { padding: 13px 15px; border-bottom: 1px solid rgba(0,0,0,0.05); color: #333; }
          .badge-deficit { background: #ffebee; color: #c62828; border: 1px solid rgba(198, 40, 40, 0.4); padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
          .badge-ok { background: #e8f5e9; color: #2e7d32; border: 1px solid rgba(46, 125, 50, 0.4); padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
          .btn-run { width: 100%; background: #fca311; color: #14213d; border: none; padding: 15px; font-weight: 900; border-radius: 8px; cursor: pointer; transition: 0.3s; font-size: 14px; }
          .btn-run:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(252,163,17,0.3); }
          .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); animation: fadeInUp 0.3s ease; }
          .modal-box { background: #fff; width: 500px; border-radius: 12px; overflow: hidden; animation: scaleIn 0.3s ease; }
          .modal-box-wide { width: 650px; }
          .modal-header { background: #14213d; color: #fff; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
          .close-btn { background: none; border: none; color: #fff; font-size: 24px; cursor: pointer; }
          .form-body { padding: 30px; }
        `}
      </style>

      {isAdmin || isProdLead ? <AdminSimulationView user={user} token={token} /> : <StaffSimulationView user={user} token={token} />}
    </div>
  );
};

export default SimulationHub;