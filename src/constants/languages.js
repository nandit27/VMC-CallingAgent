// Language constants - supported languages with codes and metadata

const LANGUAGES = {
  GUJARATI: {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    whisperCode: 'gu',
    googleCode: 'gu-IN',
    dtmfKey: '1',
    twilioVoice: 'Google.gu-IN-Standard-A',  // Google voice for Gujarati
    twilioLanguage: 'gu-IN'
  },
  HINDI: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    whisperCode: 'hi',
    googleCode: 'hi-IN',
    dtmfKey: '2',
    twilioVoice: 'Polly.Aditi',
    twilioLanguage: 'hi-IN'
  },
  ENGLISH: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    whisperCode: 'en',
    googleCode: 'en-US',
    dtmfKey: '3',
    twilioVoice: 'Polly.Joanna',
    twilioLanguage: 'en-US'
  }
};

/**
 * Map DTMF key to language
 */
const DTMF_TO_LANGUAGE = {
  '1': LANGUAGES.GUJARATI,
  '2': LANGUAGES.HINDI,
  '3': LANGUAGES.ENGLISH
};

/**
 * Map Twilio language code to our language object
 */
const TWILIO_TO_LANGUAGE = {
  'gu-IN': LANGUAGES.GUJARATI,
  'hi-IN': LANGUAGES.HINDI,
  'en-US': LANGUAGES.ENGLISH
};

/**
 * Get language by code
 */
const getLanguageByCode = (code) => {
  return Object.values(LANGUAGES).find(lang => lang.code === code);
};

/**
 * Get language by DTMF key
 */
const getLanguageByDTMF = (key) => {
  return DTMF_TO_LANGUAGE[key];
};

module.exports = {
  LANGUAGES,
  DTMF_TO_LANGUAGE,
  TWILIO_TO_LANGUAGE,
  getLanguageByCode,
  getLanguageByDTMF
};
