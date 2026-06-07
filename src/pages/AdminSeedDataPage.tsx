/**
 * AdminSeedDataPage - Seed database with test events for demo/testing
 *
 * ADMIN-ONLY PAGE
 * Populates 3 demo events with pre-filled RSVPs for the ML predictor.
 */

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, useEvents } from '../hooks/useContext';
import {
  allDemoEventsPresent,
  buildDemoEventSeeds,
  countPredictionEligibleRsvps,
  formatDemoDate,
  getDemoSeedStats,
  getMissingDemoEvents,
} from '../utils/demoSeed';
import { ensureMockStudents } from '../utils/mockData';

interface SeedStatus {
  isLoading: boolean;
  message: string;
  success: boolean | null;
  eventCount: number;
}

export default function AdminSeedDataPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { events, createEvent } = useEvents();
  const [status, setStatus] = useState<SeedStatus>({
    isLoading: false,
    message: '',
    success: null,
    eventCount: 0,
  });

  const demoSeeds = useMemo(() => buildDemoEventSeeds(), []);
  const demoStats = useMemo(() => getDemoSeedStats(), []);
  const alreadySeeded = allDemoEventsPresent(events);
  const missingCount = getMissingDemoEvents(events).length;

  if (
    !currentUser ||
    (currentUser.role !== 'admin' &&
      currentUser.role !== 'leader' &&
      currentUser.role !== 'super-admin')
  ) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
        <p className="text-red-700 mb-4">
          Only administrators can access this page. Your role:{' '}
          <strong>
            {currentUser?.role
              ? t(`verification.role_${currentUser.role}`)
              : 'unknown'}
          </strong>
        </p>
      </div>
    );
  }

  const seedTestEvents = () => {
    const toCreate = getMissingDemoEvents(events);

    if (toCreate.length === 0) {
      setStatus({
        isLoading: false,
        message: 'ℹ️ All 3 demo events already exist — nothing to add.',
        success: true,
        eventCount: 0,
      });
      return;
    }

    setStatus({
      isLoading: true,
      message: 'Seeding test events...',
      success: null,
      eventCount: 0,
    });

    try {
      ensureMockStudents();

      let createdCount = 0;
      toCreate.forEach((seed) => {
        const { rsvps, ...eventFields } = seed;
        createEvent({
          ...eventFields,
          createdBy: currentUser.id,
          rsvps,
        });
        createdCount++;
      });

      const skipped = demoSeeds.length - createdCount;
      setStatus({
        isLoading: false,
        message:
          skipped > 0
            ? `✅ Created ${createdCount} event(s). Skipped ${skipped} duplicate(s).`
            : `✅ Successfully created ${createdCount} demo event(s) with RSVPs!`,
        success: true,
        eventCount: createdCount,
      });
    } catch (error) {
      console.error('Seeding error:', error);
      setStatus({
        isLoading: false,
        message: `❌ Error seeding events: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
        eventCount: 0,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">🌱 Admin: Seed Test Events</h2>
        <p className="text-gray-600">
          Populate the platform with 3 demo events and pre-filled RSVPs for your presentation.
        </p>
      </div>

      {alreadySeeded && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800">
          ✅ All demo events are already on the platform. Predictions and Events pages are ready.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-600 mb-2">{demoStats.eventCount}</div>
          <p className="text-sm text-blue-700">Demo Events</p>
          <p className="text-xs text-blue-600 mt-1">
            {missingCount > 0 ? `${missingCount} to create` : 'All present'}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-purple-600 mb-2">{demoStats.totalEligibleRsvps}</div>
          <p className="text-sm text-purple-700">ML-ready RSVPs</p>
          <p className="text-xs text-purple-600 mt-1">Across {demoStats.studentCount} demo students</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-3xl font-bold text-green-600 mb-2">83%</div>
          <p className="text-sm text-green-700">Model Accuracy</p>
          <p className="text-xs text-green-600 mt-1">Trained on real data</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Events to be Created</h3>
        <div className="space-y-4">
          {demoSeeds.map((seed, index) => (
            <div key={seed.title} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900">
                {index + 1}. {seed.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{formatDemoDate(seed.date, seed.time)}</p>
              <p className="text-sm text-gray-600">
                Capacity: {seed.capacity} | ML RSVPs: {countPredictionEligibleRsvps(seed.rsvps)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {status.message && (
        <div
          className={`border rounded-lg p-4 mb-8 ${
            status.success === true
              ? 'bg-green-50 border-green-200 text-green-700'
              : status.success === false
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={seedTestEvents}
          disabled={status.isLoading || alreadySeeded}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition ${
            status.isLoading || alreadySeeded
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {status.isLoading
            ? 'Creating Events...'
            : alreadySeeded
              ? 'Demo Events Ready'
              : 'Populate Test Events'}
        </button>
      </div>

      <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Next Steps</h3>
        <ol className="space-y-3 text-gray-700">
          <li className="flex gap-3">
            <span className="font-bold text-gray-900">1.</span>
            <span>Click &quot;Populate Test Events&quot; to create the 3 demo events with RSVPs</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-gray-900">2.</span>
            <span>Go to Events to see upcoming events, or the public landing page</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-gray-900">3.</span>
            <span>Open Predictions (🔮) and select an event for ML attendance forecasts</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-gray-900">4.</span>
            <span>Log in as a member in another browser to test RSVP</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
