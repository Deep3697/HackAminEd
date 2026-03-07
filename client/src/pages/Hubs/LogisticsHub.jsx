import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/AuthContext';
import API from '../../services/api';

const LogisticsHub = () => {
  const { user } = useAuth(); 
  
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH FLEET FROM BACKEND (shared axios client with token) ---
  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const res = await API.get('/supply-chain/fleet');
        const data = res.data || [];
        
        // Map DB columns to our UI keys
        const mappedFleet = data.map(truck => ({
          id: truck.vehicle_id,
          driver: truck.driver_name,
          destination: truck.destination,
          status: truck.status,
          eta: truck.eta
        }));
        
        setFleet(mappedFleet);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch fleet data", error);
        setLoading(false);
      }
    };

    fetchFleet();
  }, []);

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Fleet Data...</div>;

  return (
    <div style={{ padding: '30px 40px', flex: 1, backgroundColor: '#e5e5e5', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#14213d', margin: '0', fontSize: '28px', fontWeight: '900' }}>Fleet & Dispatch Command</h2>
        <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
          Active routes and gate management. Logged in as: <span style={{color: '#fca311', fontWeight: 'bold'}}>{user?.fullName || 'Admin'}</span>
        </p>
      </div>

      {/* Fleet Dashboard */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ background: '#14213d', color: '#fff', padding: '16px 22px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>ACTIVE FLEET DEPLOYMENT</span>
          <button style={{ background: '#fca311', color: '#14213d', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            + ASSIGN DRIVER
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr>
              <th style={{ background: '#f0f3f8', padding: '15px', textAlign: 'left', color: '#14213d' }}>VEHICLE ID</th>
              <th style={{ background: '#f0f3f8', padding: '15px', textAlign: 'left', color: '#14213d' }}>DRIVER</th>
              <th style={{ background: '#f0f3f8', padding: '15px', textAlign: 'left', color: '#14213d' }}>DESTINATION</th>
              <th style={{ background: '#f0f3f8', padding: '15px', textAlign: 'left', color: '#14213d' }}>STATUS</th>
              <th style={{ background: '#f0f3f8', padding: '15px', textAlign: 'left', color: '#14213d' }}>ETA</th>
            </tr>
          </thead>
          <tbody>
            {fleet.map((truck, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px', fontWeight: 'bold', color: '#14213d' }}>{truck.id}</td>
                <td style={{ padding: '15px' }}>{truck.driver}</td>
                <td style={{ padding: '15px' }}>{truck.destination}</td>
                <td style={{ padding: '15px', fontWeight: 'bold', color: truck.status === 'En Route' ? '#27ae60' : truck.status === 'Idle (Yard)' ? '#888' : '#fca311' }}>
                  {truck.status}
                </td>
                <td style={{ padding: '15px', color: '#666' }}>{truck.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogisticsHub;