// Twilio-specific configuration - credentials and phone numbers

module.exports = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  
  // Webhook URLs (will be configured in Twilio console)
  webhooks: {
    voice: '/api/telephony/incoming-call',
    status: '/api/telephony/call-status'
  },
  
  // Voice settings
  voice: {
    defaultLanguage: 'hi-IN', // Hindi by default
    timeout: 10, // seconds to wait for user input
    maxSilence: 5 // seconds of silence before timeout
  }
};
