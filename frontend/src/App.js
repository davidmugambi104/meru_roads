// src/App.jsx
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
import RoadHealthPredictor from './components/RoadHealthPredictor';

// Mapbox token setup
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

const API_BASE = 'https://meru-roads.onrender.com/api';

// Helper function for API calls
const fetchData = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
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
  const [notifications, setNotifications] = useState(3);
  const [time, setTime] = useState(new Date());
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/satellite-streets-v12");
  const [roads, setRoads] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllRoads, setShowAllRoads] = useState(false);
  const mapRef = useRef(null);
  const canvasRef = useRef(null);
  // Add these to your existing state variables
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
  
  // JSON data for roads in Meru, Kenya
  const meruRoadsData = [
    {
      id: 'maua',
      name: 'Maua Highway',
      length: 18.5,
      budget: 2400000000,
      status: 'ongoing',
      contractor: 'Meru Builders Ltd.',
      startDate: '2023-01-15',
      endDate: '2024-10-30',
      progress: 65,
      milestones: ['Planning', 'Land Prep', 'Foundation', 'Paving', 'Finishing'],
      completedMilestones: 3,
      description: 'The Maua Highway project represents our commitment to connecting Meru County\'s agricultural heartland to national markets.',
      coordinates: [[37.60, 0.08], [37.65, 0.06], [37.70, 0.04], [37.75, 0.02]]
    },
    {
      id: 'nkubu',
      name: 'Nkubu Bypass',
      length: 7.2,
      budget: 850000000,
      status: 'ongoing',
      contractor: 'Highway Constructors Co.',
      startDate: '2023-03-10',
      endDate: '2024-05-15',
      progress: 45,
      milestones: ['Planning', 'Land Prep', 'Foundation', 'Paving', 'Finishing'],
      completedMilestones: 2,
      description: 'The Nkubu Bypass will alleviate traffic congestion in the central business district.',
      coordinates: [[37.58, 0.00], [37.62, -0.02], [37.65, -0.04]]
    },
    {
      id: 'makutano',
      name: 'Makutano Junction',
      length: 3.8,
      budget: 420000000,
      status: 'completed',
      contractor: 'Urban Roads Ltd.',
      startDate: '2022-11-01',
      endDate: '2023-08-20',
      progress: 100,
      milestones: ['Planning', 'Land Prep', 'Foundation', 'Paving', 'Finishing'],
      completedMilestones: 5,
      description: 'Makutano Junction upgrade has significantly improved traffic flow and safety.',
      coordinates: [[37.67, 0.03], [37.68, 0.02], [37.69, 0.01]]
    },
    {
      id: 'mikinduri',
      name: 'Mikinduri Road',
      length: 12.3,
      budget: 1200000000,
      status: 'planned',
      contractor: 'TBD',
      startDate: '2024-02-01',
      endDate: '2025-06-30',
      progress: 10,
      milestones: ['Planning', 'Land Prep', 'Foundation', 'Paving', 'Finishing'],
      completedMilestones: 1,
      description: 'Mikinduri Road will connect remote villages to the main highway network.',
      coordinates: [[37.72, 0.03], [37.75, 0.04], [37.78, 0.05]]
    },
    {
      id: 'kianjai',
      name: 'Kianjai Corridor',
      length: 9.7,
      budget: 1100000000,
      status: 'ongoing',
      contractor: 'County Infrastructure Group',
      startDate: '2023-05-22',
      endDate: '2024-09-15',
      progress: 30,
      milestones: ['Planning', 'Land Prep', 'Foundation', 'Paving', 'Finishing'],
      completedMilestones: 2,
      description: 'Kianjai Corridor is part of the agricultural development initiative.',
      coordinates: [[37.63, 0.01], [37.65, 0.01], [37.67, 0.00]]
    },
    {
      id: 'gitoro',
      name: 'Gitoro-Kiirua Road',
      length: 12.4,
      budget: 290000000,
      status: 'ongoing',
      contractor: 'Eastern Roads Ltd.',
      startDate: '2023-03-20',
      endDate: '2024-03-15',
      progress: 41,
      milestones: ['Planning', 'Land Prep', 'Foundation', 'Paving', 'Finishing'],
      completedMilestones: 2,
      description: 'Road improvement project in Gitoro area',
      coordinates: [[37.61, 0.02], [37.63, 0.01], [37.65, 0.00]]
    },
    {
      id: 'mitunguu',
      name: 'Mitunguu-Kaaga Road',
      length: 8.9,
      budget: 180000000,
      status: 'completed',
      contractor: 'Meru County Works',
      startDate: '2022-01-10',
      endDate: '2022-11-30',
      progress: 100,
      milestones: ['Planning', 'Land Prep', 'Foundation', 'Paving', 'Finishing'],
      completedMilestones: 5,
      description: 'Urban road connecting Mitunguu to Kaaga',
      coordinates: [[37.59, -0.01], [37.60, -0.02], [37.62, -0.03]]
    },
    {
      id: 'nchiru',
      name: 'Nchiru-Kiagu Road',
      length: 23.6,
      budget: 520000000,
      status: 'ongoing',
      contractor: 'Tana River Construction',
      startDate: '2022-11-15',
      endDate: '2024-08-31',
      progress: 48,
      milestones: ['Planning', 'Land Prep', 'Foundation', 'Paving', 'Finishing'],
      completedMilestones: 2,
      description: 'Rural road connecting Nchiru and Kiagu',
      coordinates: [[37.70, 0.05], [37.72, 0.04], [37.74, 0.03]]
    },
    {
      id: 'kiegoi',
      name: 'Kiegoi-Antubochiu Road',
      length: 14.3,
      budget: 310000000,
      status: 'completed',
      contractor: 'Mount Kenya Builders',
      startDate: '2021-09-01',
      endDate: '2022-12-15',
      progress: 100,
      milestones: ['Planning', 'Land Prep', 'Foundation', 'Paving', 'Finishing'],
      completedMilestones: 5,
      description: 'Road in the foothills of Mount Kenya',
      coordinates: [[37.55, 0.04], [37.57, 0.03], [37.59, 0.02]]
    },
    {
      id: 'kibirichia',
      name: 'Kibirichia-Chogoria Road',
      length: 37.8,
      budget: 750000000,
      status: 'ongoing',
      contractor: 'Central Highlands Construction',
      startDate: '2023-02-10',
      endDate: '2025-01-31',
      progress: 28,
      milestones: ['Planning', 'Land Prep', 'Foundation', 'Paving', 'Finishing'],
      completedMilestones: 1,
      description: 'Major road connecting two major towns',
      coordinates: [[37.65, 0.07], [37.68, 0.06], [37.71, 0.05]]
    }
  ];

  // Fetch roads data from API
  useEffect(() => {
    const fetchRoads = async () => {
      try {
        // Simulate API call with our local data
        // Sort alphabetically by name
        const sortedRoads = [...meruRoadsData].sort((a, b) => a.name.localeCompare(b.name));
        setRoads(sortedRoads);
        setLoading(false);
        
        // Set initial road data
        if (sortedRoads.length > 0 && !roadData) {
          const initialRoad = sortedRoads.find(r => r.id === selectedRoad) || sortedRoads[0];
          setRoadData(initialRoad);
          setSelectedRoad(initialRoad.id);
        }
      } catch (error) {
        console.error('Failed to fetch roads:', error);
        // Fallback to original hardcoded data if API fails
        setRoads(meruRoadsData);
      }
    };

    fetchRoads();
  }, [searchQuery]);

  // Fetch stats data from API
  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        // Simulate stats API call
        setStats({
          totalRoads: meruRoadsData.length,
          completed: meruRoadsData.filter(r => r.status === 'completed').length,
          inProgress: meruRoadsData.filter(r => r.status === 'ongoing').length,
          planned: meruRoadsData.filter(r => r.status === 'planned').length,
          budgetAllocated: meruRoadsData.reduce((sum, road) => sum + road.budget, 0),
          budgetSpent: meruRoadsData.reduce((sum, road) => {
            // Estimate spent based on progress
            return sum + (road.budget * (road.progress / 100));
          }, 0)
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Keep default stats
      }
    };

    fetchStatsData();
  }, []);

  // Fetch photos data from API
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        // Simulate photos API call
        const photos = [
          { id: 1, road: 'maua', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=500' },
          { id: 2, road: 'maua', url: 'https://images.unsplash.com/photo-1509310202330-aec5af0c4cbc?q=80&w=500' },
          { id: 3, road: 'nkubu', url: 'https://images.unsplash.com/photo-1584017912151-3e2c1d0f4d0a?q=80&w=500' },
          { id: 4, road: 'makutano', url: 'https://images.unsplash.com/photo-1605184861726-04e5c8f171e0?q=80&w=500' },
          { id: 5, road: 'mikinduri', url: 'https://images.unsplash.com/photo-1584017912151-3e2c1d0f4d0a?q=80&w=500' },
          { id: 6, road: 'kianjai', url: 'https://images.unsplash.com/photo-1597007233337-8f1d23c0f7a8?q=80&w=500' },
          { id: 7, road: 'gitoro', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=500' },
          { id: 8, road: 'mitunguu', url: 'https://images.unsplash.com/photo-1509310202330-aec5af0c4cbc?q=80&w=500' },
          { id: 9, road: 'nchiru', url: 'https://images.unsplash.com/photo-1584017912151-3e2c1d0f4d0a?q=80&w=500' },
          { id: 10, road: 'kiegoi', url: 'https://images.unsplash.com/photo-1605184861726-04e5c8f171e0?q=80&w=500' }
        ];
        setPhotos(photos);
      } catch (error) {
        console.error('Failed to fetch photos:', error);
        // Keep default photos
      }
    };

    fetchPhotos();
  }, [selectedRoad]);

  // Fetch user data from API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Simulate user API call
        setUser({
          name: 'John Mwenda',
          role: 'County Engineer',
          initials: 'JM'
        });
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Keep default user
      }
    };

    fetchUser();
  }, []);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Simulate notifications API call
        setNotifications(3);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        // Keep default notifications
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
    
    const road = roads.find(r => r.id === selectedRoad);
    if (road) {
      setRoadData(road);
      
      // Animate stats - ORIGINAL ANIMATION PRESERVED
      gsap.from('.stat-value', {
        duration: 1.5,
        innerText: 0,
        snap: { innerText: 1 },
        stagger: 0.2,
        ease: "power2.out"
      });
    }
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
  // Add these functions in your App component
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
// ...existing code...

// Replace your handleAddRoadSubmit with this version:
const handleAddRoadSubmit = async (e) => {
  e.preventDefault();
  
  // Validate coordinates
  if (newRoad.coordinates.length < 2) {
    alert("Please add at least two coordinate points");
    return;
  }

  // Validate dates
  if (new Date(newRoad.start_date) > new Date(newRoad.end_date)) {
    alert("End date must be after start date");
    return;
  }

  try {
    // Prepare road data
    const roadData = {
      name: newRoad.name,
      length: parseFloat(newRoad.length),
      budget: parseFloat(newRoad.budget),
      status: newRoad.status,
      start_date: newRoad.start_date,
      end_date: newRoad.end_date,
      description: newRoad.description,
      contractor: newRoad.contractor,
      map_coordinates: newRoad.coordinates.map(coord => [
        parseFloat(coord[0]),
        parseFloat(coord[1])
      ])
    };

    // Debugging: Log request data
    console.log("Submitting road data:", roadData);
    
    // Send to backend
    const response = await fetch('/api/roads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(roadData)
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error(`Server returned unexpected format (status ${response.status})`);
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const createdRoad = await response.json();
    
    // Reset form
    setNewRoad({
      name: '',
      length: '',
      budget: '',
      status: 'planned',
      start_date: '',
      end_date: '',
      description: '',
      contractor: '',
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
  
  // Handle map load - MODIFIED TO USE API
  const handleMapLoad = (e) => {
    mapRef.current = e.target;

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
    
    // Add 3D terrain - ORIGINAL CODE PRESERVED
    e.target.addSource('mapbox-dem', {
      'type': 'raster-dem',
      'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
      'tileSize': 512,
      'maxzoom': 14
    });
    
    e.target.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
    
    // Add road data from API
    const addRoadsToMap = async () => {
      try {
        // Simulate map roads API call
        const mapRoads = {
          type: 'FeatureCollection',
          features: roads.map(road => ({
            type: 'Feature',
            properties: {
              id: road.id,
              name: road.name,
              status: road.status
            },
            geometry: {
              type: 'LineString',
              coordinates: road.coordinates
            }
          }))
        };
        
        e.target.addSource('roads', {
          'type': 'geojson',
          'data': mapRoads
        });
        
        // Add road layer - ORIGINAL STYLING PRESERVED
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
        
        // Add glow effect - ORIGINAL CODE PRESERVED
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
        
        // Fly to selected road
        handleRoadSelect(selectedRoad);
      } catch (error) {
        console.error('Failed to add roads to map:', error);
        // Fallback to original coordinates
        const road = roads.find(r => r.id === selectedRoad);
        if (road && road.coordinates) {
          const center = calculateCenter(road.coordinates);
          e.target.flyTo({ center, zoom: 12 });
        }
      }
    };
    
    addRoadsToMap();
  };
  
  // Handle progress update
  const handleUpdateProgress = async () => {
    if (!roadData) return;
    
    const newProgress = prompt('Enter new progress (0-100):', roadData.progress);
    if (newProgress === null) return;
    
    const progressValue = parseInt(newProgress);
    if (isNaN(progressValue)) return;
    
    try {
      // Simulate progress update API call
      setRoads(prevRoads => 
        prevRoads.map(road => 
          road.id === roadData.id ? { ...road, progress: progressValue } : road
        )
      );
      
      // Refresh current road data
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
      // Simulate photo upload API call
      const newPhoto = {
        id: photos.length + 1,
        road: roadData.id,
        url,
        caption
      };
      
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
  
  // Format currency - ORIGINAL FUNCTION PRESERVED
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };
  
  // Format date - ORIGINAL FUNCTION PRESERVED
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status class - ORIGINAL FUNCTION PRESERVED
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
  // User management panel


  return (
    <div className="app">
      {/* 3D Background Canvas - ORIGINAL ELEMENT PRESERVED */}
      
      {/* CRT Overlay - ORIGINAL ELEMENT PRESERVED */}
      <div className="crt-overlay"></div>
      
      {/* Header - ORIGINAL STRUCTURE PRESERVED */}
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
      
      {/* Dashboard Container - ORIGINAL STRUCTURE PRESERVED */}
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
                    <div className="stat-value">{stats.totalRoads}</div>
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
      <div style={{display: 'inline-block', marginRight: '20px'}}>
        <UserManagement/>
      </div>
      <div style={{display: 'inline-block',marginTop: '20px', marginLeft: '200px'}}>
        <AssetManager/>
      </div>
      {/* <ARVisualizer/> */}
      {/* <TrafficAnalysis/> */}
      {/* <AccessibilityPanel/> */}
      {/* <EnvironmentalImpact/> */}
      {/* <RoadHealthPredictor/> */}

   

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
                  {/* Date Fields */}
                  <input
                    type="date"
                    value={newRoad.start_date}
                    onChange={e => setNewRoad({...newRoad, start_date: e.target.value})}
                  />

                </div>
                
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newRoad.end_date}
                    onChange={e => setNewRoad({...newRoad, end_date: e.target.value})}
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
      
      
      {/* Footer - ORIGINAL CODE PRESERVED */}
      <footer>
        <p>Meru County Roadworks Dashboard &copy; {new Date().getFullYear()} | Developed for the People of Meru County</p>
        <p>
          {time.toLocaleDateString()} | {time.toLocaleTimeString()} | 
          <span> Data updated: {new Date().toLocaleDateString()}</span>
        </p>
      </footer>
    </div>
  );
};

// Reusable CyberCard component - ORIGINAL COMPONENT PRESERVED
const CyberCard = ({ children, className }) => {
  return (
    <div className={`cyber-card ${className || ''}`}>
      {children}
    </div>
  );
};

export default App;