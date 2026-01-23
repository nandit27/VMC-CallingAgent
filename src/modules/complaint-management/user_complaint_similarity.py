#!/usr/bin/env python3
"""
User Complaint Similarity Logic
Checks if two users submitted same complaint based on ward, zone, location, category
"""

from difflib import SequenceMatcher
from typing import Dict, List, Tuple

class UserComplaintSimilarity:
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
    
    def find_duplicate_complaints(self, complaints: List[Dict]) -> List[Dict]:
        """Find all duplicate complaint pairs from list"""
        duplicates = []
        
        for i in range(len(complaints)):
            for j in range(i + 1, len(complaints)):
                result = self.check_user_complaint_similarity(complaints[i], complaints[j])
                
                if result['is_duplicate']:
                    duplicates.append({
                        'complaint1_id': complaints[i].get('id'),
                        'complaint2_id': complaints[j].get('id'),
                        'user1_id': complaints[i].get('user_id'),
                        'user2_id': complaints[j].get('user_id'),
                        'similarity_result': result
                    })
        
        return duplicates
    
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

# Usage example
if __name__ == "__main__":
    similarity_checker = UserComplaintSimilarity()
    
    # Example complaints
    complaint1 = {
        'id': 'C001',
        'user_id': 'U001', 
        'ward': '15',
        'zone': 'West',
        'location': 'Near Sardar Patel Statue',
        'category': 'ROAD_MAINTENANCE',
        'text': 'Road has big pothole'
    }
    
    complaint2 = {
        'id': 'C002',
        'user_id': 'U002',
        'ward': '15', 
        'zone': 'West',
        'location': 'Sardar Patel Statue area',
        'category': 'ROAD_MAINTENANCE', 
        'text': 'Large pothole on road'
    }
    
    result = similarity_checker.check_user_complaint_similarity(complaint1, complaint2)
    print(f"Similarity check result: {result}")