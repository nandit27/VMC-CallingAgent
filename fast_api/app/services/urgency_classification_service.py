"""
Urgency Classification Service
Based on ComplaintUrgencyPriority logic - prioritizes complaints based on 
emergency level and category with keyword detection
"""

from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class ComplaintUrgencyPriority:
    """Classify complaint urgency and assign priority"""
    
    def __init__(self):
        # Priority levels: 1=Critical, 2=High, 3=Medium, 4=Low
        self.category_priorities = {
            'FIRE': 1,
            'MEDICAL_EMERGENCY': 1,
            'GAS_LEAK': 1,
            'BUILDING_COLLAPSE': 1,
            'FLOOD': 1,
            'ELECTRICAL_HAZARD': 1,
            'WATER_BURST': 2,
            'SEWAGE_OVERFLOW': 2,
            'ROAD_ACCIDENT': 2,
            'TREE_FALLEN': 2,
            'POWER_OUTAGE': 3,
            'WATER_SUPPLY': 3,
            'DRAINAGE': 3,
            'ROAD_MAINTENANCE': 4,
            'GARBAGE_COLLECTION': 4,
            'GARBAGE': 4,
            'STREET_LIGHT': 4,
            'STREETLIGHT': 4,
            'PLUMBER': 4,
            'OTHER': 4
        }
        
        # Emergency keywords that boost priority
        self.emergency_keywords = [
            'fire', 'emergency', 'urgent', 'danger', 'accident', 'injury', 'death',
            'collapse', 'explosion', 'gas leak', 'flood', 'burst', 'overflow',
            'critical', 'immediate', 'help', 'risk', 'hazard',
            # Hindi
            'आग', 'आपातकाल', 'खतरा', 'दुर्घटना', 'चोट', 'मृत्यु',
            'तुरंत', 'मदद', 'जोखिम',
            # Gujarati
            'આગ', 'કટોકટી', 'ખતરો', 'અકસ્માત', 'ઈજા',
            'તાત્કાલિક', 'મદદ', 'જોખમ'
        ]
    
    def classify_urgency_full(self, complaint: Dict) -> Dict:
        """Classify complaint urgency and assign priority"""
        
        category = complaint.get('category', 'OTHER').upper()
        text = complaint.get('text', '').lower()
        
        # Get base priority from category
        base_priority = self.category_priorities.get(category, 4)
        
        # Check for emergency keywords in text
        has_emergency_keywords = self._check_emergency_keywords(text)
        emergency_keywords_found = self._get_emergency_keywords(text)
        
        # Boost priority if emergency keywords found
        final_priority = max(1, base_priority - 1) if has_emergency_keywords else base_priority
        
        # Convert priority to urgency level
        urgency_level = self._priority_to_urgency(final_priority)
        
        return {
            'priority': final_priority,
            'urgency': urgency_level,
            'category': category,
            'has_emergency_keywords': has_emergency_keywords,
            'emergency_keywords': emergency_keywords_found,
            'base_priority': base_priority,
            'boosted': has_emergency_keywords
        }
    
    def _check_emergency_keywords(self, text: str) -> bool:
        """Check if text contains emergency keywords"""
        return any(keyword in text for keyword in self.emergency_keywords)
    
    def _get_emergency_keywords(self, text: str) -> List[str]:
        """Get list of emergency keywords found in text"""
        return [keyword for keyword in self.emergency_keywords if keyword in text]
    
    def _priority_to_urgency(self, priority: int) -> str:
        """Convert priority number to urgency level"""
        urgency_map = {
            1: 'critical',
            2: 'high',
            3: 'medium',
            4: 'low'
        }
        return urgency_map.get(priority, 'medium')
    
    def _urgency_to_score(self, urgency: str) -> float:
        """Convert urgency level to score (0-1)"""
        score_map = {
            'critical': 1.0,
            'high': 0.75,
            'medium': 0.5,
            'low': 0.25
        }
        return score_map.get(urgency, 0.5)


# Global urgency classifier instance
_urgency_classifier = ComplaintUrgencyPriority()


def classify_urgency(
    complaint_text: str,
    category: str,
    category_base_urgency: str = "medium"
) -> Dict[str, Any]:
    """
    Classify the urgency level of a complaint
    
    Args:
        complaint_text: The complaint description
        category: Complaint category code
        category_base_urgency: Base urgency from category (high/medium/low)
    
    Returns:
        Dict containing:
        - urgency_level: str (critical/high/medium/low)
        - urgency_score: float (0-1)
        - factors: List of factors that influenced urgency
        - escalate: bool - whether to escalate immediately
    """
    
    try:
        logger.info(f"Urgency classification for category: {category}")
        
        # Build complaint object
        complaint = {
            'category': category,
            'text': complaint_text
        }
        
        # Classify urgency
        result = _urgency_classifier.classify_urgency_full(complaint)
        
        # Build response
        urgency_level = result['urgency']
        urgency_score = _urgency_classifier._urgency_to_score(urgency_level)
        
        # Determine factors
        factors = ['category_based']
        if result['has_emergency_keywords']:
            factors.append('emergency_keywords')
        if result['boosted']:
            factors.append('priority_boosted')
        
        logger.info(f"Urgency classified as {urgency_level} (score: {urgency_score})")
        
        return {
            "urgency_level": urgency_level,
            "urgency_score": urgency_score,
            "factors": factors,
            "escalate": urgency_level == "critical",
            "priority": result['priority'],
            "base_priority": result['base_priority'],
            "emergency_keywords_found": result['emergency_keywords'],
            "boosted": result['boosted'],
            "method": "priority-based"
        }
    
    except Exception as e:
        logger.error(f"Urgency classification error: {str(e)}")
        
        # Fallback to category base urgency
        urgency_map = {
            "high": {"level": "high", "score": 0.75},
            "medium": {"level": "medium", "score": 0.5},
            "low": {"level": "low", "score": 0.25}
        }
        
        urgency_info = urgency_map.get(category_base_urgency, urgency_map["medium"])
        
        return {
            "urgency_level": urgency_info["level"],
            "urgency_score": urgency_info["score"],
            "factors": ["category_based", "fallback"],
            "escalate": urgency_info["level"] == "critical",
            "error": str(e),
            "method": "fallback"
        }


def detect_emergency_keywords(text: str) -> List[str]:
    """
    Detect emergency/urgent keywords in complaint text
    
    Args:
        text: Complaint text
    
    Returns:
        List of emergency keywords found
    """
    
    logger.info("Emergency keyword detection called")
    
    text_lower = text.lower()
    return _urgency_classifier._get_emergency_keywords(text_lower)
