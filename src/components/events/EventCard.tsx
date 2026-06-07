import type { Event } from '../../types';

interface EventCardProps {
  event: Event;
  onView: () => void;
  onRSVP: (status: 'attending' | 'notAttending' | 'maybe') => void;
  onSendInvitations: () => void;
  onAttendance: (attended: boolean) => void;
  isLeader: boolean;
}

export default function EventCard({ event, onView, onRSVP, onSendInvitations, onAttendance, isLeader }: EventCardProps) {
  const rsvpCount = Object.keys(event.rsvps).length;
  const attendingCount = Object.values(event.rsvps).filter((status) => status === 'attending').length;
  const attendanceRate = rsvpCount > 0 ? Math.round((attendingCount / rsvpCount) * 100) : 0;

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{event.description?.substring(0, 100)}...</p>
        </div>
        <span className={`badge ${event.status === 'upcoming' ? 'badge-primary' : 'badge-success'}`}>
          {event.status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>📅 {event.date} at {event.time}</p>
        <p>📍 {event.location}</p>
        <p>👥 Capacity: {event.capacity}</p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-600">RSVPs</p>
          <p className="text-lg font-semibold text-primary-600">{rsvpCount}/{event.capacity}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Attending</p>
          <p className="text-lg font-semibold text-green-600">{attendingCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Attendance Rate</p>
          <p className="text-lg font-semibold text-blue-600">{attendanceRate}%</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button className="btn-small btn-primary text-xs flex-1" onClick={onView}>View Details</button>
        <button className="btn-small btn-secondary text-xs flex-1" onClick={() => onRSVP('attending')}>Attend</button>
        <button className="btn-small btn-secondary text-xs flex-1" onClick={() => onRSVP('maybe')}>Maybe</button>
        <button className="btn-small btn-secondary text-xs flex-1" onClick={() => onRSVP('notAttending')}>No</button>
      </div>
      {isLeader && (
        <div className="mt-2 flex gap-2">
          <button className="btn-small bg-purple-100 text-purple-700 text-xs flex-1" onClick={onSendInvitations}>
            Send Invitations
          </button>
          <button className="btn-small bg-green-100 text-green-700 text-xs flex-1" onClick={() => onAttendance(true)}>
            Confirm Attendance
          </button>
          <button className="btn-small bg-yellow-100 text-yellow-700 text-xs flex-1" onClick={() => onAttendance(false)}>
            Mark No-show
          </button>
        </div>
      )}
      <div className="mt-2 text-xs text-gray-600">
        Attended: {event.attendees.length} | Missed: {event.noShows.length}
      </div>
    </div>
  );
}