// Language detection - identifies Gujarati, Hindi, or English from transcribed text

const logger = require('../../utils/logger');
const { LANGUAGES } = require('../../constants/languages');

/**
 * Unicode ranges for different scripts
 */
const SCRIPT_RANGES = {
  // Devanagari script (Hindi)
  DEVANAGARI: /[\u0900-\u097F]/,
  // Gujarati script
  GUJARATI: /[\u0A80-\u0AFF]/,
  // Latin script (English)
  LATIN: /[a-zA-Z]/
};

/**
 * Common Hindi words
 */
const HINDI_INDICATORS = [
  'है', 'का', 'की', 'के', 'में', 'पर', 'से', 'ने',
  'मेरे', 'कृपया', 'यह', 'वह', 'क्या'
];

/**
 * Common Gujarati words
 */
const GUJARATI_INDICATORS = [
  'છે', 'કે', 'મારું', 'તમારું', 'એ', 'એક',
  'કૃપા', 'મારા', 'આ', 'છે'
];

/**
 * Common English words
 */
const ENGLISH_INDICATORS = [
  'the', 'is', 'are', 'was', 'were', 'have', 'has',
  'please', 'help', 'need', 'want', 'problem', 'issue'
];

/**
 * Detect language from transcribed text
 * @param {string} text - Transcribed text
 * @param {string} whisperLanguage - Language detected by Whisper (optional)
 * @returns {Object} - Language object
 */
const detectLanguage = (text, whisperLanguage = null) => {
  try {
    logger.info('Detecting language from text', {
      textLength: text.length,
      whisperLanguage,
      preview: text.substring(0, 50)
    });

    if (!text || text.trim().length === 0) {
      logger.warn('Empty text for language detection');
      return LANGUAGES.HINDI; // Default to Hindi
    }

    const scores = {
      hindi: 0,
      gujarati: 0,
      english: 0
    };

    // Check script presence
    const devanagariMatches = text.match(SCRIPT_RANGES.DEVANAGARI);
    const gujaratiMatches = text.match(SCRIPT_RANGES.GUJARATI);
    const latinMatches = text.match(SCRIPT_RANGES.LATIN);

    if (devanagariMatches) scores.hindi += devanagariMatches.length * 2;
    if (gujaratiMatches) scores.gujarati += gujaratiMatches.length * 2;
    if (latinMatches) scores.english += latinMatches.length;

    // Check for common words
    const lowerText = text.toLowerCase();
    
    HINDI_INDICATORS.forEach(word => {
      if (text.includes(word)) scores.hindi += 5;
    });
    
    GUJARATI_INDICATORS.forEach(word => {
      if (text.includes(word)) scores.gujarati += 5;
    });
    
    ENGLISH_INDICATORS.forEach(word => {
      if (lowerText.includes(word)) scores.english += 3;
    });

    // Use Whisper's language detection as a hint
    if (whisperLanguage) {
      if (whisperLanguage.startsWith('hi')) scores.hindi += 10;
      else if (whisperLanguage.startsWith('gu')) scores.gujarati += 10;
      else if (whisperLanguage.startsWith('en')) scores.english += 10;
    }

    // Determine language with highest score
    let detectedLanguage = LANGUAGES.HINDI; // Default
    let maxScore = scores.hindi;

    if (scores.gujarati > maxScore) {
      detectedLanguage = LANGUAGES.GUJARATI;
      maxScore = scores.gujarati;
    }
    
    if (scores.english > maxScore) {
      detectedLanguage = LANGUAGES.ENGLISH;
      maxScore = scores.english;
    }

    logger.info('Language detected', {
      language: detectedLanguage.code,
      scores,
      confidence: maxScore > 10 ? 'high' : 'low'
    });

    return detectedLanguage;

  } catch (error) {
    logger.error('Language detection failed', {
      error: error.message,
      text: text?.substring(0, 100)
    });
    return LANGUAGES.HINDI; // Default fallback
  }
};

/**
 * Verify if detected language matches expected language
 * @param {Object} detectedLanguage - Detected language object
 * @param {Object} expectedLanguage - Expected language object
 * @returns {boolean}
 */
const verifyLanguage = (detectedLanguage, expectedLanguage) => {
  if (!expectedLanguage) return true;
  
  const match = detectedLanguage.code === expectedLanguage.code;
  
  if (!match) {
    logger.warn('Language mismatch', {
      detected: detectedLanguage.code,
      expected: expectedLanguage.code
    });
  }
  
  return match;
};

module.exports = {
  detectLanguage,
  verifyLanguage
};
