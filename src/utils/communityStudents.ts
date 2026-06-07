/**
 * Real AASV community student profiles (from DATA_TEMPLATES / community roster).
 */

import type { RSVPStatus } from '@/types';
import studentsData from '@/data/communityStudents.json';
import demoRsvpsData from '@/data/demoEventRsvps.json';

export interface CommunityStudent {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  country: string;
  program: string;
  academicLoad: number;
  previousAttendanceRate: number;
  email: string;
}

export const COMMUNITY_STUDENTS_VERSION = 'real-community-v1';

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '');

/** All 29 community members with ML profile fields */
export function getCommunityStudents(): CommunityStudent[] {
  return (studentsData as Omit<CommunityStudent, 'email'>[]).map((student) => ({
    ...student,
    email: `${slug(student.firstName)}.${slug(student.lastName)}@aasv.community`,
  }));
}

/** RSVP patterns per demo event title (from real attendance records) */
export function getDemoRsvpsForEvent(eventTitle: string): Record<string, RSVPStatus> {
  const map = demoRsvpsData as Record<string, Record<string, RSVPStatus>>;
  return map[eventTitle] ?? {};
}

export function getCommunityStudentById(id: string): CommunityStudent | undefined {
  return getCommunityStudents().find((s) => s.id === id);
}
