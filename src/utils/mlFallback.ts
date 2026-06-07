/**
 * Offline attendance estimator when the Flask XGBoost server is unavailable.
 * Uses the same 8 features and bundled feature-importance weights from training.
 */

import type { BatchPredictionResponse } from '@/types/predictor';
import bundledImportance from '@/data/mlFeatureImportance.json';
import { ML_FEATURE_NAMES, confidenceLabelToScore } from './mlFeatures';

export type PredictionSource = 'xgboost' | 'fallback';

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function confidenceLevel(probability: number): string {
  if (probability >= 0.8) return 'very_high';
  if (probability >= 0.6) return 'high';
  if (probability >= 0.4) return 'medium';
  return 'low';
}

/**
 * Weighted logistic estimate aligned with trained feature importance.
 * RSVP status is the dominant signal in the real XGBoost model (~61%).
 */
export function predictOfflineFromFeatures(features: number[]): {
  attendanceProbability: number;
  predictedAttendance: 0 | 1;
  confidenceLevel: string;
} {
  const weights = bundledImportance as Record<string, number>;
  let logit = -0.35;

  ML_FEATURE_NAMES.forEach((name, index) => {
    const weight = weights[name] ?? 0;
    const value = features[index] ?? 0;

    if (name === 'rsvp_status_encoded') {
      // Lower encoded RSVP (attending) → higher attendance probability
      logit += (1 - value) * weight * 5.5;
    } else if (name === 'previous_attendance_rate') {
      logit += value * weight * 3.5;
    } else {
      logit += value * weight * 2.5;
    }
  });

  const attendanceProbability = Math.min(0.97, Math.max(0.08, sigmoid(logit)));
  const predictedAttendance = (attendanceProbability >= 0.5 ? 1 : 0) as 0 | 1;
  const level = confidenceLevel(attendanceProbability);

  return { attendanceProbability, predictedAttendance, confidenceLevel: level };
}

export function runOfflineBatchPredict(
  eventId: string,
  studentFeatures: Array<{ student_id: string; features: number[] }>
): BatchPredictionResponse {
  const predictions = studentFeatures.map(({ student_id, features }) => {
    const result = predictOfflineFromFeatures(features);
    return {
      studentId: student_id,
      eventId,
      attendanceProbability: result.attendanceProbability,
      predictedAttendance: result.predictedAttendance,
      confidence: confidenceLabelToScore(result.confidenceLevel, result.attendanceProbability),
      confidenceLevel: result.confidenceLevel,
      modelVersion: 'fallback-1.0',
      predictionTime: new Date(),
    };
  });

  const predictedTotalAttendance = predictions.reduce(
    (sum, p) => sum + p.predictedAttendance,
    0
  );

  return {
    success: true,
    batchPrediction: {
      eventId,
      predictions,
      predictedTotalAttendance,
      predictedAttendanceRate:
        predictions.length > 0 ? predictedTotalAttendance / predictions.length : 0,
      batchTime: new Date().toISOString(),
      modelVersion: 'fallback-1.0',
      source: 'fallback',
    },
  };
}
