/**
 * Predictor Module for Event Attendance Inference
 * 
 * Handles:
 * - Loading trained models
 * - Making single and batch predictions
 * - Feature extraction for real-time inference
 * - Prediction caching and versioning
 */

import type {
  StudentFeatures,
  EventFeatures,
  SinglePrediction,
  BatchPrediction,
  ModelMetadata,
} from '../../types/predictor';
import {
  combineFeatures,
  featuresToNumericArray,
  validateStudentFeatures,
  validateEventFeatures,
} from '../data/data_processor';

// ============================================================================
// PREDICTOR CLASS
// ============================================================================

export class EventAttendancePredictor {
  private modelMetadata: ModelMetadata | null = null;
  private modelLoaded: boolean = false;
  private predictionCache: Map<string, SinglePrediction> = new Map();
  private cacheExpirationMs: number = 3600000; // 1 hour default

  /**
   * Initialize predictor (without loading model)
   */
  constructor() {
    this.modelMetadata = null;
    this.modelLoaded = false;
  }

  /**
   * Load model metadata from file
   * @param metadataPath Path to model metadata JSON
   * @returns Success flag
   */
  async loadModel(metadataPath: string): Promise<boolean> {
    try {
      // In production, this would load from backend API
      // For now, this is a placeholder for the actual implementation
      console.log(`Loading model from: ${metadataPath}`);
      // TODO: Implement actual model loading from backend
      this.modelLoaded = true;
      return true;
    } catch (error) {
      console.error('Failed to load model:', error);
      return false;
    }
  }

  /**
   * Check if model is loaded and ready
   * @returns Model ready status
   */
  isReady(): boolean {
    return this.modelLoaded && this.modelMetadata !== null;
  }

  /**
   * Get current model metadata
   * @returns Model metadata or null
   */
  getModelMetadata(): ModelMetadata | null {
    return this.modelMetadata;
  }

  /**
   * Make a single prediction for one student attending one event
   * @param studentFeatures Student features
   * @param eventFeatures Event features
   * @returns Single prediction result
   */
  async predictAttendance(
    studentFeatures: StudentFeatures,
    eventFeatures: EventFeatures
  ): Promise<SinglePrediction | null> {
    // Validate inputs
    const studentValidation = validateStudentFeatures(studentFeatures);
    if (!studentValidation.valid) {
      console.error('Invalid student features:', studentValidation.errors);
      return null;
    }

    const eventValidation = validateEventFeatures(eventFeatures);
    if (!eventValidation.valid) {
      console.error('Invalid event features:', eventValidation.errors);
      return null;
    }

    // Check cache
    const cacheKey = `${studentFeatures.studentId}|${eventFeatures.eventId}`;
    const cached = this.predictionCache.get(cacheKey);
    if (cached && Date.now() - cached.predictionTime.getTime() < this.cacheExpirationMs) {
      console.log('Returning cached prediction for:', cacheKey);
      return cached;
    }

    try {
      // Combine features
      const combinedFeatures = combineFeatures(studentFeatures, eventFeatures);

      // Convert to numeric array for model input
      const featureArray = featuresToNumericArray(combinedFeatures);

      // Call backend API for prediction
      const prediction = await this.callPredictionAPI(featureArray, studentFeatures.studentId, eventFeatures.eventId);

      if (prediction) {
        // Cache the result
        this.predictionCache.set(cacheKey, prediction);
      }

      return prediction;
    } catch (error) {
      console.error('Prediction error:', error);
      return null;
    }
  }

  /**
   * Make batch predictions for multiple students attending one event
   * @param studentFeaturesList Array of student features
   * @param eventFeatures Event features (same for all students)
   * @returns Batch prediction result
   */
  async predictBatchAttendance(
    studentFeaturesList: StudentFeatures[],
    eventFeatures: EventFeatures
  ): Promise<BatchPrediction | null> {
    if (!this.isReady()) {
      console.error('Model not loaded');
      return null;
    }

    try {
      const predictions: SinglePrediction[] = [];
      let totalPredicted = 0;

      // Make predictions for each student
      for (const studentFeatures of studentFeaturesList) {
        const prediction = await this.predictAttendance(studentFeatures, eventFeatures);
        if (prediction) {
          predictions.push(prediction);
          if (prediction.predictedAttendance === 1) {
            totalPredicted++;
          }
        }
      }

      const attendanceRate = studentFeaturesList.length > 0 ? totalPredicted / studentFeaturesList.length : 0;

      return {
        eventId: eventFeatures.eventId,
        predictions,
        predictedTotalAttendance: totalPredicted,
        predictedAttendanceRate: attendanceRate,
        batchTime: new Date(),
        modelVersion: this.modelMetadata?.modelVersion || 'unknown',
      };
    } catch (error) {
      console.error('Batch prediction error:', error);
      return null;
    }
  }

  /**
   * Get top N features by importance
   * @param n Number of top features
   * @returns Array of top feature importances
   */
  getTopFeatures(n: number = 5): Array<{ name: string; importance: number }> {
    if (!this.modelMetadata) {
      return [];
    }

    return this.modelMetadata.featureImportance.slice(0, n).map((fi: any) => ({
      name: fi.featureName as string,
      importance: fi.importance,
    }));
  }

  /**
   * Clear prediction cache
   */
  clearCache(): void {
    this.predictionCache.clear();
  }

  /**
   * Set cache expiration time in milliseconds
   * @param expirationMs Expiration time in milliseconds
   */
  setCacheExpiration(expirationMs: number): void {
    this.cacheExpirationMs = expirationMs;
  }

  /**
   * Internal: Call backend API for single prediction
   * This would be implemented with actual API calls in production
   * @param featureArray Numeric feature array
   * @param studentId Student identifier
   * @param eventId Event identifier
   * @returns Single prediction or null on error
   */
  private async callPredictionAPI(
    featureArray: number[],
    studentId: string,
    eventId: string
  ): Promise<SinglePrediction | null> {
    try {
      // Call the backend single-predict endpoint (server expects snake_case keys)
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: featureArray,
          student_id: studentId,
          event_id: eventId,
        }),
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        console.error('API error:', response.status, response.statusText, text);
        return null;
      }

      // Read body as text first to avoid JSON parse errors on empty responses
      const bodyText = await response.text();
      if (!bodyText) {
        console.error('Empty response body from /api/predict');
        return null;
      }

      let data: any;
      try {
        data = JSON.parse(bodyText);
      } catch (err) {
        console.error('Failed to parse JSON from /api/predict:', err, 'body:', bodyText);
        return null;
      }

      if (data.error) {
        console.error('API returned error:', data.error);
        return null;
      }

      const probability = data.attendance_probability ?? data.attendanceProbability ?? null;
      const predicted = data.predicted_attendance ?? data.predictedAttendance ?? (probability !== null ? (probability > 0.5 ? 1 : 0) : null);
      const confidence = data.confidence ?? Math.abs((probability ?? 0) - 0.5) * 2;

      // Normalize predictedAttendance to the union type 0 | 1 to satisfy TS types
      const predictedAttendanceNormalized: 0 | 1 = ((): 0 | 1 => {
        if (typeof predicted === 'number') {
          return predicted === 1 ? 1 : 0;
        }
        if (typeof probability === 'number') {
          return probability > 0.5 ? 1 : 0;
        }
        return 0;
      })();

      return {
        studentId,
        eventId,
        attendanceProbability: probability ?? 0,
        predictedAttendance: predictedAttendanceNormalized,
        confidence: confidence,
        modelVersion: data.model_version || data.modelVersion || 'unknown',
        predictionTime: new Date(),
      };
    } catch (error) {
      console.error('API call failed:', error);
      return null;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let predictorInstance: EventAttendancePredictor | null = null;

/**
 * Get or create singleton predictor instance
 * @returns Predictor instance
 */
export function getPredictorInstance(): EventAttendancePredictor {
  if (!predictorInstance) {
    predictorInstance = new EventAttendancePredictor();
  }
  return predictorInstance;
}

/**
 * Initialize predictor (load model on startup)
 * @param modelPath Path to model files
 * @returns Success flag
 */
export async function initializePredictor(modelPath: string = '/models'): Promise<boolean> {
  const predictor = getPredictorInstance();
  return await predictor.loadModel(modelPath);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate simple statistics for a batch of predictions
 * @param predictions Array of predictions
 * @returns Statistics object
 */
export function getPredictionStatistics(predictions: SinglePrediction[]): {
  totalPredictions: number;
  predictedAttendees: number;
  predictedAbsentees: number;
  averageProbability: number;
  averageConfidence: number;
  maxProbability: number;
  minProbability: number;
} {
  if (predictions.length === 0) {
    return {
      totalPredictions: 0,
      predictedAttendees: 0,
      predictedAbsentees: 0,
      averageProbability: 0,
      averageConfidence: 0,
      maxProbability: 0,
      minProbability: 0,
    };
  }

  const attendees = predictions.filter((p) => p.predictedAttendance === 1).length;
  const avgProb = predictions.reduce((sum, p) => sum + p.attendanceProbability, 0) / predictions.length;
  const avgConf = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
  const maxProb = Math.max(...predictions.map((p) => p.attendanceProbability));
  const minProb = Math.min(...predictions.map((p) => p.attendanceProbability));

  return {
    totalPredictions: predictions.length,
    predictedAttendees: attendees,
    predictedAbsentees: predictions.length - attendees,
    averageProbability: avgProb,
    averageConfidence: avgConf,
    maxProbability: maxProb,
    minProbability: minProb,
  };
}

/**
 * Filter predictions by confidence threshold
 * @param predictions Array of predictions
 * @param minConfidence Minimum confidence required (0-1)
 * @returns Filtered predictions
 */
export function filterByConfidence(predictions: SinglePrediction[], minConfidence: number): SinglePrediction[] {
  return predictions.filter((p) => p.confidence >= minConfidence);
}

/**
 * Sort predictions by probability (descending)
 * @param predictions Array of predictions
 * @returns Sorted predictions
 */
export function sortByProbability(predictions: SinglePrediction[]): SinglePrediction[] {
  return [...predictions].sort((a, b) => b.attendanceProbability - a.attendanceProbability);
}

/**
 * Get students most likely to attend
 * @param predictions Array of predictions
 * @param count Number of students to return
 * @returns Top N predictions
 */
export function getTopAttendees(predictions: SinglePrediction[], count: number = 10): SinglePrediction[] {
  return sortByProbability(predictions.filter((p) => p.predictedAttendance === 1)).slice(0, count);
}

/**
 * Get students most likely to NOT attend
 * @param predictions Array of predictions
 * @param count Number of students to return
 * @returns Top N no-show predictions
 */
export function getTopNoShows(predictions: SinglePrediction[], count: number = 10): SinglePrediction[] {
  return sortByProbability(predictions.filter((p) => p.predictedAttendance === 0)).slice(0, count);
}
