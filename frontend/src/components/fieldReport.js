import { useState } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import CyberCard from './CyberCard';
import { fetchData } from '../services/api';


// Field reporting component
const FieldReport = ({ roadId }) => {
  const [report, setReport] = useState({
    category: 'safety',
    description: '',
    priority: 'medium',
    photos: []
  });

  const handleSubmit = async () => {
    // Submit report to API
    await fetchData(`/roads/${roadId}/reports`, {
      method: 'POST',
      body: JSON.stringify(report)
    });
    alert('Report submitted successfully!');
    setReport({ ...report, description: '', photos: [] });
  };

  return (
    <CyberCard className="field-report-card">
      <h3><FaFileAlt /> Field Report</h3>
      <div className="report-form">
        <div className="form-group">
          <label>Category</label>
          <select 
            value={report.category}
            onChange={e => setReport({...report, category: e.target.value})}
          >
            <option value="safety">Safety Concern</option>
            <option value="quality">Quality Issue</option>
            <option value="progress">Progress Update</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            placeholder="Describe the issue..."
            value={report.description}
            onChange={e => setReport({...report, description: e.target.value})}
          />
        </div>
        
        <div className="form-group">
          <label>Priority</label>
          <div className="priority-selector">
            {['low', 'medium', 'high'].map(level => (
              <button
                key={level}
                className={`priority-btn ${report.priority === level ? 'active' : ''}`}
                onClick={() => setReport({...report, priority: level})}
              >
                {level.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        
        <button className="submit-report-btn" onClick={handleSubmit}>
          Submit Report
        </button>
      </div>
    </CyberCard>
  );
};

export default FieldReport;