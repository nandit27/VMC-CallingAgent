// Telephony controller - handles incoming call webhooks and call flow orchestration

const twilio = require('twilio');
const { VoiceResponse } = twilio.twiml;
const logger = require('../../utils/logger');
const { CALL_STATES } = require('../../constants/callStates');
const { getLanguageByDTMF, TWILIO_TO_LANGUAGE } = require('../../constants/languages');
const speechService = require('../speech-processing/service');
const hybridComplaintService = require('../complaint-management/hybridService');

// Store for tracking call state (replace with database in production)
const callDataStore = new Map();

/**
 * Handles incoming call webhook from Twilio
 * This is the entry point when someone calls the municipal number
 */
const handleIncomingCall = async (req, res) => {
  try {
    const { CallSid, From, To, CallStatus } = req.body;
    
    logger.info('Incoming call received', {
      callSid: CallSid,
      from: From,
      to: To,
      status: CallStatus
    });

    // Create a new TwiML response
    const twiml = new VoiceResponse();

    // Welcome message - using neutral voice for initial greeting
    const gather = twiml.gather({
      input: 'dtmf',
      numDigits: 1,
      action: '/api/telephony/language-selection',
      method: 'POST',
      timeout: 10
    });

    // Neutral AI welcome (English)
    gather.say(
      {
        voice: 'Polly.Joanna',
        language: 'en-US'
      },
      'Welcome to Vadodara Municipal Corporation Call Center.'
    );
    
    gather.pause({ length: 0.5 });
    
    // Language selection options
    gather.say(
      {
        voice: 'Polly.Joanna',
        language: 'en-US'
      },
      'For Gujarati, press 1. For Hindi, press 2. For English, press 3.'
    );

    // If no input, repeat the message
    twiml.redirect('/api/telephony/incoming-call');

    // Set response type and send TwiML
    res.type('text/xml');
    res.send(twiml.toString());

    logger.info('TwiML response sent for incoming call', { callSid: CallSid });

  } catch (error) {
    logger.error('Error handling incoming call', {
      error: error.message,
      stack: error.stack
    });

    // Send error response to Twilio
    const twiml = new VoiceResponse();
    twiml.say('We are experiencing technical difficulties. Please try again later.');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

/**
 * Handles language selection from DTMF input
 */
const handleLanguageSelection = async (req, res) => {
  try {
    const { CallSid, Digits } = req.body;
    
    logger.info('Language selection received', {
      callSid: CallSid,
      digits: Digits
    });

    const twiml = new VoiceResponse();

    // Get language from DTMF
    const selectedLanguage = getLanguageByDTMF(Digits);

    if (!selectedLanguage) {
      // Invalid selection, redirect back to language selection
      twiml.say('Invalid selection. Please try again.');
      twiml.redirect('/api/telephony/incoming-call');
    } else {
      // Language selected successfully
      logger.info('Language selected', { 
        callSid: CallSid, 
        language: selectedLanguage.code,
        twilioLanguage: selectedLanguage.twilioLanguage
      });
      
      // Proceed to complaint collection
      twiml.redirect({
        method: 'POST'
      }, `/api/telephony/collect-complaint?language=${selectedLanguage.twilioLanguage}`);
    }

    res.type('text/xml');
    res.send(twiml.toString());

  } catch (error) {
    logger.error('Error handling language selection', {
      error: error.message,
      stack: error.stack
    });

    const twiml = new VoiceResponse();
    twiml.say('An error occurred. Please try again.');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

/**
 * Handles call status updates from Twilio
 */
const handleCallStatus = async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration } = req.body;
    
    logger.info('Call status update', {
      callSid: CallSid,
      status: CallStatus,
      duration: CallDuration
    });

    // Store call status in database (to be implemented)
    // For now, just log it

    res.status(200).send('OK');

  } catch (error) {
    logger.error('Error handling call status', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).send('Error');
  }
};

/**
 * Collect complaint via speech recording
 */
const collectComplaint = async (req, res) => {
  try {
    const { CallSid, language } = req.query;
    
    logger.info('Starting complaint collection', {
      callSid: CallSid,
      language
    });

    const twiml = new VoiceResponse();
    const selectedLanguage = TWILIO_TO_LANGUAGE[language];

    // Greeting based on language
    if (language === 'gu-IN') {
      twiml.say(
        {
          voice: 'Google.gu-IN-Standard-A',
          language: 'gu-IN'
        },
        'નમસ્કાર, વડોદરા મહાનગર પાલિકા કોલ સેન્ટરમાં આપનું સ્વાગત છે.'
      );
      twiml.pause({ length: 0.5 });
      twiml.say(
        {
          voice: 'Google.gu-IN-Standard-A',
          language: 'gu-IN'
        },
        'કૃપા કરીને તમારી ફરિયાદ અને સ્થળની માહિતી, જેમ કે વિસ્તાર અથવા વોર્ડનું નામ જણાવો.'
      );
    } else if (language === 'hi-IN') {
      twiml.say(
        {
          voice: 'Polly.Aditi',
          language: 'hi-IN'
        },
        'नमस्कार, वडोदरा नगर निगम कॉल सेंटर में आपका स्वागत है।'
      );
      twiml.pause({ length: 0.5 });
      twiml.say(
        {
          voice: 'Polly.Aditi',
          language: 'hi-IN'
        },
        'कृपया अपनी शिकायत और स्थान की जानकारी, जैसे क्षेत्र या वार्ड का नाम बताएं।'
      );
    } else {
      twiml.say(
        {
          voice: 'Polly.Joanna',
          language: 'en-US'
        },
        'Hello, welcome to the Vadodara Municipal Corporation Call Center.'
      );
      twiml.pause({ length: 0.5 });
      twiml.say(
        {
          voice: 'Polly.Joanna',
          language: 'en-US'
        },
        'Please briefly describe your complaint and also mention your location, such as area or ward name.'
      );
    }

    // Prompts for recording start
    const prompts = {
      'hi-IN': 'बीप के बाद बोलना शुरू करें।',
      'en-US': 'Start speaking after the beep.',
      'gu-IN': 'બીપ પછી બોલવાનું શરૂ કરો।'
    };

    // Say the prompt
    twiml.say(
      {
        voice: selectedLanguage?.twilioVoice || 'Polly.Aditi',
        language: language
      },
      prompts[language] || prompts['hi-IN']
    );

    // Record the complaint
    twiml.record({
      action: `/api/telephony/process-recording?language=${language}`,
      method: 'POST',
      maxLength: parseInt(process.env.MAX_RECORDING_DURATION) || 120, // 2 minutes max
      timeout: 5, // Stop after 5 seconds of silence
      transcribe: false, // We'll use Whisper instead
      playBeep: true,
      trim: 'trim-silence'
    });

    // If recording times out
    twiml.say('We did not receive your complaint. Goodbye.');
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());

  } catch (error) {
    logger.error('Error in complaint collection', {
      error: error.message,
      stack: error.stack
    });

    const twiml = new VoiceResponse();
    twiml.say('An error occurred. Please try again later.');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

/**
 * Process recording after it's completed
 */
const processRecording = async (req, res) => {
  try {
    const {
      CallSid,
      RecordingUrl,
      RecordingSid,
      RecordingDuration
    } = req.body;
    const { language } = req.query;

    logger.info('Recording received', {
      callSid: CallSid,
      recordingSid: RecordingSid,
      duration: RecordingDuration,
      language
    });

    const twiml = new VoiceResponse();
    const selectedLanguage = TWILIO_TO_LANGUAGE[language];

    // Check if recording is too short
    if (parseInt(RecordingDuration) < 1) {
      twiml.say(
        {
          voice: selectedLanguage?.twilioVoice || 'Polly.Aditi',
          language: language
        },
        language === 'hi-IN' 
          ? 'रिकॉर्डिंग बहुत छोटी थी। कृपया फिर से प्रयास करें।'
          : language === 'gu-IN'
          ? 'રેકોર્ડિંગ ખૂબ ટૂંકું હતું. કૃપા કરીને ફરી પ્રયાસ કરો.'
          : 'Recording was too short. Please try again.'
      );
      twiml.redirect(`/api/telephony/collect-complaint?language=${language}`);
      
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    // Store call data for processing
    callDataStore.set(CallSid, {
      recordingUrl: RecordingUrl,
      recordingSid: RecordingSid,
      duration: RecordingDuration,
      language: selectedLanguage,
      from: req.body.From,
      twilioLanguage: language
    });

    // Process speech in background (don't block the call)
    processRecordingAsync(RecordingUrl, RecordingSid, CallSid, selectedLanguage, req.body.From);

    // Acknowledge and continue
    const acknowledgments = {
      'hi-IN': 'कृपया प्रतीक्षा करें, हमारा सिस्टम आपकी जानकारी की जांच कर रहा है।',
      'en-US': 'Please hold for a moment while our system checks your records.',
      'gu-IN': 'કૃપા કરીને થોડી ક્ષણ રાહ જુઓ, અમારી સિસ્ટમ તમારી વિગતો તપાસી રહી છે.'
    };

    twiml.say(
      {
        voice: selectedLanguage?.twilioVoice || 'Polly.Aditi',
        language: language
      },
      acknowledgments[language] || acknowledgments['en-US']
    );

    // Wait a bit for processing, then redirect to confirmation
    twiml.pause({ length: 3 });
    twiml.redirect(`/api/telephony/confirm-complaint?callSid=${CallSid}&language=${language}`);

    res.type('text/xml');
    res.send(twiml.toString());

  } catch (error) {
    logger.error('Error processing recording', {
      error: error.message,
      stack: error.stack
    });

    const twiml = new VoiceResponse();
    twiml.say('An error occurred while processing your complaint.');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

/**
 * Process recording asynchronously
 * This runs all the intelligence layers
 */
const processRecordingAsync = async (recordingUrl, recordingSid, callSid, language, phoneNumber) => {
  try {
    logger.info('Starting async speech processing', {
      recordingSid,
      callSid
    });

    // Step 1: Speech-to-Text
    const speechResult = await speechService.processSpeech(
      recordingUrl,
      callSid,
      { expectedLanguage: language }
    );

    // Display transcription prominently in console
    console.log('\n' + '='.repeat(80));
    console.log('🎤 SPEECH TRANSCRIPTION');
    console.log('='.repeat(80));
    console.log(`📞 Call SID: ${callSid}`);
    console.log(`🗣️  Language: ${speechResult.language.name} (${speechResult.language.code})`);
    console.log(`📝 Transcribed Text:`);
    console.log(`   "${speechResult.text}"`);
    console.log(`⏱️  Duration: ${speechResult.duration || 'N/A'}s`);
    console.log(`📊 Confidence: ${speechResult.confidence}`);
    console.log(`🔧 Mode: ${speechResult.mock ? 'MOCK' : 'REAL'}`);
    console.log('='.repeat(80) + '\n');

    logger.info('Speech processed successfully', {
      callSid,
      text: speechResult.text,
      language: speechResult.language.code
    });

    // Step 2: Process through intelligence layers (Python + MongoDB)
    console.log('🐍 Processing complaint through Python API + MongoDB storage...\n');
    
    const complaintData = {
      callSid,
      phoneNumber,
      originalText: speechResult.text,
      language: speechResult.language.code,
      recordingUrl,
      duration: speechResult.duration,
      confidence: speechResult.confidence
    };

    const processedComplaint = await hybridComplaintService.processComplaint(complaintData);

    // Display final result with summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ COMPLAINT PROCESSED & SAVED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log(`🆔 Complaint ID: ${processedComplaint.complaintId}`);
    console.log(`💾 MongoDB ID: ${processedComplaint._id}`);
    console.log(`📋 Category: ${processedComplaint.categoryInfo.name} (${processedComplaint.category})`);
    console.log(`   └─ Confidence: ${(processedComplaint.categoryInfo.confidence * 100).toFixed(1)}%`);
    console.log(`   └─ Method: ${processedComplaint.categoryInfo.method}`);
    console.log(`⚡ Urgency: ${processedComplaint.urgency.level.toUpperCase()}`);
    console.log(`📍 Location: ${processedComplaint.location.landmark || processedComplaint.location.extractedText || 'Not found'}`);
    console.log(`   └─ Ward: ${processedComplaint.location.wardNumber || 'N/A'} (${processedComplaint.location.wardName || 'N/A'})`);
    console.log(`   └─ Zone: ${processedComplaint.location.zone || 'N/A'}`);
    console.log(`   └─ Confidence: ${processedComplaint.location.confidence || 0}%`);
    console.log(`🔄 Duplicate: ${processedComplaint.duplicate.isDuplicate ? 'YES' : 'NO'}`);
    if (processedComplaint.duplicate.isDuplicate) {
      console.log(`   └─ Similar to: ${processedComplaint.duplicate.duplicateOf}`);
      console.log(`   └─ Similarity: ${(processedComplaint.duplicate.similarityScore * 100).toFixed(1)}%`);
    }
    console.log(`⏱️  Processing Time: ${processedComplaint.processingTime}ms`);
    console.log('='.repeat(80));
    
    // Display complete JSON output
    console.log('\n📄 COMPLETE COMPLAINT JSON:');
    console.log('='.repeat(80));
    console.log(JSON.stringify(processedComplaint, null, 2));
    console.log('='.repeat(80) + '\n');

    // Store for confirmation endpoint
    callDataStore.set(callSid, {
      ...callDataStore.get(callSid),
      complaint: processedComplaint,
      processingComplete: true
    });

  } catch (error) {
    console.error('\n❌ SPEECH PROCESSING FAILED:', error.message);
    logger.error('Async speech processing failed', {
      error: error.message,
      callSid,
      recordingSid,
      stack: error.stack
    });

    // Store error state
    callDataStore.set(callSid, {
      ...callDataStore.get(callSid),
      processingComplete: false,
      error: error.message
    });
  }
};

/**
 * Handle complaint confirmation
 * Speaks the final confirmation message with complaint ID
 */
const confirmComplaint = async (req, res) => {
  try {
    const { callSid } = req.query;
    const { language } = req.query;
    
    logger.info('Confirming complaint', { callSid, language });

    const twiml = new VoiceResponse();
    const selectedLanguage = TWILIO_TO_LANGUAGE[language];

    // Get processed complaint data
    const callData = callDataStore.get(callSid);

    if (!callData || !callData.processingComplete) {
      // Still processing, wait a bit more
      const waitMessages = {
        'hi-IN': 'कृपया प्रतीक्षा करें। आपकी शिकायत संसाधित हो रही है।',
        'en-US': 'Please wait. Your complaint is being processed.',
        'gu-IN': 'કૃપા કરીને રાહ જુઓ. તમારી ફરિયાદ પર પ્રક્રિયા થઈ રહી છે.'
      };

      twiml.say(
        {
          voice: selectedLanguage?.twilioVoice || 'Polly.Aditi',
          language: language
        },
        waitMessages[language] || waitMessages['en-US']
      );
      
      twiml.pause({ length: 2 });
      twiml.redirect(`/api/telephony/confirm-complaint?callSid=${callSid}&language=${language}`);

      res.type('text/xml');
      return res.send(twiml.toString());
    }

    if (callData.error) {
      // Processing failed
      const errorMessages = {
        'hi-IN': 'क्षमा करें। आपकी शिकायत को संसाधित करते समय त्रुटि हुई। कृपया बाद में पुनः प्रयास करें। धन्यवाद।',
        'en-US': 'Sorry. An error occurred while processing your complaint. Please try again later. Thank you.',
        'gu-IN': 'માફ કરશો. તમારી ફરિયાદની પ્રક્રિયા કરતી વખતે ભૂલ થઈ. કૃપા કરીને પછીથી ફરી પ્રયાસ કરો. આભાર.'
      };

      twiml.say(
        {
          voice: selectedLanguage?.twilioVoice || 'Polly.Aditi',
          language: language
        },
        errorMessages[language] || errorMessages['en-US']
      );
      
      twiml.hangup();
      res.type('text/xml');
      return res.send(twiml.toString());
    }

    // Success! Send confirmation
    const complaint = callData.complaint;
    
    // Build confirmation message
    if (language === 'hi-IN') {
      twiml.say(
        { voice: selectedLanguage.twilioVoice, language },
        'धन्यवाद, आपकी शिकायत सफलतापूर्वक दर्ज कर ली गई है।'
      );
      twiml.pause({ length: 0.5 });
      twiml.say(
        { voice: selectedLanguage.twilioVoice, language },
        `आपकी शिकायत संख्या है ${speakComplaintId(complaint.complaintId, 'hi')}`
      );
      twiml.pause({ length: 0.5 });
      twiml.say(
        { voice: selectedLanguage.twilioVoice, language },
        'आप अपनी शिकायत की स्थिति नगर निगम की वेबसाइट या ऐप पर जांच सकते हैं। इस शिकायत संख्या को सुरक्षित रखें। धन्यवाद।'
      );
    } else if (language === 'gu-IN') {
      twiml.say(
        { voice: selectedLanguage.twilioVoice, language },
        'આભાર, તમારી ફરિયાદ સફળતાપૂર્વક નોંધાઈ ગઈ છે.'
      );
      twiml.pause({ length: 0.5 });
      twiml.say(
        { voice: selectedLanguage.twilioVoice, language },
        `તમારી ફરિયાદ નંબર છે ${speakComplaintId(complaint.complaintId, 'gu')}`
      );
      twiml.pause({ length: 0.5 });
      twiml.say(
        { voice: selectedLanguage.twilioVoice, language },
        'તમે તમારી ફરિયાદની સ્થિતિ મ્યુનિસિપલ વેબસાઇટ અથવા એપ પર તપાસી શકો છો. આ ફરિયાદ નંબર સુરક્ષિત રાખો. આભાર.'
      );
    } else {
      // English
      twiml.say(
        { voice: selectedLanguage.twilioVoice, language },
        'Thank you, your complaint has been registered successfully.'
      );
      twiml.pause({ length: 0.5 });
      twiml.say(
        { voice: selectedLanguage.twilioVoice, language },
        `Your complaint ID is ${speakComplaintId(complaint.complaintId, 'en')}`
      );
      twiml.pause({ length: 0.5 });
      twiml.say(
        { voice: selectedLanguage.twilioVoice, language },
        'You can check your complaint status on the municipal corporation website or app. Please keep this complaint ID safe. Thank you.'
      );
    }

    twiml.hangup();

    // Cleanup call data
    callDataStore.delete(callSid);

    logger.info('Complaint confirmed and call completed', {
      callSid,
      complaintId: complaint.complaintId
    });

    res.type('text/xml');
    res.send(twiml.toString());

  } catch (error) {
    logger.error('Error confirming complaint', {
      error: error.message,
      stack: error.stack
    });

    const twiml = new VoiceResponse();
    twiml.say('An error occurred. Thank you for calling.');
    twiml.hangup();
    
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

/**
 * Helper: Speak complaint ID in a way that's easy to understand
 */
function speakComplaintId(complaintId, language) {
  // Break down complaint ID into speakable parts
  // Format: YYYYMMDDHHMMSS-XXXX (e.g., 20260121123045-A1B2)
  
  if (!complaintId) return '';
  
  // Split by dash
  const parts = complaintId.split('-');
  
  if (language === 'hi') {
    // Hindi: spell out each character
    let spoken = '';
    for (let i = 0; i < complaintId.length; i++) {
      const char = complaintId[i];
      if (char === '-') {
        spoken += ' ';
      } else {
        spoken += char + ' ';
      }
    }
    return spoken.trim();
  } else if (language === 'gu') {
    // Gujarati: spell out each character
    let spoken = '';
    for (let i = 0; i < complaintId.length; i++) {
      const char = complaintId[i];
      if (char === '-') {
        spoken += ' ';
      } else {
        spoken += char + ' ';
      }
    }
    return spoken.trim();
  } else {
    // English: break into chunks for better pronunciation
    // Read first part as: year, month, day, time
    // Read second part as: individual characters
    if (parts.length === 2) {
      const datePart = parts[0]; // 20260121123045
      const codePart = parts[1]; // A1B2
      
      // Break date part into year-month-day-time
      const year = datePart.substring(0, 4);
      const month = datePart.substring(4, 6);
      const day = datePart.substring(6, 8);
      const time = datePart.substring(8);
      
      // Spell out code part
      const code = codePart.split('').join(' ');
      
      return `${year.split('').join(' ')} ${month.split('').join(' ')} ${day.split('').join(' ')} ${time.split('').join(' ')} ${code}`;
    }
    
    // Fallback: spell out each character
    return complaintId.split('').join(' ');
  }
}

module.exports = {
  handleIncomingCall,
  handleLanguageSelection,
  handleCallStatus,
  collectComplaint,
  processRecording,
  confirmComplaint
};
