import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { SinglePrediction } from '@/types/predictor';
import type { Event } from '@/types';

interface EventAnalyticsProps {
  eventId?: string;
  predictions: SinglePrediction[];
  selectedEvent: Event | undefined;
}

interface HistoricalData {
  eventId: string;
  predictedAttendance: number;
  actualAttendance: number;
  accuracy: number;
  timestamp: number;
}

/**
 * Event Analytics Component
 * 
 * Displays:
 * - Historical prediction accuracy
 * - Model performance over time
 * - Comparison of predictions vs actual
 * 
 * @component
 */
const EventAnalytics: React.FC<EventAnalyticsProps> = ({
  eventId: _eventId
}) => {
  const { t } = useTranslation();
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(false);

  // Load historical data on mount
  useEffect(() => {
    loadHistoricalData();
  }, []);

  /**
   * Load historical prediction accuracy data
   */
  const loadHistoricalData = () => {
    setLoading(true);
    try {
      // TODO: Load from API or localStorage
      const dataJson = localStorage.getItem('predictionHistory');
      if (dataJson) {
        const data = JSON.parse(dataJson);
        setHistoricalData(data);
      }
    } catch (err) {
      console.error('Error loading historical data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate statistics
   */
  // Guard historical data to avoid runtime errors if localStorage contains unexpected values
  const safeHistorical: HistoricalData[] = Array.isArray(historicalData) ? historicalData : [];

  const stats = {
    averageAccuracy:
      safeHistorical.length > 0
        ? (safeHistorical.reduce((sum, d) => sum + d.accuracy, 0) / safeHistorical.length)
        : 0,
    totalPredictions: safeHistorical.length,
    avgPredictionError:
      safeHistorical.length > 0
        ? (safeHistorical.reduce(
            (sum, d) =>
              sum +
              Math.abs(
                d.predictedAttendance -
                  d.actualAttendance
              ),
            0
          ) / safeHistorical.length)
        : 0
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">
            {t('eventPredictor:averageAccuracy', { defaultValue: 'Average Accuracy' })}
          </p>
          <p className="text-3xl font-bold text-indigo-700">
            {(stats.averageAccuracy * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-indigo-600 mt-1">
            {t('eventPredictor:acrossAllEvents', { defaultValue: 'across all events' })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">
            {t('eventPredictor:totalPredictions', { defaultValue: 'Total Predictions' })}
          </p>
          <p className="text-3xl font-bold text-cyan-700">{stats.totalPredictions}</p>
          <p className="text-xs text-cyan-600 mt-1">
            {t('eventPredictor:completed', { defaultValue: 'completed' })}
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">
            {t('eventPredictor:avgError', { defaultValue: 'Avg Error' })}
          </p>
          <p className="text-3xl font-bold text-amber-700">
            ±{Math.round(stats.avgPredictionError)}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {t('eventPredictor:students', { defaultValue: 'students' })}
          </p>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            {t('eventPredictor:predictionHistory', { defaultValue: 'Prediction History' })}
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <p className="text-slate-500">
              {t('eventPredictor:loadingHistory', { defaultValue: 'Loading history...' })}
            </p>
          </div>
        ) : historicalData.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>
              {t('eventPredictor:noHistoricalData', {
                defaultValue: 'No historical prediction data available yet'
              })}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    {t('eventPredictor:eventId', { defaultValue: 'Event ID' })}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    {t('eventPredictor:predicted', { defaultValue: 'Predicted' })}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    {t('eventPredictor:actual', { defaultValue: 'Actual' })}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    {t('eventPredictor:error', { defaultValue: 'Error' })}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    {t('eventPredictor:accuracy', { defaultValue: 'Accuracy' })}
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    {t('eventPredictor:date', { defaultValue: 'Date' })}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {historicalData
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((data, index) => {
                    const error = Math.abs(
                      data.predictedAttendance - data.actualAttendance
                    );
                    const errorPercentage = (
                      (error / data.actualAttendance) *
                      100
                    ).toFixed(1);

                    return (
                      <tr
                        key={`${data.eventId}-${data.timestamp}`}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                      >
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {data.eventId}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {data.predictedAttendance}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {data.actualAttendance}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full font-semibold ${
                              error <= 5
                                ? 'bg-green-100 text-green-800'
                                : error <= 10
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            ±{error} ({errorPercentage}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-500 transition-all"
                                style={{
                                  width: `${data.accuracy * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              {(data.accuracy * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(data.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Performance Notes */}
      {historicalData.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold text-slate-900 mb-2">
            {t('eventPredictor:insights', { defaultValue: 'Model Insights' })}
          </h4>
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              • {t('eventPredictor:insight1', {
                defaultValue: `The model has predicted attendance for ${stats.totalPredictions} events`
              })}
            </li>
            <li>
              • {t('eventPredictor:insight2', {
                defaultValue: `Average prediction error is ±${Math.round(stats.avgPredictionError)} students`
              })}
            </li>
            <li>
              • {t('eventPredictor:insight3', {
                defaultValue: 'Accuracy improves with more historical data'
              })}
            </li>
            <li>
              • {t('eventPredictor:insight4', {
                defaultValue: 'Use predictions to optimize food and materials'
              })}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default EventAnalytics;
