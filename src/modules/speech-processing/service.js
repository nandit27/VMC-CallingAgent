// Speech processing service - orchestrates transcription and language detection

const logger = require('../../utils/logger');
const audioProcessor = require('./audioProcessor');
const sttService = require('./sttService');
const languageDetector = require('./languageDetector');
const { deleteAudioFile } = require('../../utils/fileStorage');

/**
 * Process speech: download, transcribe, detect language
 * @param {string} recordingUrl - URL or path to audio recording
 * @param {string} callSid - Call SID for tracking
 * @param {Object} options - Processing options
 * @param {Object} options.expectedLanguage - Expected language object
 * @param {boolean} options.cleanupAudio - Delete audio file after processing
 * @returns {Promise<Object>} - {text, language, duration, confidence}
 */
const processSpeech = async (recordingUrl, callSid, options = {}) => {
  const {
    expectedLanguage = null,
    cleanupAudio = true
  } = options;

  let audioFilePath = null;

  try {
    logger.info('Starting speech processing', {
      recordingUrl,
      callSid,
      expectedLanguage: expectedLanguage?.code
    });

    // Step 1: Download and validate audio
    audioFilePath = await audioProcessor.processAudio(recordingUrl, callSid);

    // Step 2: Transcribe audio to text using Google Cloud STT
    const transcriptionResult = await sttService.transcribeWithRetry(
      audioFilePath,
      expectedLanguage?.googleCode || 'hi-IN'
    );

    const { text, language: detectedLanguageCode, confidence } = transcriptionResult;

    // Step 3: Detect language from transcribed text
    const detectedLanguage = languageDetector.detectLanguage(text, detectedLanguageCode);

    // Step 4: Verify language if expected language was provided
    if (expectedLanguage) {
      languageDetector.verifyLanguage(detectedLanguage, expectedLanguage);
    }

    const result = {
      text,
      language: detectedLanguage,
      duration: transcriptionResult.duration || null,
      confidence: confidence || (text.length > 10 ? 'high' : 'low'),
      method: 'google-cloud-stt'
    };

    logger.info('Speech processing completed', {
      callSid,
      textLength: text.length,
      language: detectedLanguage.code,
      duration: result.duration,
      method: 'google-cloud-stt'
    });

    return result;

  } catch (error) {
    logger.error('Speech processing failed', {
      error: error.message,
      stack: error.stack,
      recordingUrl,
      callSid
    });
    throw error;

  } finally {
    // Cleanup audio file if requested
    if (cleanupAudio && audioFilePath) {
      try {
        await deleteAudioFile(audioFilePath);
      } catch (cleanupError) {
        logger.warn('Failed to cleanup audio file', {
          error: cleanupError.message,
          audioFilePath
        });
      }
    }
  }
};

/**
 * Process speech from Twilio recording URL
 * @param {string} recordingSid - Twilio Recording SID
 * @param {string} callSid - Call SID
 * @param {Object} expectedLanguage - Expected language
 */
const processTwilioRecording = async (recordingSid, callSid, expectedLanguage = null) => {
  try {
    // Construct Twilio recording URL
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Recordings/${recordingSid}.wav`;

    return await processSpeech(recordingUrl, callSid, {
      expectedLanguage,
      cleanupAudio: true
    });

  } catch (error) {
    logger.error('Failed to process Twilio recording', {
      error: error.message,
      recordingSid,
      callSid
    });
    throw error;
  }
};

module.exports = {
  processSpeech,
  processTwilioRecording
};
