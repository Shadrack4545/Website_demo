/**
 * Custom Hooks for Context API
 * 
 * These hooks provide convenient access to context values
 * Use these in components instead of useContext directly
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { EventContext } from '../context/EventContext';
import { NotificationContext } from '../context/NotificationContext';
import { DirectoryContext } from '../context/DirectoryContext';
import { AchievementContext } from '../context/AchievementContext';
import { ChatRequestContext } from '../context/ChatRequestContext';
import { RoleManagementContext } from '../context/RoleManagementContext';
import { ThemeContext } from '../context/ThemeContext';

/**
 * useAuth Hook
 * Access authentication context
 * 
 * Usage:
 * const { currentUser, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/**
 * useEvents Hook
 * Access events context
 * 
 * Usage:
 * const { events, createEvent, rsvpEvent } = useEvents();
 */
export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within EventProvider');
  }
  return context;
}

/**
 * useNotifications Hook
 * Access notifications context
 * 
 * Usage:
 * const { notifications, addNotification, markAsRead } = useNotifications();
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

/**
 * useMembers Hook
 * Access members context
 * 
 * Usage:
 * const { members, addMember, getAllMembers } = useMembers();
 */
export function useDirectory() {
  const context = useContext(DirectoryContext);
  if (!context) {
    throw new Error('useDirectory must be used within DirectoryProvider');
  }
  return context;
}

export const useMembers = useDirectory;

/**
 * useAchievements Hook
 * Access achievements context
 * 
 * Usage:
 * const { achievements, createAchievement, deleteAchievement } = useAchievements();
 */
export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within AchievementProvider');
  }
  return context;
}

/**
 * useChatRequests Hook
 * Access chat request and group chat context
 * 
 * Usage:
 * const { chatRequests, createChatRequest, approveChatRequest } = useChatRequests();
 */
export function useChatRequests() {
  const context = useContext(ChatRequestContext);
  if (!context) {
    throw new Error('useChatRequests must be used within ChatRequestProvider');
  }
  return context;
}

/**
 * useRoleManagement Hook
 * Access role management context for leadership and audit logs
 * 
 * Usage:
 * const { promoteToAdmin, demoteFromAdmin, getAuditLogs } = useRoleManagement();
 */
export function useRoleManagement() {
  const context = useContext(RoleManagementContext);
  if (!context) {
    throw new Error('useRoleManagement must be used within RoleManagementProvider');
  }
  return context;
}

/**
 * useTheme Hook — light / dark mode
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
