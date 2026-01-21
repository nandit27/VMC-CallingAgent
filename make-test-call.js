require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID.replace(/"/g, '');
const authToken = process.env.TWILIO_AUTH_TOKEN.replace(/"/g, '');
const client = twilio(accountSid, authToken);

async function makeTestCall() {
  try {
    const call = await client.calls.create({
      // Twilio will call YOUR Indian number
      to: '+917990785212', // ← REPLACE with your Indian mobile number
      from: '+15109535742', // Your Twilio US number
      url: 'https://halolike-jenee-cressiest.ngrok-free.dev/api/telephony/incoming-call',
      method: 'POST',
      record: true,
      statusCallback: 'https://halolike-jenee-cressiest.ngrok-free.dev/api/telephony/call-status',
      statusCallbackMethod: 'POST'
    });
    
    console.log('✅ Test call initiated!');
    console.log('📞 Call SID:', call.sid);
    console.log('📱 Calling your number:', call.to);
    console.log('⏰ Status:', call.status);
    console.log('\n🎧 You should receive a call in a few seconds!');
    console.log('👂 Listen for the multilingual greeting');
    console.log('🔢 Press a number to select language');
    console.log('🗣️  Speak your complaint after the beep');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 21608) {
      console.log('\n💡 This number may not be verified in your trial account.');
      console.log('Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
    }
  }
}

makeTestCall();