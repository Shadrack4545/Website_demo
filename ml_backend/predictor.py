"""
Predictor Module
Loads trained model and makes predictions
"""

import pickle
import json
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent

class AttendancePredictor:
    """Load trained model and make predictions"""
    
    def __init__(self, model_path: Optional[str] = None,
                 metadata_path: Optional[str] = None,
                 importance_path: Optional[str] = None):
        model_path = model_path or str(BASE_DIR / 'trained_model.pkl')
        metadata_path = metadata_path or str(BASE_DIR / 'model_metadata.json')
        importance_path = importance_path or str(BASE_DIR / 'feature_importance.json')
        """Initialize predictor with trained model"""
        self.model = None
        self.metadata = None
        self.feature_importance = None
        
        # Load model
        try:
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            print(f"Loaded model from {model_path}")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
        
        # Load metadata
        try:
            with open(metadata_path, 'r') as f:
                self.metadata = json.load(f)
            print(f"Loaded metadata from {metadata_path}")
        except Exception as e:
            print(f"Error loading metadata: {e}")
        
        # Load feature importance
        try:
            with open(importance_path, 'r') as f:
                self.feature_importance = json.load(f)
            print(f"Loaded feature importance from {importance_path}")
        except Exception as e:
            print(f"Error loading feature importance: {e}")
    
    def predict_single(self, features: np.ndarray) -> Dict:
        """
        Make prediction for single student-event pair
        
        Args:
            features: array of 8 features
        
        Returns:
            Dict with prediction results
        """
        if self.model is None:
            return {'error': 'Model not loaded'}
        
        # Ensure features is 2D
        if features.ndim == 1:
            features = features.reshape(1, -1)
        
        # Make prediction
        prediction = self.model.predict(features)[0]
        probability = self.model.predict_proba(features)[0]
        
        return {
            'predicted_attendance': int(prediction),
            'attendance_probability': float(probability[1]),
            'no_attendance_probability': float(probability[0]),
            'confidence': self._get_confidence_level(probability[1])
        }
    
    def predict_batch(self, features_list: List[np.ndarray]) -> List[Dict]:
        """
        Make predictions for multiple student-event pairs
        
        Args:
            features_list: list of feature arrays
        
        Returns:
            List of prediction dicts
        """
        if self.model is None:
            return [{'error': 'Model not loaded'}]
        
        predictions = []
        for features in features_list:
            pred = self.predict_single(features)
            predictions.append(pred)
        
        return predictions
    
    def _get_confidence_level(self, probability: float) -> str:
        """Convert probability to confidence level"""
        if probability >= 0.8:
            return 'very_high'
        elif probability >= 0.6:
            return 'high'
        elif probability >= 0.4:
            return 'medium'
        else:
            return 'low'
    
    def get_model_info(self) -> Dict:
        """Get model information"""
        if self.metadata is None:
            return {'error': 'Metadata not loaded'}
        
        return {
            'model_version': self.metadata.get('model_version'),
            'trained_at': self.metadata.get('trained_at'),
            'training_samples': self.metadata.get('training_samples'),
            'test_samples': self.metadata.get('test_samples'),
            'validation_metrics': self.metadata.get('validation_metrics'),
            'cross_validation_scores': self.metadata.get('cross_validation_scores'),
            'hyperparameters': self.metadata.get('hyperparameters')
        }
    
    def get_feature_importance(self) -> Dict:
        """Get feature importance scores"""
        if self.feature_importance is None:
            return {'error': 'Feature importance not loaded'}
        
        # Sort by importance
        sorted_features = sorted(
            self.feature_importance.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return {
            'features': dict(sorted_features),
            'top_3_features': [name for name, _ in sorted_features[:3]]
        }


if __name__ == "__main__":
    # Test predictor
    predictor = AttendancePredictor()
    
    # Example features
    example_features = np.array([
        0.85,  # previous_attendance_rate
        0.83,  # academic_load (5/6)
        1.0,   # has_incentive
        0.0,   # event_type_encoded
        0.0,   # rsvp_status_encoded (attending)
        0.2,   # lead_time_days (12/60)
        0.0,   # day_of_week (Friday)
        0.0    # is_evening_event
    ])
    
    print("\nExample prediction:")
    result = predictor.predict_single(example_features)
    print(f"  Result: {result}")
    
    print("\nModel info:")
    info = predictor.get_model_info()
    print(f"  Accuracy: {info['validation_metrics']['accuracy']:.1%}")
    
    print("\nFeature importance:")
    importance = predictor.get_feature_importance()
    print(f"  Top 3: {importance['top_3_features']}")
