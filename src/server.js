// Main application entry point - bootstraps Express server and initializes middleware

// Load environment variables first
require('dotenv').config();

const app = require('./app');
const logger = require('./utils/logger');
const mongoConnection = require('./db/connection');
const pythonApiClient = require('./integrations/python-api/client');

const PORT = process.env.PORT || 3000;

// Initialize connections and services
(async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoConnection.connect();
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.warn('⚠️  Server will start but database operations will fail');
  }

  try {
    // Check Python API health
    console.log('🔄 Checking Python API connection...');
    const pythonHealth = await pythonApiClient.healthCheck();
    if (pythonHealth.status === 'healthy') {
      console.log('✅ Python API is healthy');
    } else {
      console.warn('⚠️  Python API is not responding properly');
    }
  } catch (error) {
    console.warn('⚠️  Python API health check failed - make sure Python server is running');
    console.warn(`   Start Python API: cd fast_api && uvicorn app.main:app --reload`);
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
  const hasMongoDB = !!process.env.MONGODB_URI;
  const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
  
  console.log('\n' + '='.repeat(70));
  console.log('🚀 HYBRID ARCHITECTURE SERVER - STARTED SUCCESSFULLY');
  console.log('='.repeat(70));
  console.log(`📍 Node.js Port: ${PORT}`);
  console.log(`🐍 Python API: ${pythonApiUrl}`);
  console.log(`🌐 Webhook: http://localhost:${PORT}/api/telephony/incoming-call`);
  console.log('');
  console.log('🏗️  ARCHITECTURE:');
  console.log('   📞 Node.js  → Call Handling (Twilio)');
  console.log('   🐍 Python   → Processing (Translation, Classification, Location)');
  console.log('   💾 Node.js  → Database Storage (MongoDB)');
  console.log('');
  console.log('🔧 SERVICES STATUS:');
  console.log(`   🗄️  MongoDB: ${hasMongoDB ? 'Configured ✅' : 'Not Configured ⚠️'}`);
  console.log(`   🐍 Python API: Check logs above`);
  console.log(`   🎤 Google Cloud: ${hasGoogleCreds ? 'Configured ✅' : 'Not Configured ⚠️'}`);
  console.log('');
  console.log('🔄 PROCESSING PIPELINE:');
  console.log('   1️⃣  Translation       → Python API');
  console.log('   2️⃣  Classification    → Python API (ML Model)');
  console.log('   3️⃣  Location         → Python API (Fuzzy Matching)');
  console.log('   4️⃣  Urgency          → Python API (Placeholder)');
  console.log('   5️⃣  Duplicate Check  → Python API (Placeholder)');
  console.log('   6️⃣  Save to DB       → Node.js (MongoDB)');
  console.log('');
  console.log('💡 QUICK START:');
  console.log(`   • Start Python: cd fast_api && uvicorn app.main:app --reload`);
  console.log(`   • Expose webhook: ngrok http ${PORT}`);
  console.log(`   • Configure Twilio webhook with ngrok URL`);
  console.log('');
  console.log('='.repeat(70) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing connections');
  server.close(async () => {
    logger.info('HTTP server closed');
    await mongoConnection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing connections');
  server.close(async () => {
    logger.info('HTTP server closed');
    await mongoConnection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});

module.exports = server;
