import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

const ContractorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Specifically tailored hubs for a Raw Material Supplier
  const contractorHubs = [
    { name: 'Supply Contracts & POs', path: '/purchase', icon: '📜' },
    { name: 'Material Dispatch', path: '/logistics', icon: '🚛' },
    { name: 'QC & Specifications', path: '/quality', icon: '🔬' },
    { name: 'Invoices & Payments', path: '/finance', icon: '💸' },
  ];

  // Dummy data: Active Long-Term Contracts
  const activeContracts = [
    { id: 'CTR-2024-A1', material: 'Aluminium Coils (2mm)', volume: '500 Tons', fulfilled: '320 Tons', status: 'Active' },
    { id: 'CTR-2024-B4', material: 'Industrial Solvent HX', volume: '10,000 Ltrs', fulfilled: '10,000 Ltrs', status: 'Fulfilled' },
  ];

  // Dummy data: Upcoming Raw Material Deliveries
  const pendingDeliveries = [
    { id: 'DSP-8842', material: 'Aluminium Coils (2mm)', qty: '50 Tons', date: 'Oct 28, 2023', qcStatus: 'Pending Drop-off' },
    { id: 'DSP-8839', material: 'Aluminium Coils (2mm)', qty: '40 Tons', date: 'Oct 22, 2023', qcStatus: 'QC Passed' },
    { id: 'DSP-8830', material: 'Industrial Solvent HX', qty: '2,000 Ltrs', date: 'Oct 15, 2023', qcStatus: 'Rejected - Impure' },
  ];

  return (
    <div style={{ padding: '30px 50px', flex: 1 }}>
      <style>
        {`
          .supplier-card { background: #fff; border: 1px solid #dcdcdc; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); padding: 25px; }
          .supplier-hub-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
          .supplier-hub-btn:hover { background: #14213d; color: #fca311; transform: translateY(-3px); box-shadow: 0 6px 15px rgba(20,33,61,0.1); border-color: #14213d; }
          
          .erp-data-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 15px; }
          .erp-data-table th { background: #f8f9fa; color: #666; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #eee; }
          .erp-data-table td { padding: 15px 12px; border-bottom: 1px solid #eee; color: #14213d; }
          .erp-data-table tr:hover { background: #f8f9fa; }
          
          .badge { padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
          .badge-good { background: rgba(39, 174, 96, 0.15); color: #27ae60; }
          .badge-bad { background: rgba(231, 76, 60, 0.15); color: #c0392b; }
          .badge-neutral { background: #eee; color: #666; }
          .badge-active { background: rgba(252, 163, 17, 0.15); color: #d35400; }

          .contract-box { padding: 15px; border: 1px solid #eee; border-radius: 6px; margin-bottom: 15px; background: #fafafa; border-left: 4px solid #14213d; }
        `}
      </style>

      {/* Header Profile Section */}
      <div style={{ marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ color: '#14213d', margin: '0 0 5px 0', fontSize: '28px' }}>
            Raw Material Supplier Portal
          </h2>
          <p style={{ color: '#666', margin: 0, fontSize: '15px' }}>
            Authorized Contractor: <span style={{ fontWeight: 'bold', color: '#14213d' }}>{user?.fullName || 'Vendor Logistics'}</span>
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>MATERIAL QUALITY SCORE</div>
          <div style={{ fontSize: '24px', color: '#27ae60', fontWeight: '900' }}>96.4%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px' }}>
        
        {/* Left Column: Hubs & Contracts */}
        <div>
          <h3 style={{ color: '#14213d', marginBottom: '15px' }}>Supplier Modules</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
            {contractorHubs.map((hub, idx) => (
              <div key={idx} className="supplier-hub-btn" onClick={() => navigate(hub.path)}>
                <span style={{ fontSize: '28px', marginBottom: '8px' }}>{hub.icon}</span>
                <span style={{ fontWeight: 'bold', fontSize: '13px', textAlign: 'center' }}>{hub.name}</span>
              </div>
            ))}
          </div>

          <div className="supplier-card">
            <h3 style={{ margin: '0 0 15px 0', color: '#14213d' }}>Active Supply Contracts</h3>
            {activeContracts.map((contract, idx) => (
              <div key={idx} className="contract-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#14213d' }}>{contract.id}</span>
                  <span className={`badge ${contract.status === 'Active' ? 'badge-active' : 'badge-good'}`}>{contract.status}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Material: <strong>{contract.material}</strong></div>
                <div style={{ fontSize: '12px', color: '#999', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Target: {contract.volume}</span>
                  <span>Supplied: {contract.fulfilled}</span>
                </div>
                {/* Visual Progress Bar */}
                <div style={{ width: '100%', height: '6px', background: '#eee', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${(parseInt(contract.fulfilled.replace(/,/g, '')) / parseInt(contract.volume.replace(/,/g, ''))) * 100}%`, 
                    height: '100%', 
                    background: contract.status === 'Active' ? '#fca311' : '#27ae60' 
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Dispatch & QC */}
        <div className="supplier-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, color: '#14213d' }}>Recent Dispatches & QC Status</h3>
            <button style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
              Schedule New Drop-off
            </button>
          </div>
          
          <table className="erp-data-table">
            <thead>
              <tr>
                <th>Dispatch ID</th>
                <th>Material & Qty</th>
                <th>Drop-off Date</th>
                <th>Factory QC Status</th>
              </tr>
            </thead>
            <tbody>
              {pendingDeliveries.map((del, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 'bold' }}>{del.id}</td>
                  <td>
                    <div>{del.material}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Qty: {del.qty}</div>
                  </td>
                  <td>{del.date}</td>
                  <td>
                    <span className={`badge ${
                      del.qcStatus === 'QC Passed' ? 'badge-good' : 
                      del.qcStatus === 'Rejected - Impure' ? 'badge-bad' : 'badge-neutral'
                    }`}>
                      {del.qcStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default ContractorDashboard;