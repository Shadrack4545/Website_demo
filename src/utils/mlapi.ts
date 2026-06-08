/**
 * ML API Utilities for Frontend-Backend Communication
 * 
 * Handles HTTP requests to ML backend services for:
 * - Model training
 * - Predictions
 * - Model metadata retrieval
 * - Evaluation results
 */

import type {
  PredictionRequest,
  PredictionResponse,
  BatchPredictionRequest,
  BatchPredictionResponse,
  TrainingRequest,
  TrainingResponse,
  ModelMetadata,
} from '../types/predictor';
import { getMLStudentProfiles } from './mockData';
import { buildMLFeatures, confidenceLabelToScore } from './mlFeatures';
import { runOfflineBatchPredict } from './mlFallback';
import type { Event, RSVPStatus } from '@/types';

// ============================================================================
// API CONFIGURATION
// ============================================================================

// Proxied to Flask (localhost:5000) via vite.config.ts in dev
const FLASK_API_BASE_URL = '/api';
const API_TIMEOUT_MS = 30000; // 30 second timeout

/**
 * Custom error class for API errors
 */
export class MLAPIError extends Error {
  constructor(
    public statusCode: number,
    public endpoint: string,
    message: string
  ) {
    super(`ML API Error [${statusCode}] ${endpoint}: ${message}`);
    this.name = 'MLAPIError';
  }
}

// ============================================================================
// PREDICTION API CALLS
// ============================================================================

/**
 * Make a single prediction request
 * @param request Prediction request with student and event features
 * @returns Prediction response with probability and classification
 */
export async function predictAttendance(request: PredictionRequest): Promise<PredictionResponse> {
  return makeRequest<PredictionResponse>('/predict', 'POST', request);
}

/**
 * Make batch predictions for multiple students
 * @param request Batch prediction request
 * @returns Batch prediction response with all student predictions
 */
export async function batchPredictAttendance(
  request: BatchPredictionRequest,
  event?: Event,
  rsvps?: Record<string, RSVPStatus>
): Promise<BatchPredictionResponse> {
  try {
    const studentsData = getMLStudentProfiles();

    const predictions = request.studentIds.map((studentId: string) => {
      const student = studentsData.find((s) => s.id === studentId);
      const rsvpStatus = rsvps?.[studentId] ?? 'attending';

      const features =
        event && student
          ? buildMLFeatures(student, event, rsvpStatus)
          : buildMLFeatures(
              { id: studentId, previousAttendanceRate: 0.5, academicLoad: 4 },
              {
                id: request.eventId,
                title: request.eventFeatures.eventTitle,
                description: '',
                date: request.eventFeatures.eventDate,
                time: '18:00',
                location: '',
                capacity: 100,
                createdBy: '',
                rsvps: {},
                attendees: [],
                noShows: [],
                status: 'upcoming',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
              rsvpStatus
            );

      return { student_id: studentId, features };
    });
    
    // Make request to Flask backend
    const flaskRequest = {
      event_id: request.eventId,
      predictions: predictions
    };
    
    try {
      const response = await makeRequest<any>('/batch_predict', 'POST', flaskRequest);

      return {
        success: true,
        batchPrediction: {
          eventId: response.event_id,
          predictions: response.predictions
            .filter((pred: { error?: string }) => !pred.error)
            .map((pred: {
              student_id: string;
              attendance_probability: number;
              predicted_attendance: 0 | 1;
              confidence: string;
            }) => ({
              studentId: pred.student_id,
              eventId: response.event_id,
              attendanceProbability: pred.attendance_probability,
              predictedAttendance: pred.predicted_attendance,
              confidence: confidenceLabelToScore(pred.confidence, pred.attendance_probability),
              confidenceLevel: pred.confidence,
              modelVersion: '1.0',
              predictionTime: new Date(),
            })),
          predictedTotalAttendance: response.predicted_attendees,
          predictedAttendanceRate: (response.predicted_attendance_rate ?? 0) / 100,
          batchTime: response.batch_time || new Date().toISOString(),
          modelVersion: '1.0',
          source: 'xgboost',
        },
      };
    } catch (apiError) {
      if (isMLConnectionError(apiError)) {
        console.warn('ML API offline — using bundled fallback estimator');
        return runOfflineBatchPredict(request.eventId, predictions);
      }
      throw apiError;
    }
  } catch (error) {
    console.error('Error in batch predict:', error);
    throw error;
  }
}

function isMLConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes('Cannot connect to ML API') ||
    error.message.includes('Failed to fetch') ||
    error.name === 'AbortError'
  );
}

// ============================================================================
// MODEL MANAGEMENT API CALLS
// ============================================================================

/**
 * Get current active model metadata from Flask backend
 * @returns Model metadata including version, metrics, feature importance
 */
export async function getActiveModel(): Promise<any> {
  const response = await makeRequest<any>('/model_info', 'GET');
  return response;
}

/**
 * Get feature importance from Flask backend
 * @returns Array of features ranked by importance
 */
export async function getModelFeatureImportance(): Promise<any> {
  const response = await makeRequest<any>('/feature_importance', 'GET');
  return response;
}

// ============================================================================
// EVALUATION API CALLS
// ============================================================================

/**
 * Get evaluation metrics for a specific event
 * @param eventId Event identifier
 * @returns Evaluation metrics including prediction accuracy
 */
export async function getEventEvaluation(eventId: string): Promise<{
  eventId: string;
  predictedAttendance: number;
  actualAttendance: number;
  accuracy: number;
  errorPercent: number;
  withinRange: boolean;
}> {
  return makeRequest(`/evaluations/events/${eventId}`, 'GET');
}

/**
 * Get overall model evaluation metrics
 * @returns Aggregated evaluation metrics across all events
 */
export async function getModelEvaluation(): Promise<{
  totalEvaluations: number;
  averageAccuracy: number;
  averageErrorPercent: number;
  withinRangeCount: number;
  withinRangePercent: number;
  lastUpdated: Date;
}> {
  return makeRequest('/evaluations/overall', 'GET');
}

/**
 * Record actual attendance for an event and evaluate predictions
 * @param eventId Event identifier
 * @param attendanceData Actual attendance data
 * @returns Evaluation results
 */
export async function recordEventAttendance(
  eventId: string,
  attendanceData: {
    actualAttendees: string[]; // Student IDs who attended
    totalInvited: number;
  }
): Promise<{
  success: boolean;
  evaluation: any; // Evaluation results
}> {
  return makeRequest(`/evaluations/events/${eventId}/record`, 'POST', attendanceData);
}

// ============================================================================
// DATA MANAGEMENT API CALLS
// ============================================================================

/**
 * Upload training data for model training
 * @param dataFile File to upload
 * @returns Upload confirmation with data statistics
 */
export async function uploadTrainingData(dataFile: File): Promise<{
  success: boolean;
  datasetId: string;
  statistics: {
    totalSamples: number;
    positiveSamples: number;
    negativeSamples: number;
  };
}> {
  const formData = new FormData();
  formData.append('file', dataFile);

  const response = await fetch(`${FLASK_API_BASE_URL}/data/upload`, {
    method: 'POST',
    body: formData,
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new MLAPIError(response.status, '/data/upload', response.statusText);
  }

  return response.json();
}

/**
 * Get data statistics
 * @param datasetId Dataset identifier (optional, gets latest if not provided)
 * @returns Data statistics
 */
export async function getDataStatistics(datasetId?: string): Promise<{
  totalSamples: number;
  positiveSamples: number;
  negativeSamples: number;
  classImbalanceRatio: number;
  dateRange: string;
}> {
  const endpoint = datasetId ? `/data/${datasetId}/statistics` : '/data/statistics';
  return makeRequest(endpoint, 'GET');
}

// ============================================================================
// FEATURE ANALYSIS API CALLS
// ============================================================================

/**
 * Get feature importance for current model
 * @returns Array of features ranked by importance
 */
export async function getFeatureImportance(): Promise<
  Array<{
    featureName: string;
    importance: number;
    description: string;
  }>
> {
  return makeRequest('/analysis/feature-importance', 'GET');
}

/**
 * Get feature correlation analysis
 * @returns Feature correlation matrix
 */
export async function getFeatureCorrelation(): Promise<Record<string, Record<string, number>>> {
  return makeRequest('/analysis/feature-correlation', 'GET');
}

// ============================================================================
// HEALTH CHECK & INFO
// ============================================================================

/**
 * Check ML backend health status
 * @returns Health status
 */
export async function checkMLHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  version?: string;
  modelLoaded?: boolean;
  service?: string;
}> {
  return makeRequest('/health', 'GET');
}

/** Quick connectivity check for the predictions page banner */
export async function isMLBackendAvailable(): Promise<boolean> {
  try {
    const health = await checkMLHealth();
    return health.status === 'healthy';
  } catch {
    return false;
  }
}

// ============================================================================
// INTERNAL UTILITIES
// ============================================================================

/**
 * Generic request maker with error handling and timeout
 * @param endpoint API endpoint path
 * @param method HTTP method
 * @param body Request body (for POST/PUT)
 * @returns Parsed response
 */
async function makeRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<T> {
  const url = `${FLASK_API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    // Read body as text first to avoid unhandled JSON parse errors
    const bodyText = await response.text().catch(() => '');

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errObj = bodyText ? JSON.parse(bodyText) : {};
        errorMessage = errObj.message || errObj.error || errorMessage;
      } catch (e) {
        // leave errorMessage as-is and include raw body in logs
      }
      console.error(`ML API responded with error (${response.status}):`, bodyText);
      throw new MLAPIError(response.status, endpoint, errorMessage || response.statusText);
    }

    if (!bodyText) {
      // No body to parse
      console.warn(`ML API returned empty body for ${endpoint}`);
      // Return an empty object cast to T to avoid downstream JSON parse errors
      return {} as T;
    }

    try {
      const data = JSON.parse(bodyText);
      return data as T;
    } catch (err) {
      console.error('Failed to parse JSON response from ML API:', err, 'body:', bodyText);
      throw err;
    }
  } catch (error) {
    if (error instanceof MLAPIError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to ML API at ${FLASK_API_BASE_URL}. Is the backend running?`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Helper to retry failed API calls with exponential backoff
 * @param fn Function to retry
 * @param maxRetries Maximum number of retries
 * @param initialDelay Initial delay in milliseconds
 * @returns Result of function call
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
