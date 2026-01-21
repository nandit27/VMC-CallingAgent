// Sample location, ward, and zone data
// Replace this with your actual municipal data

/**
 * Sample ward and zone mapping
 * Add your city's actual ward numbers and zones here
 */
const WARDS_DATA = [
  // Zone 1 - Central
  { wardNumber: '1', zone: 'Central', area: 'City Center', landmarks: ['Town Hall', 'Central Market', 'Main Square'] },
  { wardNumber: '2', zone: 'Central', area: 'Old City', landmarks: ['Old Bus Stand', 'Railway Station', 'Civil Hospital'] },
  { wardNumber: '3', zone: 'Central', area: 'Market Area', landmarks: ['Textile Market', 'Vegetable Market'] },
  
  // Zone 2 - East
  { wardNumber: '4', zone: 'East', area: 'East Zone A', landmarks: ['East Garden', 'Industrial Area', 'GIDC'] },
  { wardNumber: '5', zone: 'East', area: 'East Zone B', landmarks: ['Lake View', 'Tech Park'] },
  
  // Zone 3 - West
  { wardNumber: '6', zone: 'West', area: 'West Zone A', landmarks: ['Beach Road', 'West Park', 'Mall'] },
  { wardNumber: '7', zone: 'West', area: 'West Zone B', landmarks: ['University', 'Sports Complex'] },
  
  // Zone 4 - North
  { wardNumber: '8', zone: 'North', area: 'North Zone A', landmarks: ['Airport Road', 'IT Park'] },
  { wardNumber: '9', zone: 'North', area: 'North Zone B', landmarks: ['Exhibition Ground', 'Stadium'] },
  
  // Zone 5 - South
  { wardNumber: '10', zone: 'South', area: 'South Zone A', landmarks: ['South Garden', 'Shopping Complex'] },
  { wardNumber: '11', zone: 'South', area: 'South Zone B', landmarks: ['Port Area', 'Harbor'] }
];

/**
 * Location keywords and their ward mappings
 * Add your city's specific location names, road names, landmarks
 */
const LOCATION_MAPPINGS = {
  // Central Zone
  'town hall': { wardNumber: '1', zone: 'Central', landmark: 'Town Hall' },
  'central market': { wardNumber: '1', zone: 'Central', landmark: 'Central Market' },
  'main square': { wardNumber: '1', zone: 'Central', landmark: 'Main Square' },
  'old bus stand': { wardNumber: '2', zone: 'Central', landmark: 'Old Bus Stand' },
  'railway station': { wardNumber: '2', zone: 'Central', landmark: 'Railway Station' },
  'civil hospital': { wardNumber: '2', zone: 'Central', landmark: 'Civil Hospital' },
  'textile market': { wardNumber: '3', zone: 'Central', landmark: 'Textile Market' },
  'vegetable market': { wardNumber: '3', zone: 'Central', landmark: 'Vegetable Market' },
  
  // East Zone
  'east garden': { wardNumber: '4', zone: 'East', landmark: 'East Garden' },
  'industrial area': { wardNumber: '4', zone: 'East', landmark: 'Industrial Area' },
  'gidc': { wardNumber: '4', zone: 'East', landmark: 'GIDC' },
  'lake view': { wardNumber: '5', zone: 'East', landmark: 'Lake View' },
  'tech park': { wardNumber: '5', zone: 'East', landmark: 'Tech Park' },
  
  // West Zone
  'beach road': { wardNumber: '6', zone: 'West', landmark: 'Beach Road' },
  'west park': { wardNumber: '6', zone: 'West', landmark: 'West Park' },
  'mall': { wardNumber: '6', zone: 'West', landmark: 'Mall' },
  'university': { wardNumber: '7', zone: 'West', landmark: 'University' },
  'sports complex': { wardNumber: '7', zone: 'West', landmark: 'Sports Complex' },
  
  // North Zone
  'airport road': { wardNumber: '8', zone: 'North', landmark: 'Airport Road' },
  'it park': { wardNumber: '8', zone: 'North', landmark: 'IT Park' },
  'exhibition ground': { wardNumber: '9', zone: 'North', landmark: 'Exhibition Ground' },
  'stadium': { wardNumber: '9', zone: 'North', landmark: 'Stadium' },
  
  // South Zone
  'south garden': { wardNumber: '10', zone: 'South', landmark: 'South Garden' },
  'shopping complex': { wardNumber: '10', zone: 'South', landmark: 'Shopping Complex' },
  'port area': { wardNumber: '11', zone: 'South', landmark: 'Port Area' },
  'harbor': { wardNumber: '11', zone: 'South', landmark: 'Harbor' }
};

/**
 * Get ward information by ward number
 */
const getWardInfo = (wardNumber) => {
  return WARDS_DATA.find(ward => ward.wardNumber === wardNumber);
};

/**
 * Get zone information
 */
const getZoneInfo = (zoneName) => {
  return WARDS_DATA.filter(ward => ward.zone === zoneName);
};

/**
 * Find location in mapping
 */
const findLocation = (locationText) => {
  if (!locationText) return null;
  
  const normalized = locationText.toLowerCase().trim();
  
  // Direct match
  if (LOCATION_MAPPINGS[normalized]) {
    return LOCATION_MAPPINGS[normalized];
  }
  
  // Partial match - find if any keyword exists in the text
  for (const [keyword, location] of Object.entries(LOCATION_MAPPINGS)) {
    if (normalized.includes(keyword) || keyword.includes(normalized)) {
      return location;
    }
  }
  
  return null;
};

/**
 * Get all zones
 */
const getAllZones = () => {
  return [...new Set(WARDS_DATA.map(ward => ward.zone))];
};

/**
 * Get all wards
 */
const getAllWards = () => {
  return WARDS_DATA.map(ward => ward.wardNumber);
};

module.exports = {
  WARDS_DATA,
  LOCATION_MAPPINGS,
  getWardInfo,
  getZoneInfo,
  findLocation,
  getAllZones,
  getAllWards
};
