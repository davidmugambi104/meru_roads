const API_BASE = 'http://localhost:5000/api';

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
export const api = {
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
  getMilestones: (roadId, completed) => 
    fetchData(`/road/${roadId}/milestones?completed=${completed}`)
};