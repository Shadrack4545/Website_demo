"""
XGBoost Model Training Module
Trains and evaluates the attendance prediction model
"""

import xgboost as xgb
import numpy as np
import json
import pickle
from datetime import datetime
from typing import Dict, Tuple
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                             f1_score, confusion_matrix, roc_auc_score)

from data_loader import DataLoader
from feature_engineer import FeatureEngineer

class ModelTrainer:
    """Train and evaluate XGBoost model for attendance prediction"""
    
    def __init__(self, random_state: int = 42):
        self.model = None
        self.random_state = random_state
        self.metadata = {}
        self.feature_importance_scores = {}
    
    def train(self, X: np.ndarray, y: np.ndarray, feature_names: list) -> Dict:
        """
        Train XGBoost model
        
        Args:
            X: Feature matrix
            y: Target labels
            feature_names: Names of features
        
        Returns:
            Training metadata
        """
        print("Training XGBoost model...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=self.random_state, stratify=y
        )
        
        print(f"  Train set: {len(X_train)} samples")
        print(f"  Test set: {len(X_test)} samples")
        
        # Create and train model
        self.model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=self.random_state,
            objective='binary:logistic',
            eval_metric='logloss'
        )
        
        self.model.fit(X_train, y_train)
        print("Model training complete")
        
        # Evaluate
        metrics = self._evaluate_model(X_test, y_test, feature_names)
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X, y, cv=5, scoring='accuracy')
        print(f"  Cross-validation accuracy: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")
        
        # Store metadata
        self.metadata = {
            'model_version': '1.0',
            'trained_at': datetime.now().isoformat(),
            'training_samples': len(X),
            'test_samples': len(X_test),
            'hyperparameters': {
                'n_estimators': 100,
                'max_depth': 5,
                'learning_rate': 0.1,
                'objective': 'binary:logistic'
            },
            'validation_metrics': metrics,
            'cross_validation_scores': {
                'mean_accuracy': float(cv_scores.mean()),
                'std_accuracy': float(cv_scores.std())
            }
        }
        
        return self.metadata
    
    def _evaluate_model(self, X_test: np.ndarray, y_test: np.ndarray, 
                        feature_names: list) -> Dict:
        """Evaluate model performance"""
        print("\nModel Evaluation:")
        
        # Predictions
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        
        # Metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba)
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
        
        print(f"  Accuracy:  {accuracy:.3f}")
        print(f"  Precision: {precision:.3f}")
        print(f"  Recall:    {recall:.3f}")
        print(f"  F1 Score:  {f1:.3f}")
        print(f"  ROC AUC:   {roc_auc:.3f}")
        print(f"  Confusion Matrix:")
        print(f"    True Negatives:  {tn}")
        print(f"    False Positives: {fp}")
        print(f"    False Negatives: {fn}")
        print(f"    True Positives:  {tp}")
        
        # Feature importance
        print("\nFeature Importance:")
        importances = self.model.feature_importances_
        for name, importance in zip(feature_names, importances):
            print(f"  {name}: {importance:.3f}")
            self.feature_importance_scores[name] = float(importance)
        
        return {
            'accuracy': float(accuracy),
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1),
            'roc_auc': float(roc_auc),
            'confusion_matrix': {
                'true_negatives': int(tn),
                'false_positives': int(fp),
                'false_negatives': int(fn),
                'true_positives': int(tp)
            }
        }
    
    def save_model(self, model_path: str = 'ml_backend/trained_model.pkl'):
        """Save trained model"""
        print(f"\nSaving model to {model_path}...")
        with open(model_path, 'wb') as f:
            pickle.dump(self.model, f)
        print("Model saved")
    
    def save_metadata(self, metadata_path: str = 'ml_backend/model_metadata.json'):
        """Save model metadata"""
        print(f"Saving metadata to {metadata_path}...")
        with open(metadata_path, 'w') as f:
            json.dump(self.metadata, f, indent=2)
        print("Metadata saved")
    
    def save_feature_importance(self, importance_path: str = 'ml_backend/feature_importance.json'):
        """Save feature importance"""
        print(f"Saving feature importance to {importance_path}...")
        with open(importance_path, 'w') as f:
            json.dump(self.feature_importance_scores, f, indent=2)
        print("Feature importance saved")


def main():
    """Main training pipeline"""
    print("=" * 60)
    print("EVENT ATTENDANCE PREDICTOR - MODEL TRAINING PIPELINE")
    print("=" * 60)
    
    # 1. Load data
    print("\n[1/5] Loading data...")
    loader = DataLoader()
    students, events, attendance = loader.load_all_data()
    
    # 2. Validate data
    print("\n[2/5] Validating data...")
    errors = loader.validate_data()
    if errors:
        print("Data validation failed:")
        for key, error_list in errors.items():
            for error in error_list:
                print(f"  - {error}")
        return False
    
    summary = loader.get_summary()
    print(f"Data valid! Summary: {summary}")
    
    # 3. Engineer features
    print("\n[3/5] Engineering features...")
    engineer = FeatureEngineer(students, events, attendance)
    X, y, feature_names = engineer.create_training_data()
    
    # 4. Train model
    print("\n[4/5] Training model...")
    trainer = ModelTrainer()
    trainer.train(X, y, feature_names)
    
    # 5. Save artifacts
    print("\n[5/5] Saving model artifacts...")
    trainer.save_model()
    trainer.save_metadata()
    trainer.save_feature_importance()
    
    print("\n" + "=" * 60)
    print("TRAINING COMPLETE!")
    print("=" * 60)
    print("\nGenerated files:")
    print("  - ml_backend/trained_model.pkl")
    print("  - ml_backend/model_metadata.json")
    print("  - ml_backend/feature_importance.json")
    print("\nNext: Run FastAPI server to serve predictions")
    
    return True


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
