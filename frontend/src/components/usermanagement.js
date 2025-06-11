import React, { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaEdit, FaTrash, FaPlus, FaKey, FaSearch, FaTimes, FaFilter, FaSort, FaChartBar, FaSun, FaMoon, FaUserShield, FaLockOpen } from 'react-icons/fa';
import './user.css';

const UserManagement = () => {
  // Predefined roles and permissions
  const ROLES = [
    'County Engineer', 
    'Field Supervisor', 
    'Contract Manager', 
    'Finance Officer', 
    'Public Relations',
    'System Administrator'
  ];
  
  const PERMISSIONS = [
    'view', 
    'edit', 
    'admin', 
    'report', 
    'finance',
    'audit'
  ];

  // Initial users data with additional fields
  const initialUsers = [
    { id: 1, name: 'John Mwenda', role: 'County Engineer', permissions: ['admin', 'edit'], email: 'john@county.gov', phone: '+254 712 345 678', status: 'active', lastActive: '2023-05-15' },
    { id: 2, name: 'Sarah Kimathi', role: 'Field Supervisor', permissions: ['view', 'report'], email: 'sarah@county.gov', phone: '+254 723 456 789', status: 'active', lastActive: '2023-05-18' },
    { id: 3, name: 'David Muriuki', role: 'Contract Manager', permissions: ['view', 'edit'], email: 'david@county.gov', phone: '+254 734 567 890', status: 'inactive', lastActive: '2023-04-22' },
    { id: 4, name: 'Grace Karanja', role: 'Finance Officer', permissions: ['view', 'finance'], email: 'grace@county.gov', phone: '+254 745 678 901', status: 'active', lastActive: '2023-05-20' },
    { id: 5, name: 'Peter Gitonga', role: 'Public Relations', permissions: ['view'], email: 'peter@county.gov', phone: '+254 756 789 012', status: 'active', lastActive: '2023-05-19' },
    { id: 6, name: 'Lucy Wambui', role: 'System Administrator', permissions: ['admin', 'edit', 'audit'], email: 'lucy@county.gov', phone: '+254 767 890 123', status: 'active', lastActive: '2023-05-21' },
    { id: 7, name: 'Michael Otieno', role: 'Field Supervisor', permissions: ['view', 'report'], email: 'michael@county.gov', phone: '+254 778 901 234', status: 'inactive', lastActive: '2023-03-10' },
    { id: 8, name: 'Esther Njeri', role: 'Finance Officer', permissions: ['view', 'finance', 'report'], email: 'esther@county.gov', phone: '+254 789 012 345', status: 'active', lastActive: '2023-05-17' }
  ];

  // State management
  const [users, setUsers] = useState(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState(initialUsers);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: '', permissions: [], status: 'active' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [resetUserId, setResetUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [formErrors, setFormErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const usersPerPage = 8;
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Filter and sort users
  const filterAndSortUsers = useCallback(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        user.permissions.some(p => p.toLowerCase().includes(term))
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredUsers(result);
    setCurrentPage(1);
  }, [users, searchTerm, roleFilter, statusFilter, sortConfig]);

  // Initialize and handle filtering/sorting
  useEffect(() => {
    filterAndSortUsers();
  }, [filterAndSortUsers]);

  // Request sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.role) errors.role = 'Role is required';
    if (formData.permissions.length === 0) errors.permissions = 'At least one permission is required';
    return errors;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle permission changes
  const handlePermissionChange = (permission) => {
    setFormData(prev => {
      const permissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      
      return { ...prev, permissions };
    });
    
    // Clear error when permission is selected
    if (formErrors.permissions) {
      setFormErrors(prev => ({ ...prev, permissions: '' }));
    }
  };

  // Open form for adding new user
  const openAddForm = () => {
    setFormData({ name: '', email: '', phone: '', role: '', permissions: [], status: 'active' });
    setIsEditing(false);
    setFormErrors({});
    setShowFormModal(true);
  };

  // Open form for editing user
  const openEditForm = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: [...user.permissions],
      status: user.status
    });
    setCurrentUserId(user.id);
    setIsEditing(true);
    setFormErrors({});
    setShowFormModal(true);
  };

  // Submit user form (add/edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    if (isEditing) {
      // Update existing user
      setUsers(users.map(user => 
        user.id === currentUserId ? {
          ...user,
          ...formData
        } : user
      ));
      
      setStatusMessage({ type: 'success', text: 'User updated successfully' });
    } else {
      // Add new user
      const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        lastActive: new Date().toISOString().split('T')[0],
        ...formData
      };
      
      setUsers([...users, newUser]);
      setStatusMessage({ type: 'success', text: 'User added successfully' });
    }
    
    // Close modal and reset form
    setShowFormModal(false);
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
  };

  // Confirm deletion
  const confirmDelete = (id) => {
    setDeleteUserId(id);
    setShowDeleteModal(true);
  };

  // Execute deletion
  const executeDelete = () => {
    setUsers(users.filter(user => user.id !== deleteUserId));
    setShowDeleteModal(false);
    setStatusMessage({ type: 'success', text: 'User deleted successfully' });
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
  };

  // Confirm password reset
  const confirmReset = (id) => {
    setResetUserId(id);
    setShowResetModal(true);
  };

  // Execute password reset
  const executeReset = () => {
    setShowResetModal(false);
    setStatusMessage({ type: 'success', text: 'Password reset email sent successfully' });
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
  };

  // Toggle user status
  const toggleUserStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id ? {
        ...user,
        status: user.status === 'active' ? 'inactive' : 'active'
      } : user
    ));
    
    setStatusMessage({ type: 'success', text: 'User status updated' });
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000);
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Permission badge component
  const PermissionBadge = ({ permission }) => (
    <span className="permission-tag" title={`${permission} access`}>
      <FaKey className="key-icon" /> {permission}
    </span>
  );

  // CyberCard component
  const CyberCard = ({ children, className }) => (
    <div className={`cyber-card ${className || ''}`}>{children}</div>
  );

  // Role statistics for analytics
  const roleStats = ROLES.map(role => ({
    role,
    count: users.filter(u => u.role === role).length
  }));

  // Status statistics
  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;

  return (
    <div className={`user-management-container ${darkMode ? 'dark' : 'light'}`}>
      <CyberCard className="user-management-card">
        {/* Status Messages */}
        {statusMessage.text && (
          <div className={`status-message ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        <div className="header-section">
          <div className="title-container">
            <h2><FaUsers className="header-icon" /> User Management</h2>
            <div className="theme-toggle" onClick={toggleDarkMode}>
              {darkMode ? <FaSun /> : <FaMoon />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
          </div>
          
          <div className="controls">
            <div className="filters">
              <div className="filter-group">
                <label>Filter by Role:</label>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="all">All Roles</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Filter by Status:</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <FaTimes 
                  className="clear-search" 
                  onClick={() => setSearchTerm('')} 
                />
              )}
            </div>
            
            <div className="action-buttons">
              <button 
                className="analytics-btn"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <FaChartBar /> {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
              </button>
              
              <button 
                className="add-user-btn"
                onClick={openAddForm}
              >
                <FaPlus /> Add User
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        {showAnalytics && (
          <CyberCard className="analytics-dashboard">
            <div className="dashboard-header">
              <h3><FaChartBar /> User Analytics</h3>
            </div>
            
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-value">{users.length}</div>
                <div className="stat-label">Total Users</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{activeUsers}</div>
                <div className="stat-label">Active Users</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{inactiveUsers}</div>
                <div className="stat-label">Inactive Users</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{ROLES.length}</div>
                <div className="stat-label">User Roles</div>
              </div>
            </div>
            
            <div className="charts-container">
              <div className="chart">
                <h4>Users by Role</h4>
                <div className="bar-chart">
                  {roleStats.map((stat, index) => (
                    <div key={stat.role} className="bar-container">
                      <div className="bar-label">{stat.role}</div>
                      <div className="bar-track">
                        <div 
                          className="bar-fill" 
                          style={{ width: `${(stat.count / users.length) * 100}%` }}
                        >
                          <span className="bar-value">{stat.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="chart">
                <h4>User Status</h4>
                <div className="status-chart">
                  <div className="status active" style={{ flex: activeUsers }}>
                    <span>{activeUsers} Active</span>
                  </div>
                  <div className="status inactive" style={{ flex: inactiveUsers }}>
                    <span>{inactiveUsers} Inactive</span>
                  </div>
                </div>
              </div>
            </div>
          </CyberCard>
        )}

        {/* User Table */}
        <div className="table-container">
          {filteredUsers.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🚫</div>
              <h3>No users found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button className="add-user-btn" onClick={openAddForm}>
                <FaPlus /> Add New User
              </button>
            </div>
          ) : (
            <>
              <table className="user-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort('name')}>
                      <div className="sort-header">
                        Name {getSortIndicator('name')}
                      </div>
                    </th>
                    <th onClick={() => requestSort('role')}>
                      <div className="sort-header">
                        Role {getSortIndicator('role')}
                      </div>
                    </th>
                    <th>Permissions</th>
                    <th onClick={() => requestSort('status')}>
                      <div className="sort-header">
                        Status {getSortIndicator('status')}
                      </div>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map(user => (
                    <tr key={user.id} className={user.status}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">{user.name.charAt(0)}</div>
                          <div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="user-role">{user.role}</span>
                      </td>
                      <td>
                        <div className="permissions">
                          {user.permissions.map(permission => (
                            <PermissionBadge key={permission} permission={permission} />
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="status-toggle">
                          <span className={`status-badge ${user.status}`}>
                            {user.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                          <button 
                            className={`toggle-btn ${user.status}`}
                            onClick={() => toggleUserStatus(user.id)}
                            title={`Mark as ${user.status === 'active' ? 'inactive' : 'active'}`}
                          >
                            {user.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="user-actions">
                          <button 
                            className="edit-btn"
                            onClick={() => openEditForm(user)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="reset-btn"
                            onClick={() => confirmReset(user.id)}
                            title="Reset Password"
                          >
                            <FaLockOpen />
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => confirmDelete(user.id)}
                            title="Delete User"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="pagination-btn"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add/Edit User Modal */}
        {showFormModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>{isEditing ? 'Edit User' : 'Add New User'}</h3>
                <button 
                  className="close-modal"
                  onClick={() => setShowFormModal(false)}
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className={formErrors.name ? 'error' : ''}
                  />
                  {formErrors.name && (
                    <div className="error-message">{formErrors.name}</div>
                  )}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="user@example.com"
                      className={formErrors.email ? 'error' : ''}
                    />
                    {formErrors.email && (
                      <div className="error-message">{formErrors.email}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Phone</label>
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+254 XXX XXX XXX"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={formErrors.role ? 'error' : ''}
                    >
                      <option value="">Select a role</option>
                      {ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    {formErrors.role && (
                      <div className="error-message">{formErrors.role}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Permissions *</label>
                  <div className="permissions-container">
                    {PERMISSIONS.map(permission => (
                      <label key={permission} className="permission-option">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionChange(permission)}
                        />
                        <span className="checkmark"></span>
                        {permission}
                      </label>
                    ))}
                  </div>
                  {formErrors.permissions && (
                    <div className="error-message">{formErrors.permissions}</div>
                  )}
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowFormModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {isEditing ? 'Update User' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal delete-modal">
              <div className="modal-header">
                <h3>Confirm Deletion</h3>
              </div>
              
              <div className="modal-body">
                <div className="warning-icon">⚠️</div>
                <p>Are you sure you want to delete this user? This action cannot be undone.</p>
                <p className="warning-text">All user data and permissions will be permanently removed.</p>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-delete-btn"
                  onClick={executeDelete}
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Reset Modal */}
        {showResetModal && (
          <div className="modal-overlay">
            <div className="modal reset-modal">
              <div className="modal-header">
                <h3>Reset User Password</h3>
              </div>
              
              <div className="modal-body">
                <div className="key-icon"><FaKey /></div>
                <p>Are you sure you want to reset this user's password?</p>
                <p>A password reset link will be sent to the user's email address.</p>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowResetModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-reset-btn"
                  onClick={executeReset}
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        )}
      </CyberCard>
    </div>
  );
};

// CSS Styles
const styles = `
.user-management-container {
  padding: 20px;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: background-color 0.3s ease;
}

.user-management-container.dark {
  background: linear-gradient(135deg, #0a0f1a 0%, #1a1a2e 100%);
  color: #ffffff;
}

.user-management-container.light {
  background: linear-gradient(135deg, #f0f5ff 0%, #e6e9ff 100%);
  color: #2a2a4a;
}

.cyber-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  margin: 0 auto;
  max-width: 1400px;
  transition: all 0.3s ease;
}

.user-management-container.light .cyber-card {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 8px 32px rgba(0, 0, 80, 0.1);
}

.header-section {
  padding: 25px 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-management-container.light .header-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-container h2 {
  margin: 0;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64ffda;
  font-weight: 600;
}

.user-management-container.light .title-container h2 {
  color: #2962ff;
}

.header-icon {
  font-size: 1.4rem;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 15px;
  border-radius: 30px;
  background: rgba(100, 255, 218, 0.1);
  border: 1px solid rgba(100, 255, 218, 0.2);
  transition: all 0.3s ease;
}

.user-management-container.light .theme-toggle {
  background: rgba(41, 98, 255, 0.1);
  border: 1px solid rgba(41, 98, 255, 0.2);
}

.theme-toggle:hover {
  background: rgba(100, 255, 218, 0.2);
  transform: translateY(-2px);
}

.user-management-container.light .theme-toggle:hover {
  background: rgba(41, 98, 255, 0.2);
}

.theme-toggle span {
  font-size: 0.9rem;
  font-weight: 500;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 500;
  opacity: 0.8;
}

.filter-group select {
  padding: 10px 15px;
  border-radius: 8px;
  background: rgba(20, 25, 45, 0.7);
  border: 1px solid #4a4a7a;
  color: white;
  min-width: 180px;
  transition: all 0.3s;
}

.user-management-container.light .filter-group select {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #d0d0e0;
  color: #2a2a4a;
}

.filter-group select:focus {
  outline: none;
  border-color: #64ffda;
  box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.2);
}

.user-management-container.light .filter-group select:focus {
  border-color: #2962ff;
  box-shadow: 0 0 0 2px rgba(41, 98, 255, 0.2);
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #a0a0c0;
  font-size: 14px;
}

.search-input {
  padding: 12px 15px 12px 40px;
  border-radius: 8px;
  background: rgba(20, 25, 45, 0.7);
  border: 1px solid #4a4a7a;
  color: white;
  width: 100%;
  transition: all 0.3s;
  font-size: 0.95rem;
}

.user-management-container.light .search-input {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #d0d0e0;
  color: #2a2a4a;
}

.search-input:focus {
  outline: none;
  border-color: #64ffda;
  box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.2);
}

.user-management-container.light .search-input:focus {
  border-color: #2962ff;
  box-shadow: 0 0 0 2px rgba(41, 98, 255, 0.2);
}

.clear-search {
  position: absolute;
  right: 12px;
  color: #a0a0c0;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.clear-search:hover {
  color: #ff4c4c;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.add-user-btn, .analytics-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.95rem;
}

.add-user-btn {
  background: linear-gradient(135deg, #2962ff 0%, #0039cb 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(41, 98, 255, 0.3);
}

.analytics-btn {
  background: linear-gradient(135deg, #00c853 0%, #009624 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(0, 200, 83, 0.3);
}

.add-user-btn:hover, .analytics-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(41, 98, 255, 0.4);
}

.analytics-btn:hover {
  box-shadow: 0 6px 20px rgba(0, 200, 83, 0.4);
}

/* Status Messages */
.status-message {
  padding: 15px 25px;
  margin: 0 30px;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  animation: fadeIn 0.3s ease-in-out;
  margin-bottom: 20px;
}

.status-message.success {
  background: rgba(40, 167, 69, 0.15);
  border: 1px solid rgba(40, 167, 69, 0.3);
  color: #28a745;
}

.status-message.error {
  background: rgba(220, 53, 69, 0.15);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #dc3545;
}

.user-management-container.light .status-message.success {
  background: rgba(40, 167, 69, 0.2);
}

.user-management-container.light .status-message.error {
  background: rgba(220, 53, 69, 0.2);
}

/* Analytics Dashboard */
.analytics-dashboard {
  margin: 0 30px 30px;
  border-radius: 12px;
  overflow: hidden;
  animation: slideDown 0.5s ease-out;
}

.dashboard-header {
  padding: 20px 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-management-container.light .dashboard-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.dashboard-header h3 {
  margin: 0;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64ffda;
}

.user-management-container.light .dashboard-header h3 {
  color: #2962ff;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 25px;
}

.stat-card {
  background: rgba(20, 25, 45, 0.5);
  border-radius: 12px;
  padding: 25px 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(100, 255, 218, 0.1);
}

.user-management-container.light .stat-card {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(41, 98, 255, 0.1);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #64ffda;
}

.user-management-container.light .stat-value {
  color: #2962ff;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.8;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  padding: 0 25px 25px;
}

.chart {
  background: rgba(20, 25, 45, 0.5);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(100, 255, 218, 0.1);
}

.user-management-container.light .chart {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(41, 98, 255, 0.1);
}

.chart h4 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.1rem;
  color: #64ffda;
}

.user-management-container.light .chart h4 {
  color: #2962ff;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.bar-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.bar-label {
  min-width: 150px;
  font-size: 0.9rem;
}

.bar-track {
  flex: 1;
  height: 20px;
  background: rgba(100, 255, 218, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.user-management-container.light .bar-track {
  background: rgba(41, 98, 255, 0.1);
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00c853, #64ffda);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
  animation: growWidth 1s ease-out;
}

.user-management-container.light .bar-fill {
  background: linear-gradient(90deg, #2962ff, #64b5f6);
}

.bar-value {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-chart {
  display: flex;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.status.active {
  background: linear-gradient(90deg, #00c853, #64ffda);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.status.inactive {
  background: linear-gradient(90deg, #ff5252, #ff867c);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.user-management-container.light .status.active {
  background: linear-gradient(90deg, #2962ff, #64b5f6);
}

.user-management-container.light .status.inactive {
  background: linear-gradient(90deg, #ff5252, #ff867c);
}

/* Table Styles */
.table-container {
  padding: 0 30px 30px;
}

.user-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: rgba(20, 25, 45, 0.3);
  border-radius: 12px;
  overflow: hidden;
}

.user-management-container.light .user-table {
  background: rgba(255, 255, 255, 0.4);
}

.user-table th {
  padding: 18px 20px;
  text-align: left;
  font-weight: 600;
  color: #64ffda;
  background: rgba(20, 25, 45, 0.5);
  border-bottom: 1px solid rgba(100, 255, 218, 0.1);
  cursor: pointer;
  transition: background 0.3s ease;
}

.user-management-container.light .user-table th {
  color: #2962ff;
  background: rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(41, 98, 255, 0.1);
}

.user-table th:hover {
  background: rgba(100, 255, 218, 0.1);
}

.user-management-container.light .user-table th:hover {
  background: rgba(41, 98, 255, 0.1);
}

.sort-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-table td {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.user-management-container.light .user-table td {
  border-bottom: 1px solid rgba(0, 0, 0, 0.03);
}

.user-table tr:last-child td {
  border-bottom: none;
}

.user-table tr:hover td {
  background: rgba(100, 255, 218, 0.05);
}

.user-management-container.light .user-table tr:hover td {
  background: rgba(41, 98, 255, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2962ff, #64ffda);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}

.user-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.user-email {
  font-size: 0.85rem;
  opacity: 0.8;
}

.user-role {
  background: rgba(100, 255, 218, 0.1);
  padding: 5px 12px;
  border-radius: 30px;
  font-size: 0.85rem;
  display: inline-block;
}

.user-management-container.light .user-role {
  background: rgba(41, 98, 255, 0.1);
}

.permissions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag {
  background: rgba(41, 98, 255, 0.15);
  color: #64ffda;
  padding: 5px 12px;
  border-radius: 30px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
}

.user-management-container.light .permission-tag {
  background: rgba(41, 98, 255, 0.1);
  color: #2962ff;
}

.permission-tag:hover {
  background: rgba(41, 98, 255, 0.3);
  transform: translateY(-2px);
}

.key-icon {
  font-size: 0.8rem;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(40, 167, 69, 0.15);
  color: #28a745;
}

.status-badge.inactive {
  background: rgba(220, 53, 69, 0.15);
  color: #dc3545;
}

.toggle-btn {
  background: none;
  border: none;
  color: #a0a0c0;
  font-size: 0.8rem;
  cursor: pointer;
  transition: color 0.2s;
  padding: 5px;
}

.toggle-btn.active:hover {
  color: #dc3545;
}

.toggle-btn.inactive:hover {
  color: #28a745;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.edit-btn, .reset-btn, .delete-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: rgba(41, 98, 255, 0.15);
  color: #2962ff;
}

.reset-btn {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.delete-btn {
  background: rgba(220, 53, 69, 0.15);
  color: #dc3545;
}

.edit-btn:hover {
  background: rgba(41, 98, 255, 0.3);
  transform: translateY(-3px);
}

.reset-btn:hover {
  background: rgba(255, 193, 7, 0.3);
  transform: translateY(-3px);
}

.delete-btn:hover {
  background: rgba(220, 53, 69, 0.3);
  transform: translateY(-3px);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 25px 0 10px;
  gap: 10px;
}

.pagination-btn {
  padding: 8px 16px;
  background: rgba(20, 25, 45, 0.5);
  color: #a0a0c0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.user-management-container.light .pagination-btn {
  background: rgba(255, 255, 255, 0.6);
  color: #2a2a4a;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(100, 255, 218, 0.2);
  color: white;
}

.user-management-container.light .pagination-btn:hover:not(:disabled) {
  background: rgba(41, 98, 255, 0.2);
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: rgba(41, 98, 255, 0.3);
  color: white;
  font-weight: 600;
}

/* No Results */
.no-results {
  text-align: center;
  padding: 50px 30px;
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-results h3 {
  margin: 0 0 10px;
  font-size: 1.5rem;
  color: #64ffda;
}

.user-management-container.light .no-results h3 {
  color: #2962ff;
}

.no-results p {
  margin: 0 0 25px;
  opacity: 0.8;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 15, 30, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease-in-out;
}

.user-management-container.light .modal-overlay {
  background: rgba(0, 0, 20, 0.8);
}

.modal {
  background: linear-gradient(145deg, #0f0f1a, #1a1a2e);
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  width: 90%;
  max-width: 600px;
  border: 1px solid rgba(100, 255, 218, 0.2);
  overflow: hidden;
  animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.user-management-container.light .modal {
  background: linear-gradient(145deg, #f5f7ff, #e6e9ff);
  border: 1px solid rgba(41, 98, 255, 0.2);
}

.delete-modal, .reset-modal {
  max-width: 500px;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-management-container.light .modal-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-header h3 {
  margin: 0;
  color: #64ffda;
  font-size: 1.5rem;
}

.user-management-container.light .modal-header h3 {
  color: #2962ff;
}

.close-modal {
  background: transparent;
  border: none;
  color: #a0a0c0;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.close-modal:hover {
  color: #ff4c4c;
  transform: rotate(90deg);
}

.user-form {
  padding: 0 25px 25px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  color: #a0a0c0;
}

.user-management-container.light .form-group label {
  color: #555;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 12px 15px;
  border-radius: 8px;
  background: rgba(20, 25, 45, 0.7);
  border: 1px solid #4a4a7a;
  color: white;
  font-size: 1rem;
  transition: all 0.3s;
}

.user-management-container.light .form-group input, 
.user-management-container.light .form-group select {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #d0d0e0;
  color: #2a2a4a;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #64ffda;
  box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.2);
}

.user-management-container.light .form-group input:focus,
.user-management-container.light .form-group select:focus {
  border-color: #2962ff;
  box-shadow: 0 0 0 2px rgba(41, 98, 255, 0.2);
}

.permissions-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 10px;
}

.permission-option {
  position: relative;
  padding-left: 30px;
  cursor: pointer;
  font-size: 0.9rem;
  user-select: none;
}

.permission-option input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background: rgba(20, 25, 45, 0.7);
  border: 1px solid #4a4a7a;
  border-radius: 4px;
  transition: all 0.2s;
}

.user-management-container.light .checkmark {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #d0d0e0;
}

.permission-option:hover input ~ .checkmark {
  border-color: #64ffda;
}

.user-management-container.light .permission-option:hover input ~ .checkmark {
  border-color: #2962ff;
}

.permission-option input:checked ~ .checkmark {
  background: #64ffda;
  border-color: #64ffda;
}

.user-management-container.light .permission-option input:checked ~ .checkmark {
  background: #2962ff;
  border-color: #2962ff;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.permission-option input:checked ~ .checkmark:after {
  display: block;
}

.permission-option .checkmark:after {
  left: 7px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

.cancel-btn, .submit-btn {
  padding: 12px 25px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #a0a0c0;
}

.user-management-container.light .cancel-btn {
  background: rgba(0, 0, 0, 0.05);
  color: #555;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.user-management-container.light .cancel-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #222;
}

.submit-btn {
  background: linear-gradient(135deg, #2962ff 0%, #0039cb 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(41, 98, 255, 0.3);
}

.submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(41, 98, 255, 0.4);
}

/* Delete Modal */
.delete-modal .modal-body, .reset-modal .modal-body {
  padding: 30px;
  text-align: center;
}

.warning-icon, .key-icon {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #ff4c4c;
}

.reset-modal .key-icon {
  color: #64ffda;
  font-size: 2.5rem;
}

.user-management-container.light .reset-modal .key-icon {
  color: #2962ff;
}

.delete-modal p, .reset-modal p {
  margin: 0 0 15px;
  font-size: 1.1rem;
  line-height: 1.6;
}

.warning-text {
  color: #ff4c4c;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 0 25px 25px;
}

.confirm-delete-btn, .confirm-reset-btn {
  padding: 12px 30px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
  color: white;
}

.confirm-delete-btn {
  background: linear-gradient(135deg, #ff5252 0%, #b71c1c 100%);
  box-shadow: 0 4px 15px rgba(255, 82, 82, 0.3);
}

.confirm-delete-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 82, 82, 0.4);
}

.confirm-reset-btn {
  background: linear-gradient(135deg, #00c853 0%, #009624 100%);
  box-shadow: 0 4px 15px rgba(0, 200, 83, 0.3);
}

.confirm-reset-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 200, 83, 0.4);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideIn {
  from { 
    transform: translateY(50px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from { 
    transform: translateY(-20px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes growWidth {
  from { width: 0; }
  to { width: 100%; }
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .controls {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .user-table {
    font-size: 0.9rem;
  }
  
  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .user-avatar {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .modal {
    width: 95%;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions button {
    width: 100%;
  }
  
  .permissions-container {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
}
`;

// Inject styles (implementation depends on your setup)
export default UserManagement;