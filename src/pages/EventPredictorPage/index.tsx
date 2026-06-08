import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useContext';
import PredictionDashboard from './PredictionDashboard';
import EventAnalytics from './EventAnalytics';
import FeatureImportance from './FeatureImportance';
import ModelInfoPanel from '@/components/EventPredictor/ModelInfoPanel';
import { batchPredictAttendance, isMLBackendAvailable } from '@/utils/mlapi';
import type { BatchPredictionResponse, SinglePrediction } from '@/types/predictor';
import { useEvents } from '@/hooks/useContext';
import { getMLStudentProfiles } from '@/utils/mockData';

type TabType = 'predictions' | 'analytics' | 'features';

const EventPredictorPage: React.FC = () => {
  const { t } = useTranslation();
  const { events, getUpcomingEvents } = useEvents();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('predictions');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<SinglePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchResponse, setBatchResponse] = useState<BatchPredictionResponse | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [predictionSource, setPredictionSource] = useState<'xgboost' | 'fallback' | null>(null);

  const upcomingEvents = getUpcomingEvents();

  useEffect(() => {
    isMLBackendAvailable().then(setBackendOnline);
  }, []);

  useEffect(() => {
    if (upcomingEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(upcomingEvents[0].id);
    }
  }, [upcomingEvents, selectedEventId]);

  const fetchPredictions = useCallback(
    async (eventId: string) => {
      const selectedEvent = events.find((e) => e.id === eventId);
      if (!selectedEvent) return;

      setLoading(true);
      setError(null);

      try {
        const allStudents = getMLStudentProfiles();
        if (allStudents.length === 0) {
          setError('No student data available. Seed demo events from Admin → Seed Data first.');
          return;
        }

        const studentList = allStudents.filter((student) => {
          const status = selectedEvent.rsvps?.[student.id];
          return status === 'attending' || status === 'maybe';
        });

        if (studentList.length === 0) {
          setError('No students have RSVP\'d to this event. Use Admin → Seed Data to load demo RSVPs.');
          return;
        }

        const response = await batchPredictAttendance(
          {
            eventId: selectedEvent.id,
            studentIds: studentList.map((s) => s.id),
            eventFeatures: {
              eventId: selectedEvent.id,
              eventType: 'social',
              leadTime: Math.floor(
                (new Date(`${selectedEvent.date}T${selectedEvent.time}`).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              ),
              hasIncentive: false,
              eventTitle: selectedEvent.title,
              eventDate: selectedEvent.date,
              expectedAttendees: studentList.length,
            },
          },
          selectedEvent,
          selectedEvent.rsvps
        );

        const source = response.batchPrediction?.source ?? 'xgboost';
        setBatchResponse(response);
        setPredictions(response.batchPrediction?.predictions || []);
        setPredictionSource(source);
        setBackendOnline(source === 'xgboost');
        setError(null);
      } catch (err) {
        console.error('Error fetching predictions:', err);
        setBackendOnline(false);
        setPredictionSource(null);
        setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
      } finally {
        setLoading(false);
      }
    },
    [events]
  );

  useEffect(() => {
    if (selectedEventId && events.length > 0) {
      fetchPredictions(selectedEventId);
    }
  }, [selectedEventId, events, fetchPredictions]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const selectedEventTitle =
    selectedEvent?.title || t('eventPredictor:selectEvent', { defaultValue: 'Select Event' });

  return (
    // Restrict access to admins and super-admins only
    <div className="min-h-screen page-gradient p-6 transition-colors">
      {!(currentUser && (currentUser.role === 'admin' || currentUser.role === 'super-admin')) ? (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-2">Access restricted</h2>
            <p className="text-sm text-slate-600">This page is available to administrators only. If you believe this is an error, contact a site administrator.</p>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {t('eventPredictor:title', { defaultValue: 'Event Attendance Predictor' })}
            </h1>
            <p className="text-slate-600">{selectedEventTitle}</p>
            <p className="text-sm text-slate-500 mt-2">
              {t('eventPredictor:subtitle', {
                defaultValue: 'XGBoost model — predict student attendance and optimize event planning',
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ModelInfoPanel />
            </div>

            <div className="lg:col-span-2">
              {predictionSource === 'xgboost' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-sm text-green-800">
                  ✓ Live XGBoost model — predictions from Flask API (port 5000)
                </div>
              )}

              {/* Offline estimate banner temporarily disabled for demo stability.
                  To re-enable, restore the `predictionSource === 'fallback'` block.
              {predictionSource === 'fallback' && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6">
                  <p className="font-semibold text-amber-900">Offline estimate mode</p>
                  <p className="text-sm text-amber-800 mt-1">
                    ML server is offline. Showing bundled estimates using the same 8 features and
                    trained feature weights. For live XGBoost predictions, run:
                  </p>
                  <code className="block mt-2 text-xs bg-amber-100 p-2 rounded text-amber-900">npm run dev:all</code>
                </div>
              )}
              */}

              {backendOnline === false && predictionSource === null && !loading && !error && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 text-sm text-slate-600">
                  Checking ML backend… Select an event to load predictions.
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('eventPredictor:selectEvent', { defaultValue: 'Select Event' })}
                </label>
                <select
                  value={selectedEventId || ''}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('eventPredictor:chooseEvent', { defaultValue: 'Choose an event...' })}</option>
                  {upcomingEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {new Date(event.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {upcomingEvents.length === 0 && (
                  <p className="text-sm text-amber-700 mt-2">No upcoming events. Go to Admin → Seed Data to load demo events.</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex border-b border-slate-200">
                  {(['predictions', 'analytics', 'features'] as TabType[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                        activeTab === tab ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t(`eventPredictor:${tab}`, { defaultValue: tab.charAt(0).toUpperCase() + tab.slice(1) })}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {loading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
                        <p className="text-slate-600">{t('eventPredictor:loadingPredictions', { defaultValue: 'Running XGBoost predictions...' })}</p>
                      </div>
                    </div>
                  )}

                  {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-700 font-semibold">{t('eventPredictor:error', { defaultValue: 'Error' })}</p>
                      <p className="text-red-600">{error}</p>
                    </div>
                  )}

                  {!loading && !selectedEventId && (
                    <div className="text-center py-12">
                      <p className="text-slate-500">{t('eventPredictor:selectEventFirst', { defaultValue: 'Select an event to view predictions' })}</p>
                    </div>
                  )}

                  {activeTab === 'predictions' && selectedEventId && !loading && !error && (
                    <PredictionDashboard predictions={predictions} batchResponse={batchResponse} selectedEvent={selectedEvent} />
                  )}

                  {activeTab === 'analytics' && selectedEventId && (
                    <EventAnalytics eventId={selectedEventId} predictions={predictions} selectedEvent={selectedEvent} />
                  )}

                  {activeTab === 'features' && selectedEventId && <FeatureImportance predictions={predictions} eventId={selectedEventId} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPredictorPage;
