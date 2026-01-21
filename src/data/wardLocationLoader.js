/**
 * Ward Location Loader
 * Loads all ward-wise location data from ward-*.js files
 */

const ward1 = require('./ward-1');
const ward2 = require('./ward-2');
const ward3 = require('./ward-3');
const ward6 = require('./ward-6');
const ward10 = require('./ward-10');
const ward19 = require('./ward-19');

/**
 * All wards with their location data
 */
const WARDS = [
  ward1,
  ward2,
  ward3,
  ward6,
  ward10,
  ward19
];

/**
 * Create a flat list of all locations with ward mapping
 * @returns {Array} Array of {location, wardNumber, zone}
 */
function getAllLocationsWithWards() {
  const allLocations = [];
  
  WARDS.forEach(ward => {
    ward.locations.forEach(location => {
      allLocations.push({
        location: location,
        wardNumber: ward.wardNumber,
        wardName: ward.wardName,
        zone: ward.zone
      });
    });
  });
  
  return allLocations;
}

/**
 * Get ward details by location name
 * @param {string} locationName - Name of the location to search
 * @returns {Object|null} Ward details or null if not found
 */
function getWardByLocation(locationName) {
  const normalizedSearch = locationName.toLowerCase().trim();
  
  for (const ward of WARDS) {
    const found = ward.locations.find(loc => 
      loc.toLowerCase().trim() === normalizedSearch
    );
    
    if (found) {
      return {
        wardNumber: ward.wardNumber,
        wardName: ward.wardName,
        zone: ward.zone,
        location: found
      };
    }
  }
  
  return null;
}

/**
 * Get all locations in a specific ward
 * @param {number} wardNumber - Ward number to get locations for
 * @returns {Object|null} Ward data or null if not found
 */
function getLocationsByWard(wardNumber) {
  const ward = WARDS.find(w => w.wardNumber === wardNumber);
  return ward || null;
}

/**
 * Search locations across all wards (fuzzy search)
 * @param {string} searchText - Text to search for
 * @returns {Array} Array of matching locations with ward info
 */
function searchLocationsAcrossWards(searchText) {
  const normalizedSearch = searchText.toLowerCase().trim();
  const matches = [];
  
  WARDS.forEach(ward => {
    ward.locations.forEach(location => {
      if (location.toLowerCase().includes(normalizedSearch)) {
        matches.push({
          location: location,
          wardNumber: ward.wardNumber,
          wardName: ward.wardName,
          zone: ward.zone,
          matchType: location.toLowerCase() === normalizedSearch ? 'exact' : 'partial'
        });
      }
    });
  });
  
  return matches;
}

/**
 * Get statistics about ward data
 */
function getWardStats() {
  const totalLocations = WARDS.reduce((sum, ward) => sum + ward.totalLocations, 0);
  
  return {
    totalWards: WARDS.length,
    totalLocations,
    wards: WARDS.map(w => ({
      wardNumber: w.wardNumber,
      wardName: w.wardName,
      zone: w.zone,
      locationCount: w.totalLocations
    }))
  };
}

module.exports = {
  WARDS,
  getAllLocationsWithWards,
  getWardByLocation,
  getLocationsByWard,
  searchLocationsAcrossWards,
  getWardStats
};
