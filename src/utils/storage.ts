/**
 * localStorage Service
 * 
 * This abstraction layer provides a clean, safe interface for persisting data.
 * 
 * Why this matters:
 * 1. Error Handling: localStorage can throw errors (quota exceeded, private browsing mode)
 * 2. Type Safety: We know what type we're getting back (no magic strings)
 * 3. JSON Serialization: Automatic stringify/parse with error handling
 * 4. Single Source of Truth: If we need to change storage (e.g., IndexedDB), we only update this file
 * 5. Debugging: Centralized logging for data persistence
 * 6. Default Values: Graceful fallback if data doesn't exist
 */

/**
 * Generic getter for localStorage
 * @param key - The storage key
 * @param defaultValue - Value to return if key doesn't exist or error occurs
 * @returns The stored value or default
 * 
 * Usage:
 * const user = getData<User>('user', null);
 * const settings = getData<Settings>('settings', defaultSettings);
 */
export function getData<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key);

    if (item === null) {
      return defaultValue ?? null;
    }

    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage (key: ${key}):`, error);
    return defaultValue ?? null;
  }
}

/**
 * Generic setter for localStorage
 * @param key - The storage key
 * @param value - The value to store (must be JSON serializable)
 * @returns Boolean indicating success
 * 
 * Usage:
 * setData('user', userData);
 * setData('events', allEvents);
 */
export function setData<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    // Common errors:
    // - QuotaExceededError: localStorage full
    // - SecurityError: Private browsing mode or CORS issue
    console.error(`Error writing to localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Update data using an updater function
 * Useful for modifying nested structures without replacing entire object
 * 
 * @param key - The storage key
 * @param updaterFn - Function that receives current value and returns new value
 * @param defaultValue - Initial value if key doesn't exist
 * @returns Boolean indicating success
 * 
 * Usage:
 * // Add a new event to the events array
 * updateData('events', (events) => [...events, newEvent], []);
 * 
 * // Update a single event
 * updateData('events', (events) => 
 *   events.map(e => e.id === eventId ? updatedEvent : e), 
 *   []
 * );
 */
export function updateData<T>(
  key: string,
  updaterFn: (current: T) => T,
  defaultValue: T
): boolean {
  try {
    const current = (getData<T>(key, defaultValue) ?? defaultValue) as T;
    const updated = updaterFn(current);
    return setData(key, updated);
  } catch (error) {
    console.error(`Error updating localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Remove a key from localStorage
 * @param key - The storage key to remove
 * @returns Boolean indicating success
 * 
 * Usage:
 * removeData('user'); // Log out
 * removeData('temporaryData');
 */
export function removeData(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Clear all application data from localStorage
 * CAUTION: This removes all stored data
 * 
 * Usage:
 * clearAll(); // On logout or reset
 */
export function clearAll(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Check if a key exists in localStorage
 * @param key - The storage key
 * @returns Boolean indicating existence
 */
export function hasKey(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Error checking localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Get all keys currently stored in localStorage
 * Useful for debugging or migrations
 * @returns Array of all storage keys
 */
export function getAllKeys(): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  } catch (error) {
    console.error('Error getting localStorage keys:', error);
    return [];
  }
}

/**
 * Storage size information
 * Returns estimate of how much storage is being used
 * Note: This is an approximation based on JSON stringification
 */
export function getStorageSize(): { used: number; estimate: number } {
  try {
    let used = 0;
    const keys = getAllKeys();
    
    for (const key of keys) {
      const item = localStorage.getItem(key);
      if (item) {
        // Rough estimate: size of key + size of value
        used += key.length + item.length;
      }
    }
    
    // Most browsers allow 5-10MB, estimate 10MB (10 * 1024 * 1024 bytes)
    const estimate = 10 * 1024 * 1024;
    
    return { used, estimate };
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return { used: 0, estimate: 0 };
  }
}

/**
 * Storage Keys (constants to prevent typos)
 * Centralize all storage key names here
 */
export const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  USERS: 'users',
  EVENTS: 'events',
  ANNOUNCEMENTS: 'announcements',
  DIRECTORY_MEMBERS: 'directoryMembers',
  NOTIFICATIONS: 'notifications',
  SESSION: 'session',
  RESOURCES: 'resources',
  QUESTIONS: 'questions',
  FINANCE_ENTRIES: 'financeEntries',
  DOCUMENTS: 'documents',
  ROLE_REQUESTS: 'roleRequests',
  MOCK_STUDENTS: 'mockStudents',
  MOCK_STUDENTS_VERSION: 'mockStudentsVersion',
  THEME: 'theme',
} as const;

/**
 * Why This Abstraction Is Important:
 * 
 * 1. BROWSER COMPATIBILITY
 *    - Handles errors gracefully in all browsers
 *    - Works in private/incognito mode (returns defaults)
 *    - Handles quota exceeded errors
 * 
 * 2. MAINTAINABILITY
 *    - Single source of truth for localStorage logic
 *    - Easy to switch to IndexedDB, cookies, or backend API later
 *    - Changes only need to be made in this file
 * 
 * 3. DEVELOPER EXPERIENCE
 *    - Type-safe (TypeScript generics)
 *    - Consistent error handling
 *    - Centralized storage key constants
 *    - Easy to debug (logs all errors)
 * 
 * 4. SCALABILITY
 *    - Update function enables complex state mutations
 *    - Storage info helps monitor quota usage
 *    - Easy to add encryption, compression, or versioning
 * 
 * 5. PRODUCTION READINESS
 *    - All functions have try-catch blocks
 *    - Graceful fallbacks with default values
 *    - Consistent return types (boolean for success)
 *    - Console logging for debugging
 */
