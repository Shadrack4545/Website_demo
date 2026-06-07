/**
 * Type definitions for Event Attendance Predictor ML system
 * 
 * This module defines all TypeScript interfaces used across the prediction system:
 * - Student features collection
 * - Event features
 * - Training data format
 * - Model predictions
 * - Evaluation metrics
 */

// ============================================================================
// STUDENT FEATURES
// ============================================================================

export interface StudentFeatures {
  /** Unique student identifier */
  studentId: string;
  
  /** Day of week (0=Monday, 6=Sunday) */
  dayOfWeek: number;
  
  /** Event start time in 24-hour format (0-23) */
  eventStartTime: number;
  
  /** Distance from student accommodation to event venue in kilometers */
  distanceFromAccommodation: number;
  
  /** Historical attendance rate (0-1) calculated from last 3 events */
  previousAttendanceRate: number;
  
  /** Number of exams scheduled in next 7 days (0-7) */
  academicLoad: number;
  
  /** Weather temperature in Celsius at event time */
  weatherTemp: number;
  
  /** Weather condition at event time */
  weatherCondition: 'clear' | 'snow' | 'rain' | 'cloudy';
}

// ============================================================================
// EVENT FEATURES
// ============================================================================

export interface EventFeatures {
  /** Unique event identifier */
  eventId: string;
  
  /** Category/type of the event */
  eventType: 'cultural' | 'academic' | 'sports' | 'networking' | 'social';
  
  /** Lead time: days between RSVP and event date */
  leadTime: number;
  
  /** Whether event has an incentive (free meal, certificate, guest speaker) */
  hasIncentive: boolean;
  
  /** Type of incentive if applicable */
  incentiveType?: 'meal' | 'certificate' | 'speaker' | 'prize' | 'other';
  
  /** Event title/name */
  eventTitle: string;
  
  /** Event date in ISO format */
  eventDate: string;
  
  /** Expected number of invitations sent */
  expectedAttendees: number;
}

// ============================================================================
// COMBINED FEATURES FOR TRAINING
// ============================================================================

export interface CombinedEventStudentFeatures extends StudentFeatures, EventFeatures {
  /** Combined features for a single student + event pair */
}

// ============================================================================
// ATTENDANCE LABEL (GROUND TRUTH)
// ============================================================================

export interface AttendanceLabel {
  /** Unique student identifier */
  studentId: string;
  
  /** Unique event identifier */
  eventId: string;
  
  /** Ground truth label: 1 = attended (checked in), 0 = did not attend */
  attended: 0 | 1;
  
  /** Method used to record attendance */
  checkinMethod: 'qr_code' | 'manual_list' | 'system' | 'other';
  
  /** Timestamp when attendance was recorded */
  timestamp: Date;
}

// ============================================================================
// TRAINING DATA
// ============================================================================

export interface TrainingDataPoint {
  /** Combined features for model input */
  features: CombinedEventStudentFeatures;
  
  /** Ground truth attendance label */
  label: 0 | 1;
}

export interface TrainingDataset {
  /** Array of training data points */
  dataPoints: TrainingDataPoint[];
  
  /** Timestamp when dataset was created */
  createdAt: Date;
  
  /** Number of attended samples */
  positiveSamples: number;
  
  /** Number of non-attended samples */
  negativeSamples: number;
  
  /** Data collection period start date */
  startDate: Date;
  
  /** Data collection period end date */
  endDate: Date;
}

// ============================================================================
// MODEL PREDICTIONS
// ============================================================================

export interface SinglePrediction {
  /** Unique student identifier */
  studentId: string;
  
  /** Unique event identifier */
  eventId: string;
  
  /** Predicted attendance probability (0-1) */
  attendanceProbability: number;
  
  /** Binary prediction (0 or 1) based on threshold */
  predictedAttendance: 0 | 1;
  
  /** Numeric confidence score (0-1) for sorting/filtering */
  confidence: number;

  /** Human-readable confidence from XGBoost probability bands */
  confidenceLevel?: string;
  
  /** Model version used for this prediction */
  modelVersion: string;
  
  /** Timestamp when prediction was made */
  predictionTime: Date;
}

export interface BatchPrediction {
  /** Event identifier */
  eventId: string;
  
  /** Array of individual student predictions */
  predictions: SinglePrediction[];
  
  /** Predicted total attendance count */
  predictedTotalAttendance: number;
  
  /** Predicted attendance percentage */
  predictedAttendanceRate: number;
  
  /** Batch prediction timestamp */
  batchTime: Date | string;
  
  /** Model version used */
  modelVersion: string;

  /** xgboost = live Flask server; fallback = bundled offline estimator */
  source?: 'xgboost' | 'fallback';
}

// ============================================================================
// MODEL EVALUATION METRICS
// ============================================================================

export interface ConfusionMatrix {
  /** True Positives: predicted yes, actually yes */
  truePositives: number;
  
  /** True Negatives: predicted no, actually no */
  trueNegatives: number;
  
  /** False Positives: predicted yes, actually no */
  falsePositives: number;
  
  /** False Negatives: predicted no, actually yes */
  falseNegatives: number;
}

export interface ClassificationMetrics {
  /** Area Under the ROC Curve (0-1, higher is better) */
  auc: number;
  
  /** Accuracy: (TP + TN) / Total (0-1) */
  accuracy: number;
  
  /** Precision: TP / (TP + FP) (0-1) */
  precision: number;
  
  /** Recall/Sensitivity: TP / (TP + FN) (0-1) */
  recall: number;
  
  /** F1 Score: harmonic mean of precision and recall (0-1) */
  f1Score: number;
  
  /** ROC-AUC threshold used */
  threshold: number;
  
  /** Confusion matrix */
  confusionMatrix: ConfusionMatrix;
}

// ============================================================================
// MODEL METADATA
// ============================================================================

export interface FeatureImportance {
  /** Feature name */
  featureName: keyof CombinedEventStudentFeatures;
  
  /** Importance score (typically 0-100 or 0-1) */
  importance: number;
  
  /** Feature description for interpretability */
  description: string;
}

export interface ModelMetadata {
  /** Unique model version identifier */
  modelVersion: string;
  
  /** XGBoost hyperparameters used */
  hyperparameters: {
    maxDepth: number;
    learningRate: number;
    nEstimators: number;
    subsample: number;
    colsampleBytree: number;
    scalePosWeight: number; // For class imbalance
  };
  
  /** Performance metrics on validation set */
  validationMetrics: ClassificationMetrics;
  
  /** Performance metrics on test set */
  testMetrics?: ClassificationMetrics;
  
  /** Feature importance rankings */
  featureImportance: FeatureImportance[];
  
  /** Training dataset statistics */
  trainingDataStats: {
    totalSamples: number;
    positiveSamples: number;
    negativeSamples: number;
    classImbalanceRatio: number;
  };
  
  /** Timestamp when model was trained */
  trainedAt: Date;
  
  /** Training duration in seconds */
  trainingDurationSeconds: number;
  
  /** Date range of training data */
  trainingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  
  /** Model status */
  status: 'active' | 'deprecated' | 'testing' | 'archived';
}

// ============================================================================
// EVALUATION COMPARISON (PREDICTED VS ACTUAL)
// ============================================================================

export interface EventEvaluation {
  /** Event identifier */
  eventId: string;
  
  /** Original batch prediction */
  originalPrediction: BatchPrediction;
  
  /** Actual attendance after event */
  actualAttendance: number;
  
  /** Prediction error percentage */
  predictionErrorPercent: number;
  
  /** Whether prediction was within acceptable range (±20%) */
  withinAcceptableRange: boolean;
  
  /** Individual student evaluations */
  studentEvaluations: Array<{
    studentId: string;
    predictedAttendance: 0 | 1;
    actualAttendance: 0 | 1;
    correct: boolean;
  }>;
  
  /** Overall accuracy for this event */
  eventAccuracy: number;
  
  /** Timestamp of evaluation */
  evaluatedAt: Date;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface PredictionRequest {
  /** Student features */
  studentFeatures: StudentFeatures;
  
  /** Event features */
  eventFeatures: EventFeatures;
}

export interface PredictionResponse {
  /** Individual prediction result */
  prediction: SinglePrediction;
  
  /** Success flag */
  success: boolean;
  
  /** Error message if applicable */
  error?: string;
}

export interface BatchPredictionRequest {
  /** Event identifier */
  eventId: string;
  
  /** Array of students to predict for */
  studentIds: string[];
  
  /** Event features (same for all students) */
  eventFeatures: EventFeatures;
}

export interface BatchPredictionResponse {
  /** Batch prediction result */
  batchPrediction: BatchPrediction;
  
  /** Success flag */
  success: boolean;
  
  /** Error message if applicable */
  error?: string;
}

// ============================================================================
// MODEL TRAINING REQUEST
// ============================================================================

export interface TrainingRequest {
  /** Training dataset */
  dataset: TrainingDataset;
  
  /** Hyperparameters to use */
  hyperparameters?: {
    maxDepth?: number;
    learningRate?: number;
    nEstimators?: number;
    subsample?: number;
    colsampleBytree?: number;
  };
  
  /** Test/validation split ratio (0-1) */
  testSplitRatio?: number;
  
  /** Cross-validation folds */
  cvFolds?: number;
}

export interface TrainingResponse {
  /** Trained model metadata */
  modelMetadata: ModelMetadata;
  
  /** Success flag */
  success: boolean;
  
  /** Error message if applicable */
  error?: string;
}
