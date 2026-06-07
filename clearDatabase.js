#!/usr/bin/env node

/**
 * Database Clear Script - COMPLETE DATA WIPE
 * 
 * ⚠️  WARNING: This removes ALL user accounts, events, and data
 * 
 * HOW TO USE:
 * 
 * METHOD 1: Browser Console (Recommended for testing)
 * 1. Open http://localhost:5173 in your browser
 * 2. Press F12 to open DevTools
 * 3. Go to Console tab
 * 4. Copy and paste the entire clearDatabase() function below
 * 5. Type: clearDatabase()
 * 6. Press Enter
 * 7. Wait for page refresh
 * 
 * METHOD 2: In Terminal
 * node clearDatabase.js
 * 
 * RESULT: All accounts deleted, fresh start for new testing
 */

// All storage keys used by the application
const STORAGE_KEYS = {
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
  ACTIVITY: 'activity',
  MEMBER_PROFILES: 'memberProfiles',
  ACHIEVEMENTS: 'achievements',
  CHAT_REQUESTS: 'chatRequests',
  ANALYTICS: 'analytics',
  GROUP_CHATS: 'groupChats',
  MEMBER_VERIFICATION: 'memberVerification',
  FORUM_QUESTIONS: 'forumQuestions',
  FINANCE_RECORDS: 'financeRecords',
};

function clearDatabase() {
  console.clear();
  console.log('%c🗑️  CLEARING ALL DATABASE...', 'color: red; font-size: 16px; font-weight: bold;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: red;');
  
  let clearedCount = 0;
  
  // Clear each known key
  Object.entries(STORAGE_KEYS).forEach(([keyName, key]) => {
    try {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`%c✅ Cleared: ${keyName} (${key})`, 'color: green;');
        clearedCount++;
      }
    } catch (error) {
      console.error(`%c❌ Error clearing ${keyName}: ${error}`, 'color: red;');
    }
  });
  
  // Clear any remaining localStorage items
  console.log('%c\n🔍 Checking for additional items...', 'color: blue;');
  const allKeys = Object.keys(localStorage);
  allKeys.forEach((key) => {
    if (!Object.values(STORAGE_KEYS).includes(key)) {
      localStorage.removeItem(key);
      console.log(`%c✅ Cleared additional: ${key}`, 'color: green;');
      clearedCount++;
    }
  });
  
  // Clear sessionStorage too
  try {
    sessionStorage.clear();
    console.log('%c✅ Cleared sessionStorage', 'color: green;');
  } catch (error) {
    console.error(`%c❌ Error clearing sessionStorage: ${error}`, 'color: red;');
  }
  
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: green;');
  console.log(`%c✨ SUCCESS! Cleared ${clearedCount} items`, 'color: green; font-size: 14px; font-weight: bold;');
  console.log('%c\n📝 localStorage is now empty!', 'color: blue; font-size: 12px;');
  console.log('%c🔄 Refreshing page in 2 seconds...', 'color: blue; font-size: 12px;');
  
  // Refresh page
  setTimeout(() => {
    console.log('%c🎉 Page refresh initiated!', 'color: green; font-weight: bold;');
    window.location.reload();
  }, 2000);
}

// Auto-run if called as a browser script
if (typeof window !== 'undefined') {
  clearDatabase();
} else {
  // Node.js fallback message
  console.log('📌 This script is designed to run in a browser console.');
  console.log('📌 Open http://localhost:5173 in your browser and paste this code in DevTools Console.');
}

