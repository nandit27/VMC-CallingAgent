// Audio preprocessing - format conversion and quality enhancement for STT

const logger = require('../../utils/logger');
const axios = require('axios');
const fs = require('fs').promises;
const { saveAudioFile } = require('../../utils/fileStorage');

/**
 * Supported audio formats by Whisper
 */
const SUPPORTED_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB - Whisper API limit

/**
 * Download audio file from URL (Twilio recording URL)
 * @param {string} recordingUrl - URL of the audio recording
 * @param {string} callSid - Call SID for tracking
 * @returns {Promise<string>} - Path to downloaded file
 */
const downloadAudioFromUrl = async (recordingUrl, callSid) => {
  try {
    logger.info('Downloading audio from URL', { recordingUrl, callSid });

    const response = await axios.get(recordingUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      // Twilio requires authentication for recording URLs
      auth: {
        username: process.env.TWILIO_ACCOUNT_SID,
        password: process.env.TWILIO_AUTH_TOKEN
      }
    });

    const buffer = Buffer.from(response.data);
    
    // Determine file extension from content-type
    const contentType = response.headers['content-type'];
    let extension = '.wav';
    
    if (contentType.includes('mpeg')) extension = '.mp3';
    else if (contentType.includes('mp4')) extension = '.mp4';
    else if (contentType.includes('wav')) extension = '.wav';
    else if (contentType.includes('webm')) extension = '.webm';

    const filePath = await saveAudioFile(callSid, buffer, extension);
    
    logger.info('Audio downloaded successfully', {
      callSid,
      filePath,
      size: buffer.length,
      contentType
    });

    return filePath;

  } catch (error) {
    logger.error('Failed to download audio', {
      error: error.message,
      recordingUrl,
      callSid
    });
    throw new Error(`Audio download failed: ${error.message}`);
  }
};

/**
 * Validate audio file
 * @param {string} filePath - Path to audio file
 */
const validateAudioFile = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    
    // Check file size
    if (stats.size === 0) {
      throw new Error('Audio file is empty');
    }
    
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error(`Audio file too large: ${stats.size} bytes (max ${MAX_FILE_SIZE})`);
    }
    
    // Check file extension
    const extension = filePath.split('.').pop().toLowerCase();
    if (!SUPPORTED_FORMATS.includes(extension)) {
      logger.warn('Unsupported audio format', { extension, filePath });
    }
    
    logger.info('Audio file validated', {
      filePath,
      size: stats.size,
      extension
    });
    
    return true;
    
  } catch (error) {
    logger.error('Audio validation failed', {
      error: error.message,
      filePath
    });
    throw error;
  }
};

/**
 * Process audio file - download, validate, and prepare for STT
 * @param {string} recordingUrl - URL or path to audio
 * @param {string} callSid - Call SID
 * @returns {Promise<string>} - Path to processed audio file
 */
const processAudio = async (recordingUrl, callSid) => {
  try {
    logger.info('Processing audio', { recordingUrl, callSid });
    
    let audioFilePath;
    
    // Check if it's a URL or local file path
    if (recordingUrl.startsWith('http://') || recordingUrl.startsWith('https://')) {
      // Download from URL
      audioFilePath = await downloadAudioFromUrl(recordingUrl, callSid);
    } else {
      // Local file path
      audioFilePath = recordingUrl;
    }
    
    // Validate the audio file
    await validateAudioFile(audioFilePath);
    
    return audioFilePath;
    
  } catch (error) {
    logger.error('Audio processing failed', {
      error: error.message,
      recordingUrl,
      callSid
    });
    throw error;
  }
};

/**
 * Get audio duration from file stats (approximate)
 * For accurate duration, would need audio analysis library like ffprobe
 */
const estimateAudioDuration = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    // Rough estimate: assuming 16kbps average bitrate for speech
    const durationSeconds = stats.size / (16 * 1024 / 8);
    return Math.round(durationSeconds * 10) / 10;
  } catch (error) {
    logger.warn('Could not estimate audio duration', { error: error.message });
    return null;
  }
};

module.exports = {
  downloadAudioFromUrl,
  validateAudioFile,
  processAudio,
  estimateAudioDuration,
  SUPPORTED_FORMATS,
  MAX_FILE_SIZE
};
