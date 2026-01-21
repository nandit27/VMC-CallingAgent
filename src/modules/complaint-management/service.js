// Complaint service - orchestrates all intelligence layers

const logger = require('../../utils/logger');
const { createComplaint } = require('../../types/complaint');
const translationService = require('../ai-understanding/translationService');
const complaintClassifier = require('../ai-understanding/complaintClassifier');
const smartLocationService = require('./smartLocationService');
const duplicateDetectionService = require('./duplicateDetectionService');
const urgencyClassificationService = require('./urgencyClassificationService');
const { findCategoryFromText } = require('../../data/categories');

/**
 * Process complaint through all intelligence layers
 * This is the main orchestration service that coordinates all processing steps
 */
const processComplaint = async (complaintData) => {
  const startTime = Date.now();
  
  try {
    logger.info('🔄 Starting complaint processing pipeline', {
      callSid: complaintData.callSid,
      language: complaintData.language
    });

    // Create base complaint object
    let complaint = createComplaint({
      callSid: complaintData.callSid,
      phoneNumber: complaintData.phoneNumber,
      originalText: complaintData.originalText,
      language: complaintData.language,
      recordingUrl: complaintData.recordingUrl,
      duration: complaintData.duration,
      confidence: complaintData.confidence
    });

    logger.info('✅ Step 0: Base complaint created', {
      complaintId: complaint.complaintId
    });

    // LAYER 1: Translation to English
    logger.info('🌐 Step 1: Translating to English...');
    const translation = await translationService.translateToEnglish(
      complaint.originalText,
      complaint.language
    );
    complaint.translatedText = translation.translatedText;
    complaint.translation = {
      originalLanguage: complaint.language,
      translatedText: translation.translatedText,
      translationUsed: translation.translationUsed,
      method: translation.method || 'google-translate'
    };
    
    logger.info('✅ Step 1 Complete: Translation', {
      translationUsed: translation.translationUsed,
      method: translation.method
    });

    // LAYER 2: Category Classification using ML Model
    logger.info('🏷️  Step 2: Classifying complaint category with ML...');
    const classificationResult = await complaintClassifier.classifyComplaint(
      complaint.translatedText,
      complaint.language
    );
    complaint.category = classificationResult.category.code;
    complaint.categoryInfo = {
      code: classificationResult.category.code,
      name: classificationResult.category.name,
      urgency: classificationResult.category.urgency,
      confidence: classificationResult.confidence,
      method: classificationResult.method,
      alternativePredictions: classificationResult.alternativePredictions || []
    };
    
    logger.info('✅ Step 2 Complete: Category', {
      category: complaint.category,
      categoryName: classificationResult.category.name,
      method: classificationResult.method,
      confidence: classificationResult.confidence
    });

    // LAYER 3: Location Extraction & Ward Mapping
    logger.info('📍 Step 3: Extracting location and mapping to ward...');
    const locationInfo = await smartLocationService.extractLocation(
      complaint.translatedText
    );
    complaint.location = {
      found: locationInfo.found,
      extractedText: locationInfo.location || '',
      landmark: locationInfo.location || '',
      wardNumber: locationInfo.wardNumber,
      wardName: locationInfo.wardName,
      zone: locationInfo.zone,
      coordinates: locationInfo.coordinates || null,
      confidence: locationInfo.confidence,
      matchType: locationInfo.matchType,
      alternativeMatches: locationInfo.alternativeMatches || []
    };
    
    logger.info('✅ Step 3 Complete: Location', {
      found: locationInfo.found,
      landmark: locationInfo.location,
      wardNumber: locationInfo.wardNumber,
      zone: locationInfo.zone,
      confidence: locationInfo.confidence
    });

    // LAYER 4: Duplicate Detection
    logger.info('🔍 Step 4: Checking for duplicates...');
    const duplicateCheck = await duplicateDetectionService.checkDuplicate(complaint);
    complaint.duplicateDetection = {
      isDuplicate: duplicateCheck.isDuplicate,
      duplicateOf: duplicateCheck.duplicateOf || null,
      similarityScore: duplicateCheck.similarityScore || 0,
      matchedComplaints: duplicateCheck.matchedComplaints || [],
      method: duplicateCheck.method || 'rule-based-similarity'
    };
    complaint.isDuplicate = duplicateCheck.isDuplicate;
    complaint.duplicateOf = duplicateCheck.duplicateOf;
    complaint.similarityScore = duplicateCheck.similarityScore;
    
    logger.info('✅ Step 4 Complete: Duplicate Check', {
      isDuplicate: complaint.isDuplicate,
      duplicateOf: complaint.duplicateOf,
      similarityScore: complaint.similarityScore
    });

    // LAYER 5: Urgency Classification
    logger.info('⚡ Step 5: Classifying urgency level...');
    const urgencyInfo = await urgencyClassificationService.classifyUrgency(
      complaint.translatedText,
      complaint.category
    );
    complaint.urgency = urgencyInfo.urgency;
    complaint.urgencyInfo = {
      level: urgencyInfo.urgency,
      score: urgencyInfo.score || 0,
      boosted: urgencyInfo.boosted || false,
      reasons: urgencyInfo.reasons || [],
      estimatedResponseTime: urgencyInfo.estimatedResponseTime || 'TBD'
    };
    
    logger.info('✅ Step 5 Complete: Urgency', {
      urgency: complaint.urgency,
      boosted: urgencyInfo.boosted,
      score: urgencyInfo.score
    });

    // Calculate total processing time
    const processingTime = Date.now() - startTime;
    complaint.processingTime = processingTime;

    // Set final complaint text
    complaint.complaint = complaint.translatedText;

    // Add to database (for duplicate detection in future)
    if (!complaint.isDuplicate) {
      duplicateDetectionService.addToDatabase(complaint);
    }

    logger.info('🎉 Complaint processing completed successfully', {
      complaintId: complaint.complaintId,
      category: complaint.category,
      urgency: complaint.urgency,
      isDuplicate: complaint.isDuplicate,
      processingTime: `${processingTime}ms`
    });

    return {
      success: true,
      complaint,
      processingTime
    };

  } catch (error) {
    logger.error('❌ Complaint processing failed', {
      error: error.message,
      stack: error.stack,
      callSid: complaintData.callSid
    });

    throw error;
  }
};

/**
 * Get complaint by ID
 */
const getComplaintById = async (complaintId) => {
  // TODO: Implement database lookup
  const complaints = duplicateDetectionService.getAllComplaints();
  return complaints.find(c => c.complaintId === complaintId);
};

/**
 * Get all complaints (for admin)
 */
const getAllComplaints = async (filters = {}) => {
  // TODO: Implement database query with filters
  return duplicateDetectionService.getAllComplaints();
};

/**
 * Update complaint status
 */
const updateComplaintStatus = async (complaintId, status, assignedTo = null) => {
  // TODO: Implement database update
  logger.info('Updating complaint status', {
    complaintId,
    status,
    assignedTo
  });
  
  return { success: true };
};

module.exports = {
  processComplaint,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus
};
