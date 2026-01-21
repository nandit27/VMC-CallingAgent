// Main application entry point - bootstraps Express server and initializes middleware

// Load environment variables first
require('dotenv').config();

const app = require('./app');
const logger = require('./utils/logger');
const mlService = require('./modules/ai-understanding/mlClassificationService');
const wardLoader = require('./data/wardLocationLoader');

const PORT = process.env.PORT || 3000;

// Preload ML model (optional - speeds up first classification)
(async () => {
  try {
    console.log('🔄 Preloading ML classification model...');
    await mlService.preloadModel();
    console.log('✅ ML model preloaded successfully');
  } catch (error) {
    console.warn('⚠️  ML model preload failed - will load on first use');
  }
})();

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Municipal Call Center server started`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
  
  logger.info(`Webhook URL: http://localhost:${PORT}/api/telephony/incoming-call`);
  
  // Display status
  const hasGoogleCreds = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const wardStats = wardLoader.getWardStats();
  const modelInfo = mlService.getModelInfo();
  
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SERVER STARTED SUCCESSFULLY');
  console.log('='.repeat(60));
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 Webhook: http://localhost:${PORT}/api/telephony/incoming-call`);
  console.log('');
  console.log('🔧 INTELLIGENCE LAYERS:');
  console.log(`   1️⃣  Translation: ${hasGoogleCreds ? 'Google Cloud ✅' : 'Google Cloud (No Creds) ⚠️'}`);
  console.log(`   2️⃣  Classification: ML Model (${modelInfo.loaded ? 'Loaded ✅' : 'Not Loaded ⏳'})`);
  console.log(`   3️⃣  Location: Ward-based fuzzy matching ✅`);
  console.log(`   4️⃣  Duplicate: Rule-based + Similarity ✅`);
  console.log(`   5️⃣  Urgency: Category-based + Keywords ✅`);
  console.log('');
  console.log('📊 DATA LOADED:');
  console.log(`   🏘️  Wards: ${wardStats.totalWards} wards`);
  console.log(`   📍 Locations: ${wardStats.totalLocations} locations`);
  console.log(`   🏷️  Categories: ${modelInfo.vmcCategories} VMC categories`);
  console.log(`   🤖 Model Labels: ${modelInfo.totalLabels} labels mapped`);
  console.log('');
  console.log(`🎤 Speech-to-Text: ${hasGoogleCreds ? 'Google Cloud ✅' : 'Not Configured ⚠️'}`);
  if (!hasGoogleCreds) {
    console.log('   💡 Set GOOGLE_APPLICATION_CREDENTIALS in .env for STT');
  }
  console.log('');
  console.log('🔗 Use ngrok to expose: ngrok http ' + PORT);
  console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = server;
