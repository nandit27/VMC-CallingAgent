// Speech-to-text service - Google Cloud Speech-to-Text API integration

const speech = require('@google-cloud/speech');
const fs = require('fs');
const logger = require('../../utils/logger');

// Initialize Google Cloud Speech client
let speechClient = null;

const initializeClient = () => {
  if (speechClient) return speechClient;
  
  try {
    // Check if credentials are provided
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      speechClient = new speech.SpeechClient();
      logger.info('Google Cloud Speech client initialized');
    } else {
      logger.warn('GOOGLE_APPLICATION_CREDENTIALS not set - will use mock transcription');
    }
  } catch (error) {
    logger.error('Failed to initialize Google Cloud Speech client', { error: error.message });
  }
  
  return speechClient;
};

/**
 * Transcribe audio file using Google Cloud Speech-to-Text API
 * FREE TIER: 60 minutes per month
 * @param {string} audioFilePath - Path to the audio file
 * @param {string} language - Language code (hi-IN, en-US, gu-IN)
 * @returns {Promise<{text: string, language: string}>}
 */
const transcribeAudio = async (audioFilePath, language = 'hi-IN') => {
  try {
    logger.info('Starting audio transcription', { 
      audioFilePath, 
      language 
    });

    const client = initializeClient();
    
    if (!client) {
      throw new Error('Google Cloud Speech client not initialized');
    }

    // Read the audio file
    const audioBytes = fs.readFileSync(audioFilePath).toString('base64');

    // Configure request
    const request = {
      audio: {
        content: audioBytes,
      },
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 8000, // Twilio default
        languageCode: language,
        alternativeLanguageCodes: ['hi-IN', 'en-US', 'gu-IN'],
        enableAutomaticPunctuation: true,
        model: 'default',
        useEnhanced: false // Set to false for free tier
      },
    };

    // Detects speech in the audio file
    const [response] = await client.recognize(request);
    
    if (!response.results || response.results.length === 0) {
      throw new Error('No transcription results returned');
    }

    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    const confidence = response.results[0].alternatives[0].confidence || 0;

    logger.info('Transcription completed', {
      textLength: transcription.length,
      confidence,
      detectedLanguage: language
    });

    return {
      text: transcription.trim(),
      language: language,
      confidence,
      duration: null // Google doesn't return duration in this API
    };

  } catch (error) {
    logger.error('Transcription failed', {
      error: error.message,
      audioFilePath,
      stack: error.stack
    });

    if (error.code === 3) {
      throw new Error('Invalid audio format');
    } else if (error.code === 7) {
      throw new Error('Authentication failed - check GOOGLE_APPLICATION_CREDENTIALS');
    } else if (error.code === 8) {
      throw new Error('Quota exceeded - free tier limit reached');
    }

    throw new Error(`Transcription failed: ${error.message}`);
  }
};

/**
 * Transcribe audio with retry logic
 * @param {string} audioFilePath - Path to the audio file
 * @param {string} language - Language code
 * @param {number} maxRetries - Maximum retry attempts
 */
const transcribeWithRetry = async (audioFilePath, language = 'hi-IN', maxRetries = 2) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      return await transcribeAudio(audioFilePath, language);
    } catch (error) {
      lastError = error;
      
      if (attempt <= maxRetries && !error.message.includes('Quota exceeded')) {
        const delay = attempt * 1000;
        logger.warn(`Transcription attempt ${attempt} failed, retrying in ${delay}ms`, {
          error: error.message
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }
  
  throw lastError;
};

/**
 * Mock transcription for testing (when credentials not available)
 */
const mockTranscription = async (audioFilePath, language = 'hi-IN') => {
  logger.warn('Using mock transcription - configure GOOGLE_APPLICATION_CREDENTIALS for real STT');
  
  console.log('\n⚠️  MOCK MODE: Using sample transcription');
  console.log('💡 For real transcription, configure Google Cloud credentials\n');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const mockTexts = {
    'hi-IN': 'मेरे इलाके में सड़क पर गड्ढा है कृपया इसे ठीक करें',
    'en-US': 'There is a pothole on the road in my area please fix it',
    'gu-IN': 'મારા વિસ્તારમાં રસ્તા પર ખાડો છે કૃપા કરીને તેને ઠીક કરો'
  };
  
  return {
    text: mockTexts[language] || mockTexts['hi-IN'],
    language: language,
    confidence: 0.95,
    duration: 5.2,
    mock: true
  };
};

module.exports = {
  transcribeAudio,
  transcribeWithRetry,
  mockTranscription
};
