import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const ProductionQualityHub = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // --- 1. DB DRIVEN STATES ---
  const [activeJobs, setActiveJobs] = useState([]);
  const [qcQueue, setQcQueue] = useState([]);
  const [qcHistory, setQcHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 2. MODAL & FORM STATES ---
  const [activeModal, setActiveModal] = useState(null);
  const [selectedQc, setSelectedQc] = useState(null);
  const [jobForm, setJobForm] = useState({ product: '', qty: '' });
  const [downtimeForm, setDowntimeForm] = useState({ machine: '', reason: '' });
  const [qcForm, setQcForm] = useState({ status: '', notes: '' });
  const [explosionInput, setExplosionInput] = useState({ product: 'Industrial Turbine Blade', qty: '' });

  // --- 3. BULLETPROOF DB FETCH & MAPPING ---
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_URL}/production/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok) {
        // Safe Mapping: The '?.' and '|| []' stop the app from crashing if data is missing!
        setActiveJobs(data.activeJobs?.map(j => ({
          id: j.job_id,
          product: j.product_name,
          qty: j.qty,
          progress: j.progress,
          status: j.status
        })) || []);

        setQcQueue(data.qcQueue?.map(q => ({
          id: q.id,
          sourceJob: q.job_ref || q.job_reference || q.source_job || 'Unknown',
          item: q.item_name || 'Pending Item',
          qty: q.qty || 0,
          waitTime: 'Pending'
        })) || []);

        setQcHistory(data.qcHistory?.map(h => ({
          id: h.id,
          sourceJob: h.job_ref || h.job_reference || h.source_job || 'Unknown',
          item: h.item_name || 'Item',
          qty: h.qty || 0,
          status: h.status,
          notes: h.notes || 'No notes',
          timeCompleted: h.completed_at ? new Date(h.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
        })) || []);
      } else {
        console.error("Backend Error:", data.error);
      }
    } catch (error) {
      console.error("Failed to connect to backend:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token]);

  // --- 4. FORM API SUBMISSIONS ---
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_URL}/production/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(jobForm)
      });
      if (res.ok) {
        setJobForm({ product: '', qty: '' });
        setActiveModal(null);
        fetchDashboardData();
      }
    } catch (err) { alert("Server connection failed"); }
  };

  const handleDowntimeSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_URL}/production/downtime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(downtimeForm)
      });
      if (res.ok) {
        alert(`URGENT: Downtime logged for ${downtimeForm.machine}. Maintenance team has been notified.`);
        setDowntimeForm({ machine: '', reason: '' });
        setActiveModal(null);
      }
    } catch (err) { alert("Server connection failed"); }
  };

  const handleCalculateDeficit = () => {
    if (!explosionInput.qty) return alert("Please enter a Target Qty to calculate.");
    setActiveModal('deficit');
  };

  const handleQcSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_URL}/production/qc`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: selectedQc.id, status: qcForm.status, notes: qcForm.notes })
      });
      if (res.ok) {
        setQcForm({ status: '', notes: '' });
        setSelectedQc(null);
        setActiveModal(null);
        fetchDashboardData();
      }
    } catch (err) { alert("Server connection failed"); }
  };

  const openQcModal = (qcItem) => {
    setSelectedQc(qcItem);
    setActiveModal('qc');
  };

  // --- 5. RBAC GATE ---
  if (loading && !user) return <div style={{ padding: '80px', textAlign: 'center' }}>Authenticating...</div>;

  const safeRole = user?.role?.toLowerCase() || '';
  const isAdmin = safeRole === 'admin';
  const isProdLead = user?.employeeType === 'Production & Quality Lead';

  if (user && !isAdmin && !isProdLead) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", flex: 1, backgroundColor: '#f8f9fa' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>⛔</div>
        <h2 style={{ color: '#14213d', fontSize: '28px', fontWeight: '800' }}>Access Restricted</h2>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>Your department role does not include Manufacturing privileges.</p>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: '#14213d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px 40px', flex: 1, backgroundColor: '#e5e5e5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      {/* --- STYLES RETAINED --- */}
      <style>
        {`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
          
          .manufacturing-card { background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%); border: 1px solid rgba(20, 33, 61, 0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.6); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter: blur(8px); animation: fadeInUp 0.6s ease-out; height: 100%; }
          .manufacturing-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.8); border-color: rgba(252, 163, 17, 0.15); }
          
          .hub-header { background: linear-gradient(135deg, #14213d 0%, #1a2f4a 100%); color: #fff; padding: 16px 22px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; position: relative; overflow: hidden; }
          .hub-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(252, 163, 17, 0.1) 50%, transparent); animation: shimmer 3s infinite; }
          .hub-header span { position: relative; z-index: 1; }
          
          .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .data-table th { background: linear-gradient(135deg, #f0f3f8 0%, #e8ecf2 100%); color: #14213d; padding: 14px 15px; text-align: left; border-bottom: 2px solid rgba(20, 33, 61, 0.15); font-weight: 800; }
          .data-table td { padding: 13px 15px; border-bottom: 1px solid rgba(0, 0, 0, 0.05); color: #333; transition: all 0.3s ease; }
          .data-table tr:hover { background: linear-gradient(90deg, rgba(20, 33, 61, 0.06) 0%, rgba(252, 163, 17, 0.04) 100%); transform: scaleX(1.005); box-shadow: inset 4px 0 0 rgba(252, 163, 17, 0.4); }

          .progress-bar-bg { width: 100%; height: 8px; background: #eee; border-radius: 4px; margin-top: 5px; overflow: hidden; }
          .progress-fill { height: 100%; background: #14213d; border-radius: 4px; }

          .explosion-input { padding: 12px 14px; border: 1.5px solid rgba(20, 33, 61, 0.15); border-radius: 8px; width: 150px; font-size: 14px; outline: none; transition: all 0.3s ease; background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%); font-family: inherit; }
          .explosion-input:focus { border-color: #fca311; box-shadow: 0 0 0 4px rgba(252, 163, 17, 0.15), inset 0 2px 4px rgba(0,0,0,0.03); transform: translateY(-2px); background: #ffffff; }
          
          .btn-classic { background: linear-gradient(135deg, #fca311 0%, #f39517 100%); color: #14213d; border: none; padding: 12px 22px; font-weight: bold; border-radius: 8px; cursor: pointer; transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 12px rgba(252, 163, 17, 0.3); }
          .btn-classic:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(252, 163, 17, 0.4); }

          .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: linear-gradient(135deg, rgba(20, 33, 61, 0.4) 0%, rgba(0, 0, 0, 0.5) 100%); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(6px); animation: fadeInUp 0.3s ease; }
          .modal-box { background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%); width: 500px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2); overflow: hidden; animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); border: 1px solid rgba(255, 255, 255, 0.8); }
          .modal-header { background: linear-gradient(135deg, #14213d 0%, #1a2f4a 100%); color: #fff; padding: 22px 28px; display: flex; justify-content: space-between; align-items: center; }
          .modal-header h3 { margin: 0; font-size: 18px; font-weight: 900; }
          .close-btn { background: none; border: none; color: #fff; font-size: 28px; cursor: pointer; opacity: 0.8; }
          .close-btn:hover { opacity: 1; transform: scale(1.1) rotate(90deg); color: #fca311; }
          .form-body { padding: 30px; }
          .form-group { margin-bottom: 22px; animation: slideInLeft 0.5s ease-out backwards; }
          .form-label { display: block; font-size: 12px; color: #666; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; }
          .form-input { width: 100%; padding: 12px 14px; border: 1.5px solid rgba(20, 33, 61, 0.15); border-radius: 8px; font-size: 14px; box-sizing: border-box; outline: none; background: linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%); }
          .form-input:focus { border-color: #fca311; background: #ffffff; box-shadow: 0 0 0 4px rgba(252, 163, 17, 0.15); transform: translateY(-2px); }
        `}
      </style>

      {/* --- TOP HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ color: '#14213d', margin: '0', fontSize: '28px', fontWeight: '900' }}>Manufacturing Ops Hub</h2>
          <p style={{ margin: '5px 0 0 0', color: '#fca311', fontSize: '14px', fontWeight: 'bold' }}>Current View: {isAdmin ? 'Administrator' : user.employeeType}</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => setActiveModal('job')} style={{ background: '#14213d', color: '#fff', border: 'none', padding: '12px 24px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            + CREATE JOB CARD
          </button>
          <button onClick={() => setActiveModal('downtime')} style={{ background: '#ffffff', color: '#c0392b', border: '2px solid #c0392b', padding: '12px 24px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            ⚠️ LOG DOWNTIME
          </button>
        </div>
      </div>

      {/* --- PRODUCTION & QC GRID --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', marginBottom: '30px' }}>

        {/* LEFT: PRODUCTION FLOOR */}
        <div className="manufacturing-card">
          <div className="hub-header">
            <span>ACTIVE PRODUCTION FLOOR</span>
            <span style={{ fontSize: '12px', fontWeight: 'normal' }}>LIVE WORK ORDERS</span>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666', fontWeight: 'bold' }}>⏳ Fetching live operations...</div>
          ) : activeJobs.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888', fontWeight: 'bold' }}>📭 No active jobs in database.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>JOB ID</th>
                  <th>PRODUCT</th>
                  <th>PROGRESS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {activeJobs.map(job => (
                  <tr key={job.id}>
                    <td style={{ fontWeight: 'bold' }}>{job.id}</td>
                    <td>{job.product} <br /> <small style={{ color: '#888' }}>Qty: {job.qty}</small></td>
                    <td style={{ width: '150px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{job.progress}%</div>
                      <div className="progress-bar-bg">
                        <div className="progress-fill" style={{ width: `${job.progress}%`, background: job.progress > 90 ? '#27ae60' : job.progress === 0 ? '#888' : '#14213d' }}></div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: job.status === 'Queued' ? '#fca311' : '#14213d' }}>{job.status?.toUpperCase() || 'UNKNOWN'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* RIGHT: QC INSPECTION QUEUE */}
        <div className="manufacturing-card" style={{ borderTop: '5px solid #fca311' }}>
          <div className="hub-header" style={{ background: '#fca311', color: '#14213d' }}>
            <span>QC INSPECTION QUEUE</span>
            <span style={{ fontSize: '18px' }}>🔍</span>
          </div>
          <div style={{ padding: '15px' }}>
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>Loading...</div>
            ) : qcQueue.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#888', fontWeight: 'bold' }}>✅ All caught up! Queue is empty.</div>
            ) : (
              qcQueue.map(qc => (
                <div key={qc.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#14213d' }}>{qc.item} <small style={{ color: '#666' }}>({qc.qty} units)</small></div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Source: {qc.sourceJob} | Waiting: <span style={{ color: '#c0392b', fontWeight: 'bold' }}>{qc.waitTime}</span></div>
                  </div>
                  <button onClick={() => openQcModal(qc)} style={{ padding: '6px 12px', background: '#14213d', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                    INSPECT
                  </button>
                </div>
              ))
            )}

            <button onClick={() => setActiveModal('history')} style={{ width: '100%', padding: '12px', marginTop: '15px', background: 'transparent', border: '2px dashed #ccc', color: '#888', fontWeight: 'bold', cursor: 'pointer' }}>
              View History Log
            </button>
          </div>
        </div>
      </div>

      {/* --- REVERSE EXPLOSION UTILITY --- */}
      <div className="manufacturing-card" style={{ borderLeft: '8px solid #fca311' }}>
        <div style={{ padding: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '40px' }}>⚙️</div>
            <div>
              <h3 style={{ margin: 0, color: '#14213d' }}>Reverse Explosion Calculator</h3>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>Input production goals to calculate raw material deficits based on BOM.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <select className="explosion-input" style={{ width: '200px' }} value={explosionInput.product} onChange={(e) => setExplosionInput({ ...explosionInput, product: e.target.value })}>
              <option>Industrial Turbine Blade</option>
              <option>Hydraulic Seals</option>
              <option>Gear Assembly</option>
            </select>
            <input type="number" placeholder="Target Qty" className="explosion-input" value={explosionInput.qty} onChange={(e) => setExplosionInput({ ...explosionInput, qty: e.target.value })} />
            <button className="btn-classic" onClick={handleCalculateDeficit}>CALCULATE DEFICIT</button>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* 1. CREATE JOB CARD MODAL */}
      {activeModal === 'job' && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Create Production Job Card</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <form className="form-body" onSubmit={handleJobSubmit}>
              <div className="form-group">
                <label className="form-label">Target Product</label>
                <input type="text" className="form-input" required placeholder="e.g. Assembled Turbine V2" value={jobForm.product} onChange={(e) => setJobForm({ ...jobForm, product: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Batch Quantity</label>
                <input type="number" className="form-input" required placeholder="e.g. 500" value={jobForm.qty} onChange={(e) => setJobForm({ ...jobForm, qty: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#14213d', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>ISSUE TO FLOOR</button>
                <button type="button" onClick={() => setActiveModal(null)} style={{ padding: '12px 20px', background: '#e5e5e5', color: '#333', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. LOG DOWNTIME MODAL */}
      {activeModal === 'downtime' && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ borderTop: '5px solid #c0392b' }}>
            <div className="modal-header" style={{ background: '#c0392b', color: '#fff' }}>
              <h3>⚠️ Log Machine Downtime</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <form className="form-body" onSubmit={handleDowntimeSubmit}>
              <div className="form-group">
                <label className="form-label">Affected Machine / Workstation</label>
                <input type="text" className="form-input" required placeholder="e.g. CNC Milling Machine A1" value={downtimeForm.machine} onChange={(e) => setDowntimeForm({ ...downtimeForm, machine: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Primary Reason</label>
                <input type="text" className="form-input" required placeholder="e.g. Electrical failure" value={downtimeForm.reason} onChange={(e) => setDowntimeForm({ ...downtimeForm, reason: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#c0392b', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>REPORT FAILURE</button>
                <button type="button" onClick={() => setActiveModal(null)} style={{ padding: '12px 20px', background: '#e5e5e5', color: '#333', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. CALCULATE DEFICIT MODAL */}
      {activeModal === 'deficit' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box" style={{ width: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: '#fca311', color: '#14213d' }}>
              <h3>BOM Explosion Results</h3>
              <button className="close-btn" style={{ color: '#14213d' }} onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="form-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <div><span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold' }}>TARGET PRODUCT</span><div style={{ fontWeight: 'bold', color: '#14213d', fontSize: '16px' }}>{explosionInput.product}</div></div>
                <div style={{ textAlign: 'right' }}><span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold' }}>SIMULATED QTY</span><div style={{ fontWeight: 'bold', color: '#14213d', fontSize: '16px' }}>{explosionInput.qty} Units</div></div>
              </div>
              <table className="data-table" style={{ marginBottom: '20px' }}>
                <thead><tr><th style={{ background: '#f1f1f1', fontSize: '11px' }}>RAW MATERIAL</th><th style={{ background: '#f1f1f1', fontSize: '11px' }}>REQUIRED</th><th style={{ background: '#f1f1f1', fontSize: '11px' }}>AVAILABLE</th><th style={{ background: '#f1f1f1', fontSize: '11px' }}>STATUS</th></tr></thead>
                <tbody>
                  <tr><td style={{ fontWeight: 'bold' }}>Steel Alloy Sheets</td><td>{explosionInput.qty * 2.5} kg</td><td>1,200 kg</td><td><span style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '11px', background: '#e8f5e9', padding: '2px 6px', borderRadius: '2px' }}>Sufficient</span></td></tr>
                  <tr><td style={{ fontWeight: 'bold' }}>Binding Resin</td><td>{explosionInput.qty * 0.5} Ltr</td><td>45 Ltr</td><td><span style={{ color: '#c0392b', fontWeight: 'bold', fontSize: '11px', background: '#ffebee', padding: '2px 6px', borderRadius: '2px' }}>Deficit</span></td></tr>
                </tbody>
              </table>
              <button onClick={() => setActiveModal(null)} style={{ width: '100%', padding: '12px', background: '#14213d', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>CLOSE SIMULATION</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. QC INSPECTION MODAL */}
      {activeModal === 'qc' && selectedQc && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header"><h3>QC Inspection Report</h3><button className="close-btn" onClick={() => { setActiveModal(null); setSelectedQc(null); }}>&times;</button></div>
            <form className="form-body" onSubmit={handleQcSubmit}>
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold' }}>BATCH / ITEM</span><span style={{ fontWeight: 'bold', color: '#14213d' }}>{selectedQc.item} ({selectedQc.qty} units)</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold' }}>SOURCE JOB</span><span style={{ fontWeight: 'bold', color: '#14213d' }}>{selectedQc.sourceJob}</span></div>
              </div>
              <div className="form-group">
                <label className="form-label">Inspection Result</label>
                <select className="form-input" required value={qcForm.status} onChange={(e) => setQcForm({ ...qcForm, status: e.target.value })}>
                  <option value="" disabled>Select Pass/Fail Status...</option>
                  <option value="Approved">✅ Approved (Pass to Inventory)</option>
                  <option value="Rework">⚠️ Rework Required</option>
                  <option value="Rejected">❌ Rejected (Scrap Batch)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Inspector Notes / Defects</label>
                <textarea className="form-input" rows="3" placeholder="Enter notes..." value={qcForm.notes} onChange={(e) => setQcForm({ ...qcForm, notes: e.target.value })} style={{ resize: 'vertical' }}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#14213d', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>LOG RESULT</button>
                <button type="button" onClick={() => { setActiveModal(null); setSelectedQc(null); }} style={{ padding: '12px 20px', background: '#e5e5e5', color: '#333', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. HISTORY LOG MODAL */}
      {activeModal === 'history' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box" style={{ width: '700px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}><h3 style={{ color: '#14213d' }}>Inspection History Log</h3><button className="close-btn" style={{ color: '#14213d' }} onClick={() => setActiveModal(null)}>&times;</button></div>
            <div className="form-body" style={{ maxHeight: '500px', overflowY: 'auto', padding: '0' }}>
              {qcHistory.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No history yet.</div> : (
                <table className="data-table">
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}><tr><th>TIME</th><th>ITEM & SOURCE</th><th>RESULT</th><th>NOTES</th></tr></thead>
                  <tbody>
                    {qcHistory.map(history => (
                      <tr key={history.id}>
                        <td style={{ fontSize: '11px', fontWeight: 'bold', color: '#888' }}>{history.timeCompleted}</td>
                        <td><div style={{ fontWeight: 'bold', color: '#14213d' }}>{history.item} ({history.qty})</div><div style={{ fontSize: '11px', color: '#666' }}>{history.sourceJob}</div></td>
                        <td><span style={{ padding: '3px 6px', borderRadius: '3px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', background: history.status === 'Approved' ? '#e8f5e9' : history.status === 'Rework' ? '#fff3e0' : '#ffebee', color: history.status === 'Approved' ? '#2e7d32' : history.status === 'Rework' ? '#e65100' : '#c62828' }}>{history.status}</span></td>
                        <td style={{ fontSize: '12px', maxWidth: '180px' }}>{history.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductionQualityHub;