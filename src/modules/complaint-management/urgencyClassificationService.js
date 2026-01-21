// Urgency classification service

const logger = require('../../utils/logger');
const { findCategoryFromText, getUrgencyForCategory } = require('../../data/categories');

/**
 * Classify complaint urgency level
 */
class UrgencyClassificationService {
  /**
   * Classify urgency level of complaint
   * @param {string} text - Complaint text (English)
   * @param {string} category - Complaint category (if already determined)
   * @returns {Promise<object>} Urgency classification result
   */
  async classifyUrgency(text, category = null) {
    try {
      logger.info('Starting urgency classification', {
        textLength: text.length,
        providedCategory: category
      });

      let urgencyLevel;
      let determinedCategory;

      // If category is provided, use it to determine urgency
      if (category) {
        urgencyLevel = getUrgencyForCategory(category);
        determinedCategory = category;
      } else {
        // Find category from text and then get urgency
        const categoryInfo = findCategoryFromText(text);
        determinedCategory = categoryInfo.code;
        urgencyLevel = categoryInfo.urgency;
      }

      // Additional urgency boost based on keywords
      const urgencyBoost = this.checkUrgencyKeywords(text);
      if (urgencyBoost) {
        urgencyLevel = this.boostUrgency(urgencyLevel);
        logger.info('Urgency boosted due to keywords', {
          original: urgencyLevel,
          boosted: urgencyBoost
        });
      }

      logger.info('Urgency classification completed', {
        category: determinedCategory,
        urgency: urgencyLevel
      });

      return {
        urgency: urgencyLevel,
        category: determinedCategory,
        boosted: !!urgencyBoost,
        confidence: 'high'
      };

    } catch (error) {
      logger.error('Urgency classification failed', {
        error: error.message,
        stack: error.stack
      });

      // Default to medium urgency if classification fails
      return {
        urgency: 'medium',
        category: category || 'OTHER',
        boosted: false,
        confidence: 'low',
        error: error.message
      };
    }
  }

  /**
   * Check for urgent keywords in text that should boost urgency
   */
  checkUrgencyKeywords(text) {
    const normalized = text.toLowerCase();

    const urgentKeywords = [
      // English
      'emergency', 'urgent', 'critical', 'immediate', 'danger', 'health risk',
      'accident', 'injury', 'flooding', 'fire', 'broken pipe', 'burst',
      
      // Hindi
      'आपातकाल', 'तुरंत', 'खतरा', 'दुर्घटना', 'चोट', 'बाढ़',
      
      // Gujarati  
      'કટોકટી', 'તાત્કાલિક', 'ખતરો', 'અકસ્માત'
    ];

    return urgentKeywords.some(keyword => normalized.includes(keyword));
  }

  /**
   * Boost urgency level by one step
   */
  boostUrgency(currentLevel) {
    const hierarchy = ['low', 'medium', 'high', 'urgent'];
    const currentIndex = hierarchy.indexOf(currentLevel);
    
    if (currentIndex < hierarchy.length - 1) {
      return hierarchy[currentIndex + 1];
    }
    
    return currentLevel; // Already at highest
  }

  /**
   * Get urgency priority score (for sorting)
   */
  getUrgencyScore(urgency) {
    const scores = {
      'urgent': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    };
    return scores[urgency] || 2;
  }

  /**
   * Get urgency display information
   */
  getUrgencyDisplay(urgency) {
    const displays = {
      'urgent': {
        label: 'Urgent',
        color: '#FF0000',
        emoji: '🚨',
        sla: '2 hours'
      },
      'high': {
        label: 'High Priority',
        color: '#FF6600',
        emoji: '⚠️',
        sla: '24 hours'
      },
      'medium': {
        label: 'Medium Priority',
        color: '#FFA500',
        emoji: '📋',
        sla: '3 days'
      },
      'low': {
        label: 'Low Priority',
        color: '#00AA00',
        emoji: '✅',
        sla: '7 days'
      }
    };
    
    return displays[urgency] || displays.medium;
  }
}

module.exports = new UrgencyClassificationService();
