import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import API from '../../services/api';

const PurchaseHub = () => {
  const { user } = useAuth();
  
  const safeRole = user?.role?.toLowerCase() || '';
  const isAdmin = safeRole === 'admin';
  const isContractor = safeRole === 'contractor';

  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [indentForm, setIndentForm] = useState({ vendor: '', amount: '', item: '' });

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const response = await API.get('/commercial/purchases');
      if (response.data.success) {
        setPurchaseOrders(response.data.purchases);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  let visiblePurchaseOrders = purchaseOrders;
  if (!isAdmin) {
      if (isContractor) {
          visiblePurchaseOrders = purchaseOrders.filter(order => order.vendor === user?.fullName);
      } else {
          visiblePurchaseOrders = purchaseOrders.filter(order => order.createdBy === (user?.fullName || 'Current User') || order.department === user?.employeeType);
      }
  }

  const handleIndentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/commercial/purchases', {
        ...indentForm,
        department: user?.employeeType || 'General Operations'
      });
      
      if (response.data.success) {
        setIndentForm({ vendor: '', amount: '', item: '' });
        setActiveModal(null);
        fetchPurchases();
      }
    } catch (error) {
      alert("Error saving purchase indent.");
    }
  };

  const handleAdminApprove = async (poId) => {
    try {
      const response = await API.put(`/commercial/purchases/${poId}/approve`);
      if (response.data.success) {
        setPurchaseOrders(purchaseOrders.map(po => po.id === poId ? { ...po, status: 'Approved' } : po));
      }
    } catch (error) {
      alert("Error approving order.");
    }
  };

  return (
    <div style={{ padding: '30px 40px', flex: 1, backgroundColor: '#e5e5e5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <style>
        {`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .hub-card { background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%); border: 1px solid rgba(20, 33, 61, 0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); animation: fadeInUp 0.6s ease-out; }
          .section-header { background: linear-gradient(135deg, #14213d 0%, #1a2f4a 100%); color: #fff; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; }
          .commercial-table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .commercial-table th { background: linear-gradient(135deg, #f0f3f8 0%, #e8ecf2 100%); color: #14213d; padding: 14px 15px; text-align: left; border-bottom: 2px solid rgba(20, 33, 61, 0.15); font-weight: 800; }
          .commercial-table td { padding: 13px 15px; border-bottom: 1px solid rgba(0, 0, 0, 0.05); color: #333; }
          .status-tag { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #fff; }
          .admin-approve-btn { background: #27ae60; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; margin-left: 10px; transition: 0.2s; }
          .admin-approve-btn:hover { background: #219653; transform: scale(1.05); }
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
          <h2 style={{ color: '#14213d', margin: '0', fontSize: '28px', fontWeight: '900' }}>Purchase Orders Hub</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            {isAdmin ? "Global Procurement Overview" : isContractor ? "Vendor Purchase Contracts" : `${user?.employeeType} Department Expense Requests`}
          </p>
        </div>
        {!isContractor && (
          <button onClick={() => setActiveModal('indent')} style={{ background: '#fca311', color: '#14213d', border: 'none', padding: '12px 24px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
            + NEW PURCHASE INDENT
          </button>
        )}
      </div>

      <div className="hub-card" style={{ borderTop: '4px solid #c0392b' }}>
        <div className="section-header" style={{ background: '#c0392b' }}>
          <span>{isContractor ? 'VENDOR PURCHASE ORDERS' : 'PURCHASE & VENDOR ORDERS'}</span>
          <span style={{ fontSize: '18px' }}>🛒</span>
        </div>
        {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Fetching orders...</div>
        ) : (
        <table className="commercial-table">
          <thead>
            <tr>
              <th>PO #</th>
              <th>VENDOR</th>
              <th>DEPT</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {visiblePurchaseOrders.map((order, idx) => (
              <tr key={order.id || idx}>
                <td style={{ fontWeight: 'bold' }}>{order.id}</td>
                <td>{order.vendor}</td>
                <td style={{ fontSize: '12px' }}>{order.dept || order.department || '-'}</td>
                <td style={{ fontWeight: 'bold' }}>{order.amount}</td>
                <td>
                  <span className="status-tag" style={{ background: order.status === 'Awaiting Auth' ? '#ffebee' : '#e8f5e9', color: order.status === 'Awaiting Auth' ? '#c62828' : '#2e7d32' }}>
                    {order.status}
                  </span>
                  {isAdmin && order.status === 'Awaiting Auth' && (
                    <button className="admin-approve-btn" onClick={() => handleAdminApprove(order.id)}>
                      ✓ APPROVE
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {visiblePurchaseOrders.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No purchase orders found.</td></tr>
            )}
          </tbody>
        </table>
        )}
      </div>

      {activeModal === 'indent' && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ borderTop: '5px solid #fca311' }}>
            <div className="modal-header" style={{ background: '#fca311', color: '#14213d' }}>
              <h3>Raise Purchase Indent</h3>
              <button className="close-btn" style={{ color: '#14213d' }} onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <form className="form-body" onSubmit={handleIndentSubmit}>
              <div className="form-group">
                <label className="form-label">Preferred Vendor</label>
                <input type="text" className="form-input" required value={indentForm.vendor} onChange={(e) => setIndentForm({...indentForm, vendor: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Material Requested</label>
                <input type="text" className="form-input" required value={indentForm.item} onChange={(e) => setIndentForm({...indentForm, item: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Budget (In INR)</label>
                <input type="number" className="form-input" required value={indentForm.amount} onChange={(e) => setIndentForm({...indentForm, amount: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#c0392b', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>REQUEST APPROVAL</button>
                <button type="button" onClick={() => setActiveModal(null)} style={{ padding: '12px 20px', background: '#e5e5e5', color: '#333', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHub;
