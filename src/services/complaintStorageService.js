// Complaint storage service - handles saving processed complaints to MongoDB

const complaintRepository = require('../db/complaintRepository');
const logger = require('../utils/logger');

class ComplaintStorageService {
  /**
   * Save processed complaint to database
   */
  async saveComplaint(complaint) {
    try {
      logger.info('💾 Saving complaint to database', {
        complaintId: complaint.complaintId,
        category: complaint.category,
        wardNumber: complaint.location?.wardNumber
      });

      // Prepare complaint document
      const complaintDocument = this._prepareComplaintDocument(complaint);

      // Save to database
      const savedComplaint = await complaintRepository.create(complaintDocument);

      logger.info('✅ Complaint saved successfully', {
        complaintId: complaint.complaintId,
        mongoId: savedComplaint._id
      });

      return savedComplaint;
    } catch (error) {
      logger.error('❌ Failed to save complaint', {
        complaintId: complaint.complaintId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Prepare complaint document for database storage
   */
  _prepareComplaintDocument(complaint) {
    return {
      // Basic Info
      complaintId: complaint.complaintId,
      callSid: complaint.callSid,
      phoneNumber: complaint.phoneNumber,
      timestamp: complaint.timestamp,
      
      // Original Complaint
      originalText: complaint.originalText,
      language: complaint.language,
      translatedText: complaint.translatedText,
      
      // Translation Info
      translation: {
        originalLanguage: complaint.translation?.originalLanguage || complaint.language,
        translatedText: complaint.translation?.translatedText || complaint.translatedText,
        translationUsed: complaint.translation?.translationUsed || false,
        method: complaint.translation?.method || 'none'
      },
      
      // Category Classification
      category: complaint.category,
      categoryInfo: {
        code: complaint.categoryInfo?.code || complaint.category,
        name: complaint.categoryInfo?.name || '',
        urgency: complaint.categoryInfo?.urgency || 'medium',
        confidence: complaint.categoryInfo?.confidence || 0,
        method: complaint.categoryInfo?.method || 'unknown',
        alternativePredictions: complaint.categoryInfo?.alternativePredictions || []
      },
      
      // Location
      location: {
        found: complaint.location?.found || false,
        extractedText: complaint.location?.extractedText || '',
        landmark: complaint.location?.landmark || '',
        wardNumber: complaint.location?.wardNumber || null,
        wardName: complaint.location?.wardName || '',
        zone: complaint.location?.zone || '',
        areaId: complaint.location?.areaId || null,
        areaName: complaint.location?.areaName || '',
        coordinates: complaint.location?.coordinates || null,
        confidence: complaint.location?.confidence || 0,
        matchType: complaint.location?.matchType || 'none',
        alternativeMatches: complaint.location?.alternativeMatches || []
      },
      
      // Urgency (placeholder - will be enhanced by teammate)
      urgency: {
        level: complaint.urgency?.level || complaint.categoryInfo?.urgency || 'medium',
        score: complaint.urgency?.score || 0.5,
        factors: complaint.urgency?.factors || [],
        escalate: complaint.urgency?.escalate || false,
        method: complaint.urgency?.method || 'placeholder'
      },
      
      // Duplicate Detection (placeholder - will be enhanced by teammate)
      duplicate: {
        isDuplicate: complaint.duplicate?.isDuplicate || false,
        duplicateOf: complaint.duplicate?.duplicateOf || null,
        similarityScore: complaint.duplicate?.similarityScore || 0,
        reason: complaint.duplicate?.reason || 'Not checked',
        method: complaint.duplicate?.method || 'placeholder'
      },
      
      // Call Recording
      recording: {
        url: complaint.recordingUrl || '',
        duration: complaint.duration || 0
      },
      
      // Confidence Scores
      confidence: {
        overall: complaint.confidence || 0,
        translation: complaint.translation?.confidence || 1.0,
        classification: complaint.categoryInfo?.confidence || 0,
        location: complaint.location?.confidence || 0
      },
      
      // Processing Metadata
      processing: {
        totalTime: complaint.processingTime || 0,
        steps: complaint.processingSteps || [],
        errors: complaint.processingErrors || []
      },
      
      // Status
      status: complaint.status || 'pending',
      
      // Timestamps
      createdAt: new Date(complaint.timestamp),
      updatedAt: new Date()
    };
  }

  /**
   * Find recent complaints by phone number
   */
  async findRecentComplaintsByPhone(phoneNumber, limit = 5) {
    try {
      return await complaintRepository.findByPhoneNumber(phoneNumber, limit);
    } catch (error) {
      logger.error('Failed to find recent complaints', {
        phoneNumber,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Find similar complaints for duplicate detection
   */
  async findSimilarComplaints(category, wardNumber, hours = 24) {
    try {
      return await complaintRepository.findRecentSimilar(category, wardNumber, hours);
    } catch (error) {
      logger.error('Failed to find similar complaints', {
        category,
        wardNumber,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Update complaint status
   */
  async updateComplaintStatus(complaintId, status, updates = {}) {
    try {
      logger.info('Updating complaint status', {
        complaintId,
        status
      });

      const result = await complaintRepository.updateStatus(complaintId, status, updates);

      if (result) {
        logger.info('✅ Complaint status updated', {
          complaintId,
          status
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to update complaint status', {
        complaintId,
        status,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new ComplaintStorageService();
