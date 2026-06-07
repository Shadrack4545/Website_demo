/**
 * MemberContext - Global Member State
 * 
 * Manages:
 * - Community membership data
 * - Member directory
 * - Fee tracking
 * - Member verification
 */

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { DirectoryMember } from '../types';
import { getData, setData, STORAGE_KEYS } from '../utils/storage';

interface MemberContextType {
  members: DirectoryMember[];
  addMember: (userId: string) => void;
  updateMember: (memberId: string, updates: Partial<DirectoryMember>) => void;
  deleteMember: (memberId: string) => void;
  getMemberById: (memberId: string) => DirectoryMember | undefined;
  recordFeePaid: (memberId: string) => void;
  getAllMembers: () => DirectoryMember[];
  getPendingMembers: () => DirectoryMember[];
  getVerifiedMembers: () => DirectoryMember[];
}

export const MemberContext = createContext<MemberContextType | undefined>(undefined);

interface MemberProviderProps {
  children: ReactNode;
}

export function MemberProvider({ children }: MemberProviderProps) {
  const [members, setMembers] = useState<DirectoryMember[]>([]);

  // Load members on mount
  useEffect(() => {
    const storedMembers = getData<DirectoryMember[]>(STORAGE_KEYS.DIRECTORY_MEMBERS, []) ?? [];
    setMembers(storedMembers);
  }, []);

  const addMember = (userId: string) => {
    const newMember: DirectoryMember = {
      id: `member_${userId}`,
      userId,
      name: userId,
      email: `${userId}@example.com`,
      country: 'Unknown',
      program: 'Unknown',
      joinedAt: Date.now(),
      feePaid: false,
      lastActive: Date.now(),
      interests: [],
      verificationStatus: 'pending',
      membershipStatus: 'active',
      updatedAt: Date.now(),
    };

    const updated = [...members, newMember];
    setMembers(updated);
    setData(STORAGE_KEYS.DIRECTORY_MEMBERS, updated);
  };

  const updateMember = (memberId: string, updates: Partial<DirectoryMember>) => {
    const updated = members.map((m) =>
      m.id === memberId ? { ...m, ...updates, lastActive: Date.now() } : m
    );
    setMembers(updated);
    setData(STORAGE_KEYS.DIRECTORY_MEMBERS, updated);
  };

  const deleteMember = (memberId: string) => {
    const updated = members.filter((m) => m.id !== memberId);
    setMembers(updated);
    setData(STORAGE_KEYS.DIRECTORY_MEMBERS, updated);
  };

  const getMemberById = (memberId: string): DirectoryMember | undefined => {
    return members.find((m) => m.id === memberId);
  };

  const recordFeePaid = (memberId: string) => {
    updateMember(memberId, { feePaid: true });
  };

  const getAllMembers = (): DirectoryMember[] => {
    return members.filter((m) => m.membershipStatus === 'active');
  };

  const getPendingMembers = (): DirectoryMember[] => {
    return members.filter((m) => m.verificationStatus === 'pending');
  };

  const getVerifiedMembers = (): DirectoryMember[] => {
    return members.filter((m) => m.verificationStatus === 'verified' && m.membershipStatus === 'active');
  };

  return (
    <MemberContext.Provider
      value={{
        members,
        addMember,
        updateMember,
        deleteMember,
        getMemberById,
        recordFeePaid,
        getAllMembers,
        getPendingMembers,
        getVerifiedMembers,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
}
