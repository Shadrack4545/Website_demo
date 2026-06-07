# Event Attendance Predictor - Quick Reference Guide

**Project Status:** Phase 1 Complete ✅ | Phase 2-3 In Progress

---

## 📂 Key Files Created This Session

### 1. **EVENT_PREDICTOR_IMPLEMENTATION_LOG.md** (Main Tracking Document)
- Complete project overview
- Architecture details
- Implementation checklist
- Success criteria
- **Location:** `PROJECT_ROOT/EVENT_PREDICTOR_IMPLEMENTATION_LOG.md`
- **Purpose:** Your report writing guide - reference this for all project details

### 2. **src/types/predictor.ts** (Type Definitions - 500+ lines)
```typescript
// Student Features (8 fields)
StudentFeatures { studentId, dayOfWeek, eventStartTime, distanceFromAccommodation, 
                  previousAttendanceRate, academicLoad, weatherTemp, weatherCondition }

// Event Features (8 fields)  
EventFeatures { eventId, eventType, leadTime, hasIncentive, incentiveType, 
                eventTitle, eventDate, expectedAttendees }

// Target Label
AttendanceLabel { studentId, eventId, attended (0|1), checkinMethod, timestamp }

// Predictions
SinglePrediction { studentId, eventId, attendanceProbability, predictedAttendance, 
                   confidence, modelVersion, predictionTime }

BatchPrediction { eventId, predictions[], predictedTotalAttendance, 
                  predictedAttendanceRate, batchTime, modelVersion }

// Model Metrics
ModelMetadata { modelVersion, hyperparameters, validationMetrics, testMetrics, 
                featureImportance[], trainingDataStats, trainedAt, trainingDurationSeconds, 
                trainingPeriod, status }

ClassificationMetrics { auc, accuracy, precision, recall, f1Score, threshold, 
                        confusionMatrix }
```

### 3. **src/ml/data/data_processor.ts** (Data Processing - 600+ lines)

**Validation Functions:**
```typescript
validateStudentFeatures(features) → { valid: boolean, errors: string[] }
validateEventFeatures(features) → { valid: boolean, errors: string[] }
validateAttendanceLabel(label) → { valid: boolean, errors: string[] }
```

**Feature Engineering:**
```typescript
combineFeatures(studentFeatures, eventFeatures) → CombinedEventStudentFeatures
featuresToNumericArray(features) → number[] // For model input
getFeatureNames() → string[] // Ordered feature names

// Internal encoding functions
encodeWeatherCondition(condition) → 0|1|2|3
encodeEventType(eventType) → 0|1|2|3|4
encodeIncentiveType(incentiveType) → 0-5
```

**Dataset Operations:**
```typescript
createTrainingDataset(studentList, eventList, labelsList) → TrainingDataset
getDatasetStatistics(dataset) → statistics object
trainTestSplit(dataset, testRatio=0.2) → { trainDataset, testDataset }

// Export formats
datasetToCSV(dataset) → string // CSV format
datasetToJSON(dataset) → string // JSON format
```

### 4. **src/ml/prediction/predictor.ts** (Inference Engine - 450+ lines)

**Main Class: EventAttendancePredictor**
```typescript
class EventAttendancePredictor {
  loadModel(metadataPath) → Promise<boolean>
  isReady() → boolean
  getModelMetadata() → ModelMetadata | null
  
  // Core prediction methods
  predictAttendance(studentFeatures, eventFeatures) → Promise<SinglePrediction>
  predictBatchAttendance(studentList, eventFeatures) → Promise<BatchPrediction>
  
  // Cache management
  clearCache() → void
  setCacheExpiration(expirationMs) → void
  
  // Analysis
  getTopFeatures(n=5) → Array<{ name, importance }>
}
```

**Utility Functions:**
```typescript
getPredictorInstance() → EventAttendancePredictor // Singleton
initializePredictor(modelPath) → Promise<boolean>

getPredictionStatistics(predictions) → { totalPredictions, predictedAttendees, 
                                         averageProbability, averageConfidence, ... }
filterByConfidence(predictions, minConfidence) → SinglePrediction[]
sortByProbability(predictions) → SinglePrediction[]
getTopAttendees(predictions, count=10) → SinglePrediction[]
getTopNoShows(predictions, count=10) → SinglePrediction[]
```

### 5. **src/utils/mlapi.ts** (Backend API Communication - 450+ lines)

**Prediction Endpoints:**
```typescript
predictAttendance(request: PredictionRequest) → Promise<PredictionResponse>
batchPredictAttendance(request: BatchPredictionRequest) → Promise<BatchPredictionResponse>
```

**Model Management:**
```typescript
getActiveModel() → Promise<ModelMetadata>
getModelByVersion(version) → Promise<ModelMetadata>
listModels() → Promise<ModelMetadata[]>
trainModel(request: TrainingRequest) → Promise<TrainingResponse>
activateModel(version) → Promise<{ success, message }>
```

**Evaluation:**
```typescript
getEventEvaluation(eventId) → Promise<evaluation metrics>
getModelEvaluation() → Promise<overall metrics>
recordEventAttendance(eventId, attendanceData) → Promise<{ success, evaluation }>
```

**Data & Analysis:**
```typescript
uploadTrainingData(dataFile: File) → Promise<{ success, datasetId, statistics }>
getDataStatistics(datasetId?) → Promise<statistics>
getFeatureImportance() → Promise<FeatureImportance[]>
getFeatureCorrelation() → Promise<correlation matrix>
checkMLHealth() → Promise<health status>
```

**Utilities:**
```typescript
withRetry(fn, maxRetries=3, initialDelay=1000) → Promise<T> // Exponential backoff
// Error handling via MLAPIError class
```

---

## 🎯 How to Use These Components

### Example 1: Make a Prediction
```typescript
import { EventAttendancePredictor, getPredictorInstance } from '@/ml/prediction/predictor';
import type { StudentFeatures, EventFeatures } from '@/types/predictor';

const predictor = getPredictorInstance();

const studentFeatures: StudentFeatures = {
  studentId: 'STU001',
  dayOfWeek: 3, // Wednesday
  eventStartTime: 18, // 6 PM
  distanceFromAccommodation: 2.5, // km
  previousAttendanceRate: 0.8,
  academicLoad: 2, // exams
  weatherTemp: -5, // Celsius
  weatherCondition: 'snow'
};

const eventFeatures: EventFeatures = {
  eventId: 'EVT001',
  eventType: 'cultural',
  leadTime: 5, // days
  hasIncentive: true,
  incentiveType: 'meal',
  eventTitle: 'African Night Celebration',
  eventDate: '2026-06-10',
  expectedAttendees: 100
};

const prediction = await predictor.predictAttendance(studentFeatures, eventFeatures);
console.log(`Student ${prediction.studentId} has ${prediction.attendanceProbability * 100}% chance of attending`);
```

### Example 2: Process Data for Training
```typescript
import { 
  createTrainingDataset, 
  trainTestSplit, 
  datasetToCSV 
} from '@/ml/data/data_processor';

const trainingDataset = createTrainingDataset(
  studentFeaturesList,
  eventFeaturesList,
  attendanceLabelsList
);

const { trainDataset, testDataset } = trainTestSplit(trainingDataset, 0.2);

const csvContent = datasetToCSV(trainDataset);
// Use CSV for Python XGBoost training
```

### Example 3: Make Batch Predictions for Event
```typescript
import { getPredictorInstance } from '@/ml/prediction/predictor';

const predictor = getPredictorInstance();

const batchPrediction = await predictor.predictBatchAttendance(
  allStudentFeatures, // Array of StudentFeatures
  eventFeatures
);

console.log(`Expected attendance: ${batchPrediction.predictedTotalAttendance}`);
console.log(`Attendance rate: ${(batchPrediction.predictedAttendanceRate * 100).toFixed(1)}%`);
```

### Example 4: Call ML API
```typescript
import { trainModel, getActiveModel, recordEventAttendance } from '@/utils/mlapi';

// Get current model info
const model = await getActiveModel();
console.log(`Model version: ${model.modelVersion}, AUC: ${model.validationMetrics.auc}`);

// Train new model
const trainingResponse = await trainModel({
  dataset: trainingDataset,
  hyperparameters: {
    maxDepth: 6,
    learningRate: 0.1,
    nEstimators: 100
  },
  testSplitRatio: 0.2,
  cvFolds: 5
});

// Record actual attendance after event
await recordEventAttendance('EVT001', {
  actualAttendees: ['STU001', 'STU002', 'STU004'],
  totalInvited: 20
});
```

---

## 📊 Data Schema Quick Reference

### Features Used in Model (12 total)
1. **dayOfWeek** (0-6) - Day of week
2. **eventStartTime** (0-23) - Hour of day
3. **distanceFromAccommodation** (km) - Geographic distance
4. **previousAttendanceRate** (0-1) - Historical attendance
5. **academicLoad** (0-7) - Exams in next 7 days
6. **weatherTemp** (°C) - Temperature
7. **weatherCondition_encoded** (0-3) - Weather type (clear, cloudy, rain, snow)
8. **eventType_encoded** (0-4) - Event category
9. **leadTime** (days) - RSVP to event gap
10. **hasIncentive** (0-1) - Has incentive
11. **incentiveType_encoded** (0-5) - Incentive type
12. **expectedAttendees** (count) - Expected attendance

### Target Label
**attended** (0 or 1)
- 1 = Checked in (attended)
- 0 = No-show (did not attend)

---

## ✅ Phase 1 Completion Status

- ✅ Type definitions (25+ interfaces)
- ✅ Data validation functions
- ✅ Feature engineering pipeline
- ✅ Dataset creation & export
- ✅ Prediction engine with caching
- ✅ ML API communication layer
- ✅ Error handling & retry logic
- ✅ Comprehensive documentation
- ✅ Implementation tracking log

---

## 🔜 What's Next

**Phase 2 - Frontend UI (Coming Soon)**
- Event Predictor Dashboard page
- Prediction visualization
- Historical accuracy charts
- Feature importance display
- Integration with Events page

**Phase 3 - Backend & Deployment (Coming Soon)**
- Python XGBoost training script
- Model storage & versioning
- API endpoint implementation
- Data collection forms
- QR code check-in system

---

## 📝 For Your Report

When writing your report, refer to:
- **Technical Details:** EVENT_PREDICTOR_IMPLEMENTATION_LOG.md (Sections: Features & Data Schema)
- **Architecture:** src/types/predictor.ts (Component diagram)
- **Data Processing:** src/ml/data/data_processor.ts (Feature engineering)
- **Prediction Logic:** src/ml/prediction/predictor.ts (Model inference)
- **API Design:** src/utils/mlapi.ts (Backend communication)

---

**Last Updated:** June 2, 2026
**Prepared By:** GitHub Copilot
**For:** African Students in Vladivostok Platform
