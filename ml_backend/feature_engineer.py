"""
Feature Engineer Module
Processes raw data and creates ML features for model training
"""

import pandas as pd
import numpy as np
from datetime import datetime
from typing import Tuple, List, Dict
import json

class FeatureEngineer:
    """Engineer features for attendance prediction model"""
    
    # Encoding mappings
    EVENT_TYPE_MAP = {
        'Social and Cultural': 0,
        'Community Event': 1,
        'Entertainment': 2,
        'Workshop': 3,
        'Career': 4,
        'Sports': 5,
        'Other': 6
    }
    
    INCENTIVE_MAP = {
        'Food and Drinks': 0,
        'None': 1,
        'Snacks and Drinks': 2,
        'Certificates': 3,
        'Medals': 4,
        'Money': 5
    }
    
    RSVP_STATUS_MAP = {
        'attending': 0,
        'maybe': 1,
        'notAttending': 2
    }
    
    def __init__(self, students_df: pd.DataFrame, events_df: pd.DataFrame, 
                 attendance_df: pd.DataFrame):
        self.students_df = students_df
        self.events_df = events_df
        self.attendance_df = attendance_df
        self.feature_names = None
        self.feature_importance = {}
    
    def create_training_data(self) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """
        Create training dataset with features and labels
        
        Returns:
            (X, y, feature_names) where:
            - X: feature matrix (n_samples, n_features)
            - y: target labels (0/1 for not attended/attended)
            - feature_names: list of feature names
        """
        print("Engineering features...")
        
        features_list = []
        labels_list = []
        
        # Process each RSVP record
        for idx, row in self.attendance_df.iterrows():
            student_id = row['student_id']
            event_id = row['event_id']
            actual_attendance = row['actual_attendance']
            
            # Get student features
            student = self.students_df[self.students_df['student_id'] == student_id]
            if len(student) == 0:
                continue
            
            student = student.iloc[0]
            
            # Get event features
            event = self.events_df[self.events_df['event_id'] == event_id]
            if len(event) == 0:
                continue
            
            event = event.iloc[0]
            
            # Extract features
            features = self._extract_features(student, event, row)
            if features is not None:
                features_list.append(features)
                labels_list.append(actual_attendance)
        
        X = np.array(features_list)
        y = np.array(labels_list)
        
        self.feature_names = [
            'previous_attendance_rate',
            'academic_load',
            'has_incentive',
            'event_type_encoded',
            'rsvp_status_encoded',
            'lead_time_days',
            'day_of_week',
            'is_evening_event'
        ]
        
        print(f"Created {len(X)} training samples with {len(self.feature_names)} features")
        print(f"  Features: {', '.join(self.feature_names)}")
        print(f"  Class distribution: {(y == 1).sum()} attended, {(y == 0).sum()} didn't attend")
        
        return X, y, self.feature_names
    
    def _extract_features(self, student: pd.Series, event: pd.Series, 
                          attendance: pd.Series) -> np.ndarray:
        """Extract features for a single student-event pair"""
        try:
            features = []
            
            # 1. Previous attendance rate (0-1)
            features.append(float(student['previous_attendance_rate']))
            
            # 2. Academic load (1-6)
            features.append(float(student['academic_load']) / 6.0)  # Normalize to 0-1
            
            # 3. Has incentive (0/1)
            features.append(float(event['has_incentive']))
            
            # 4. Event type (encoded)
            event_type = event['event_type']
            features.append(float(self.EVENT_TYPE_MAP.get(event_type, 6)) / 6.0)
            
            # 5. RSVP status (encoded)
            rsvp_status = attendance['rsvp_status']
            features.append(float(self.RSVP_STATUS_MAP.get(rsvp_status, 2)) / 2.0)
            
            # 6. Lead time in days (normalize to 0-1, assuming max 60 days)
            lead_time = float(event['lead_time_days'])
            features.append(min(lead_time / 60.0, 1.0))
            
            # 7. Day of week (0=Monday, 6=Sunday)
            event_date = pd.to_datetime(event['event_date'])
            day_of_week = event_date.dayofweek
            features.append(float(day_of_week) / 6.0)
            
            # 8. Is evening event (estimate based on date patterns)
            is_evening = 1.0 if event_date.hour >= 18 or 'Movie' in event['event_title'] else 0.0
            features.append(is_evening)
            
            return np.array(features)
        
        except Exception as e:
            print(f"⚠️ Error extracting features: {e}")
            return None
    
    def get_feature_statistics(self) -> Dict:
        """Get statistics about features"""
        stats = {
            'total_features': len(self.feature_names) if self.feature_names else 0,
            'feature_names': self.feature_names,
            'date_range': {
                'earliest': str(self.events_df['event_date'].min()),
                'latest': str(self.events_df['event_date'].max())
            }
        }
        return stats


if __name__ == "__main__":
    from data_loader import DataLoader
    
    # Load data
    loader = DataLoader()
    students, events, attendance = loader.load_all_data()
    
    # Validate
    errors = loader.validate_data()
    if errors:
        print("❌ Data validation failed")
        exit(1)
    
    # Engineer features
    engineer = FeatureEngineer(students, events, attendance)
    X, y, feature_names = engineer.create_training_data()
    
    # Statistics
    stats = engineer.get_feature_statistics()
    print(f"\n📊 Feature Statistics:")
    print(f"  Total features: {stats['total_features']}")
    print(f"  Date range: {stats['date_range']['earliest']} to {stats['date_range']['latest']}")
