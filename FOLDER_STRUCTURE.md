# Production-Ready Backend Folder Structure

## Complete Folder Tree

```
HackSmash/
│
├── src/                                    # Source code root
│   ├── server.js                           # Application entry point - bootstraps Express server
│   ├── app.js                              # Express app configuration - registers routes and middleware
│   │
│   ├── config/                             # Configuration management
│   │   ├── index.js                        # Central config loader - exports all settings
│   │   ├── twilio.js                       # Twilio credentials and phone numbers
│   │   ├── ai-services.js                  # Whisper, LLM, TTS API configuration
│   │   └── municipal.js                    # Municipal system API configuration
│   │
│   ├── routes/                             # HTTP route definitions
│   │   ├── index.js                        # Main route aggregator
│   │   ├── health.js                       # Health check endpoints
│   │   ├── telephony.js                    # Twilio webhook routes
│   │   └── complaints.js                   # Complaint management routes
│   │
│   ├── middleware/                         # Express middleware
│   │   ├── errorHandler.js                 # Global error handling
│   │   ├── logger.js                       # Request/response logging
│   │   └── validateTwilioRequest.js        # Twilio webhook authentication
│   │
│   ├── modules/                            # Feature modules (main business logic)
│   │   │
│   │   ├── telephony/                      # Call handling and telephony
│   │   │   ├── controller.js               # Handles Twilio webhook requests
│   │   │   ├── service.js                  # Call management business logic
│   │   │   ├── callFlowManager.js          # State machine for call flow
│   │   │   ├── twilioClient.js             # Twilio SDK wrapper
│   │   │   └── recordingManager.js         # Call recording storage and retrieval
│   │   │
│   │   ├── speech-processing/              # Speech-to-text and language detection
│   │   │   ├── controller.js               # Handles STT requests
│   │   │   ├── service.js                  # Speech processing orchestration
│   │   │   ├── sttService.js               # Whisper API integration
│   │   │   ├── languageDetector.js         # Detects Gujarati/Hindi/English
│   │   │   └── audioProcessor.js           # Audio format conversion and enhancement
│   │   │
│   │   ├── ai-understanding/               # LLM-based complaint understanding
│   │   │   ├── controller.js               # Handles AI analysis requests
│   │   │   ├── service.js                  # AI understanding orchestration
│   │   │   ├── llmService.js               # GPT API integration
│   │   │   ├── promptManager.js            # Manages AI prompts
│   │   │   ├── complaintClassifier.js      # Extracts complaint category and severity
│   │   │   ├── jsonExtractor.js            # Parses structured data from LLM
│   │   │   └── prompts/                    # Prompt templates
│   │   │       ├── classification.js       # Category classification prompts
│   │   │       └── extraction.js           # Data extraction prompts
│   │   │
│   │   ├── complaint-management/           # Complaint registration and tracking
│   │   │   ├── controller.js               # Complaint CRUD operations
│   │   │   ├── service.js                  # Complaint business logic
│   │   │   ├── complaintRegistrar.js       # Registers complaints to municipal system
│   │   │   ├── locationResolver.js         # Maps location to ward/zone
│   │   │   ├── categoryMapper.js           # Maps AI categories to municipal categories
│   │   │   └── validators.js               # Complaint data validation
│   │   │
│   │   └── response-generation/            # Text-to-speech and response messages
│   │       ├── controller.js               # Handles TTS requests
│   │       ├── service.js                  # Response generation orchestration
│   │       ├── ttsService.js               # OpenAI TTS API integration
│   │       ├── messageBuilder.js           # Builds contextual messages
│   │       └── templates/                  # Message templates
│   │           ├── confirmation.js         # Success confirmation messages
│   │           ├── prompts.js              # User instruction messages
│   │           └── errors.js               # Error messages in all languages
│   │
│   ├── integrations/                       # External system integrations
│   │   └── municipal-api/                  # Municipal complaint system
│   │       ├── client.js                   # HTTP client for municipal API
│   │       ├── mockClient.js               # Mock implementation for development
│   │       └── transformer.js              # Data format conversion
│   │
│   ├── utils/                              # Shared utilities
│   │   ├── logger.js                       # Winston logger configuration
│   │   ├── asyncHandler.js                 # Async error wrapper for routes
│   │   ├── apiError.js                     # Custom error class
│   │   ├── validators.js                   # Common validation functions
│   │   └── fileStorage.js                  # File upload/download utilities
│   │
│   └── constants/                          # Application constants
│       ├── languages.js                    # Supported languages (GU, HI, EN)
│       ├── complaintCategories.js          # Valid complaint types
│       ├── callStates.js                   # Call flow state definitions
│       └── wards.js                        # Municipal ward/zone data
│
├── tests/                                  # Test files
│   ├── unit/                               # Unit tests per module
│   │   ├── telephony.test.js
│   │   ├── speech-processing.test.js
│   │   └── ai-understanding.test.js
│   └── integration/                        # End-to-end tests
│       └── call-flow.test.js
│
├── docs/                                   # Documentation
│   ├── API.md                              # API endpoint documentation
│   ├── ARCHITECTURE.md                     # System architecture overview
│   └── DEVELOPMENT.md                      # Development guidelines
│
├── recordings/                             # Call recordings storage (gitignored)
├── logs/                                   # Application logs (gitignored)
│
├── .env.example                            # Environment variables template
├── .gitignore                              # Git ignore rules
├── package.json                            # Node.js dependencies
└── README.md                               # Project overview
```

## Module Responsibilities

### 1. Telephony Module
- Handles incoming Twilio webhooks
- Manages call state and flow
- DTMF language selection
- Call recording lifecycle

### 2. Speech Processing Module
- Converts audio to text via Whisper
- Detects language from transcript
- Preprocesses audio files

### 3. AI Understanding Module
- Sends transcripts to LLM
- Classifies complaint type
- Extracts structured JSON data
- Manages prompt templates

### 4. Complaint Management Module
- Validates complaint data
- Resolves location to ward/zone
- Maps categories to municipal system
- Registers complaints via API

### 5. Response Generation Module
- Generates contextual messages
- Converts text to speech
- Manages multilingual templates

## Team Development Strategy

### Parallel Development
- **4 developers can work simultaneously**
- Each module is independent
- Use mock services for dependencies
- Shared constants ensure consistency

### Module Ownership
| Developer | Modules | Focus |
|-----------|---------|-------|
| Dev 1 | Telephony | Call handling, Twilio integration |
| Dev 2 | Speech + AI | STT, LLM, classification |
| Dev 3 | Complaints | Business logic, municipal API |
| Dev 4 | Response + Core | TTS, config, middleware, utils |

## Key Design Principles

✅ **Separation of Concerns** - Each module has single responsibility  
✅ **Replaceable Services** - Easy to swap STT/LLM/TTS providers  
✅ **Mock-Friendly** - All external services can be mocked  
✅ **Async-First** - All I/O operations are asynchronous  
✅ **Environment-Driven** - All config via environment variables  
✅ **Modular Routes** - Each module defines its own routes  
✅ **Centralized Error Handling** - Consistent error responses  
✅ **Structured Logging** - Comprehensive logs for debugging  

## Scalability Features

- **Stateless design** - Can scale horizontally
- **Service abstraction** - Easy to move to microservices
- **Queue-ready** - Can add async queue processing
- **Cache-friendly** - Ready for Redis/caching layer
- **Database-agnostic** - Can add Postgres/MongoDB easily

---

**Note:** This structure is production-ready and follows Node.js/Express best practices. Start development by implementing core infrastructure (config, middleware, utils) first, then each team member can build their module independently.
