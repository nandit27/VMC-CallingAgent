"""
Duplicate Detection Service
Based on UserComplaintSimilarity logic - checks if complaints are duplicates
based on ward, zone, location, category, and text similarity
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from difflib import SequenceMatcher
import logging

from app.DB.mongo import complaints_col

logger = logging.getLogger(__name__)


class UserComplaintSimilarity:
    """Check similarity between user complaints"""
    
    def __init__(self, similarity_threshold: float = 0.8):
        self.similarity_threshold = similarity_threshold
    
    def check_user_complaint_similarity(self, complaint1: Dict, complaint2: Dict) -> Dict:
        """Check if two user complaints are similar"""
        
        # Check exact parameter matches
        ward_match = complaint1.get('ward') == complaint2.get('ward')
        zone_match = complaint1.get('zone') == complaint2.get('zone')
        category_match = complaint1.get('category') == complaint2.get('category')
        
        # Check location similarity
        location_similarity = self._calculate_text_similarity(
            complaint1.get('location', ''),
            complaint2.get('location', '')
        )
        
        # Check complaint text similarity
        text_similarity = self._calculate_text_similarity(
            complaint1.get('text', ''),
            complaint2.get('text', '')
        )
        
        # Determine if complaints are duplicates
        is_duplicate = (
            ward_match and
            zone_match and
            category_match and
            location_similarity >= self.similarity_threshold and
            text_similarity >= self.similarity_threshold
        )
        
        return {
            'is_duplicate': is_duplicate,
            'ward_match': ward_match,
            'zone_match': zone_match,
            'category_match': category_match,
            'location_similarity': round(location_similarity, 3),
            'text_similarity': round(text_similarity, 3),
            'overall_score': self._calculate_overall_score(
                ward_match, zone_match, category_match,
                location_similarity, text_similarity
            )
        }
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts"""
        if not text1 or not text2:
            return 0.0
        
        return SequenceMatcher(None, text1.lower().strip(), text2.lower().strip()).ratio()
    
    def _calculate_overall_score(self, ward_match: bool, zone_match: bool,
                                category_match: bool, location_sim: float, text_sim: float) -> float:
        """Calculate overall similarity score"""
        score = 0
        score += 0.25 if ward_match else 0
        score += 0.25 if zone_match else 0
        score += 0.2 if category_match else 0
        score += 0.15 * location_sim
        score += 0.15 * text_sim
        return round(score, 3)


# Global similarity checker instance
_similarity_checker = UserComplaintSimilarity(similarity_threshold=0.8)


def detect_duplicates(
    complaint_text: str,
    category: str,
    ward_number: Optional[int] = None,
    recent_complaints: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Detect if the complaint is a duplicate of recent complaints
    
    Args:
        complaint_text: The complaint description
        category: Complaint category code
        ward_number: Ward number where complaint is from
        recent_complaints: List of recent complaints to check against
    
    Returns:
        Dict containing:
        - is_duplicate: bool
        - duplicate_of: complaint_id if duplicate found
        - similarity_score: float (0-1)
        - reason: str explaining why it's a duplicate
    """
    
    try:
        logger.info(f"Duplicate detection for category: {category}, ward: {ward_number}")
        
        # Fetch recent complaints from database if not provided
        if recent_complaints is None:
            recent_complaints = _fetch_recent_complaints(ward_number, category)
        
        if not recent_complaints:
            logger.info("No recent complaints found - not a duplicate")
            return {
                "is_duplicate": False,
                "duplicate_of": None,
                "similarity_score": 0.0,
                "reason": "No recent complaints in database",
                "method": "similarity-check"
            }
        
        # Build complaint object for comparison
        new_complaint = {
            'ward': ward_number,
            'category': category,
            'text': complaint_text,
            'zone': None,  # Will be populated from first match if needed
            'location': ''
        }
        
        # Check similarity against each recent complaint
        best_match = None
        highest_score = 0.0
        
        for existing_complaint in recent_complaints:
            # Build existing complaint object
            existing = {
                'ward': existing_complaint.get('location', {}).get('wardNumber'),
                'zone': existing_complaint.get('location', {}).get('zone'),
                'category': existing_complaint.get('category'),
                'text': existing_complaint.get('translatedText') or existing_complaint.get('originalText', ''),
                'location': existing_complaint.get('location', {}).get('landmark', '')
            }
            
            # Update new complaint zone from ward if available
            if new_complaint['zone'] is None and existing['ward'] == ward_number:
                new_complaint['zone'] = existing['zone']
            
            # Check similarity
            similarity_result = _similarity_checker.check_user_complaint_similarity(new_complaint, existing)
            
            if similarity_result['is_duplicate']:
                logger.warning(f"Duplicate found: {existing_complaint.get('complaintId')} "
                             f"(score: {similarity_result['overall_score']})")
                
                return {
                    "is_duplicate": True,
                    "duplicate_of": existing_complaint.get('complaintId'),
                    "similarity_score": similarity_result['overall_score'],
                    "reason": f"Similar complaint found with {similarity_result['text_similarity']:.1%} text similarity",
                    "details": {
                        "ward_match": similarity_result['ward_match'],
                        "zone_match": similarity_result['zone_match'],
                        "category_match": similarity_result['category_match'],
                        "location_similarity": similarity_result['location_similarity'],
                        "text_similarity": similarity_result['text_similarity']
                    },
                    "method": "similarity-check"
                }
            
            # Track best match even if not duplicate
            if similarity_result['overall_score'] > highest_score:
                highest_score = similarity_result['overall_score']
                best_match = existing_complaint
        
        logger.info(f"No duplicate found (highest score: {highest_score:.3f})")
        
        return {
            "is_duplicate": False,
            "duplicate_of": None,
            "similarity_score": highest_score,
            "reason": f"Highest similarity {highest_score:.1%} below duplicate threshold",
            "method": "similarity-check"
        }
    
    except Exception as e:
        logger.error(f"Duplicate detection error: {str(e)}")
        return {
            "is_duplicate": False,
            "duplicate_of": None,
            "similarity_score": 0.0,
            "reason": f"Error during detection: {str(e)}",
            "error": str(e),
            "method": "error"
        }


def find_similar_complaints(
    complaint_text: str,
    category: str,
    ward_number: Optional[int] = None,
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Find similar complaints even if not exact duplicates
    
    Args:
        complaint_text: The complaint description
        category: Complaint category code
        ward_number: Ward number
        limit: Maximum number of similar complaints to return
    
    Returns:
        List of similar complaints with similarity scores
    """
    
    try:
        logger.info(f"Finding similar complaints for category: {category}")
        
        # Fetch recent complaints
        recent_complaints = _fetch_recent_complaints(ward_number, category, days=30)
        
        if not recent_complaints:
            return []
        
        # Build new complaint object
        new_complaint = {
            'ward': ward_number,
            'category': category,
            'text': complaint_text,
            'zone': None,
            'location': ''
        }
        
        # Calculate similarity for all complaints
        similar = []
        for existing in recent_complaints:
            existing_obj = {
                'ward': existing.get('location', {}).get('wardNumber'),
                'zone': existing.get('location', {}).get('zone'),
                'category': existing.get('category'),
                'text': existing.get('translatedText') or existing.get('originalText', ''),
                'location': existing.get('location', {}).get('landmark', '')
            }
            
            similarity_result = _similarity_checker.check_user_complaint_similarity(new_complaint, existing_obj)
            
            if similarity_result['overall_score'] > 0.3:  # At least 30% similar
                similar.append({
                    "complaint_id": existing.get('complaintId'),
                    "category": existing.get('category'),
                    "similarity_score": similarity_result['overall_score'],
                    "text_similarity": similarity_result['text_similarity'],
                    "status": existing.get('status'),
                    "timestamp": existing.get('timestamp'),
                    "text": (existing.get('translatedText') or existing.get('originalText', ''))[:100]
                })
        
        # Sort by similarity and return top results
        similar.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return similar[:limit]
    
    except Exception as e:
        logger.error(f"Error finding similar complaints: {str(e)}")
        return []


def _fetch_recent_complaints(
    ward_number: Optional[int],
    category: str,
    days: int = 7
) -> List[Dict[str, Any]]:
    """Fetch recent complaints from database"""
    try:
        # Calculate date threshold
        date_threshold = datetime.utcnow() - timedelta(days=days)
        
        # Build query
        query = {
            "timestamp": {"$gte": date_threshold},
            "status": {"$nin": ["resolved", "closed"]}
        }
        
        if ward_number:
            query["location.wardNumber"] = ward_number
        
        if category:
            query["category"] = category
        
        # Fetch from database
        complaints = list(complaints_col.find(query).limit(100))
        
        logger.info(f"Fetched {len(complaints)} recent complaints from database")
        return complaints
    
    except Exception as e:
        logger.error(f"Error fetching recent complaints: {str(e)}")
        return []
