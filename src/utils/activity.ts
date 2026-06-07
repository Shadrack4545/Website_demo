/**
 * Activity Tracking Utilities
 * 
 * Tracks member visits, activity frequency, and engagement metrics
 * Stores data in localStorage for analytics and admin dashboards
 */

export interface ActivityRecord {
  userId: string;
  timestamp: number;
  action: 'login' | 'event_rsvp' | 'announcement_view' | 'resource_access' | 'forum_post';
  details?: string;
}

export interface MemberActivity {
  userId: string;
  lastLogin: number;
  totalLogins: number;
  lastActivity: number;
  totalActivities: number;
  activitiesByType: Record<string, number>;
  createdAt: number;
}

const STORAGE_KEY_ACTIVITIES = 'MEMBER_ACTIVITIES';
const STORAGE_KEY_ACTIVITY_RECORDS = 'ACTIVITY_RECORDS';

/**
 * Record a user activity
 * 
 * @param userId - User ID
 * @param action - Type of action performed
 * @param details - Optional details about the action
 */
export function recordActivity(
  userId: string,
  action: ActivityRecord['action'],
  details?: string
): void {
  const record: ActivityRecord = {
    userId,
    timestamp: Date.now(),
    action,
    details,
  };

  // Get existing records
  let records: ActivityRecord[] = [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVITY_RECORDS);
    if (stored) {
      records = JSON.parse(stored);
    }
  } catch {
    console.error('Failed to retrieve activity records');
  }

  // Add new record (keep last 10000 records for performance)
  records.push(record);
  if (records.length > 10000) {
    records = records.slice(-10000);
  }

  try {
    localStorage.setItem(STORAGE_KEY_ACTIVITY_RECORDS, JSON.stringify(records));
  } catch {
    console.error('Failed to store activity record');
  }

  // Update activity summary
  updateActivitySummary(userId);
}

/**
 * Record a login event
 * Convenience method for recording user logins
 * 
 * @param userId - User ID
 */
export function recordLogin(userId: string): void {
  recordActivity(userId, 'login', 'User logged in');
}

/**
 * Update activity summary for a user
 * 
 * @param userId - User ID
 */
function updateActivitySummary(userId: string): void {
  let activities: Record<string, MemberActivity> = {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
    if (stored) {
      activities = JSON.parse(stored);
    }
  } catch {
    console.error('Failed to retrieve activity summaries');
  }

  const records = getActivityRecords(userId);
  const logins = records.filter((r) => r.action === 'login').length;
  const lastLogin = records
    .filter((r) => r.action === 'login')
    .sort((a, b) => b.timestamp - a.timestamp)[0]?.timestamp || 0;

  const activityByType: Record<string, number> = {};
  records.forEach((record) => {
    activityByType[record.action] = (activityByType[record.action] || 0) + 1;
  });

  activities[userId] = {
    userId,
    lastLogin,
    totalLogins: logins,
    lastActivity: records[records.length - 1]?.timestamp || 0,
    totalActivities: records.length,
    activitiesByType: activityByType,
    createdAt: activities[userId]?.createdAt || Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
  } catch {
    console.error('Failed to store activity summary');
  }
}

/**
 * Get all activity records for a user
 * 
 * @param userId - User ID
 * @returns Array of activity records
 */
export function getActivityRecords(userId: string): ActivityRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVITY_RECORDS);
    if (!stored) return [];
    const records = JSON.parse(stored) as ActivityRecord[];
    return records.filter((r) => r.userId === userId);
  } catch {
    console.error('Failed to retrieve activity records');
    return [];
  }
}

/**
 * Get activity summary for a user
 * 
 * @param userId - User ID
 * @returns Activity summary or null if not found
 */
export function getActivitySummary(userId: string): MemberActivity | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
    if (!stored) return null;
    const activities = JSON.parse(stored) as Record<string, MemberActivity>;
    return activities[userId] || null;
  } catch {
    console.error('Failed to retrieve activity summary');
    return null;
  }
}

/**
 * Get all activity summaries
 * 
 * @returns Record of all member activities
 */
export function getAllActivitySummaries(): Record<string, MemberActivity> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    console.error('Failed to retrieve all activity summaries');
    return {};
  }
}

/**
 * Get top active members
 * 
 * @param limit - Number of members to return (default: 10)
 * @returns Array of members sorted by activity
 */
export function getTopActiveMembers(limit: number = 10): MemberActivity[] {
  const all = getAllActivitySummaries();
  return Object.values(all)
    .sort((a, b) => b.totalActivities - a.totalActivities)
    .slice(0, limit);
}

/**
 * Get members by last login time
 * Useful for identifying inactive members
 * 
 * @param daysAgo - Number of days ago (default: 30)
 * @returns Array of members who logged in within the specified days
 */
export function getMembersByLastLogin(daysAgo: number = 30): MemberActivity[] {
  const cutoff = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
  const all = getAllActivitySummaries();
  return Object.values(all)
    .filter((a) => a.lastLogin > cutoff)
    .sort((a, b) => b.lastLogin - a.lastLogin);
}

/**
 * Get inactive members
 * 
 * @param daysInactive - Number of days without activity (default: 30)
 * @returns Array of inactive members
 */
export function getInactiveMembers(daysInactive: number = 30): MemberActivity[] {
  const cutoff = Date.now() - daysInactive * 24 * 60 * 60 * 1000;
  const all = getAllActivitySummaries();
  return Object.values(all)
    .filter((a) => a.lastActivity < cutoff)
    .sort((a, b) => a.lastActivity - b.lastActivity);
}

/**
 * Get activity statistics
 * 
 * @returns Object with aggregate activity statistics
 */
export function getActivityStatistics(): {
  totalMembers: number;
  totalActivities: number;
  avgActivitiesPerMember: number;
  activeThisMonth: number;
  activitiesByType: Record<string, number>;
} {
  const all = getAllActivitySummaries();
  const members = Object.values(all);
  const totalActivities = members.reduce((sum, m) => sum + m.totalActivities, 0);
  
  const activitiesByType: Record<string, number> = {};
  members.forEach((m) => {
    Object.entries(m.activitiesByType).forEach(([type, count]) => {
      activitiesByType[type] = (activitiesByType[type] || 0) + count;
    });
  });

  const month = 30 * 24 * 60 * 60 * 1000;
  const activeThisMonth = members.filter((m) => Date.now() - m.lastActivity < month).length;

  return {
    totalMembers: members.length,
    totalActivities,
    avgActivitiesPerMember: members.length > 0 ? totalActivities / members.length : 0,
    activeThisMonth,
    activitiesByType,
  };
}

/**
 * Clear old activity records
 * Keeps records from the last N days
 * 
 * @param daysToKeep - Number of days to keep records for (default: 90)
 */
export function clearOldActivityRecords(daysToKeep: number = 90): void {
  const cutoff = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ACTIVITY_RECORDS);
    if (!stored) return;
    
    let records = JSON.parse(stored) as ActivityRecord[];
    records = records.filter((r) => r.timestamp > cutoff);
    
    localStorage.setItem(STORAGE_KEY_ACTIVITY_RECORDS, JSON.stringify(records));
  } catch {
    console.error('Failed to clear old activity records');
  }
}
