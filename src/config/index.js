// Central configuration loader - exports all environment variables and app settings

const twilio = require('./twilio');
const aiServices = require('./ai-services');
const municipal = require('./municipal');
const mongodb = require('./mongodb');
const pythonApi = require('./python-api');

module.exports = {
  twilio,
  aiServices,
  municipal,
  mongodb,
  pythonApi,
  
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  }
};
