import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';

const QualityHub = () => {
  const { user, token } = useAuth();

  const [qcQueue, setQcQueue] = useState([]);
  const [qcHistory, setQcHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedQc, setSelectedQc] = useState(null);
  const [qcForm, setQcForm] = useState({ status: '', notes: '' });

  const fetchQualityData = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_URL}/production/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
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
      }
    } catch (error) {
      console.error("Failed to fetch quality data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchQualityData();
  }, [token]);

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
        fetchQualityData();
      }
    } catch (err) { alert("Server connection failed"); }
  };

  const openQcModal = (qcItem) => {
    setSelectedQc(qcItem);
    setActiveModal('qc');
  };

  const safeRole = user?.role?.toLowerCase() || '';
  const isAdmin = safeRole === 'admin';
  const isContractor = safeRole === 'contractor';
  const isQualityTeam = user?.employeeType === 'Production & Quality' || user?.employeeType === 'Production & Quality Lead';

  // Even if not strictly checked by AppRoutes, we ensure local UI makes sense
  if (!isAdmin && !isContractor && !isQualityTeam) {
    return <div style={{ padding: '80px', textAlign: 'center' }}>You do not have Quality clearance.</div>;
  }

  return (
    <div style={{ padding: '30px 40px', flex: 1, backgroundColor: '#e5e5e5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <style>
        {`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .quality-card { background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%); border: 1px solid rgba(20, 33, 61, 0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); animation: fadeInUp 0.6s ease-out; }
          .hub-header { background: linear-gradient(135deg, #14213d 0%, #1a2f4a 100%); color: #fff; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
          .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .data-table th { background: linear-gradient(135deg, #f0f3f8 0%, #e8ecf2 100%); color: #14213d; padding: 14px 15px; text-align: left; border-bottom: 2px solid rgba(20, 33, 61, 0.15); font-weight: 800; }
          .data-table td { padding: 13px 15px; border-bottom: 1px solid rgba(0, 0, 0, 0.05); color: #333; }
          .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(6px); }
          .modal-box { background: #fff; width: 500px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2); overflow: hidden; animation: scaleIn 0.3s; }
          .modal-header { background: #14213d; color: #fff; padding: 22px 28px; display: flex; justify-content: space-between; align-items: center; }
          .close-btn { background: none; border: none; color: #fff; font-size: 28px; cursor: pointer; }
          .form-body { padding: 30px; }
          .form-group { margin-bottom: 22px; }
          .form-label { display: block; font-size: 12px; color: #666; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; }
          .form-input { width: 100%; padding: 12px 14px; border: 1.5px solid rgba(20, 33, 61, 0.15); border-radius: 8px; font-size: 14px; outline: none; }
        `}
      </style>

      {/* --- TOP HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ color: '#14213d', margin: '0', fontSize: '28px', fontWeight: '900' }}>Quality Assurance Hub</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            {isContractor ? "Vendor Quality Specifications & Checks" : "Factory QC Inspection Pipeline"}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* QC INSPECTION QUEUE */}
        <div className="quality-card" style={{ borderTop: '5px solid #fca311' }}>
          <div className="hub-header" style={{ background: '#fca311', color: '#14213d' }}>
            <span>QC INSPECTION QUEUE</span>
            <span style={{ fontSize: '18px' }}>🔍</span>
          </div>
          <div style={{ padding: '15px' }}>
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>Syncing data...</div>
            ) : qcQueue.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#888', fontWeight: 'bold' }}>✅ All caught up! Queue is empty.</div>
            ) : (
              qcQueue.map(qc => (
                <div key={qc.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#14213d' }}>{qc.item} <small style={{ color: '#666' }}>({qc.qty} units)</small></div>
                    <div style={{ fontSize: '12px', color: '#888' }}>Source: {qc.sourceJob} | Waiting: <span style={{ color: '#c0392b', fontWeight: 'bold' }}>{qc.waitTime}</span></div>
                  </div>
                  {!isContractor && (
                    <button onClick={() => openQcModal(qc)} style={{ padding: '6px 12px', background: '#14213d', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                      INSPECT
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT QC HISTORY */}
        <div className="quality-card">
          <div className="hub-header" style={{ background: '#27ae60' }}>
            <span>RECENT INSPECTION HISTORY</span>
            <span style={{ fontSize: '18px' }}>📋</span>
          </div>
          <div style={{ padding: '15px' }}>
            {loading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>Syncing data...</div>
            ) : qcHistory.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: '#888', fontWeight: 'bold' }}>No history yet.</div>
            ) : (
              qcHistory.slice(0, 10).map(history => (
                <div key={history.id} style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', color: '#14213d' }}>{history.item} <small style={{ color: '#666' }}>({history.qty})</small></div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', background: history.status === 'Approved' ? '#e8f5e9' : history.status === 'Rework' ? '#fff3e0' : '#ffebee', color: history.status === 'Approved' ? '#2e7d32' : history.status === 'Rework' ? '#e65100' : '#c62828' }}>
                      {history.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Source: {history.sourceJob} | Finished: {history.timeCompleted}</div>
                  <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#888' }}>Notes: {history.notes}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* QC INSPECTION MODAL */}
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
    </div>
  );
};

export default QualityHub;
