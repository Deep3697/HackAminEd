import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';

// ==============================================================================
// 1. ADMIN & EMPLOYEE VIEW 
// ==============================================================================
const AdminFinanceView = ({ user, token }) => {
  const [ledgers, setLedgers] = useState([]);
  const [compliance, setCompliance] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2023-24');
  const [journalForm, setJournalForm] = useState({ account: '', type: 'Debit', amount: '', mode: '' });

  const fetchData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_URL}/finance/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setLedgers(data.ledgers || []);
        setCompliance(data.compliance || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) fetchData(); }, [token]);

  const handleJournalSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_URL}/finance/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(journalForm)
      });
      if (res.ok) {
        setJournalForm({ account: '', type: 'Debit', amount: '', mode: '' });
        setActiveModal(null);
        fetchData(); // Refresh table
      }
    } catch (err) { alert("Failed to post entry"); }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#14213d', margin: '0', fontSize: '32px', fontWeight: '900', letterSpacing: '-1px' }}>Financial Integrity Hub</h2>
          <p style={{ margin: '8px 0 0 0', color: '#fca311', fontSize: '14px', fontWeight: 'bold' }}>
            Current View: {user?.role === 'admin' ? 'Administrator' : user?.employeeType || 'Internal Finance'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '14px' }}>
          <button className="btn-primary" onClick={() => setActiveModal('journal')}>+ CREATE JOURNAL ENTRY</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '30px' }}>
        <div className="finance-card">
          <div className="hub-header">
            <span>LIVE GENERAL LEDGER</span>
          </div>
          {loading ? <div style={{ padding: '20px', textAlign: 'center' }}>Syncing Ledger...</div> : (
            <table className="ledger-table">
              <thead>
                <tr><th>TXN ID</th><th>ACCOUNT HEAD / MODE</th><th>DATE</th><th>TYPE</th><th style={{ textAlign: 'left' }}>AMOUNT</th></tr>
              </thead>
              <tbody>
                {ledgers.map((txn) => (
                  <tr key={txn.id}>
                    <td style={{ fontWeight: 'bold', color: '#14213d' }}>{txn.txn_id}</td>
                    <td><div style={{ fontWeight: 'bold' }}>{txn.account_head}</div><div style={{ fontSize: '11px', color: '#999' }}>{txn.payment_mode}</div></td>
                    <td>{new Date(txn.txn_date).toLocaleDateString()}</td>
                    <td style={{ color: txn.txn_type === 'Credit' ? '#27ae60' : '#c0392b', fontWeight: '900' }}>{txn.txn_type === 'Credit' ? 'CR' : 'DR'}</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold', color: '#14213d' }}>${parseFloat(txn.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div className="finance-card">
            <div className="hub-header" style={{ background: 'linear-gradient(135deg, #fca311 0%, #f39517 100%)' }}>
              <span style={{ color: '#14213d' }}>COMPLIANCE MONITOR</span><span>⚖️</span>
            </div>
            <div style={{ padding: '10px 0' }}>
              {compliance.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '16px 18px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#14213d' }}>{item.task_name}</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>Deadline: {new Date(item.deadline).toLocaleDateString()}</div>
                  </div>
                  <span className={`status-pill status-${item.status.toLowerCase()}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeModal === 'journal' && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header"><h3>Create Journal Entry</h3><button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button></div>
            <form className="form-body" onSubmit={handleJournalSubmit}>
              <div className="form-group"><label className="form-label">Account Head</label><input type="text" className="form-input" required value={journalForm.account} onChange={(e) => setJournalForm({ ...journalForm, account: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group"><label className="form-label">Type</label><select className="form-input" value={journalForm.type} onChange={(e) => setJournalForm({ ...journalForm, type: e.target.value })}><option value="Debit">Debit (DR)</option><option value="Credit">Credit (CR)</option></select></div>
                <div className="form-group"><label className="form-label">Amount</label><input type="number" className="form-input" required value={journalForm.amount} onChange={(e) => setJournalForm({ ...journalForm, amount: e.target.value })} /></div>
              </div>
              <div className="form-group"><label className="form-label">Mode</label><select className="form-input" required value={journalForm.mode} onChange={(e) => setJournalForm({ ...journalForm, mode: e.target.value })}><option value="Bank Transfer">Bank Transfer</option><option value="Cheque">Cheque</option><option value="Credit Card">Credit Card</option><option value="Cash">Cash</option><option value="EFT">EFT</option></select></div>
              <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '15px' }}>POST ENTRY</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// ==============================================================================
// 2. CONTRACTOR VIEW
// ==============================================================================
const ContractorFinanceView = ({ user, token }) => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
        const res = await fetch(`${API_URL}/finance/contractor`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setInvoices(data.invoices || []);
      } catch (err) { console.error(err); }
    };
    if (token) fetchInvoices();
  }, [token]);

  return (
    <>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#14213d', margin: '0', fontSize: '32px', fontWeight: '900' }}>Invoices & Payments</h2>
        <p style={{ margin: '8px 0 0 0', color: '#fca311', fontSize: '14px', fontWeight: 'bold' }}>Vendor Portal: {user?.fullName}</p>
      </div>

      <div className="finance-card">
        <div className="hub-header"><span>YOUR SUBMITTED INVOICES</span></div>
        <table className="ledger-table">
          <thead><tr><th>INVOICE #</th><th>SUBMISSION DATE</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td style={{ fontWeight: 'bold', color: '#14213d' }}>{inv.invoice_ref}</td>
                <td>{new Date(inv.submitted_at).toLocaleDateString()}</td>
                <td style={{ fontWeight: 'bold' }}>${parseFloat(inv.amount).toLocaleString()}</td>
                <td><span className={`status-pill ${inv.status === 'Paid' ? 'status-completed' : 'status-pending'}`}>{inv.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ==============================================================================
// 3. USER VIEW
// ==============================================================================
const CustomerFinanceView = ({ user, token }) => {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
        const res = await fetch(`${API_URL}/finance/customer`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (res.ok) setBills(data.bills || []);
      } catch (err) { console.error(err); }
    };
    if (token) fetchBills();
  }, [token]);

  return (
    <>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#14213d', margin: '0', fontSize: '32px', fontWeight: '900' }}>Billing & Invoices</h2>
        <p style={{ margin: '8px 0 0 0', color: '#fca311', fontSize: '14px', fontWeight: 'bold' }}>Client Portal: {user?.fullName}</p>
      </div>

      <div className="finance-card">
        <div className="hub-header"><span>BILLING HISTORY</span></div>
        <table className="ledger-table">
          <thead><tr><th>BILL #</th><th>ORDER REF</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th></tr></thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id}>
                <td style={{ fontWeight: 'bold', color: '#14213d' }}>{bill.bill_ref}</td>
                <td>{bill.order_ref}</td>
                <td>{new Date(bill.issued_at).toLocaleDateString()}</td>
                <td style={{ fontWeight: 'bold' }}>${parseFloat(bill.amount).toLocaleString()}</td>
                <td><span className={`status-pill ${bill.status === 'Paid' ? 'status-completed' : 'status-pending'}`}>{bill.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ==============================================================================
// MASTER COMPONENT: SMART ROUTER
// ==============================================================================
const FinanceStatutoryHub = () => {
  const { user, token } = useAuth();
  const role = user?.role?.toLowerCase();

  return (
    <div style={{ padding: '30px 40px', flex: 1, background: '#e5e5e5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      <style>
        {`
          .finance-card { background: #ffffff; border: 1px solid rgba(20, 33, 61, 0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); margin-bottom: 20px;}
          .hub-header { background: #14213d; color: #fff; padding: 16px 22px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
          .ledger-table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .ledger-table th { background: #f0f3f8; color: #14213d; padding: 14px 15px; text-align: left; font-size: 11px; }
          .ledger-table td { padding: 13px 15px; border-bottom: 1px solid rgba(0,0,0,0.05); color: #333; }
          .status-pill { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #fff; display: inline-block; }
          .status-completed { background: #2e7d32; }
          .status-pending { background: #e65100; }
          .status-upcoming { background: #666; }
          .btn-primary { background: #14213d; color: #fff; border: none; padding: 12px 22px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 12px; }
          
          .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(6px); }
          .modal-box { background: #fff; width: 500px; border-radius: 16px; overflow: hidden; }
          .modal-header { background: #14213d; color: #fff; padding: 22px 28px; display: flex; justify-content: space-between; align-items: center; }
          .close-btn { background: none; border: none; color: #fff; font-size: 28px; cursor: pointer; }
          .form-body { padding: 30px; }
          .form-group { margin-bottom: 22px; }
          .form-label { display: block; font-size: 12px; color: #666; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; }
          .form-input { width: 100%; padding: 12px 14px; border: 1.5px solid rgba(20, 33, 61, 0.15); border-radius: 8px; outline: none; background: #fafbfc; }
        `}
      </style>

      {/* Render the appropriate view and pass the token! */}
      {role === 'contractor' ? (
        <ContractorFinanceView user={user} token={token} />
      ) : role === 'user' ? (
        <CustomerFinanceView user={user} token={token} />
      ) : (
        <AdminFinanceView user={user} token={token} />
      )}

    </div>
  );
};

export default FinanceStatutoryHub;