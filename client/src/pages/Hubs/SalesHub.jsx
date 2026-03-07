import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import API from '../../services/api'; 

const SalesPurchaseHub = () => {
  const { user } = useAuth(); 
  
  // --- SECURITY LOGIC ---
  const isAdmin = user?.role === 'admin';
  const isSalesTeam = isAdmin || user?.employeeType === 'Sales & Purchase';

  // --- 1. LIVE DATA STATES ---
  // These start empty and will be filled by the database!
  const [salesOrders, setSalesOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  // --- 2. MODAL & FORM STATES ---
  const [activeModal, setActiveModal] = useState(null);
  const [inquiryForm, setInquiryForm] = useState({ client: '', amount: '', product: '' });
  const [indentForm, setIndentForm] = useState({ vendor: '', amount: '', item: '' });

  // --- 3. DATABASE FETCHING LOGIC ---
  const fetchCommercialData = async () => {
    try {
      // Fetch both sales and purchases at the same time
      const [salesRes, purchaseRes] = await Promise.all([
        API.get('/commercial/sales'),
        API.get('/commercial/purchases')
      ]);

      if (salesRes.data.success) setSalesOrders(salesRes.data.sales);
      if (purchaseRes.data.success) setPurchaseOrders(purchaseRes.data.purchases);
    } catch (error) {
      console.error("Error fetching commercial data:", error);
    }
  };

  // Run the fetch function when the page loads
  useEffect(() => {
    fetchCommercialData();
  }, []);

  // --- DATA FILTERING (Same as before) ---
  const visibleSalesOrders = isAdmin ? salesOrders : salesOrders.filter(order => order.rep === (user?.fullName || 'Current User'));
  const visiblePurchaseOrders = isAdmin ? purchaseOrders : purchaseOrders.filter(order => order.createdBy === (user?.fullName || 'Current User'));


  // --- 4. LIVE FORM HANDLERS ---
  
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/commercial/sales', inquiryForm);
      
      if (response.data.success) {
        setInquiryForm({ client: '', amount: '', product: '' });
        setActiveModal(null);
        fetchCommercialData(); // Refresh the table to show the new data!
      }
    } catch (error) {
      alert("Error saving inquiry.");
    }
  };

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
        fetchCommercialData(); // Refresh the table
      }
    } catch (error) {
      alert("Error saving purchase indent.");
    }
  };

  const handleAdminApprove = async (poId) => {
    try {
      const response = await API.put(`/commercial/purchases/${poId}/approve`);
      
      if (response.data.success) {
        // Optimistically update the UI so it feels instantaneous
        setPurchaseOrders(purchaseOrders.map(po => po.id === poId ? { ...po, status: 'Approved' } : po));
      }
    } catch (error) {
      alert("Error approving order.");
    }
  };

  // Helper to calculate totals for the Revenue Summary
  const calculateTotal = (ordersArray) => {
    return ordersArray.reduce((total, order) => {
      // Remove the '₹' and commas to do math, then add them back
      const num = Number(order.amount.replace(/[^0-9.-]+/g,""));
      return total + num;
    }, 0);
  };

  const totalSales = calculateTotal(visibleSalesOrders);
  const totalPurchase = calculateTotal(visiblePurchaseOrders);
  const netMargin = totalSales - totalPurchase;

  return (
    <div style={{ padding: '30px 40px', flex: 1, backgroundColor: '#e5e5e5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      <style>
        {`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
          
          .hub-card { background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%); border: 1px solid rgba(20, 33, 61, 0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); transition: all 0.4s; animation: fadeInUp 0.6s ease-out; }
          .hub-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12); border-color: rgba(252, 163, 17, 0.15); }
          
          .section-header { background: linear-gradient(135deg, #14213d 0%, #1a2f4a 100%); color: #fff; padding: 16px 22px; display: flex; justify-content: space-between; align-items: center; font-weight: bold; position: relative; overflow: hidden; }
          .section-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(90deg, transparent, rgba(252, 163, 17, 0.1) 50%, transparent); animation: shimmer 3s infinite; }
          
          .commercial-table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .commercial-table th { background: linear-gradient(135deg, #f0f3f8 0%, #e8ecf2 100%); color: #14213d; padding: 14px 15px; text-align: left; border-bottom: 2px solid rgba(20, 33, 61, 0.15); font-weight: 800; }
          .commercial-table td { padding: 13px 15px; border-bottom: 1px solid rgba(0, 0, 0, 0.05); color: #333; }
          
          .stat-box { flex: 1; padding: 22px; text-align: center; border-right: 1px solid rgba(0,0,0,0.06); transition: all 0.3s ease; }
          .stat-box:last-child { border-right: none; }
          .stat-label { font-size: 11px; color: #999; font-weight: bold; text-transform: uppercase; }
          .stat-value { font-size: 26px; font-weight: 900; color: #14213d; margin-top: 8px; }
          
          .utility-card { display: flex; align-items: center; padding: 20px; gap: 20px; background: #fff; border: 1px solid rgba(20, 33, 61, 0.08); border-radius: 12px; flex: 1; transition: all 0.4s ease; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); }
          
          .status-tag { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #fff; }
          .admin-approve-btn { background: #27ae60; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; margin-left: 10px; transition: 0.2s; }
          .admin-approve-btn:hover { background: #219653; transform: scale(1.05); }
          
          .action-link { display: block; width: 100%; padding: 14px; background: linear-gradient(135deg, #f0f3f8 0%, #e8ecf2 100%); text-align: center; border: none; cursor: pointer; color: #14213d; font-weight: bold; font-size: 12px; }
          
          .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(6px); }
          .modal-box { background: #fff; width: 500px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2); overflow: hidden; animation: scaleIn 0.3s; }
          .modal-box-wide { width: 800px; }
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
          <h2 style={{ color: '#14213d', margin: '0', fontSize: '28px', fontWeight: '900' }}>Commercial Hub</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            {isAdmin ? "Global Enterprise Overview" : 
             isSalesTeam ? `Sales & Procurement Pipeline (${user?.fullName})` : 
             `${user?.employeeType} Department Procurement`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          {isSalesTeam && (
            <button onClick={() => setActiveModal('inquiry')} style={{ background: '#14213d', color: '#fff', border: 'none', padding: '12px 24px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
              + NEW INQUIRY
            </button>
          )}
          <button onClick={() => setActiveModal('indent')} style={{ background: '#fca311', color: '#14213d', border: 'none', padding: '12px 24px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
            + NEW PURCHASE INDENT
          </button>
        </div>
      </div>

      {/* --- REVENUE SUMMARY (Dynamically Calculated) --- */}
      {isSalesTeam && (
        <div className="hub-card" style={{ display: 'flex', marginBottom: '30px', borderTop: '5px solid #14213d' }}>
          <div className="stat-box">
            <div className="stat-label">{isAdmin ? 'Global Sales' : 'My Sales'}</div>
            <div className="stat-value" style={{ color: '#27ae60' }}>₹{totalSales.toLocaleString()}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">{isAdmin ? 'Global Purchase' : 'My Indents'}</div>
            <div className="stat-value" style={{ color: '#c0392b' }}>₹{totalPurchase.toLocaleString()}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Net Margin</div>
            <div className="stat-value">₹{netMargin.toLocaleString()}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Pending Approvals</div>
            <div className="stat-value" style={{ color: '#fca311' }}>
               {isAdmin ? visiblePurchaseOrders.filter(o => o.status === 'Awaiting Auth').length : 'Wait Auth'}
            </div>
          </div>
        </div>
      )}

      {/* --- DUAL TABLES --- */}
      <div style={{ display: 'grid', gridTemplateColumns: isSalesTeam ? '1fr 1fr' : '1fr', gap: '30px', marginBottom: '30px' }}>
        
        {/* SALES SECTION */}
        {isSalesTeam && (
          <div className="hub-card" style={{ borderTop: '4px solid #27ae60' }}>
            <div className="section-header">
              <span>SALES & CUSTOMER ORDERS</span>
              <span style={{ fontSize: '18px' }}>💹</span>
            </div>
            <table className="commercial-table">
              <thead>
                <tr>
                  <th>ORDER #</th>
                  <th>CLIENT</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {visibleSalesOrders.slice(0, 4).map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 'bold' }}>{order.id}</td>
                    <td>{order.client}</td>
                    <td style={{ fontWeight: 'bold' }}>{order.amount}</td>
                    <td>
                      <span className="status-tag" style={{ background: order.status === 'Pending Quote' ? '#fff3e0' : order.status === 'Confirmed' ? '#e8f5e9' : '#e3f2fd', color: order.status === 'Pending Quote' ? '#e65100' : order.status === 'Confirmed' ? '#2e7d32' : '#1565c0' }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {visibleSalesOrders.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No sales orders found in your pipeline.</td></tr>
                )}
              </tbody>
            </table>
            <button onClick={() => setActiveModal('salesPipeline')} className="action-link">VIEW DETAILED SALES PIPELINE →</button>
          </div>
        )}

        {/* PURCHASE SECTION */}
        <div className="hub-card" style={{ borderTop: '4px solid #c0392b' }}>
          <div className="section-header" style={{ background: '#c0392b' }}>
            <span>{isSalesTeam ? 'PURCHASE & VENDOR ORDERS' : 'MY DEPARTMENT EXPENSE REQUESTS'}</span>
            <span style={{ fontSize: '18px' }}>🛒</span>
          </div>
          <table className="commercial-table">
            <thead>
              <tr>
                <th>PO #</th>
                <th>VENDOR</th>
                <th>AMOUNT</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {visiblePurchaseOrders.slice(0, 4).map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 'bold' }}>{order.id}</td>
                  <td>{order.vendor}</td>
                  <td style={{ fontWeight: 'bold' }}>{order.amount}</td>
                  <td>
                    <span className="status-tag" style={{ background: order.status === 'Awaiting Auth' ? '#ffebee' : '#fff3e0', color: order.status === 'Awaiting Auth' ? '#c62828' : '#e65100' }}>
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
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No purchase indents found.</td></tr>
              )}
            </tbody>
          </table>
          <button onClick={() => setActiveModal('procurementLogs')} className="action-link">VIEW FULL PROCUREMENT LOGS →</button>
        </div>
      </div>

      {/* --- DYNAMIC UTILITY CARDS --- */}
      {isSalesTeam && (
        <div style={{ display: 'flex', gap: '25px' }}>
          <div className="utility-card">
            <div style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: '#f8f9fa', border: '4px solid #fca311', fontWeight: 'bold', fontSize: '14px', color: '#14213d' }}>
              94%
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '900', fontSize: '15px', color: '#14213d', marginBottom: '4px' }}>GST Compliance Score</div>
              <div style={{ fontSize: '12px', color: '#777', lineHeight: '1.4' }}>4 vendors are currently non-compliant. Verify GST filings before releasing funds.</div>
            </div>
            <button onClick={() => setActiveModal('gst')} style={{ background: '#14213d', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>VERIFY FILINGS</button>
          </div>

          <div className="utility-card">
            <div style={{ width: '60px', height: '60px', background: '#14213d', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fca311', fontSize: '24px' }}>📊</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '900', fontSize: '15px', color: '#14213d', marginBottom: '4px' }}>Trade Ratio Analytics</div>
              <div style={{ fontSize: '12px', color: '#777', lineHeight: '1.4' }}>Check real-time balance of inflow vs outflow.</div>
            </div>
            <button onClick={() => setActiveModal('trends')} style={{ background: '#fca311', color: '#14213d', border: 'none', padding: '8px 14px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>ANALYZE TRENDS</button>
          </div>
        </div>
      )}

      {/* =========================================
          ALL MODALS RENDERED BELOW THIS LINE
          ========================================= */}
      
      {/* 1. NEW INQUIRY MODAL */}
      {activeModal === 'inquiry' && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Create Sales Inquiry</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <form className="form-body" onSubmit={handleInquirySubmit}>
              <div className="form-group">
                <label className="form-label">Client / Company Name</label>
                <input type="text" className="form-input" required value={inquiryForm.client} onChange={(e) => setInquiryForm({...inquiryForm, client: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Product Required</label>
                <input type="text" className="form-input" required value={inquiryForm.product} onChange={(e) => setInquiryForm({...inquiryForm, product: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Value (In INR)</label>
                <input type="number" className="form-input" required value={inquiryForm.amount} onChange={(e) => setInquiryForm({...inquiryForm, amount: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#14213d', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>SAVE INQUIRY</button>
                <button type="button" onClick={() => setActiveModal(null)} style={{ padding: '12px 20px', background: '#e5e5e5', color: '#333', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. NEW PURCHASE INDENT MODAL */}
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

      {/* 3. SALES PIPELINE DETAILS MODAL */}
      {activeModal === 'salesPipeline' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: '#27ae60' }}>
              <h3>Detailed Sales Pipeline</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table className="commercial-table" style={{ margin: 0 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th>DATE</th>
                    <th>ORDER #</th>
                    <th>CLIENT</th>
                    <th>SALES REP</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSalesOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ color: '#888', fontSize: '12px', fontWeight: 'bold' }}>{order.date}</td>
                      <td style={{ fontWeight: 'bold', color: '#14213d' }}>{order.id}</td>
                      <td>{order.client}</td>
                      <td style={{ fontSize: '12px' }}>{order.rep}</td>
                      <td style={{ fontWeight: 'bold' }}>{order.amount}</td>
                      <td>
                        <span className="status-tag" style={{ background: order.status === 'Pending Quote' ? '#fff3e0' : '#e8f5e9', color: order.status === 'Pending Quote' ? '#e65100' : '#2e7d32' }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '15px 25px', background: '#f8f9fa', borderTop: '1px solid #eee', textAlign: 'right' }}>
              <button onClick={() => setActiveModal(null)} style={{ padding: '10px 20px', background: '#14213d', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>CLOSE VIEW</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. PROCUREMENT LOGS MODAL */}
      {activeModal === 'procurementLogs' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box modal-box-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: '#c0392b' }}>
              <h3>Full Procurement Logs</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              <table className="commercial-table" style={{ margin: 0 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th>DATE</th>
                    <th>PO #</th>
                    <th>VENDOR</th>
                    <th>DEPT</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePurchaseOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ color: '#888', fontSize: '12px', fontWeight: 'bold' }}>{order.date}</td>
                      <td style={{ fontWeight: 'bold', color: '#14213d' }}>{order.id}</td>
                      <td>{order.vendor}</td>
                      <td style={{ fontSize: '12px' }}>{order.dept}</td>
                      <td style={{ fontWeight: 'bold' }}>{order.amount}</td>
                      <td>
                        <span className="status-tag" style={{ background: order.status === 'Awaiting Auth' ? '#ffebee' : '#e8f5e9', color: order.status === 'Awaiting Auth' ? '#c62828' : '#2e7d32' }}>
                          {order.status}
                        </span>
                        {isAdmin && order.status === 'Awaiting Auth' && (
                          <button className="admin-approve-btn" onClick={() => handleAdminApprove(order.id)}>✓ APPROVE</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '15px 25px', background: '#f8f9fa', borderTop: '1px solid #eee', textAlign: 'right' }}>
              <button onClick={() => setActiveModal(null)} style={{ padding: '10px 20px', background: '#14213d', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>CLOSE LOGS</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. GST COMPLIANCE MODAL (Admin Only Actions) */}
      {activeModal === 'gst' && isAdmin && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Compliance Alert: Non-Compliant Vendors</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="form-body">
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>The following vendors have not filed their recent GST returns. Holding their payments is advised.</p>
              
              <div style={{ padding: '12px', borderLeft: '4px solid #c0392b', background: '#f8f9fa', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><strong style={{ display: 'block', color: '#14213d' }}>Omega Logistics</strong><span style={{ fontSize: '11px', color: '#c0392b' }}>Inactive since Aug 2023</span></div>
                <button style={{ background: '#14213d', color: '#fff', border: 'none', padding: '5px 10px', fontSize: '10px', borderRadius: '3px', cursor: 'pointer' }}>HOLD PAYMENT</button>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ width: '100%', padding: '12px', marginTop: '15px', background: '#fca311', color: '#14213d', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>ACKNOWLEDGE & CLOSE</button>
            </div>
          </div>
        </div>
      )}
      
      {activeModal === 'gst' && !isAdmin && (
         <div className="modal-overlay" onClick={() => setActiveModal(null)}>
            <div className="modal-box">
               <div className="form-body" style={{textAlign: 'center'}}>
                 <h3 style={{color: '#c0392b'}}>Access Restricted</h3>
                 <p>Only Administrators can place vendor payments on hold.</p>
                 <button onClick={() => setActiveModal(null)} style={{ padding: '10px 20px', background: '#e5e5e5', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
               </div>
            </div>
         </div>
      )}

      {/* 6. ANALYZE TRENDS MODAL */}
      {activeModal === 'trends' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: '#fca311', color: '#14213d' }}>
              <h3>📊 Financial Trade Ratio Analysis</h3>
              <button className="close-btn" style={{ color: '#14213d' }} onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="form-body">
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '48px', fontWeight: '900', color: '#27ae60' }}>
                  {totalPurchase > 0 ? (totalSales / totalPurchase).toFixed(2) : '0.00'}x
                </div>
                <div style={{ fontSize: '12px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Live Revenue-to-Expense Ratio</div>
              </div>
              <div style={{ background: '#e8f5e9', border: '1px solid #2e7d32', padding: '15px', borderRadius: '4px', color: '#2e7d32', fontSize: '13px', lineHeight: '1.4' }}>
                <strong>System Insight:</strong> This calculation is now pulling live data directly from your database.
              </div>
              <button onClick={() => setActiveModal(null)} style={{ width: '100%', padding: '12px', marginTop: '20px', background: '#14213d', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>CLOSE DASHBOARD</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SalesPurchaseHub;