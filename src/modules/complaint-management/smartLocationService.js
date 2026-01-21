// Smart location extraction service with fuzzy matching
// Vadodara Municipal Corporation - Ward-wise location data

const logger = require('../../utils/logger');
const wardLoader = require('../../data/wardLocationLoader');

/**
 * Load all locations with ward mapping from ward data files
 */
const LOCATIONS_WITH_WARDS = wardLoader.getAllLocationsWithWards();

logger.info('Ward locations loaded successfully', {
  totalWards: wardLoader.WARDS.length,
  totalLocations: LOCATIONS_WITH_WARDS.length,
  wards: wardLoader.getWardStats().wards
});

/**
 * Normalize text for comparison
 */
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ');   // Normalize spaces
};

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (str1, str2) => {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
};

/**
 * Calculate similarity score (0-100)
 */
const calculateSimilarity = (str1, str2) => {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  return Math.round(similarity * 100) / 100;
};

/**
 * Extract location keywords from complaint text
 */
const extractLocationKeywords = (text) => {
  const normalized = normalizeText(text);
  const words = normalized.split(' ');
  const keywords = [];

  // Common location indicators (English, Hindi, Gujarati)
  const indicators = [
    'near', 'at', 'behind', 'opposite', 'in front of', 'beside',
    'ke pas', 'me', 'par', 'ke samne', 'ke piche',
    'pase', 'ma', 'same'
  ];

  // Extract multi-word combinations
  for (let i = 0; i < words.length; i++) {
    // Skip if word is a common indicator
    if (indicators.includes(words[i])) continue;

    // Try 5-word combinations (e.g., "21 MLD STP Chhani")
    if (i + 4 < words.length) {
      keywords.push(words.slice(i, i + 5).join(' '));
    }
    // Try 4-word combinations
    if (i + 3 < words.length) {
      keywords.push(words.slice(i, i + 4).join(' '));
    }
    // Try 3-word combinations
    if (i + 2 < words.length) {
      keywords.push(words.slice(i, i + 3).join(' '));
    }
    // Try 2-word combinations
    if (i + 1 < words.length) {
      keywords.push(words.slice(i, i + 2).join(' '));
    }
    // Single word (if length > 3)
    if (words[i].length > 3) {
      keywords.push(words[i]);
    }
  }

  return [...new Set(keywords)]; // Remove duplicates
};

/**
 * Find locations using fuzzy matching
 * Returns top matches with confidence scores and ward information
 */
const findLocationsFuzzy = (text, topN = 10, minSimilarity = 50) => {
  const keywords = extractLocationKeywords(text);
  const matches = [];

  // For each keyword, find best matching locations
  keywords.forEach(keyword => {
    LOCATIONS_WITH_WARDS.forEach(({ location, wardNumber, wardName, zone }) => {
      const normalizedLocation = normalizeText(location);
      
      // Exact match
      if (normalizedLocation === keyword || normalizedLocation.includes(keyword)) {
        matches.push({
          location,
          wardNumber,
          wardName,
          zone,
          keyword,
          similarity: 100,
          matchType: 'exact'
        });
        return;
      }

      // Partial match
      if (normalizedLocation.includes(keyword) || keyword.includes(normalizedLocation)) {
        const similarity = calculateSimilarity(keyword, normalizedLocation);
        if (similarity >= 70) {
          matches.push({
            location,
            wardNumber,
            wardName,
            zone,
            keyword,
            similarity,
            matchType: 'partial'
          });
        }
        return;
      }

      // Fuzzy match
      const similarity = calculateSimilarity(keyword, normalizedLocation);
      if (similarity >= minSimilarity) {
        matches.push({
          location,
          wardNumber,
          wardName,
          zone,
          keyword,
          similarity,
          matchType: 'fuzzy'
        });
      }
    });
  });

  // Sort by similarity (highest first)
  matches.sort((a, b) => b.similarity - a.similarity);

  // Remove duplicates (keep highest scoring)
  const uniqueMatches = [];
  const seen = new Set();
  
  matches.forEach(match => {
    if (!seen.has(match.location)) {
      seen.add(match.location);
      uniqueMatches.push(match);
    }
  });

  return uniqueMatches.slice(0, topN);
};

/**
 * Main location extraction function
 * Phase 1: Fuzzy matching
 * Phase 2: (Future) RAG + LLM for complex cases
 */
const extractLocation = async (text) => {
  try {
    logger.info('Extracting location from text', {
      textLength: text.length
    });

    // Phase 1: Fuzzy matching
    const matches = findLocationsFuzzy(text, 10, 60);

    if (matches.length === 0) {
      logger.warn('No location matches found');
      return {
        found: false,
        location: null,
        confidence: 0,
        matches: []
      };
    }

    // Get best match
    const bestMatch = matches[0];

    logger.info('Location extracted', {
      location: bestMatch.location,
      wardNumber: bestMatch.wardNumber,
      zone: bestMatch.zone,
      similarity: bestMatch.similarity,
      matchType: bestMatch.matchType
    });

    return {
      found: true,
      location: bestMatch.location,
      wardNumber: bestMatch.wardNumber,
      wardName: bestMatch.wardName,
      zone: bestMatch.zone,
      confidence: bestMatch.similarity,
      matchType: bestMatch.matchType,
      alternativeMatches: matches.slice(1, 5).map(m => ({
        location: m.location,
        wardNumber: m.wardNumber,
        zone: m.zone,
        confidence: m.similarity
      }))
    };

  } catch (error) {
    logger.error('Location extraction failed', {
      error: error.message,
      stack: error.stack
    });

    return {
      found: false,
      location: null,
      confidence: 0,
      error: error.message
    };
  }
};

/**
 * Get ward and zone from location name
 * Uses ward location loader for real data
 */
const getWardAndZone = (locationName) => {
  const wardInfo = wardLoader.getWardByLocation(locationName);
  
  if (wardInfo) {
    return {
      wardNumber: wardInfo.wardNumber,
      wardName: wardInfo.wardName,
      zone: wardInfo.zone,
      area: locationName
    };
  }
  
  // If not found in ward data, return unknown
  return {
    wardNumber: null,
    wardName: 'Unknown',
    zone: 'Unknown',
    area: locationName
  };
};

/**
 * Get all locations (for debugging)
 */
const getAllLocations = () => {
  return LOCATIONS_WITH_WARDS.map(l => l.location);
};

/**
 * Get location count
 */
const getLocationCount = () => {
  return LOCATIONS_WITH_WARDS.length;
};

/**
 * Get ward statistics
 */
const getWardStats = () => {
  return wardLoader.getWardStats();
};

// =============================================================================
// FUTURE: RAG + Vector Search Implementation
// =============================================================================
/**
 * TODO: Implement RAG-based location extraction
 * 
 * Steps:
 * 1. Install vector database: npm install @qdrant/js-client-rest
 * 2. Generate embeddings for all locations using OpenAI/Cohere
 * 3. Store in Qdrant/Pinecone
 * 4. On query, generate embedding and do semantic search
 * 5. Get top 5 matches and send to LLM for final decision
 * 
 * Benefits:
 * - Better accuracy with misspellings
 * - Semantic understanding
 * - Handles Gujarati/Hindi variations
 * 
 * Cost: ~$0.0001 per search (very cheap)
 */
const extractLocationWithRAG = async (text) => {
  // Placeholder for future RAG implementation
  throw new Error('RAG not yet implemented. Use extractLocation() for now.');
};

module.exports = {
  extractLocation,
  findLocationsFuzzy,
  getAllLocations,
  getLocationCount,
  getWardAndZone,
  getWardStats,
  // Future: RAG implementation
  extractLocationWithRAG
};
