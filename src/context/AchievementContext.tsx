/**
 * AchievementContext - Global Achievement State Management
 * 
 * Manages:
 * - Community achievements (milestones, events)
 * - Individual member achievements
 * - Achievement creation/updates
 */

import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Achievement } from '../types';
import { getData, setData } from '../utils/storage';
import { createId } from '../utils/ids';

interface AchievementContextType {
  achievements: Achievement[];
  createAchievement: (achievement: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>) => Achievement;
  updateAchievement: (id: string, updates: Partial<Achievement>) => void;
  deleteAchievement: (id: string) => void;
  getCommunityAchievements: () => Achievement[];
  getIndividualAchievements: (recipientId?: string) => Achievement[];
  getRecentAchievements: (limit?: number) => Achievement[];
}

export const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

interface AchievementProviderProps {
  children: ReactNode;
}

export function AchievementProvider({ children }: AchievementProviderProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const stored = getData<Achievement[]>('ACHIEVEMENTS', []) ?? [];
    setAchievements(stored);
  }, []);

  useEffect(() => {
    setData('ACHIEVEMENTS', achievements);
  }, [achievements]);

  const createAchievement = (
    achievement: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>
  ): Achievement => {
    const newAchievement: Achievement = {
      ...achievement,
      id: createId('achievement'),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setAchievements((prev) => [newAchievement, ...prev]);
    return newAchievement;
  };

  const updateAchievement = (id: string, updates: Partial<Achievement>) => {
    setAchievements((prev) =>
      prev.map((ach) =>
        ach.id === id
          ? { ...ach, ...updates, updatedAt: Date.now() }
          : ach
      )
    );
  };

  const deleteAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((ach) => ach.id !== id));
  };

  const getCommunityAchievements = (): Achievement[] => {
    return achievements
      .filter((ach) => ach.communityAchievement || ach.type === 'community')
      .sort((a, b) => b.date - a.date);
  };

  const getIndividualAchievements = (recipientId?: string): Achievement[] => {
    return achievements
      .filter((ach) => {
        if (ach.type === 'community') return false;
        if (recipientId) return ach.recipientId === recipientId;
        return ach.recipientId !== undefined;
      })
      .sort((a, b) => b.date - a.date);
  };

  const getRecentAchievements = (limit: number = 10): Achievement[] => {
    return achievements
      .sort((a, b) => b.date - a.date)
      .slice(0, limit);
  };

  return (
    <AchievementContext.Provider
      value={{
        achievements,
        createAchievement,
        updateAchievement,
        deleteAchievement,
        getCommunityAchievements,
        getIndividualAchievements,
        getRecentAchievements,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
}
