// Call state constants - all possible call flow states and transitions

/**
 * Defines all possible states in the call flow lifecycle
 */
const CALL_STATES = {
  // Initial state when call is received
  INITIATED: 'initiated',
  
  // Language selection states
  LANGUAGE_SELECTION: 'language_selection',
  LANGUAGE_CONFIRMED: 'language_confirmed',
  
  // Complaint gathering states
  COLLECTING_COMPLAINT: 'collecting_complaint',
  COMPLAINT_RECEIVED: 'complaint_received',
  
  // Processing states
  PROCESSING: 'processing',
  CLARIFICATION_NEEDED: 'clarification_needed',
  
  // Confirmation states
  CONFIRMING_DETAILS: 'confirming_details',
  CONFIRMED: 'confirmed',
  
  // Terminal states
  COMPLETED: 'completed',
  FAILED: 'failed',
  ENDED: 'ended'
};

/**
 * Valid state transitions
 */
const STATE_TRANSITIONS = {
  [CALL_STATES.INITIATED]: [CALL_STATES.LANGUAGE_SELECTION],
  [CALL_STATES.LANGUAGE_SELECTION]: [CALL_STATES.LANGUAGE_CONFIRMED, CALL_STATES.LANGUAGE_SELECTION],
  [CALL_STATES.LANGUAGE_CONFIRMED]: [CALL_STATES.COLLECTING_COMPLAINT],
  [CALL_STATES.COLLECTING_COMPLAINT]: [CALL_STATES.COMPLAINT_RECEIVED, CALL_STATES.COLLECTING_COMPLAINT],
  [CALL_STATES.COMPLAINT_RECEIVED]: [CALL_STATES.PROCESSING],
  [CALL_STATES.PROCESSING]: [CALL_STATES.CONFIRMING_DETAILS, CALL_STATES.CLARIFICATION_NEEDED, CALL_STATES.FAILED],
  [CALL_STATES.CLARIFICATION_NEEDED]: [CALL_STATES.COLLECTING_COMPLAINT],
  [CALL_STATES.CONFIRMING_DETAILS]: [CALL_STATES.CONFIRMED, CALL_STATES.COLLECTING_COMPLAINT],
  [CALL_STATES.CONFIRMED]: [CALL_STATES.COMPLETED],
  [CALL_STATES.COMPLETED]: [CALL_STATES.ENDED],
  [CALL_STATES.FAILED]: [CALL_STATES.ENDED]
};

module.exports = {
  CALL_STATES,
  STATE_TRANSITIONS
};
