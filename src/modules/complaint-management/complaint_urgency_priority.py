#!/usr/bin/env python3
"""
Complaint Urgency Priority Logic
Prioritizes complaints based on emergency level and category
"""

from typing import Dict, List
import re

class ComplaintUrgencyPriority:
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
            'ROAD_MAINTENANCE': 4,
            'GARBAGE_COLLECTION': 4,
            'STREET_LIGHT': 4,
            'PLUMBER': 4,
            'OTHER': 4
        }
        
        # Emergency keywords that boost priority
        self.emergency_keywords = [
            'fire', 'emergency', 'urgent', 'danger', 'accident', 'injury', 'death',
            'collapse', 'explosion', 'gas leak', 'flood', 'burst', 'overflow',
            'आग', 'आपातकाल', 'खतरा', 'दुर्घटना', 'चोट', 'मृत्यु',
            'આગ', 'કટોકટી', 'ખતરો', 'અકસ્માત', 'ઈજા'
        ]
    
    def classify_urgency(self, complaint: Dict) -> Dict:
        """Classify complaint urgency and assign priority"""
        
        category = complaint.get('category', 'OTHER').upper()
        text = complaint.get('text', '').lower()
        
        # Get base priority from category
        base_priority = self.category_priorities.get(category, 4)
        
        # Check for emergency keywords in text
        has_emergency_keywords = self._check_emergency_keywords(text)
        
        # Boost priority if emergency keywords found
        final_priority = max(1, base_priority - 1) if has_emergency_keywords else base_priority
        
        # Convert priority to urgency level
        urgency_level = self._priority_to_urgency(final_priority)
        
        return {
            'priority': final_priority,
            'urgency': urgency_level,
            'category': category,
            'has_emergency_keywords': has_emergency_keywords,
            'base_priority': base_priority,
            'boosted': has_emergency_keywords
        }
    
    def prioritize_complaints(self, complaints: List[Dict]) -> List[Dict]:
        """Sort complaints by priority (most urgent first)"""
        
        prioritized = []
        for complaint in complaints:
            urgency_info = self.classify_urgency(complaint)
            complaint_with_priority = {**complaint, **urgency_info}
            prioritized.append(complaint_with_priority)
        
        # Sort by priority (1=highest, 4=lowest)
        return sorted(prioritized, key=lambda x: x['priority'])
    
    def _check_emergency_keywords(self, text: str) -> bool:
        """Check if text contains emergency keywords"""
        return any(keyword in text for keyword in self.emergency_keywords)
    
    def _priority_to_urgency(self, priority: int) -> str:
        """Convert priority number to urgency level"""
        urgency_map = {
            1: 'critical',
            2: 'high', 
            3: 'medium',
            4: 'low'
        }
        return urgency_map.get(priority, 'medium')
    
    def get_priority_stats(self, complaints: List[Dict]) -> Dict:
        """Get priority distribution statistics"""
        stats = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0}
        
        for complaint in complaints:
            urgency_info = self.classify_urgency(complaint)
            urgency = urgency_info['urgency']
            stats[urgency] += 1
        
        return stats

# Usage example
if __name__ == "__main__":
    urgency_classifier = ComplaintUrgencyPriority()
    
    # Example complaints
    complaints = [
        {
            'id': 'C001',
            'category': 'PLUMBER',
            'text': 'Need plumber for tap repair'
        },
        {
            'id': 'C002', 
            'category': 'FIRE',
            'text': 'Fire in building emergency help needed'
        },
        {
            'id': 'C003',
            'category': 'ROAD_MAINTENANCE',
            'text': 'Road has pothole urgent repair needed'
        }
    ]
    
    # Prioritize complaints
    prioritized = urgency_classifier.prioritize_complaints(complaints)
    
    for complaint in prioritized:
        print(f"ID: {complaint['id']}, Priority: {complaint['priority']}, "
              f"Urgency: {complaint['urgency']}, Category: {complaint['category']}")
    
    # Get stats
    stats = urgency_classifier.get_priority_stats(complaints)
    print(f"Priority stats: {stats}")