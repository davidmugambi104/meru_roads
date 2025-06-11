// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import './portal.css'; // Import the CSS for styling

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Portal= () => {
  const [activeTab, setActiveTab] = useState('reporting');
  const [formData, setFormData] = useState({
    issueType: '',
    location: '',
    description: '',
    photo: null
  });
  const [reports, setReports] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventDetails, setEventDetails] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);

  // Construction events data
  const constructionEvents = [
    { id: 1, date: new Date(2023, 5, 5), title: 'Downtown Roadwork Start', description: 'Road construction begins on Main St between 1st and 5th Ave', impact: 'Traffic delays expected' },
    { id: 2, date: new Date(2023, 5, 12), title: 'Park Renovation', description: 'Central Park playground equipment installation', impact: 'Partial park closure' },
    { id: 3, date: new Date(2023, 5, 18), title: 'Community Meeting', description: 'Public consultation on Westside development project', impact: 'Opportunity for feedback' },
    { id: 4, date: new Date(2023, 5, 22), title: 'Bridge Inspection', description: 'Annual safety inspection of City Bridge', impact: 'Lane closures during off-peak hours' },
    { id: 5, date: new Date(2023, 5, 28), title: 'Water System Upgrade', description: 'Start of water main replacement on Oak St', impact: 'Temporary water service interruptions' },
    { id: 6, date: new Date(2023, 6, 3), title: 'New Bike Lanes', description: 'Installation of protected bike lanes on Elm Ave', impact: 'Improved cyclist safety' },
    { id: 7, date: new Date(2023, 6, 15), title: 'Library Expansion', description: 'Groundbreaking ceremony for library expansion project', impact: 'Enhanced community resources' }
  ];

  // Impact data for charts
  const impactData = {
    labels: ['Traffic Impact', 'Noise Levels', 'Economic Benefit', 'Environmental', 'Safety'],
    datasets: [{
      label: 'Project Impact Metrics',
      data: [7, 8, 9, 6, 8],
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }]
  };

  const timelineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [{
      label: 'Project Progress (%)',
      data: [10, 20, 35, 45, 60, 75, 85, 90, 95],
      fill: false,
      borderColor: 'rgb(16, 185, 129)',
      tension: 0.3,
      pointBackgroundColor: 'rgb(16, 185, 129)',
      pointRadius: 6
    }]
  };

  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        title: {
          display: true,
          text: 'Impact Level (1-10)'
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Completion Percentage'
        }
      }
    }
  };

  // Calendar functions
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setFormData({ ...formData, photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReport = {
      id: Date.now(),
      ...formData,
      timestamp: new Date().toLocaleString()
    };
    setReports([newReport, ...reports]);
    setSubmitted(true);
    setFormData({
      issueType: '',
      location: '',
      description: '',
      photo: null
    });
    
    // Reset submission status after 3 seconds
    setTimeout(() => setSubmitted(false), 3000);
  };

  // Close event details when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (eventDetails && !e.target.closest('.event-details') && !e.target.closest('.event')) {
        setEventDetails(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [eventDetails]);

  // Calendar generation
  const renderCalendar = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const today = new Date();
    
    // Create day headers
    const dayHeaders = days.map(day => (
      <div key={day} className="calendar-header">
        {day}
      </div>
    ));
    
    // Create empty cells for days before the first day
    const emptyCells = Array(firstDay).fill(null).map((_, i) => (
      <div key={`empty-${i}`} className="calendar-day empty"></div>
    ));
    
    // Create day cells
    const dayCells = Array(daysInMonth).fill(null).map((_, i) => {
      const day = i + 1;
      const thisDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      // Check if today
      const isToday = 
        day === today.getDate() && 
        currentDate.getMonth() === today.getMonth() && 
        currentDate.getFullYear() === today.getFullYear();
      
      // Get events for this day
      const eventsForDay = constructionEvents.filter(event => 
        event.date.getDate() === day && 
        event.date.getMonth() === currentDate.getMonth() && 
        event.date.getFullYear() === currentDate.getFullYear()
      );
      
      return (
        <div 
          key={`day-${day}`} 
          className={`calendar-day ${isToday ? 'today' : ''}`}
        >
          <div className="calendar-day-number">{day}</div>
          {eventsForDay.map(event => (
            <div 
              key={event.id} 
              className="event"
              onClick={() => setEventDetails(event)}
            >
              <i className="fas fa-hard-hat"></i> {event.title}
            </div>
          ))}
        </div>
      );
    });
    
    return (
      <div className="calendar-grid">
        {dayHeaders}
        {emptyCells}
        {dayCells}
      </div>
    );
  };

  return (
    <div className="app">
      <header className="header1">
        <div className="container1">
          <div className="header-content1">
            <div className="logo1">
              <i className="fas fa-city"></i>
              <div>
                <h1>Community<span>Connect</span></h1>
                <p>Public Engagement Portal</p>
              </div>
            </div>
            <nav className="tabs1">
              <button 
                className={`tab1 ${activeTab === 'reporting' ? 'active' : ''}`}
                onClick={() => setActiveTab('reporting')}
              >
                <i className="fas fa-flag"></i> Reporting
              </button>
              <button 
                className={`tab1 ${activeTab === 'impact' ? 'active' : ''}`}
                onClick={() => setActiveTab('impact')}
              >
                <i className="fas fa-chart-bar"></i> Impact
              </button>
              <button 
                className={`tab1 ${activeTab === 'calendar' ? 'active' : ''}`}
                onClick={() => setActiveTab('calendar')}
              >
                <i className="fas fa-calendar-alt"></i> Calendar
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="main-content1">
        <div className="container1">
          {activeTab === 'reporting' && (
            <div className="tab-content1">
              <div className="feature-card1">
                <div className="card-header1">
                  <i className="fas fa-flag"></i>
                  <h3>Citizen Reporting Portal</h3>
                </div>
                <div className="card-body1">
                  <p>Report issues, concerns, or suggestions regarding city projects and infrastructure.</p>
                  
                  <div className="reporting-container">
                    <form 
                      ref={formRef}
                      className="report-form"
                      onSubmit={handleSubmit}
                    >
                      <div className="form-group1">
                        <label htmlFor="issueType">Issue Type *</label>
                        <select 
                          id="issueType" 
                          name="issueType"
                          value={formData.issueType}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select an issue type</option>
                          <option value="construction">Construction Concern</option>
                          <option value="safety">Safety Hazard</option>
                          <option value="environment">Environmental Issue</option>
                          <option value="accessibility">Accessibility Problem</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="location">Location *</label>
                        <input 
                          type="text" 
                          id="location" 
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="Enter address or landmark" 
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea 
                          id="description" 
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Please describe the issue in detail..." 
                          required
                        ></textarea>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="photo">Upload Photo (Optional)</label>
                        <div className="file-upload">
                          <input 
                            type="file" 
                            id="photo" 
                            name="photo"
                            onChange={handleChange}
                            accept="image/*"
                          />
                          <label htmlFor="photo" className="file-label">
                            <i className="fas fa-cloud-upload-alt"></i> 
                            {formData.photo ? formData.photo.name : 'Choose a file'}
                          </label>
                        </div>
                      </div>
                      
                      <button type="submit" className="btn">
                        Submit Report
                      </button>
                      
                      {submitted && (
                        <div className="success-message">
                          <i className="fas fa-check-circle"></i>
                          Thank you for your report! Your concern has been submitted to city officials.
                        </div>
                      )}
                    </form>
                    
                    <div className="reports-list">
                      <h4>Recent Reports</h4>
                      {reports.length === 0 ? (
                        <div className="empty-reports">
                          <i className="fas fa-inbox"></i>
                          <p>No reports submitted yet</p>
                        </div>
                      ) : (
                        <div className="report-items">
                          {reports.map(report => (
                            <div key={report.id} className="report-item">
                              <div className="report-header">
                                <span className={`report-type ${report.issueType}`}>
                                  {report.issueType}
                                </span>
                                <span className="report-time">{report.timestamp}</span>
                              </div>
                              <h5>{report.location}</h5>
                              <p>{report.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'impact' && (
            <div className="tab-content">
              <div className="feature-card">
                <div className="card-header">
                  <i className="fas fa-chart-bar"></i>
                  <h3>Project Impact Visualizations</h3>
                </div>
                <div className="card-body">
                  <div className="chart-container">
                    <h4>Current Project Impact Metrics</h4>
                    <div className="chart-wrapper">
                      <Bar data={impactData} options={barOptions} />
                    </div>
                  </div>
                  
                  <div className="chart-container">
                    <h4>Downtown Revitalization Progress</h4>
                    <div className="chart-wrapper">
                      <Line data={timelineData} options={lineOptions} />
                    </div>
                  </div>
                  
                  <div className="project-impact">
                    <h4>Project Impact Summary</h4>
                    <div className="impact-grid">
                      <div className="impact-card">
                        <div className="impact-icon traffic">
                          <i className="fas fa-traffic-light"></i>
                        </div>
                        <h5>Traffic Impact</h5>
                        <p>Moderate delays expected during peak hours. Alternative routes suggested.</p>
                      </div>
                      <div className="impact-card">
                        <div className="impact-icon noise">
                          <i className="fas fa-volume-up"></i>
                        </div>
                        <h5>Noise Levels</h5>
                        <p>Increased noise during construction hours (7am-6pm).</p>
                      </div>
                      <div className="impact-card">
                        <div className="impact-icon economy">
                          <i className="fas fa-chart-line"></i>
                        </div>
                        <h5>Economic Benefit</h5>
                        <p>Project expected to create 250 jobs and boost local businesses.</p>
                      </div>
                      <div className="impact-card">
                        <div className="impact-icon environment">
                          <i className="fas fa-leaf"></i>
                        </div>
                        <h5>Environmental Impact</h5>
                        <p>Green spaces increased by 15%. Sustainable materials used.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'calendar' && (
            <div className="tab-content">
              <div className="feature-card">
                <div className="card-header">
                  <i className="fas fa-calendar-alt"></i>
                  <h3>Construction Timeline Calendar</h3>
                </div>
                <div className="card-body">
                  <div className="calendar-controls">
                    <button onClick={prevMonth} className="btn calendar-nav">
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <h3 className="current-month">
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={nextMonth} className="btn calendar-nav">
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                  
                  <div className="calendar-container">
                    {renderCalendar()}
                  </div>
                  
                  <div className="upcoming-events">
                    <h4>Upcoming Construction Events</h4>
                    <div className="events-list">
                      {constructionEvents
                        .filter(event => event.date >= new Date())
                        .sort((a, b) => a.date - b.date)
                        .slice(0, 3)
                        .map(event => (
                          <div key={event.id} className="event-card">
                            <div className="event-date">
                              {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="event-details">
                              <h5>{event.title}</h5>
                              <p>{event.description}</p>
                              <div className="event-impact">
                                <i className="fas fa-exclamation-circle"></i> {event.impact}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {eventDetails && (
        <div className="event-modal">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setEventDetails(null)}>
              <i className="fas fa-times"></i>
            </button>
            <h3>{eventDetails.title}</h3>
            <div className="event-date">
              <i className="fas fa-calendar-day"></i> 
              {eventDetails.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="event-description">
              <p>{eventDetails.description}</p>
            </div>
            <div className="event-impact">
              <h4>Community Impact:</h4>
              <p>{eventDetails.impact}</p>
            </div>
            <div className="event-actions">
              <button className="btn">
                <i className="fas fa-calendar-plus"></i> Add to Calendar
              </button>
              <button className="btn">
                <i className="fas fa-share-alt"></i> Share Event
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>About CommunityConnect</h3>
              <p>Our platform bridges the gap between citizens and municipal projects, fostering transparency and collaboration in urban development.</p>
            </div>
            
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li><a href="#"><i className="fas fa-chevron-right"></i> Current Projects</a></li>
                <li><a href="#"><i className="fas fa-chevron-right"></i> Public Meetings</a></li>
                <li><a href="#"><i className="fas fa-chevron-right"></i> Submit Feedback</a></li>
                <li><a href="#"><i className="fas fa-chevron-right"></i> Resource Library</a></li>
                <li><a href="#"><i className="fas fa-chevron-right"></i> FAQ</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Contact Us</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>123 Civic Center, City Hall, Metropolis</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <span>(555) 123-4567</span>
                </div>
                <div className="contact-item">
                  <i className="fas fa-envelope"></i>
                  <span>engage@communityconnect.gov</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="copyright">
            <p>&copy; 2023 CommunityConnect. All rights reserved. | Designed for public engagement and transparency</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Portal;