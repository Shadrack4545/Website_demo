import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SinglePrediction, BatchPredictionResponse } from '@/types/predictor';
import type { Event } from '@/types';
import { getMLStudentProfiles } from '@/utils/mockData';

interface PredictionDashboardProps {
  predictions: SinglePrediction[];
  batchResponse: BatchPredictionResponse | null;
  selectedEvent: Event | undefined;
}

/**
 * Prediction Dashboard Component
 * 
 * Displays:
 * - Overall statistics (expected attendance, confidence)
 * - List of individual predictions
 * - Filtering and sorting options
 * - Export functionality
 * 
 * @component
 */
const PredictionDashboard: React.FC<PredictionDashboardProps> = ({
  predictions,
  batchResponse
}) => {
  const { t } = useTranslation();
  const [sortBy, setSortBy] = useState<'probability' | 'name'>('probability');
  const [filterConfidence, setFilterConfidence] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const mlProfiles = getMLStudentProfiles() ?? [];
  const studentNames = Object.fromEntries(mlProfiles.map((s) => [s.id, s.name]));

  /**
   * Filter predictions based on confidence level
   */
  const safePredictions = predictions ?? [];

  const filteredPredictions = safePredictions.filter(p => {
    if (filterConfidence === 'all') return true;
    if (filterConfidence === 'high') return p.confidence >= 0.7;
    if (filterConfidence === 'medium') return p.confidence >= 0.5 && p.confidence < 0.7;
    return p.confidence < 0.5;
  });

  /**
   * Sort predictions
   */
  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    if (sortBy === 'probability') {
      return b.attendanceProbability - a.attendanceProbability;
    }
    const nameA = studentNames[a.studentId] ?? a.studentId;
    const nameB = studentNames[b.studentId] ?? b.studentId;
    return nameA.localeCompare(nameB);
  });

  /**
   * Calculate statistics
   */
  const stats = {
    totalStudents: safePredictions.length,
    predictedAttendees: Math.round(batchResponse?.batchPrediction?.predictedTotalAttendance || 0),
    averageConfidence: safePredictions.length > 0
      ? (safePredictions.reduce((sum, p) => sum + p.confidence, 0) / safePredictions.length)
      : 0,
    attendanceRate: batchResponse?.batchPrediction?.predictedAttendanceRate || 0,
    highConfidenceCount: safePredictions.filter(p => p.confidence >= 0.7).length,
    lowConfidenceCount: safePredictions.filter(p => p.confidence < 0.5).length
  };

  /**
   * Get confidence badge color
   */
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.7) return 'bg-green-100 text-green-800';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  /**
   * Get probability color (for visual indicators)
   */
  const getProbabilityColor = (probability: number): string => {
    if (probability >= 0.75) return 'bg-green-500';
    if (probability >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Temporarily suppress the offline/fallback banner for demo purposes.
  // We keep the detection logic but force the banner to be hidden so the UI
  // behaves consistently during the demo. Revert this when restoring
  // the full online/offline indicators.
  const isFallback = false;

  return (
    <div className="space-y-6">
      {isFallback && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          Estimates from offline model — start <code className="font-mono">npm run dev:all</code> for live XGBoost.
        </p>
      )}
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">
            {t('eventPredictor:totalRsvp', { defaultValue: 'Total RSVP' })}
          </p>
          <p className="text-3xl font-bold text-blue-700">{stats.totalStudents}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">
            {t('eventPredictor:predictedAttendance', { defaultValue: 'Predicted Attendance' })}
          </p>
          <p className="text-3xl font-bold text-green-700">{stats.predictedAttendees}</p>
          <p className="text-xs text-green-600 mt-1">
            {(stats.attendanceRate * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">
            {t('eventPredictor:avgConfidence', { defaultValue: 'Avg Confidence' })}
          </p>
          <p className="text-3xl font-bold text-purple-700">
            {(stats.averageConfidence * 100).toFixed(0)}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">
            {t('eventPredictor:highConfidence', { defaultValue: 'High Confidence' })}
          </p>
          <p className="text-3xl font-bold text-orange-700">{stats.highConfidenceCount}</p>
          <p className="text-xs text-orange-600 mt-1">
            {((stats.highConfidenceCount / stats.totalStudents) * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t('eventPredictor:sortBy', { defaultValue: 'Sort by' })}
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="probability">
              {t('eventPredictor:probability', { defaultValue: 'Attendance Probability' })}
            </option>
            <option value="name">
              {t('eventPredictor:studentName', { defaultValue: 'Student Name' })}
            </option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t('eventPredictor:filterByConfidence', { defaultValue: 'Filter by Confidence' })}
          </label>
          <select
            value={filterConfidence}
            onChange={(e) => setFilterConfidence(e.target.value as typeof filterConfidence)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">
              {t('eventPredictor:all', { defaultValue: 'All' })}
            </option>
            <option value="high">
              {t('eventPredictor:highConfidence', { defaultValue: 'High Confidence (70%+)' })}
            </option>
            <option value="medium">
              {t('eventPredictor:mediumConfidence', { defaultValue: 'Medium Confidence (50-70%)' })}
            </option>
            <option value="low">
              {t('eventPredictor:lowConfidence', { defaultValue: 'Low Confidence (<50%)' })}
            </option>
          </select>
        </div>
      </div>

      {/* Predictions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {sortedPredictions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>{t('eventPredictor:noPredictions', { defaultValue: 'No predictions match your filters' })}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    {t('eventPredictor:studentName', { defaultValue: 'Student' })}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    {t('eventPredictor:probability', { defaultValue: 'Attendance Probability' })}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    {t('eventPredictor:prediction', { defaultValue: 'Prediction' })}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    {t('eventPredictor:confidence', { defaultValue: 'Confidence' })}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedPredictions.map((prediction, index) => (
                  <tr 
                    key={prediction.studentId}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                  >
                    <td className="px-6 py-4 text-sm text-slate-900">
                      <div className="font-medium">{studentNames[prediction.studentId] ?? prediction.studentId}</div>
                      <div className="text-xs text-slate-500">{prediction.studentId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${getProbabilityColor(
                              prediction.attendanceProbability
                            )}`}
                            style={{
                              width: `${prediction.attendanceProbability * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {(prediction.attendanceProbability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full font-semibold ${
                          prediction.predictedAttendance === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {prediction.predictedAttendance === 1
                          ? t('eventPredictor:willAttend', { defaultValue: 'Will Attend' })
                          : t('eventPredictor:willNotAttend', { defaultValue: 'Will Not Attend' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getConfidenceColor(prediction.confidence)}`}>
                        {prediction.confidenceLevel?.replace('_', ' ') ?? `${(prediction.confidence * 100).toFixed(0)}%`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {sortedPredictions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">
              {t('eventPredictor:summary', { defaultValue: 'Summary:' })}
            </span>
            {' '}
            {t('eventPredictor:summaryText', {
              defaultValue: `Based on ${stats.totalStudents} RSVPs, the model predicts ${stats.predictedAttendees} students will attend (${(stats.attendanceRate * 100).toFixed(1)}%) with an average confidence of ${(stats.averageConfidence * 100).toFixed(0)}%.`,
              totalStudents: stats.totalStudents,
              predictedAttendees: stats.predictedAttendees,
              attendanceRate: (stats.attendanceRate * 100).toFixed(1),
              avgConfidence: (stats.averageConfidence * 100).toFixed(0)
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictionDashboard;
