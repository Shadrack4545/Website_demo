import { useTranslation } from 'react-i18next';
import type { Event } from '../../types';

interface EventDetailsModalProps {
  event: Event;
  onClose: () => void;
}

export default function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold">{event.title}</h3>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-700">{event.description}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <p className="text-sm"><strong>Date:</strong> {event.date}</p>
          <p className="text-sm"><strong>Time:</strong> {event.time}</p>
          <p className="text-sm"><strong>Location:</strong> {event.location}</p>
          <p className="text-sm"><strong>Capacity:</strong> {event.capacity}</p>
          <p className="text-sm"><strong>Attending:</strong> {Object.values(event.rsvps).filter((v) => v === 'attending').length}</p>
          <p className="text-sm"><strong>{t('events.noShows')}:</strong> {event.noShows.length}</p>
        </div>
      </div>
    </div>
  );
}
