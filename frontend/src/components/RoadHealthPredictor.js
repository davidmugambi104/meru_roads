import { useState, useEffect } from 'react';
import { FaHeartbeat } from 'react-icons/fa';
import CyberCard from './CyberCard';

const RoadHealthPredictor = ({ roadData }) => {
  const [prediction, setPrediction] = useState(null);
  
  useEffect(() => {
    // Simulate prediction API call
    const predictHealth = async () => {
      const fakePrediction = {
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        criticalAreas: [
          { location: 'KM 12.4-12.8', issue: 'Surface cracking' },
          { location: 'KM 8.2', issue: 'Drainage blockage' }
        ]
      };
      setPrediction(fakePrediction);
    };
    
    if (roadData) predictHealth();
  }, [roadData]);

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <CyberCard className="health-predictor-card">
      <h3><FaHeartbeat /> Road Health Prediction</h3>
      {prediction ? (
        <div className="health-content">
          <div className="health-score-container">
            <div className="health-score">
              <div className="score-value">{prediction.score}%</div>
              <div className="score-label">Condition Score</div>
            </div>
            <div className="health-details">
              <div className="health-metric">
                <div className="metric-label">Next Maintenance</div>
                <div className="metric-value">{formatDate(prediction.nextMaintenance)}</div>
              </div>
              <div className="health-metric">
                <div className="metric-label">Critical Areas</div>
                <div className="metric-value">{prediction.criticalAreas.length}</div>
              </div>
            </div>
          </div>
          
          <div className="critical-areas">
            <h4>Critical Areas:</h4>
            <ul>
              {prediction.criticalAreas.map((area, i) => (
                <li key={i}>
                  <span className="location-tag">{area.location}</span>
                  <span className="issue">{area.issue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="loading-prediction">Loading prediction...</div>
      )}
    </CyberCard>
  );
};

export default RoadHealthPredictor;