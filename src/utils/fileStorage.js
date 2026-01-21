// File storage utility - handles recording file uploads and retrieval

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const logger = require('./logger');

const STORAGE_DIR = process.env.RECORDING_STORAGE_PATH || './recordings';

/**
 * Ensure storage directory exists
 */
const ensureStorageDir = async () => {
  try {
    await fs.access(STORAGE_DIR);
  } catch (error) {
    logger.info('Creating storage directory', { path: STORAGE_DIR });
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
};

/**
 * Generate unique filename
 */
const generateFilename = (callSid, extension = '.wav') => {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${callSid}_${timestamp}_${random}${extension}`;
};

/**
 * Save audio buffer to file
 */
const saveAudioFile = async (callSid, buffer, extension = '.wav') => {
  await ensureStorageDir();
  
  const filename = generateFilename(callSid, extension);
  const filePath = path.join(STORAGE_DIR, filename);
  
  await fs.writeFile(filePath, buffer);
  
  logger.info('Audio file saved', { 
    callSid, 
    filePath, 
    size: buffer.length 
  });
  
  return filePath;
};

/**
 * Read audio file
 */
const readAudioFile = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  return buffer;
};

/**
 * Delete audio file
 */
const deleteAudioFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    logger.info('Audio file deleted', { filePath });
  } catch (error) {
    logger.error('Failed to delete audio file', { 
      filePath, 
      error: error.message 
    });
  }
};

/**
 * Clean up old recordings (older than specified days)
 */
const cleanupOldRecordings = async (daysOld = 7) => {
  try {
    await ensureStorageDir();
    const files = await fs.readdir(STORAGE_DIR);
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000;
    
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = path.join(STORAGE_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        await deleteAudioFile(filePath);
        deletedCount++;
      }
    }
    
    logger.info('Cleanup completed', { deletedCount, daysOld });
    return deletedCount;
  } catch (error) {
    logger.error('Cleanup failed', { error: error.message });
    throw error;
  }
};

module.exports = {
  saveAudioFile,
  readAudioFile,
  deleteAudioFile,
  cleanupOldRecordings,
  ensureStorageDir
};
