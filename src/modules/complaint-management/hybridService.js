// Hybrid Complaint Processing Service
// Uses Python for processing and Node.js for DB storage

const logger = require('../../utils/logger');
const { createComplaint } = require('../../types/complaint');
const pythonApiClient = require('../../integrations/python-api/client');
const complaintStorageService = require('../../services/complaintStorageService');

/**
 * Process complaint through Python API and save to MongoDB
 * This is the main orchestration service for the hybrid architecture
 */
const processComplaint = async (complaintData) => {
  const startTime = Date.now();
  
  try {
    logger.info('🔄 Starting hybrid complaint processing pipeline', {
      callSid: complaintData.callSid,
      language: complaintData.language,
      architecture: 'Node.js (telephony) -> Python (processing) -> Node.js (storage)'
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

    // ============================================================
    // PYTHON PROCESSING: Send to Python API for all processing
    // ============================================================
    
    logger.info('🐍 Calling Python API for complete processing...');
    
    const pythonResult = await pythonApiClient.processComplaint({
      text: complaint.originalText,
      language: complaint.language,
      phoneNumber: complaint.phoneNumber,
      callSid: complaint.callSid
    });

    logger.info('✅ Python processing complete', {
      hasTranslation: !!pythonResult.translation,
      category: pythonResult.classification?.category?.code,
      locationFound: pythonResult.location?.found
    });

    // ============================================================
    // MAP PYTHON RESULTS TO COMPLAINT OBJECT
    // ============================================================

    // Translation
    if (pythonResult.translation) {
      complaint.translatedText = pythonResult.translation.translated_text;
      complaint.translation = {
        originalLanguage: complaint.language,
        translatedText: pythonResult.translation.translated_text,
        translationUsed: pythonResult.translation.translation_used,
        method: pythonResult.translation.method
      };
    } else {
      complaint.translatedText = complaint.originalText;
      complaint.translation = {
        originalLanguage: complaint.language,
        translatedText: complaint.originalText,
        translationUsed: false,
        method: 'none'
      };
    }

    // Category Classification
    if (pythonResult.classification) {
      complaint.category = pythonResult.classification.category.code;
      complaint.categoryInfo = {
        code: pythonResult.classification.category.code,
        name: pythonResult.classification.category.name,
        urgency: pythonResult.classification.category.urgency,
        confidence: pythonResult.classification.confidence,
        method: pythonResult.classification.method,
        alternativePredictions: pythonResult.classification.alternative_predictions || []
      };
    }

    // Location
    if (pythonResult.location) {
      complaint.location = {
        found: pythonResult.location.found,
        extractedText: pythonResult.location.location || '',
        landmark: pythonResult.location.location || '',
        wardNumber: pythonResult.location.wardNumber,
        wardName: pythonResult.location.wardName,
        zone: pythonResult.location.zone,
        areaId: pythonResult.location.areaId,
        areaName: pythonResult.location.areaName,
        coordinates: pythonResult.location.coordinates || null,
        confidence: pythonResult.location.confidence,
        matchType: pythonResult.location.matchType,
        alternativeMatches: pythonResult.location.alternativeMatches || []
      };
    }

    // Urgency (placeholder from Python)
    if (pythonResult.urgency) {
      complaint.urgency = {
        level: pythonResult.urgency.urgency_level,
        score: pythonResult.urgency.urgency_score,
        factors: pythonResult.urgency.factors || [],
        escalate: pythonResult.urgency.escalate || false,
        method: pythonResult.urgency.method
      };
    }

    // Duplicate Detection (placeholder from Python)
    if (pythonResult.duplicate) {
      complaint.duplicate = {
        isDuplicate: pythonResult.duplicate.is_duplicate,
        duplicateOf: pythonResult.duplicate.duplicate_of,
        similarityScore: pythonResult.duplicate.similarity_score,
        reason: pythonResult.duplicate.reason,
        method: pythonResult.duplicate.method
      };
    }

    // Processing metadata
    const processingTime = Date.now() - startTime;
    complaint.processingTime = processingTime;
    complaint.processingSteps = [
      'python-translation',
      'python-classification',
      'python-location-resolution',
      'python-urgency-classification',
      'python-duplicate-detection'
    ];

    logger.info('✅ All processing steps completed', {
      complaintId: complaint.complaintId,
      processingTime: `${processingTime}ms`
    });

    // ============================================================
    // SAVE TO MONGODB (Node.js)
    // ============================================================

    logger.info('💾 Saving complaint to MongoDB...');
    
    const savedComplaint = await complaintStorageService.saveComplaint(complaint);

    logger.info('✅ Complaint processing and storage complete', {
      complaintId: complaint.complaintId,
      mongoId: savedComplaint._id,
      totalTime: `${processingTime}ms`
    });

    // Return final complaint with all processing results
    return {
      ...complaint,
      _id: savedComplaint._id,
      saved: true
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error('❌ Complaint processing failed', {
      callSid: complaintData.callSid,
      error: error.message,
      stack: error.stack,
      processingTime: `${processingTime}ms`
    });

    throw error;
  }
};

/**
 * Get complaint by ID
 */
const getComplaintById = async (complaintId) => {
  try {
    const complaintRepository = require('../../db/complaintRepository');
    return await complaintRepository.findById(complaintId);
  } catch (error) {
    logger.error('Failed to get complaint', {
      complaintId,
      error: error.message
    });
    throw error;
  }
};

/**
 * Get recent complaints by phone number
 */
const getRecentComplaintsByPhone = async (phoneNumber, limit = 5) => {
  try {
    return await complaintStorageService.findRecentComplaintsByPhone(phoneNumber, limit);
  } catch (error) {
    logger.error('Failed to get recent complaints', {
      phoneNumber,
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  processComplaint,
  getComplaintById,
  getRecentComplaintsByPhone
};
