// Complaint data structure and validation

/**
 * Final complaint JSON structure
 * This represents the complete complaint after all processing layers
 */
const ComplaintSchema = {
  // Basic Information
  complaintId: String,        // Unique ID (generated)
  callSid: String,            // Twilio Call SID
  phoneNumber: String,        // Caller's mobile number
  timestamp: Date,            // When complaint was registered
  
  // Complaint Details
  originalText: String,       // Original transcribed text
  translatedText: String,     // English translation
  complaint: String,          // Final processed complaint text
  category: String,           // Categorized type (water, roads, garbage, etc.)
  
  // Location Information
  location: {
    extractedText: String,    // Location mentioned in complaint
    landmark: String,         // Matched landmark
    wardNumber: String,       // Ward number
    zone: String,             // Zone identifier
    coordinates: {            // Optional GPS coordinates
      latitude: Number,
      longitude: Number
    }
  },
  
  // Classification
  urgency: String,            // Urgent, High, Medium, Low
  isDuplicate: Boolean,       // Duplicate check result
  duplicateOf: String,        // If duplicate, original complaint ID
  similarityScore: Number,    // Similarity score (0-100)
  
  // Processing Metadata
  language: String,           // Detected language (hi, en, gu)
  confidence: Number,         // Transcription confidence
  processingTime: Number,     // Time taken to process (ms)
  
  // Status
  status: String,             // new, assigned, in-progress, resolved, closed
  assignedTo: String,         // Department/officer assigned
  
  // Audio
  recordingUrl: String,       // URL to audio recording
  duration: Number            // Recording duration in seconds
};

/**
 * Status constants
 */
const COMPLAINT_STATUS = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

/**
 * Urgency levels
 */
const URGENCY_LEVELS = {
  URGENT: 'urgent',      // Immediate attention required
  HIGH: 'high',          // Critical issues
  MEDIUM: 'medium',      // Standard complaints
  LOW: 'low'             // Non-critical issues
};

/**
 * Create a new complaint object with default values
 */
const createComplaint = (data) => {
  return {
    complaintId: data.complaintId || generateComplaintId(),
    callSid: data.callSid,
    phoneNumber: data.phoneNumber,
    timestamp: new Date(),
    
    originalText: data.originalText || '',
    translatedText: data.translatedText || '',
    complaint: data.complaint || '',
    category: data.category || 'uncategorized',
    
    location: {
      extractedText: data.location?.extractedText || '',
      landmark: data.location?.landmark || '',
      wardNumber: data.location?.wardNumber || '',
      zone: data.location?.zone || '',
      coordinates: data.location?.coordinates || null
    },
    
    urgency: data.urgency || URGENCY_LEVELS.MEDIUM,
    isDuplicate: data.isDuplicate || false,
    duplicateOf: data.duplicateOf || null,
    similarityScore: data.similarityScore || 0,
    
    language: data.language || 'en',
    confidence: data.confidence || 0,
    processingTime: data.processingTime || 0,
    
    status: COMPLAINT_STATUS.NEW,
    assignedTo: data.assignedTo || null,
    
    recordingUrl: data.recordingUrl || '',
    duration: data.duration || 0
  };
};

/**
 * Generate unique complaint ID
 * Format: YYYYMMDDHHmmss-XXXX (e.g., 20260120143055-A7B3)
 */
const generateComplaintId = () => {
  const now = new Date();
  const dateStr = now.toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '')
    .substring(0, 14);
  
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${dateStr}-${random}`;
};

/**
 * Validate complaint data
 */
const validateComplaint = (complaint) => {
  const errors = [];
  
  if (!complaint.originalText || complaint.originalText.trim().length === 0) {
    errors.push('Original text is required');
  }
  
  if (!complaint.phoneNumber) {
    errors.push('Phone number is required');
  }
  
  if (!complaint.callSid) {
    errors.push('Call SID is required');
  }
  
  if (!Object.values(URGENCY_LEVELS).includes(complaint.urgency)) {
    errors.push('Invalid urgency level');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  ComplaintSchema,
  COMPLAINT_STATUS,
  URGENCY_LEVELS,
  createComplaint,
  generateComplaintId,
  validateComplaint
};
