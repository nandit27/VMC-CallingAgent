# VMC Complaint Processing API (Python FastAPI)

This is the Python processing backend for the VMC Calling Agent system. It handles all AI-related processing including translation, classification, and location resolution.

## 🏗️ Architecture

This Python API is part of a hybrid architecture:
- **Node.js** handles telephony (Twilio) and database (MongoDB)
- **Python** handles AI processing (ML, NLP, fuzzy matching)
- Communication via REST API

## 📦 Installation

### Requirements
- Python 3.9+
- MongoDB (for location data)

### Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables (optional)
export MONGO_URI="mongodb+srv://..."

# Run the server
uvicorn app.main:app --reload --port 8000
```

## 🚀 Running

### Development
```bash
uvicorn app.main:app --reload --port 8000
```

### Production
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 📡 API Endpoints

### Health Check
```
GET /
GET /health
```

### Translation
```
POST /api/process/translate
```
**Request:**
```json
{
  "text": "પાણી પુરવઠો નથી",
  "source_language": "gu",
  "target_language": "en"
}
```

### Category Classification
```
POST /api/process/classify
```
**Request:**
```json
{
  "text": "Water supply is not working",
  "language": "en"
}
```

**Response:**
```json
{
  "category": {
    "code": "WATER_SUPPLY",
    "name": "Water Supply",
    "urgency": "high"
  },
  "confidence": 0.95,
  "method": "ml-model"
}
```

### Location Resolution
```
POST /api/process/resolve-location
```
**Request:**
```json
{
  "text": "Garbage problem in Shivaji Nagar near main road"
}
```

**Response:**
```json
{
  "found": true,
  "location": "Shivaji Nagar",
  "wardNumber": 1,
  "wardName": "Ward 1",
  "zone": "E",
  "confidence": 0.85,
  "matchType": "fuzzy"
}
```

### Full Complaint Processing
```
POST /api/process/complaint
```
**Request:**
```json
{
  "text": "Water supply issue in my area",
  "language": "en",
  "phone_number": "+919876543210",
  "call_sid": "CA123..."
}
```

**Response:** Combined results from all processing steps

### Duplicate Detection (Placeholder)
```
POST /api/process/detect-duplicate
```

### Urgency Classification (Placeholder)
```
POST /api/process/classify-urgency
```

## 📁 Project Structure

```
fast_api/
├── app/
│   ├── main.py                              # FastAPI application
│   ├── services/
│   │   ├── category_service.py              # ML classification
│   │   ├── location_service.py              # Location resolution
│   │   ├── speech_service.py                # Speech processing
│   │   ├── confidence_service.py            # Confidence scoring
│   │   ├── duplicate_detection_service.py   # Duplicate check (placeholder)
│   │   └── urgency_classification_service.py # Urgency (placeholder)
│   ├── location/
│   │   ├── extractor.py                     # Extract location candidates
│   │   ├── normalizer.py                    # Text normalization
│   │   ├── matcher.py                       # Fuzzy matching
│   │   ├── ranker.py                        # Rank matches
│   │   └── resolver.py                      # Final decision
│   ├── DB/
│   │   ├── mongo.py                         # MongoDB connection
│   │   ├── area_repo.py                     # Area repository
│   │   ├── ward_repo.py                     # Ward repository
│   │   └── zone_repo.py                     # Zone repository
│   └── data/
│       └── models/                          # ML models
└── requirements.txt
```

## 🔧 Services

### 1. Category Classification
- Uses ML model (joblib)
- Predicts complaint category from text
- Returns confidence score
- File: `services/category_service.py`

### 2. Location Resolution
Multi-step pipeline:
1. **Normalize** text (lowercase, remove special chars)
2. **Extract** location candidates
3. **Match** against database (exact + aliases)
4. **Fuzzy match** for similar names
5. **Rank** by confidence
6. **Resolve** final decision

File: `services/location_service.py`

### 3. Duplicate Detection (Placeholder)
- Check if complaint is duplicate of recent ones
- Text similarity algorithms
- Same category + location + time window
- **Status:** Placeholder - implement in `services/duplicate_detection_service.py`

### 4. Urgency Classification (Placeholder)
- Determine urgency level (critical/high/medium/low)
- Keyword detection (emergency, urgent, etc.)
- Category-based baseline
- **Status:** Placeholder - implement in `services/urgency_classification_service.py`

## 🗄️ Database (MongoDB)

### Collections Used

1. **zones** - Administrative zones (E, W, N, S, etc.)
2. **wards** - Ward information with zone mapping
3. **areas** - Locations with aliases for fuzzy matching

### Schema
See: `app/location/schema.txt`

### Connection
Configure in `app/DB/mongo.py` or via `MONGO_URI` environment variable

## 🧪 Testing

### Interactive API Docs
Visit: http://localhost:8000/docs

FastAPI provides automatic Swagger UI for testing endpoints.

### Python Test Script
```bash
# From project root
python test_hybrid_setup.py
```

### Manual Testing
```bash
# Health check
curl http://localhost:8000/health

# Test classification
curl -X POST http://localhost:8000/api/process/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "Water supply problem", "language": "en"}'
```

## 🔌 Integration with Node.js

Node.js calls this API via HTTP:
- **Client:** `src/integrations/python-api/client.js` (Node.js)
- **Base URL:** Configured in Node.js `.env` as `PYTHON_API_URL`
- **Timeout:** 30 seconds default

## 📝 Implementing Placeholder Services

### Duplicate Detection

Edit `app/services/duplicate_detection_service.py`:

```python
def detect_duplicates(complaint_text, category, ward_number, recent_complaints):
    # TODO: Implement
    # 1. Get recent complaints from same category + ward
    # 2. Calculate text similarity (cosine, Levenshtein, etc.)
    # 3. Check time window (e.g., last 24 hours)
    # 4. Return duplicate if similarity > threshold
    
    return {
        "is_duplicate": False,
        "duplicate_of": None,
        "similarity_score": 0.0,
        "reason": "..."
    }
```

### Urgency Classification

Edit `app/services/urgency_classification_service.py`:

```python
def classify_urgency(complaint_text, category, category_base_urgency):
    # TODO: Implement
    # 1. Extract keywords (emergency, urgent, critical, etc.)
    # 2. Check for time-sensitive indicators
    # 3. Assess public safety risk
    # 4. Combine with category urgency
    # 5. Return urgency level + score
    
    return {
        "urgency_level": "medium",
        "urgency_score": 0.5,
        "factors": [...],
        "escalate": False
    }
```

Both services are already integrated into the pipeline - just implement the logic!

## 🐛 Troubleshooting

### ModuleNotFoundError
```bash
pip install -r requirements.txt
```

### MongoDB Connection Error
```bash
# Check MONGO_URI environment variable
echo $MONGO_URI

# Test connection
python -c "from app.DB.mongo import db; print(db.name)"
```

### Model File Not Found
```bash
# Check if model exists
ls -la data/models/complaint_category_model.joblib
```

### Port Already in Use
```bash
# Kill existing process
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn app.main:app --port 8001
```

## 📊 Performance

- Average response time: < 100ms per endpoint
- ML classification: ~20-30ms
- Location resolution: ~30-50ms
- Full pipeline: ~100-150ms

## 🔐 Security

- No authentication currently (internal API)
- Add API key validation if exposing publicly
- Rate limiting recommended for production
- Input validation via Pydantic models

## 📚 Dependencies

Key dependencies:
- **fastapi** - Web framework
- **uvicorn** - ASGI server
- **pymongo** - MongoDB driver
- **pydantic** - Data validation
- **joblib** - Model loading
- **scikit-learn** - ML model support

See `requirements.txt` for complete list.

## 🚀 Deployment

### Docker (Recommended)
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app/ ./app/

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Systemd Service
```ini
[Unit]
Description=VMC Python Processing API
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/fast_api
ExecStart=/usr/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

## 📈 Monitoring

### Health Endpoint
Monitor `/health` for uptime:
```bash
curl http://localhost:8000/health
```

### Logging
Logs are output to stdout. Configure log level:
```python
logging.basicConfig(level=logging.INFO)
```

## 🤝 Contributing

When adding new features:
1. Add endpoint to `main.py`
2. Create service in `services/`
3. Add Pydantic models for validation
4. Test via `/docs` Swagger UI
5. Update this README

## 📞 Support

For issues:
1. Check logs in console output
2. Test endpoints via `/docs`
3. Verify MongoDB connection
4. Check model files exist
5. Ensure dependencies installed

---

**Part of VMC Calling Agent - Hybrid Architecture**
See main project README for complete system documentation.
