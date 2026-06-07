/**
 * Mock Data Generator
 * 
 * Creates realistic test data for the EventPredictor system.
 * Initializes localStorage with sample events, students, and prediction history.
 */

import type { User } from '@/types';
import { getData, setData, STORAGE_KEYS } from './storage';
import {
  COMMUNITY_STUDENTS_VERSION,
  getCommunityStudents,
  type CommunityStudent,
} from './communityStudents';

export type MockStudent = CommunityStudent;

/**
 * Generate mock prediction history
 */
export const generateMockPredictionHistory = () => {
  return [
    {
      eventId: 'evt-past-001',
      predictedAttendance: 68,
      actualAttendance: 72,
      accuracy: 0.944,
      timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    },
    {
      eventId: 'evt-past-002',
      predictedAttendance: 45,
      actualAttendance: 42,
      accuracy: 0.929,
      timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
    },
    {
      eventId: 'evt-past-003',
      predictedAttendance: 120,
      actualAttendance: 118,
      accuracy: 0.983,
      timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
    },
    {
      eventId: 'evt-past-004',
      predictedAttendance: 55,
      actualAttendance: 58,
      accuracy: 0.948,
      timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    },
  ];
};

/**
 * ML predictor student profiles (separate from registered accounts in `users`)
 */
export const getMLStudentProfiles = (): MockStudent[] => {
  const stored = getData<MockStudent[]>(STORAGE_KEYS.MOCK_STUDENTS, []) ?? [];
  return stored.length > 0 ? stored : getCommunityStudents();
};

/**
 * Move legacy mock student rows out of `users` (older builds stored them there).
 */
const migrateLegacyMockUsers = () => {
  const users = getData<User[]>(STORAGE_KEYS.USERS, []) ?? [];
  if (users.length === 0) return;

  const isRegisteredAccount = (user: User) =>
    Boolean(user.email && user.password && user.role);

  const legacyMocks = users.filter((user) => !isRegisteredAccount(user));
  if (legacyMocks.length === 0) return;

  const existingMocks = getMLStudentProfiles();
  const knownIds = new Set(existingMocks.map((student) => student.id));
  const migratedMocks: MockStudent[] = legacyMocks
    .filter((user) => !knownIds.has(user.id))
    .map((user) => {
      const parts = user.name.trim().split(/\s+/);
      const firstName = parts[0] ?? user.name;
      const lastName = parts.slice(1).join(' ') || firstName;
      return {
        id: user.id,
        name: user.name,
        firstName,
        lastName,
        email: user.email,
        country: user.country,
        program: user.program,
        previousAttendanceRate:
          (user as User & { previousAttendanceRate?: number }).previousAttendanceRate ?? 0.5,
        academicLoad: (user as User & { academicLoad?: number }).academicLoad ?? 4,
      };
    });

  if (migratedMocks.length > 0) {
    setData(STORAGE_KEYS.MOCK_STUDENTS, [...existingMocks, ...migratedMocks]);
  }

  setData(
    STORAGE_KEYS.USERS,
    users.filter((user) => isRegisteredAccount(user))
  );
};

/** Ensure real community student profiles are loaded for ML / predictions. */
export const ensureMockStudents = () => {
  const version = getData<string>(STORAGE_KEYS.MOCK_STUDENTS_VERSION);
  const existing = getData<MockStudent[]>(STORAGE_KEYS.MOCK_STUDENTS);

  if (!existing || version !== COMMUNITY_STUDENTS_VERSION) {
    const students = getCommunityStudents();
    setData(STORAGE_KEYS.MOCK_STUDENTS, students);
    setData(STORAGE_KEYS.MOCK_STUDENTS_VERSION, COMMUNITY_STUDENTS_VERSION);
    console.log('✅ Community student profiles loaded:', students.length);
  }
};

/**
 * Initialize ML support data on app load.
 * Demo events are NOT auto-created — use Admin → Seed Data instead.
 */
export const initializeMockData = () => {
  migrateLegacyMockUsers();
  ensureMockStudents();

  const existingHistory = localStorage.getItem('predictionHistory');
  if (!existingHistory) {
    const history = generateMockPredictionHistory();
    localStorage.setItem('predictionHistory', JSON.stringify(history));
    console.log('✅ Mock prediction history initialized:', history.length);
  }
};

/**
 * Clear all mock data from localStorage
 * Useful for testing/debugging
 */
export const clearMockData = () => {
  localStorage.removeItem(STORAGE_KEYS.MOCK_STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.EVENTS);
  localStorage.removeItem('predictionHistory');
  console.log('🗑️ Mock data cleared');
};

/**
 * Reset mock data (clears and reinitializes)
 * Useful for testing
 */
export const resetMockData = () => {
  clearMockData();
  initializeMockData();
  console.log('🔄 Mock data reset');
};
