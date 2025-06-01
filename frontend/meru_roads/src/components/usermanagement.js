import React, { useState } from 'react';
import { FaUsers, FaEdit, FaTrash, FaPlus, FaKey } from 'react-icons/fa';
// Adjust the path if CyberCard is in a different location
import './user.css'
const UserManagement = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Mwenda', role: 'County Engineer', permissions: ['admin', 'edit'] },
    { id: 2, name: 'Sarah Kimathi', role: 'Field Supervisor', permissions: ['view', 'report'] },
    { id: 3, name: 'David Muriuki', role: 'Contract Manager', permissions: ['view', 'edit'] },
    { id: 4, name: 'Grace Karanja', role: 'Finance Officer', permissions: ['view', 'finance'] },
    { id: 5, name: 'Peter Gitonga', role: 'Public Relations', permissions: ['view'] }
  ]);
  
  const [newUser, setNewUser] = useState({ name: '', role: '', permissions: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showForm, setShowForm] = useState(false);
 
  const CyberCard = ({ children, className }) => (
  <div className={`cyber-card ${className || ''}`}>{children}</div>
);
  // Add new user
  const handleAddUser = () => {
    if (!newUser.name || !newUser.role) return;
    
    const permissionsArray = newUser.permissions 
      ? newUser.permissions.split(',').map(p => p.trim()).filter(p => p)
      : [];
    
    const user = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      name: newUser.name,
      role: newUser.role,
      permissions: permissionsArray
    };
    
    setUsers([...users, user]);
    setNewUser({ name: '', role: '', permissions: '' });
    setShowForm(false);
  };

  // Enable edit mode
  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditForm({
      name: user.name,
      role: user.role,
      permissions: user.permissions.join(', ')
    });
  };

  // Save edited user
  const handleSaveEdit = () => {
    setUsers(users.map(user => 
      user.id === editingId ? {
        ...user,
        name: editForm.name,
        role: editForm.role,
        permissions: editForm.permissions.split(',').map(p => p.trim()).filter(p => p)
      } : user
    ));
    setEditingId(null);
  };

  // Delete user with confirmation
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  // Permission badge with tooltip
  const PermissionBadge = ({ permission }) => (
    <span className="permission-tag" title={`${permission} access`}>
      <FaKey className="key-icon" /> {permission}
    </span>
  );

  return (
    <CyberCard className="user-management-card">
      <div className="header-section">
        <h2><FaUsers className="header-icon" /> User Management</h2>
        <button 
          className="add-user-btn"
          onClick={() => setShowForm(!showForm)}
        >
          <FaPlus /> {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {/* Add User Form */}
      {showForm && (
        <div className="user-form">
          <h3>Add New User</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              placeholder="Enter full name"
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input 
              type="text" 
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              placeholder="Enter role"
            />
          </div>
          <div className="form-group">
            <label>Permissions (comma separated)</label>
            <input 
              type="text" 
              value={newUser.permissions}
              onChange={(e) => setNewUser({...newUser, permissions: e.target.value})}
              placeholder="view, edit, admin"
            />
          </div>
          <button className="submit-btn" onClick={handleAddUser}>
            Add User
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  {editingId === user.id ? (
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {editingId === user.id ? (
                    <input
                      value={editForm.role}
                      onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    />
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {editingId === user.id ? (
                    <input
                      value={editForm.permissions}
                      onChange={(e) => setEditForm({...editForm, permissions: e.target.value})}
                      placeholder="Comma separated values"
                    />
                  ) : (
                    <div className="permissions">
                      {user.permissions.map(permission => (
                        <PermissionBadge key={permission} permission={permission} />
                      ))}
                    </div>
                  )}
                </td>
                <td>
                  <div className="user-actions">
                    {editingId === user.id ? (
                      <button 
                        className="save-btn"
                        onClick={handleSaveEdit}
                      >
                        Save
                      </button>
                    ) : (
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(user)}
                      >
                        <FaEdit /> Edit
                      </button>
                    )}
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(user.id)}
                      disabled={editingId === user.id}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CyberCard>
  );
};

// Add this CSS to your styles
const styles = `
.user-management-card {
  padding: 2rem;
  border-radius: 12px;
  background: linear-gradient(145deg, #0f0f1a, #1a1a2e);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-icon {
  margin-right: 10px;
  color: #64ffda;
}

.add-user-btn {
  background: #00cf9a;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.add-user-btn:hover {
  background: #00b386;
  transform: translateY(-2px);
}

.user-form {
  background: rgba(25, 25, 50, 0.6);
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  border: 1px solid #64ffda33;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #a0a0c0;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border-radius: 6px;
  background: rgba(10, 15, 35, 0.5);
  border: 1px solid #4a4a7a;
  color: white;
  font-size: 1rem;
}

.submit-btn {
  background: #2962ff;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover {
  background: #0039cb;
}

.table-container {
  overflow-x: auto;
  border-radius: 10px;
  border: 1px solid #64ffda33;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(20, 25, 45, 0.6);
}

.user-table th {
  background: rgba(40, 45, 75, 0.8);
  padding: 16px 20px;
  text-align: left;
  color: #64ffda;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.user-table td {
  padding: 15px 20px;
  border-bottom: 1px solid #303050;
  color: #e0e0f0;
}

.user-table tr:last-child td {
  border-bottom: none;
}

.user-table tr:hover td {
  background: rgba(50, 55, 85, 0.4);
}

.permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(100, 255, 218, 0.15);
  color: #64ffda;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.key-icon {
  font-size: 0.7rem;
  opacity: 0.8;
}

.user-actions {
  display: flex;
  gap: 12px;
}

.edit-btn, .save-btn {
  background: rgba(41, 98, 255, 0.2);
  color: #2962ff;
  border: 1px solid #2962ff;
}

.delete-btn {
  background: rgba(255, 76, 76, 0.2);
  color: #ff4c4c;
  border: 1px solid #ff4c4c;
}

.edit-btn, .delete-btn, .save-btn {
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: rgba(41, 98, 255, 0.3);
}

.save-btn {
  background: rgba(0, 207, 154, 0.2);
  color: #00cf9a;
  border: 1px solid #00cf9a;
}

.save-btn:hover {
  background: rgba(0, 207, 154, 0.3);
}

.delete-btn:hover {
  background: rgba(255, 76, 76, 0.3);
}

input:focus {
  outline: none;
  border-color: #64ffda;
  box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.2);
}

`;
export default UserManagement;

// Don't forget to inject the styles
// (Assuming you have a way to add CSS, e.g. styled-components or global CSS)