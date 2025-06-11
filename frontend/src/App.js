import React, { useState, useEffect, useRef } from 'react';
import Map from 'react-map-gl/mapbox';
import { NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import * as THREE from 'three';
import mapboxgl from 'mapbox-gl';
import { gsap } from 'gsap';
import './App.css';
import { 
  FaRoad, FaChartLine, FaCamera, FaSearch, FaSign, FaInfoCircle, 
  FaChevronDown, FaChevronUp, FaUsers, FaTruck, 
  FaTrafficLight, FaFileAlt, FaHeartbeat, FaMobileAlt,
  FaUniversalAccess, FaLeaf
} from 'react-icons/fa';
import { 
  BiCalendarCheck, BiMoney, BiBuildings, BiMap 
} from 'react-icons/bi';
import AssetManager from './components/equipmentTracker';
import UserManagement from './components/usermanagement';
import TrafficAnalysis from './components/TrafficAnalysis';
import FieldReport from './components/fieldReport';
import Portal from './components/portal';
import RoadHealthPredictor from './components/RoadHealthPredictor';
import {AccessibilityProvider, AccessibilityIcon} from './components/AccessibilityPanel'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Mapbox token setup
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

// API Configuration
const API_BASE = 'https://meru-road-backend.onrender.com/api';

// Helper function for API calls
const fetchData = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      ...options
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// API endpoints
const api = {
  // Road endpoints
  getRoads: (search = '', sort = 'name') => 
    fetchData(`/roads?search=${search}&sort=${sort}`),
  
  getRoad: (id) => 
    fetchData(`/roads/${id}`),
  
  updateProgress: (id, progress) => 
    fetchData(`/roads/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress })
    }),
  
  createRoad: (roadData) => 
    fetchData('/roads', {
      method: 'POST',
      body: JSON.stringify(roadData)
    }),
  
  // Stats endpoint
  getStats: () => 
    fetchData('/stats'),
  
  // User endpoints
  getCurrentUser: () => 
    fetchData('/user'),
  
  getNotifications: () => 
    fetchData('/notifications'),
  
  // Photo endpoints
  getPhotos: (roadId = null) => 
    fetchData(`/photos${roadId ? `?road_id=${roadId}` : ''}`),
  
  addPhoto: (roadId, url, caption) => 
    fetchData(`/roads/${roadId}/photos`, {
      method: 'POST',
      body: JSON.stringify({ url, caption })
    }),
  
  // Map data
  getMapRoads: () => 
    fetchData('/map/roads'),
  
  // Milestones
  getMilestones: (roadId) => 
    fetchData(`/roads/${roadId}/milestones`)
};

const App = () => {
  const [selectedRoad, setSelectedRoad] = useState('maua');
  const [searchQuery, setSearchQuery] = useState('');
  const [roadData, setRoadData] = useState(null);
  const [user, setUser] = useState({ name: 'Admin User', role: 'County Engineer' });
  const [notifications, setNotifications] = useState(0);
  const [time, setTime] = useState(new Date());
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/satellite-streets-v12");
  const [roads, setRoads] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllRoads, setShowAllRoads] = useState(false);
  const mapRef = useRef(null);
  const canvasRef = useRef(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showAddRoadForm, setShowAddRoadForm] = useState(false);
  const [newRoad, setNewRoad] = useState({
    name: '',
    length: '',
    budget: '',
    status: 'planned',
    contractor: '',
    startDate: '',
    endDate: '',
    progress: 0,
    milestones: ['Planning', 'Land Prep', 'Foundation', 'Paving', 'Finishing'],
    completedMilestones: 0,
    description: '',
    coordinates: []
  });
  const [tempCoord, setTempCoord] = useState([null, null]);
  
  // Fetch roads data from API
  useEffect(() => {
    const fetchRoads = async () => {
      try {
        setLoading(true);
        const data = await api.getRoads(searchQuery);
        setRoads(data);
        
        // Set initial road data
        if (data.length > 0 && !roadData) {
          const initialRoad = data.find(r => r.id === selectedRoad) || data[0];
          setRoadData(initialRoad);
          setSelectedRoad(initialRoad.id);
        }
      } catch (error) {
        console.error('Failed to fetch roads:', error);
        alert('Failed to load road data. Using fallback information');
      } finally {
        setLoading(false);
      }
    };

    fetchRoads();
  }, [searchQuery]);

  // Fetch stats data from API
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const statsData = await api.getStats();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStatsData();
  }, []);

  // Fetch photos data from API
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const photosData = await api.getPhotos(selectedRoad);
        setPhotos(photosData);
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      }
    };

    if (selectedRoad) fetchPhotos();
  }, [selectedRoad]);

  // Fetch user data from API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationsData = await api.getNotifications();
        setNotifications(notificationsData.count);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  // Initialize 3D background - ORIGINAL CODE PRESERVED
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Set up Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Create grid
    const gridHelper = new THREE.GridHelper(100, 50, 0x00f3ff, 0x00aaff);
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    // Add glowing particles
    const particles = [];
    for (let i = 0; i < 100; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const particleMaterial = new THREE.MeshBasicMaterial({ 
        color: i % 3 === 0 ? 0x00f3ff : i % 3 === 1 ? 0xb967ff : 0xff2a6d,
        transparent: true,
        opacity: 0.5
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      particle.position.x = (Math.random() - 0.5) * 100;
      particle.position.y = (Math.random() - 0.5) * 100;
      particle.position.z = (Math.random() - 0.5) * 100;
      
      particles.push({
        mesh: particle,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05
        )
      });
      
      scene.add(particle);
    }
    
    camera.position.z = 30;
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      particles.forEach(particle => {
        particle.mesh.position.add(particle.velocity);
        
        // Boundary check
        if (Math.abs(particle.mesh.position.x) > 50) particle.velocity.x *= -1;
        if (Math.abs(particle.mesh.position.y) > 50) particle.velocity.y *= -1;
        if (Math.abs(particle.mesh.position.z) > 50) particle.velocity.z *= -1;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);
  
  // Update time - ORIGINAL CODE PRESERVED
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Initialize selected road data
  useEffect(() => {
    if (roads.length === 0) return;
    
    const fetchRoadDetails = async () => {
      try {
        const road = await api.getRoad(selectedRoad);
        setRoadData(road);
        
        // Animate stats
        gsap.from('.stat-value', {
          duration: 1.5,
          innerText: 0,
          snap: { innerText: 1 },
          stagger: 0.2,
          ease: "power2.out"
        });
      } catch (error) {
        console.error('Failed to fetch road details:', error);
        const fallbackRoad = roads.find(r => r.id === selectedRoad);
        if (fallbackRoad) setRoadData(fallbackRoad);
      }
    };
    
    fetchRoadDetails();
  }, [selectedRoad, roads]);
  
  // Handle road selection
  const handleRoadSelect = (roadId) => {
    setSelectedRoad(roadId);
    
    // Fly to location on map
    if (mapRef.current) {
      const road = roads.find(r => r.id === roadId);
      if (road && road.coordinates && road.coordinates.length > 0) {
        const center = calculateCenter(road.coordinates);
        mapRef.current.flyTo({ center, zoom: 12 });
      }
    }
  };

  // Add coordinate helpers
  const handleAddCoordinate = () => {
    if (tempCoord[0] !== null && tempCoord[1] !== null) {
      setNewRoad({
        ...newRoad,
        coordinates: [...newRoad.coordinates, [parseFloat(tempCoord[0]), parseFloat(tempCoord[1])]]
      });
      setTempCoord([null, null]);
    }
  };

  const handleRemoveCoordinate = (index) => {
    const newCoords = [...newRoad.coordinates];
    newCoords.splice(index, 1);
    setNewRoad({...newRoad, coordinates: newCoords});
  };

  // Handle new road submission
  const handleAddRoadSubmit = async (e) => {
    e.preventDefault();
    
    // Validate coordinates
    if (newRoad.coordinates.length < 2) {
      alert("Please add at least two coordinate points");
      return;
    }

    try {
      // Prepare road data
      const roadData = {
        name: newRoad.name,
        length: parseFloat(newRoad.length),
        budget: parseFloat(newRoad.budget),
        status: newRoad.status,
        contractor: newRoad.contractor,
        startDate: newRoad.startDate,
        endDate: newRoad.endDate,
        progress: newRoad.progress,
        milestones: newRoad.milestones,
        completedMilestones: newRoad.completedMilestones,
        description: newRoad.description,
        coordinates: newRoad.coordinates
      };

      // Send to backend
      const createdRoad = await api.createRoad(roadData);
      
      // Reset form
      setNewRoad({
        name: '',
        length: '',
        budget: '',
        status: 'planned',
        contractor: '',
        startDate: '',
        endDate: '',
        progress: 0,
        milestones: ['Planning', 'Land Prep', 'Foundation', 'Paving', 'Finishing'],
        completedMilestones: 0,
        description: '',
        coordinates: []
      });
      
      setShowAddRoadForm(false);
      setRoads(prev => [...prev, createdRoad]);
      alert('Road project created successfully!');
    } catch (error) {
      console.error('Error creating road:', error);
      alert(`Error: ${error.message}`);
    }
  };
  
  // Calculate center of coordinates
  const calculateCenter = (coordinates) => {
    if (coordinates.length === 0) return [37.65, 0.05];
    
    let sumLng = 0;
    let sumLat = 0;
    
    for (const [lng, lat] of coordinates) {
      sumLng += lng;
      sumLat += lat;
    }
    
    return [sumLng / coordinates.length, sumLat / coordinates.length];
  };
  
  // Handle map load
  const handleMapLoad = async (e) => {
    mapRef.current = e.target;

    try {
      // Add Meru boundary if available
      const boundaryData = await fetchData('/map/meru-boundary');
      if (boundaryData) {
        e.target.addSource('meru-boundary', {
          'type': 'geojson',
          'data': boundaryData
        });

        e.target.addLayer({
          'id': 'meru-boundary-fill',
          'type': 'fill',
          'source': 'meru-boundary',
          'paint': {
            'fill-color': '#0080ff',
            'fill-opacity': 0.05
          }
        });

        e.target.addLayer({
          'id': 'meru-boundary-line',
          'type': 'line',
          'source': 'meru-boundary',
          'paint': {
            'line-color': '#0066cc',
            'line-width': 2,
            'line-opacity': 0.7
          }
        });
      }
    } catch (error) {
      console.log('Boundary data not available');
    }
    
    // Add 3D terrain
    e.target.addSource('mapbox-dem', {
      'type': 'raster-dem',
      'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
      'tileSize': 512,
      'maxzoom': 14
    });
    
    e.target.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
    
    // Add road data from API
    try {
      const mapRoads = await api.getMapRoads();
      
      e.target.addSource('roads', {
        'type': 'geojson',
        'data': mapRoads
      });
      
      // Add road layer
      e.target.addLayer({
        'id': 'roads-layer',
        'type': 'line',
        'source': 'roads',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': [
            'match',
            ['get', 'status'],
            'ongoing', '#00f3ff',
            'completed', '#00ff64',
            'planned', '#b967ff',
            '#ccc'
          ],
          'line-width': 5,
          'line-opacity': 0.8,
          'line-blur': 0.5
        }
      });
      
      // Add glow effect
      e.target.addLayer({
        'id': 'roads-glow',
        'type': 'line',
        'source': 'roads',
        'paint': {
          'line-color': [
            'match',
            ['get', 'status'],
            'ongoing', '#00f3ff',
            'completed', '#00ff64',
            'planned', '#b967ff',
            '#ccc'
          ],
          'line-width': 15,
          'line-opacity': 0.1,
          'line-blur': 1
        }
      });
    } catch (error) {
      console.error('Failed to add roads to map:', error);
    }
    
    // Fly to selected road
    handleRoadSelect(selectedRoad);
  };
  
  // Handle progress update
  const handleUpdateProgress = async () => {
    if (!roadData) return;
    
    const newProgress = prompt('Enter new progress (0-100):', roadData.progress);
    if (newProgress === null) return;
    
    const progressValue = parseInt(newProgress);
    if (isNaN(progressValue)) return;
    
    try {
      await api.updateProgress(roadData.id, progressValue);
      
      // Update local state
      setRoads(prevRoads => 
        prevRoads.map(road => 
          road.id === roadData.id ? { ...road, progress: progressValue } : road
        )
      );
      
      setRoadData({...roadData, progress: progressValue});
      
      // Animate the progress bar
      gsap.to('.timeline-progress', {
        width: `${progressValue}%`,
        duration: 1,
        ease: "power2.out"
      });
      
      alert('Progress updated successfully!');
    } catch (error) {
      console.error('Failed to update progress:', error);
      alert('Failed to update progress');
    }
  };
  
  // Handle photo upload
  const handleUploadPhoto = async () => {
    if (!roadData) return;
    
    const url = prompt('Enter photo URL:');
    if (!url) return;
    
    const caption = prompt('Enter photo caption:', 'Progress photo');
    
    try {
      const newPhoto = await api.addPhoto(roadData.id, url, caption);
      setPhotos([...photos, newPhoto]);
      alert('Photo uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload photo:', error);
      alert('Failed to upload photo');
    }
  };
  
  // Filter roads based on search query
  const filteredRoads = roads.filter(road => 
    road.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter photos for selected road
  const roadPhotos = photos.filter(photo => photo.road === selectedRoad);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status class
  const getStatusClass = (status) => {
    switch(status) {
      case 'ongoing': return 'status-ongoing';
      case 'completed': return 'status-completed';
      case 'planned': return 'status-planned';
      default: return '';
    }
  };
  
  // Toggle visibility of all roads
  const toggleShowAllRoads = () => {
    setShowAllRoads(!showAllRoads);
  };

  // Get roads to display (first 4 or all)
  const getDisplayRoads = () => {
    return showAllRoads ? filteredRoads : filteredRoads.slice(0, 4);
  };

  return (
    <div className="app">
      {/* 3D Background Canvas */}
      {/* <canvas ref={canvasRef} className="bg-canvas"></canvas> */}
      
      {/* CRT Overlay */}
      <div className="crt-overlay"></div>
      
      {/* Header */}
      <header>
        <div className="logo">
          <div className="logo-icon">
            <BiMap />
          </div>
          <h1 className="glitch" data-text="MERU ROADWORKS">MERU ROADWORKS</h1>
        </div>
        
        <div className="header-controls">
          <div className="search-container">
            <input 
              type="text" 
              className="search-box" 
              placeholder="Search roads..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="search-btn">
              <FaSearch /> Search
            </button>
          </div>
          <AccessibilityIcon
            size={32}
            hoverColor="#E53E3E"
            onClick={() => setSettingsOpen(true)}
          />
          
          <div className="user-info">
            <div className="notification-badge">
              <span>{notifications}</span>
            </div>
            <div className="user-avatar">
              <div className="avatar-initials">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Dashboard Container */}
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar">
          <CyberCard>
            <div className="card-header">
              <h2><FaRoad /> Road Projects</h2>
              <span className="road-status status-ongoing">Active</span>
            </div>
            <div className="card-header">
                <button 
                  className="add-road-btn"
                  onClick={() => setShowAddRoadForm(true)}
                >
                  + Add Road
                </button>
             </div>
            <div className="road-list">
              {loading ? (
                <div className="loading">Loading roads...</div>
              ) : filteredRoads.length > 0 ? (
                <>
                  {getDisplayRoads().map(road => (
                    <div 
                      key={road.id}
                      className={`road-item ${selectedRoad === road.id ? 'selected' : ''}`}
                      onClick={() => handleRoadSelect(road.id)}
                    >
                      <h3><FaSign /> {road.name}</h3>
                      <div className="road-meta">
                        <span>Length: {road.length}km</span>
                        <span>Budget: {formatCurrency(road.budget)}</span>
                      </div>
                      <span className={`road-status ${getStatusClass(road.status)}`}>
                        {road.status.charAt(0).toUpperCase() + road.status.slice(1)}
                      </span>
                    </div>
                  ))}
                  
                  {filteredRoads.length > 4 && (
                    <div className="see-more-container">
                      <button className="see-more-btn" onClick={toggleShowAllRoads}>
                        {showAllRoads ? (
                          <>
                            <FaChevronUp /> Show Less
                          </>
                        ) : (
                          <>
                            <FaChevronDown /> See More ({filteredRoads.length - 4})
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-results">No roads found</div>
              )}
            </div>
          </CyberCard>
          
          <CyberCard>
            <div className="card-header">
              <h2><FaChartLine /> Road Stats</h2>
            </div>
            {stats ? (
              <>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-value">{stats.total_Roads}</div>
                    <div className="stat-label">Total Roads</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{stats.completed}</div>
                    <div className="stat-label">Completed</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{stats.inProgress}</div>
                    <div className="stat-label">In Progress</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{stats.planned}</div>
                    <div className="stat-label">Planned</div>
                  </div>
                </div>
                
                <div className="budget-stats">
                  <div className="budget-item">
                    <div className="budget-label">Allocated</div>
                    <div className="budget-value">{formatCurrency(stats.budgetAllocated)}</div>
                    <div className="budget-bar">
                      <div className="budget-progress" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div className="budget-item">
                    <div className="budget-label">Spent</div>
                    <div className="budget-value">{formatCurrency(stats.budgetSpent)}</div>
                    <div className="budget-bar">
                      <div 
                        className="budget-progress spent" 
                        style={{ width: `${(stats.budgetSpent / stats.budgetAllocated) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="loading">Loading stats...</div>
            )}
          </CyberCard>
          
          <CyberCard>
            <div className="card-header">
              <h2><FaCamera /> Recent Photos</h2>
            </div>
            <div className="photo-gallery">
              {roadPhotos.length > 0 ? (    
                roadPhotos.slice(0, 6).map(photo => (
                  <div key={photo.id} className="photo-item">
                    <img src={photo.url} alt={`Road construction ${photo.id}`} />
                    <div className="photo-overlay">
                      <div className="photo-title">{photo.caption || 'Progress Photo'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-photos">No photos available</div>
              )}
            </div>
          </CyberCard>
        </div>
        
        {/* Main Content */}
        <div className="main-content">
          <CyberCard className="map-container">
            <Map
              initialViewState={{
                longitude: 37.65,
                latitude: 0.05,
                zoom: 10,
                pitch: 45,
                bearing: -17.6
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle={mapStyle}
              onLoad={handleMapLoad}
            >
              <NavigationControl position="top-right" />
              <FullscreenControl position="top-right" />
            </Map>
            
            <div className="map-overlay">
              <h3><FaInfoCircle /> Map Controls</h3>
              <p>Click on road markers to view details and photos.</p>
              <p>Use scroll to zoom, drag to pan.</p>
              
              <div className="map-stats">
                <div className="map-stat">
                  <div className="map-stat-value">{filteredRoads.length}</div>
                  <div className="map-stat-label">Projects</div>
                </div>
                <div className="map-stat">
                  <div className="map-stat-value">{roadPhotos.length}</div>
                  <div className="map-stat-label">Photos</div>
                </div>
              </div>
              
              <div className="map-style-controls">
                <button 
                  className={`map-style-btn ${mapStyle.includes('dark') ? 'active' : ''}`}
                  onClick={() => setMapStyle('mapbox://styles/mapbox/dark-v11')}
                >
                  Dark
                </button>
                <button 
                  className={`map-style-btn ${mapStyle.includes('satellite') ? 'active' : ''}`}
                  onClick={() => setMapStyle('mapbox://styles/mapbox/satellite-streets-v12')}
                >
                  Satellite
                </button>
              </div>
            </div>
          </CyberCard>
          
          {roadData && (
            <CyberCard className="road-details">
              <div className="card-header">
                <h2>{roadData.name} Project</h2>
                <span className={`road-status ${getStatusClass(roadData.status)}`}>
                  {roadData.status.charAt(0).toUpperCase() + roadData.status.slice(1)}
                </span>
              </div>
              
              <div className="road-info">
                <div className="info-item">
                  <div className="info-label"><BiBuildings /> Contractor</div>
                  <div className="info-value">{roadData.contractor}</div>
                </div>
                <div className="info-item">
                  <div className="info-label"><FaRoad /> Length</div>
                  <div className="info-value">{roadData.length} km</div>
                </div>
                <div className="info-item">
                  <div className="info-label"><BiMoney /> Budget</div>
                  <div className="info-value">{formatCurrency(roadData.budget)}</div>
                </div>
                <div className="info-item">
                  <div className="info-label"><BiCalendarCheck /> Start Date</div>
                  <div className="info-value">{formatDate(roadData.startDate)}</div>
                </div>
                <div className="info-item">
                  <div className="info-label"><BiCalendarCheck /> Est. Completion</div>
                  <div className="info-value">{formatDate(roadData.endDate)}</div>
                </div>
                <div className="info-item">
                  <div className="info-label"><FaChartLine /> Progress</div>
                  <div className="info-value">{roadData.progress}%</div>
                </div>
              </div>
              
              <div className="timeline-container">
                <h3>Project Timeline</h3>
                <div className="timeline-bar">
                  <div 
                    className="timeline-progress" 
                    style={{ width: `${roadData.progress}%` }}
                  ></div>
                  <div className="timeline-milestones">
                    {roadData.milestones.map((milestone, index) => (
                      <div 
                        key={index} 
                        className={`milestone ${index < roadData.completedMilestones ? 'active' : ''}`}
                      >
                        <div className="milestone-label">{milestone}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="gov-message">
                <h4><FaInfoCircle /> Project Description</h4>
                <p>{roadData.description}</p>
              </div>
              
              <div className="action-buttons">
                <button className="action-btn" onClick={handleUploadPhoto}>
                  <FaCamera /> Upload Photo
                </button>
                <button className="action-btn" onClick={handleUpdateProgress}>
                  <FaChartLine /> Update Progress
                </button>
                <button className="action-btn">
                  <FaInfoCircle /> Report Issue
                </button>
              </div>
            </CyberCard>
          )}
        </div>
      </div>
      <AssetManager/>
      <UserManagement/>
      <Portal/>
      {/* <RoadHealthPredictor/>
      <TrafficAnalysis/> */}
      <FieldReport/>

  
      {/* Footer */}
      <footer>
        <p>Meru County Roadworks Dashboard &copy; {new Date().getFullYear()} | Developed for the People of Meru County</p>
        <p>
          {time.toLocaleDateString()} | {time.toLocaleTimeString()} | 
          <span> Data updated: {new Date().toLocaleDateString()}</span>
        </p>
      </footer>
      
      {/* Add Road Modal */}
      {showAddRoadForm && (
        <div className="form-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Road Project</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAddRoadForm(false)}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddRoadSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Road Name</label>
                  <input
                    type="text"
                    value={newRoad.name}
                    onChange={(e) => setNewRoad({...newRoad, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Length (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRoad.length}
                    onChange={(e) => setNewRoad({...newRoad, length: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Budget (KES)</label>
                  <input
                    type="number"
                    value={newRoad.budget}
                    onChange={(e) => setNewRoad({...newRoad, budget: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newRoad.status}
                    onChange={(e) => setNewRoad({...newRoad, status: e.target.value})}
                    required
                  >
                    <option value="planned">Planned</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Contractor</label>
                  <input
                    type="text"
                    value={newRoad.contractor}
                    onChange={(e) => setNewRoad({...newRoad, contractor: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newRoad.startDate}
                    onChange={e => setNewRoad({...newRoad, startDate: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newRoad.endDate}
                    onChange={e => setNewRoad({...newRoad, endDate: e.target.value})}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={newRoad.description}
                    onChange={(e) => setNewRoad({...newRoad, description: e.target.value})}
                    required
                    rows={3}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Coordinates (Add points in order)</label>
                  <div className="coordinates-input">
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Longitude"
                      value={tempCoord[0] || ''}
                      onChange={(e) => setTempCoord([e.target.value, tempCoord[1]])}
                    />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Latitude"
                      value={tempCoord[1] || ''}
                      onChange={(e) => setTempCoord([tempCoord[0], e.target.value])}
                    />
                    <button 
                      type="button"
                      className="add-coord-btn"
                      onClick={handleAddCoordinate}
                    >
                      Add Point
                    </button>
                  </div>
                  
                  <div className="coordinates-list">
                    {newRoad.coordinates.map((coord, index) => (
                      <div key={index} className="coord-item">
                        [{coord[0]}, {coord[1]}]
                        <button 
                          type="button"
                          onClick={() => handleRemoveCoordinate(index)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddRoadForm(false)}>
                  Cancel
                </button>
                <button type="submit">
                  Add Road Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable CyberCard component
const CyberCard = ({ children, className }) => {
  return (
    <div className={`cyber-card ${className || ''}`}>
      {children}
    </div>
  );
};

export default App;