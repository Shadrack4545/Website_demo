import { createContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import type { DirectoryMember, User } from '../types';
import { getData, setData, STORAGE_KEYS } from '../utils/storage';
import { createId } from '../utils/ids';

interface DirectoryContextType {
  members: DirectoryMember[];
  addMemberFromUser: (user: User) => DirectoryMember;
  addMember: (member: Omit<DirectoryMember, 'id' | 'joinedAt' | 'lastActive' | 'updatedAt'>) => DirectoryMember;
  updateMember: (memberId: string, updates: Partial<DirectoryMember>) => void;
  getMemberById: (memberId: string) => DirectoryMember | undefined;
  getMemberByUserId: (userId: string) => DirectoryMember | undefined;
  getAllMembers: () => DirectoryMember[];
}

export const DirectoryContext = createContext<DirectoryContextType | undefined>(undefined);

export function DirectoryProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<DirectoryMember[]>([]);

  useEffect(() => {
    const stored = getData<DirectoryMember[]>(STORAGE_KEYS.DIRECTORY_MEMBERS, []) ?? [];
    setMembers(stored);
  }, []);

  useEffect(() => {
    setData(STORAGE_KEYS.DIRECTORY_MEMBERS, members);
  }, [members]);

  const addMember = (
    member: Omit<DirectoryMember, 'id' | 'joinedAt' | 'lastActive' | 'updatedAt'>
  ): DirectoryMember => {
    const newMember: DirectoryMember = {
      ...member,
      id: createId('member'),
      joinedAt: Date.now(),
      lastActive: Date.now(),
      updatedAt: Date.now(),
    };
    setMembers((prev) => [newMember, ...prev]);
    return newMember;
  };

  const addMemberFromUser = (user: User): DirectoryMember => {
    const existing = members.find((member) => member.userId === user.id);
    if (existing) {
      return existing;
    }
    return addMember({
      userId: user.id,
      name: user.name,
      email: user.email,
      country: user.country,
      program: user.program,
      feePaid: false,
      interests: [],
      verificationStatus: 'pending',
      membershipStatus: 'active',
      bio: user.bio,
    });
  };

  const updateMember = (memberId: string, updates: Partial<DirectoryMember>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, ...updates, updatedAt: Date.now(), lastActive: Date.now() } : m))
    );
  };

  const getMemberById = (memberId: string) => members.find((member) => member.id === memberId);
  const getMemberByUserId = (userId: string) => members.find((member) => member.userId === userId);
  const getAllMembers = () => members.filter((member) => member.membershipStatus === 'active');

  const value = useMemo(
    () => ({
      members,
      addMemberFromUser,
      addMember,
      updateMember,
      getMemberById,
      getMemberByUserId,
      getAllMembers,
    }),
    [members]
  );

  return <DirectoryContext.Provider value={value}>{children}</DirectoryContext.Provider>;
}
