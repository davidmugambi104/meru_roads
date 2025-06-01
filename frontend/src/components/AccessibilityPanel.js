import React, { useState } from 'react';
import { FaUniversalAccess } from 'react-icons/fa';

const AccessibilityPanel = ({ show, onClose }) => {
  const [settings, setSettings] = useState({
    highContrast: false,
    textSize: 'medium',
    voiceNavigation: false
  });

  if (!show) return null;

  return (
    <div className="accessibility-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3><FaUniversalAccess /> Accessibility Settings</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="settings-grid">
          <div className="setting">
            <label>High Contrast Mode</label>
            <div className="switch">
              <input 
                type="checkbox" 
                checked={settings.highContrast}
                onChange={e => setSettings({...settings, highContrast: e.target.checked})}
                id="highContrast"
              />
              <label htmlFor="highContrast"></label>
            </div>
          </div>
          <div className="setting">
            <label>Text Size</label>
            <div className="size-selector">
              {['small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  className={settings.textSize === size ? 'active' : ''}
                  onClick={() => setSettings({...settings, textSize: size})}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="setting">
            <label>Voice Navigation</label>
            <div className="switch">
              <input 
                type="checkbox" 
                checked={settings.voiceNavigation}
                onChange={e => setSettings({...settings, voiceNavigation: e.target.checked})}
                id="voiceNav"
              />
              <label htmlFor="voiceNav"></label>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="apply-btn" onClick={onClose}>Apply Settings</button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;