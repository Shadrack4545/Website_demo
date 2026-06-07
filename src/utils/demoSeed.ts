/**
 * Unified demo event seeding for pre-defense presentations.
 * Single source of truth — use Admin Seed page, not auto-loaded events.
 */

import type { Event, RSVPStatus } from '@/types';
import { getCommunityStudents, getDemoRsvpsForEvent } from './communityStudents';

export const DEMO_EVENT_TITLES = [
  'African Day Celebration',
  'Students Day Celebration',
  'Movie Night',
] as const;

export interface DemoEventSeed {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  rsvps: Record<string, RSVPStatus>;
}

function formatDateDaysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Build the 3 demo events with relative future dates and pre-filled RSVPs.
 */
export function buildDemoEventSeeds(): DemoEventSeed[] {
  return [
    {
      title: 'African Day Celebration',
      description:
        'Cultural celebration featuring African cuisine, music, and traditions. Open to all community members.',
      date: formatDateDaysFromNow(7),
      time: '18:00',
      location: 'Community Center - Main Hall',
      capacity: 75,
      rsvps: getDemoRsvpsForEvent('African Day Celebration'),
    },
    {
      title: 'Students Day Celebration',
      description:
        'Annual celebration honoring students. Network with peers, games, and prizes.',
      date: formatDateDaysFromNow(14),
      time: '19:00',
      location: 'University Auditorium',
      capacity: 80,
      rsvps: getDemoRsvpsForEvent('Students Day Celebration'),
    },
    {
      title: 'Movie Night',
      description: 'Relaxed evening watching a classic film with friends. Snacks provided.',
      date: formatDateDaysFromNow(21),
      time: '20:00',
      location: 'Community Center - Lounge',
      capacity: 50,
      rsvps: getDemoRsvpsForEvent('Movie Night'),
    },
  ];
}

/** Events that have not been seeded yet (matched by title). */
export function getMissingDemoEvents(existingEvents: Event[]): DemoEventSeed[] {
  const existingTitles = new Set(existingEvents.map((event) => event.title));
  return buildDemoEventSeeds().filter((seed) => !existingTitles.has(seed.title));
}

export function allDemoEventsPresent(existingEvents: Event[]): boolean {
  return getMissingDemoEvents(existingEvents).length === 0;
}

/** Students with attending/maybe — used by the ML predictor. */
export function countPredictionEligibleRsvps(rsvps: Record<string, RSVPStatus>): number {
  return Object.values(rsvps).filter((status) => status === 'attending' || status === 'maybe').length;
}

export function getDemoSeedStats() {
  const seeds = buildDemoEventSeeds();
  const totalEligibleRsvps = seeds.reduce(
    (sum, seed) => sum + countPredictionEligibleRsvps(seed.rsvps),
    0
  );
  return {
    eventCount: seeds.length,
    studentCount: getCommunityStudents().length,
    totalEligibleRsvps,
  };
}

/** Human-readable date for the seed preview cards */
export function formatDemoDate(date: string, time: string): string {
  const parsed = new Date(`${date}T${time}`);
  return parsed.toLocaleString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
