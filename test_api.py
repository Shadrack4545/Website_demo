"""Test API endpoints"""
import requests
import json
import time

# Wait for server
time.sleep(2)

BASE_URL = "http://localhost:5000"

print("Testing API Endpoints")
print("=" * 60)

# 1. Test health
print("\n[1] Health Check:")
try:
    r = requests.get(f"{BASE_URL}/api/health")
    print(f"  Status: {r.status_code}")
    print(f"  Response: {json.dumps(r.json(), indent=2)}")
except Exception as e:
    print(f"  Error: {e}")

# 2. Test model info
print("\n[2] Model Info:")
try:
    r = requests.get(f"{BASE_URL}/api/model_info")
    print(f"  Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"  Model Version: {data.get('model_version')}")
        print(f"  Accuracy: {data.get('validation_metrics', {}).get('accuracy', 0):.1%}")
except Exception as e:
    print(f"  Error: {e}")

# 3. Test feature importance
print("\n[3] Feature Importance:")
try:
    r = requests.get(f"{BASE_URL}/api/feature_importance")
    print(f"  Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"  Top 3 features: {data.get('top_3_features')}")
except Exception as e:
    print(f"  Error: {e}")

# 4. Test single prediction
print("\n[4] Single Prediction:")
try:
    payload = {
        "student_id": "S001",
        "event_id": "E001",
        "features": [0.85, 0.83, 1.0, 0.0, 0.0, 0.2, 0.0, 0.0]
    }
    r = requests.post(f"{BASE_URL}/api/predict", json=payload)
    print(f"  Status: {r.status_code}")
    print(f"  Response: {json.dumps(r.json(), indent=2)}")
except Exception as e:
    print(f"  Error: {e}")

# 5. Test batch prediction
print("\n[5] Batch Prediction:")
try:
    payload = {
        "event_id": "E001",
        "predictions": [
            {
                "student_id": "S001",
                "features": [0.85, 0.83, 1.0, 0.0, 0.0, 0.2, 0.0, 0.0]
            },
            {
                "student_id": "S002",
                "features": [0.90, 0.67, 1.0, 0.0, 0.5, 0.2, 0.5, 0.0]
            },
            {
                "student_id": "S003",
                "features": [0.35, 1.0, 0.0, 1.0, 2.0, 0.3, 0.7, 1.0]
            }
        ]
    }
    r = requests.post(f"{BASE_URL}/api/batch_predict", json=payload)
    print(f"  Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        print(f"  Event: {data.get('event_id')}")
        print(f"  Total Students: {data.get('total_students')}")
        print(f"  Predicted Attendees: {data.get('predicted_attendees')}")
        print(f"  Predicted Attendance Rate: {data.get('predicted_attendance_rate')}%")
        print(f"  Average Probability: {data.get('average_probability')}")
except Exception as e:
    print(f"  Error: {e}")

print("\n" + "=" * 60)
print("API Testing Complete")
