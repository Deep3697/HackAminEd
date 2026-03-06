import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await API.get('/admin/users');
        if (response.data.success) setUsers(response.data.users);
      } catch (error) {
        console.error("Connection error:", error);
      }
    };
    fetchUsers();
  }, []);

  // Classical Search Bar filter logic
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Save changes to the backend
  const handleSaveRole = async () => {
    try {
      // Logic: If they are an employee, ensure they have a department. If not, send a dash.
      const finalEmployeeType = selectedUser.role === 'employee' 
        ? (selectedUser.employeeType && selectedUser.employeeType !== '-' ? selectedUser.employeeType : 'Sales & Purchase') 
        : '-';

      const response = await API.put(`/admin/users/${selectedUser.id}/role`, { 
        role: selectedUser.role,
        employeeType: finalEmployeeType 
      });
      
      if (response.data.success) {
        // Update the table on the screen instantly
        setUsers(users.map(u => u.id === selectedUser.id ? { 
          ...u, 
          role: selectedUser.role, 
          employeeType: finalEmployeeType 
        } : u));
        setIsDrawerOpen(false);
      } else {
        alert("Failed to update role.");
      }
    } catch (error) {
      alert("Network error updating role.");
    }
  };

  return (
    <div style={{ padding: '40px 60px', flex: 1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        .classical-search-container {
          position: relative;
          display: flex;
          align-items: center;
          width: 380px;
        }
        .classical-search-input {
          width: 100%;
          padding: 12px 15px 12px 45px;
          border: 2px solid #14213d;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #14213d;
          outline: none;
          transition: border-color 0.2s;
        }
        .classical-search-input:focus { border-color: #fca311; }
        .search-icon-svg { position: absolute; left: 15px; color: #fca311; }
        
        .erp-table-classic { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .erp-table-classic th { background: #14213d; color: #fff; padding: 18px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .erp-table-classic td { padding: 18px; border-bottom: 1px solid #f0f0f0; color: #14213d; font-weight: 500; }
        .role-btn { background: #fca311; color: #14213d; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 800; cursor: pointer; font-size: 12px; transition: 0.2s; }
        .role-btn:hover { background: #e08e0b; }
        
        .role-drawer {
          position: fixed; top: 0; right: ${isDrawerOpen ? '0' : '-450px'};
          width: 420px; height: 100vh; background: #fff; border-left: 6px solid #fca311;
          box-shadow: -10px 0 30px rgba(0,0,0,0.1); transition: 0.4s cubic-bezier(0.2, 1, 0.2, 1); z-index: 2000;
        }
        .overlay { position: fixed; inset: 0; background: rgba(20,33,61,0.4); display: ${isDrawerOpen ? 'block' : 'none'}; z-index: 1999; backdrop-filter: blur(4px); }
        
        .drawer-label { display: block; font-size: 12px; font-weight: 800; color: #14213d; margin-bottom: 10px; text-transform: uppercase; margin-top: 25px; }
        .drawer-select { width: 100%; padding: 15px; border-radius: 8px; border: 2px solid #eee; font-weight: 700; outline: none; color: #14213d; font-size: 14px; transition: 0.2s; }
        .drawer-select:focus { border-color: #fca311; }
      `}</style>

      {/* Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ color: '#14213d', fontSize: '28px', fontWeight: '800', margin: 0 }}>Access Permissions</h2>
          <p style={{ color: '#666', marginTop: '5px' }}>Strictly for administrative role assignment and security control.</p>
        </div>

        <div className="classical-search-container">
          <div className="search-icon-svg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="classical-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Data Table */}
      <table className="erp-table-classic">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Current Role</th>
            <th>Department Type</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? filteredUsers.map(user => (
            <tr key={user.id}>
              <td style={{ fontWeight: '800', color: '#666' }}>{user.displayId}</td>
              <td style={{ fontWeight: '700' }}>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <span style={{ color: '#fca311', fontWeight: '800', textTransform: 'uppercase', fontSize: '11px' }}>{user.role}</span>
              </td>
              <td style={{ fontWeight: '600', color: '#666' }}>{user.employeeType}</td>
              <td style={{ textAlign: 'right' }}>
                <button className="role-btn" onClick={() => { setSelectedUser({...user}); setIsDrawerOpen(true); }}>
                  Assign Role
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>No users found matching your search.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* The Edit Drawer */}
      <div className="overlay" onClick={() => setIsDrawerOpen(false)} />
      <div className="role-drawer">
        <div style={{ background: '#14213d', padding: '30px', color: '#fff' }}>
          <h3 style={{ margin: 0 }}>Assign Security Role</h3>
          <p style={{ opacity: 0.7, fontSize: '13px', marginTop: '5px' }}>User: {selectedUser?.name}</p>
        </div>

        <div style={{ padding: '30px' }}>
          <label className="drawer-label" style={{ marginTop: 0 }}>Select Access Level</label>
          <select 
            className="drawer-select"
            value={selectedUser?.role || 'user'}
            onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
          >
            <option value="user">Standard User (Client)</option>
            <option value="employee">Internal Employee</option>
            <option value="contractor">Raw Material Contractor</option>
          </select>

          {/* DYNAMIC MENU: Only shows if 'employee' is selected */}
          {selectedUser?.role === 'employee' && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <label className="drawer-label">Assign Department / Type</label>
              <select 
                className="drawer-select"
                value={selectedUser?.employeeType !== '-' ? selectedUser?.employeeType : 'Sales & Purchase'}
                onChange={(e) => setSelectedUser({ ...selectedUser, employeeType: e.target.value })}
              >
                <option value="Sales & Purchase">Sales & Purchase Manager</option>
                <option value="HR & Payroll">HR & Payroll Officer</option>
                <option value="Transport & Logistics">Transport & Logistics Worker</option>
                <option value="Production & Quality">Production & Quality Lead</option>
              </select>
            </div>
          )}

          <button 
            onClick={handleSaveRole}
            style={{ width: '100%', marginTop: '40px', padding: '15px', background: '#14213d', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', transition: '0.2s' }}
            onMouseOver={(e) => e.target.style.background = '#0a1122'}
            onMouseOut={(e) => e.target.style.background = '#14213d'}
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;