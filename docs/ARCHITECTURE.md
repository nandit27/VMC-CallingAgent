# Architecture Overview

## System Flow
1. Incoming call → Twilio webhook → Telephony module
2. Language selection via DTMF
3. User speaks complaint → Recording
4. Recording → Speech Processing → Transcription
5. Transcription → AI Understanding → Classification
6. Classification → Complaint Management → Registration
7. Confirmation → Response Generation → TTS → Caller

## Module Independence
- Each module can be developed separately
- Services are replaceable (switch STT/TTS/LLM providers)
- Clear contracts between modules
- Mock integrations for parallel development
