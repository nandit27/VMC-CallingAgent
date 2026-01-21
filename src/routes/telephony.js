// Telephony routes - Twilio webhook endpoints for call handling

const express = require('express');
const router = express.Router();
const validateTwilioRequest = require('../middleware/validateTwilioRequest');
const telephonyController = require('../modules/telephony/controller');

/**
 * POST /api/telephony/incoming-call
 * Webhook endpoint for incoming calls
 * This is what you'll configure in Twilio console as the Voice webhook URL
 */
router.post(
  '/incoming-call',
  validateTwilioRequest,
  telephonyController.handleIncomingCall
);

/**
 * POST /api/telephony/language-selection
 * Handles language selection via DTMF input
 */
router.post(
  '/language-selection',
  validateTwilioRequest,
  telephonyController.handleLanguageSelection
);

/**
 * POST /api/telephony/collect-complaint
 * Prompts user to record their complaint
 */
router.post(
  '/collect-complaint',
  validateTwilioRequest,
  telephonyController.collectComplaint
);

/**
 * POST /api/telephony/process-recording
 * Processes the recorded complaint
 */
router.post(
  '/process-recording',
  validateTwilioRequest,
  telephonyController.processRecording
);

/**
 * POST /api/telephony/confirm-complaint
 * Confirms complaint registration and speaks complaint ID
 */
router.post(
  '/confirm-complaint',
  validateTwilioRequest,
  telephonyController.confirmComplaint
);

/**
 * POST /api/telephony/call-status
 * Webhook endpoint for call status updates
 * Configure this as the Status Callback URL in Twilio
 */
router.post(
  '/call-status',
  validateTwilioRequest,
  telephonyController.handleCallStatus
);

module.exports = router;
