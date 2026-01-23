"""
FastAPI application for complaint processing
Handles translation, classification, and location resolution
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging

from app.services.category_service import classify_category
from app.services.location_service import resolve_location_from_text
from app.services.duplicate_detection_service import detect_duplicates, find_similar_complaints
from app.services.urgency_classification_service import classify_urgency
from app.DB.mongo import db
from app.api import auth, dashboard

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="VMC Complaint Processing API",
    description="Backend processing for complaint classification and location resolution",
    version="1.0.0"
)

# CORS middleware for Node.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])


# ==================== Request/Response Models ====================

class TranslationRequest(BaseModel):
    text: str
    source_language: str
    target_language: str = "en"


class ClassificationRequest(BaseModel):
    text: str
    language: Optional[str] = "en"


class LocationResolutionRequest(BaseModel):
    text: str


class ComplaintProcessRequest(BaseModel):
    text: str
    language: str
    phone_number: Optional[str] = None
    call_sid: Optional[str] = None


class DuplicateDetectionRequest(BaseModel):
    text: str
    category: str
    ward_number: Optional[int] = None


class UrgencyClassificationRequest(BaseModel):
    text: str
    category: str
    category_base_urgency: str = "medium"


# ==================== Health Check ====================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "VMC Complaint Processing API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # Check MongoDB connection
        db.command('ping')
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "service": "complaint-processing"
    }


# ==================== Processing Endpoints ====================

@app.post("/api/process/translate")
async def translate_text(request: TranslationRequest):
    """
    Translate text from source language to target language
    Currently a placeholder - will be implemented by teammate
    """
    try:
        logger.info(f"Translation request: {request.source_language} -> {request.target_language}")
        
        # TODO: Implement actual translation service
        # For now, return the original text if English, else placeholder
        if request.source_language.lower() == 'en':
            translated = request.text
        else:
            translated = request.text  # Placeholder
        
        return {
            "original_text": request.text,
            "translated_text": translated,
            "source_language": request.source_language,
            "target_language": request.target_language,
            "translation_used": request.source_language.lower() != 'en',
            "method": "placeholder"  # Will be 'google-translate' or similar
        }
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/process/classify")
async def classify_complaint(request: ClassificationRequest):
    """
    Classify complaint into category using ML model
    """
    try:
        logger.info(f"Classification request for text: {request.text[:50]}...")
        
        result = classify_category(request.text)
        
        # Map category ID to category details
        # TODO: Load from proper category mapping file
        category_map = {
            1: {"code": "WATER_SUPPLY", "name": "Water Supply", "urgency": "high"},
            2: {"code": "GARBAGE", "name": "Garbage Collection", "urgency": "medium"},
            3: {"code": "ROAD", "name": "Road Maintenance", "urgency": "medium"},
            4: {"code": "STREETLIGHT", "name": "Street Light", "urgency": "low"},
            5: {"code": "DRAINAGE", "name": "Drainage", "urgency": "high"},
        }
        
        category_id = result.get("category_id", 1)
        category_info = category_map.get(category_id, category_map[1])
        
        return {
            "category": category_info,
            "confidence": result.get("confidence", 0.0),
            "method": "ml-model",
            "alternative_predictions": []
        }
    except Exception as e:
        logger.error(f"Classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/process/resolve-location")
async def resolve_location(request: LocationResolutionRequest):
    """
    Resolve location from text and map to ward/zone
    """
    try:
        logger.info(f"Location resolution request: {request.text[:50]}...")
        
        result = resolve_location_from_text(request.text)
        
        return {
            "found": result.get("found", False),
            "location": result.get("location", ""),
            "wardNumber": result.get("ward_id"),
            "wardName": result.get("ward_name"),
            "zone": result.get("zone_id"),
            "areaId": result.get("area_id"),
            "areaName": result.get("area_name"),
            "confidence": result.get("confidence", 0.0),
            "matchType": result.get("match_type", "none"),
            "alternativeMatches": result.get("alternatives", [])
        }
    except Exception as e:
        logger.error(f"Location resolution error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/process/complaint")
async def process_complaint_full(request: ComplaintProcessRequest):
    """
    Full complaint processing pipeline:
    1. Translation (if needed)
    2. Category classification
    3. Location resolution
    4. Urgency classification
    5. Duplicate detection
    """
    try:
        logger.info(f"Full complaint processing for: {request.call_sid or 'unknown'}")
        
        # Step 1: Translation
        if request.language.lower() != 'en':
            translation_result = await translate_text(TranslationRequest(
                text=request.text,
                source_language=request.language,
                target_language="en"
            ))
            translated_text = translation_result["translated_text"]
        else:
            translated_text = request.text
            translation_result = None
        
        # Step 2: Classification
        classification_result = await classify_complaint(ClassificationRequest(
            text=translated_text,
            language="en"
        ))
        
        # Step 3: Location Resolution
        location_result = await resolve_location(LocationResolutionRequest(
            text=translated_text
        ))
        
        # Step 4: Urgency Classification (placeholder)
        urgency_result = classify_urgency(
            complaint_text=translated_text,
            category=classification_result["category"]["code"],
            category_base_urgency=classification_result["category"]["urgency"]
        )
        
        # Step 5: Duplicate Detection (placeholder)
        duplicate_result = detect_duplicates(
            complaint_text=translated_text,
            category=classification_result["category"]["code"],
            ward_number=location_result.get("wardNumber")
        )
        
        return {
            "translation": translation_result,
            "classification": classification_result,
            "location": location_result,
            "urgency": urgency_result,
            "duplicate": duplicate_result,
            "processed_text": translated_text
        }
    except Exception as e:
        logger.error(f"Full processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/process/detect-duplicate")
async def detect_duplicate(request: DuplicateDetectionRequest):
    """
    Detect if complaint is a duplicate
    Placeholder - will be implemented by teammate
    """
    try:
        result = detect_duplicates(
            complaint_text=request.text,
            category=request.category,
            ward_number=request.ward_number
        )
        return result
    except Exception as e:
        logger.error(f"Duplicate detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/process/classify-urgency")
async def classify_urgency_endpoint(request: UrgencyClassificationRequest):
    """
    Classify complaint urgency
    Placeholder - will be implemented by teammate
    """
    try:
        result = classify_urgency(
            complaint_text=request.text,
            category=request.category,
            category_base_urgency=request.category_base_urgency
        )
        return result
    except Exception as e:
        logger.error(f"Urgency classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Utility Endpoints ====================

@app.get("/api/categories")
async def get_categories():
    """Get list of all complaint categories"""
    # TODO: Load from database or config file
    categories = [
        {"code": "WATER_SUPPLY", "name": "Water Supply", "urgency": "high"},
        {"code": "GARBAGE", "name": "Garbage Collection", "urgency": "medium"},
        {"code": "ROAD", "name": "Road Maintenance", "urgency": "medium"},
        {"code": "STREETLIGHT", "name": "Street Light", "urgency": "low"},
        {"code": "DRAINAGE", "name": "Drainage", "urgency": "high"},
    ]
    return {"categories": categories}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
