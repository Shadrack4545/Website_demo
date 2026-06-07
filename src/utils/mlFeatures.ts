/**
 * ML feature engineering — mirrors ml_backend/feature_engineer.py exactly.
 * All 8 features must match training order for XGBoost predictions.
 */

import type { Event, RSVPStatus } from '@/types';

/** Matches Python EVENT_TYPE_MAP / 6.0 */
const EVENT_TYPE_MAP: Record<string, number> = {
  'Social and Cultural': 0,
  'Community Event': 1,
  Entertainment: 2,
  Workshop: 3,
  Career: 4,
  Sports: 5,
  Other: 6,
};

const RSVP_STATUS_MAP: Record<RSVPStatus, number> = {
  attending: 0,
  maybe: 1,
  notAttending: 2,
};

/** Demo event titles → ML metadata (aligned with DATA_TEMPLATES CSV) */
const DEMO_EVENT_ML_META: Record<string, { eventType: string; hasIncentive: boolean }> = {
  'African Day Celebration': { eventType: 'Social and Cultural', hasIncentive: true },
  'Students Day Celebration': { eventType: 'Community Event', hasIncentive: false },
  'Movie Night': { eventType: 'Entertainment', hasIncentive: true },
};

export interface MLStudentInput {
  id: string;
  previousAttendanceRate?: number;
  academicLoad?: number;
}

export function getEventMLMeta(event: Event): { eventType: string; hasIncentive: boolean } {
  return (
    DEMO_EVENT_ML_META[event.title] ?? {
      eventType: 'Other',
      hasIncentive: false,
    }
  );
}

export function parseEventHour(time: string): number {
  const [hours] = time.split(':').map(Number);
  return Number.isFinite(hours) ? hours : 12;
}

export function buildMLFeatures(
  student: MLStudentInput,
  event: Event,
  rsvpStatus: RSVPStatus
): number[] {
  const meta = getEventMLMeta(event);
  const eventDate = new Date(`${event.date}T${event.time}`);
  const leadTimeDays = Math.max(
    0,
    Math.floor((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  const dayOfWeek = eventDate.getDay() === 0 ? 6 : eventDate.getDay() - 1; // Mon=0 … Sun=6
  const hour = parseEventHour(event.time);
  const isEvening = hour >= 18 || event.title.toLowerCase().includes('movie') ? 1.0 : 0.0;

  return [
    student.previousAttendanceRate ?? 0.5,
    (student.academicLoad ?? 4) / 6.0,
    meta.hasIncentive ? 1.0 : 0.0,
    (EVENT_TYPE_MAP[meta.eventType] ?? 6) / 6.0,
    RSVP_STATUS_MAP[rsvpStatus] / 2.0,
    Math.min(leadTimeDays / 60.0, 1.0),
    dayOfWeek / 6.0,
    isEvening,
  ];
}

export const ML_FEATURE_NAMES = [
  'previous_attendance_rate',
  'academic_load',
  'has_incentive',
  'event_type_encoded',
  'rsvp_status_encoded',
  'lead_time_days',
  'day_of_week',
  'is_evening_event',
] as const;

export function confidenceLabelToScore(label: string, probability: number): number {
  switch (label) {
    case 'very_high':
      return 0.9;
    case 'high':
      return 0.75;
    case 'medium':
      return 0.55;
    case 'low':
      return 0.35;
    default:
      return Math.abs(probability - 0.5) * 2;
  }
}
