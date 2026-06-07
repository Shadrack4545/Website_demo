/**
 * Topbar Component
 * Shows user info and logout button
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useContext';
import { useNotifications } from '../../hooks/useContext';
import { generateAvatarFromInitials } from '../../utils/image';
import LanguageSwitcher from '../shared/LanguageSwitcher.tsx';
import ThemeToggle from '../shared/ThemeToggle';

interface TopbarProps {
  onProfileClick?: () => void;
  onBackClick?: () => void;
  onHomeClick?: () => void;
  canGoBack?: boolean;
}

export default function Topbar({ onProfileClick, onBackClick, onHomeClick, canGoBack }: TopbarProps) {
  const { currentUser, logout } = useAuth();
  const { getUnreadCount, getUserNotifications, markAsRead } = useNotifications();
  const { t } = useTranslation();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = currentUser ? getUnreadCount(currentUser.id) : 0;
  const userNotifications = currentUser ? getUserNotifications(currentUser.id).slice(0, 6) : [];

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between relative z-10 sticky top-0 transition-colors">
      <div className="flex items-center gap-4">
        {canGoBack && (
          <button
            onClick={onBackClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors font-semibold shadow-sm"
            title={t('common.back')}
          >
            <span className="text-xl">←</span>
            {t('common.back')}
          </button>
        )}
        <button
          onClick={onHomeClick}
          className="flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-lg transition-colors font-semibold shadow-sm"
          title={t('common.home')}
        >
          {t('common.home')}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard.welcome')}!</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('app.subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle variant="compact" />

        {/* Language Switcher */}
        <div className="border-r border-gray-200 dark:border-gray-600 pr-4">
          <LanguageSwitcher />
        </div>

        {/* Notifications Badge */}
        <button
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          onClick={() => setShowNotifications((prev) => !prev)}
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        {showNotifications && (
          <div className="absolute right-0 top-full mt-2 z-30 w-80 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 p-3 shadow-xl">
            <p className="mb-2 text-sm font-semibold">Notifications</p>
            <div className="max-h-64 space-y-2 overflow-auto">
              {userNotifications.length === 0 && <p className="text-xs text-gray-500">No notifications yet.</p>}
              {userNotifications.map((notification) => (
                <button
                  key={notification.id}
                  className="w-full rounded-md border border-gray-100 dark:border-gray-700 p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => markAsRead(notification.id)}
                >
                  <p className="text-xs font-semibold">{notification.title}</p>
                  <p className="text-xs text-gray-600">{notification.message}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User Menu */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-600 hover:opacity-75 transition-opacity"
        >
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{currentUser?.name}</p>
            <p className="text-xs text-gray-600">
              {currentUser?.role ? t(`verification.role_${currentUser.role}`) : ''}
            </p>
          </div>
          <img
            src={currentUser?.avatar || generateAvatarFromInitials(currentUser?.name || 'User')}
            alt={currentUser?.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-primary-600"
          />
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="ml-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
        >
          {t('auth.logout')}
        </button>
      </div>
    </header>
  );
}