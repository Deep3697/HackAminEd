import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

// ==============================================================================
// 1. ADMIN & HR OFFICER VIEW (Full Control)
// ==============================================================================
const AdminHrView = ({ user, token }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [allCycles, setAllCycles] = useState([]);

  // Dynamic cycle selector state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase());
  const paymentCycle = `${selectedMonth} ${selectedYear}`;

  // Attendance modal states
  const [allEmployeesList, setAllEmployeesList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Summary KPIs
  const [summary, setSummary] = useState({ totalHeads: 0, avgAttendance: '0.0', grossTotal: '0.00', statutoryDues: '0.00' });

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://telos-backend-y3zm.onrender.com/api';

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/hr/admin/${paymentCycle}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setEmployees(data.employees || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error("Failed to fetch payroll:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCycles = async () => {
    try {
      const res = await fetch(`${API_URL}/hr/cycles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAllCycles(data.cycles || []);
    } catch (err) {
      console.error("Failed to fetch cycles:", err);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const res = await fetch(`${API_URL}/hr/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAllEmployeesList(data.employees || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPayrollData();
      fetchCycles();
    }
  }, [token, paymentCycle]);

  // Fetch attendance for selected employee
  const fetchAttendance = async (empId) => {
    setAttendanceLoading(true);
    try {
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const monthNum = monthNames.indexOf(selectedMonth) + 1;
      const res = await fetch(`${API_URL}/hr/attendance/${empId}/${selectedYear}/${monthNum}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAttendanceData(data.attendance || {});
        setSelectedEmployee({ id: empId, name: data.employeeName });
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleMarkAttendance = async (empId, date, status) => {
    try {
      const res = await fetch(`${API_URL}/hr/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employeeId: empId, date, status })
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setAttendanceData(prev => ({ ...prev, [date]: status }));
      }
    } catch (err) {
      alert("Failed to mark attendance");
    }
  };

  const handleRunPayroll = async () => {
    if (!window.confirm(`Are you sure you want to run payroll for ${paymentCycle}? This will recalculate salaries based on attendance.`)) return;
    try {
      const res = await fetch(`${API_URL}/hr/payroll/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cycle: paymentCycle })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchPayrollData(); // Refresh the table
      } else {
        alert(data.error || 'Payroll run failed');
      }
    } catch (err) {
      alert("Server connection failed");
    }
  };

  // Generate days for the month
  const getDaysInMonth = () => {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthNum = monthNames.indexOf(selectedMonth);
    const daysCount = new Date(selectedYear, monthNum + 1, 0).getDate();
    const days = [];
    for (let d = 1; d <= daysCount; d++) {
      const date = new Date(selectedYear, monthNum, d);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      days.push({ date: dateStr, day: d, dayName, isWeekend });
    }
    return days;
  };

  // Generate year options
  const yearOptions = [];
  for (let y = new Date().getFullYear(); y >= 2020; y--) yearOptions.push(y);
  const monthOptions = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ color: '#14213d', margin: '0', fontSize: '28px', fontWeight: '900' }}>Workforce & Payroll Hub</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Unified Governance: Employee Attendance & Salary Processing</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-action" onClick={() => { fetchAllEmployees(); setSelectedEmployee(null); setActiveModal('attendance'); }} style={{ background: '#ffffff', color: '#14213d', border: '2px solid #14213d' }}>ATTENDANCE</button>
          <button className="btn-action" onClick={handleRunPayroll}>RUN MONTHLY PAYROLL</button>
        </div>
      </div>

      {/* KPI CARDS - Now dynamic from DB */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="workforce-card" style={{ padding: '20px', borderTop: '4px solid #14213d' }}>
          <div className="kpi-label">Active Roster</div>
          <div className="kpi-value">{summary.totalHeads} <small style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>Heads</small></div>
        </div>
        <div className="workforce-card" style={{ padding: '20px', borderTop: '4px solid #27ae60' }}>
          <div className="kpi-label">Avg Attendance</div>
          <div className="kpi-value" style={{ color: '#27ae60' }}>{summary.avgAttendance}%</div>
        </div>
        <div className="workforce-card" style={{ padding: '20px', borderTop: '4px solid #fca311' }}>
          <div className="kpi-label">Gross Payroll Est.</div>
          <div className="kpi-value">₹{parseFloat(summary.grossTotal).toLocaleString()}</div>
        </div>
        <div className="workforce-card" style={{ padding: '20px', borderTop: '4px solid #c0392b' }}>
          <div className="kpi-label">Statutory Dues</div>
          <div className="kpi-value" style={{ color: '#c0392b' }}>₹{parseFloat(summary.statutoryDues).toLocaleString()}</div>
        </div>
      </div>

      {/* EMPLOYEE LEDGER TABLE */}
      <div className="workforce-card">
        <div className="hub-header">
          <span>EMPLOYEE LEDGER: ATTENDANCE & EARNINGS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#fca311', textTransform: 'uppercase' }}>Cycle:</span>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ background: '#ffffff33', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold', outline: 'none' }}>
              {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} style={{ background: '#ffffff33', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold', outline: 'none' }}>
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        {loading ? <div style={{ padding: '30px', textAlign: 'center' }}>Loading HR Database...</div> : (
          <table className="staff-table">
            <thead>
              <tr><th>EMP ID</th><th>NAME</th><th>ATTENDANCE</th><th>GROSS PAY</th><th>NET PAYOUT</th><th style={{ textAlign: 'left' }}>STATUS</th></tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#888' }}>No payroll data for {paymentCycle}. Click "RUN MONTHLY PAYROLL" to generate.</td></tr>
              ) : employees.map(emp => (
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

      {/* ATTENDANCE MODAL */}
      {activeModal === 'attendance' && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ width: '800px' }}>
            <div className="modal-header">
              <h3>{selectedEmployee ? `Attendance: ${selectedEmployee.name} — ${selectedMonth} ${selectedYear}` : 'Employee Attendance Management'}</h3>
              <button className="close-btn" onClick={() => { setActiveModal(null); setSelectedEmployee(null); }}>&times;</button>
            </div>
            <div className="form-body" style={{ maxHeight: '500px', overflowY: 'auto', padding: selectedEmployee ? '20px' : '30px' }}>
              {!selectedEmployee ? (
                // Step 1: Select an employee
                <>
                  <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Select an employee to view and manage their attendance for <strong>{selectedMonth} {selectedYear}</strong>.</p>
                  {allEmployeesList.length === 0 ? (
                    <div style={{ padding: '30px', textAlign: 'center', color: '#888' }}>Loading employees...</div>
                  ) : (
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {allEmployeesList.map(emp => (
                        <div key={emp.id} onClick={() => fetchAttendance(emp.id)} style={{ padding: '12px 16px', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.2s' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#e8f5e9'; e.currentTarget.style.borderColor = '#27ae60'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = '#eee'; }}
                        >
                          <div>
                            <strong style={{ color: '#14213d' }}>TEL-{emp.id}</strong>
                            <span style={{ marginLeft: '12px', color: '#333' }}>{emp.name}</span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#888', fontWeight: 'bold' }}>VIEW →</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : attendanceLoading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>Loading attendance data...</div>
              ) : (
                // Step 2: Daily attendance grid
                <>
                  <button onClick={() => setSelectedEmployee(null)} style={{ marginBottom: '15px', background: 'none', border: 'none', color: '#14213d', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>← Back to employees</button>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                    {getDaysInMonth().map(dayInfo => {
                      const status = attendanceData[dayInfo.date] || (dayInfo.isWeekend ? 'weekend' : 'unmarked');
                      const bgColor = status === 'present' ? '#e8f5e9' : status === 'absent' ? '#ffebee' : dayInfo.isWeekend ? '#f5f5f5' : '#fff';
                      const borderColor = status === 'present' ? '#27ae60' : status === 'absent' ? '#c0392b' : '#ddd';

                      return (
                        <div key={dayInfo.date} style={{ padding: '8px', border: `2px solid ${borderColor}`, borderRadius: '6px', textAlign: 'center', background: bgColor, cursor: dayInfo.isWeekend ? 'default' : 'pointer', opacity: dayInfo.isWeekend ? 0.5 : 1, transition: '0.2s' }}
                          onClick={() => {
                            if (dayInfo.isWeekend) return;
                            const newStatus = status === 'present' ? 'absent' : 'present';
                            handleMarkAttendance(selectedEmployee.id, dayInfo.date, newStatus);
                          }}
                        >
                          <div style={{ fontSize: '10px', color: '#888', fontWeight: 'bold' }}>{dayInfo.dayName}</div>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: '#14213d', margin: '2px 0' }}>{dayInfo.day}</div>
                          <div style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', color: status === 'present' ? '#27ae60' : status === 'absent' ? '#c0392b' : '#999' }}>
                            {dayInfo.isWeekend ? 'OFF' : status === 'unmarked' ? '—' : status.toUpperCase()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: '15px', display: 'flex', gap: '15px', fontSize: '12px', color: '#666' }}>
                    <span>🟢 Present</span>
                    <span>🔴 Absent</span>
                    <span>⬜ Unmarked (click to toggle)</span>
                  </div>
                </>
              )}
            </div>
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
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://telos-backend-y3zm.onrender.com/api';
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