/**
 * EventsPage - Manage and view events
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, useDirectory, useEvents } from '../hooks/useContext';
import EventCard from '../components/events/EventCard.tsx';
import EventForm from '../components/events/EventForm';
import EventDetailsModal from '../components/events/EventDetailsModal';

export default function EventsPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { getAllMembers } = useDirectory();
  const { getUpcomingEvents, getPastEvents, createEvent, rsvpEvent, sendInvitations, recordAttendance } = useEvents();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const upcomingEvents = getUpcomingEvents();
  const pastEvents = getPastEvents();
  const selectedEvent = [...upcomingEvents, ...pastEvents].find((event) => event.id === selectedEventId);
  const isLeader = currentUser?.role === 'leader' || currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{t('events.title')}</h2>
        {isLeader ? (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            {t('events.createEvent')}
          </button>
        ) : (
          <span className="text-xs text-gray-500">{t('common.leaderAdminOnly')}</span>
        )}
      </div>

      {/* Create Form (stub) */}
      {showCreateForm && (
        <EventForm
          onCancel={() => setShowCreateForm(false)}
          onSubmit={(values) => {
            if (!currentUser) return;
            createEvent({ ...values, createdBy: currentUser.id });
            setShowCreateForm(false);
          }}
        />
      )}

      {/* Events List */}
      <div className="space-y-4">
        {upcomingEvents.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-600">{t('events.noEvents')}</p>
          </div>
        ) : (
          upcomingEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isLeader={Boolean(isLeader)}
              onView={() => setSelectedEventId(event.id)}
              onRSVP={(status) => {
                if (!currentUser) return;
                rsvpEvent(event.id, currentUser.id, status);
              }}
              onSendInvitations={() => {
                if (!currentUser) return;
                sendInvitations(
                  event.id,
                  getAllMembers().map((member) => member.userId),
                  currentUser.id
                );
              }}
              onAttendance={(attended) => {
                if (!currentUser) return;
                recordAttendance(event.id, currentUser.id, attended);
              }}
            />
          ))
        )}
      </div>
      <h3 className="mt-8 text-xl font-semibold text-gray-900">{t('events.pastEvents')}</h3>
      <div className="mt-4 space-y-4">
        {pastEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isLeader={Boolean(isLeader)}
            onView={() => setSelectedEventId(event.id)}
            onRSVP={() => undefined}
            onSendInvitations={() => undefined}
            onAttendance={() => undefined}
          />
        ))}
      </div>
      {selectedEvent && <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEventId(null)} />}
    </div>
  );
}