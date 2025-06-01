import React, { useState } from 'react';
import { FaMobileAlt } from 'react-icons/fa';

const ARVisualizer = ({ roadId, onClose }) => {
  const [arStatus, setArStatus] = useState('ready');
  
  const launchAR = async () => {
    setArStatus('loading');
    // Simulate AR launch
    setTimeout(() => {
      setArStatus('active');
    }, 1500);
  };

  return (
    <div className="ar-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3><FaMobileAlt /> Augmented Reality View</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {arStatus === 'ready' && (
          <div className="ar-instructions">
            <div className="ar-icon"> </div>
            <h4>Point your camera at the road surface</h4>
            <p>This feature allows you to visualize road data overlaid on the physical environment.</p>
            <button className="launch-ar-btn" onClick={launchAR}>
              Launch AR Experience
            </button>
          </div>
        )}
        
        {arStatus === 'loading' && (
          <div className="ar-loading">
            <div className="loader"></div>
            <p>Loading AR environment...</p>
          </div>
        )}
        
        {arStatus === 'active' && (
          <div className="ar-preview">
            <div className="ar-placeholder">
              <div className="road-overlay">
                <div className="road-line"></div>
                <div className="road-marker">KM 12.4</div>
                <div className="road-marker">KM 12.8</div>
              </div>
              <div className="ar-info">
                <div className="info-card">
                  <h5>Surface Condition</h5>
                  <p>Cracks detected: Moderate</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ar-controls">
              <button className="ar-control-btn">Measure</button>
              <button className="ar-control-btn">Annotate</button>
              <button className="ar-control-btn">Capture</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ARVisualizer;