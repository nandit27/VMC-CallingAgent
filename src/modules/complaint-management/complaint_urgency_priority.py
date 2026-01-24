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
            # Critical (1) - Life Safety & Basic Necessities
            'EMERGENCY_DISASTER': 1,        # Emergency & Disaster Management Department
            'MEDICAL_SERVICES': 1,          # Medical Services Department
            'WATER_SUPPLY': 1,              # Water Supply Department
<<<<<<< Updated upstream
            'GAS_UTILITY': 1,               # Gas & Utility Services Department
=======
            'Gas Line': 1,               # Gas & Utility Services Department
>>>>>>> Stashed changes

            # High (2) - Health & Sanitation
            'ELECTRICAL_LIGHTING': 2,       # Electrical / Lighting Department
            'SOLID_WASTE': 2,               # Solid Waste Management Department
            'SANITATION': 2,                # Sanitation & Public Convenience Department
            'PUBLIC_HEALTH': 2,             # Public Health Department

            # Medium (3) - Infrastructure & Mobility
            'ENGINEERING_INFRASTRUCTURE': 3, # Engineering / Infrastructure Department
            'TRANSPORT': 3,                 # Transport Department
            'ANIMAL_CONTROL': 3,            # Animal Control / Veterinary Department

            # Low (4) - Administration & Planning
            'TOWN_PLANNING': 4,             # Town Planning / Encroachment Department
            'HOUSING_URBAN': 4,             # Housing & Urban Development Department
            'GARDEN_RECREATION': 4,         # Garden & Recreation Department
            'CIVIC_ADMINISTRATION': 4,      # Civic Services / Administration Department
            'SMART_CITY_IT': 4,             # Smart City / IT Department
            'FINANCE_BUDGET': 4,            # Finance & Budget Department
            'SOCIAL_WELFARE': 4,            # Social Welfare / Health Schemes Department
            
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