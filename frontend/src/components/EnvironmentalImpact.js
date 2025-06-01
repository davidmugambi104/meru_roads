import { useState, useEffect } from 'react';
import { FaLeaf } from 'react-icons/fa';
import CyberCard from './CyberCard';

const EnvironmentalImpact = ({ roadData }) => {
  const [impactData, setImpactData] = useState(null);
  
  useEffect(() => {
    // Calculate environmental metrics
    if (roadData) {
      setImpactData({
        co2Reduction: roadData.length * 150, // tons
        treesPlanted: Math.floor(roadData.length * 100),
        wildlifeCorridors: Math.floor(roadData.length / 5)
      });
    }
  }, [roadData]);

  return (
    <CyberCard className="environmental-impact-card">
      <h3><FaLeaf /> Environmental Impact</h3>
      {impactData ? (
        <div className="impact-metrics">
          <div className="metric">
            <div className="metric-icon"> </div>
            <div className="metric-value">{impactData.co2Reduction} tons</div>
            <div className="metric-label">CO Reduction</div>
          </div>
          <div className="metric">
            <div className="metric-icon"> </div>
            <div className="metric-value">{impactData.treesPlanted}</div>
            <div className="metric-label">Trees Planted</div>
          </div>
          <div className="metric">
            <div className="metric-icon">  </div>
            <div className="metric-value">{impactData.wildlifeCorridors}</div>
            <div className="metric-label">Wildlife Crossings</div>
          </div>
        </div>
      ) : (
        <div className="loading-impact">Loading environmental data...</div>
      )}
      <div className="environmental-tips">
        <h4>Sustainability Tips:</h4>
        <ul>
          <li>Use recycled materials for road construction</li>
          <li>Implement solar-powered road lighting</li>
          <li>Plant native vegetation along roadsides</li>
        </ul>
      </div>
    </CyberCard>
  );
};
export default EnvironmentalImpact;