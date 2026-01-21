/**
 * ML-based Complaint Classification Service
 * Uses keyword-based classification with ML-ready structure
 * Vadodara Municipal Corporation
 * 
 * Note: The XLMRoberta model in /my_complaint_model/ needs to be converted to ONNX format
 * for transformers.js. For now, using enhanced keyword-based classification.
 */

const logger = require('../../utils/logger');
const { COMPLAINT_CATEGORIES, findCategoryFromText } = require('../../data/categories');

// Model information
const MODEL_INFO = {
  loaded: false,
  modelType: 'keyword-based-enhanced',
  modelPath: '/my_complaint_model/',
  note: 'XLMRoberta model needs ONNX conversion for transformers.js'
};

/**
 * Classify complaint using enhanced keyword matching
 * @param {string} text - Complaint text (preferably in English)
 * @returns {Promise<Object>} Classification result with category and confidence
 */
const classifyComplaint = async (text) => {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error('Empty text provided for classification');
    }

    logger.info('Classifying complaint with keyword method', {
      textLength: text.length
    });

    // Use keyword-based classification
    const category = findCategoryFromText(text);
    
    // Calculate confidence based on keyword matches
    const normalized = text.toLowerCase();
    const matchedKeywords = category.keywords.filter(keyword => 
      normalized.includes(keyword.toLowerCase())
    );
    
    const confidence = matchedKeywords.length > 0 
      ? Math.min(0.7 + (matchedKeywords.length * 0.1), 0.95)
      : 0.5;

    logger.info('Complaint classified successfully', {
      category: category.code,
      confidence,
      matchedKeywords: matchedKeywords.length
    });

    return {
      success: true,
      category: {
        code: category.code,
        name: category.name,
        urgency: category.urgency
      },
      confidence,
      alternativePredictions: [],
      modelUsed: 'keyword-based-enhanced',
      matchedKeywords
    };

  } catch (error) {
    logger.error('Classification failed', {
      error: error.message,
      stack: error.stack
    });

    return {
      success: false,
      error: error.message,
      fallbackToKeyword: true
    };
  }
};

/**
 * Get model status and information
 */
const getModelInfo = () => {
  return {
    loaded: MODEL_INFO.loaded,
    modelType: MODEL_INFO.modelType,
    totalLabels: 34,
    vmcCategories: Object.values(COMPLAINT_CATEGORIES).length,
    mappedCategories: 34,
    modelPath: MODEL_INFO.modelPath,
    note: MODEL_INFO.note
  };
};

/**
 * Preload model at startup (no-op for keyword-based)
 */
const preloadModel = async () => {
  logger.info('Using keyword-based classification (ML model available for future ONNX conversion)');
  MODEL_INFO.loaded = true;
  return true;
};

/**
 * Load model (no-op for keyword-based)
 */
const loadModel = async () => {
  MODEL_INFO.loaded = true;
  return true;
};

module.exports = {
  classifyComplaint,
  getModelInfo,
  preloadModel,
  loadModel
};
