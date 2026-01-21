// Twilio request validation - verifies webhook authenticity

const twilio = require('twilio');
const config = require('../config/twilio');
const logger = require('../utils/logger');

/**
 * Middleware to validate that incoming requests are actually from Twilio
 * Prevents unauthorized access to webhook endpoints
 */
const validateTwilioRequest = (req, res, next) => {
  // Skip validation in development if explicitly disabled
  if (process.env.SKIP_TWILIO_VALIDATION === 'true') {
    logger.warn('Twilio request validation skipped (development mode)');
    return next();
  }

  const twilioSignature = req.headers['x-twilio-signature'];
  
  if (!twilioSignature) {
    logger.error('Missing Twilio signature header');
    return res.status(403).json({ error: 'Forbidden - Invalid request' });
  }

  // Construct the full URL that Twilio used to make the request
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  const url = `${protocol}://${host}${req.originalUrl}`;

  // Validate the request came from Twilio
  const isValid = twilio.validateRequest(
    config.authToken,
    twilioSignature,
    url,
    req.body
  );

  if (!isValid) {
    logger.error('Invalid Twilio signature', { url, signature: twilioSignature });
    return res.status(403).json({ error: 'Forbidden - Invalid signature' });
  }

  logger.info('Twilio request validated successfully');
  next();
};

module.exports = validateTwilioRequest;
