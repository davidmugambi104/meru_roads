import React, { useState, useEffect, useRef } from 'react';
import { FaTruck, FaSearch, FaFilter, FaEdit, FaTrash, FaPlus, FaSync, FaMapMarkerAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AssetManager = () => {
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('assets');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Excavator', status: 'Active', location: 'Maua Highway', lastService: '2023-05-15' },
      { id: 2, name: 'Bulldozer', status: 'Maintenance', location: 'Nkubu Bypass', lastService: '2023-06-20' },
      { id: 3, name: 'Asphalt Paver', status: 'Active', location: 'Makutano Junction', lastService: '2023-04-30' },
      { id: 4, name: 'Road Roller', status: 'Idle', location: 'Mikinduri Road', lastService: '2023-07-10' },
      { id: 5, name: 'Dump Truck', status: 'Active', location: 'Kianjai Corridor', lastService: '2023-05-28' }
    ];
  });

  const [query, setQuery] = useState('');
  const [statusView, setStatusView] = useState('All');
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [newAsset, setNewAsset] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [sortOptions, setSortOptions] = useState({ key: 'id', direction: 'ascending' });
  const [alert, setAlert] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    const outsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setModalVisible(false);
        setEditId(null);
      }
    };
    document.addEventListener('mousedown', outsideClick);
    return () => document.removeEventListener('mousedown', outsideClick);
  }, []);

  const applySearch = (e) => setQuery(e.target.value);
  const toggleStatusView = (status) => setStatusView(status);

  const updateSort = (key) => {
    const direction = (sortOptions.key === key && sortOptions.direction === 'ascending') ? 'descending' : 'ascending';
    setSortOptions({ key, direction });
  };

  const sortedAssets = [...assets].sort((a, b) => {
    if (a[sortOptions.key] < b[sortOptions.key]) return sortOptions.direction === 'ascending' ? -1 : 1;
    if (a[sortOptions.key] > b[sortOptions.key]) return sortOptions.direction === 'ascending' ? 1 : -1;
    return 0;
  });

  const displayedAssets = sortedAssets.filter(asset => {
    const searchMatch = asset.name.toLowerCase().includes(query.toLowerCase()) || asset.location.toLowerCase().includes(query.toLowerCase());
    const statusMatch = statusView === 'All' || asset.status === statusView;
    return searchMatch && statusMatch;
  });

  const startEdit = (id) => {
    const found = assets.find(item => item.id === id);
    setEditId(id);
    setEditFields({ ...found });
  };

  const saveChanges = () => {
    setAssets(assets.map(asset => asset.id === editId ? { ...asset, ...editFields } : asset));
    setEditId(null);
    notify('Asset updated successfully!');
  };

  const removeAsset = (id) => {
    setAssets(assets.filter(item => item.id !== id));
    notify('Asset removed.');
  };

  const addAsset = () => {
    const newId = Math.max(0, ...assets.map(a => a.id)) + 1;
    setAssets([...assets, { ...newAsset, id: newId }]);
    setModalVisible(false);
    setNewAsset({});
    notify('New asset added!');
  };

  const notify = (msg) => {
    setAlert(msg);
    setTimeout(() => setAlert(null), 3000);
  };

  const stateIcons = {
    Active: '🟢',
    Maintenance: '🟠',
    Idle: '🔵'
  };

 // Updated CSS variables for vibrant modern theme
  const styles = {
    root: {
      '--primary': '#7c4dff',         // Vibrant violet
      '--primary-dark': '#512da8',    // Deep vibrant indigo
      '--primary-light': '#9575cd',   // Softer lilac
      '--secondary': '#00bcd4',       // Sharper cyan
      '--success': '#43a047',         // Deep emerald green
      '--warning': '#fb8c00',         // Bolder amber-orange
      '--danger': '#e53935',          // Punchier red
      '--dark': '#1a1f2e',            // Cleaner, modern dark
      '--darker': '#141925',          // Richer dark variant
      '--light': '#f8fafc',           // Brighter, cleaner light
      '--gray': '#374151',            // Slightly cooler gray
      '--glass': 'rgba(30, 41, 59, 0.6)',  // Adjusted glass effect
      '--glass-border': 'rgba(255, 255, 255, 0.08)', // Brighter border for glass
      '--transition': 'all 0.35s cubic-bezier(0.25, 1, 0.5, 1)',  // Smoother animation
      '--shadow': '0 10px 25px rgba(0, 0, 0, 0.35)',              // Deeper shadow
      '--inner-shadow': 'inset 0 1px 3px rgba(255, 255, 255, 0.06)', // Softer inner glow
      '--glow': '0 0 15px rgba(124, 77, 255, 0.7)',               // Purple glow effect
      '--cyan-glow': '0 0 12px rgba(0, 188, 212, 0.6)',           // Cyan glow effect
    },
    
    systemBackground: {
      position: 'relative',
      maxWidth: '1400px',
      margin: '0 auto',
      overflow: 'hidden',
      borderRadius: '24px',
      background: 'linear-gradient(145deg, #0f172a, #1e293b)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--shadow)',
      padding: '2px',
      zIndex: 1,
    },
    
    systemPanel: {
      position: 'relative',
      background: 'var(--glass)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderRadius: '24px',
      padding: '30px',
      zIndex: 2,
    },
    
    panelHeader: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '25px',
      marginBottom: '25px',
      borderBottom: '1px solid var(--glass-border)',
      gap: '20px',
    },
    
    controlArea: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px',
      alignItems: 'center',
    },
    
    inputSearch: {
      position: 'relative',
      minWidth: '280px',
    },
    
    inputField: {
      width: '100%',
      padding: '14px 20px 14px 50px',
      borderRadius: '12px',
      background: 'rgba(15, 23, 42, 0.7)',
      border: '1px solid var(--glass-border)',
      color: 'var(--light)',
      fontSize: '16px',
      transition: 'var(--transition)',
      boxShadow: 'var(--inner-shadow)',
    },
    
    statusFilters: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 15px',
      borderRadius: '12px',
      background: 'rgba(15, 23, 42, 0.5)',
      border: '1px solid var(--glass-border)',
    },
    
    statusButton: {
      padding: '8px 16px',
      borderRadius: '8px',
      background: 'transparent',
      border: 'none',
      color: 'var(--light)',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'var(--transition)',
      position: 'relative',
      overflow: 'hidden',
    },
    
    statusButtonActive: {
      background: 'rgba(94, 53, 177, 0.3)',
      boxShadow: 'var(--glow)',
    },
    
    addButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 24px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
      border: 'none',
      color: 'white',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'var(--transition)',
      boxShadow: '0 4px 20px rgba(94, 53, 177, 0.6)',
      position: 'relative',
      overflow: 'hidden',
    },
    
    tableHeader: {
      display: 'grid',
      gridTemplateColumns: '2fr 1.5fr 2fr 1fr',
      padding: '15px 20px',
      background: 'rgba(15, 23, 42, 0.7)',
      borderRadius: '12px',
      marginBottom: '15px',
      fontWeight: '600',
      color: 'var(--primary-light)',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--inner-shadow)',
    },
    
    columnHead: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      transition: 'var(--transition)',
      padding: '5px 10px',
      borderRadius: '8px',
    },
    
    assetTable: {
      display: 'grid',
      gap: '18px',
    },
    
    assetCard: {
      display: 'grid',
      gridTemplateColumns: '2fr 1.5fr 2fr 1fr',
      alignItems: 'center',
      padding: '20px',
      borderRadius: '16px',
      background: 'rgba(30, 41, 59, 0.5)',
      border: '1px solid var(--glass-border)',
      transition: 'var(--transition)',
      position: 'relative',
      overflow: 'hidden',
      backdropFilter: 'blur(5px)',
      boxShadow: 'var(--inner-shadow)',
    },
    
    assetMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '18px',
    },
    
    assetIcon: {
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(15, 23, 42, 0.8)',
      borderRadius: '14px',
      fontSize: '28px',
      boxShadow: 'var(--inner-shadow)',
    },
    
    metaInfo: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
    },
    
    badgeStatus: {
      padding: '5px 12px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    
    badgeActive: {
      background: 'rgba(67, 160, 71, 0.15)',
      color: '#43a047',
    },
    
    badgeMaintenance: {
      background: 'rgba(251, 140, 0, 0.15)',
      color: '#fb8c00',
    },
    
    badgeIdle: {
      background: 'rgba(0, 188, 212, 0.15)',
      color: '#00bcd4',
    },
    
    badgeLocation: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 12px',
      borderRadius: '20px',
      background: 'rgba(15, 23, 42, 0.5)',
      fontSize: '13px',
    },
    
    actionButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
    },
    
    iconAction: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      cursor: 'pointer',
      transition: 'var(--transition)',
      fontSize: '16px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
    
    editAction: {
      background: 'rgba(41, 121, 255, 0.15)',
      color: '#2979ff',
    },
    
    deleteAction: {
      background: 'rgba(239, 83, 80, 0.15)',
      color: '#ef5350',
    },
    
    editBox: {
      display: 'grid',
      gridTemplateColumns: '2fr 1.5fr 2fr auto',
      gap: '15px',
      width: '100%',
      alignItems: 'center',
    },
    
    selectBox: {
      padding: '12px 16px',
      borderRadius: '12px',
      background: 'rgba(15, 23, 42, 0.7)',
      border: '1px solid var(--glass-border)',
      color: 'var(--light)',
      fontSize: '16px',
      transition: 'var(--transition)',
      width: '100%',
    },
    
    saveBtn: {
      padding: '12px 24px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
      border: 'none',
      color: 'white',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'var(--transition)',
    },
    
    modalCover: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)',
    },
    
    modalContent: {
      background: 'linear-gradient(145deg, #1e293b, #0f172a)',
      borderRadius: '24px',
      padding: '30px',
      width: '90%',
      maxWidth: '500px',
      border: '1px solid var(--glass-border)',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
      position: 'relative',
      overflow: 'hidden',
    },
    
    formBlock: {
      marginBottom: '20px',
    },
    
    formActions: {
      display: 'flex',
      gap: '15px',
      marginTop: '20px',
    },
    
    cancelBtn: {
      padding: '12px 24px',
      borderRadius: '12px',
      background: 'rgba(239, 83, 80, 0.15)',
      border: '1px solid rgba(239, 83, 80, 0.3)',
      color: '#ef5350',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'var(--transition)',
    },
    
    systemAlert: {
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      padding: '16px 30px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
      color: 'white',
      fontWeight: '500',
      boxShadow: '0 10px 30px rgba(94, 53, 177, 0.6)',
      zIndex: 1001,
      border: '1px solid rgba(126, 87, 194, 0.5)',
    },
    
    // Gradient accents
    gradientAccent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, var(--primary-dark), var(--primary), var(--secondary))',
      zIndex: 3,
    },
    
    // Status indicators
    statusIndicator: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '5px',
      height: '100%',
      transition: 'var(--transition)',
    },
    
    activeIndicator: {
      background: 'var(--success)',
      boxShadow: '0 0 10px rgba(67, 160, 71, 0.7)',
    },
    
    maintenanceIndicator: {
      background: 'var(--warning)',
      boxShadow: '0 0 10px rgba(251, 140, 0, 0.7)',
    },
    
    idleIndicator: {
      background: 'var(--secondary)',
      boxShadow: '0 0 10px rgba(0, 188, 212, 0.7)',
    },
    
    // Responsive styles
    responsiveGrid: {
      '@media (max-width: 1100px)': {
        gridTemplateColumns: '1.5fr 1fr 1.5fr auto',
      },
      '@media (max-width: 900px)': {
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
      },
    },
    
    responsiveActionButtons: {
      '@media (max-width: 900px)': {
        gridColumn: 'span 2',
        justifyContent: 'flex-start',
      },
    },
    
    responsiveEditBox: {
      '@media (max-width: 900px)': {
        gridTemplateColumns: '1fr',
      },
    },
    
    responsivePanelHeader: {
      '@media (max-width: 768px)': {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
    
    responsiveControlArea: {
      '@media (max-width: 768px)': {
        width: '100%',
        flexDirection: 'column',
        alignItems: 'stretch',
      },
    },
  };

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes rotate {
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .glow {
          filter: drop-shadow(0 0 10px rgba(124, 77, 255, 0.8));
          animation: pulse 2s infinite;
        }
        
        .cyan-glow {
          filter: drop-shadow(0 0 8px rgba(0, 188, 212, 0.6));
        }
        
        .column-head:hover {
          background: rgba(124, 77, 255, 0.1);
        }
        
        .input-field:focus {
          outline: none;
          border-color: var(--primary-light);
          box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.3);
        }
        
        .add-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 25px rgba(124, 77, 255, 0.8);
        }
        
        .asset-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3), var(--glow);
          border-color: rgba(124, 77, 255, 0.4);
        }
        
        .icon-action:hover {
          transform: translateY(-3px) scale(1.1);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
        }
        
        .save-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 77, 255, 0.7);
        }
        
        .cancel-btn:hover {
          background: rgba(239, 83, 80, 0.25);
        }
        
        .status-button:hover {
          background: rgba(124, 77, 255, 0.15);
        }
      `}</style>
      
      <div style={styles.systemBackground}>
        <div style={styles.gradientAccent}></div>
        
        <div style={styles.systemPanel}>
          <div style={styles.panelHeader}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaTruck className="glow" /> 
              <span style={{
                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700
              }}>Asset Manager</span>
            </h2>
            <div style={styles.controlArea}>
              <div style={styles.inputSearch}>
                <FaSearch className="cyan-glow" style={{ 
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--secondary)',
                  fontSize: '18px'
                }} />
                <input 
                  type="text"
                  placeholder="Search assets..."
                  value={query}
                  onChange={applySearch}
                  style={styles.inputField}
                  className="input-field"
                />
              </div>
              <div style={styles.statusFilters}>
                <FaFilter className="cyan-glow" />
                {['All', 'Active', 'Maintenance', 'Idle'].map(status => (
                  <button
                    key={status}
                    style={{
                      ...styles.statusButton,
                      ...(statusView === status ? styles.statusButtonActive : {})
                    }}
                    onClick={() => toggleStatusView(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <button 
                style={styles.addButton}
                onClick={() => setModalVisible(true)}
                className="add-button"
              >
                <FaPlus /> Add Asset
              </button>
            </div>
          </div>

          <div style={styles.tableHeader}>
            <div 
              style={styles.columnHead}
              onClick={() => updateSort('name')}
              className="column-head"
            >
              Asset {sortOptions.key === 'name' && (sortOptions.direction === 'ascending' ? '↑' : '↓')}
            </div>
            <div 
              style={styles.columnHead}
              onClick={() => updateSort('status')}
              className="column-head"
            >
              Status {sortOptions.key === 'status' && (sortOptions.direction === 'ascending' ? '↑' : '↓')}
            </div>
            <div 
              style={styles.columnHead}
              onClick={() => updateSort('location')}
              className="column-head"
            >
              Location {sortOptions.key === 'location' && (sortOptions.direction === 'ascending' ? '↑' : '↓')}
            </div>
            <div style={styles.columnHead}>Actions</div>
          </div>

          <div style={styles.assetTable}>
            <AnimatePresence>
              {displayedAssets.map(asset => (
                <motion.div
                  key={asset.id}
                  style={{
                    ...styles.assetCard,
                    ...styles.responsiveGrid,
                    position: 'relative'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  layout
                  className="asset-card"
                >
                  <div style={{
                    ...styles.statusIndicator,
                    ...(asset.status === 'Active' ? styles.activeIndicator : 
                         asset.status === 'Maintenance' ? styles.maintenanceIndicator : 
                         styles.idleIndicator)
                  }}></div>
                  
                  {editId === asset.id ? (
                    <div style={{...styles.editBox, ...styles.responsiveEditBox}}>
                      <input 
                        type="text" 
                        value={editFields.name} 
                        onChange={e => setEditFields({ ...editFields, name: e.target.value })} 
                        style={styles.inputField} 
                        className="input-field"
                      />
                      <select 
                        value={editFields.status} 
                        onChange={e => setEditFields({ ...editFields, status: e.target.value })} 
                        style={styles.selectBox}
                      >
                        <option value="Active">Active</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Idle">Idle</option>
                      </select>
                      <input 
                        type="text" 
                        value={editFields.location} 
                        onChange={e => setEditFields({ ...editFields, location: e.target.value })} 
                        style={styles.inputField} 
                        className="input-field"
                      />
                      <button style={styles.saveBtn} className="save-btn" onClick={saveChanges}>Save</button>
                    </div>
                  ) : (
                    <>
                      <div style={styles.assetMeta}>
                        <div style={styles.assetIcon}>🚜</div>
                        <div>
                          <h3 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            marginBottom: '8px',
                            color: 'var(--light)'
                          }}>{asset.name}</h3>
                          <div style={styles.metaInfo}>
                            <span style={{
                              ...styles.badgeStatus,
                              ...(asset.status === 'Active' ? styles.badgeActive : 
                                   asset.status === 'Maintenance' ? styles.badgeMaintenance : 
                                   styles.badgeIdle)
                            }}>
                              {stateIcons[asset.status]} {asset.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        ...styles.badgeStatus,
                        ...(asset.status === 'Active' ? styles.badgeActive : 
                             asset.status === 'Maintenance' ? styles.badgeMaintenance : 
                             styles.badgeIdle)
                      }}>
                        {stateIcons[asset.status]} {asset.status}
                      </div>
                      
                      <div style={styles.badgeLocation}>
                        <FaMapMarkerAlt className="cyan-glow" /> {asset.location}
                      </div>
                      
                      <div style={{...styles.actionButtons, ...styles.responsiveActionButtons}}>
                        <button 
                          style={{...styles.iconAction, ...styles.editAction}}
                          onClick={() => startEdit(asset.id)}
                          className="icon-action"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          style={{...styles.iconAction, ...styles.deleteAction}}
                          onClick={() => removeAsset(asset.id)}
                          className="icon-action"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalVisible && (
          <motion.div 
            style={styles.modalCover}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              style={styles.modalContent}
              ref={modalRef}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, var(--primary-dark), var(--secondary))',
                zIndex: 3,
              }}></div>
              <h3 style={{
                fontSize: '24px',
                marginBottom: '25px',
                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700
              }}>Add Asset</h3>
              <div style={styles.formBlock}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--primary-light)'
                }}>Name</label>
                <input 
                  type="text" 
                  style={styles.inputField} 
                  value={newAsset.name || ''} 
                  onChange={e => setNewAsset({ ...newAsset, name: e.target.value })} 
                  className="input-field"
                />
              </div>
              <div style={styles.formBlock}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--primary-light)'
                }}>Status</label>
                <select 
                  style={styles.selectBox} 
                  value={newAsset.status || 'Active'} 
                  onChange={e => setNewAsset({ ...newAsset, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Idle">Idle</option>
                </select>
              </div>
              <div style={styles.formBlock}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--primary-light)'
                }}>Location</label>
                <input 
                  type="text" 
                  style={styles.inputField} 
                  value={newAsset.location || ''} 
                  onChange={e => setNewAsset({ ...newAsset, location: e.target.value })} 
                  className="input-field"
                />
              </div>
              <div style={styles.formBlock}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: 'var(--primary-light)'
                }}>Last Service</label>
                <input 
                  type="date" 
                  style={styles.inputField} 
                  value={newAsset.lastService || ''} 
                  onChange={e => setNewAsset({ ...newAsset, lastService: e.target.value })} 
                  className="input-field"
                />
              </div>
              <div style={styles.formActions}>
                <button style={styles.saveBtn} className="save-btn" onClick={addAsset}>Add</button>
                <button style={styles.cancelBtn} onClick={() => setModalVisible(false)}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alert && (
          <motion.div 
            style={styles.systemAlert}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            {alert}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssetManager;