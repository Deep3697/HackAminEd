import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

// Helper function to generate the last 12 months dynamically
const generatePaymentCycles = (monthsCount = 12) => {
  const cycles = [];
  const currentDate = new Date();
  for (let i = 0; i < monthsCount; i++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = d.getFullYear();
    cycles.push(`${month} ${year}`);
  }
  return cycles;
};

// ==============================================================================
// 1. ADMIN & HR OFFICER VIEW (Full Control)
// ==============================================================================
const AdminHrView = ({ user, token }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [paymentCycle, setPaymentCycle] = useState('OCT 2023'); // Default for dummy data testing

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_URL}/hr/admin/${paymentCycle}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setEmployees(data.employees || []);
    } catch (err) {
      console.error("Failed to fetch payroll:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPayrollData();
  }, [token, paymentCycle]);

  const handleGenericAction = async (e, successMessage) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      await fetch(`${API_URL}/hr/action`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(successMessage);
      setActiveModal(null);
    } catch (err) {
      alert("Action failed to connect to server.");
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ color: '#14213d', margin: '0', fontSize: '28px', fontWeight: '900' }}>Workforce & Payroll Hub</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Unified Governance: Employee Attendance & Salary Processing</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-action" onClick={() => setActiveModal('reconcile')} style={{ background: '#ffffff', color: '#14213d', border: '2px solid #14213d' }}>RECONCILE LOGS</button>
          <button className="btn-action" onClick={() => setActiveModal('payroll')}>RUN MONTHLY PAYROLL</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="workforce-card" style={{ padding: '20px', borderTop: '4px solid #14213d' }}>
          <div className="kpi-label">Active Roster</div>
          <div className="kpi-value">142 <small style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>Heads</small></div>
        </div>
        <div className="workforce-card" style={{ padding: '20px', borderTop: '4px solid #27ae60' }}>
          <div className="kpi-label">Avg Attendance</div>
          <div className="kpi-value" style={{ color: '#27ae60' }}>94.2%</div>
        </div>
        <div className="workforce-card" style={{ padding: '20px', borderTop: '4px solid #fca311' }}>
          <div className="kpi-label">Gross Payroll Est.</div>
          <div className="kpi-value">₹42,850.00</div>
        </div>
        <div className="workforce-card" style={{ padding: '20px', borderTop: '4px solid #c0392b' }}>
          <div className="kpi-label">Statutory Dues</div>
          <div className="kpi-value" style={{ color: '#c0392b' }}>₹6,730.00</div>
        </div>
      </div>

      <div className="workforce-card">
        <div className="hub-header">
          <span>EMPLOYEE LEDGER: ATTENDANCE & EARNINGS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#fca311', textTransform: 'uppercase' }}>Cycle:</span>
            <select value={paymentCycle} onChange={(e) => setPaymentCycle(e.target.value)} style={{ background: '#ffffff33', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold', outline: 'none' }}>
              <option value="OCT 2023">OCT 2023</option>
              <option value="SEP 2023">SEP 2023</option>
              <option value="AUG 2023">AUG 2023</option>
            </select>
          </div>
        </div>
        {loading ? <div style={{ padding: '30px', textAlign: 'center' }}>Loading HR Database...</div> : (
          <table className="staff-table">
            <thead>
              <tr><th>EMP ID</th><th>NAME</th><th>ATTENDANCE</th><th>GROSS PAY</th><th>NET PAYOUT</th><th style={{ textAlign: 'left' }}>STATUS</th></tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: 'bold', color: '#14213d' }}>TEL-{emp.id}</td>
                  <td><div style={{ fontWeight: 'bold' }}>{emp.name}</div></td>
                  <td style={{ fontWeight: '900', color: parseFloat(emp.attendance) < 95 ? '#c0392b' : '#333' }}>{emp.attendance}%</td>
                  <td style={{ fontFamily: 'monospace' }}>₹{parseFloat(emp.gross).toLocaleString()}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#14213d' }}>₹{parseFloat(emp.net).toLocaleString()}</td>
                  <td style={{ textAlign: 'left' }}><span className={`status-badge status-${emp.status.toLowerCase()}`}>{emp.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {activeModal === 'reconcile' && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header"><h3>Reconcile Biometric Logs</h3><button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button></div>
            <form className="form-body" onSubmit={(e) => handleGenericAction(e, 'Logs Reconciled')}>
              <div className="form-group"><label className="form-label">Data Source</label><select className="form-input" required><option value="bio_api">Biometric Device API</option><option value="timesheet">Digital Timesheets</option></select></div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}><button type="submit" className="btn-action" style={{ flex: 1 }}>SYNC DATA</button><button type="button" onClick={() => setActiveModal(null)} className="btn-action" style={{ background: '#e5e5e5', color: '#333' }}>CANCEL</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// ==============================================================================
// 2. GENERAL EMPLOYEE VIEW (Self-Service)
// ==============================================================================
const EmployeeHrView = ({ user, token }) => {
  const [myPayslips, setMyPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPayslips = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
        const res = await fetch(`${API_URL}/hr/employee`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setMyPayslips(data.payslips || []);
      } catch (err) {
        console.error("Failed to fetch personal payslips:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchMyPayslips();
  }, [token]);

  return (
    <>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#14213d', margin: '0', fontSize: '32px', fontWeight: '900' }}>My HR & Payroll</h2>
        <p style={{ margin: '8px 0 0 0', color: '#fca311', fontSize: '14px', fontWeight: 'bold' }}>Employee Self-Service: {user?.fullName}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="workforce-card" style={{ padding: '20px', borderTop: '4px solid #27ae60' }}><div className="kpi-label">My Attendance (MTD)</div><div className="kpi-value" style={{ color: '#27ae60' }}>98.5%</div></div>
        <div className="workforce-card" style={{ padding: '20px', borderTop: '4px solid #fca311' }}><div className="kpi-label">Leave Balance</div><div className="kpi-value">12 Days</div></div>
        <div className="workforce-card" style={{ padding: '20px', borderTop: '4px solid #14213d' }}><div className="kpi-label">YTD Net Earnings</div><div className="kpi-value">₹24,400.00</div></div>
      </div>

      <div className="workforce-card">
        <div className="hub-header"><span>MY RECENT PAYSLIPS</span></div>
        {loading ? <div style={{ padding: '30px', textAlign: 'center' }}>Fetching documents...</div> : (
          <table className="staff-table">
            <thead>
              <tr><th>PAYSLIP ID</th><th>CYCLE</th><th>GROSS PAY</th><th>NET PAYOUT</th><th>STATUS</th><th style={{ textAlign: 'right' }}>ACTION</th></tr>
            </thead>
            <tbody>
              {myPayslips.map((slip) => (
                <tr key={slip.id}>
                  <td style={{ fontWeight: 'bold', color: '#14213d' }}>{slip.id}</td>
                  <td style={{ fontWeight: 'bold' }}>{slip.cycle}</td>
                  <td>₹{parseFloat(slip.gross).toLocaleString()}</td>
                  <td style={{ color: '#27ae60', fontWeight: 'bold' }}>₹{parseFloat(slip.net).toLocaleString()}</td>
                  <td><span className={`status-badge status-${slip.status.toLowerCase()}`}>{slip.status}</span></td>
                  <td style={{ textAlign: 'right' }}><button style={{ background: 'none', border: 'none', color: '#14213d', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

// ==============================================================================
// 3. MASTER COMPONENT (Smart Router)
// ==============================================================================
const HRPayrollHub = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const role = user?.role?.toLowerCase();
  const isAdmin = role === 'admin';
  const isHrOfficer = user?.employeeType === 'HR & Payroll Officer';

  if (role === 'contractor' || role === 'user') {
    return (
      <div style={{ padding: '80px', textAlign: 'center', flex: 1, backgroundColor: '#f8f9fa' }}>
        <div style={{ fontSize: '60px' }}>⛔</div>
        <h2>Access Restricted</h2>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: '#14213d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px 40px', flex: 1, backgroundColor: '#e5e5e5', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
      <style>
        {`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .workforce-card { background: #ffffff; border: 1px solid rgba(20, 33, 61, 0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); animation: fadeInUp 0.6s ease-out; }
          .hub-header { background: #14213d; color: #fff; padding: 16px 22px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
          .staff-table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .staff-table th { background: #f0f3f8; color: #14213d; padding: 14px 15px; text-align: left; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid rgba(20,33,61,0.15); }
          .staff-table td { padding: 13px 15px; border-bottom: 1px solid rgba(0,0,0,0.05); color: #333; }
          .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; display: inline-block; color: #fff; }
          .status-dispatched { background: #2e7d32; }
          .status-pending { background: #f0ad4e; }
          .kpi-value { font-size: 26px; font-weight: 900; color: #14213d; margin-top: 8px; }
          .kpi-label { color: #999; font-size: 11px; font-weight: bold; text-transform: uppercase; }
          .btn-action { background: #14213d; color: #fff; border: none; padding: 12px 22px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 12px; transition: 0.3s; }
          .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
          .modal-box { background: #fff; width: 500px; border-radius: 12px; overflow: hidden; }
          .modal-header { background: #14213d; color: #fff; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
          .close-btn { background: none; border: none; color: #fff; font-size: 24px; cursor: pointer; }
          .form-body { padding: 30px; }
          .form-label { display: block; font-size: 12px; color: #666; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; }
          .form-input { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 6px; outline: none; }
        `}
      </style>

      {isAdmin || isHrOfficer ? <AdminHrView user={user} token={token} /> : <EmployeeHrView user={user} token={token} />}
    </div>
  );
};

export default HRPayrollHub;