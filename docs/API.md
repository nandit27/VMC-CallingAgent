# API Documentation

## Endpoints

### Telephony
- POST `/api/telephony/incoming` - Twilio incoming call webhook
- POST `/api/telephony/recording-status` - Recording status callback
- POST `/api/telephony/call-status` - Call status callback

### Complaints
- GET `/api/complaints/:id` - Get complaint details
- POST `/api/complaints` - Create complaint manually
- GET `/api/complaints/status/:id` - Check complaint status

### Health
- GET `/health` - Service health check
- GET `/health/ready` - Readiness probe
