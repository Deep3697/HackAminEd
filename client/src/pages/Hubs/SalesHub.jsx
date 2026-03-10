import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../store/AuthContext';
import API from '../../services/api';

const SalesPurchaseHub = () => {
  const { user } = useAuth();

  // --- SECURITY LOGIC ---
  const isAdmin = user?.role === 'admin';
  const isSalesTeam = isAdmin || user?.employeeType === 'Sales & Purchase';

  // --- 1. LIVE DATA STATES ---
  const [salesOrders, setSalesOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  // --- 2. MODAL & FORM STATES ---
  const [activeModal, setActiveModal] = useState(null);
  const [inquiryForm, setInquiryForm] = useState({ client: '', amount: '', product: '' });
  const [indentForm, setIndentForm] = useState({ vendor: '', amount: '', item: '' });

  // --- GST & Trends States ---
  const [gstVendors, setGstVendors] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const chartCanvasRef = useRef(null);

  // --- 3. DATABASE FETCHING LOGIC ---
  const fetchCommercialData = async () => {
    try {
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

  useEffect(() => {
    fetchCommercialData();
  }, []);

  // --- DATA FILTERING ---
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
        fetchCommercialData();
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
        fetchCommercialData();
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

  // --- NEW: REJECT HANDLER (Admin Only) ---
  const handleAdminReject = async (poId) => {
    if (!window.confirm('Are you sure you want to reject this purchase order?')) return;
    try {
      const response = await API.put(`/commercial/purchases/${poId}/reject`);
      if (response.data.success) {
        setPurchaseOrders(purchaseOrders.map(po => po.id === poId ? { ...po, status: 'Rejected' } : po));
      }
    } catch (error) {
      alert("Error rejecting order.");
    }
  };

  // --- NEW: CANCEL HANDLER (Employee cancels own order) ---
  const handleCancelOrder = async (poId) => {
    if (!window.confirm('Are you sure you want to cancel this purchase order?')) return;
    try {
      const response = await API.put(`/commercial/purchases/${poId}/cancel`);
      if (response.data.success) {
        setPurchaseOrders(purchaseOrders.map(po => po.id === poId ? { ...po, status: 'Cancelled' } : po));
      }
    } catch (error) {
      alert("Error cancelling order. You may not have permission.");
    }
  };

  // --- FETCH GST FILINGS ---
  const fetchGstFilings = async () => {
    try {
      const res = await API.get('/commercial/gst-filings');
      if (res.data.success) setGstVendors(res.data.vendors);
    } catch (err) {
      console.error("Error fetching GST filings:", err);
    }
  };

  // --- FETCH TREND ANALYTICS ---
  const fetchTrendAnalytics = async () => {
    try {
      const res = await API.get('/commercial/trend-analytics');
      if (res.data.success) setTrendData(res.data);
    } catch (err) {
      console.error("Error fetching trend analytics:", err);
    }
  };

  // --- DRAW CHART ---
  const drawChart = useCallback(() => {
    if (!trendData || !chartCanvasRef.current) return;
    const canvas = chartCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Merge months from both datasets
    const allMonths = new Set([
      ...(trendData.salesByMonth || []).map(s => s.month),
      ...(trendData.purchaseByMonth || []).map(p => p.month)
    ]);
    const months = Array.from(allMonths).reverse().slice(-8);

    if (months.length === 0) {
      ctx.fillStyle = '#888';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No data available to chart', W / 2, H / 2);
      return;
    }

    const salesMap = {};
    const purchaseMap = {};
    (trendData.salesByMonth || []).forEach(s => { salesMap[s.month] = s.total; });
    (trendData.purchaseByMonth || []).forEach(p => { purchaseMap[p.month] = p.total; });

    const salesValues = months.map(m => salesMap[m] || 0);
    const purchaseValues = months.map(m => purchaseMap[m] || 0);

    const maxVal = Math.max(...salesValues, ...purchaseValues, 1);
    const padding = { top: 30, bottom: 60, left: 80, right: 30 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;

    // Draw grid
    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartH / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(W - padding.right, y);
      ctx.stroke();

      const val = Math.round(maxVal - (maxVal / 5) * i);
      ctx.fillStyle = '#888';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText('₹' + val.toLocaleString(), padding.left - 8, y + 4);
    }

    // Draw bars
    const groupWidth = chartW / months.length;
    const barWidth = groupWidth * 0.3;
    const barGap = 4;

    months.forEach((month, i) => {
      const x = padding.left + groupWidth * i + groupWidth * 0.15;

      // Sales bar
      const sH = (salesValues[i] / maxVal) * chartH;
      ctx.fillStyle = '#27ae60';
      ctx.fillRect(x, padding.top + chartH - sH, barWidth, sH);

      // Purchase bar
      const pH = (purchaseValues[i] / maxVal) * chartH;
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(x + barWidth + barGap, padding.top + chartH - pH, barWidth, pH);

      // Month label
      ctx.fillStyle = '#555';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(month, x + barWidth + barGap / 2, H - padding.bottom + 20);
    });

    // Legend
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(padding.left, 8, 12, 12);
    ctx.fillStyle = '#333';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Sales', padding.left + 16, 18);

    ctx.fillStyle = '#c0392b';
    ctx.fillRect(padding.left + 70, 8, 12, 12);
    ctx.fillStyle = '#333';
    ctx.fillText('Purchase', padding.left + 86, 18);
  }, [trendData]);

  useEffect(() => {
    if (activeModal === 'trends' && trendData) {
      setTimeout(drawChart, 100);
    }
  }, [activeModal, trendData, drawChart]);

  // Status color helper
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending Quote': return { background: '#fff3e0', color: '#e65100' };
      case 'Confirmed': case 'Approved': return { background: '#e8f5e9', color: '#2e7d32' };
      case 'Processing': return { background: '#e3f2fd', color: '#1565c0' };
      case 'Delivered': return { background: '#e8f5e9', color: '#2e7d32' };
      case 'Awaiting Auth': return { background: '#ffebee', color: '#c62828' };
      case 'Rejected': return { background: '#ffcdd2', color: '#b71c1c' };
      case 'Cancelled': return { background: '#f5f5f5', color: '#757575' };
      default: return { background: '#fff3e0', color: '#e65100' };
    }
  };

  // Helper to calculate totals for the Revenue Summary
  const calculateTotal = (ordersArray) => {
    return ordersArray.reduce((total, order) => {
      const num = Number(order.amount.replace(/[^0-9.-]+/g, ""));
      return total + num;
    }, 0);
  };

  const totalSales = calculateTotal(visibleSalesOrders);
  const totalPurchase = calculateTotal(visiblePurchaseOrders);
  const netMargin = totalSales - totalPurchase;

  // --- RENDER PO ACTION BUTTONS ---
  const renderPoActions = (order) => {
    if (order.status !== 'Awaiting Auth') return null;

    return (
      <span style={{ display: 'inline-flex', gap: '4px', marginLeft: '8px' }}>
        {isAdmin && (
          <>
            <button className="admin-approve-btn" onClick={() => handleAdminApprove(order.id)}>
              ✓ APPROVE
            </button>
            <button className="admin-reject-btn" onClick={() => handleAdminReject(order.id)}>
              ✗ REJECT
            </button>
          </>
        )}
        {!isAdmin && (
          <button className="cancel-order-btn" onClick={() => handleCancelOrder(order.id)}>
            ✕ CANCEL
          </button>
        )}
      </span>
    );
  };

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
          .admin-approve-btn { background: #27ae60; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; transition: 0.2s; }
          .admin-approve-btn:hover { background: #219653; transform: scale(1.05); }
          .admin-reject-btn { background: #c0392b; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; transition: 0.2s; }
          .admin-reject-btn:hover { background: #a93226; transform: scale(1.05); }
          .cancel-order-btn { background: #e67e22; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; transition: 0.2s; }
          .cancel-order-btn:hover { background: #d35400; transform: scale(1.05); }
          
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

      {/* --- REVENUE SUMMARY --- */}
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
                      <span className="status-tag" style={getStatusStyle(order.status)}>
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
                    <span className="status-tag" style={getStatusStyle(order.status)}>
                      {order.status}
                    </span>
                    {renderPoActions(order)}
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
              <div style={{ fontSize: '12px', color: '#777', lineHeight: '1.4' }}>Verify vendor GST filings before releasing funds.</div>
            </div>
            <button onClick={() => { fetchGstFilings(); setActiveModal('gst'); }} style={{ background: '#14213d', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>VERIFY FILINGS</button>
          </div>

          <div className="utility-card">
            <div style={{ width: '60px', height: '60px', background: '#14213d', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fca311', fontSize: '24px' }}>📊</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '900', fontSize: '15px', color: '#14213d', marginBottom: '4px' }}>Trade Ratio Analytics</div>
              <div style={{ fontSize: '12px', color: '#777', lineHeight: '1.4' }}>Check real-time balance of inflow vs outflow.</div>
            </div>
            <button onClick={() => { fetchTrendAnalytics(); setActiveModal('trends'); }} style={{ background: '#fca311', color: '#14213d', border: 'none', padding: '8px 14px', borderRadius: '3px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>ANALYZE TRENDS</button>
          </div>
        </div>
      )}

      {/* ========= ALL MODALS ========= */}

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
                <input type="text" className="form-input" required value={inquiryForm.client} onChange={(e) => setInquiryForm({ ...inquiryForm, client: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Product Required</label>
                <input type="text" className="form-input" required value={inquiryForm.product} onChange={(e) => setInquiryForm({ ...inquiryForm, product: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Value (In INR)</label>
                <input type="number" className="form-input" required value={inquiryForm.amount} onChange={(e) => setInquiryForm({ ...inquiryForm, amount: e.target.value })} />
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
                <input type="text" className="form-input" required value={indentForm.vendor} onChange={(e) => setIndentForm({ ...indentForm, vendor: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Material Requested</label>
                <input type="text" className="form-input" required value={indentForm.item} onChange={(e) => setIndentForm({ ...indentForm, item: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Budget (In INR)</label>
                <input type="number" className="form-input" required value={indentForm.amount} onChange={(e) => setIndentForm({ ...indentForm, amount: e.target.value })} />
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
                        <span className="status-tag" style={getStatusStyle(order.status)}>
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
                        <span className="status-tag" style={getStatusStyle(order.status)}>
                          {order.status}
                        </span>
                        {renderPoActions(order)}
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

      {/* 5. GST COMPLIANCE MODAL - REAL DATA */}
      {activeModal === 'gst' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box" style={{ width: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ GST Compliance: Vendor Filing Status</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="form-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>Real-time vendor compliance data pulled from your purchase order records.</p>

              {gstVendors.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#888' }}>No vendor data found.</div>
              ) : (
                gstVendors.map((vendor, index) => (
                  <div key={index} style={{ padding: '12px', borderLeft: `4px solid ${vendor.compliant ? '#27ae60' : '#c0392b'}`, background: '#f8f9fa', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0 8px 8px 0' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#14213d' }}>{vendor.vendor}</strong>
                      <span style={{ fontSize: '11px', color: vendor.compliant ? '#27ae60' : '#c0392b' }}>
                        {vendor.compliant ? '✅ Compliant' : '⚠️ Non-Compliant'} — Last Order: {vendor.lastOrderDate}
                      </span>
                      <br />
                      <span style={{ fontSize: '10px', color: '#888' }}>
                        {vendor.totalOrders} orders ({vendor.approvedOrders} approved)
                      </span>
                    </div>
                    {!vendor.compliant && isAdmin && (
                      <button style={{ background: '#14213d', color: '#fff', border: 'none', padding: '5px 10px', fontSize: '10px', borderRadius: '3px', cursor: 'pointer' }}>HOLD PAYMENT</button>
                    )}
                  </div>
                ))
              )}
              <button onClick={() => setActiveModal(null)} style={{ width: '100%', padding: '12px', marginTop: '15px', background: '#fca311', color: '#14213d', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>ACKNOWLEDGE & CLOSE</button>
            </div>
          </div>
        </div>
      )}

      {/* 6. ANALYZE TRENDS MODAL - GRAPHICAL CHARTS */}
      {activeModal === 'trends' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-box" style={{ width: '750px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ background: '#fca311', color: '#14213d' }}>
              <h3>📊 Trade Ratio Analytics — Graphical Analysis</h3>
              <button className="close-btn" style={{ color: '#14213d' }} onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <div className="form-body">
              {/* Summary KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '25px' }}>
                <div style={{ textAlign: 'center', padding: '15px', background: '#e8f5e9', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#27ae60', textTransform: 'uppercase' }}>Total Sales</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#27ae60', marginTop: '4px' }}>₹{totalSales.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', background: '#ffebee', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#c0392b', textTransform: 'uppercase' }}>Total Purchase</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#c0392b', marginTop: '4px' }}>₹{totalPurchase.toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'center', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#1565c0', textTransform: 'uppercase' }}>Revenue Ratio</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#1565c0', marginTop: '4px' }}>
                    {totalPurchase > 0 ? (totalSales / totalPurchase).toFixed(2) : '0.00'}x
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div style={{ background: '#fafbfc', border: '1px solid #eee', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#14213d', marginBottom: '10px', textTransform: 'uppercase' }}>Monthly Sales vs Purchase Breakdown</div>
                <canvas ref={chartCanvasRef} width={680} height={300} style={{ width: '100%', height: '300px' }}></canvas>
              </div>

              <div style={{ background: '#e8f5e9', border: '1px solid #2e7d32', padding: '15px', borderRadius: '4px', color: '#2e7d32', fontSize: '13px', lineHeight: '1.4' }}>
                <strong>System Insight:</strong> This analysis is generated from live data in your database, showing real monthly trends for sales and purchase orders.
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