/**
 * RoleManagementContext - Leadership Role Management
 * 
 * Handles:
 * - Leadership term management (annual elections)
 * - Role assignment and revocation
 * - Audit logging of all role changes
 * - Position tracking (President, Treasurer, etc.)
 */

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { User, LeadershipTerm, RoleAuditLog, RoleManagementState } from '../types';
import { getData, setData, STORAGE_KEYS } from '../utils/storage';
import { createId } from '../utils/ids';

interface RoleManagementContextType {
  // State
  auditLogs: RoleAuditLog[];
  leadershipTerms: LeadershipTerm[];
  currentTermId?: string;
  
  // Actions
  promoteToAdmin: (userId: string, targetUser: User, position: string, reason?: string) => void;
  demoteFromAdmin: (userId: string, targetUser: User, reason?: string) => void;
  createLeadershipTerm: (
    startDate: number,
    endDate: number,
    leadersToAssign: Array<{ userId: string; userName: string; userEmail: string; position: string }>
  ) => string; // Returns term ID
  endLeadershipTerm: (termId: string) => void;
  getTermLeaders: (termId?: string) => LeadershipTerm[];
  getAuditLogs: (limit?: number) => RoleAuditLog[];
  getLeadershipHistory: (userId: string) => LeadershipTerm[];
  setCurrentTerm: (termId: string) => void;
}

export const RoleManagementContext = createContext<RoleManagementContextType | undefined>(undefined);

interface RoleManagementProviderProps {
  children: ReactNode;
}

export function RoleManagementProvider({ children }: RoleManagementProviderProps) {
  const [auditLogs, setAuditLogs] = useState<RoleAuditLog[]>([]);
  const [leadershipTerms, setLeadershipTerms] = useState<LeadershipTerm[]>([]);
  const [currentTermId, setCurrentTermId] = useState<string | undefined>();

  // Load from storage on mount
  useEffect(() => {
    const storedState = getData<RoleManagementState>('roleManagementState', {
      auditLogs: [],
      leadershipTerms: [],
    });
    
    if (storedState) {
      setAuditLogs(storedState.auditLogs || []);
      setLeadershipTerms(storedState.leadershipTerms || []);
      setCurrentTermId(storedState.currentTermId);
    }
  }, []);

  // Save to storage whenever state changes
  useEffect(() => {
    const state: RoleManagementState = {
      auditLogs,
      leadershipTerms,
      currentTermId,
    };
    setData('roleManagementState', state);
  }, [auditLogs, leadershipTerms, currentTermId]);

  const promoteToAdmin = (
    changedByUserId: string,
    targetUser: User,
    position: string,
    reason?: string
  ) => {
    const now = Date.now();
    const oldRole = targetUser.role;

    // Update the user's role in the users list
    const allUsers = getData<User[]>(STORAGE_KEYS.USERS, []) ?? [];
    const updatedUsers = allUsers.map((u) =>
      u.id === targetUser.id
        ? { ...u, role: 'admin' as const, updatedAt: now }
        : u
    );
    setData(STORAGE_KEYS.USERS, updatedUsers);

    // If this is the current user, update current user storage too
    const currentUser = getData<User>(STORAGE_KEYS.CURRENT_USER);
    if (currentUser && currentUser.id === targetUser.id) {
      setData(STORAGE_KEYS.CURRENT_USER, { ...currentUser, role: 'admin' as const, updatedAt: now });
      // Dispatch event so AuthContext updates
      window.dispatchEvent(new Event('authUserUpdated'));
    }

    // Create audit log
    const auditEntry: RoleAuditLog = {
      id: createId('audit'),
      changedBy: changedByUserId,
      changedByName: '', // Will be populated by caller
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      targetUserEmail: targetUser.email,
      oldRole,
      newRole: 'admin',
      action: 'promote',
      reason,
      changeType: 'immediate',
      createdAt: now,
    };

    setAuditLogs((prev) => [auditEntry, ...prev]);

    // Create or update leadership term if currentTermId exists
    if (currentTermId) {
      const term: LeadershipTerm = {
        id: createId('term'),
        userId: targetUser.id,
        userName: targetUser.name,
        userEmail: targetUser.email,
        position: (position as any) || 'Admin',
        startDate: now,
        endDate: now + 365 * 24 * 60 * 60 * 1000, // 1 year
        status: 'active',
        createdAt: now,
        updatedAt: now,
      };

      setLeadershipTerms((prev) => [...prev, term]);
    }
  };

  const demoteFromAdmin = (
    changedByUserId: string,
    targetUser: User,
    reason?: string
  ) => {
    const now = Date.now();

    // Update the user's role back to member in the users list
    const allUsers = getData<User[]>(STORAGE_KEYS.USERS, []) ?? [];
    const updatedUsers = allUsers.map((u) =>
      u.id === targetUser.id
        ? { ...u, role: 'member' as const, updatedAt: now }
        : u
    );
    setData(STORAGE_KEYS.USERS, updatedUsers);

    // If this is the current user, update current user storage too
    const currentUser = getData<User>(STORAGE_KEYS.CURRENT_USER);
    if (currentUser && currentUser.id === targetUser.id) {
      setData(STORAGE_KEYS.CURRENT_USER, { ...currentUser, role: 'member' as const, updatedAt: now });
      // Dispatch event so AuthContext updates
      window.dispatchEvent(new Event('authUserUpdated'));
    }

    // Create audit log
    const auditEntry: RoleAuditLog = {
      id: createId('audit'),
      changedBy: changedByUserId,
      changedByName: '',
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      targetUserEmail: targetUser.email,
      oldRole: targetUser.role,
      newRole: 'member',
      action: 'demote',
      reason,
      changeType: 'immediate',
      createdAt: now,
    };

    setAuditLogs((prev) => [auditEntry, ...prev]);

    // Mark leadership terms as past
    setLeadershipTerms((prev) =>
      prev.map((term) =>
        term.userId === targetUser.id
          ? { ...term, status: 'past' as const, updatedAt: now }
          : term
      )
    );
  };

  const createLeadershipTerm = (
    startDate: number,
    endDate: number,
    leadersToAssign: Array<{ userId: string; userName: string; userEmail: string; position: string }>
  ): string => {
    const termId = createId('term');
    const now = Date.now();

    const newTerms = leadersToAssign.map(
      (leader): LeadershipTerm => ({
        id: createId('term'),
        userId: leader.userId,
        userName: leader.userName,
        userEmail: leader.userEmail,
        position: (leader.position as any) || 'Admin',
        startDate,
        endDate,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      })
    );

    setLeadershipTerms((prev) => [...prev, ...newTerms]);
    setCurrentTermId(termId);

    return termId;
  };

  const endLeadershipTerm = (termId: string) => {
    const now = Date.now();
    setLeadershipTerms((prev) =>
      prev.map((term) =>
        term.id === termId ? { ...term, status: 'past' as const, updatedAt: now } : term
      )
    );
  };

  const getTermLeaders = (termId?: string): LeadershipTerm[] => {
    const targetTermId = termId || currentTermId;
    if (!targetTermId) return [];

    return leadershipTerms.filter(
      (term) => term.id === targetTermId && term.status === 'active'
    );
  };

  const getAuditLogs = (limit?: number): RoleAuditLog[] => {
    return limit ? auditLogs.slice(0, limit) : auditLogs;
  };

  const getLeadershipHistory = (userId: string): LeadershipTerm[] => {
    return leadershipTerms.filter((term) => term.userId === userId);
  };

  const setCurrentTerm = (termId: string) => {
    setCurrentTermId(termId);
  };

  return (
    <RoleManagementContext.Provider
      value={{
        auditLogs,
        leadershipTerms,
        currentTermId,
        promoteToAdmin,
        demoteFromAdmin,
        createLeadershipTerm,
        endLeadershipTerm,
        getTermLeaders,
        getAuditLogs,
        getLeadershipHistory,
        setCurrentTerm,
      }}
    >
      {children}
    </RoleManagementContext.Provider>
  );
}
