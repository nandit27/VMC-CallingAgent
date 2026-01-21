/**
 * Translation Service - Google Cloud Translation API
 * Translates Hindi/Gujarati to English for processing
 * Vadodara Municipal Corporation
 */

const { Translate } = require('@google-cloud/translate').v2;
const logger = require('../../utils/logger');

// Initialize Google Cloud Translation client
let translateClient = null;

try {
  // Google Cloud credentials from GOOGLE_APPLICATION_CREDENTIALS env variable
  translateClient = new Translate();
  logger.info('Google Cloud Translation initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Google Cloud Translation', {
    error: error.message
  });
}

/**
 * Translate text to English using Google Translate API
 */
class TranslationService {
  /**
   * Translate text to English
   * @param {string} text - Text to translate
   * @param {string} sourceLanguage - Source language code (hi, gu, en)
   * @returns {Promise<object>} Translation result
   */
  async translateToEnglish(text, sourceLanguage = 'auto') {
    try {
      logger.info('Starting translation', {
        textLength: text.length,
        sourceLanguage
      });

      // If already in English, return as-is
      if (sourceLanguage === 'en' || sourceLanguage === 'en-US') {
        logger.info('Text already in English, skipping translation');
        return {
          originalText: text,
          translatedText: text,
          sourceLanguage: 'en',
          targetLanguage: 'en',
          translationUsed: false,
          method: 'no-translation-needed'
        };
      }

      if (!translateClient) {
        throw new Error('Google Cloud Translation not initialized - check GOOGLE_APPLICATION_CREDENTIALS');
      }

      // Translate using Google Cloud Translation API
      const [translation] = await translateClient.translate(text, {
        from: sourceLanguage === 'auto' ? undefined : sourceLanguage,
        to: 'en'
      });

      logger.info('Translation completed', {
        originalLength: text.length,
        translatedLength: translation.length,
        sourceLanguage,
        method: 'google-translate'
      });

      return {
        originalText: text,
        translatedText: translation,
        sourceLanguage,
        targetLanguage: 'en',
        translationUsed: true,
        method: 'google-translate'
      };

    } catch (error) {
      logger.error('Translation failed', {
        error: error.message,
        stack: error.stack
      });

      // Fallback: return original text if translation fails
      return {
        originalText: text,
        translatedText: text,
        sourceLanguage,
        targetLanguage: 'en',
        translationUsed: false,
        method: 'fallback-no-translation',
        error: error.message
      };
    }
  }

  /**
   * Translate multiple texts in batch
   */
  async translateBatch(texts, sourceLanguage = 'auto') {
    try {
      if (!translateClient) {
        throw new Error('Google Cloud Translation not initialized');
      }

      const [translations] = await translateClient.translate(texts, {
        from: sourceLanguage === 'auto' ? undefined : sourceLanguage,
        to: 'en'
      });

      return texts.map((text, index) => ({
        originalText: text,
        translatedText: Array.isArray(translations) ? translations[index] : translations,
        sourceLanguage,
        targetLanguage: 'en',
        method: 'google-translate'
      }));

    } catch (error) {
      logger.error('Batch translation failed', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages() {
    try {
      if (!translateClient) {
        throw new Error('Google Cloud Translation not initialized');
      }

      const [languages] = await translateClient.getLanguages();
      return languages;
    } catch (error) {
      logger.error('Failed to get supported languages', {
        error: error.message
      });
      return [];
    }
  }
}

module.exports = new TranslationService();
