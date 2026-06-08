"""Predictor Module
Loads trained model and makes predictions.
Provides improved diagnostics when initialization fails (prints traceback)
and supports overriding model/metadata paths via environment variables.
"""

import os
import pickle
import json
import traceback
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
        # Allow environment variable overrides for deployment flexibility
        model_path = model_path or os.getenv('MODEL_PATH') or str(BASE_DIR / 'trained_model.pkl')
        metadata_path = metadata_path or os.getenv('METADATA_PATH') or str(BASE_DIR / 'model_metadata.json')
        importance_path = importance_path or os.getenv('IMPORTANCE_PATH') or str(BASE_DIR / 'feature_importance.json')

        """Initialize predictor with trained model"""
        self.model = None
        self.metadata = None
        self.feature_importance = None

        # Helper: try multiple candidate paths and return the first that exists
        def _find_existing_path(candidate: str) -> Optional[str]:
            if not candidate:
                return None
            p = Path(candidate)
            if p.exists():
                return str(p)
            return None

        # Build a list of sensible candidate locations (env override handled above)
        candidates = [
            model_path,
            str(BASE_DIR / 'trained_model.pkl'),
            str(BASE_DIR.parent / 'ml_backend' / 'trained_model.pkl'),
            str(Path.cwd() / 'ml_backend' / 'trained_model.pkl'),
            str(Path('/app') / 'ml_backend' / 'trained_model.pkl'),
            str(Path('/app') / 'trained_model.pkl')
        ]

        # Also scan workspace root as a last resort (fast glob, shallow)
        try:
            for p in Path.cwd().rglob('trained_model.pkl'):
                candidates.append(str(p))
                break
        except Exception:
            pass

        # Load model (attempt candidates)
        model_found = None
        for cand in candidates:
            existing = _find_existing_path(cand)
            if existing:
                model_found = existing
                break

        if model_found:
            try:
                print(f"Attempting to load model from: {model_found}")
                with open(model_found, 'rb') as f:
                    self.model = pickle.load(f)
                print(f"Loaded model from {model_found}")
            except Exception as e:
                print(f"Error loading model from {model_found}: {e}")
                traceback.print_exc()
        else:
            print(f"Model file not found. Tried candidates: {candidates}")

        # Load metadata (non-fatal) - try a few candidate locations
        metadata_candidates = [
            metadata_path,
            str(BASE_DIR / 'model_metadata.json'),
            str(BASE_DIR.parent / 'ml_backend' / 'model_metadata.json'),
            str(Path.cwd() / 'ml_backend' / 'model_metadata.json'),
            str(Path('/app') / 'ml_backend' / 'model_metadata.json'),
            str(Path('/app') / 'model_metadata.json')
        ]
        metadata_found = None
        for cand in metadata_candidates:
            if _find_existing_path(cand):
                metadata_found = cand
                break

        if metadata_found:
            try:
                print(f"Attempting to load metadata from: {metadata_found}")
                with open(metadata_found, 'r') as f:
                    self.metadata = json.load(f)
                print(f"Loaded metadata from {metadata_found}")
            except Exception as e:
                print(f"Error loading metadata from {metadata_found}: {e}")
                traceback.print_exc()
        else:
            print(f"Model metadata not found. Tried: {metadata_candidates}")

        # Load feature importance (non-fatal) - try a few candidate locations
        importance_candidates = [
            importance_path,
            str(BASE_DIR / 'feature_importance.json'),
            str(BASE_DIR.parent / 'ml_backend' / 'feature_importance.json'),
            str(Path.cwd() / 'ml_backend' / 'feature_importance.json'),
            str(Path('/app') / 'ml_backend' / 'feature_importance.json'),
            str(Path('/app') / 'feature_importance.json')
        ]
        importance_found = None
        for cand in importance_candidates:
            if _find_existing_path(cand):
                importance_found = cand
                break

        if importance_found:
            try:
                print(f"Attempting to load feature importance from: {importance_found}")
                with open(importance_found, 'r') as f:
                    self.feature_importance = json.load(f)
                print(f"Loaded feature importance from {importance_found}")
            except Exception as e:
                print(f"Error loading feature importance from {importance_found}: {e}")
                traceback.print_exc()
        else:
            print(f"Feature importance file not found. Tried: {importance_candidates}")
    
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
