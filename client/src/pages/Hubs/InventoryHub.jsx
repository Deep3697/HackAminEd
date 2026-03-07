import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext'; 
import API from '../../services/api';

const InventoryHub = () => {
  const { user } = useAuth();

  // Start with empty arrays instead of dummy data
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState(null); 
  const [adjustForm, setAdjustForm] = useState({ itemId: '', action: 'Add', qty: '', reason: '' });
  const [printForm, setPrintForm] = useState({ itemId: '', copies: '10' });

  // --- FETCH DATA FROM BACKEND (uses shared axios client with token) ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [invRes, moveRes] = await Promise.all([
          API.get('/supply-chain/inventory'),
          API.get('/supply-chain/movements'),
        ]);

        const invData = invRes.data || [];
        setInventory(
          invData.map((item) => ({
            id: item.item_code,
            name: item.name,
            category: item.category,
            qty: item.qty,
            unit: item.unit,
            location: item.location,
            status: item.status,
          }))
        );

        const moveData = moveRes.data || [];
        setMovements(
          moveData.map((move) => ({
            id: move.movement_id,
            type: move.type,
            partner: move.partner,
            time: new Date(move.logged_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            status: move.status,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch supply chain data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAdjustmentSubmit = (e) => {
    e.preventDefault();
    const qtyNum = parseInt(adjustForm.qty);
    if (!qtyNum || qtyNum <= 0) return alert("Please enter a valid quantity.");

    const updatedInventory = inventory.map(item => {
      if (item.id === adjustForm.itemId) {
        let newQty = adjustForm.action === 'Add' ? item.qty + qtyNum : item.qty - qtyNum;
        if (newQty < 0) newQty = 0;
        let newStatus = 'Healthy';
        if (newQty < 50) newStatus = 'Critical';
        else if (newQty < 200) newStatus = 'Low Stock';
        return { ...item, qty: newQty, status: newStatus };
      }
      return item;
    });

    setInventory(updatedInventory);
    setAdjustForm({ itemId: '', action: 'Add', qty: '', reason: '' });
    setActiveModal(null);
  };

  const handlePrintSubmit = (e) => {
    e.preventDefault();
    alert(`🖨️ Command sent to printer: Printing ${printForm.copies} labels for ${printForm.itemId}.`);
    setPrintForm({ itemId: '', copies: '10' });
    setActiveModal(null);
  };

  return (
    <div style={{ padding: '30px 40px', flex: 1, backgroundColor: '#e5e5e5', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
      
      <style>
        {`
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes slideInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          
          .supply-card { background: #ffffff; border: 1px solid rgba(20, 33, 61, 0.08); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08); transition: all 0.4s ease; animation: fadeInUp 0.6s ease-out; }
          .supply-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12); }
          
          .hub-header { background: #14213d; color: #fff; padding: 16px 22px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; }
          
          .stock-table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .stock-table th { background: #f0f3f8; color: #14213d; padding: 14px 15px; text-align: left; border-bottom: 2px solid rgba(20, 33, 61, 0.15); font-weight: 800; }
          .stock-table td { padding: 13px 15px; border-bottom: 1px solid rgba(0, 0, 0, 0.05); color: #333; }
          .stock-table tr:hover { background: rgba(252, 163, 17, 0.04); }

          .movement-item { padding: 16px 18px; border-bottom: 1px solid rgba(0,0,0,0.06); display: flex; align-items: center; gap: 15px; transition: all 0.3s ease; animation: slideInLeft 0.5s ease-out backwards; }
          .movement-item:hover { background: rgba(252, 163, 17, 0.06); padding-left: 22px; }
          
          .status-indicator { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 8px; }
          .bg-healthy { background: #27ae60; }
          .bg-low-stock { background: #fca311; }
          .bg-critical { background: #c0392b; }

          .badge-logistics { padding: 6px 12px; border-radius: 20px; font-size: 10px; font-weight: bold; border: 1px solid; }

          .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); animation: fadeInUp 0.3s ease; }
          .modal-box { background: #fff; width: 500px; border-radius: 12px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2); overflow: hidden; animation: scaleIn 0.3s ease; }
          .modal-header { background: #14213d; color: #fff; padding: 20px; display: flex; justify-content: space-between; align-items: center; }
          .modal-header h3 { margin: 0; font-size: 18px; font-weight: 800; }
          .close-btn { background: none; border: none; color: #fff; font-size: 28px; cursor: pointer; }
          .form-body { padding: 30px; }
          .form-group { margin-bottom: 20px; }
          .form-label { display: block; font-size: 12px; color: #666; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; }
          .form-input { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
          .form-input:focus { border-color: #fca311; }
          
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(20, 33, 61, 0.2); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(20, 33, 61, 0.4); }
        `}
      </style>

      {/* --- TOP HEADER & ACTIONS --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h2 style={{ color: '#14213d', margin: '0', fontSize: '28px', fontWeight: '900' }}>Supply Chain Hub</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            User: <span style={{fontWeight: 'bold', color: '#fca311'}}>{user?.fullName || 'Authorized User'}</span> | {user?.employeeType || user?.role || 'Staff'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => setActiveModal('print')} style={{ background: '#ffffff', color: '#14213d', border: '2px solid #14213d', padding: '12px 24px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
            PRINT BARCODES
          </button>
          <button onClick={() => setActiveModal('adjust')} style={{ background: '#14213d', color: '#fff', border: 'none', padding: '12px 24px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
            NEW STOCK ADJUSTMENT
          </button>
        </div>
      </div>

      {/* --- KPI SUMMARY BAR --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="supply-card" style={{ padding: '20px', borderLeft: '6px solid #14213d' }}>
          <div style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Inventory Value</div>
          <div style={{ color: '#14213d', fontSize: '28px', fontWeight: '900', marginTop: '5px' }}>₹2.48 Million</div>
        </div>
        <div className="supply-card" style={{ padding: '20px', borderLeft: '6px solid #27ae60' }}>
          <div style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Warehouse Capacity</div>
          <div style={{ color: '#14213d', fontSize: '28px', fontWeight: '900', marginTop: '5px' }}>78% <small style={{fontSize: '14px', color: '#666'}}>Occupied</small></div>
        </div>
        <div className="supply-card" style={{ padding: '20px', borderLeft: '6px solid #fca311' }}>
          <div style={{ color: '#888', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Active In-Transit</div>
          <div style={{ color: '#14213d', fontSize: '28px', fontWeight: '900', marginTop: '5px' }}>{movements.length} Movements</div>
        </div>
      </div>

      {/* --- MAIN SPLIT CONTENT --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', marginBottom: '30px' }}>
        
        <div className="supply-card">
          <div className="hub-header">
            <span>STOCK ON HAND</span>
          </div>
          <table className="stock-table">
            <thead>
              <tr><th>ITEM CODE</th><th>NAME / CATEGORY</th><th>ON HAND</th><th>LOCATION</th><th>STATUS</th></tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 'bold', color: '#14213d' }}>{item.id}</td>
                  <td>{item.name} <br/> <small style={{color: '#888'}}>{item.category}</small></td>
                  <td style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.qty} <span style={{fontSize: '11px', color: '#666'}}>{item.unit}</span></td>
                  <td style={{ fontFamily: 'monospace', color: '#14213d' }}>{item.location}</td>
                  <td>
                    <span className={`status-indicator bg-${item.status.toLowerCase().replace(' ', '-')}`}></span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="supply-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="hub-header" style={{ background: '#fca311', color: '#14213d' }}>
            <span>LIVE MOVEMENT FEED</span>
            <span style={{ fontSize: '18px' }}>🚛</span>
          </div>
          <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', minHeight: '400px', maxHeight: '600px' }}>
            {movements.map(move => (
              <div className="movement-item" key={move.id}>
                <div style={{ fontSize: '24px' }}>{move.type === 'INBOUND' ? '📥' : '📤'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#14213d' }}>{move.id} - {move.partner}</div>
                  <div style={{ fontSize: '12px', color: '#777' }}>Logged at {move.time}</div>
                </div>
                <span className="badge-logistics" style={{ borderColor: move.type === 'INBOUND' ? '#14213d' : '#fca311', color: move.type === 'INBOUND' ? '#14213d' : '#fca311' }}>
                  {move.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MODALS (Hidden by default) --- */}
      {activeModal === 'adjust' && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Create Stock Adjustment</h3>
              <button className="close-btn" onClick={() => setActiveModal(null)}>&times;</button>
            </div>
            <form className="form-body" onSubmit={handleAdjustmentSubmit}>
              <div className="form-group">
                <label className="form-label">Select Item</label>
                <select className="form-input" required value={adjustForm.itemId} onChange={(e) => setAdjustForm({...adjustForm, itemId: e.target.value})}>
                  <option value="" disabled>Select Item...</option>
                  {inventory.map(item => <option key={item.id} value={item.id}>{item.id} - {item.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Adjustment Type</label>
                  <select className="form-input" value={adjustForm.action} onChange={(e) => setAdjustForm({...adjustForm, action: e.target.value})}>
                    <option value="Add">➕ Add to Stock</option>
                    <option value="Deduct">➖ Deduct from Stock</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-input" required min="1" value={adjustForm.qty} onChange={(e) => setAdjustForm({...adjustForm, qty: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#14213d', color: '#fff', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>UPDATE LEDGER</button>
                <button type="button" onClick={() => setActiveModal(null)} style={{ padding: '12px 20px', background: '#e5e5e5', border: 'none', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryHub;