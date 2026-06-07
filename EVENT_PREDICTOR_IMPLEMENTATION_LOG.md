# Event Attendance Predictor - Implementation Log

**Project Start Date:** June 2, 2026
**Course:** Machine Learning Course Project
**Status:** In Development (Phase 1/3)

---

## 📊 Project Overview

### **Problem Statement**
African student community in Vladivostok faces logistical challenges:
- 40-60% of invited students don't attend events despite RSVP
- Leads to 30% wasted resources (food, venue space, materials)
- No way to predict attendance beforehand

### **Solution**
Build an XGBoost-based ML model to forecast student attendance for events, enabling better resource planning and reducing waste by ≥15%.

### **Target Performance Metrics**
- **Technical:** AUC > 0.70 on validation dataset
- **Practical:** Predicted attendance within ±20% of actual (e.g., predict 30, actual within 24-36)
- **Community:** Organizer feedback (Likert scale satisfaction)
- **Real Impact:** ≥15% reduction in resource waste (controlled test)

---

## 📁 Project Architecture

### Directory Structure Created
```
src/
├── ml/
│   ├── data/
│   │   ├── collected_data.json          # Historical event data collection
│   │   ├── student_features.json        # Student profile features
│   │   └── training_data.csv            # Processed training dataset
│   ├── models/
│   │   ├── xgboost_model.pkl           # Trained XGBoost model (binary)
│   │   ├── model_metadata.json         # Model version, metrics, timestamp
│   │   └── feature_importance.json     # Feature importance scores
│   ├── training/
│   │   ├── train_model.py              # Model training script
│   │   ├── data_processor.py           # Data cleaning & feature engineering
│   │   └── evaluation_metrics.py       # AUC, confusion matrix, etc.
│   └── prediction/
│       ├── predictor.py                # Prediction API logic
│       └── feature_extractor.py        # Real-time feature extraction
│
├── pages/
│   └── EventPredictorPage/
│       ├── index.tsx                   # Main predictor page component
│       ├── PredictionDashboard.tsx     # Visualize predictions & metrics
│       ├── EventAnalytics.tsx          # Historical accuracy tracking
│       └── FeatureImportance.tsx       # Show which features matter most
│
├── types/
│   └── predictor.ts                    # TypeScript interfaces for ML data
│
└── utils/
    └── mlapi.ts                        # API calls to ML backend
```

---

## 🔧 Implementation Phases

### **PHASE 1: Backend ML Infrastructure** [IN PROGRESS]
**Goal:** Build core ML training and prediction capabilities

#### 1.1 Data Structures & Types
- [ ] Create TypeScript interfaces for student features
- [ ] Create TypeScript interfaces for event features
- [ ] Create TypeScript interfaces for training data format
- [ ] Create TypeScript interfaces for predictions

#### 1.2 Data Collection Module
- [ ] Design student features collection schema
- [ ] Design event metadata schema
- [ ] Create data validation schema
- [ ] Create historical data aggregation functions

#### 1.3 ML Training Pipeline
- [ ] Create data processor (cleaning, feature engineering)
- [ ] Create XGBoost trainer with hyperparameters
- [ ] Implement cross-validation
- [ ] Create evaluation metrics calculator (AUC, confusion matrix)
- [ ] Save trained model & metadata

#### 1.4 Prediction API
- [ ] Create predictor class with model loading
- [ ] Create real-time feature extraction logic
- [ ] Create prediction endpoint
- [ ] Create batch prediction for multiple students

### **PHASE 2: Frontend Integration** [PENDING]
**Goal:** Build UI for event organizers to see predictions

#### 2.1 Prediction Dashboard
- [ ] Display predicted attendance vs. actual
- [ ] Show prediction confidence scores
- [ ] Show recommended resource allocation
- [ ] Real-time updates

#### 2.2 Historical Analytics
- [ ] Model accuracy tracking over time
- [ ] Confusion matrix visualization
- [ ] AUC score display
- [ ] Feature importance visualization

#### 2.3 Event Integration
- [ ] Show predictions when creating events
- [ ] Show predictions in event details
- [ ] Show attendance prediction when event starts
- [ ] Compare predicted vs. actual after event

### **PHASE 3: Data Collection & Deployment** [PENDING]
**Goal:** Collect real data and integrate with platform

#### 3.1 Student Data Collection
- [ ] Add survey form for student features
- [ ] Integrate academic calendar API
- [ ] Integrate weather API
- [ ] Store student historical attendance

#### 3.2 Event Data Collection
- [ ] Event metadata form (type, incentive, lead time)
- [ ] QR code checkin system
- [ ] Manual attendance list
- [ ] Ground truth label storage

#### 3.3 Model Retraining
- [ ] Batch retraining pipeline (weekly/monthly)
- [ ] Automated evaluation
- [ ] Model versioning
- [ ] Rollback capability

---

## 📝 Features & Data Schema

### **Student Features**
```typescript
interface StudentFeatures {
  studentId: string;
  dayOfWeek: number;              // 0=Monday, 6=Sunday
  eventStartTime: number;          // 0-23 hours
  distanceFromAccommodation: number; // km
  previousAttendanceRate: number;  // 0-1 (last 3 events)
  academicLoad: number;           // 0-7 (exams in next 7 days)
  weatherTemp: number;            // Celsius
  weatherCondition: 'clear' | 'snow' | 'rain'; // from API
}
```

### **Event Features**
```typescript
interface EventFeatures {
  eventId: string;
  eventType: 'cultural' | 'academic' | 'sports' | 'networking';
  leadTime: number;               // days between RSVP and event
  hasIncentive: boolean;          // free meal, certificate, guest?
  incentiveType?: 'meal' | 'certificate' | 'speaker' | 'other';
}
```

### **Target Label**
```typescript
interface AttendanceLabel {
  studentId: string;
  eventId: string;
  attended: 0 | 1;               // 1=checked in, 0=no-show
  checkinMethod: 'qr' | 'manual' | 'system';
  timestamp: Date;
}
```

---

## 🎯 Success Criteria Checklist

### Technical Deliverables
- [ ] Data collection module with validation
- [ ] XGBoost model trained on historical data
- [ ] Evaluation metrics: AUC > 0.70
- [ ] Prediction API with <100ms response time
- [ ] Model versioning & metadata storage
- [ ] Feature importance analysis

### Practical Deliverables
- [ ] Predictions within ±20% of actual for 2 real events
- [ ] Event organizer feedback form (Likert 1-5)
- [ ] Before/after resource usage comparison
- [ ] Documentation of model decisions

### Integration Deliverables
- [ ] Integrated into Event creation workflow
- [ ] Dashboard displaying predictions
- [ ] Historical accuracy tracking
- [ ] Real-time attendance vs. prediction comparison

### Report Deliverables
- [ ] 2-page technical report on model performance
- [ ] Feature importance insights
- [ ] Community feedback summary
- [ ] Recommendations for improvement
- [ ] Lessons learned & ethical considerations

---

## 📋 Implementation Log

### Session 1: June 2, 2026 - Phase 1 Core Infrastructure

**Created Files:**

#### 1. Project Structure & Documentation
1. ✅ Directory structure:
   - `src/ml/` - Machine learning modules
   - `src/ml/data/` - Data processing
   - `src/ml/models/` - Model storage & metadata
   - `src/ml/training/` - Training pipeline
   - `src/ml/prediction/` - Inference engine
   - `src/pages/EventPredictorPage/` - Frontend components

2. ✅ **EVENT_PREDICTOR_IMPLEMENTATION_LOG.md** (this file)
   - Complete project overview and architecture
   - Phase breakdown (1, 2, 3)
   - Success criteria checklist
   - Data schema and feature definitions

#### 2. Type Definitions & Interfaces
3. ✅ **src/types/predictor.ts** (500+ lines)
   - StudentFeatures interface (8 fields)
   - EventFeatures interface (8 fields)
   - AttendanceLabel interface
   - TrainingDataPoint & TrainingDataset
   - SinglePrediction & BatchPrediction
   - ModelMetadata with hyperparameters
   - ConfusionMatrix & ClassificationMetrics
   - FeatureImportance structure
   - EventEvaluation for before/after comparison
   - API request/response types
   - Comprehensive JSDoc comments

#### 3. Data Processing Module
4. ✅ **src/ml/data/data_processor.ts** (600+ lines)
   - Input validation functions:
     - validateStudentFeatures()
     - validateEventFeatures()
     - validateAttendanceLabel()
   - Feature engineering:
     - encodeWeatherCondition() - categorical to numeric
     - encodeEventType() - categorical to numeric
     - encodeIncentiveType() - categorical to numeric
     - combineFeatures() - merge student + event features
     - featuresToNumericArray() - convert to model input format
     - getFeatureNames() - ordered feature labels
   - Dataset creation:
     - createTrainingDataset() - from raw data
     - getDatasetStatistics() - summary stats
     - trainTestSplit() - train/test split with seed
   - Data export:
     - datasetToCSV() - export to CSV format
     - datasetToJSON() - export to JSON format

#### 4. Prediction/Inference Engine
5. ✅ **src/ml/prediction/predictor.ts** (450+ lines)
   - EventAttendancePredictor class:
     - loadModel() - load trained model
     - predictAttendance() - single prediction
     - predictBatchAttendance() - batch predictions
     - getModelMetadata() - retrieve model info
     - getTopFeatures() - feature importance ranking
   - Caching mechanism:
     - In-memory prediction cache (1 hour default)
     - clearCache() - manual cache clearing
     - setCacheExpiration() - configurable TTL
   - Utility functions:
     - getPredictionStatistics() - aggregate stats
     - filterByConfidence() - confidence filtering
     - sortByProbability() - sort predictions
     - getTopAttendees() - likely to attend
     - getTopNoShows() - likely to miss
   - Singleton pattern for global predictor instance

#### 5. ML API Communication Layer
6. ✅ **src/utils/mlapi.ts** (450+ lines)
   - Prediction API calls:
     - predictAttendance() - single prediction
     - batchPredictAttendance() - batch predictions
   - Model management:
     - getActiveModel() - current model metadata
     - getModelByVersion() - specific version
     - listModels() - all available models
     - trainModel() - start training job
     - activateModel() - switch active model
   - Evaluation API:
     - getEventEvaluation() - single event metrics
     - getModelEvaluation() - overall model metrics
     - recordEventAttendance() - record actual attendance
   - Data management:
     - uploadTrainingData() - upload CSV/JSON
     - getDataStatistics() - dataset statistics
   - Feature analysis:
     - getFeatureImportance() - feature rankings
     - getFeatureCorrelation() - correlation matrix
   - Utilities:
     - checkMLHealth() - backend health check
     - withRetry() - retry with exponential backoff
     - Error handling with MLAPIError class
     - Automatic timeout management (30s default)

**Code Statistics:**
- Total lines written: ~2,000
- TypeScript interfaces: 25+
- Functions/methods: 50+
- Type-safe implementations: 100%
- JSDoc comments: Comprehensive

**Key Architecture Decisions:**
1. ✅ Feature encoding: Categorical features encoded to numeric values (reproducible order)
2. ✅ Caching: Prediction caching with TTL to reduce API calls
3. ✅ Error handling: Custom MLAPIError class for better debugging
4. ✅ Validation: Input validation at API boundary
5. ✅ Singleton pattern: Global predictor instance for state management
6. ✅ Retry logic: Exponential backoff for resilience

**Files Modified:**
- None yet (all new files)

**Tests Created:**
- None yet (Phase 1 focuses on infrastructure)

**Next Steps:**
- Create frontend UI components (EventPredictorPage)
- Implement Python backend for XGBoost training
- Create model training script
- Add translation keys for internationalization
- Create evaluation component
- Integrate with EventsPage
- Add data collection forms

---

## 🔗 Related Files

- **Project Description:** `src/utils/Event_predictor_slide.pdf`
- **Ideas Log:** `src/Ideas.txt`
- **Dashboard Integration:** `src/pages/Dashboard.tsx`
- **Event Management:** `src/pages/EventsPage.tsx`

---

## 📚 Technical Stack

- **Frontend:** React + TypeScript + Vite
- **ML:** XGBoost (Python backend or JavaScript port)
- **Data:** JSON + CSV for storage
- **APIs:** Weather API, Academic Calendar API
- **Visualization:** Chart.js / Recharts for metrics

---

## ⚠️ Important Notes

### Data Privacy & Ethics
- Only use aggregated student features (no personal identifying info in training)
- RSVP data used only for attendance prediction (not manipulation)
- Model transparency: always show reasoning to organizers
- Opt-in for students: inform them predictions are being made

### Model Limitations
- XGBoost needs historical data (cold start problem for new events)
- Predictions depend on data quality (missing surveys affect accuracy)
- External factors (emergency, room change) not captured in features
- Model should guide, not replace, organizer intuition

### Deployment Strategy
1. **Beta Phase:** Run in parallel with manual planning (2-3 events)
2. **Testing Phase:** A/B test: one event with predictions, one without
3. **Full Rollout:** Once AUC > 0.70 validated on real data
4. **Monitoring:** Track actual vs. predicted continuously

---

## 📞 Contact & Questions

For questions about this implementation:
- Refer to the project slide: `src/utils/Event_predictor_slide.pdf`
- Check implementation progress in this log
- Review code comments for technical decisions

**Last Updated:** June 2, 2026
**Updated By:** GitHub Copilot
**Status:** Phase 1 - Setup Complete, Ready for Development

---
