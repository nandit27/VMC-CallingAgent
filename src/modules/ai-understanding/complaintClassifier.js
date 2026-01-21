/**
 * Complaint Classifier
 * Uses ML model for classification with keyword-based fallback
 * Vadodara Municipal Corporation
 */

const logger = require('../../utils/logger');
const mlService = require('./mlClassificationService');
const { findCategoryFromText, COMPLAINT_CATEGORIES } = require('../../data/categories');

/**
 * Classify complaint using ML model (with keyword fallback)
 * @param {string} text - Complaint text (preferably in English)
 * @param {string} originalLanguage - Original language of complaint
 * @returns {Promise<Object>} Classification result
 */
const classifyComplaint = async (text, originalLanguage = 'unknown') => {
  try {
    logger.info('Classifying complaint', {
      textLength: text.length,
      originalLanguage
    });

    // First, try ML classification
    const mlResult = await mlService.classifyComplaint(text);

    if (mlResult.success) {
      logger.info('ML classification successful', {
        category: mlResult.category.code,
        confidence: mlResult.confidence
      });

      return {
        method: 'ml-model',
        category: mlResult.category,
        confidence: mlResult.confidence,
        alternativePredictions: mlResult.alternativePredictions,
        modelUsed: mlResult.modelUsed
      };
    }

    // Fallback to keyword-based classification
    logger.warn('ML classification failed, using keyword fallback', {
      error: mlResult.error
    });

    const category = findCategoryFromText(text);

    return {
      method: 'keyword-based',
      category: {
        code: category.code,
        name: category.name,
        urgency: category.urgency
      },
      confidence: 0.7, // Default confidence for keyword matching
      fallbackReason: mlResult.error || 'ML model unavailable'
    };

  } catch (error) {
    logger.error('Classification failed completely', {
      error: error.message,
      stack: error.stack
    });

    // Final fallback - return generic category
    return {
      method: 'fallback',
      category: {
        code: 'GENERAL',
        name: 'General Complaint',
        urgency: 'medium'
      },
      confidence: 0.5,
      error: error.message
    };
  }
};

/**
 * Get classification method details
 */
const getClassifierInfo = () => {
  const modelInfo = mlService.getModelInfo();
  
  return {
    primaryMethod: 'ml-model',
    fallbackMethod: 'keyword-based',
    modelInfo,
    totalCategories: Object.keys(COMPLAINT_CATEGORIES).length
  };
};

module.exports = {
  classifyComplaint,
  getClassifierInfo
};
