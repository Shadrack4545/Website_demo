/**
 * Data Processor Module for Event Attendance Predictor
 * 
 * Handles:
 * - Data validation and cleaning
 * - Feature engineering
 * - Dataset creation for training
 * - Preprocessing for predictions
 * 
 * This is a TypeScript utility that interfaces with Python backend for heavy ML work
 */

import type {
  StudentFeatures,
  EventFeatures,
  AttendanceLabel,
  CombinedEventStudentFeatures,
  TrainingDataPoint,
  TrainingDataset,
} from '../../types/predictor';

// ============================================================================
// DATA VALIDATION
// ============================================================================

/**
 * Validates student features for completeness and correctness
 * @param features Student features to validate
 * @returns Validation result with errors
 */
export function validateStudentFeatures(features: Partial<StudentFeatures>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!features.studentId) errors.push('studentId is required');
  if (features.dayOfWeek === undefined || features.dayOfWeek < 0 || features.dayOfWeek > 6) {
    errors.push('dayOfWeek must be between 0-6');
  }
  if (features.eventStartTime === undefined || features.eventStartTime < 0 || features.eventStartTime > 23) {
    errors.push('eventStartTime must be between 0-23');
  }
  if (features.distanceFromAccommodation === undefined || features.distanceFromAccommodation < 0) {
    errors.push('distanceFromAccommodation must be >= 0');
  }
  if (features.previousAttendanceRate === undefined || features.previousAttendanceRate < 0 || features.previousAttendanceRate > 1) {
    errors.push('previousAttendanceRate must be between 0-1');
  }
  if (features.academicLoad === undefined || features.academicLoad < 0 || features.academicLoad > 7) {
    errors.push('academicLoad must be between 0-7');
  }
  if (features.weatherTemp === undefined) {
    errors.push('weatherTemp is required');
  }
  if (!features.weatherCondition || !['clear', 'snow', 'rain', 'cloudy'].includes(features.weatherCondition)) {
    errors.push('weatherCondition must be one of: clear, snow, rain, cloudy');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates event features for completeness and correctness
 * @param features Event features to validate
 * @returns Validation result with errors
 */
export function validateEventFeatures(features: Partial<EventFeatures>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!features.eventId) errors.push('eventId is required');
  if (!features.eventType || !['cultural', 'academic', 'sports', 'networking', 'social'].includes(features.eventType)) {
    errors.push('eventType must be one of: cultural, academic, sports, networking, social');
  }
  if (features.leadTime === undefined || features.leadTime < 0) {
    errors.push('leadTime must be >= 0');
  }
  if (features.hasIncentive === undefined) {
    errors.push('hasIncentive is required');
  }
  if (features.hasIncentive && features.incentiveType && !['meal', 'certificate', 'speaker', 'prize', 'other'].includes(features.incentiveType)) {
    errors.push('incentiveType must be one of: meal, certificate, speaker, prize, other');
  }
  if (!features.eventTitle) errors.push('eventTitle is required');
  if (!features.eventDate) errors.push('eventDate is required');
  if (features.expectedAttendees === undefined || features.expectedAttendees < 0) {
    errors.push('expectedAttendees must be >= 0');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates attendance label
 * @param label Attendance label to validate
 * @returns Validation result with errors
 */
export function validateAttendanceLabel(label: Partial<AttendanceLabel>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!label.studentId) errors.push('studentId is required');
  if (!label.eventId) errors.push('eventId is required');
  if (label.attended !== 0 && label.attended !== 1) {
    errors.push('attended must be 0 or 1');
  }
  if (!label.checkinMethod || !['qr_code', 'manual_list', 'system', 'other'].includes(label.checkinMethod)) {
    errors.push('checkinMethod must be one of: qr_code, manual_list, system, other');
  }
  if (!label.timestamp) errors.push('timestamp is required');

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// FEATURE ENGINEERING
// ============================================================================

/**
 * Encodes categorical weather condition to numeric value
 * @param condition Weather condition string
 * @returns Encoded numeric value
 */
function encodeWeatherCondition(condition: string): number {
  const encoding: Record<string, number> = {
    clear: 0,
    cloudy: 1,
    rain: 2,
    snow: 3,
  };
  return encoding[condition] ?? 0;
}

/**
 * Encodes event type to numeric value
 * @param eventType Event type string
 * @returns Encoded numeric value
 */
function encodeEventType(eventType: string): number {
  const encoding: Record<string, number> = {
    cultural: 0,
    academic: 1,
    sports: 2,
    networking: 3,
    social: 4,
  };
  return encoding[eventType] ?? 0;
}

/**
 * Encodes incentive type to numeric value
 * @param incentiveType Incentive type string
 * @returns Encoded numeric value
 */
function encodeIncentiveType(incentiveType: string | undefined): number {
  if (!incentiveType) return 0;
  const encoding: Record<string, number> = {
    meal: 1,
    certificate: 2,
    speaker: 3,
    prize: 4,
    other: 5,
  };
  return encoding[incentiveType] ?? 0;
}

/**
 * Creates combined features from student and event features
 * Used as input to ML model
 * @param studentFeatures Student features
 * @param eventFeatures Event features
 * @returns Combined features object
 */
export function combineFeatures(
  studentFeatures: StudentFeatures,
  eventFeatures: EventFeatures
): CombinedEventStudentFeatures {
  return {
    ...studentFeatures,
    ...eventFeatures,
  };
}

/**
 * Converts features to numeric array format for XGBoost
 * Order must match training order
 * @param features Combined features
 * @returns Numeric array of features
 */
export function featuresToNumericArray(features: CombinedEventStudentFeatures): number[] {
  return [
    features.dayOfWeek,
    features.eventStartTime,
    features.distanceFromAccommodation,
    features.previousAttendanceRate,
    features.academicLoad,
    features.weatherTemp,
    encodeWeatherCondition(features.weatherCondition),
    encodeEventType(features.eventType),
    features.leadTime,
    features.hasIncentive ? 1 : 0,
    encodeIncentiveType(features.incentiveType),
    features.expectedAttendees,
  ];
}

/**
 * Creates feature names array in same order as featuresToNumericArray
 * @returns Array of feature names
 */
export function getFeatureNames(): string[] {
  return [
    'dayOfWeek',
    'eventStartTime',
    'distanceFromAccommodation',
    'previousAttendanceRate',
    'academicLoad',
    'weatherTemp',
    'weatherCondition_encoded',
    'eventType_encoded',
    'leadTime',
    'hasIncentive',
    'incentiveType_encoded',
    'expectedAttendees',
  ];
}

// ============================================================================
// DATASET CREATION
// ============================================================================

/**
 * Creates training dataset from raw data
 * @param studentFeaturesList Array of student features for multiple records
 * @param eventFeaturesList Array of event features (same order)
 * @param attendanceLabels Array of attendance labels
 * @returns Created training dataset
 */
export function createTrainingDataset(
  studentFeaturesList: StudentFeatures[],
  eventFeaturesList: EventFeatures[],
  attendanceLabels: AttendanceLabel[]
): TrainingDataset {
  if (studentFeaturesList.length !== eventFeaturesList.length) {
    throw new Error('Student and event features lists must have same length');
  }

  if (studentFeaturesList.length !== attendanceLabels.length) {
    throw new Error('Features and labels must have same length');
  }

  // Create label lookup map for O(1) access
  const labelMap = new Map<string, 0 | 1>();
  for (const label of attendanceLabels) {
    const key = `${label.studentId}|${label.eventId}`;
    labelMap.set(key, label.attended);
  }

  // Create training data points
  const dataPoints: TrainingDataPoint[] = [];
  let positiveSamples = 0;
  let negativeSamples = 0;
  let minDate = new Date();
  let maxDate = new Date(0);

  for (let i = 0; i < studentFeaturesList.length; i++) {
    const studentFeatures = studentFeaturesList[i];
    const eventFeatures = eventFeaturesList[i];
    const key = `${studentFeatures.studentId}|${eventFeatures.eventId}`;
    const label = labelMap.get(key);

    if (label === undefined) {
      console.warn(`No label found for student ${studentFeatures.studentId} + event ${eventFeatures.eventId}`);
      continue;
    }

    const combinedFeatures = combineFeatures(studentFeatures, eventFeatures);
    dataPoints.push({
      features: combinedFeatures,
      label,
    });

    if (label === 1) {
      positiveSamples++;
    } else {
      negativeSamples++;
    }

    // Track date range
    const eventDate = new Date(eventFeatures.eventDate);
    if (eventDate < minDate) minDate = eventDate;
    if (eventDate > maxDate) maxDate = eventDate;
  }

  return {
    dataPoints,
    createdAt: new Date(),
    positiveSamples,
    negativeSamples,
    startDate: minDate,
    endDate: maxDate,
  };
}

// ============================================================================
// DATA STATISTICS
// ============================================================================

/**
 * Calculates statistics about a dataset
 * @param dataset Training dataset
 * @returns Statistics object
 */
export function getDatasetStatistics(dataset: TrainingDataset): {
  totalSamples: number;
  positiveSamples: number;
  negativeSamples: number;
  positiveRatio: number;
  negativeRatio: number;
  classImbalanceRatio: number;
  dateRange: string;
} {
  const totalSamples = dataset.positiveSamples + dataset.negativeSamples;
  const positiveRatio = dataset.positiveSamples / totalSamples;
  const negativeRatio = dataset.negativeSamples / totalSamples;
  const classImbalanceRatio = dataset.negativeSamples / dataset.positiveSamples;

  return {
    totalSamples,
    positiveSamples: dataset.positiveSamples,
    negativeSamples: dataset.negativeSamples,
    positiveRatio,
    negativeRatio,
    classImbalanceRatio,
    dateRange: `${dataset.startDate.toISOString().split('T')[0]} to ${dataset.endDate.toISOString().split('T')[0]}`,
  };
}

/**
 * Splits dataset into train/test sets
 * @param dataset Full dataset
 * @param testRatio Ratio of test data (0-1)
 * @returns Object with train and test datasets
 */
export function trainTestSplit(
  dataset: TrainingDataset,
  testRatio: number = 0.2
): {
  trainDataset: TrainingDataset;
  testDataset: TrainingDataset;
} {
  if (testRatio < 0 || testRatio > 1) {
    throw new Error('testRatio must be between 0 and 1');
  }

  // Simple seeded shuffle using Mersenne Twister approach
  const shuffled = [...dataset.dataPoints].sort(() => Math.random() - 0.5);
  const testSize = Math.floor(shuffled.length * testRatio);

  const testDataPoints = shuffled.slice(0, testSize);
  const trainDataPoints = shuffled.slice(testSize);

  // Calculate labels for each split
  const testPositive = testDataPoints.filter((p) => p.label === 1).length;
  const testNegative = testDataPoints.filter((p) => p.label === 0).length;
  const trainPositive = trainDataPoints.filter((p) => p.label === 1).length;
  const trainNegative = trainDataPoints.filter((p) => p.label === 0).length;

  return {
    trainDataset: {
      dataPoints: trainDataPoints,
      createdAt: dataset.createdAt,
      positiveSamples: trainPositive,
      negativeSamples: trainNegative,
      startDate: dataset.startDate,
      endDate: dataset.endDate,
    },
    testDataset: {
      dataPoints: testDataPoints,
      createdAt: dataset.createdAt,
      positiveSamples: testPositive,
      negativeSamples: testNegative,
      startDate: dataset.startDate,
      endDate: dataset.endDate,
    },
  };
}

/**
 * Exports dataset to CSV format
 * @param dataset Training dataset
 * @param includeHeader Whether to include CSV header row
 * @returns CSV string
 */
export function datasetToCSV(dataset: TrainingDataset, includeHeader: boolean = true): string {
  const featureNames = getFeatureNames();
  const lines: string[] = [];

  // Add header
  if (includeHeader) {
    lines.push([...featureNames, 'attended'].join(','));
  }

  // Add data rows
  for (const point of dataset.dataPoints) {
    const numericFeatures = featuresToNumericArray(point.features);
    const row = [...numericFeatures, point.label].join(',');
    lines.push(row);
  }

  return lines.join('\n');
}

/**
 * Exports dataset to JSON format
 * @param dataset Training dataset
 * @returns JSON string
 */
export function datasetToJSON(dataset: TrainingDataset): string {
  return JSON.stringify(dataset, null, 2);
}
