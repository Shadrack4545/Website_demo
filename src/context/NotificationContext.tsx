/**
 * NotificationContext - Global Notification State
 * 
 * Manages in-app notifications and alerts
 */

import { createContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import type { Notification } from '../types';
import { getData, setData, STORAGE_KEYS } from '../utils/storage';
import { createId } from '../utils/ids';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Notification;
  broadcastNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'recipientId' | 'recipientScope'>
  ) => Notification;
  markAsRead: (notificationId: string) => void;
  deleteNotification: (notificationId: string) => void;
  getUserNotifications: (userId: string) => Notification[];
  getUnreadCount: (userId: string) => number;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const storedNotifications = getData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []) ?? [];
    setNotifications(storedNotifications);
  }, []);

  useEffect(() => {
    setData(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: createId('notif'),
      createdAt: Date.now(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
    return newNotification;
  };

  const broadcastNotification = (
    notification: Omit<Notification, 'id' | 'createdAt' | 'recipientId' | 'recipientScope'>
  ) => {
    return addNotification({
      ...notification,
      recipientId: 'all',
      recipientScope: 'all',
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const getUserNotifications = (userId: string): Notification[] => {
    return notifications.filter((n) => n.recipientId === userId || n.recipientScope === 'all');
  };

  const getUnreadCount = (userId: string): number => {
    return getUserNotifications(userId).filter((n) => !n.read).length;
  };

  const value = useMemo(
    () => ({
      notifications,
      addNotification,
      broadcastNotification,
      markAsRead,
      deleteNotification,
      getUserNotifications,
      getUnreadCount,
    }),
    [notifications]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
