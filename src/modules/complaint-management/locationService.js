// Location extraction and ward mapping service

const logger = require('../../utils/logger');
const { findLocation, getWardInfo } = require('../../data/locations');

/**
 * Extract location information from complaint text and map to ward/zone
 */
class LocationService {
  /**
   * Extract location and map to ward/zone
   * @param {string} text - Complaint text (preferably in English)
   * @returns {Promise<object>} Location information
   */
  async extractAndMapLocation(text) {
    try {
      logger.info('Starting location extraction', {
        textLength: text.length
      });

      // Step 1: Extract location mentions from text
      const extractedLocations = this.extractLocationKeywords(text);

      if (extractedLocations.length === 0) {
        logger.warn('No location found in text');
        return {
          extractedText: '',
          landmark: '',
          wardNumber: '',
          zone: '',
          coordinates: null,
          found: false
        };
      }

      // Step 2: Find best matching location in database
      let bestMatch = null;
      for (const location of extractedLocations) {
        const match = findLocation(location);
        if (match) {
          bestMatch = match;
          break; // Use first match found
        }
      }

      if (!bestMatch) {
        logger.warn('Location mentioned but not found in database', {
          extractedLocations
        });
        
        return {
          extractedText: extractedLocations[0],
          landmark: '',
          wardNumber: '',
          zone: '',
          coordinates: null,
          found: false
        };
      }

      // Step 3: Get ward information
      const wardInfo = getWardInfo(bestMatch.wardNumber);

      logger.info('Location mapped successfully', {
        landmark: bestMatch.landmark,
        wardNumber: bestMatch.wardNumber,
        zone: bestMatch.zone
      });

      return {
        extractedText: extractedLocations[0],
        landmark: bestMatch.landmark,
        wardNumber: bestMatch.wardNumber,
        zone: bestMatch.zone,
        area: wardInfo?.area || '',
        coordinates: null, // Can be added later if GPS data available
        found: true
      };

    } catch (error) {
      logger.error('Location extraction failed', {
        error: error.message,
        stack: error.stack
      });

      return {
        extractedText: '',
        landmark: '',
        wardNumber: '',
        zone: '',
        coordinates: null,
        found: false,
        error: error.message
      };
    }
  }

  /**
   * Extract potential location keywords from text
   * Uses simple word extraction - can be enhanced with NER (Named Entity Recognition)
   */
  extractLocationKeywords(text) {
    const locations = [];
    const normalized = text.toLowerCase();

    // Common location indicators
    const locationIndicators = [
      'near', 'at', 'behind', 'opposite', 'in front of', 'beside',
      'के पास', 'में', 'पर', 'के सामने', 'के पीछे',
      'પાસે', 'માં', 'પર', 'સામે'
    ];

    // Split text into words
    const words = normalized.split(/\s+/);

    // Look for multi-word locations (2-4 words)
    for (let i = 0; i < words.length; i++) {
      // Try 4-word combinations
      if (i + 3 < words.length) {
        locations.push(words.slice(i, i + 4).join(' '));
      }
      // Try 3-word combinations
      if (i + 2 < words.length) {
        locations.push(words.slice(i, i + 3).join(' '));
      }
      // Try 2-word combinations
      if (i + 1 < words.length) {
        locations.push(words.slice(i, i + 2).join(' '));
      }
      // Single word
      locations.push(words[i]);
    }

    // Remove duplicates and very short words
    const unique = [...new Set(locations)].filter(loc => loc.length > 2);

    logger.debug('Extracted location keywords', {
      count: unique.length,
      keywords: unique.slice(0, 10) // Log first 10
    });

    return unique;
  }

  /**
   * Get coordinates from address (for future enhancement)
   */
  async geocodeAddress(address) {
    // TODO: Implement geocoding using Google Maps API or similar
    // This can be used to get lat/long coordinates from address
    return null;
  }
}

module.exports = new LocationService();
