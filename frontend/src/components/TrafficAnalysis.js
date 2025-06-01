import { FaTrafficLight } from 'react-icons/fa';
import CyberCard from './CyberCard';
import React, { useState, useEffect } from 'react';

// Traffic analysis component
const TrafficAnalysis = ({ roadId }) => {
  const [trafficData, setTrafficData] = useState([]);
  
  // Generate mock traffic data
  useEffect(() => {
    const data = [];
    for (let i = 0; i < 7; i++) {
      data.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        volume: Math.floor(Math.random() * 5000) + 2000,
        avgSpeed: Math.floor(Math.random() * 40) + 30,
        delays: Math.floor(Math.random() * 40)
      });
    }
    setTrafficData(data.reverse());
  }, [roadId]);

  return (
    <CyberCard className="traffic-analysis-card">
      <h3><FaTrafficLight /> Traffic Impact Analysis</h3>
      <div className="traffic-stats">
        <div className="traffic-metric">
          <div className="metric-value">{trafficData[0]?.volume || '0'}</div>
          <div className="metric-label">Daily Vehicles</div>
        </div>
        <div className="traffic-metric">
          <div className="metric-value">{trafficData[0]?.avgSpeed || '0'} km/h</div>
          <div className="metric-label">Avg Speed</div>
        </div>
        <div className="traffic-metric">
          <div className="metric-value">{trafficData[0]?.delays || '0'} min</div>
          <div className="metric-label">Avg Delay</div>
        </div>
      </div>
      <div className="traffic-chart">
        <div className="chart-header">
          <span>Volume</span>
          <span>Speed</span>
          <span>Delays</span>
        </div>
        {trafficData.map((data, index) => (
          <div key={index} className="chart-row">
            <div className="chart-bar-container">
              <div 
                className="chart-bar volume" 
                style={{ width: `${(data.volume / 7000) * 100}%` }}
              >
                {data.volume}
              </div>
            </div>
            <div className="chart-bar-container">
              <div 
                className="chart-bar speed" 
                style={{ width: `${(data.avgSpeed / 70) * 100}%` }}
              >
                {data.avgSpeed}km/h
              </div>
            </div>
            <div className="chart-bar-container">
              <div 
                className="chart-bar delays" 
                style={{ width: `${(data.delays / 40) * 100}%` }}
              >
                {data.delays}min
              </div>
            </div>
            <div className="chart-date">{data.date}</div>
          </div>
        ))}
      </div>
    </CyberCard>
  );
};
export default TrafficAnalysis;
