// Duplicate complaint detection service

const logger = require('../../utils/logger');

/**
 * Detect if a complaint is duplicate using rule-based and similarity checking
 */
class DuplicateDetectionService {
  constructor() {
    // In-memory storage for demo (replace with actual database)
    this.complaintDatabase = [];
    this.SIMILARITY_THRESHOLD = 75; // 75% similarity threshold
  }

  /**
   * Check if complaint is duplicate
   * @param {object} newComplaint - New complaint to check
   * @returns {Promise<object>} Duplicate detection result
   */
  async checkDuplicate(newComplaint) {
    try {
      logger.info('Starting duplicate detection', {
        wardNumber: newComplaint.location?.wardNumber,
        zone: newComplaint.location?.zone,
        category: newComplaint.category,
        existingComplaints: this.complaintDatabase.length
      });

      // If no complaints in database, cannot be duplicate
      if (this.complaintDatabase.length === 0) {
        logger.info('No complaints in database - not a duplicate');
        return {
          isDuplicate: false,
          duplicateOf: null,
          similarityScore: 0,
          matchedComplaint: null
        };
      }

      // Step 1: Rule-based filtering
      const candidates = this.filterByRules(newComplaint);

      if (candidates.length === 0) {
        logger.info('No duplicate candidates found (rule-based)');
        return {
          isDuplicate: false,
          duplicateOf: null,
          similarityScore: 0,
          matchedComplaint: null
        };
      }

      logger.info('Found duplicate candidates', {
        count: candidates.length
      });

      // Step 2: Calculate similarity scores
      const scoredCandidates = candidates.map(candidate => ({
        complaint: candidate,
        score: this.calculateSimilarity(
          newComplaint.translatedText || newComplaint.originalText,
          candidate.translatedText || candidate.originalText
        )
      }));

      // Sort by similarity score
      scoredCandidates.sort((a, b) => b.score - a.score);

      const bestMatch = scoredCandidates[0];

      // Step 3: Check if similarity exceeds threshold
      if (bestMatch.score >= this.SIMILARITY_THRESHOLD) {
        logger.warn('Duplicate complaint detected', {
          duplicateOf: bestMatch.complaint.complaintId,
          similarityScore: bestMatch.score,
          ward: newComplaint.location?.wardNumber,
          zone: newComplaint.location?.zone
        });

        return {
          isDuplicate: true,
          duplicateOf: bestMatch.complaint.complaintId,
          similarityScore: bestMatch.score,
          matchedComplaint: bestMatch.complaint
        };
      }

      logger.info('No duplicate found (below similarity threshold)', {
        highestScore: bestMatch.score
      });

      return {
        isDuplicate: false,
        duplicateOf: null,
        similarityScore: bestMatch.score,
        matchedComplaint: null
      };

    } catch (error) {
      logger.error('Duplicate detection failed', {
        error: error.message,
        stack: error.stack
      });

      // Return as non-duplicate if check fails
      return {
        isDuplicate: false,
        duplicateOf: null,
        similarityScore: 0,
        matchedComplaint: null,
        error: error.message
      };
    }
  }

  /**
   * Rule-based filtering to find candidate duplicates
   * Rules: Same ward number AND same zone AND same location/landmark
   */
  filterByRules(newComplaint) {
    const candidates = this.complaintDatabase.filter(existing => {
      // Rule 1: Must be in same ward
      if (existing.location?.wardNumber !== newComplaint.location?.wardNumber) {
        return false;
      }

      // Rule 2: Must be in same zone
      if (existing.location?.zone !== newComplaint.location?.zone) {
        return false;
      }

      // Rule 3: Must have same landmark or location
      if (existing.location?.landmark && newComplaint.location?.landmark) {
        if (existing.location.landmark !== newComplaint.location.landmark) {
          return false;
        }
      }

      // Rule 4: Must be same category (optional, but helps reduce false positives)
      if (existing.category && newComplaint.category) {
        if (existing.category !== newComplaint.category) {
          return false;
        }
      }

      // Rule 5: Must be recent (within last 7 days)
      const daysDiff = this.getDaysDifference(
        existing.timestamp,
        newComplaint.timestamp || new Date()
      );
      if (daysDiff > 7) {
        return false;
      }

      // Rule 6: Must not be already resolved
      if (existing.status === 'resolved' || existing.status === 'closed') {
        return false;
      }

      return true;
    });

    return candidates;
  }

  /**
   * Calculate similarity score between two texts
   * Uses Levenshtein distance-based similarity
   */
  calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;

    const normalized1 = text1.toLowerCase().trim();
    const normalized2 = text2.toLowerCase().trim();

    // If texts are identical
    if (normalized1 === normalized2) return 100;

    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);
    
    // Convert distance to similarity percentage
    const similarity = ((maxLength - distance) / maxLength) * 100;

    return Math.round(similarity * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(str1, str2) {
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
  }

  /**
   * Get difference in days between two dates
   */
  getDaysDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Add complaint to database (for testing)
   * In production, this would be handled by the actual database service
   */
  addToDatabase(complaint) {
    this.complaintDatabase.push(complaint);
    logger.debug('Complaint added to database', {
      complaintId: complaint.complaintId,
      totalComplaints: this.complaintDatabase.length
    });
  }

  /**
   * Clear database (for testing)
   */
  clearDatabase() {
    this.complaintDatabase = [];
  }

  /**
   * Get all complaints (for testing)
   */
  getAllComplaints() {
    return this.complaintDatabase;
  }
}

module.exports = new DuplicateDetectionService();
