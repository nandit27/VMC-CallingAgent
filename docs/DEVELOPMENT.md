# Development Guide

## Team Structure (4 Developers)

### Developer 1: Telephony & Call Flow
- `src/modules/telephony/`
- `src/routes/telephony.js`
- Twilio integration

### Developer 2: Speech Processing & AI
- `src/modules/speech-processing/`
- `src/modules/ai-understanding/`
- Whisper and LLM integration

### Developer 3: Complaint Management
- `src/modules/complaint-management/`
- `src/integrations/municipal-api/`
- Business logic and validation

### Developer 4: Response Generation & Infrastructure
- `src/modules/response-generation/`
- `src/config/`, `src/middleware/`, `src/utils/`
- TTS and core services

## Development Workflow
1. Each developer works in their module
2. Use mock services for cross-module dependencies
3. Integration testing after module completion
4. Shared constants and utils for consistency
