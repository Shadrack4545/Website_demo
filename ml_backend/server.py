"""
Flask API Server for Event Attendance Predictor
Serves predictions to frontend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from typing import Dict, List
import json

from predictor import AttendancePredictor

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize predictor
predictor = None

def init_predictor():
    """Initialize predictor on startup"""
    global predictor
    try:
        predictor = AttendancePredictor()
        print("Predictor initialized successfully")
        return True
    except Exception as e:
        print(f"Failed to initialize predictor: {e}")
        return False

# Ensure predictor is initialized when the module is imported (works under gunicorn)
if not init_predictor():
    print("Warning: predictor failed to initialize at import time. It will be initialized on first request if possible.")

# ============================================================================
# HEALTH & INFO ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Event Attendance Predictor API',
        'version': '1.0'
    }), 200

@app.route('/api/model_info', methods=['GET'])
def model_info():
    """Get model information"""
    if predictor is None:
        return jsonify({'error': 'Predictor not initialized'}), 500
    
    info = predictor.get_model_info()
    return jsonify(info), 200

@app.route('/api/feature_importance', methods=['GET'])
def feature_importance():
    """Get feature importance"""
    if predictor is None:
        return jsonify({'error': 'Predictor not initialized'}), 500
    
    importance = predictor.get_feature_importance()
    return jsonify(importance), 200

# ============================================================================
# PREDICTION ENDPOINTS
# ============================================================================

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Single prediction endpoint
    
    Request body:
    {
        "student_id": "S001",
        "event_id": "E001",
        "features": [0.85, 0.83, 1.0, 0.0, 0.0, 0.2, 0.0, 0.0]
    }
    """
    if predictor is None:
        return jsonify({'error': 'Predictor not initialized'}), 500
    
    try:
        data = request.get_json()
        
        # Validate input
        if 'features' not in data:
            return jsonify({'error': 'Missing features in request'}), 400
        
        features = np.array(data['features'], dtype=np.float32)
        
        if features.shape[0] != 8:
            return jsonify({'error': f'Expected 8 features, got {features.shape[0]}'}), 400
        
        # Make prediction
        result = predictor.predict_single(features)
        
        # Add request data
        result['student_id'] = data.get('student_id')
        result['event_id'] = data.get('event_id')
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/batch_predict', methods=['POST'])
def batch_predict():
    """
    Batch prediction endpoint for multiple students
    
    Request body:
    {
        "event_id": "E001",
        "predictions": [
            {
                "student_id": "S001",
                "features": [0.85, 0.83, 1.0, 0.0, 0.0, 0.2, 0.0, 0.0]
            },
            {
                "student_id": "S002",
                "features": [0.90, 0.67, 1.0, 0.0, 0.5, 0.2, 0.5, 0.0]
            }
        ]
    }
    """
    if predictor is None:
        return jsonify({'error': 'Predictor not initialized'}), 500
    
    try:
        data = request.get_json()
        
        # Validate input
        if 'predictions' not in data:
            return jsonify({'error': 'Missing predictions in request'}), 400
        
        event_id = data.get('event_id')
        predictions_data = data['predictions']
        
        if not isinstance(predictions_data, list):
            return jsonify({'error': 'predictions must be a list'}), 400
        
        # Make predictions
        results = []
        predicted_attendees = 0
        total_probability = 0
        
        for pred_data in predictions_data:
            try:
                features = np.array(pred_data['features'], dtype=np.float32)
                student_id = pred_data.get('student_id')
                
                # Make prediction
                result = predictor.predict_single(features)
                result['student_id'] = student_id
                result['event_id'] = event_id
                
                results.append(result)
                
                # Aggregate stats
                predicted_attendees += result['predicted_attendance']
                total_probability += result['attendance_probability']
            
            except Exception as e:
                results.append({
                    'student_id': pred_data.get('student_id'),
                    'error': str(e)
                })
        
        # Calculate batch statistics
        batch_stats = {
            'event_id': event_id,
            'total_students': len(results),
            'predicted_attendees': int(predicted_attendees),
            'predicted_attendance_rate': round(predicted_attendees / len(results) * 100, 1) if results else 0,
            'average_probability': round(total_probability / len(results), 3) if results else 0,
            'predictions': results
        }
        
        return jsonify(batch_stats), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'message': 'Check the API documentation for available endpoints'
    }), 404

@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal server error',
        'message': str(error)
    }), 500

# ============================================================================
# STARTUP & SHUTDOWN
# ============================================================================

@app.before_request
def before_request():
    """Before each request"""
    pass

@app.teardown_appcontext
def teardown_db(exception):
    """Cleanup after request"""
    pass

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("EVENT ATTENDANCE PREDICTOR - FLASK API SERVER")
    print("=" * 60)
    
    # Initialize predictor
    if not init_predictor():
        print("Failed to initialize predictor. Exiting.")
        exit(1)
    
    print("\nAvailable endpoints:")
    print("  GET  /api/health              - Health check")
    print("  GET  /api/model_info          - Model information")
    print("  GET  /api/feature_importance  - Feature importance")
    print("  POST /api/predict             - Single prediction")
    print("  POST /api/batch_predict       - Batch predictions")
    
    print("\nStarting server on http://localhost:5000")
    print("=" * 60)
    
    # Run server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        use_reloader=False
    )
