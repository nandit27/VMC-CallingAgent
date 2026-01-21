// Complaint categories and urgency classification
// Vadodara Municipal Corporation - Official Categories

/**
 * Complaint categories with their urgency levels
 */
const COMPLAINT_CATEGORIES = {
  // --- INFRASTRUCTURE & UTILITIES ---
  WATER_SUPPLY: {
    code: 'WATER_SUPPLY',
    name: 'Water Supply',
    urgency: 'urgent',
    keywords: ['water', 'supply', 'leakage', 'contamination', 'pressure', 'પાણી'],
    subcategories: ['No water supply', 'Water leakage/burst pipe', 'Contaminated water', 'Low water pressure']
  },
  STREET_LIGHT: {
    code: 'STREET_LIGHT',
    name: 'Street Light',
    urgency: 'high',
    keywords: ['light', 'street light', 'darkness', 'lamp post', 'સ્ટ્રીટ લાઈટ'],
    subcategories: ['Street light not working', 'Whole area blackout', 'Flickering light', 'Exposed wiring']
  },
  DRAINAGE_AND_STORM_DRAIN: {
    code: 'DRAINAGE_AND_STORM_DRAIN',
    name: 'Drainage and Storm Drain',
    urgency: 'urgent',
    keywords: ['drainage', 'gutter', 'overflow', 'blockage', 'ગટર'],
    subcategories: ['Drainage overflow', 'Choked drain line', 'Open manhole cover', 'Storm water blockage']
  },
  DRAINAGE_PROJECT: {
    code: 'DRAINAGE_PROJECT',
    name: 'Drainage Project',
    urgency: 'medium',
    keywords: ['project', 'new line', 'construction', 'ગટર પ્રોજેક્ટ'],
    subcategories: ['New drainage line request', 'Under-construction drainage issue']
  },
  STORM_WATER_DRAINAGE_PROJECT: {
    code: 'STORM_WATER_DRAINAGE_PROJECT',
    name: 'Storm Water Drainage Project',
    urgency: 'medium',
    keywords: ['storm water', 'monsoon project', 'વરસાદી ગટર'],
    subcategories: ['Project delay', 'Incomplete storm drain construction']
  },
  GAS_LINE: {
    code: 'GAS_LINE',
    name: 'Gas Line',
    urgency: 'urgent',
    keywords: ['gas', 'leakage', 'pipeline', 'PNG', 'ગેસ'],
    subcategories: ['Gas leakage', 'Supply interruption', 'Pipeline damage']
  },

  // --- SANITATION & WASTE ---
  GARBAGE_AND_CLEANLINESS: {
    code: 'GARBAGE_AND_CLEANLINESS',
    name: 'Garbage and Cleanliness',
    urgency: 'medium',
    keywords: ['garbage', 'clean', 'trash', 'waste', 'કચરો'],
    subcategories: ['Garbage pile-up', 'Irregular cleaning', 'Public littering']
  },
  DOOR_TO_DOOR_GARBAGE: {
    code: 'DOOR_TO_DOOR_GARBAGE',
    name: 'Door To Door Garbage Collection',
    urgency: 'medium',
    keywords: ['van', 'garbage collection', 'pickup', 'કચરા ગાડી'],
    subcategories: ['Garbage van not arrived', 'Missed collection']
  },
  RRR_COLLECTION_VAN: {
    code: 'RRR_COLLECTION_VAN',
    name: 'RRR Collection Van',
    urgency: 'low',
    keywords: ['rrr', 'recycle', 'reuse', 'reduce', 'કલેક્શન વેન'],
    subcategories: ['Van scheduling', 'Donation pickup request']
  },
  E_WASTE: {
    code: 'E_WASTE',
    name: 'E Waste',
    urgency: 'low',
    keywords: ['electronic', 'battery', 'computer', 'e-waste', 'ઈ વેસ્ટ'],
    subcategories: ['E-waste collection request']
  },
  PUBLIC_TOILET: {
    code: 'PUBLIC_TOILET',
    name: 'Public Toilet',
    urgency: 'medium',
    keywords: ['toilet', 'bathroom', 'sanitation', 'શૌચાલય'],
    subcategories: ['Dirty public toilet', 'No water in toilet']
  },
  OPEN_DEFECATION: {
    code: 'OPEN_DEFECATION',
    name: 'Open Defecation',
    urgency: 'high',
    keywords: ['open defecation', 'public hygiene', 'જાહેરમાં શૌચાલય'],
    subcategories: ['Reporting open defecation area', 'Lack of toilets in area']
  },

  // --- ROADS & TRANSPORT ---
  ROAD_AND_FOOTPATH: {
    code: 'ROAD_AND_FOOTPATH',
    name: 'Road and Footpath',
    urgency: 'medium',
    keywords: ['road', 'pothole', 'footpath', 'paving', 'રસ્તા'],
    subcategories: ['Potholes on road', 'Damaged footpath']
  },
  ROAD_PROJECT_NEW_ABOVE_18_METER: {
    code: 'ROAD_PROJECT_NEW_ABOVE_18_METER',
    name: 'Road Project (New Above 18 Meter)',
    urgency: 'medium',
    keywords: ['highway', 'main road', '18 meter', 'રોડ પ્રોજેક્ટ'],
    subcategories: ['Road construction delay', 'Quality of new road']
  },
  TRAFFIC_SIGNAL: {
    code: 'TRAFFIC_SIGNAL',
    name: 'Traffic Signal',
    urgency: 'high',
    keywords: ['traffic', 'signal', 'light', 'timer', 'ટ્રાફિક સિગ્નલ'],
    subcategories: ['Signal not working', 'Timer malfunction']
  },
  CITY_BUS_SERVICES: {
    code: 'CITY_BUS_SERVICES',
    name: 'City Bus Services',
    urgency: 'medium',
    keywords: ['bus', 'transport', 'route', 'stop', 'બસ'],
    subcategories: ['Bus delay', 'Route coverage', 'Staff behavior']
  },

  // --- PUBLIC SAFETY & ANIMALS ---
  STRAY_CATTLE: {
    code: 'STRAY_CATTLE',
    name: 'Stray Cattle',
    urgency: 'high',
    keywords: ['cattle', 'cow', 'buffalo', 'road block', 'ઢોર'],
    subcategories: ['Cattle on main road', 'Aggressive cattle']
  },
  STRAY_DOGS: {
    code: 'STRAY_DOGS',
    name: 'Stray Dog Sterilization and ARV',
    urgency: 'medium',
    keywords: ['dog', 'bite', 'sterilization', 'rabies', 'કુતરા'],
    subcategories: ['Dog sterilization request', 'Rabies vaccination']
  },
  DEAD_ANIMALS: {
    code: 'DEAD_ANIMALS',
    name: 'Dead Animals',
    urgency: 'urgent',
    keywords: ['dead', 'carcass', 'animal removal', 'મરેલા જાનવર'],
    subcategories: ['Carcass removal request']
  },
  EMERGENCY: {
    code: 'EMERGENCY',
    name: 'Emergency',
    urgency: 'urgent',
    keywords: ['emergency', 'accident', 'fire', 'rescue', 'ઈમરજેંસી'],
    subcategories: ['Immediate safety hazard', 'Rescue required']
  },
  QRT: {
    code: 'QRT',
    name: 'QRT (Quick Response Team)',
    urgency: 'urgent',
    keywords: ['qrt', 'quick response', 'disaster'],
    subcategories: ['Immediate disaster response']
  },

  // --- HEALTH & MEDICAL ---
  PUBLIC_HEALTH: {
    code: 'PUBLIC_HEALTH',
    name: 'Public Health',
    urgency: 'high',
    keywords: ['health', 'disease', 'fogging', 'mosquitoes', 'આરોગ્ય'],
    subcategories: ['Mosquito breeding', 'Fogging request']
  },
  HOSPITAL_AND_DISPENSARY: {
    code: 'HOSPITAL_AND_DISPENSARY',
    name: 'Hospital And Dispensary',
    urgency: 'medium',
    keywords: ['hospital', 'clinic', 'doctor', 'medicine', 'હોસ્પિટલ'],
    subcategories: ['Facility maintenance', 'Staff unavailability', 'Lack of medicines']
  },
  AROGYAM: {
    code: 'AROGYAM',
    name: 'Arogyam',
    urgency: 'medium',
    keywords: ['arogyam', 'health mission', 'checkup', 'આરોગ્યમ'],
    subcategories: ['Health camp info', 'Service complaint']
  },
  BIRTH_AND_DEATH: {
    code: 'BIRTH_AND_DEATH',
    name: 'Birth and Death',
    urgency: 'low',
    keywords: ['certificate', 'birth', 'death', 'registration', 'જન્મ'],
    subcategories: ['Correction in certificate', 'Issuance delay']
  },

  // --- HOUSING, TAX & LAND ---
  HOUSING_SCHEME: {
    code: 'HOUSING_SCHEME',
    name: 'Gujarat Rural Urban Housing Scheme',
    urgency: 'medium',
    keywords: ['housing', 'flat', 'allotment', 'scheme', 'હાઉસિંગ'],
    subcategories: ['Maintenance issue', 'Allotment query']
  },
  ASSESSMENT_TAX_REBATE: {
    code: 'ASSESSMENT_TAX_REBATE',
    name: 'Assessment Tax Rebate',
    urgency: 'low',
    keywords: ['tax', 'bill', 'rebate', 'assessment', 'ટેક્સ'],
    subcategories: ['Tax calculation error', 'Rebate eligibility']
  },
  ENCROACHMENT: {
    code: 'ENCROACHMENT',
    name: 'Encroachment',
    urgency: 'medium',
    keywords: ['encroachment', 'illegal', 'obstruction', 'દબાણ'],
    subcategories: ['Footpath encroachment', 'Illegal shop extension']
  },

  // --- PARKS & PUBLIC BUILDINGS ---
  PARKS_AND_GARDEN: {
    code: 'PARKS_AND_GARDEN',
    name: 'Parks and Garden',
    urgency: 'low',
    keywords: ['park', 'garden', 'tree', 'trimming', 'બગીચા'],
    subcategories: ['Tree trimming', 'Broken garden equipment']
  },
  SWIMMING_POOL: {
    code: 'SWIMMING_POOL',
    name: 'Swimming Pool',
    urgency: 'low',
    keywords: ['swimming', 'pool', 'water quality', 'સ્વિમિંગ પુલ'],
    subcategories: ['Pool cleanliness', 'Instructor availability']
  },
  AUDITORIUM: {
    code: 'AUDITORIUM',
    name: 'Auditorium',
    urgency: 'low',
    keywords: ['hall', 'booking', 'auditorium', 'ઓડિટોરિયમ'],
    subcategories: ['Booking issue', 'AC/Sound system failure']
  },
  ATITHI_GRUH: {
    code: 'ATITHI_GRUH',
    name: 'Atithi Gruh',
    urgency: 'low',
    keywords: ['guest house', 'stay', 'atithi gruh', 'અતિથિ ગૃહ'],
    subcategories: ['Room maintenance', 'Booking problem']
  },
  CREMATORIUM_COMPLAIN: {
    code: 'CREMATORIUM_COMPLAIN',
    name: 'Crematorium Complain',
    urgency: 'medium',
    keywords: ['crematorium', 'final rites', 'smashan', 'સ્મશાન'],
    subcategories: ['Maintenance issues', 'Facility unavailability']
  },

  // --- MISCELLANEOUS ---
  MONSOON_COMPLAINTS: {
    code: 'MONSOON_COMPLAINTS',
    name: 'Monsoon Complaints',
    urgency: 'high',
    keywords: ['rain', 'flooding', 'monsoon', 'water logging', 'વરસાદ'],
    subcategories: ['Waterlogging in locality', 'Falling of trees']
  },
  AIR_QUALITY_MGT: {
    code: 'AIR_QUALITY_MGT',
    name: 'Air Quality Mgt',
    urgency: 'medium',
    keywords: ['air', 'pollution', 'smoke', 'dust', 'હવાની ગુણવત્તા'],
    subcategories: ['Dust pollution', 'Burning of waste']
  },
  MALL_PARKING_FEE: {
    code: 'MALL_PARKING_FEE',
    name: 'Mall Parking Fee Related',
    urgency: 'low',
    keywords: ['mall', 'parking', 'fee', 'overcharging', 'પાર્કિંગ'],
    subcategories: ['Overcharging for parking', 'Lack of free parking']
  },
  SMART_CITY_COMPLAINTS: {
    code: 'SMART_CITY_COMPLAINTS',
    name: 'Regarding Vadodara Smart City',
    urgency: 'medium',
    keywords: ['smart city', 'project', 'infrastructure', 'વડોદરા સ્માર્ટ સીટી'],
    subcategories: ['Ongoing smart city work issue', 'Smart kiosk maintenance']
  },
  BUDGET_SUGGESTION: {
    code: 'BUDGET_SUGGESTION',
    name: 'Budget Suggestion',
    urgency: 'low',
    keywords: ['budget', 'suggestion', 'idea', 'finance', 'બજેટ'],
    subcategories: ['Infrastructure suggestion', 'Taxation suggestion']
  }
};

/**
 * Get all categories
 */
const getAllCategories = () => {
  return Object.values(COMPLAINT_CATEGORIES);
};

/**
 * Get categories by urgency level
 */
const getCategoriesByUrgency = (urgency) => {
  return Object.values(COMPLAINT_CATEGORIES).filter(
    cat => cat.urgency === urgency
  );
};

/**
 * Find category from keywords in text
 */
const findCategoryFromText = (text) => {
  if (!text) return COMPLAINT_CATEGORIES.OTHER;
  
  const normalized = text.toLowerCase();
  
  // Score each category based on keyword matches
  const scores = Object.values(COMPLAINT_CATEGORIES).map(category => {
    const matchCount = category.keywords.filter(keyword => 
      normalized.includes(keyword.toLowerCase())
    ).length;
    
    return {
      category,
      score: matchCount
    };
  });
  
  // Sort by score and get the highest
  scores.sort((a, b) => b.score - a.score);
  
  // Return best match or default to first category if no match
  if (scores[0].score > 0) {
    return scores[0].category;
  }
  
  // Default fallback to GARBAGE_AND_CLEANLINESS if no keyword match
  return COMPLAINT_CATEGORIES.GARBAGE_AND_CLEANLINESS || Object.values(COMPLAINT_CATEGORIES)[0];
};

/**
 * Get urgency level for a category code
 */
const getUrgencyForCategory = (categoryCode) => {
  const category = Object.values(COMPLAINT_CATEGORIES).find(
    cat => cat.code === categoryCode
  );
  return category ? category.urgency : 'medium';
};

module.exports = {
  COMPLAINT_CATEGORIES,
  getAllCategories,
  getCategoriesByUrgency,
  findCategoryFromText,
  getUrgencyForCategory
};
