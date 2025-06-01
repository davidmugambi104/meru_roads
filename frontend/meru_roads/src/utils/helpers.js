// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Get status class
export const getStatusClass = (status) => {
  switch(status) {
    case 'ongoing': return 'status-ongoing';
    case 'completed': return 'status-completed';
    case 'planned': return 'status-planned';
    default: return '';
  }
};

// Get road coordinates
export const getRoadCoordinates = (roadId) => {
  switch(roadId) {
    case 'maua': return [[37.60, 0.08], [37.65, 0.06], [37.70, 0.04], [37.75, 0.02]];
    case 'nkubu': return [[37.58, 0.00], [37.62, -0.02], [37.65, -0.04]];
    case 'makutano': return [[37.67, 0.03], [37.68, 0.02], [37.69, 0.01]];
    case 'mikinduri': return [[37.72, 0.03], [37.75, 0.04], [37.78, 0.05]];
    case 'kianjai': return [[37.63, 0.01], [37.65, 0.01], [37.67, 0.00]];
    default: return [[37.65, 0.05], [37.66, 0.04]];
  }
};

// Calculate center of coordinates
export const calculateCenter = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return [37.65, 0.05];
  
  const lngs = coordinates.map(coord => coord[0]);
  const lats = coordinates.map(coord => coord[1]);
  
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  
  return [centerLng, centerLat];
};