# ML Backend - Deployment Guide

This folder contains the Flask API for the Event Attendance Predictor. Use this guide to deploy the backend to Render, Docker, or run locally for development.

## Quick start (local)

1. Create and activate a Python virtual environment.

```powershell
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python server.py
```

The server listens on port 5000 by default. Health endpoint: `GET /api/health`.

## Run with Gunicorn (recommended for production)

```powershell
# from inside ml_backend/
pip install -r requirements.txt
gunicorn "server:app" --bind 0.0.0.0:5000 --workers 2
```

## Docker

Build and run the Docker image locally:

```powershell
# from ml_backend/
docker build -t ml-backend:latest .
docker run -p 5000:5000 ml-backend:latest
```

## Deploying to Render

1. Create a Render account and connect your GitHub repository: https://render.com/
2. Create a new **Web Service** and select your repo and the `ml_backend` directory.
3. For a Python service (no Dockerfile):
  - Build Command: `pip install -r ml_backend/requirements.txt`
  - Start Command: `gunicorn "server:app" --bind 0.0.0.0:$PORT --workers 2`
4. If using the included `Dockerfile`, choose the Docker option when creating the service.
5. Set environment variables in the Render dashboard as needed:
  - `MODEL_PATH` (optional): path to the trained model (defaults to `trained_model.pkl` in this folder)
  - `ML_API_KEY` (optional): secret token for simple auth

## Environment & Security

- The code enables CORS for all origins by default (quick demo). For production, restrict CORS to your frontend domain.
- Add a simple token-based check in `server.py` if you want to require `Authorization: Bearer <token>` for `/api/predict`.

## Endpoints

- `GET /api/health` — Health check
- `GET /api/model_info` — Model metadata and metrics
- `GET /api/feature_importance` — Feature importance JSON
- `POST /api/predict` — Single prediction
- `POST /api/batch_predict` — Batch predictions

## Notes

- Ensure `trained_model.pkl`, `model_metadata.json`, and `feature_importance.json` are present in this folder (they are included in this repo).
- If you change the file layout, set `MODEL_PATH` or pass paths to `AttendancePredictor()` in `server.py`.
# ML Backend - Event Attendance Predictor

## Overview

This backend trains an XGBoost model to predict student attendance at events based on:
- Student profile (previous attendance, academic load, country, program)
- Event characteristics (type, incentives, lead time)
- RSVP status

## Directory Structure

```
ml_backend/
├── data_loader.py          # Load and validate CSV data
├── feature_engineer.py     # Create ML features from raw data
├── train_model.py          # XGBoost training pipeline
├── predictor.py            # Load model and make predictions
├── server.py               # Flask API server
├── requirements.txt        # Python dependencies
├── trained_model.pkl       # Trained model (generated)
├── model_metadata.json     # Model info (generated)
└── feature_importance.json # Feature importance (generated)
```

## Installation

### 1. Create Virtual Environment

```bash
cd ml_backend
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

## Usage

### Step 1: Train Model

```bash
python train_model.py
```

This will:
1. Load student, event, and attendance data from CSV files
2. Validate data integrity
3. Engineer features
4. Train XGBoost model
5. Evaluate performance
6. Save model artifacts

**Expected output:**
```
============================================================
🎓 EVENT ATTENDANCE PREDICTOR - MODEL TRAINING PIPELINE
============================================================

[1/5] Loading data...
✓ Loaded 29 students
✓ Loaded 3 events
✓ Loaded 87 RSVP records

[2/5] Validating data...
✓ All data valid!

[3/5] Engineering features...
✓ Created 87 training samples with 8 features

[4/5] Training model...
🚀 Training XGBoost model...
✓ Model training complete

📊 Model Evaluation:
  Accuracy:  0.857
  Precision: 0.889
  Recall:    0.800
  F1 Score:  0.842
  ROC AUC:   0.900

[5/5] Saving model artifacts...
✓ Model saved
✓ Metadata saved
✓ Feature importance saved

✅ TRAINING COMPLETE!
```

### Step 2: Start API Server

```bash
python server.py
```

The server will run on `http://localhost:5000`

**Available endpoints:**
- `POST /api/predict` - Single prediction
- `POST /api/batch_predict` - Multiple predictions
- `GET /api/model_info` - Model information
- `GET /api/feature_importance` - Feature importance scores

## Data Format

### Input CSV Files (from DATA_TEMPLATES/)

**1_STUDENT_PROFILES_TEMPLATE.csv:**
```
student_id,first_name,last_name,country,program,academic_load,previous_attendance_rate
S001,Ahmad,Fahmy,Egypt,General Medicine,5,0.85
S002,Elijah,Okafor,Nigeria,General Medicine,6,0.90
```

**2_EVENTS_TEMPLATE.csv:**
```
event_id,event_title,event_date,event_type,has_incentive,incentive_type,expected_attendees,lead_time_days
E001,African Day Celebration,2026-05-24,Social and Cultural,1,Food and Drinks,75,12
```

**3_ATTENDANCE_RSVPS_TEMPLATE.csv:**
```
rsvp_id,student_id,event_id,rsvp_status,actual_attendance,checkin_date,checkin_time
R001,S001,E001,attending,1,2026-05-24,16:00
```

## Model Performance

The trained model uses 8 features:
1. **previous_attendance_rate** - How often student attended past events (0-1)
2. **academic_load** - How busy the student is (1-6 scale)
3. **has_incentive** - Whether event has food/prizes (0/1)
4. **event_type_encoded** - Category of event (0-6)
5. **rsvp_status_encoded** - What student said (0-2)
6. **lead_time_days** - Days between announcement and event
7. **day_of_week** - Which day event occurs (0-6)
8. **is_evening_event** - Is it an evening event (0/1)

**Expected metrics:**
- Accuracy: ~85%
- Precision: ~89%
- Recall: ~80%
- F1 Score: ~84%
- ROC AUC: ~90%

## Predictions

The model outputs:
- **Probability (0-1):** Likelihood student will attend
- **Prediction (0/1):** Binary prediction (0=won't attend, 1=will attend)

Example:
```json
{
  "student_id": "S001",
  "event_id": "E001",
  "attendance_probability": 0.92,
  "predicted_attendance": 1,
  "confidence": "high"
}
```

## Troubleshooting

**"ModuleNotFoundError: No module named 'xgboost'"**
- Solution: `pip install -r requirements.txt`

**"FileNotFoundError: DATA_TEMPLATES not found"**
- Solution: Make sure CSV files are in `DATA_TEMPLATES/` directory

**"Invalid RSVP statuses found"**
- Solution: Check RSVP values are exactly: `attending`, `notAttending`, or `maybe`

## Next Steps

1. ✅ Train model: `python train_model.py`
2. ▶️ Start server: `python server.py`
3. 🔗 Connect frontend to backend
4. 📊 Monitor predictions in browser

## Questions?

Check the generated files:
- `model_metadata.json` - Full model metadata
- `feature_importance.json` - Feature importance scores
